const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    lines: [{
        type: String,
        required: true
    }],
    connections: [{
        station: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Station'
        },
        distance: Number,
        travelTime: Number
    }]
});

module.exports = mongoose.model('Station', stationSchema);