from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib

BASE_DIR = Path(__file__).resolve().parent
csv_path = BASE_DIR / 'data' / 'solara_sales_data.csv'
df = pd.read_csv(csv_path)

print(f"Loaded {len(df)} records from CSV")
print(f"   Columns: {list(df.columns)}")
print(df.head())

# ── Features (X) and Target (y) ─────────────────────────────
# Supervised ML: model learns features → target relationship
X = df[['category_id', 'price', 'day_of_week', 'month']]
y = df['quantity_sold']   # ← This is the label (known answer)

# ── Scale features (StandardScaler) ─────────────────────────
scaler   = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ── Train / Test Split ───────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

print(f"\nDataset split:")
print(f"   Training rows : {len(X_train)}")
print(f"   Testing rows  : {len(X_test)}")

# ── Train Random Forest Regressor ────────────────────────────
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# ── Evaluate the model ───────────────────────────────────────
y_pred = model.predict(X_test)

mae  = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mape = np.mean(np.abs((y_test - y_pred) / (y_test + 1e-10))) * 100
r2   = r2_score(y_test, y_pred)

print(f"\nModel Performance:")
print(f"   MAE  (Mean Absolute Error)       : {mae:.2f} units")
print(f"   RMSE (Root Mean Squared Error)   : {rmse:.2f} units")
print(f"   MAPE (Mean Abs Percentage Error) : {mape:.2f}%")
print(f"   R²   (R-Squared Score)           : {r2:.2f}")
print(f"\n   Model Accuracy : {100 - mape:.2f}%")

# ── Save as .pkl files (required deliverables) ───────────────
joblib.dump(model,  BASE_DIR / 'model.pkl')
joblib.dump(scaler, BASE_DIR / 'scaler.pkl')

print("\n model.pkl saved!")
print("scaler.pkl saved!")