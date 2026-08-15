const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    default: '#',
  },
  status: {
    type: String,
    default: 'Uploaded',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Upload', uploadSchema);
