import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Academic', 'Sports', 'Extracurricular'], required: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    filePath: { type: String, required: true },
    fileOriginalName: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
    reviewerComment: { type: String }
  },
  { timestamps: true }
);

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;


