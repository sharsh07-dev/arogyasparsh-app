from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import os
from dotenv import load_dotenv
import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# 1. CONNECT TO MONGODB (Corrected)
# We get the string from the Environment Variable "MONGO_URI"
MONGO_URI = os.getenv("MONGO_URI")

# Fallback for local testing if .env is missing (Safety check)
if not MONGO_URI:
    MONGO_URI = "mongodb+srv://shindeharshdev_db_user:whbXN3cgeiFgETsd@arogyadata.yzb2tan.mongodb.net/arogyasparsh?appName=ArogyaData"

client = MongoClient(MONGO_URI)

# ✅ FIX: Use the database name from your URI ('arogyasparsh')
# If your data is in 'test', change this to client.get_database("test")
db = client.get_database("arogyasparsh") 
requests_collection = db.requests

@app.route('/predict-demand', methods=['GET'])
def predict_demand():
    try:
        # 2. FETCH DATA FROM MONGO
        # We only learn from "Delivered" orders
        data = list(requests_collection.find({"status": "Delivered"}))
        
        if not data:
            # If no data yet, return a mock response so the dashboard doesn't break
            return jsonify([
                {"name": "Covishield Vaccine", "predictedQty": 120, "trend": "📈 Rising", "confidence": "Simulation"},
                {"name": "Snake Anti-Venom", "predictedQty": 15, "trend": "📉 Falling", "confidence": "Simulation"},
                {"name": "O+ Blood Bags", "predictedQty": 30, "trend": "➡️ Stable", "confidence": "Simulation"}
            ])

        df = pd.DataFrame(data)
        
        # 3. PREPROCESS DATA
        # Convert '15x Vaccine' -> 'Vaccine'
        df['item_name'] = df['item'].apply(lambda x: x.split("x ")[1] if "x " in x else x)
        df['date'] = pd.to_datetime(df['createdAt'])
        df['day_of_year'] = df['date'].dt.dayofyear
        
        # Encode Medicine Names to Numbers (ML needs numbers)
        le = LabelEncoder()
        df['item_code'] = le.fit_transform(df['item_name'])

        # 4. TRAIN MODEL (Random Forest)
        # X = [Item Code, Day of Year]
        # Y = [Quantity Needed]
        X = df[['item_code', 'day_of_year']]
        y = df['qty']

        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)

        # 5. MAKE PREDICTIONS FOR NEXT WEEK
        future_predictions = []
        next_week_day = datetime.datetime.now().timetuple().tm_yday + 7
        
        # Get unique medicines
        unique_items = df['item_name'].unique()

        for item in unique_items:
            item_code = le.transform([item])[0]
            
            # Predict quantity for this item next week
            pred_qty = model.predict([[item_code, next_week_day]])[0]
            
            # Determine trend (Compare with last actual average)
            recent_avg = df[df['item_name'] == item]['qty'].tail(3).mean()
            trend = "📈 Rising" if pred_qty > recent_avg else "📉 Falling"

            future_predictions.append({
                "name": item,
                "predictedQty": round(pred_qty),
                "trend": trend,
                "confidence": "High (Random Forest)"
            })

        return jsonify(future_predictions)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Use the PORT environment variable provided by Render, or default to 5002
    port = int(os.environ.get("PORT", 5002))
    app.run(host='0.0.0.0', port=port)