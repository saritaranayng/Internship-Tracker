const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    week: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    hoursWorked: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Completed', 'In Progress', 'Blocked'],
        required: true
    },
    file: {
        type: String,
        default: ''
    },
    gitLink: {
        type: String,
        default: ''
    },
    prLink: {
        type: String,
        default: ''
    },
    demoLink: {
        type: String,
        default: ''
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

const DailyTask = mongoose.model('DailyTask', dailyTaskSchema);
module.exports = { DailyTask };
