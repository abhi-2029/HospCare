"""
Medicine and Prescription Prediction API
Predicts medicines and prescriptions based on patient data using trained ML models
"""

import pickle
import pandas as pd
import numpy as np
from pathlib import Path

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

class MedicinePredictionAPI:
    def __init__(self, model_dir=None):
        """Initialize the API with trained models"""
        if model_dir is None:
            model_dir = Path(__file__).parent
        
        self.model_dir = Path(model_dir)
        self.load_models()
    
    def load_models(self):
        """Load all trained models and encoders"""
        try:
            self.medicine_model = pickle.load(
                open(self.model_dir / 'medicine_predictor_model.pkl', 'rb')
            )
            self.supplementary_models = pickle.load(
                open(self.model_dir / 'supplementary_models.pkl', 'rb')
            )
            self.label_encoders = pickle.load(
                open(self.model_dir / 'label_encoders.pkl', 'rb')
            )
            print("✓ Models loaded successfully")
        except FileNotFoundError as e:
            print(f"✗ Error: {e}")
            print("Make sure to run medicine_prescription_predictor.py first to train models")
            raise
    
    def predict_for_patient(self, patient_data: dict) -> dict:
        """
        Predict medicine and prescription for a patient
        
        Args:
            patient_data (dict): Patient information with keys like:
                - age, weight_kg, height_cm, body_temperature
                - blood_pressure_systolic, blood_pressure_diastolic
                - heart_rate, oxygen_saturation, blood_sugar_level
                - symptom_duration_days
                - gender, blood_group, allergies, chronic_diseases
                - primary_diagnosis, secondary_diagnosis, severity
                - fever, cough, headache, fatigue, nausea, vomiting
                - body_pain, chest_pain, shortness_of_breath, diarrhea
                - pregnancy_status, kidney_condition, liver_condition
                - drug_allergies_flag, age_risk_group
        
        Returns:
            dict: Prediction results with medicine, dosage, frequency, route
        """
        
        # Create DataFrame from patient data
        patient_df = pd.DataFrame([patient_data])
        
        # Normalize patient values first
        normalized_data = normalize_patient_data(patient_data)
        patient_df = pd.DataFrame([normalized_data])
        patient_df_encoded = patient_df.copy()
        for col in self.label_encoders.keys():
            if col in patient_df_encoded.columns:
                try:
                    patient_df_encoded[col] = self.label_encoders[col].transform(
                        patient_df_encoded[col].astype(str)
                    )
                except Exception:
                    patient_df_encoded[col] = 0
        
        # Select available features
        feature_cols = [
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
        
        X_patient = patient_df_encoded[[f for f in feature_cols if f in patient_df_encoded.columns]]
        
        # Fill missing features with 0
        for col in feature_cols:
            if col not in X_patient.columns:
                X_patient[col] = 0
        
        X_patient = X_patient[feature_cols]
        
        # Make predictions
        try:
            predicted_medicine = self.medicine_model.predict(X_patient)[0]
            predicted_dosage = self.supplementary_models['dosage']['model'].predict(X_patient)[0]
            predicted_frequency = self.supplementary_models['frequency']['model'].predict(X_patient)[0]
            predicted_route = self.supplementary_models['route']['model'].predict(X_patient)[0]
            
            return {
                'medicine': predicted_medicine,
                'dosage': predicted_dosage,
                'frequency': predicted_frequency,
                'route': predicted_route,
                'confidence': 'high' if hasattr(self.medicine_model, 'predict_proba') else 'standard',
                'status': 'success'
            }
        except Exception as e:
            return {
                'medicine': None,
                'dosage': None,
                'frequency': None,
                'route': None,
                'error': str(e),
                'status': 'error'
            }
    
    def batch_predict(self, patients_df: pd.DataFrame) -> pd.DataFrame:
        """
        Predict for multiple patients at once
        
        Args:
            patients_df (pd.DataFrame): DataFrame with patient information
        
        Returns:
            pd.DataFrame: DataFrame with predictions
        """
        predictions = []
        for idx, row in patients_df.iterrows():
            result = self.predict_for_patient(row.to_dict())
            predictions.append(result)
        
        return pd.DataFrame(predictions)


def example_usage():
    """Example usage of the API"""
    print("\n" + "="*60)
    print("MEDICINE PREDICTION API - EXAMPLE USAGE")
    print("="*60)
    
    # Initialize API
    api = MedicinePredictionAPI()
    
    # Example patient 1: Young adult with viral fever
    patient1 = {
        'age': 25,
        'weight_kg': 68.5,
        'height_cm': 172,
        'body_temperature': 38.6,
        'blood_pressure_systolic': 120,
        'blood_pressure_diastolic': 80,
        'heart_rate': 78,
        'oxygen_saturation': 98,
        'blood_sugar_level': 92,
        'symptom_duration_days': 3,
        'gender': 'male',
        'blood_group': 'O+',
        'allergies': 'none',
        'chronic_diseases': 'none',
        'fever': 1,
        'cough': 1,
        'headache': 1,
        'fatigue': 0,
        'nausea': 0,
        'vomiting': 0,
        'body_pain': 1,
        'chest_pain': 0,
        'shortness_of_breath': 0,
        'diarrhea': 0,
        'primary_diagnosis': 'viral_fever',
        'secondary_diagnosis': 'none',
        'severity': 'mild',
        'pregnancy_status': 'no',
        'kidney_condition': 'normal',
        'liver_condition': 'normal',
        'drug_allergies_flag': 0,
        'age_risk_group': 'adult'
    }
    
    # Example patient 2: Elderly with hypertension
    patient2 = {
        'age': 60,
        'weight_kg': 70.5,
        'height_cm': 158,
        'body_temperature': 37.2,
        'blood_pressure_systolic': 150,
        'blood_pressure_diastolic': 95,
        'heart_rate': 85,
        'oxygen_saturation': 95,
        'blood_sugar_level': 140,
        'symptom_duration_days': 4,
        'gender': 'female',
        'blood_group': 'O-',
        'allergies': 'dust',
        'chronic_diseases': 'hypertension',
        'fever': 0,
        'cough': 0,
        'headache': 1,
        'fatigue': 1,
        'nausea': 0,
        'vomiting': 0,
        'body_pain': 0,
        'chest_pain': 1,
        'shortness_of_breath': 0,
        'diarrhea': 0,
        'primary_diagnosis': 'hypertension',
        'secondary_diagnosis': 'cardiac_stress',
        'severity': 'moderate',
        'pregnancy_status': 'no',
        'kidney_condition': 'impaired',
        'liver_condition': 'normal',
        'drug_allergies_flag': 1,
        'age_risk_group': 'elderly'
    }
    
    # Make predictions
    print("\n--- Patient 1: Young Adult with Viral Fever ---")
    result1 = api.predict_for_patient(patient1)
    print(result1)
    result2 = api.predict_for_patient(patient2)
    print(result2)
    print(f"Confidence: {result2['confidence']}")
    
    print("\n" + "="*60)


if __name__ == '__main__':
    example_usage()
