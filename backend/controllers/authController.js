import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password });
  const token = generateToken(user._id, user.role);
  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const match = await user.comparePassword(password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  const token = generateToken(user._id, user.role);
  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};


