const express = require('express');
const User    = require('../models/User');
const Driver  = require('../models/Driver');
const { protect, allow } = require('../middleware/auth');

const router = express.Router();

// All routes require login
router.use(protect);

// ── GET /api/users  (admin only — list all users) ─────────────────────────────
router.get('/', allow('admin'), async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/users/drivers  (admin + manager) ─────────────────────────────────
router.get('/drivers', allow('admin', 'manager'), async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate('user', 'name email phone avatar')
      .sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/users/:id ────────────────────────────────────────────────────────
router.get('/:id', allow('admin', 'manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/users/:id  (admin or self) ───────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const isSelf  = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';
    if (!isSelf && !isAdmin)
      return res.status(403).json({ message: 'Not allowed' });

    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── DELETE /api/users/:id  (admin only) ───────────────────────────────────────
router.delete('/:id', allow('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
