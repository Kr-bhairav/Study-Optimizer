const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  revisionDates: [Date],
  nextRevision: Date,
  completed: {
    type: Boolean,
    default: false
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('StudySession', studySessionSchema);