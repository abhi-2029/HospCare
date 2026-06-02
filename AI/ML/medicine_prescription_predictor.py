import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report
import pickle
import os

DATA_PATH = r'c:\Users\hriti\OneDrive\Desktop\Sem 7th\HospCare\AI\ML\medical_patient_data_5000.csv'

NUMERIC_FEATURES = [
    'age', 'weight_kg', 'height_cm', 'body_temperature',
    'blood_pressure_systolic', 'blood_pressure_diastolic',
    'heart_rate', 'oxygen_saturation', 'blood_sugar_level',
    'symptom_duration_days'
]

CATEGORICAL_FEATURES = [
    'gender', 'blood_group', 'allergies', 'chronic_diseases',
    'fever', 'cough', 'headache', 'fatigue', 'nausea', 'vomiting',
    'body_pain', 'chest_pain', 'shortness_of_breath', 'diarrhea',
    'primary_diagnosis', 'secondary_diagnosis', 'severity',
    'pregnancy_status', 'kidney_condition', 'liver_condition',
    'drug_allergies_flag', 'age_risk_group'
]

BINARY_FEATURES = ['fever', 'cough', 'headache', 'fatigue', 'nausea', 'vomiting',
                    'body_pain', 'chest_pain', 'shortness_of_breath', 'diarrhea', 'drug_allergies_flag']

LABEL_ENCODERS = {}

def load_and_prepare_data(filepath):
    """Load and prepare the medical dataset"""
    df = pd.read_csv(filepath)
    
    # Convert binary columns to numeric
    for col in BINARY_FEATURES:
        if col in df.columns:
            df[col] = df[col].astype(int)
    
    # Fill missing values
    for col in NUMERIC_FEATURES:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            df[col] = df[col].fillna(df[col].median())
    
    for col in CATEGORICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna('unknown')
    
    return df

def encode_categorical_features(df, fit=False):
    """Encode categorical features using LabelEncoder"""
    df_encoded = df.copy()
    
    for col in CATEGORICAL_FEATURES:
        if col in df_encoded.columns:
            if fit:
                le = LabelEncoder()
                df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
                LABEL_ENCODERS[col] = le
            else:
                if col in LABEL_ENCODERS:
                    df_encoded[col] = LABEL_ENCODERS[col].transform(df_encoded[col].astype(str))
    
    return df_encoded

def prepare_features_and_targets(df):
    """Prepare features and target variables"""
    df_encoded = encode_categorical_features(df, fit=True)
    
    # Features
    available_features = [f for f in NUMERIC_FEATURES + CATEGORICAL_FEATURES if f in df_encoded.columns]
    X = df_encoded[available_features]
    
    # Scale numeric features
    scaler = StandardScaler()
    for col in NUMERIC_FEATURES:
        if col in X.columns:
            X[col] = scaler.fit_transform(X[[col]])
    
    # Target variables
    y_medicine = df['medicine_name']
    y_dosage = df['dosage']
    y_frequency = df['frequency']
    y_route = df['route']
    y_duration = df['duration_days']
    
    return X, y_medicine, y_dosage, y_frequency, y_route, y_duration, available_features

def train_models(X, y_medicine):
    """Train multiple ML models for medicine prediction"""
    X_train, X_test, y_train, y_test = train_test_split(X, y_medicine, test_size=0.2, random_state=42)
    
    models = {
        'random_forest': RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42),
        'knn': KNeighborsClassifier(n_neighbors=5),
        'decision_tree': DecisionTreeClassifier(max_depth=15, random_state=42),
        'svm': SVC(kernel='rbf', random_state=42),
        'naive_bayes': GaussianNB(),
    }
    
    results = {}
    
    for model_name, model in models.items():
        print(f"\n{'='*50}")
        print(f"Training {model_name}...")
        print(f"{'='*50}")
        
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        accuracy = accuracy_score(y_test, y_pred)
        results[model_name] = {
            'model': model,
            'accuracy': accuracy,
            'y_test': y_test,
            'y_pred': y_pred
        }
        
        print(f"Accuracy: {accuracy:.4f}")
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred))
    
    # Select best model
    best_model_name = max(results, key=lambda x: results[x]['accuracy'])
    best_model = results[best_model_name]['model']
    
    print(f"\n{'='*50}")
    print(f"Best Model: {best_model_name} with accuracy {results[best_model_name]['accuracy']:.4f}")
    print(f"{'='*50}")
    
    return best_model, results, X_test, y_test

def train_supplementary_models(X_train, X_test, y_dosage_train, y_dosage_test, y_frequency_train, y_frequency_test, y_route_train, y_route_test):
    """Train models for dosage, frequency, and route prediction"""
    models = {}
    
    for target_name, y_tr, y_te in [
        ('dosage', y_dosage_train, y_dosage_test),
        ('frequency', y_frequency_train, y_frequency_test),
        ('route', y_route_train, y_route_test),
    ]:
        try:
            model = RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42)
            model.fit(X_train, y_tr)
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_te, y_pred)
            models[target_name] = {'model': model, 'accuracy': accuracy}
            print(f"{target_name.capitalize()} prediction accuracy: {accuracy:.4f}")
        except Exception as e:
            print(f"Error training {target_name} model: {e}")
            models[target_name] = {'model': None, 'accuracy': 0.0}
    
    return models

