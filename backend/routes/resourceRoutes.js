const express = require('express');
const multer = require('multer');
const Resource = require('../models/resourceModel');
const Building = require('../models/buildingModel');
const Download = require('../models/downloadModel');
const Bookmark = require('../models/bookmarkModel');
const Upload = require('../models/uploadModel');
const User = require('../models/userModel');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { createNotificationsForUsers, createNotificationForUser } = require('../services/notificationService');

const router = express.Router();
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

router.get('/buildings', async (req, res) => {
  try {
    const buildings = await Building.find({}).sort({ createdAt: -1 });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/resources?search=&from=&to=
router.get('/', protect, allowRoles('student', 'professor'), async (req, res) => {
  const { search, from, to } = req.query;
  try {
    let query = {};

    // If 'to' is supplied (navigation query), search by destination label
    if (to) {
      query = { location: { $regex: to, $options: 'i' } };
    } else if (search) {
      query = {
        $or: [
          { title:    { $regex: search, $options: 'i' } },
          { subject:  { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const resources = await Resource.find(query);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/resources/download/:id
router.get('/download/:id', protect, allowRoles('student', 'professor'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await Download.create({
      user: req.user._id,
      resource: resource._id,
      resourceName: resource.title,
      fileUrl: resource.fileUrl,
      downloadedAt: new Date(),
    });

    res.json({
      message: 'Download authorized',
      fileUrl: resource.fileUrl,
      title: resource.title,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/downloads', protect, allowRoles('student', 'professor'), async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user._id })
      .sort({ downloadedAt: -1 })
      .limit(20);

    res.json(downloads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/bookmarks', protect, allowRoles('student', 'professor'), async (req, res) => {
  try {
    const existing = await Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    if (existing.length > 0) {
      return res.json(existing);
    }

    // Seed starter bookmarks for new users so the section is never empty.
    const starterResources = await Resource.find({}).limit(3);
    if (starterResources.length === 0) {
      return res.json([]);
    }

    const seedBookmarks = starterResources.map((resource) => ({
      user: req.user._id,
      resource: resource._id,
      title: resource.title,
      subject: resource.subject,
      location: resource.location,
      fileUrl: resource.fileUrl,
    }));

    const created = await Bookmark.insertMany(seedBookmarks, { ordered: false });
    return res.json(created);
  } catch (error) {
    if (error.code === 11000) {
      const bookmarks = await Bookmark.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);
      return res.json(bookmarks);
    }
    return res.status(500).json({ message: error.message });
  }
});

router.post('/bookmark', protect, allowRoles('student', 'professor'), async (req, res) => {
  const { resourceId } = req.body;

  if (!resourceId) {
    return res.status(400).json({ message: 'resourceId is required' });
  }

  try {
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const existing = await Bookmark.findOne({ user: req.user._id, resource: resource._id });
    if (existing) {
      return res.status(200).json(existing);
    }

    const bookmark = await Bookmark.create({
      user: req.user._id,
      resource: resource._id,
      title: resource.title,
      subject: resource.subject,
      location: resource.location,
      fileUrl: resource.fileUrl,
    });

    return res.status(201).json(bookmark);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete('/bookmarks/:resourceId', protect, allowRoles('student', 'professor'), async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({
      user: req.user._id,
      resource: req.params.resourceId,
    });
    return res.status(200).json({ message: 'Bookmark removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/uploads', protect, allowRoles('professor', 'admin'), async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id })
      .sort({ uploadedAt: -1 })
      .limit(20);

    res.json(uploads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/resources/upload
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  if (!['professor', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Only professors or admins can upload resources' });
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const created = await Resource.create({
      title: file.originalname || file.filename,
      subject: 'General',
      location: 'Library',
      fileUrl: `/uploads/${file.filename}`,
      uploadedBy: req.user._id,
      status: 'approved',
    });

    await Upload.create({
      user: req.user._id,
      resource: created._id,
      fileName: created.title,
      fileUrl: created.fileUrl,
      status: 'Uploaded',
      uploadedAt: new Date(),
    });

    const students = await User.find({ role: 'student' }).select('_id');
    const studentIds = students.map((u) => u._id);
    if (studentIds.length > 0) {
      await createNotificationsForUsers({
        userIds: studentIds,
        message: `New resource uploaded – ${created.title}`,
        type: 'resource',
      });
    }

    await createNotificationForUser({
      userId: req.user._id,
      message: 'Your resource uploaded successfully',
      type: 'resource',
    });

    res.status(200).json({ message: 'Upload successful', resource: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/resources/seed — populate with sample data
router.post('/seed', async (req, res) => {
  const sampleResources = [
    { title: 'Calculus I: Early Transcendentals', subject: 'Mathematics', location: 'Library', fileUrl: '#' },
    { title: 'Data Structures & Algorithms',      subject: 'Computer Science', location: 'Library', fileUrl: '#' },
    { title: 'Physics Lab Manual Vol. 2',          subject: 'Physics',     location: 'Lab',     fileUrl: '#' },
    { title: 'Organic Chemistry Guide',            subject: 'Chemistry',   location: 'Lab',     fileUrl: '#' },
    { title: 'World History: Modern Era',          subject: 'History',     location: 'Classroom', fileUrl: '#' },
    { title: 'Linear Algebra Foundations',         subject: 'Mathematics', location: 'Classroom', fileUrl: '#' },
  ];
  try {
    await Resource.deleteMany({});
    const created = await Resource.insertMany(sampleResources);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max size is 25MB.' });
    }
    return res.status(400).json({ message: error.message });
  }

  return next(error);
});

module.exports = router;
