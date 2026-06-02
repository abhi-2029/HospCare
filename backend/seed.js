import mongoose from 'mongoose';
import State from './models/State.js';
import District from './models/District.js';
import Hospital from './models/Hospital.js';
import Doctor from './models/Doctor.js';
import Medicine from './models/Medicine.js';
import User from './models/user.model.js';
import dotenv from 'dotenv';

// Load env for MongoDB URI if necessary
dotenv.config();

const mongoURI = process.env.DB_URL || 'mongodb://127.0.0.1:27017/hospcare';

async function seedDatabase() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await State.deleteMany({});
    await District.deleteMany({});
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});
    await Medicine.deleteMany({});
    await User.deleteMany({});

    // 1. Create State
    const state = await State.create({ name: 'California', code: 'CA' });

    // 2. Create Districts
    const district1 = await District.create({ name: 'Los Angeles', stateId: state._id });
    const district2 = await District.create({ name: 'San Francisco', stateId: state._id });

    // 3. Create Hospitals
    const hospitalLA1 = await Hospital.create({ name: 'LA General Hospital', type: 'Government', districtId: district1._id });
    const hospitalLA2 = await Hospital.create({ name: 'LA Community Clinic', type: 'Clinic', districtId: district1._id });
    const hospitalSF1 = await Hospital.create({ name: 'SF Central Hospital', type: 'Government', districtId: district2._id });

    // 4. Create Doctors
    await Doctor.insertMany([
      { name: 'Dr. John Doe', specialization: 'Cardiology', availability: true, shift: 'Morning', hospitalId: hospitalLA1._id },
      { name: 'Dr. Jane Smith', specialization: 'Neurology', availability: false, shift: 'Night', hospitalId: hospitalLA1._id },
      { name: 'Dr. Alan Wake', specialization: 'Orthopedics', availability: true, shift: 'Full Day', hospitalId: hospitalLA2._id },
      { name: 'Dr. Sarah Connor', specialization: 'Pediatrics', availability: true, shift: 'Evening', hospitalId: hospitalSF1._id },
    ]);

    // 5. Create Medicines
    await Medicine.insertMany([
      { name: 'Paracetamol', stock: 500, usage: 100, threshold: 200, expiry: new Date('2025-12-31'), hospitalId: hospitalLA1._id },
      { name: 'Amoxicillin', stock: 50, usage: 200, threshold: 100, expiry: new Date('2024-05-15'), hospitalId: hospitalLA1._id }, // Low stock
      { name: 'Ibuprofen', stock: 300, usage: 50, threshold: 150, expiry: new Date('2026-01-01'), hospitalId: hospitalLA2._id },
      { name: 'Ciprofloxacin', stock: 80, usage: 150, threshold: 100, expiry: new Date('2025-08-20'), hospitalId: hospitalSF1._id }, // Low stock
    ]);

    // 6. Create Users (Roles)
    await User.create({ username: 'admin_ca', password: 'password123', role: 'StateAdmin', assignedLocationId: state._id, locationModel: 'State' });
    await User.create({ username: 'officer_la', password: 'password123', role: 'DistrictOfficer', assignedLocationId: district1._id, locationModel: 'District' });
    await User.create({ username: 'staff_la1', password: 'password123', role: 'HospitalStaff', assignedLocationId: hospitalLA1._id, locationModel: 'Hospital' });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
