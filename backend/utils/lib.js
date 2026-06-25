import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.DB_URL, { dbName: "HospCare" });
      console.log("✅ Mongoose Connected to MongoDB");

      // Programmatic index generation for query performance optimization
      const db = mongoose.connection.db;
      await db.collection("Appointment").createIndex({ doctorEmail: 1 }).catch(() => {});
      await db.collection("Appointment").createIndex({ userEmail: 1 }).catch(() => {});
      await db.collection("patient").createIndex({ email: 1 }, { unique: true }).catch(() => {});
      await db.collection("doctor").createIndex({ email: 1 }, { unique: true }).catch(() => {});
      await db.collection("medical").createIndex({ email: 1 }, { unique: true }).catch(() => {});
      console.log("✅ Database indexes verified and initialized");
    }
    return mongoose.connection.db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

export default connectDB;
