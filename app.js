const express = require('express');
const mongoose = require('mongoose');
const movieRoutes = require('./routes/movieRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors'); 
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/movies', movieRoutes);
app.use('/bookings', bookingRoutes);
app.use('/users', userRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

module.exports = app;
