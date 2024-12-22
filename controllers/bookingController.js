const Booking = require("../models/Booking");
const Movie = require("../models/Movie");
const queue = require("../utils/queue")
const tree = require("../utils/tree")
exports.bookTicket = async (req, res) => {
  const { movieId, showtimeIndex, row, col } = req.body;

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    const showtime = movie.showtimes[showtimeIndex];
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Showtime not found." });
    }
    if (row < 0 || row >= showtime.seats.length || col < 0 || col >= showtime.seats[row].length) {
      return res.status(400).json({ success: false, message: "Invalid seat position." });
    }
    if (showtime.seats[row][col]) {
      return res.status(400).json({ success: false, message: "This seat is already booked." });
    }
    queue.enqueue({ movieId, showtimeIndex, row, col });
    return res.status(200).json({
      success: true,
      message: "Booking request queued successfully.",
    });
  } catch (error) {
    console.error("Error queuing booking request:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

  
  exports.processBookings = async (req, res) => {
    try {
      if (queue.isEmpty()) {
        return res.status(200).json({ success: false, message: "No booking requests in the queue." });
      }
  
      const bookingRequest = queue.dequeue();
      const { movieId, showtimeIndex, row, col } = bookingRequest;
  
      const movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({ success: false, message: "Movie not found." });
      }
  
      const showtime = movie.showtimes[showtimeIndex];
      if (!showtime) {
        return res.status(404).json({ success: false, message: "Showtime not found." });
      }
  
      if (showtime.seats[row][col]) {
        return res.status(400).json({ success: false, message: "This seat is already booked." });
      }
  
      showtime.seats[row][col] = true;
      await movie.save();
  
      const newBooking = new Booking({
        movieId: movie._id,
        showtimeIndex,
        seat: { row, col },
        bookingDate: new Date(),
      });
  
      await newBooking.save();
  
      return res.status(200).json({
        success: true,
        message: "Seat booked successfully from the queue!",
        updatedSeats: showtime.seats,
      });
    } catch (error) {
      console.error("Error processing booking:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  function findAdjacentSeatsBFS(seats, startRow, startCol, numSeatsRequired) {
    const cols = seats[0].length;
    const queue = [[startCol, [startCol]]];
    let results = null;
  
    if (seats[startRow][startCol]) {
        return results;
    }

    while (queue.length > 0) {
      const [currentCol, path] = queue.shift();
  
      if (path.length === numSeatsRequired) {
        results = path.map(col => [startRow, col]);
        return results
      }
  
      const nextColLeft = currentCol - 1;
      const nextColRight = currentCol + 1;
  
      if (nextColLeft >= 0 && !path.includes(nextColLeft) && !seats[startRow][nextColLeft]) {
        queue.push([nextColLeft, [...path, nextColLeft]]);
      }

      if (nextColRight < cols && !path.includes(nextColRight) && !seats[startRow][nextColRight]) {
        queue.push([nextColRight, [...path, nextColRight]]);
      }
    }
    return results; 
}


exports.getAdjacentSeats = async (req, res) => {
  const { movieId, showtimeIndex, row, col, numSeatsRequired } = req.body;

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    const showtime = movie.showtimes[showtimeIndex];
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Showtime not found." });
    }

    const seats = showtime.seats;

    const adjacentSeats = findAdjacentSeatsBFS(seats, row, col, numSeatsRequired); 

    if (adjacentSeats === null) {
      return res.status(404).json({
        success: false,
        message: "Not enough adjacent available seats.",
      });
    }

    let htmlResponse = `<html><head><style>
      .seat { width: 30px; height: 30px; margin: 2px; cursor: pointer; text-align: center; line-height: 30px; border: 1px solid #ccc; }
      .available { background-color: green; }
      .booked { background-color: red; }
      .adjacent { background-color: yellow; }
    </style></head><body>`;
    htmlResponse += `<h1>Seating Arrangement</h1><div>`;

    const adjacentSeatsSet = new Set();
    adjacentSeats.forEach(seat => {
        adjacentSeatsSet.add(seat.join(","));
    });

    for (let rowIndex = 0; rowIndex < seats.length; rowIndex++) {
      htmlResponse += `<div style="margin-bottom: 10px;">`;
      for (let colIndex = 0; colIndex < seats[rowIndex].length; colIndex++) {
        let seatClass = 'seat';

        if (seats[rowIndex][colIndex]) {
          seatClass += ' booked';
        } else {
          const seatKey = `${rowIndex},${colIndex}`;
          if (adjacentSeatsSet.has(seatKey)) {
            seatClass += ' adjacent'; // Highlight the adjacent seats
          } else {
            seatClass += ' available'; // Otherwise, mark as available
          }
        }

        htmlResponse += `<button class="${seatClass}" onclick="alert('Seat ${rowIndex}, ${colIndex} selected')">${seats[rowIndex][colIndex] ? 'X' : ''}</button>`;
      }
      htmlResponse += `</div>`;
    }

    htmlResponse += `</div></body></html>`;
    return res.send(htmlResponse);
  } catch (error) {
    console.error("Error finding adjacent seats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
