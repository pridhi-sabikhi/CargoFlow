const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Driver  = require('../models/Driver');
const { protect } = require('../middleware/auth');

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMMON_EMAIL_TYPOS = new Set(['gamil.com', 'gmial.com', 'yaho.com', 'yaahoo.com', 'outlok.com', 'hotnail.com']);
const EMAIL_DOMAIN_REGEX = /^(?=.{4,255}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

const isValidEmailForAuth = (email) => {
  if (!EMAIL_REGEX.test(email)) return false;
  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (!domain || COMMON_EMAIL_TYPOS.has(domain)) return false;
  return EMAIL_DOMAIN_REGEX.test(domain);
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!isValidEmailForAuth(normalizedEmail)) {
      return res.status(400).json({ message: 'Enter a valid email address (e.g., gmail.com, yahoo.com).' });
    }

    if (await User.findOne({ email: normalizedEmail }))
      return res.status(400).json({ message: 'Email already registered' });

    const normalizedRole = role === 'customer' ? 'user' : role;
    const user = await User.create({ name, email: normalizedEmail, password, role: normalizedRole || 'user', phone });

    // If registering as driver, create a Driver profile too
    if (user.role === 'driver') {
      await Driver.create({ user: user._id });
    }

    res.status(201).json({ token: signToken(user._id), user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!isValidEmailForAuth(normalizedEmail)) {
      return res.status(400).json({ message: 'Enter a valid email address (e.g., gmail.com, yahoo.com).' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    // Attach driver profile if role is driver
    let driverProfile = null;
    if (user.role === 'driver') {
      driverProfile = await Driver.findOne({ user: user._id });
    }

    res.json({ token: signToken(user._id), user, driverProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  let driverProfile = null;
  if (req.user.role === 'driver') {
    driverProfile = await Driver.findOne({ user: req.user._id });
  }
  res.json({ user: req.user, driverProfile });
});

module.exports = router;
