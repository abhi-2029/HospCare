import express from "express";
import { FetchAllDoctors, bookappointment, fetchappointment } from "../controller/treatment.controller.js";
import { valid } from "../controller/auth.controller.js";
import { sendAppointmentStatus1, sendAppointmentStatus2, sendAppointmentStatus3 } from "../controller/Scheduling.controller.js";
import getTime from "../Algorithm/getTime.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();


router.get("/doctors", FetchAllDoctors);
router.post("/bookappointment", authenticateToken, bookappointment);
router.get("/doctors/appointment", authenticateToken, fetchappointment);
router.get("/doctors/appointment/getTime", authenticateToken, getTime);
router.post("/doctors/appointment/Status/1", authenticateToken, sendAppointmentStatus1);
router.post("/doctors/appointment/Status/2", authenticateToken, sendAppointmentStatus2);
router.post("/doctors/appointment/Status/3", authenticateToken, sendAppointmentStatus3);

export default router; 