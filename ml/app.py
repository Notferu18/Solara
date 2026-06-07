from flask import Flask, request, jsonify
import joblib
import numpy as np

app    = Flask(__name__)
model  = joblib.load('ml/model.pkl')
scaler = joblib.load('ml/scaler.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    features = np.array([[
        data.get('category_id', 1),
        data.get('price', 0),
        data.get('day_of_week', 1),
        data.get('month', 1),
    ]])

    features_scaled    = scaler.transform(features)
    predicted_quantity = model.predict(features_scaled)[0]

    return jsonify({
        'predicted_quantity': round(float(predicted_quantity), 2)
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(port=5001, debug=True)