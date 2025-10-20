import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';

dotenv.config();

const app = express();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:8000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Static file serving for uploads
app.use('/uploads', express.static(path.join('uploads')));

// Debug middleware to log file requests
app.use('/uploads', (req, res, next) => {
  console.log('File request:', req.url);
  console.log('Full path:', path.join('uploads', req.url));
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/achievements', achievementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


