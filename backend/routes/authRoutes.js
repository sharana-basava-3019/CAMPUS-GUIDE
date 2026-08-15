const express = require('express');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const ALLOWED_ROLES = ['student', 'professor'];
const ALLOWED_LOGIN_ROLES = ['student', 'professor', 'admin'];
const normalizeRole = (role) => {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'faculty') return 'professor';
  return normalized;
};

const generateToken = (user) => {
  const role = normalizeRole(user.role);
  return jwt.sign({ userId: user._id, email: user.email, role, name: user.name || '' }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const normalizedRole = ALLOWED_ROLES.includes(role) ? role : 'student';
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name: name || '', email, password, role: normalizedRole });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, role, adminSecretKey } = req.body;
  try {
    if (role && !ALLOWED_LOGIN_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findOne({ email });

    if (user?.isBlocked) {
      return res.status(403).json({ message: 'User is blocked' });
    }

    if (user && (await user.comparePassword(password))) {
      const userRole = normalizeRole(user.role);

      if (role && role !== userRole) {
        return res.status(401).json({ message: 'Role mismatch' });
      }

      if (userRole === 'admin') {
        if (!adminSecretKey) {
          return res.status(400).json({ message: 'Admin secret key required' });
        }
        if (!process.env.ADMIN_SECRET_KEY || adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
          return res.status(401).json({ message: 'Invalid admin secret key' });
        }
      }

      const userPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
      };

      const token = generateToken(user);

      res.json({
        token,
        user: userPayload,
        ...userPayload,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (typeof name === 'string') {
      user.name = name;
    }

    const updated = await user.save();

    return res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: normalizeRole(updated.role),
      token: generateToken(updated),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put('/user/update-email', protect, async (req, res) => {
  const { newEmail, password } = req.body;

  if (!newEmail || !password) {
    return res.status(400).json({ message: 'New email and password are required' });
  }

  const normalizedEmail = String(newEmail).trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    if (user.email === normalizedEmail) {
      return res.status(400).json({ message: 'New email must be different from current email' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing && String(existing._id) !== String(user._id)) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    user.email = normalizedEmail;
    await user.save();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      token: generateToken(user),
      message: 'Email updated successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
