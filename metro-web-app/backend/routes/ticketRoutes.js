// backend/routes/ticketRoutes.js

const express = require('express');
const router = express.Router();
const { purchaseTicket, getTickets } = require('../controllers/ticketController');
const auth = require('../middleware/auth');

router.post('/purchase', auth, purchaseTicket);
router.get('/', auth, getTickets);

module.exports = router;