const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/students
// @desc    Get all students
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('roomId')
      .populate('currentAllocation')
      .sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('roomId')
      .populate('currentAllocation');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Private/Admin
router.post('/', [protect, admin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('contact').notEmpty().withMessage('Contact is required'),
  body('email').isEmail().withMessage('Valid email is required')
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, studentId, course, contact, email } = req.body;

    // Check if student exists
    const studentExists = await Student.findOne({ $or: [{ studentId }, { email }] });
    if (studentExists) {
      return res.status(400).json({ message: 'Student ID or email already exists' });
    }

    const student = await Student.create({
      name,
      studentId,
      course,
      contact,
      email
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('student_created', student);

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private/Admin
router.put('/:id', [protect, admin], async (req, res) => {
  try {
    const { name, studentId, course, contact, email } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if new studentId or email already exists
    if (studentId && studentId !== student.studentId) {
      const exists = await Student.findOne({ studentId });
      if (exists) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
    }

    if (email && email !== student.email) {
      const exists = await Student.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    student.name = name || student.name;
    student.studentId = studentId || student.studentId;
    student.course = course || student.course;
    student.contact = contact || student.contact;
    student.email = email || student.email;

    await student.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('student_updated', student);

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private/Admin
router.delete('/:id', [protect, admin], async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.currentAllocation) {
      return res.status(400).json({ message: 'Cannot delete student with active allocation' });
    }

    await student.deleteOne();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('student_deleted', { id: req.params.id });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
