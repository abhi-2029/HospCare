import axios from "axios";

const FLASK_PREDICTION_URL = process.env.FLASK_PREDICTION_URL || "http://127.0.0.1:5001/api/predict";

const symptomKeywords = {
  fever: ["fever", "bukhar", "heat"],
  cough: ["cough", "khansi"],
  headache: ["headache", "sir dard", "migraine"],
  fatigue: ["fatigue", "thak", "tired"],
  nausea: ["nausea", "queasy", "metha"],
  vomiting: ["vomit", "throw up", "ultian"],
  body_pain: ["body pain", "dard", "ache"],
  chest_pain: ["chest pain", "seene mein dard", "angina"],
  shortness_of_breath: ["shortness of breath", "saans", "breathless"],
  diarrhea: ["diarrhea", "loose motion", "pait kharab", "pait"],
};

const diagnosisKeywords = {
  common_cold: ["common cold", "cold", "runny nose", "sneeze", "sneezing", "stuffy nose", "sore throat"],
  allergic_rhinitis: ["allergy", "allergies", "hay fever", "pollen", "itchy eyes", "watery eyes", "sneezing"],
  viral_fever: ["viral", "virus", "flu", "influenza", "viral fever", "fever", "temperature"],
  bacterial_infection: ["bacterial", "infection", "bacteria", "infection", "pus", "painful"],
  diabetes_type_2: ["diabetes", "sugar", "blood sugar", "diabetes type 2"],
  hypertension: ["hypertension", "high blood pressure", "bp"],
  asthma_attack: ["asthma", "wheezing", "shortness of breath", "breathing problem", "chest tightness"],
  cardiac_issue: ["heart", "cardiac", "chest pain", "heart attack", "angina", "pressure in chest"],
  thyroid_disorder: ["thyroid", "hypothyroid", "hyperthyroid"],
  gastroenteritis: ["stomach infection", "food poisoning", "gastroenteritis", "diarrhea", "loose motion", "pait kharab"],
  urinary_tract_infection: ["urinary tract infection", "uti", "painful urination", "burning urine", "frequent urination"],
  migraine: ["migraine", "light sensitivity", "throbbing", "headache"],
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

  return patient;
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
        const rawDiseaseCode = prediction.disease || patientData.primary_diagnosis || "unknown";
        const diseaseLabel = getReadableDiagnosis(rawDiseaseCode) === "unknown condition"
          ? getReadableDiagnosis(inferDiagnosisFromMedicine(prediction.medicine))
          : getReadableDiagnosis(rawDiseaseCode);

        const replyPayload = {
          disease: diseaseLabel,
          medicine: prediction.medicine || "Not available",
          dosage: prediction.dosage || "Not available",
          frequency: prediction.frequency || "Not available",
          route: prediction.route || "Not available",
          precautions: prediction.precautions || "Follow doctor guidance and rest.",
          when_to_visit_doctor: prediction.when_to_visit_doctor || "If symptoms worsen, consult a physician.",
          human_reply: buildHumanReply(prediction, patientData),
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
