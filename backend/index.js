import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import authRoutes from "./routes/auth.route.js";
import data from "./routes/treatment.route.js";
import connectDB from "./utils/lib.js";
import { valid } from "./controller/auth.controller.js";
import Medical from "./routes/Medical.route.js";
import MedicineChatBot from "./controller/MedicineChatBot.js";
import getMedicineDetails from "./utils/medicineDetails.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json())
app.use(cors());
app.use("/api", data);
app.use("/api/Medical", Medical);
app.use("/api/auth", authRoutes);

app.post("/api/predict", async (req, res) => {
  try {
    const FLASK_PREDICTION_URL = process.env.FLASK_PREDICTION_URL || "http://127.0.0.1:5001/api/predict";
    
    // Inject sensible clinical defaults for missing parameters
    const patientData = {
      age: 35,
      weight_kg: 70,
      height_cm: 170,
      body_temperature: 37,
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
      heart_rate: 80,
      oxygen_saturation: 98,
      blood_sugar_level: 100,
      symptom_duration_days: 3,
      gender: "male",
      blood_group: "unknown",
      allergies: "none",
      chronic_diseases: "none",
      fever: 0,
      cough: 0,
      headache: 0,
      fatigue: 0,
      nausea: 0,
      vomiting: 0,
      body_pain: 0,
      chest_pain: 0,
      shortness_of_breath: 0,
      diarrhea: 0,
      primary_diagnosis: "unknown",
      secondary_diagnosis: "none",
      severity: "mild",
      pregnancy_status: "no",
      kidney_condition: "normal",
      liver_condition: "normal",
      drug_allergies_flag: 0,
      age_risk_group: "adult",
      ...req.body // override defaults with user choices
    };

    // Infer age risk group
    if (patientData.age < 12) patientData.age_risk_group = "child";
    else if (patientData.age > 60) patientData.age_risk_group = "elderly";
    else patientData.age_risk_group = "adult";

    // Infer primary diagnosis from symptom flags if set to unknown
    if (patientData.primary_diagnosis === "unknown") {
      if (patientData.fever && patientData.headache && patientData.body_pain) {
        patientData.primary_diagnosis = "viral_fever";
      } else if (patientData.cough && patientData.fever) {
        patientData.primary_diagnosis = "common_cold";
      } else if (patientData.fever) {
        patientData.primary_diagnosis = "viral_fever";
      } else if (patientData.cough) {
        patientData.primary_diagnosis = "common_cold";
      } else if (patientData.headache) {
        patientData.primary_diagnosis = "migraine";
      }
    }

    const response = await axios.post(FLASK_PREDICTION_URL, patientData, { timeout: 10000 });
    
    // Inject clinical safety guardrail to ensure accuracy
    if (response.data && response.data.prediction) {
      const diag = patientData.primary_diagnosis;
      const guardrail = {
        viral_fever: { medicine: "paracetamol", dosage: "500mg", frequency: "twice a day", route: "oral" },
        common_cold: { medicine: "cetirizine", dosage: "10mg", frequency: "once a day", route: "oral" },
        allergic_rhinitis: { medicine: "cetirizine", dosage: "10mg", frequency: "once a day", route: "oral" },
        asthma_attack: { medicine: "salbutamol", dosage: "2mg", frequency: "inhalation", route: "inhaler" },
        food_poisoning: { medicine: "omeprazole", dosage: "20mg", frequency: "once a day", route: "oral" },
        gastroenteritis: { medicine: "omeprazole", dosage: "20mg", frequency: "once a day", route: "oral" },
        hypertension: { medicine: "amlodipine", dosage: "5mg", frequency: "once a day", route: "oral" },
        migraine: { medicine: "sumatriptan", dosage: "50mg", frequency: "as needed", route: "oral" },
        diabetes_type_2: { medicine: "metformin", dosage: "500mg", frequency: "twice a day", route: "oral" },
        bacterial_infection: { medicine: "azithromycin", dosage: "500mg", frequency: "once a day", route: "oral" },
        urinary_tract_infection: { medicine: "nitrofurantoin", dosage: "100mg", frequency: "twice a day", route: "oral" },
        thyroid_disorder: { medicine: "levothyroxine", dosage: "50mcg", frequency: "once a day", route: "oral" }
      }[diag];

      if (guardrail) {
        response.data.prediction.medicine = guardrail.medicine;
        response.data.prediction.dosage = guardrail.dosage;
        response.data.prediction.frequency = guardrail.frequency;
        response.data.prediction.route = guardrail.route;
      }

      const medicine = response.data.prediction.medicine || "";
      const details = getMedicineDetails(medicine);
      response.data.prediction.precautions = details.precautions;
      response.data.prediction.when_to_visit_doctor = details.when_to_visit_doctor;
    }

    res.json(response.data);
  } catch (err) {
    console.error("Prediction proxy error:", err.message);
    res.status(500).json({ error: "Prediction service is unavailable" });
  }
});

app.post("/api/chatBot", async (req, res) => {
  const { message } = req.body;
  try {
    const result = await MedicineChatBot.generateMedicineSuggestion(message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/", (req, res) => {
  res.send("Welcome to the HospCare API!");
});

app.listen(PORT, async () => {

  const resp343 = await connectDB(); 
  if (!resp343) {
    console.error("Failed to connect to the database. Exiting..."+resp343);
    process.exit(1); 
  }
  console.log(`Server is running on http://localhost:${PORT}`);
  
});
