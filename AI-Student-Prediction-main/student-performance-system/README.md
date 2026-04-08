#  Student Performance AI System

##  Project Structure

```
student-performance-system/
│
├── frontend/              # React App
├── backend/               # Node.js API
├── ai-service/            # Python AI model
├── dataset/               # Synthetic data
│
└── README.md
```

##  Quick Start

### 1. AI Service (Python)
```bash
cd ai-service
  

python -m venv venv
.\venv\Scripts\Activate
pip install flask
pip install flask pandas numpy scikit-learn joblib
python app.py
pip install -r requirements.txt

### 2. Backend (Node.js)
```bash
cd backend
npm init -y
npm install express mongoose cors axios
node server.js
```

### 3. Frontend (React)
```bash
cd frontend
npx create-react-app .
npm install axios
npm start
```

## 🏁 Features
- ✅ Student data management
- ✅ Performance scoring system
- ✅ Real-time leaderboard
- ✅ ML-powered prediction (Pass/Fail + Score)
- ✅ Full-stack MERN + Python AI integration

**MongoDB**: Run `mongod` on default port 27017
