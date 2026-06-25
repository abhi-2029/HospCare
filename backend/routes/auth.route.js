import express from "express";
import { login, signup, valid, upload } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", upload.single("profilePic"), signup);
router.post("/user", valid);

export default router; 
