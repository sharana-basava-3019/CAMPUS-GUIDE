const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
    enum: ['Library', 'Lab', 'Classroom'],
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['approved', 'rejected', 'pending'],
    default: 'approved',
  },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
