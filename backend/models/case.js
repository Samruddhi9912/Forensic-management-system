const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({

  caseId: {
    type: String,
    required: true
  },

  evidenceType: {
    type: String,
    required: true
  },

  policeDescription: {
    type: String,
    required: true
  },

  evidenceIdentification: {
    type: String,
    default: ""
  },

  labReport: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["ongoing", "completed"],
    default: "ongoing"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

},
{
  timestamps: true
});

module.exports =
  mongoose.model("Case", caseSchema);