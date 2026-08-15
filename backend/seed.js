const mongoose = require('mongoose');
const Resource = require('./models/resourceModel');
const dotenv = require('dotenv');

dotenv.config();

const sampleResources = [
  { title: 'Calculus I: Early Transcendentals', subject: 'Mathematics', location: 'Library', fileUrl: '#' },
  { title: 'Organic Chemistry Lab Manual', subject: 'Chemistry', location: 'Lab', fileUrl: '#' },
  { title: 'Introduction to Modern Physics', subject: 'Physics', location: 'Lab', fileUrl: '#' },
  { title: 'World History: Volume 1', subject: 'History', location: 'Classroom', fileUrl: '#' },
  { title: 'Data Structures & Algorithms', subject: 'Computer Science', location: 'Library', fileUrl: '#' },
  { title: 'Linear Algebra Foundations', subject: 'Mathematics', location: 'Classroom', fileUrl: '#' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resourcenet');
    console.log('Connected to MongoDB for seeding...');
    
    await Resource.deleteMany({});
    console.log('Cleared existing resources.');
    
    await Resource.insertMany(sampleResources);
    console.log('Sample resources seeded successfully!');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
