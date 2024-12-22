const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    showtimes: [
        {
            time: { type: String, required: true },
            date: { type: Date, required: true },
            seats: [
                [
                    { type: Boolean, default: false }
                ]
            ]
        }
    ],
    popularity: { type: Number, default: 0 },
});

movieSchema.index({ title: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
