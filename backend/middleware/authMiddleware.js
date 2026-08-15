const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const normalizeRole = (role) => {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'faculty') return 'professor';
  return normalized;
};

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = {
      ...user.toObject(),
      role: normalizeRole(user.role),
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

const allowRoles = (...roles) => {
  const allowedRoles = roles.map((role) => normalizeRole(role));
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(normalizeRole(req.user.role))) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
  };
};

module.exports = { protect, allowRoles };
