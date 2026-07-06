const mongoose = require('mongoose');

const weeklySummarySchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    week: {
        type: Number,
        required: true
    },
    workCompleted: {
        type: String,
        required: true
    },
    challengesFaced: {
        type: String,
        required: true
    },
    challengesSolved: {
        type: String,
        required: true
    },
    skillsLearned: {
        type: String,
        required: true
    },
    goalsNextWeek: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Changes Requested'],
        default: 'Pending'
    },
    feedback: {
        type: String,
        default: ''
    },
    allowTaskEdits: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

weeklySummarySchema.index({ studentId: 1, week: 1 }, { unique: true });

const WeeklySummary = mongoose.model('WeeklySummary', weeklySummarySchema);
module.exports = { WeeklySummary };
