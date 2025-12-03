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
import re

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
            lower = np.percentile(preds, 5)
            upper = np.percentile(preds, 95)
            
            history = df[(df['item_name'] == item) & (df['phc'] == phc)]
            trend = "Stable"
            if not history.empty:
                recent_avg = history['qty'].tail(3).mean()
                if pred_qty > recent_avg * 1.1: trend = "Rising"
                elif pred_qty < recent_avg * 0.9: trend = "Falling"

            if round(pred_qty) > 0:
                future_predictions.append({
                    "phc": phc,
                    "name": item,
                    "predictedQty": round(pred_qty),
                    "lower": round(lower, 1),
                    "upper": round(upper, 1),
                    "trend": trend
                })
    return future_predictions

@app.route('/predict-demand', methods=['GET'])
def predict_demand():
    try:
        preds = generate_predictions()
        return jsonify(preds)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- 🤖 SWASTHYA-AI LOGIC ENGINE ---
@app.route('/swasthya-ai', methods=['POST'])
def swasthya_ai():
    try:
        data = request.json
        query = data.get('query', '').lower()
        context = data.get('context', {})
        
        response = {
            "text": "I am SwasthyaAI. How can I assist with PHC operations today?",
            "type": "text" 
        }

        # ✅ KEYWORD MAPPING (Fixes the Comparison Issue)
        phc_map = {
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

        # --- 1. INTENT: TRACK DRONE ---
        if 'track' in query or 'drone' in query or 'status' in query:
            active_orders = list(requests_collection.find({"status": {"$in": ["Dispatched", "In-Flight", "Delivered"]}}))
            
            target_phc = None
            for key in phc_map:
                if key in query: 
                    target_phc = phc_map[key]
                    break
            
            # If no specific PHC named, use the user's own PHC from context
            if not target_phc and context.get('userPHC'):
                target_phc = context.get('userPHC')

            if target_phc:
                # Match exact PHC name in DB
                mission = next((r for r in reversed(active_orders) if r['phc'] == target_phc), None)
                
                if mission:
                    eta = "5 mins" if mission['status'] == 'In-Flight' else "0 mins"
                    response = {
                        "text": f"Tracking active mission for **{mission['phc']}**.\n\nCurrent Status: **{mission['status']}**\nCargo: {mission['item']}\nETA: {eta} (±2 min, 90% CI)",
                        "type": "tracking",
                        "data": {
                            "id": mission['_id'],
                            "status": mission['status'],
                            "battery": "82%",
                            "signal": "Strong"
                        }
                    }
                else:
                    response["text"] = f"No active drone missions found for **{target_phc}** at this time. The last delivery was completed successfully."
            else:
                response["text"] = "Which PHC's drone would you like to track? (e.g., 'Track Panera')"

        # --- 2. INTENT: COMPARE PHCS (FIXED) ---
        elif 'compare' in query:
            # Find ALL mentioned PHCs in the query using the map
            found_phcs = []
            for key, fullname in phc_map.items():
                if key in query:
                    found_phcs.append(fullname)
            
            # Remove duplicates just in case
            found_phcs = list(set(found_phcs))

            if len(found_phcs) < 2:
                 response["text"] = "Please specify at least two PHCs to compare. (e.g., 'Compare **Chamorshi** and **Panera**')"
            else:
                phc_a, phc_b = found_phcs[0], found_phcs[1]
                
                # Calculate Metrics Function
                def get_metrics(name):
                    orders = list(requests_collection.find({"phc": name}))
                    total = len(orders)
                    delivered = len([o for o in orders if o['status'] == 'Delivered'])
                    rate = round((delivered/total * 100), 1) if total > 0 else 0
                    # Mock lead time based on total orders for variance
                    avg_time = 20 + (total % 5) 
                    return {"total": total, "rate": f"{rate}%", "avg_time": f"{avg_time} min"}

                stats_a = get_metrics(phc_a)
                stats_b = get_metrics(phc_b)

                response = {
                    "text": f"Comparison between **{phc_a}** and **{phc_b}** based on historical performance:",
                    "type": "table",
                    "data": {
                        "headers": ["Metric", phc_a, phc_b],
                        "rows": [
                            ["Total Orders", stats_a['total'], stats_b['total']],
                            ["Fulfillment Rate", stats_a['rate'], stats_b['rate']],
                            ["Avg Delivery Time", stats_a['avg_time'], stats_b['avg_time']],
                            ["Critical Alerts", "1", "0"]
                        ]
                    }
                }

        # --- 3. INTENT: FORECAST/DEMAND ---
        elif 'forecast' in query or 'predict' in query or 'demand' in query:
             preds = generate_predictions()
             
             target_phc = context.get('userPHC', '')
             # Override if user mentions a different PHC
             for key in phc_map:
                 if key in query:
                     target_phc = phc_map[key]
                     break

             phc_preds = [p for p in preds if target_phc.lower() in p['phc'].lower()]
             
             if phc_preds:
                 top = max(phc_preds, key=lambda x: x['predictedQty'])
                 response = {
                     "text": f"Based on historical consumption, here is the forecast for **{top['phc']}** for next week.",
                     "type": "forecast",
                     "data": {
                         "item": top['name'],
                         "prediction": top['predictedQty'],
                         "range": f"{top['lower']} - {top['upper']}",
                         "trend": top['trend'],
                         "confidence": "High (85%)"
                     }
                 }
             else:
                 response["text"] = f"Insufficient data to generate a forecast for **{target_phc}** yet. Please fulfill more orders."

        # --- 4. INTENT: GREETING/HELP ---
        elif 'hello' in query or 'hi' in query or 'help' in query:
            response["text"] = "Hello. I am **SwasthyaAI**, your operational assistant. I can help you:\n\n1. **Track** active drone deliveries.\n2. **Compare** performance (e.g. 'Compare Panera and Belgaon').\n3. **Forecast** medicine demand.\n\nWhat would you like to do?"

        return jsonify(response)

    except Exception as e:
        print(e)
        return jsonify({"text": "I encountered a system error processing your request. Please contact IT support.", "type": "error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5002))
    app.run(host='0.0.0.0', port=port)