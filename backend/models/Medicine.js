import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  usage: { type: Number, default: 0 },
  threshold: { type: Number, required: true, default: 100 },
  expiry: { type: Date, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
}, { timestamps: true });

export default mongoose.model('Medicine', medicineSchema);
