// backend/models/Ticket.js

const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketType: {
    type: String,
    enum: ['2hours', '1day', '1month'],
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Ticket', ticketSchema);