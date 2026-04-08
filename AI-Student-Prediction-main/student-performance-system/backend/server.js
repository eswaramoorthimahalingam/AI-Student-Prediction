const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const performanceRoutes = require('./routes/performance');
const studentRoutes = require('./routes/students');
const predictionRoutes = require('./routes/predictions');
const { bootstrapDemoPortal } = require('./utils/bootstrapDemoPortal');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studentDB';
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/', predictionRoutes);
app.use('/api', performanceRoutes);

app.use((error, _req, res, _next) => {
  if (error.message === 'CORS origin not allowed') {
    res.status(403).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    await bootstrapDemoPortal();
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
