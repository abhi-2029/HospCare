import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['Low Stock', 'High Demand', 'Critical'], required: true },
  message: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  status: { type: String, enum: ['Unread', 'Read'], default: 'Unread' },
}, { timestamps: true });

export default mongoose.model('Alert', alertSchema);
