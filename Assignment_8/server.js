const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Allow cross-origin requests (useful when testing from Postman or a browser)
app.use(cors());

// Connect to MongoDB using the URI from .env file
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studentDB', {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log('MongoDB connection error:', err.message);
    });

// Mount student routes at /students
app.use('/students', studentRoutes);

// Serve the sample preview at the same address as the API.
for (const file of ['index.html', 'style.css', 'script.js']) {
    app.get('/' + file, (req, res) => res.sendFile(path.join(__dirname, file)));
}
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log('Server running on port ' + PORT);
    console.log('Sample preview: http://127.0.0.1:' + PORT);
});
server.on('error', (err) => {
    console.error(err.code === 'EADDRINUSE'
        ? 'Port ' + PORT + ' is already in use. Stop the other server or set PORT in .env.'
        : 'Server could not start: ' + err.message);
    mongoose.disconnect();
    process.exitCode = 1;
});
