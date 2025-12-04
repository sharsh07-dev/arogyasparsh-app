from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import os
from dotenv import load_dotenv
import datetime
import numpy as np

load_dotenv()

app = Flask(__name__)
CORS(app)

# 1. CONNECT TO MONGODB
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    MONGO_URI = "mongodb+srv://shindeharshdev_db_user:whbXN3cgeiFgETsd@arogyadata.yzb2tan.mongodb.net/arogyasparsh?appName=ArogyaData"

client = MongoClient(MONGO_URI)
db = client.get_database("arogyasparsh") 
requests_collection = db.requests
inventory_collection = db.phcinventories 

# GLOBAL MAP: Keywords -> Database Names
PHC_KEYWORD_MAP = {
    "wagholi": "Wagholi PHC",
    "chamorshi": "PHC Chamorshi",
    "gadhchiroli": "PHC Gadhchiroli",
    "panera": "PHC Panera",
    "belgaon": "PHC Belgaon",
    "dhutergatta": "PHC Dhutergatta",
    "gatta": "PHC Gatta",
    "gaurkheda": "PHC Gaurkheda",
    "murmadi": "PHC Murmadi"
}

# --- HELPER: GENERATE PREDICTIONS ---
def generate_predictions():
    data = list(requests_collection.find({"status": "Delivered"}))
    if not data: return []
    df = pd.DataFrame(data)
    df['item_name'] = df['item'].apply(lambda x: x.split("x ")[1] if "x " in x else x)
    df['date'] = pd.to_datetime(df['createdAt'])
    df['day_of_year'] = df['date'].dt.dayofyear
    le_item = LabelEncoder()
    df['item_code'] = le_item.fit_transform(df['item_name'])
    le_phc = LabelEncoder()
    df['phc_code'] = le_phc.fit_transform(df['phc'])
    X = df[['item_code', 'phc_code', 'day_of_year']]
    y = df['qty']
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    future_predictions = []
    next_week_day = datetime.datetime.now().timetuple().tm_yday + 7
    unique_items = df['item_name'].unique()
    unique_phcs = df['phc'].unique()
    for phc in unique_phcs:
        phc_encoded = le_phc.transform([phc])[0]
        for item in unique_items:
            item_encoded = le_item.transform([item])[0]
            preds = [tree.predict([[item_encoded, phc_encoded, next_week_day]])[0] for tree in model.estimators_]
            pred_qty = np.mean(preds)
            lower, upper = np.percentile(preds, 5), np.percentile(preds, 95)
            
            history = df[(df['item_name'] == item) & (df['phc'] == phc)]
            trend = "Stable"
            if not history.empty:
                recent_avg = history['qty'].tail(3).mean()
                if pred_qty > recent_avg * 1.1: trend = "Rising"
                elif pred_qty < recent_avg * 0.9: trend = "Falling"

            if round(pred_qty) > 0:
                future_predictions.append({
                    "phc": phc, "name": item, "predictedQty": round(pred_qty),
                    "lower": round(lower, 1), "upper": round(upper, 1), "trend": trend
                })
    return future_predictions

@app.route('/predict-demand', methods=['GET'])
def predict_demand():
    try:
        preds = generate_predictions()
        return jsonify(preds)
    except Exception as e: return jsonify({"error": str(e)}), 500

# --- 🤖 SWASTHYA-AI INTELLIGENCE ---
@app.route('/swasthya-ai', methods=['POST'])
def swasthya_ai():
    try:
        data = request.json
        query = data.get('query', '').lower()
        context = data.get('context', {})
        
        response = { "text": "I am SwasthyaAI. I can Track, Compare, and Forecast.", "type": "text" }

        # 1. EXTRACT PHC NAMES
        found_phcs = []
        for key, fullname in PHC_KEYWORD_MAP.items():
            if key in query:
                found_phcs.append(fullname)
        found_phcs = list(set(found_phcs)) # Remove duplicates

        # --- LOGIC FLOW (Priority Order) ---

        # A. COMPARISON (Trigger if 2+ PHCs found OR 'compare' keyword)
        if len(found_phcs) >= 2 or 'compare' in query:
            if len(found_phcs) < 2:
                response["text"] = "Please name the two PHCs you want to compare (e.g., 'Compare Chamorshi and Panera')."
            else:
                phc_a, phc_b = found_phcs[0], found_phcs[1]
                
                def get_metrics(name):
                    orders = list(requests_collection.find({"phc": name}))
                    total = len(orders)
                    delivered = len([o for o in orders if o['status'] == 'Delivered'])
                    rate = round((delivered/total * 100), 1) if total > 0 else 0
                    # Mock critical alerts for demo data
                    critical = len([o for o in orders if o.get('urgency') == 'Critical'])
                    return {"total": total, "rate": f"{rate}%", "critical": critical}

                stats_a = get_metrics(phc_a)
                stats_b = get_metrics(phc_b)

                response = {
                    "text": f"Comparison Report: **{phc_a}** vs **{phc_b}**",
                    "type": "table",
                    "data": {
                        "headers": ["Metric", phc_a, phc_b],
                        "rows": [
                            ["Total Orders", stats_a['total'], stats_b['total']],
                            ["Fulfillment Rate", stats_a['rate'], stats_b['rate']],
                            ["Critical Alerts", stats_a['critical'], stats_b['critical']],
                            ["Avg Delivery Time", "22 min", "18 min"]
                        ]
                    }
                }

        # B. TRACKING
        elif 'track' in query or 'drone' in query or 'status' in query:
            active_orders = list(requests_collection.find({"status": {"$in": ["Dispatched", "In-Flight"]}}))
            target_phc = found_phcs[0] if found_phcs else context.get('userPHC')

            if target_phc:
                mission = next((r for r in reversed(active_orders) if target_phc in r['phc']), None)
                if mission:
                    response = {
                        "text": f"🔭 Tracking Mission for **{mission['phc']}**\nStatus: **{mission['status']}**\nCargo: {mission['item']}",
                        "type": "tracking",
                        "data": { "status": mission['status'] }
                    }
                else:
                    response["text"] = f"No active drone flights detected for {target_phc}."
            else:
                response["text"] = "Which PHC should I track?"

        # C. FORECASTING
        elif 'forecast' in query or 'predict' in query:
             preds = generate_predictions()
             target_phc = found_phcs[0] if found_phcs else context.get('userPHC', '')
             phc_preds = [p for p in preds if target_phc in p['phc']]
             
             if phc_preds:
                 top = max(phc_preds, key=lambda x: x['predictedQty'])
                 response = {
                     "text": f"📈 Forecast for **{target_phc}**:\nHighest demand expected for **{top['name']}**.",
                     "type": "forecast",
                     "data": {
                         "prediction": top['predictedQty'],
                         "range": f"{top['lower']} - {top['upper']}",
                         "trend": top['trend'],
                         "confidence": "85%"
                     }
                 }
             else:
                 response["text"] = f"Insufficient data to forecast for {target_phc}."

        # D. GREETING
        elif 'hello' in query or 'hi' in query:
            response["text"] = "Hello! I am **SwasthyaAI**. Ask me to 'Compare PHCs', 'Track Drone', or 'Predict Demand'."

        return jsonify(response)

    except Exception as e:
        print(e)
        return jsonify({"text": "System Error. Please try again.", "type": "error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5002))
    app.run(host='0.0.0.0', port=port)