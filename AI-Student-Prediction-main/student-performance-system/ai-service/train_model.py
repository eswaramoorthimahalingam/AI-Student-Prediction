import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
import joblib

n = 2000

data = {
    "examScore": np.random.randint(40, 100, n),
    "assignmentScore": np.random.randint(40, 100, n),
    "seminarScore": np.random.randint(30, 100, n),
    "projectScore": np.random.randint(40, 100, n),
    "sportsScore": np.random.randint(0, 50, n),
    "hackathonScore": np.random.randint(0, 50, n),
    "attendance": np.random.randint(50, 100, n),
}

df = pd.DataFrame(data)

df["totalScore"] = (
    df["examScore"] * 0.4 +
    df["assignmentScore"] * 0.2 +
    df["projectScore"] * 0.2 +
    df["seminarScore"] * 0.1 +
    (df["sportsScore"] + df["hackathonScore"]) * 0.1
)

df["result"] = (df["totalScore"] >= 50).astype(int)

X = df.drop(["totalScore", "result"], axis=1)
y_reg = df["totalScore"]
y_clf = df["result"]

reg = RandomForestRegressor()
clf = RandomForestClassifier()

reg.fit(X, y_reg)
clf.fit(X, y_clf)

joblib.dump(reg, "reg.pkl")
joblib.dump(clf, "clf.pkl")

print("✅ Models trained")
