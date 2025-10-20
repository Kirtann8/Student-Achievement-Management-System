import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createAchievement,
  getMyAchievements,
  updateMyAchievement,
  deleteMyAchievement,
  adminListAll,
  adminReview,
  analytics
} from '../controllers/achievementController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Ensure uploads dir exists
const uploadsDir = path.join('uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF/PNG/JPEG allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Student routes
router.post('/', authenticate, authorize('student', 'admin'), upload.single('certificate'), createAchievement);
router.get('/me', authenticate, authorize('student', 'admin'), getMyAchievements);
router.put('/:id', authenticate, authorize('student', 'admin'), upload.single('certificate'), updateMyAchievement);
router.delete('/:id', authenticate, authorize('student', 'admin'), deleteMyAchievement);

// Admin routes
router.get('/', authenticate, authorize('admin'), adminListAll);
router.post('/:id/review', authenticate, authorize('admin'), adminReview);
router.get('/stats/analytics', authenticate, authorize('admin'), analytics);

export default router;


