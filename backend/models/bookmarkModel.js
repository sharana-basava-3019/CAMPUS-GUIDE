const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
  },
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
  },
  fileUrl: {
    type: String,
    default: '#',
  },
}, { timestamps: true });

bookmarkSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
