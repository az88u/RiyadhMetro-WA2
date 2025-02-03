const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config({ path: './config/config.env' });

const app = express();


connectDB();


app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());


app.get('/test', (req, res) => {
    res.json({ message: 'Backend is working' });
});


app.use('/api/users', require('./routes/userRoutes'));


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('CORS enabled for:', ['http://127.0.0.1:5500', 'http://localhost:5500']);
});