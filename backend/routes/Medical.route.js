import express from "express";
import { getMedicineList,medicineUpdate } from "../controller/Medical.controller.js";
import { SubmitTreatmentRecord, FindPatientRecord } from "../controller/SumbitTreatement.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Route to fetch medicine list
router.post("/Medicine", authenticateToken, getMedicineList);

router.post("/MedicineUpdate", authenticateToken, medicineUpdate);
// Submit patient treatment record
router.post("/SubmitTreatment", authenticateToken, SubmitTreatmentRecord);

// Fetch all treatment records
router.get("/FindTreatment", authenticateToken, FindPatientRecord);

export default router;
