const express = require('express');
const Driver  = require('../models/Driver');
const { protect, allow } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ── GET /api/drivers  (admin + manager) ───────────────────────────────────────
router.get('/', allow('admin', 'manager'), async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate('user', 'name email phone avatar active')
      .sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/drivers/me  (driver — own profile) ───────────────────────────────
router.get('/me', allow('driver'), async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id })
      .populate('user', 'name email phone avatar');
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/drivers/me/location  (driver — update GPS) ────────────────────
router.patch('/me/location', allow('driver'), async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { user: req.user._id },
      { location: { lat, lng, accuracy, updatedAt: new Date() } },
      { new: true }
    );
    res.json({ ok: true, location: driver.location });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PATCH /api/drivers/me/status  (driver — on-duty / off-duty / on-break) ───
router.patch('/me/status', allow('driver'), async (req, res) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { user: req.user._id },
      { status: req.body.status },
      { new: true }
    );
    res.json(driver);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── GET /api/drivers/:id  (admin + manager) ───────────────────────────────────
router.get('/:id', allow('admin', 'manager'), async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('user', 'name email phone avatar');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/drivers/:id  (admin + manager) ───────────────────────────────────
router.put('/:id', allow('admin', 'manager'), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(driver);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
