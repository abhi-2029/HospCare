import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['StateAdmin', 'DistrictOfficer', 'HospitalStaff'], 
    required: true 
  },
  // Depending on the role, the user might be assigned to a specific location
  assignedLocationId: { type: mongoose.Schema.Types.ObjectId, refPath: 'locationModel' },
  locationModel: {
    type: String,
    enum: ['State', 'District', 'Hospital']
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
