const express = require('express');
const User = require('../models/userModel');
const Resource = require('../models/resourceModel');
const Building = require('../models/buildingModel');
const Upload = require('../models/uploadModel');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { createNotificationsForUsers, createNotificationForUser } = require('../services/notificationService');

const router = express.Router();

const normalizeRole = (role) => {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'faculty') return 'professor';
  return normalized;
};

const ALLOWED_ROLES = ['student', 'professor', 'guest', 'admin'];
const ALLOWED_LOCATIONS = ['Library', 'Lab', 'Classroom'];
const ALLOWED_STATUS = ['approved', 'rejected', 'pending'];

router.use(protect, allowRoles('admin'));

router.get('/summary', async (req, res) => {
  try {
    const [totalUsers, totalResources, totalUploads, totalBuildings] = await Promise.all([
      User.countDocuments(),
      Resource.countDocuments(),
      Upload.countDocuments(),
      Building.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalResources,
      totalUploads,
      totalBuildings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role isBlocked').sort({ createdAt: -1 });
    res.json(users.map((u) => ({
      ...u.toObject(),
      role: normalizeRole(u.role),
      isBlocked: Boolean(u.isBlocked),
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password and role are required' });
  }

  if (!ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const created = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      role,
    });

    const payload = {
      _id: created._id,
      name: created.name,
      email: created.email,
      role: normalizeRole(created.role),
      isBlocked: Boolean(created.isBlocked),
    };

    return res.status(201).json(payload);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  const { name, email, role } = req.body;

  if (role && !ALLOWED_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.params.id);
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

    if (role) {
      user.role = role;
    }

    await user.save();

    const updated = await User.findById(user._id, 'name email role isBlocked');

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      ...updated.toObject(),
      role: normalizeRole(updated.role),
      isBlocked: Boolean(updated.isBlocked),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/users/:id/block', async (req, res) => {
  const { isBlocked } = req.body;

  console.log('[ADMIN_BLOCK] request', {
    adminId: req.user?._id,
    targetUserId: req.params.id,
    body: req.body,
  });

  if (typeof isBlocked !== 'boolean') {
    return res.status(400).json({ message: 'isBlocked must be true or false' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('[ADMIN_BLOCK] before', {
      userId: user._id,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    });

    if (String(user._id) === String(req.user._id) && isBlocked) {
      return res.status(400).json({ message: 'Admin cannot block own account' });
    }

    user.isBlocked = isBlocked;
    await user.save();

    if (isBlocked) {
      await createNotificationForUser({
        userId: user._id,
        message: 'Your account has been blocked',
        type: 'warning',
      });
    }

    const updated = await User.findById(user._id, 'name email role isBlocked');
    const updatedPayload = {
      ...updated.toObject(),
      role: normalizeRole(updated.role),
      isBlocked: Boolean(updated.isBlocked),
    };

    console.log('[ADMIN_BLOCK] after', {
      userId: updatedPayload._id,
      email: updatedPayload.email,
      role: updatedPayload.role,
      isBlocked: updatedPayload.isBlocked,
    });

    res.json({
      success: true,
      message: 'User updated',
      user: updatedPayload,
    });
  } catch (error) {
    console.error('[ADMIN_BLOCK] error', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Admin cannot delete own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resources
router.get('/resources', async (req, res) => {
  try {
    const resources = await Resource.find({})
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/resources/:id', async (req, res) => {
  const { title, subject, location, status } = req.body;

  if (location && !ALLOWED_LOCATIONS.includes(location)) {
    return res.status(400).json({ message: 'Invalid location' });
  }
  if (status && !ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const existing = await Resource.findById(req.params.id).select('title status uploadedBy');
    if (!existing) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const updatePayload = {};
    if (title) updatePayload.title = title;
    if (subject) updatePayload.subject = subject;
    if (location) updatePayload.location = location;
    if (status) updatePayload.status = status;

    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true },
    ).populate('uploadedBy', 'name email');

    const resourceTitle = updated.title || existing.title || 'Untitled resource';
    const statusChanged = status && status !== existing.status;
    const contentUpdated = Boolean(title || subject || location);

    if (contentUpdated) {
      const studentUsers = await User.find({ role: 'student' }).select('_id');
      const studentIds = studentUsers.map((u) => u._id);

      if (studentIds.length > 0) {
        await createNotificationsForUsers({
          userIds: studentIds,
          message: `Resource updated – ${resourceTitle}`,
          type: 'resource',
        });
      }
    }

    if (statusChanged && updated.uploadedBy && (status === 'approved' || status === 'rejected')) {
      await createNotificationForUser({
        userId: updated.uploadedBy,
        message: `Your resource was ${status}`,
        type: status === 'rejected' ? 'warning' : 'info',
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/resources/:id', async (req, res) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Buildings
router.get('/buildings', async (req, res) => {
  try {
    const buildings = await Building.find({}).sort({ createdAt: -1 });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/buildings', async (req, res) => {
  const {
    key,
    id,
    label,
    type,
    position = [0, 0, 0],
    buildingType = 'block',
    buildingProps = { w: 2.4, h: 1, d: 2 },
  } = req.body;

  if (!key || !id || !label || !type) {
    return res.status(400).json({ message: 'key, id, label and type are required' });
  }

  try {
    const created = await Building.create({ key, id, label, type, position, buildingType, buildingProps });

    const allUsers = await User.find({}).select('_id');
    const userIds = allUsers.map((u) => u._id);
    if (userIds.length > 0) {
      await createNotificationsForUsers({
        userIds,
        message: `New building added – ${created.label}`,
        type: 'building',
      });
    }

    res.status(201).json(created);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Building key already exists' });
    }
    return res.status(500).json({ message: error.message });
  }
});

router.put('/buildings/:id', async (req, res) => {
  const { label, type, position, buildingType, buildingProps } = req.body;

  try {
    const payload = {};
    if (label) payload.label = label;
    if (type) payload.type = type;
    if (position) payload.position = position;
    if (buildingType) payload.buildingType = buildingType;
    if (buildingProps) payload.buildingProps = buildingProps;

    const updated = await Building.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/buildings/:id', async (req, res) => {
  try {
    const deleted = await Building.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.json({ message: 'Building deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
