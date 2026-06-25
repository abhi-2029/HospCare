import axios from "axios";
import getMedicineDetails from "../utils/medicineDetails.js";

const FLASK_PREDICTION_URL = process.env.FLASK_PREDICTION_URL || "http://127.0.0.1:5001/api/predict";

const symptomKeywords = {
  fever: ["fever", "bukhar", "jwar", "body garam", "garam", "tapman", "feverish"],
  cough: ["cough", "khansi", "khasi", "gale me kharash", "kharash"],
  headache: ["headache", "sir dard", "sirddard", "sar dard", "sardard", "migraine"],
  fatigue: ["fatigue", "thakawat", "thakan", "thak", "tiredness", "kamjori", "weakness"],
  nausea: ["nausea", "queasy", "metha", "vomit jaisa", "ji machlana", "ji machlna", "ghabrahat"],
  vomiting: ["vomit", "vomiting", "throw up", "ulti", "ultian", "ulta"],
  body_pain: ["body pain", "dard", "ache", "badan dard", "body ache", "haath pair dard", "pair dard"],
  chest_pain: ["chest pain", "seene mein dard", "seene me dard", "chhati me dard", "angina"],
  shortness_of_breath: ["shortness of breath", "saans", "saans lene", "saans phoolna", "breathless"],
  diarrhea: ["diarrhea", "loose motion", "pait kharab", "pet kharab", "dast", "loose motions", "pait"],
};

const diagnosisKeywords = {
  common_cold: ["common cold", "cold", "runny nose", "sneeze", "sneezing", "stuffy nose", "sore throat", "sardi", "jukam", "jukham"],
  allergic_rhinitis: ["allergy", "allergies", "hay fever", "pollen", "itchy eyes", "watery eyes", "sneezing", "cheenke", "chink"],
  viral_fever: ["viral", "virus", "flu", "influenza", "viral fever", "fever", "temperature", "viral bukhar"],
  bacterial_infection: ["bacterial", "infection", "bacteria", "pus", "painful", "infecsan"],
  diabetes_type_2: ["diabetes", "sugar", "blood sugar", "diabetes type 2", "madhumeh"],
  hypertension: ["hypertension", "high blood pressure", "bp", "high bp"],
  asthma_attack: ["asthma", "wheezing", "shortness of breath", "breathing problem", "chest tightness", "dama"],
  cardiac_issue: ["heart", "cardiac", "chest pain", "heart attack", "angina", "pressure in chest", "dil ki bimari"],
  thyroid_disorder: ["thyroid", "hypothyroid", "hyperthyroid"],
  gastroenteritis: ["stomach infection", "food poisoning", "gastroenteritis", "diarrhea", "loose motion", "pait kharab", "dast"],
  urinary_tract_infection: ["urinary tract infection", "uti", "painful urination", "burning urine", "frequent urination", "peshab me jalan"],
  migraine: ["migraine", "light sensitivity", "throbbing", "headache", "adhkapari"],
};

const medicineConditionMap = {
  cetirizine: "allergic_rhinitis",
  paracetamol: "viral_fever",
  amlodipine: "hypertension",
  nitrofurantoin: "urinary_tract_infection",
  metformin: "diabetes_type_2",
  azithromycin: "bacterial_infection",
  salbutamol: "asthma_attack",
  sumatriptan: "migraine",
  omeprazole: "gastroenteritis",
};

const diagnosisLabels = {
  common_cold: "Common Cold",
  allergic_rhinitis: "Allergic Rhinitis / Allergy",
  viral_fever: "Viral Fever",
  bacterial_infection: "Bacterial Infection",
  diabetes_type_2: "Type 2 Diabetes",
  hypertension: "Hypertension",
  asthma_attack: "Asthma Attack",
  cardiac_issue: "Cardiac Issue",
  thyroid_disorder: "Thyroid Disorder",
  gastroenteritis: "Gastroenteritis",
  urinary_tract_infection: "Urinary Tract Infection",
  migraine: "Migraine",
};

const severityKeywords = {
  severe: ["severe", "very bad", "intense", "extreme", "worst"],
  moderate: ["moderate", "medium", "average"],
  mild: ["mild", "light", "slight"],
};

const parseBooleanFlag = (text, keywords) => {
  return keywords.some(keyword => text.includes(keyword)) ? 1 : 0;
};

const findDiagnosis = (text) => {
  for (const [diagnosis, keywords] of Object.entries(diagnosisKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return diagnosis;
    }
  }
  return "unknown";
};

const inferDiagnosisFromMedicine = (medicine) => {
  if (!medicine) return "unknown";
  const key = medicine.toLowerCase();
  for (const [drug, diagnosis] of Object.entries(medicineConditionMap)) {
    if (key.includes(drug)) return diagnosis;
  }
  return "unknown";
};

