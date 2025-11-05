const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get room by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private/Admin
router.post('/', [protect, admin, [
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { roomNumber, capacity, floor, amenities } = req.body;

    // Check if room exists
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = await Room.create({
      roomNumber,
      capacity,
      floor,
      amenities: amenities || []
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('room_created', room);

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private/Admin
router.put('/:id', [protect, admin], async (req, res) => {
  try {
    const { roomNumber, capacity, status, floor, amenities } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if new room number already exists
    if (roomNumber && roomNumber !== room.roomNumber) {
      const roomExists = await Room.findOne({ roomNumber });
      if (roomExists) {
        return res.status(400).json({ message: 'Room number already exists' });
      }
    }

    room.roomNumber = roomNumber || room.roomNumber;
    room.capacity = capacity || room.capacity;
    room.status = status || room.status;
    room.floor = floor !== undefined ? floor : room.floor;
    room.amenities = amenities || room.amenities;

    await room.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('room_updated', room);

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private/Admin
router.delete('/:id', [protect, admin], async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.currentOccupancy > 0) {
      return res.status(400).json({ message: 'Cannot delete room with occupants' });
    }

    await room.deleteOne();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('room_deleted', { id: req.params.id });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/rooms/stats/summary
// @desc    Get room statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });
    
    const rooms = await Room.find();
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const totalOccupied = rooms.reduce((sum, room) => sum + room.currentOccupancy, 0);

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      totalCapacity,
      totalOccupied,
      availableBeds: totalCapacity - totalOccupied
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
