const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  // Link to the User account
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  driverId:  { type: String, unique: true },   // e.g. DRV-3842
  vehicle:   { type: String, default: '' },    // e.g. Truck T-842
  shift:     { type: String, default: '' },    // e.g. Morning (6AM - 2PM)
  status:    { type: String, enum: ['on-duty', 'off-duty', 'on-break'], default: 'off-duty' },

  // Live GPS location (updated by DriverShipment page)
  location: {
    lat:       { type: Number, default: null },
    lng:       { type: Number, default: null },
    accuracy:  { type: Number, default: null },
    updatedAt: { type: Date,   default: null },
  },

  // Stats
  rating:       { type: Number, default: 5.0 },
  totalTrips:   { type: Number, default: 0 },
  totalPoints:  { type: Number, default: 0 },   // delivery points system

  // Experience
  joinDate:     { type: Date, default: Date.now },
  currentLevel: { type: String, default: 'Junior Driver' },
}, { timestamps: true });

// Auto-generate driverId before first save
driverSchema.pre('save', async function (next) {
  if (!this.driverId) {
    const count = await mongoose.model('Driver').countDocuments();
    this.driverId = `DRV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Driver', driverSchema);
