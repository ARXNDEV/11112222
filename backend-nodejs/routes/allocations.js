const express = require('express');
const { body, validationResult } = require('express-validator');
const Allocation = require('../models/Allocation');
const Student = require('../models/Student');
const Room = require('../models/Room');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/allocations
// @desc    Get all allocations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('studentId')
      .populate('roomId')
      .sort({ allocationDate: -1 });
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/allocations/:id
// @desc    Get allocation by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate('studentId')
      .populate('roomId');
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }
    res.json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/allocations
// @desc    Create new allocation
// @access  Private/Admin
router.post('/', [protect, admin, [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('roomId').notEmpty().withMessage('Room ID is required')
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { studentId, roomId, notes } = req.body;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student already has active allocation
    if (student.currentAllocation) {
      return res.status(400).json({ message: 'Student already has an active allocation' });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check room availability
    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({ message: 'Room is at full capacity' });
    }

    // Create allocation
    const allocation = await Allocation.create({
      studentId,
      roomId,
      notes
    });

    // Update room occupancy
    room.currentOccupancy += 1;
    await room.save();

    // Update student
    student.roomId = roomId;
    student.currentAllocation = allocation._id;
    await student.save();

    const populatedAllocation = await Allocation.findById(allocation._id)
      .populate('studentId')
      .populate('roomId');

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('allocation_created', {
      allocation: populatedAllocation,
      room,
      student
    });

    res.status(201).json(populatedAllocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/allocations/:id/deallocate
// @desc    Deallocate student from room
// @access  Private/Admin
router.post('/:id/deallocate', [protect, admin], async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate('studentId')
      .populate('roomId');

    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    if (allocation.status === 'Completed') {
      return res.status(400).json({ message: 'Allocation already completed' });
    }

    // Update allocation
    allocation.deallocationDate = new Date();
    allocation.status = 'Completed';
    await allocation.save();

    // Update room occupancy
    const room = await Room.findById(allocation.roomId);
    if (room && room.currentOccupancy > 0) {
      room.currentOccupancy -= 1;
      await room.save();
    }

    // Update student
    const student = await Student.findById(allocation.studentId);
    if (student) {
      student.roomId = null;
      student.currentAllocation = null;
      await student.save();
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('allocation_completed', {
      allocation,
      room,
      student
    });

    res.json(allocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/allocations/:id
// @desc    Delete allocation (if not yet active)
// @access  Private/Admin
router.delete('/:id', [protect, admin], async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    // Only allow deletion of completed allocations
    if (allocation.status === 'Active') {
      return res.status(400).json({ message: 'Cannot delete active allocation. Deallocate first.' });
    }

    await allocation.deleteOne();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('allocation_deleted', { id: req.params.id });

    res.json({ message: 'Allocation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
