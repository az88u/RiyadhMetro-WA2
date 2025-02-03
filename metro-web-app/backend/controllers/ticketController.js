// backend/controllers/ticketController.js

const Ticket = require('../models/ticket');

exports.purchaseTicket = async (req, res) => {
  try {
    const { ticketType } = req.body;
    const userId = req.user.id;

    let expiryDate = new Date();
    switch (ticketType) {
      case '2hours':
        expiryDate.setHours(expiryDate.getHours() + 2);
        break;
      case '1day':
        expiryDate.setDate(expiryDate.getDate() + 1);
        break;
      case '1month':
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      default:
        return res.status(400).json({ message: 'Invalid ticket type' });
    }

    const ticket = new Ticket({
      user: userId,
      ticketType,
      expiryDate,
    });

    await ticket.save();
    res.status(201).json({ message: 'Ticket purchased successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await Ticket.find({ user: userId });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};