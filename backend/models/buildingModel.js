const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  id: {
    type: String,
    required: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: [Number],
    required: true,
    validate: {
      validator: (value) => Array.isArray(value) && value.length === 3,
      message: 'position must have [x, y, z]',
    },
  },
  buildingType: {
    type: String,
    default: 'block',
  },
  buildingProps: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('Building', buildingSchema);
