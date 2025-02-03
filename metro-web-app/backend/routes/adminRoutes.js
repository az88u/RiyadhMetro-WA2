// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/admin');
const auth = require('../middleware/auth');
const { getAllTickets, getAllUsers } = require('../controllers/adminController');

router.get('/tickets', auth, adminAuth, getAllTickets);
router.get('/users', auth, adminAuth, getAllUsers);

module.exports = router;