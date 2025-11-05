const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance'],
    default: 'Available'
  },
  floor: {
    type: Number
  },
  amenities: [{
    type: String
  }]
}, {
  timestamps: true
});

// Auto-update status based on occupancy
roomSchema.pre('save', function(next) {
  if (this.currentOccupancy >= this.capacity) {
    this.status = 'Occupied';
  } else if (this.currentOccupancy === 0 && this.status !== 'Maintenance') {
    this.status = 'Available';
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
