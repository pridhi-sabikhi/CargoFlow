/**
 * seed.js — Run once to populate MongoDB with sample data
 * Usage:  node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Driver   = require('./models/Driver');
const Shipment = require('./models/Shipment');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  // Clear existing data
  await User.deleteMany();
  await Driver.deleteMany();
  await Shipment.deleteMany();
  console.log('Cleared existing data');

  // ── Create Users ────────────────────────────────────────────────────────────
  const users = await User.insertMany([
    // Admin
    { name: 'Admin User',    email: 'admin@cargoflow.com',    password: 'admin123',   role: 'admin',    phone: '+1-800-000-0001', avatar: 'AU' },
    // Managers
    { name: 'Sarah Manager', email: 'manager@cargoflow.com',  password: 'manager123', role: 'manager',  phone: '+1-800-000-0002', avatar: 'SM' },
    // Drivers
    { name: 'Michael Chen',  email: 'driver1@cargoflow.com',  password: 'driver123',  role: 'driver',   phone: '+1-415-555-1001', avatar: 'MC' },
    { name: 'Elena Rossi',   email: 'driver2@cargoflow.com',  password: 'driver123',  role: 'driver',   phone: '+1-415-555-1002', avatar: 'ER' },
    { name: 'James Wilson',  email: 'driver3@cargoflow.com',  password: 'driver123',  role: 'driver',   phone: '+1-415-555-1003', avatar: 'JW' },
    // Customers
    { name: 'John Smith',    email: 'customer1@example.com',  password: 'cust123',    role: 'customer', phone: '+1-415-555-2001', avatar: 'JS' },
    { name: 'Priya Sharma',  email: 'customer2@example.com',  password: 'cust123',    role: 'customer', phone: '+1-415-555-2002', avatar: 'PS' },
    { name: 'Tech Corp',     email: 'customer3@example.com',  password: 'cust123',    role: 'customer', phone: '+1-415-555-2003', avatar: 'TC' },
  ]);

  const [admin, manager, drv1, drv2, drv3, cust1, cust2, cust3] = users;
  console.log(`Created ${users.length} users`);

  // ── Create Driver Profiles ──────────────────────────────────────────────────
  const drivers = await Driver.insertMany([
    {
      user: drv1._id, driverId: 'DRV-3842', vehicle: 'Truck T-842',
      shift: 'Morning (6AM - 2PM)', status: 'on-duty',
      rating: 4.92, totalTrips: 1248, totalPoints: 8340,
      currentLevel: 'Senior Driver',
      location: { lat: 37.7523, lng: -122.4342, accuracy: 10, updatedAt: new Date() },
    },
    {
      user: drv2._id, driverId: 'DRV-1021', vehicle: 'Van V-215',
      shift: 'Afternoon (2PM - 10PM)', status: 'on-duty',
      rating: 4.85, totalTrips: 876, totalPoints: 4380,
      currentLevel: 'Driver',
      location: { lat: 37.7749, lng: -122.4194, accuracy: 15, updatedAt: new Date() },
    },
    {
      user: drv3._id, driverId: 'DRV-0567', vehicle: 'Truck T-215',
      shift: 'Night (10PM - 6AM)', status: 'off-duty',
      rating: 4.78, totalTrips: 542, totalPoints: 2710,
      currentLevel: 'Junior Driver',
    },
  ]);
  console.log(`Created ${drivers.length} driver profiles`);

  // ── Create Shipments ────────────────────────────────────────────────────────
  const shipments = await Shipment.insertMany([
    {
      shipmentId: 'SH-482',
      createdBy: admin._id, manager: manager._id,
      driver: drivers[0]._id, customer: cust1._id,
      status: 'in-transit', priority: 'high', type: 'express',
      origin: 'Warehouse A, San Francisco', destination: '2845 Mission Street, SF',
      deliveryLat: 37.7577, deliveryLng: -122.4376,
      eta: '10:45 AM', weight: '12kg',
      notes: 'Call upon arrival. Gate code 4782#.',
      stops: [
        { customer: 'Amaya Weller',    address: '123 Main St, Apt 4B', time: '9:30 AM',  type: 'delivery', status: 'completed', package: '#PKG-10254', lat: 37.7749, lng: -122.4194 },
        { customer: 'Sebastian Adams', address: '456 Oak Ave',          time: '10:15 AM', type: 'delivery', status: 'completed', package: '#PKG-10255', lat: 37.7694, lng: -122.4862 },
        { customer: 'Suzanne Bright',  address: '789 Pine Rd',          time: '11:00 AM', type: 'delivery', status: 'in-transit',package: '#PKG-10256', lat: 37.7577, lng: -122.4376 },
        { customer: 'Peter Howl',      address: '321 Elm St',           time: '11:45 AM', type: 'pickup',   status: 'pending',   package: '#PKG-10257', lat: 37.7523, lng: -122.4342 },
        { customer: 'Anta Singh',      address: '654 Cedar Ln',         time: '12:30 PM', type: 'delivery', status: 'pending',   package: '#PKG-10258', lat: 37.7449, lng: -122.4180 },
      ],
    },
    {
      shipmentId: 'SH-921',
      createdBy: admin._id, manager: manager._id,
      driver: drivers[1]._id, customer: cust2._id,
      status: 'delivered', priority: 'medium', type: 'standard',
      origin: 'Warehouse B, Oakland', destination: '1560 Haight Street, SF',
      deliveryLat: 37.7697, deliveryLng: -122.4485,
      eta: 'Delivered at 09:20 AM', weight: '8kg',
      notes: 'Left with receptionist. Signature on file.',
    },
    {
      shipmentId: 'DEMO-1',
      createdBy: admin._id, manager: manager._id,
      driver: drivers[0]._id, customer: cust3._id,
      status: 'pending', priority: 'low', type: 'standard',
      origin: 'Warehouse A, San Francisco', destination: '795 Folsom Street, SF',
      deliveryLat: 37.7825, deliveryLng: -122.4010,
      eta: '11:30 AM', weight: '5kg',
      notes: 'Loading dock at rear. Need to sign at reception first.',
    },
    {
      shipmentId: 'SH-544',
      createdBy: manager._id, manager: manager._id,
      status: 'pending', priority: 'medium', type: 'standard',
      origin: 'Delhi', destination: 'Mumbai',
      eta: '2026-03-18', weight: '67kg',
    },
    {
      shipmentId: 'SH-238',
      createdBy: manager._id, manager: manager._id,
      driver: drivers[2]._id,
      status: 'in-transit', priority: 'high', type: 'express',
      origin: 'Bangalore', destination: 'Chennai',
      eta: '2026-02-24', weight: '32kg',
    },
  ]);
  console.log(`Created ${shipments.length} shipments`);

  console.log('\n✅  Seed complete! Login credentials:');
  console.log('   Admin:    admin@cargoflow.com    / admin123');
  console.log('   Manager:  manager@cargoflow.com  / manager123');
  console.log('   Driver 1: driver1@cargoflow.com  / driver123  (Michael Chen)');
  console.log('   Driver 2: driver2@cargoflow.com  / driver123  (Elena Rossi)');
  console.log('   Customer: customer1@example.com  / cust123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
