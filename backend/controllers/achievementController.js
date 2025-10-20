import fs from 'fs';
import path from 'path';
import Achievement from '../models/Achievement.js';

const deleteFileIfExists = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    // ignore
  }
};

export const createAchievement = async (req, res) => {
  const { title, category, description, date } = req.body;
  if (!req.file) return res.status(400).json({ message: 'Certificate file is required' });
  
  const achievement = await Achievement.create({
    student: req.user._id,
    title,
    category,
    description,
    date,
    filePath: `/uploads/${req.file.filename}`,
    fileOriginalName: req.file.originalname
  });
  res.status(201).json(achievement);
};

export const getMyAchievements = async (req, res) => {
  const items = await Achievement.find({ student: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
};

export const updateMyAchievement = async (req, res) => {
  const { id } = req.params;
  const achievement = await Achievement.findOne({ _id: id, student: req.user._id });
  if (!achievement) return res.status(404).json({ message: 'Not found' });

  const { title, category, description, date } = req.body;
  if (title !== undefined) achievement.title = title;
  if (category !== undefined) achievement.category = category;
  if (description !== undefined) achievement.description = description;
  if (date !== undefined) achievement.date = date;

  if (req.file) {
    const oldPath = achievement.filePath ? path.join('uploads', achievement.filePath.replace(/^\/uploads\//, '')) : null;
    achievement.filePath = `/uploads/${req.file.filename}`;
    achievement.fileOriginalName = req.file.originalname;
    deleteFileIfExists(oldPath);
  }
  // Reset status to Pending on edit
  achievement.status = 'Pending';
  achievement.reviewerComment = '';
  await achievement.save();
  res.json(achievement);
};

export const deleteMyAchievement = async (req, res) => {
  const { id } = req.params;
  const achievement = await Achievement.findOneAndDelete({ _id: id, student: req.user._id });
  if (!achievement) return res.status(404).json({ message: 'Not found' });
  const absPath = achievement.filePath ? path.join(process.cwd(), 'backend', achievement.filePath.replace(/^\/+/, '')) : null;
  deleteFileIfExists(absPath);
  res.json({ success: true });
};

export const adminListAll = async (req, res) => {
  const { category, status } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  const items = await Achievement.find(filter).populate('student', 'name email').sort({ createdAt: -1 });
  res.json(items);
};

export const adminReview = async (req, res) => {
  const { id } = req.params;
  const { action, comment } = req.body; // action: approve|reject
  const achievement = await Achievement.findById(id);
  if (!achievement) return res.status(404).json({ message: 'Not found' });
  if (action === 'approve') achievement.status = 'Approved';
  else if (action === 'reject') achievement.status = 'Rejected';
  else return res.status(400).json({ message: 'Invalid action' });
  achievement.reviewerComment = comment || '';
  await achievement.save();
  res.json(achievement);
};

export const analytics = async (req, res) => {
  const [byCategory, byStatus, monthly] = await Promise.all([
    Achievement.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]),
    Achievement.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]),
    Achievement.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', count: 1, _id: 0 } }
    ])
  ]);
  res.json({ byCategory, byStatus, monthly });
};


