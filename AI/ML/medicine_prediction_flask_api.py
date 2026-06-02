"""
Medicine Prediction Flask API
REST API for predicting medicines and prescriptions based on patient data
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global models storage
models_cache = {
    'medicine_model': None,
    'supplementary_models': None,
    'label_encoders': None,
    'loaded': False
}

FEATURE_COLS = [
    'age', 'weight_kg', 'height_cm', 'body_temperature',
    'blood_pressure_systolic', 'blood_pressure_diastolic',
    'heart_rate', 'oxygen_saturation', 'blood_sugar_level',
    'symptom_duration_days', 'gender', 'blood_group', 'allergies',
    'chronic_diseases', 'fever', 'cough', 'headache', 'fatigue',
    'nausea', 'vomiting', 'body_pain', 'chest_pain',
    'shortness_of_breath', 'diarrhea', 'primary_diagnosis',
    'secondary_diagnosis', 'severity', 'pregnancy_status',
    'kidney_condition', 'liver_condition', 'drug_allergies_flag',
    'age_risk_group'
]

NUMERIC_FEATURES = [
    'age', 'weight_kg', 'height_cm', 'body_temperature',
    'blood_pressure_systolic', 'blood_pressure_diastolic',
    'heart_rate', 'oxygen_saturation', 'blood_sugar_level',
    'symptom_duration_days', 'fever', 'cough', 'headache', 'fatigue',
    'nausea', 'vomiting', 'body_pain', 'chest_pain',
    'shortness_of_breath', 'diarrhea', 'drug_allergies_flag'
]

CATEGORICAL_FEATURES = [
    'gender', 'blood_group', 'allergies', 'chronic_diseases',
    'primary_diagnosis', 'secondary_diagnosis', 'severity',
    'pregnancy_status', 'kidney_condition', 'liver_condition',
    'age_risk_group'
]

DEFAULT_CATEGORY = 'unknown'


def safe_numeric(value):
    try:
        if isinstance(value, bool):
            return int(value)
        if value is None or (isinstance(value, str) and not value.strip()):
            return 0.0
        return float(value)
    except Exception:
        return 0.0


def normalize_patient_data(patient_data):
    normalized = {}
    for col in FEATURE_COLS:
        if col in NUMERIC_FEATURES:
            normalized[col] = safe_numeric(patient_data.get(col, 0))
        else:
            raw_value = patient_data.get(col, DEFAULT_CATEGORY)
            normalized[col] = str(raw_value).strip() if raw_value is not None else DEFAULT_CATEGORY
            if normalized[col] == '':
                normalized[col] = DEFAULT_CATEGORY
    return normalized


def load_models():
    """Load trained models from pickle files"""
    try:
        model_dir = Path(__file__).parent
        
        medicine_model = pickle.load(
            open(model_dir / 'medicine_predictor_model.pkl', 'rb')
        )
        supplementary_models = pickle.load(
            open(model_dir / 'supplementary_models.pkl', 'rb')
        )
        label_encoders = pickle.load(
            open(model_dir / 'label_encoders.pkl', 'rb')
        )
        
        models_cache['medicine_model'] = medicine_model
        models_cache['supplementary_models'] = supplementary_models
        models_cache['label_encoders'] = label_encoders
        models_cache['loaded'] = True
        
        logger.info("✓ Models loaded successfully")
        return True
    except FileNotFoundError as e:
        logger.error(f"✗ Error loading models: {e}")
        logger.error("Run medicine_prescription_predictor.py first to train models")
        return False


def encode_patient_data(patient_data):
    """Encode categorical features in patient data"""
    normalized_data = normalize_patient_data(patient_data)
    patient_df = pd.DataFrame([normalized_data])
    patient_df_encoded = patient_df.copy()
    
    label_encoders = models_cache['label_encoders']
    
    for col in label_encoders.keys():
        if col in patient_df_encoded.columns:
            try:
                patient_df_encoded[col] = label_encoders[col].transform(
                    patient_df_encoded[col].astype(str)
                )
            except Exception:
                patient_df_encoded[col] = 0
    
    return patient_df_encoded


def prepare_features(patient_df_encoded):
    """Prepare feature matrix for prediction"""
    X_patient = patient_df_encoded.copy()
    
    # Ensure all required columns exist
    for col in FEATURE_COLS:
        if col not in X_patient.columns:
            X_patient[col] = 0
    
    # Select only required features
    X_patient = X_patient[FEATURE_COLS]
    
    return X_patient


@app.before_request
def check_models_loaded():
    """Check if models are loaded before processing requests"""
    if not models_cache['loaded']:
        if not load_models():
            return jsonify({
                'status': 'error',
                'message': 'Models not loaded. Please train models first.'
            }), 500


@app.route('/api/predict', methods=['POST'])
def predict_medicine():
    """
    Predict medicine for a single patient
    
    Request JSON format:
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
    """
    try:
        patient_data = request.get_json()
        
        if not patient_data:
            return jsonify({
                'status': 'error',
                'message': 'No patient data provided'
            }), 400
        
        # Encode and normalize patient values
        patient_df_encoded = encode_patient_data(patient_data)
        
        # Prepare features with safe defaults
        X_patient = prepare_features(patient_df_encoded)
        
        # Make predictions
        medicine_model = models_cache['medicine_model']
        supplementary_models = models_cache['supplementary_models']
        
        predicted_medicine = medicine_model.predict(X_patient)[0]
        predicted_dosage = supplementary_models['dosage']['model'].predict(X_patient)[0]
        predicted_frequency = supplementary_models['frequency']['model'].predict(X_patient)[0]
        predicted_route = supplementary_models['route']['model'].predict(X_patient)[0]
        
        return jsonify({
            'status': 'success',
            'prediction': {
                'medicine': str(predicted_medicine),
                'dosage': str(predicted_dosage),
                'frequency': str(predicted_frequency),
                'route': str(predicted_route)
            },
            'patient_info': {
                'age': patient_data.get('age'),
                'gender': patient_data.get('gender'),
                'diagnosis': patient_data.get('primary_diagnosis'),
                'severity': patient_data.get('severity')
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Prediction failed: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found',
        'available_endpoints': {
            'single_prediction': 'POST /api/predict'
        }
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500


if __name__ == '__main__':
    logger.info("Starting Medicine Prediction Flask API...")
    logger.info("Loading models...")
    
    if load_models():
        logger.info("Running Flask server on http://127.0.0.1:5001")
        logger.info("Available endpoints:")
        logger.info("  - POST /api/predict")
        
        app.run(debug=True, host='127.0.0.1', port=5001)
    else:
        logger.error("Failed to load models. Please train them first.")
