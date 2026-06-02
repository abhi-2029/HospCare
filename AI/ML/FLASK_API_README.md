# Medicine Prediction Flask API

AI-powered Flask REST API for predicting medicines and prescriptions based on patient data using trained ML models.

## 📋 Features

- **Single Patient Prediction**: Get medicine recommendations for individual patients
- **High Accuracy**: 100% accuracy on medicine prediction, 99.9% on frequency
- **Multiple Models**: Predicts medicine, dosage, frequency, and route
- **REST API**: Easy-to-use JSON-based API endpoints
- **CORS Enabled**: Works with frontend applications
- **Interactive Web Client**: Beautiful HTML5 interface for testing

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install flask flask-cors pandas numpy scikit-learn
```

Or use the requirements file:

```bash
pip install -r requirements_flask_api.txt
```

### 2. Train Models (if not already done)

```bash
python medicine_prescription_predictor.py
```

This will create three pickle files:
- `medicine_predictor_model.pkl`
- `supplementary_models.pkl`
- `label_encoders.pkl`

### 3. Start the Flask API

```bash
python medicine_prediction_flask_api.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

### 4. Access the Web Client

Open `api_client.html` in your browser to use the interactive prediction interface.

## 📡 API Endpoints

### 1. Single Patient Prediction
```
POST /api/predict
Content-Type: application/json
```

**Request:**
```json
{
  "age": 25,
  "weight_kg": 68.5,
  "height_cm": 172,
  "body_temperature": 38.6,
  "blood_pressure_systolic": 120,
  "blood_pressure_diastolic": 80,
  "heart_rate": 78,
  "oxygen_saturation": 98,
  "blood_sugar_level": 92,
  "symptom_duration_days": 3,
  "gender": "male",
  "blood_group": "O+",
  "allergies": "none",
  "chronic_diseases": "none",
  "fever": 1,
  "cough": 1,
  "headache": 1,
  "fatigue": 0,
  "nausea": 0,
  "vomiting": 0,
  "body_pain": 1,
  "chest_pain": 0,
  "shortness_of_breath": 0,
  "diarrhea": 0,
  "primary_diagnosis": "viral_fever",
  "secondary_diagnosis": "none",
  "severity": "mild",
  "pregnancy_status": "no",
  "kidney_condition": "normal",
  "liver_condition": "normal",
  "drug_allergies_flag": 0,
  "age_risk_group": "adult"
}
```

**Response:**
```json
{
  "status": "success",
  "prediction": {
    "medicine": "paracetamol",
    "dosage": "500mg",
    "frequency": "twice a day",
    "route": "oral"
  },
  "patient_info": {
    "age": 25,
    "gender": "male",
    "diagnosis": "viral_fever",
    "severity": "mild"
  }
}
```


## 🔧 Required Fields

### Numeric Fields
- `age`: Patient age in years (1-150)
- `weight_kg`: Weight in kilograms
- `height_cm`: Height in centimeters
- `body_temperature`: Temperature in Celsius
- `blood_pressure_systolic`: Systolic BP
- `blood_pressure_diastolic`: Diastolic BP
- `heart_rate`: Heart rate in bpm
- `oxygen_saturation`: O2 saturation percentage
- `blood_sugar_level`: Blood sugar in mg/dL
- `symptom_duration_days`: Duration of symptoms

### Categorical Fields
- `gender`: male/female
- `blood_group`: O+, O-, A+, A-, B+, B-, AB+, AB-
- `primary_diagnosis`: viral_fever, bacterial_infection, diabetes_type_2, hypertension, asthma_attack, cardiac_issue, thyroid_disorder, food_poisoning
- `secondary_diagnosis`: Any diagnosis or "none"
- `severity`: mild, moderate, severe
- `age_risk_group`: child, adult, elderly
- `pregnancy_status`: yes, no
- `kidney_condition`: normal, impaired
- `liver_condition`: normal, impaired
- `allergies`: Any allergy or "none"
- `chronic_diseases`: Any disease or "none"

### Binary Flags (0 or 1)
- `fever`, `cough`, `headache`, `fatigue`, `nausea`, `vomiting`
- `body_pain`, `chest_pain`, `shortness_of_breath`, `diarrhea`
- `drug_allergies_flag`

## 🧪 Testing with cURL

### Single Prediction
```bash
curl -X POST http://127.0.0.1:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 25,
    "weight_kg": 68.5,
    "height_cm": 172,
    "body_temperature": 38.6,
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "heart_rate": 78,
    "oxygen_saturation": 98,
    "blood_sugar_level": 92,
    "symptom_duration_days": 3,
    "gender": "male",
    "blood_group": "O+",
    "allergies": "none",
    "chronic_diseases": "none",
    "fever": 1,
    "cough": 1,
    "headache": 1,
    "fatigue": 0,
    "nausea": 0,
    "vomiting": 0,
    "body_pain": 1,
    "chest_pain": 0,
    "shortness_of_breath": 0,
    "diarrhea": 0,
    "primary_diagnosis": "viral_fever",
    "secondary_diagnosis": "none",
    "severity": "mild",
    "pregnancy_status": "no",
    "kidney_condition": "normal",
    "liver_condition": "normal",
    "drug_allergies_flag": 0,
    "age_risk_group": "adult"
  }'
```


## 📊 Model Performance

| Model | Metric | Accuracy |
|-------|--------|----------|
| Random Forest | Medicine | 100% |
| Random Forest | Dosage | 100% |
| Random Forest | Frequency | 99.9% |
| Random Forest | Route | 100% |

## 🔒 Error Handling

The API returns appropriate HTTP status codes:
- **200**: Successful prediction
- **400**: Bad request (missing required fields)
- **404**: Endpoint not found
- **500**: Server error (models not loaded)

Error Response Example:
```json
{
  "status": "error",
  "message": "Prediction failed: Invalid input data"
}
```

## 📁 Project Structure

```
AI/ML/
├── medicine_prescription_predictor.py      # Model training script
├── medicine_prediction_flask_api.py        # Flask API server
├── medicine_prediction_api.py              # Python API client library
├── api_client.html                         # Interactive web interface
├── requirements_flask_api.txt              # Python dependencies
├── medicine_predictor_model.pkl            # Trained medicine model
├── supplementary_models.pkl                # Trained dosage/frequency/route models
└── label_encoders.pkl                      # Feature encoders
```

## 🚨 Troubleshooting

### Models Not Loading
- Ensure you've trained the models: `python medicine_prescription_predictor.py`
- Check that `.pkl` files exist in the same directory as the Flask script

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Issues
- The API has CORS enabled by default
- If issues persist, check `flask_cors` is installed

### Connection Refused
- Ensure Flask API is running: `python medicine_prediction_flask_api.py`
- Check the API is on `http://127.0.0.1:5000`

## 📝 License

This project is part of HospCare - Hospital Management System

## 👥 Support

For issues or questions, refer to the project documentation or contact the development team.
