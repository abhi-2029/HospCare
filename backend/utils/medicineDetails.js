export const getMedicineDetails = (medicineName) => {
  const key = (medicineName || "").toLowerCase().trim();
  
  const medicineInfo = {
    paracetamol: {
      precautions: "Take after food. Do not exceed 4g (8 tablets of 500mg) per day to prevent liver damage.",
      when_to_visit_doctor: "Consult a doctor immediately if fever exceeds 103°F (39.4°C) or body pain persists for more than 3 days."
    },
    cetirizine: {
      precautions: "May cause drowsiness. Avoid driving, operating heavy machinery, or consuming alcohol while taking this medication.",
      when_to_visit_doctor: "See a physician if you experience hives, swelling of the face, or severe breathing difficulties."
    },
    metformin: {
      precautions: "Take with meals to reduce stomach upset. Keep hydrated and check blood sugar levels regularly.",
      when_to_visit_doctor: "Seek immediate medical attention if you experience hyperventilation, muscle pain, or extreme fatigue (signs of lactic acidosis)."
    },
    azithromycin: {
      precautions: "Complete the full prescribed course even if symptoms disappear. Do not take with antacids containing aluminum or magnesium.",
      when_to_visit_doctor: "Consult your doctor if you experience severe watery diarrhea, fever, abdominal cramps, or a skin rash."
    },
    salbutamol: {
      precautions: "Use as directed by inhalation. Always carry your emergency quick-relief inhaler with you.",
      when_to_visit_doctor: "Seek emergency medical help if your breathing tightness worsens immediately after inhalation or if chest tightness persists."
    },
    amlodipine: {
      precautions: "Monitor blood pressure regularly. Do not stop taking this medication abruptly without consulting your cardiologist.",
      when_to_visit_doctor: "Contact your doctor if you develop swelling in your ankles or feet, severe dizziness, or chest pain."
    },
    nitrofurantoin: {
      precautions: "Take with food or milk to improve absorption and reduce side effects. Complete the entire duration of the course.",
      when_to_visit_doctor: "Consult your physician if you experience cough, shortness of breath, numbness in extremities, or yellowing of the skin."
    },
    sumatriptan: {
      precautions: "Take immediately at the first sign of a migraine headache. Do not use for normal tension headaches.",
      when_to_visit_doctor: "Seek immediate emergency care if you experience chest pain, heaviness in the throat/jaw, or sudden severe headache."
    },
    omeprazole: {
      precautions: "Take 30 minutes before breakfast on an empty stomach. Avoid spicy foods and lying down immediately after eating.",
      when_to_visit_doctor: "See your doctor if stomach pain persists, or if you experience unexplained weight loss or black, tarry stools."
    }
  };

  return medicineInfo[key] || {
    precautions: "Follow your doctor's instructions carefully. Take the medication with plenty of water and get adequate rest.",
    when_to_visit_doctor: "Consult a healthcare professional if symptoms worsen, or if you experience any adverse side effects."
  };
};

export default getMedicineDetails;
