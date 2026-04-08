from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

reg = joblib.load("reg.pkl")
clf = joblib.load("clf.pkl")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    features = np.array([[
        data["examScore"],
        data["assignmentScore"],
        data["seminarScore"],
        data["projectScore"],
        data["sportsScore"],
        data["hackathonScore"],
        data["attendance"]
    ]])

    score = reg.predict(features)[0]
    result = clf.predict(features)[0]

    return jsonify({
        "predictedScore": float(score),
        "pass": int(result)
    })

if __name__ == '__main__':
    app.run(port=8000, debug=True)
