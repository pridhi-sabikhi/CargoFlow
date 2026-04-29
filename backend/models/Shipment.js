const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  customer:  { type: String, required: true },
  address:   { type: String, required: true },
  phone:     { type: String, default: '' },
  time:      { type: String, default: '' },
  type:      { type: String, enum: ['delivery', 'pickup', 'return'], default: 'delivery' },
  status:    { type: String, enum: ['pending', 'in-transit', 'completed', 'failed'], default: 'pending' },
  package:   { type: String, default: '' },
  lat:       { type: Number },
  lng:       { type: Number },
  notes:     { type: String, default: '' },
  completedAt: { type: Date },
}, { _id: true });

const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, unique: true },   // e.g. SH-482

  // Who created it and who manages it
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  manager:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver:     { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-transit', 'delivered', 'failed', 'cancelled'],
    default: 'pending',
  },

  priority:   { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  type:       { type: String, enum: ['standard', 'express', 'air', 'sea'], default: 'standard' },

  origin:      { type: String, required: true },
  destination: { type: String, required: true },

  // For multi-stop routes
  stops: [stopSchema],

  // Single delivery coords (for simple shipments)
  deliveryLat: { type: Number },
  deliveryLng: { type: Number },

  weight:  { type: String, default: '' },
  eta:     { type: String, default: '' },
  notes:   { type: String, default: '' },

  // Live driver location snapshot
  driverLocation: {
    lat:       { type: Number },
    lng:       { type: Number },
    accuracy:  { type: Number },
    updatedAt: { type: Date },
  },
}, { timestamps: true });

// Auto-generate shipmentId
shipmentSchema.pre('save', async function (next) {
  if (!this.shipmentId) {
    const count = await mongoose.model('Shipment').countDocuments();
    this.shipmentId = `SH-${String(count + 100).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
