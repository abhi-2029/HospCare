import connectDB from "../utils/lib.js";

const SubmitTreatmentRecord = async (req, res) => {

  console.log("📥 Submitting Treatment Record");

  try {

    const db = await connectDB();

    const treatmentData = req.body;

    const {
      doctorEmail,
      zone,
      medicines
    } = treatmentData;

    treatmentData.createdAt = new Date();

    // ================= SAVE PATIENT RECORD =================

    const result = await db
      .collection("patientsDB")
      .insertOne(treatmentData);

    // ================= UPDATE MEDICINE STOCK =================

    const collection = db.collection(zone);

    const medicineDoc = await collection.findOne({
      Medicines: { $exists: true }
    });

    if (medicineDoc) {

      let updatedMedicines = medicineDoc.Medicines;

      medicines.forEach((usedMedicine) => {

        updatedMedicines = updatedMedicines.map((med) => {

          if (med.name === usedMedicine.name) {

            const remaining =
              med.noOfTablets - Number(usedMedicine.quantity);

            return {
              ...med,
              noOfTablets: remaining >= 0 ? remaining : 0,
            };
          }

          return med;
        });
      });

      await collection.updateOne(
        { _id: medicineDoc._id },
        {
          $set: {
            Medicines: updatedMedicines,
          },
        }
      );
    }

    // ================= UPDATE DOCTOR DAILY PATIENT COUNT =================

    const doctorDoc = await collection.findOne({
      doctors: { $exists: true }
    });

    if (doctorDoc) {

      const today =
        new Date().toISOString().split("T")[0];

      doctorDoc.doctors.forEach((doctor) => {

        if (doctor.email === doctorEmail) {

          if (!doctor.totalPatients) {
            doctor.totalPatients = [];
          }

          const found = doctor.totalPatients.find(
            (item) => item.date === today
          );

          if (found) {

            found.count += 1;

          } else {

            doctor.totalPatients.push({
              date: today,
              count: 1
            });
          }
        }
      });

      await collection.updateOne(
        { _id: doctorDoc._id },
        {
          $set: {
            doctors: doctorDoc.doctors
          }
        }
      );
    }

    // ================= RESPONSE =================

    res.status(201).json({
      message: "Treatment record created successfully",
      recordId: result.insertedId,
    });

  } catch (error) {

    console.error("❌ Error saving treatment record:", error);

    res.status(500).json({
      message: "Server error while saving treatment record",
    });
  }
};



const FindPatientRecord = async (req, res) => {

  console.log("📥 Fetching Treatment Records From Zone1 to Zone9");

try {
  const db = await connectDB();

  // Array of collection names
  const zoneCollections = [
    "Zone1",
    "Zone2",
    "Zone3",
    "Zone4",
    "Zone5",
    "Zone6",
    "Zone7",
    "Zone8",
    "Zone9",
  ];

  // Fetch data from all collections in parallel
  const results = await Promise.all(
    zoneCollections.map(async (zone) => {
      const data = await db.collection(zone).find({}).toArray();

      return {
        zone,
        records: data,
      };
    })
  );

  // Convert array into object format
  const responseData = results.reduce((acc, curr) => {
    acc[curr.zone] = curr.records;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: responseData,
  });

} catch (error) {
  console.error("❌ Error fetching treatment records:", error);

  res.status(500).json({
    success: false,
    message: "Server error while fetching treatment records",
    error: error.message,
  });
}
};

export {
  SubmitTreatmentRecord,
  FindPatientRecord
};