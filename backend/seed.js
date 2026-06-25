import mongoose from 'mongoose';
import State from './models/State.js';
import District from './models/District.js';
import Hospital from './models/Hospital.js';
import Doctor from './models/Doctor.js';
import Medicine from './models/Medicine.js';
import User from './models/user.model.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load env for MongoDB URI if necessary
dotenv.config();

const mongoURI = process.env.DB_URL || 'mongodb://127.0.0.1:27017/HospCare';

async function seedDatabase() {
  try {
    await mongoose.connect(mongoURI, { dbName: 'HospCare' });
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

    // 6. Create Users (Roles) with hashed passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await User.create({ username: 'admin_ca', password: hashedPassword, role: 'StateAdmin', assignedLocationId: state._id, locationModel: 'State' });
    await User.create({ username: 'officer_la', password: hashedPassword, role: 'DistrictOfficer', assignedLocationId: district1._id, locationModel: 'District' });
    await User.create({ username: 'staff_la1', password: hashedPassword, role: 'HospitalStaff', assignedLocationId: hospitalLA1._id, locationModel: 'Hospital' });

    // 7. Initialize Zone Collections
    console.log('Initializing Zone collections...');
    const db = mongoose.connection.db;
    const zoneCollections = [
      "Zone1", "Zone2", "Zone3", "Zone4", "Zone5",
      "Zone6", "Zone7", "Zone8", "Zone9"
    ];

    const defaultMedicines = [
      { name: "paracetamol", noOfTablets: 500 },
      { name: "cetirizine", noOfTablets: 300 },
      { name: "metformin", noOfTablets: 400 },
      { name: "azithromycin", noOfTablets: 200 },
      { name: "salbutamol", noOfTablets: 150 },
      { name: "amlodipine", noOfTablets: 300 },
      { name: "nitrofurantoin", noOfTablets: 250 },
      { name: "sumatriptan", noOfTablets: 100 },
      { name: "omeprazole", noOfTablets: 400 }
    ];

    for (const zone of zoneCollections) {
      await db.collection(zone).deleteMany({});
      
      // Document 1: Doctors metadata
      await db.collection(zone).insertOne({ doctors: [] });
      
      // Document 2: Medicines inventory
      await db.collection(zone).insertOne({ Medicines: defaultMedicines });
      
      console.log(`Initialized inventory and doctors metadata for ${zone}`);
    }

    // Clear patientsDB to ensure no leftover patient records
    await db.collection("patientsDB").deleteMany({});
    console.log('Cleared patientsDB collection');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
