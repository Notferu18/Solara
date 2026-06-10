from flask import Flask, request, jsonify
import joblib
import numpy as np
from pathlib import Path

app    = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent

# ── Load saved .pkl files ────────────────────────────────
model  = joblib.load(BASE_DIR / 'model.pkl')   # Random Forest Regressor
scaler = joblib.load(BASE_DIR / 'scaler.pkl')  # StandardScaler

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    # Expects: { category_id, price, day_of_week, month }

    features = np.array([[
        data.get('category_id', 1),
        data.get('price', 0),
        data.get('day_of_week', 1),
        data.get('month', 1),
    ]])

    # Scale using the saved scaler
    features_scaled = scaler.transform(features)

    # Predict using the saved model
    predicted_quantity = model.predict(features_scaled)[0]

    return jsonify({
        'predicted_quantity': round(float(predicted_quantity), 2)
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({ 'status': 'ok', 'model': 'Random Forest Regressor' })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
