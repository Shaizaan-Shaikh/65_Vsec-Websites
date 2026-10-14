const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Allow cross-origin requests (useful when testing from Postman or a browser)
app.use(cors());

// Connect to MongoDB using the URI from .env file
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log('MongoDB connection error:', err.message);
    });

// Mount student routes at /students
app.use('/students', studentRoutes);

// Root route just to confirm server is running
app.get('/', (req, res) => {
    res.json({ message: 'Student API is running. Use /students endpoint.' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
