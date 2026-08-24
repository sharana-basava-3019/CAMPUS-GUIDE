const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;

const createDefaultAdmin = async () => {
  await User.updateMany({ isBlocked: { $exists: false } }, { $set: { isBlocked: false } });

  const email = 'admin@gmail.com';
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      name: 'Sharana',
      email,
      password: 'Admin',
      role: 'admin',
    });
    console.log('Default admin user created');
    return;
  }

  if (existing.role !== 'admin' || existing.name !== 'Sharana') {
    existing.role = 'admin';
    existing.name = 'Sharana';
    await existing.save();
    console.log('Existing admin account normalized');
  }
};

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-guide')
  .then(async () => {
    console.log('Connected to MongoDB');
    await createDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
