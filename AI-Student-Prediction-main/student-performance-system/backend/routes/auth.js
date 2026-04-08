const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const router = express.Router();

const createToken = (user) => (
  jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'studentai_secret', { expiresIn: '7d' })
);

const isElevatedRoleRegistrationAllowed = () => process.env.ALLOW_ADMIN_REGISTRATION === 'true';
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const requestedRole = role === 'admin' && isElevatedRoleRegistrationAllowed() ? 'admin' : 'user';
    const user = new User({ email, password, name, role: requestedRole });
    await user.save();

    const token = createToken(user);
    res.status(201).json({
      token,
      user: user.toSafeObject(),
      message: requestedRole === 'admin'
        ? 'Admin account created successfully.'
        : 'Account created successfully.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Registration failed.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = String(identifier || email || '').trim();

    if (!loginIdentifier || !password) {
      res.status(400).json({ error: 'Email/username and password are required.' });
      return;
    }

    const normalizedEmail = loginIdentifier.toLowerCase();
    const user = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { name: new RegExp(`^${escapeRegExp(loginIdentifier)}$`, 'i') },
      ],
    });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = createToken(user);
    res.json({
      token,
      user: user.toSafeObject(),
      message: 'Logged in successfully.',
    });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Login failed.' });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = router;