def interactive_prediction(best_model, supplementary_models, available_features):
    """Interactive prediction for new patient data"""
    print("\n" + "="*60)
    print("MEDICINE & PRESCRIPTION PREDICTION SYSTEM")
    print("="*60)
    
    while True:
        print("\nEnter patient information (or 'exit' to quit):")
        
        try:
            # Collect patient data
            patient_data = {}
            
            # Numeric inputs
            patient_data['age'] = float(input("Age (years): ") or "30")
            patient_data['weight_kg'] = float(input("Weight (kg): ") or "70")
            patient_data['height_cm'] = float(input("Height (cm): ") or "170")
            patient_data['body_temperature'] = float(input("Body Temperature (°C): ") or "37")
            patient_data['blood_pressure_systolic'] = float(input("Blood Pressure Systolic: ") or "120")
            patient_data['blood_pressure_diastolic'] = float(input("Blood Pressure Diastolic: ") or "80")
            patient_data['heart_rate'] = float(input("Heart Rate (bpm): ") or "75")
            patient_data['oxygen_saturation'] = float(input("Oxygen Saturation (%): ") or "98")
            patient_data['blood_sugar_level'] = float(input("Blood Sugar Level (mg/dL): ") or "100")
            patient_data['symptom_duration_days'] = float(input("Symptom Duration (days): ") or "3")
            
            # Categorical inputs
            patient_data['gender'] = input("Gender (male/female): ") or "male"
            patient_data['blood_group'] = input("Blood Group (O+/O-/A+/A-/B+/B-/AB+/AB-): ") or "O+"
            patient_data['allergies'] = input("Allergies (or 'none'): ") or "none"
            patient_data['chronic_diseases'] = input("Chronic Diseases (or 'none'): ") or "none"
            patient_data['primary_diagnosis'] = input("Primary Diagnosis: ") or "viral_fever"
            patient_data['secondary_diagnosis'] = input("Secondary Diagnosis (or 'none'): ") or "none"
            patient_data['severity'] = input("Severity (mild/moderate/severe): ") or "mild"
            patient_data['pregnancy_status'] = input("Pregnancy Status (yes/no): ") or "no"
            patient_data['kidney_condition'] = input("Kidney Condition (normal/impaired): ") or "normal"
            patient_data['liver_condition'] = input("Liver Condition (normal/impaired): ") or "normal"
            patient_data['age_risk_group'] = input("Age Risk Group (child/adult/elderly): ") or "adult"
            
            # Symptom checklist
            for symptom in ['fever', 'cough', 'headache', 'fatigue', 'nausea', 'vomiting', 
                           'body_pain', 'chest_pain', 'shortness_of_breath', 'diarrhea']:
                response = input(f"{symptom.capitalize()} (yes/no): ") or "no"
                patient_data[symptom] = 1 if response.lower() == 'yes' else 0
            
            patient_data['drug_allergies_flag'] = 1 if input("Drug Allergies? (yes/no): ").lower() == 'yes' else 0
            
            # Create DataFrame and encode
            patient_df = pd.DataFrame([patient_data])
            patient_df_encoded = encode_categorical_features(patient_df, fit=False)
            
            # Select available features
            X_patient = patient_df_encoded[[f for f in available_features if f in patient_df_encoded.columns]]
            
            # Make predictions
            predicted_medicine = best_model.predict(X_patient)[0]
            
            predicted_dosage = supplementary_models['dosage']['model'].predict(X_patient)[0]
            predicted_frequency = supplementary_models['frequency']['model'].predict(X_patient)[0]
            predicted_route = supplementary_models['route']['model'].predict(X_patient)[0]
            
            print("\n" + "="*60)
            print("PREDICTION RESULTS")
            print("="*60)
            print(f"Recommended Medicine: {predicted_medicine}")
            print(f"Dosage: {predicted_dosage}")
            print(f"Frequency: {predicted_frequency}")
            print(f"Route: {predicted_route}")
            print("="*60)
            
        except ValueError:
            print("Invalid input. Please try again.")
        except KeyboardInterrupt:
            break

def main():
    print("Loading and preparing data...")
    df = load_and_prepare_data(DATA_PATH)
    print(f"Dataset loaded: {df.shape[0]} records, {df.shape[1]} columns")
    
    print("\nPreparing features and targets...")
    X, y_medicine, y_dosage, y_frequency, y_route, y_duration, available_features = prepare_features_and_targets(df)
    
    # Single train-test split for all models
    from sklearn.model_selection import train_test_split
    X_train_supp, X_test_supp, y_dosage_train, y_dosage_test, y_frequency_train, y_frequency_test, y_route_train, y_route_test = train_test_split(
        X, y_dosage, y_frequency, y_route, test_size=0.2, random_state=42
    )
    
    print("\nTraining medicine prediction models...")
    best_model, results, X_test, y_test = train_models(X, y_medicine)
    
    print("\nTraining supplementary models (dosage, frequency, route)...")
    supplementary_models = train_supplementary_models(
        X_train_supp, X_test_supp, y_dosage_train, y_dosage_test,
        y_frequency_train, y_frequency_test, y_route_train, y_route_test
    )
    
    # Save models
    print("\nSaving models...")
    pickle.dump(best_model, open('medicine_predictor_model.pkl', 'wb'))
    pickle.dump(supplementary_models, open('supplementary_models.pkl', 'wb'))
    pickle.dump(LABEL_ENCODERS, open('label_encoders.pkl', 'wb'))
    print("Models saved successfully!")
    
    # Interactive prediction
    interactive_prediction(best_model, supplementary_models, available_features)

if __name__ == '__main__':
    main()
