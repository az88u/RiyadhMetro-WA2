// backend/controllers/adminController.js

const Ticket = require('../models/ticket');
const User = require('../models/user');

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('user', 'username email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};