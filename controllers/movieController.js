const Movie = require('../models/Movie');

exports.getMovies = async (req, res) => {
    const movies = await Movie.find().sort({ popularity: -1 });
    res.json(movies);
};

exports.addMovie = async (req, res) => {
    const { title, showtimes, rows, cols } = req.body;
    const seats = Array(rows).fill().map(() => Array(cols).fill(false));
    const movie = new Movie({ title, showtimes, seats });
    await movie.save();
    res.json(movie);
};


exports.getSeatMap = async (req, res) => {
  const { movieId, showtimeIndex } = req.query;

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    const showtime = movie.showtimes[showtimeIndex];
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Showtime not found." });
    }

    let seatMapHtml = '<html><body><h1>Seat Map</h1><table border="1" style="border-collapse: collapse;">';

    showtime.seats.forEach((row, rowIndex) => {
      seatMapHtml += "<tr>";
      row.forEach((seat, colIndex) => {
        const seatStatus = seat ? 'style="background-color: red;"' : 'style="background-color: green;"'; 
        seatMapHtml += `<td ${seatStatus}>&#x25A0; Row ${rowIndex + 1} Col ${colIndex + 1}</td>`;
      });
      seatMapHtml += "</tr>";
    });

    seatMapHtml += '</table></body></html>';

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(seatMapHtml);

  } catch (error) {
    console.error("Error fetching seat map:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.searchMovies = async (req, res) => {
  const { searchText } = req.query;  // Text input from the search bar
  
  try {
    const movies = await Movie.find({
      $text: { $search: searchText }  // Search movies based on the input text
    });

    if (movies.length > 0) {
      return res.status(200).json({
        success: true,
        movies: movies
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No movies found matching the search text."
      });
    }
  } catch (error) {
    console.error("Error searching for movies:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



