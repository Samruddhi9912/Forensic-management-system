const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true, required: true },

  evidenceType: String,
  evidenceIdentification: String,
  description: String,

  status: {
    type: String,
    enum: ['ongoing', 'completed'],
    default: 'ongoing'
  },

  labUpdated: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);