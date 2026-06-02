import connectDB from "../utils/lib.js";



export const getMedicineList = async (req, res) => {
  try {
    const { zone } = req.body;

    if (!zone) {
      return res.status(400).json({ message: "Zone is required" });
    }

    const db = await connectDB();

    const zoneData = await db.collection(zone).find({}).toArray();

    if (!zoneData || zoneData.length === 0) {
      return res.status(404).json({ message: "Zone not found" });
    }

   
   const medicines = zoneData[1]; // ⚠️ exact key
    

    return res.status(200).json({
      zone,
      medicines
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const medicineUpdate = async (req, res) => {
  try {

    const { AllMedicines, zones } = req.body;

   

    if (!AllMedicines || !zones) {
      return res.status(400).json({
        message: "AllMedicines and zones are required",
      });
    }

    const db = await connectDB();

    const collection = db.collection(zones);

    // Find medicine document
    const medicineDoc = await collection.findOne({
      Medicines: { $exists: true }
    });

    if (!medicineDoc) {
      return res.status(404).json({
        message: "Medicine document not found",
      });
    }

    // Current DB medicines
    let updatedMedicines = medicineDoc.Medicines;

    // Loop through medicines received from frontend
    AllMedicines.forEach((usedMedicine) => {

      updatedMedicines = updatedMedicines.map((med) => {

        // Match medicine name
        if (med.name === usedMedicine.name) {

          const remainingStock =
            med.noOfTablets - Number(usedMedicine.quantity);

          return {
            ...med,
            noOfTablets: remainingStock >= 0 ? remainingStock : 0,
          };
        }

        return med;
      });
    });

    // Update DB
    await collection.updateOne(
      { _id: medicineDoc._id },
      {
        $set: {
          Medicines: updatedMedicines,
        },
      }
    );

    

    return res.status(200).json({
      message: "Medicine quantities updated successfully",
      Medicines: updatedMedicines,
    });

  } catch (error) {

    console.error("Medicine Update Error:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};