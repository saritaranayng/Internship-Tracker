const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
 studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // ⬅️ This is the key point
    required: true
  },
  week: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Pending' // or Approved/Rejected
  },
  file: {
    type: String, // path to uploaded file
    required: false
  },
  feedback: {
    type: String,
    default: '' // stores faculty feedback on approve/reject
  }

});

const Log = mongoose.model('Log', logSchema);

module.exports = { Log, logSchema };