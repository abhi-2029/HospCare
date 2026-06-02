import express from "express";
import { getMedicineList,medicineUpdate } from "../controller/Medical.controller.js";
import { SubmitTreatmentRecord, FindPatientRecord } from "../controller/SumbitTreatement.controller.js";

const router = express.Router();

// Route to fetch medicine list
router.post("/Medicine", getMedicineList);

router.post("/MedicineUpdate", medicineUpdate);
// Submit patient treatment record
router.post("/SubmitTreatment", SubmitTreatmentRecord);

// Fetch all treatment records
router.get("/FindTreatment", FindPatientRecord);

export default router;
