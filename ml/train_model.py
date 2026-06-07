import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import mysql.connector

# ── Connect to Laragon MySQL ─────────────────────────────────
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='solara_db'
)

# ── Pull sales data ──────────────────────────────────────────
query = """
    SELECT
        oi.menu_item_id,
        mi.category_id,
        mi.price,
        DAYOFWEEK(o.created_at)  AS day_of_week,
        MONTH(o.created_at)      AS month,
        SUM(oi.quantity)         AS total_sold
    FROM order_items oi
    JOIN orders     o  ON oi.order_id     = o.id
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE o.status = 'completed'
    GROUP BY oi.menu_item_id, mi.category_id, mi.price,
             DAYOFWEEK(o.created_at), MONTH(o.created_at)
"""

df = pd.read_sql(query, conn)
conn.close()

print(f"Loaded {len(df)} records from database")
print(df.head())

# ── Features & target ────────────────────────────────────────
X = df[['category_id', 'price', 'day_of_week', 'month']]
y = df['total_sold']

# ── Scale features ───────────────────────────────────────────
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ── Train/test split ─────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

# ── Train Random Forest Regressor ────────────────────────────
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# ── Evaluate ─────────────────────────────────────────────────
y_pred = model.predict(X_test)
mae    = mean_absolute_error(y_test, y_pred)
r2     = r2_score(y_test, y_pred)

print(f"\nModel Performance:")
print(f"   MAE : {mae:.2f}")
print(f"   R²  : {r2:.2f}")

# ── Save .pkl files ──────────────────────────────────────────
joblib.dump(model,  'ml/model.pkl')
joblib.dump(scaler, 'ml/scaler.pkl')

print("\nmodel.pkl saved!")
print("scaler.pkl saved!")