import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  availability: { type: Boolean, default: true },
  shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Full Day'], default: 'Morning' },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
