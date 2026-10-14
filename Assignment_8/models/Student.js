const mongoose = require('mongoose');

// Simple schema with the four required fields
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    marks: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Student', studentSchema);
