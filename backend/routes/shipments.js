const express  = require('express');
const Shipment = require('../models/Shipment');
const Driver   = require('../models/Driver');
const { protect, allow } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ── GET /api/shipments ────────────────────────────────────────────────────────
// Admin/Manager: all shipments | Driver: only their own | Customer: only theirs
router.get('/', async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'driver') {
      const driverProfile = await Driver.findOne({ user: req.user._id });
      if (driverProfile) filter.driver = driverProfile._id;
    } else if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    }

    const { status, search } = req.query;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { shipmentId: { $regex: search, $options: 'i' } },
        { origin:     { $regex: search, $options: 'i' } },
        { destination:{ $regex: search, $options: 'i' } },
      ];
    }

    const shipments = await Shipment.find(filter)
      .populate('driver', 'driverId vehicle')
      .populate('customer', 'name email phone')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });

    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/shipments/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      $or: [{ _id: req.params.id }, { shipmentId: req.params.id }]
    })
      .populate('driver')
      .populate('customer', 'name email phone')
      .populate('manager', 'name email');

    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/shipments  (admin + manager) ────────────────────────────────────
router.post('/', allow('admin', 'manager'), async (req, res) => {
  try {
    const shipment = await Shipment.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(shipment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PUT /api/shipments/:id  (admin + manager + assigned driver) ───────────────
router.put('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      $or: [{ _id: req.params.id }, { shipmentId: req.params.id }]
    });
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });

    // Drivers can only update status and stop statuses
    if (req.user.role === 'driver') {
      const { status, stops, driverLocation } = req.body;
      if (status)         shipment.status = status;
      if (stops)          shipment.stops  = stops;
      if (driverLocation) shipment.driverLocation = { ...driverLocation, updatedAt: new Date() };
    } else {
      Object.assign(shipment, req.body);
    }

    await shipment.save();
    res.json(shipment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PATCH /api/shipments/:id/location  (driver only — GPS update) ─────────────
router.patch('/:id/location', async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.body;
    const shipment = await Shipment.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { shipmentId: req.params.id }] },
      { driverLocation: { lat, lng, accuracy, updatedAt: new Date() } },
      { new: true }
    );
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
    res.json({ ok: true, driverLocation: shipment.driverLocation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── DELETE /api/shipments/:id  (admin only) ───────────────────────────────────
router.delete('/:id', allow('admin'), async (req, res) => {
  try {
    await Shipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Shipment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