const getReadableDiagnosis = (diagnosis) => {
  if (!diagnosis) return "unknown condition";
  return diagnosisLabels[diagnosis] || diagnosis.replace(/_/g, " ");
};

const findSeverity = (text) => {
  if (severityKeywords.severe.some(keyword => text.includes(keyword))) return "severe";
  if (severityKeywords.moderate.some(keyword => text.includes(keyword))) return "moderate";
  return "mild";
};

const extractGender = (text) => {
  if (text.includes("female") || text.includes("woman") || text.includes("lady")) return "female";
  if (text.includes("male") || text.includes("man") || text.includes("boy")) return "male";
  return "unknown";
};

const parseMessageToPatientData = (message) => {
  const text = (message || "").toLowerCase();
  const inferredDiagnosis = findDiagnosis(text);
  const patient = {
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
    gender: extractGender(text),
    blood_group: "unknown",
    allergies: text.includes("allergy") ? "yes" : "none",
    chronic_diseases: text.includes("diabetes") ? "diabetes" : "none",
    fever: parseBooleanFlag(text, symptomKeywords.fever),
    cough: parseBooleanFlag(text, symptomKeywords.cough),
    headache: parseBooleanFlag(text, symptomKeywords.headache),
    fatigue: parseBooleanFlag(text, symptomKeywords.fatigue),
    nausea: parseBooleanFlag(text, symptomKeywords.nausea),
    vomiting: parseBooleanFlag(text, symptomKeywords.vomiting),
    body_pain: parseBooleanFlag(text, symptomKeywords.body_pain),
    chest_pain: parseBooleanFlag(text, symptomKeywords.chest_pain),
    shortness_of_breath: parseBooleanFlag(text, symptomKeywords.shortness_of_breath),
    diarrhea: parseBooleanFlag(text, symptomKeywords.diarrhea),
    primary_diagnosis: inferredDiagnosis,
    secondary_diagnosis: "none",
    severity: findSeverity(text),
    pregnancy_status: text.includes("pregnan") ? "yes" : "no",
    kidney_condition: text.includes("kidney") ? "impaired" : "normal",
    liver_condition: text.includes("liver") ? "impaired" : "normal",
    drug_allergies_flag: text.includes("allergy") ? 1 : 0,
    age_risk_group: text.includes("elderly") || text.includes("old") ? "elderly" : "adult",
  };

  const ageMatch = text.match(/\b(\d{1,2})\s*(years|yrs|year|y)\b/);
  if (ageMatch) {
    const parsedAge = parseInt(ageMatch[1], 10);
    if (!isNaN(parsedAge)) patient.age = Math.min(Math.max(parsedAge, 1), 100);
  }

  // Infer primary diagnosis from symptom flags if set to unknown
  if (patient.primary_diagnosis === "unknown") {
    if (patient.fever && patient.headache && patient.body_pain) {
      patient.primary_diagnosis = "viral_fever";
    } else if (patient.cough && patient.fever) {
      patient.primary_diagnosis = "common_cold";
    } else if (patient.fever) {
      patient.primary_diagnosis = "viral_fever";
    } else if (patient.cough) {
      patient.primary_diagnosis = "common_cold";
    } else if (patient.headache) {
      patient.primary_diagnosis = "migraine";
    } else if (patient.diarrhea) {
      patient.primary_diagnosis = "gastroenteritis";
    } else if (patient.shortness_of_breath) {
      patient.primary_diagnosis = "asthma_attack";
    }
  }

  return patient;
};

const isHinglishInput = (text) => {
  const hinglishPatterns = [
    "bukhar", "khansi", "khasi", "dard", "thak", "ulti", "saans", "dast", "pet", "pait", 
    "sir", "sar", "gala", "kharash", "kamjori", "alas", "machla", "seene", "chhati", 
    "sardi", "jukam", "cheenk", "dama", "sugar", "hai", "ko", "me", "mein", "se", "aur", "ya"
  ];
  const lowerText = text.toLowerCase();
  return hinglishPatterns.some(pat => {
    const regex = new RegExp(`\\b${pat}\\b`);
    return regex.test(lowerText);
  });
};

