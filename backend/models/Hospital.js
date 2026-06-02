import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Government', 'Private', 'Clinic'], default: 'Government' },
  districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
}, { timestamps: true });

export default mongoose.model('Hospital', hospitalSchema);
