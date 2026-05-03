# 🚀 QUICK START GUIDE - MERN Stack

## ⚡ Super Fast Setup (3 Terminals Required)

### Prerequisites Check ✓

```bash
# Check if installed:
node --version    # Should be v14+
python --version  # Should be 3.8+
mongo --version   # Should be 4.4+
```

If any are missing, install them first!

---

## 📥 Step 1: Get Your Dataset

1. Download a fake news dataset from Kaggle (JSON format)
2. Save it as `dataset.json` in the `ml-service` folder

---

## 🐍 Step 2: Setup Python ML (Terminal 1)

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Train the model (IMPORTANT!)
python ml_model.py train dataset.json
```

**Wait for:** "Model trained! Accuracy: XX.XX%"

---

## 🟢 Step 3: Start Backend (Terminal 2 - NEW WINDOW)

```bash
cd backend

# Install packages
npm install

# Start server
npm start
```

**Wait for:** "Server running on port 5000"

**Keep this terminal open!**

---

## ⚛️ Step 4: Start Frontend (Terminal 3 - NEW WINDOW)

```bash
cd frontend

# Install packages
npm install

# Start React app
npm start
```

**Browser opens automatically at http://localhost:3000**

---

## 🎉 You're Done!

Your app is now running with:
- ✅ React Frontend on http://localhost:3000
- ✅ Express Backend on http://localhost:5000
- ✅ MongoDB storing data
- ✅ Python ML making predictions

---

## 🎯 Quick Test

1. Go to http://localhost:3000
2. Click "Try an example"
3. Click "Analyze News"
4. See the result!

---

## ⚠️ Common Issues

### "MongoDB connection error"
```bash
# Start MongoDB:
# Windows: Check Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongodb
```

### "Model files not found"
```bash
cd ml-service
python ml_model.py train dataset.json
```

### "Port 5000 already in use"
```bash
# Kill the process:
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -ti:5000 | xargs kill -9
```

### Python not found
```bash
# Update backend/.env:
# Windows: PYTHON_PATH=python
# Mac/Linux: PYTHON_PATH=python3
```

---

## 📊 What Each Part Does

**ML Service (Python):**
- Trains AI model on your dataset
- Makes predictions on news text

**Backend (Node.js):**
- REST API for frontend
- Stores data in MongoDB
- Calls Python for predictions

**Frontend (React):**
- Beautiful UI
- Shows predictions
- Displays history & stats

**MongoDB:**
- Stores all analyses
- Enables history tracking

---

## 🔄 Daily Usage

After initial setup, to run the app:

**Terminal 1:**
```bash
cd backend
npm start
```

**Terminal 2:**
```bash
cd frontend
npm start
```

That's it! (MongoDB and ML model already set up)

---

## 📈 Adding More Data

To retrain with new dataset:

```bash
cd ml-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python ml_model.py train new_dataset.json
# Restart backend
```

---

**Need help? Check the full README.md**
