import os
from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
FEATURE_FIELDS = [
    "examScore",
    "assignmentScore",
    "seminarScore",
    "projectScore",
    "sportsScore",
    "hackathonScore",
    "attendance",
]


@lru_cache(maxsize=1)
def load_models():
    reg = joblib.load(BASE_DIR / "reg.pkl")
    clf = joblib.load(BASE_DIR / "clf.pkl")
    return reg, clf


def build_feature_frame(data):
    if not isinstance(data, dict):
        raise ValueError("Request body must be a JSON object.")

    feature_values = {}
    for field in FEATURE_FIELDS:
        if field not in data:
            raise ValueError(f"{field} is required.")

        try:
            feature_values[field] = float(data[field])
        except (TypeError, ValueError) as error:
            raise ValueError(f"{field} must be a valid number.") from error

    return pd.DataFrame([feature_values], columns=FEATURE_FIELDS)

@app.route("/health", methods=["GET"])
def health():
    try:
        load_models()
    except Exception as error:
        return jsonify({"status": "error", "error": str(error)}), 503

    return jsonify({"status": "ok"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(silent=True) or {}
        features = build_feature_frame(data)
        reg, clf = load_models()

        score = reg.predict(features)[0]
        result = clf.predict(features)[0]

        return jsonify({
            "predictedScore": float(score),
            "pass": int(result)
        })
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:
        return jsonify({"error": f"Prediction model is unavailable: {error}"}), 503

if __name__ == '__main__':
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        debug=os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true", "yes"},
    )