const buildHinglishReply = (prediction, patientData) => {
  let disease = prediction.disease || patientData.primary_diagnosis || "unknown";
  let readableDisease = getReadableDiagnosis(disease);

  if (readableDisease === "unknown condition" && prediction.medicine) {
    const inferred = inferDiagnosisFromMedicine(prediction.medicine);
    readableDisease = getReadableDiagnosis(inferred);
  }

  const medicine = prediction.medicine || "koi medicine nahi mili";
  const dosage = prediction.dosage ? ` ${prediction.dosage}` : "";
  const frequency = prediction.frequency ? `, ${prediction.frequency}` : "";
  const route = prediction.route ? ` via ${prediction.route}` : "";
  
  let precautions = prediction.precautions || "Doctor ki salah lein aur aaram karein.";
  let whenToVisitDoctor = prediction.when_to_visit_doctor || "Agar tabiyat zyada kharab ho to turant doctor se sampark karein.";

  // Translate basic English defaults to natural Hinglish phrasing
  if (precautions.toLowerCase().includes("drink plenty of water")) {
    precautions = "Bahut saara paani piyein aur aaram karein.";
  }
  if (whenToVisitDoctor.toLowerCase().includes("consult a professional")) {
    whenToVisitDoctor = "Agar symptoms bane rahein to doctor se sampark karein.";
  }

  const lines = [
    `Aapke symptoms ke hisab se, aapko shayad **${readableDisease}** hai.`,
    `Suggested medicine hai: **${medicine}**${dosage}${frequency}${route}.`,
    `Aapko ye baatein dhyan me rakhni chahiye: ${precautions}`,
    `Warning alert: ${whenToVisitDoctor}`
  ];

  return lines.join(" ");
};

const buildHumanReply = (prediction, patientData) => {
  let disease = prediction.disease || patientData.primary_diagnosis || "unknown";
  let readableDisease = getReadableDiagnosis(disease);

  if (readableDisease === "unknown condition" && prediction.medicine) {
    const inferred = inferDiagnosisFromMedicine(prediction.medicine);
    readableDisease = getReadableDiagnosis(inferred);
  }

  const medicine = prediction.medicine || "no specific medicine identified";
  const dosage = prediction.dosage ? ` ${prediction.dosage}` : "";
  const frequency = prediction.frequency ? `, ${prediction.frequency}` : "";
  const route = prediction.route ? ` via ${prediction.route}` : "";
  const precautions = prediction.precautions || "Follow doctor guidance and rest.";
  const whenToVisitDoctor = prediction.when_to_visit_doctor || "If symptoms worsen, consult a physician.";

  const lines = [
    `Based on your symptoms, the most likely condition is ${readableDisease}.`,
    `Suggested medicine: ${medicine}${dosage}${frequency}${route}.`,
    precautions,
    whenToVisitDoctor,
  ];

  return lines.filter(Boolean).join(" ");
};

const MedicineChatBot = (() => {
  const generateMedicineSuggestion = async (userMessage) => {
    try {
      const patientData = parseMessageToPatientData(userMessage);
      const response = await axios.post(FLASK_PREDICTION_URL, patientData, { timeout: 10000 });

      if (response.data?.status === "success") {
        const prediction = response.data.prediction || {};
        
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
          prediction.medicine = guardrail.medicine;
          prediction.dosage = guardrail.dosage;
          prediction.frequency = guardrail.frequency;
          prediction.route = guardrail.route;
        }

        // Enrich prediction with specific safety details
        const medicine = prediction.medicine || "";
        const details = getMedicineDetails(medicine);
        prediction.precautions = details.precautions;
        prediction.when_to_visit_doctor = details.when_to_visit_doctor;

        const rawDiseaseCode = prediction.disease || patientData.primary_diagnosis || "unknown";
        const diseaseLabel = getReadableDiagnosis(rawDiseaseCode) === "unknown condition"
          ? getReadableDiagnosis(inferDiagnosisFromMedicine(prediction.medicine))
          : getReadableDiagnosis(rawDiseaseCode);

        const isHinglish = isHinglishInput(userMessage);

        const replyPayload = {
          disease: diseaseLabel,
          medicine: prediction.medicine || "Not available",
          dosage: prediction.dosage || "Not available",
          frequency: prediction.frequency || "Not available",
          route: prediction.route || "Not available",
          precautions: prediction.precautions,
          when_to_visit_doctor: prediction.when_to_visit_doctor,
          human_reply: isHinglish 
            ? buildHinglishReply(prediction, patientData) 
            : buildHumanReply(prediction, patientData),
        };

        return {
          status: "success",
          prediction: replyPayload,
        };
      }

      return {
        status: "error",
        prediction: {
          error: response.data?.message || "Prediction unavailable.",
        },
      };
    } catch (error) {
      console.error("Prediction API Error:", error.message || error);
      return {
        status: "error",
        prediction: {
          error: "Prediction service is unavailable right now.",
        },
      };
    }
  };

  return { generateMedicineSuggestion };
})();

export default MedicineChatBot;
