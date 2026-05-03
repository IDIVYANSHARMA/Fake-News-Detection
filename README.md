# 📰 Fake News Detection - MERN Stack + Python ML

A full-stack application using **MongoDB + Express.js + React + Node.js (MERN)** with **Python Machine Learning** for fake news detection.

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 3000)
│   (Tailwind)    │
└────────┬────────┘
         │
         ↓ HTTP/REST API
┌─────────────────┐
│ Express Backend │ (Port 5000)
│   (Node.js)     │
└────┬────────────┘
     │             │
     ↓             ↓
┌─────────┐   ┌──────────────┐
│ MongoDB │   │ Python ML    │
│ Database│   │ Service      │
└─────────┘   └──────────────┘
```

## 🎯 Features

✅ **Full MERN Stack Implementation**
- MongoDB for data persistence
- Express.js REST API
- React with Tailwind CSS
- Node.js backend server

✅ **Python Machine Learning**
- TF-IDF Vectorization
- Passive Aggressive Classifier
- 85-95% accuracy (dataset dependent)

✅ **Advanced Features**
- Analysis history tracking
- Real-time statistics dashboard
- Confidence scores
- Beautiful responsive UI
- MongoDB data persistence

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

### Installing MongoDB

**Windows:**
1. Download MongoDB Community Server
2. Install and start MongoDB service
3. Default connection: `mongodb://localhost:27017`

**Mac (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## 🚀 Quick Setup

### Step 1: Download Your Dataset

1. Go to Kaggle and download a fake news detection dataset (JSON format)
2. Supported formats:
   - Text columns: `text`, `title`, `article`, `content`, `news`, `headline`
   - Label columns: `label`, `is_fake`, `fake`, `class`, `target`
   - Label values: `REAL/FAKE`, `Real/Fake`, `0/1`

3. **Save it as `dataset.json`** in the `ml-service` folder

### Step 2: Setup ML Service (Python)

```bash
# Navigate to ml-service folder
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model (IMPORTANT!)
python ml_model.py train dataset.json

# You should see output like:
# Dataset loaded: 1000 articles
# Model trained! Accuracy: 92.5%
```

### Step 3: Setup Backend (Node.js/Express)

Open a **NEW terminal window**:

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server
npm start

# Server should start on http://localhost:5000
```

### Step 4: Setup Frontend (React)

Open **ANOTHER NEW terminal window**:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start React app
npm start

# Browser should open at http://localhost:3000
```

## 📁 Project Structure

```
fake-news-detection/
│
├── ml-service/                  # Python ML Service
│   ├── ml_model.py             # ML model training & prediction
│   ├── requirements.txt        # Python dependencies
│   ├── dataset.json           # Your dataset (you provide)
│   ├── dataset_sample.json    # Sample format
│   ├── fake_news_model.pkl    # Trained model (generated)
│   └── tfidf_vectorizer.pkl   # Vectorizer (generated)
│
├── backend/                     # Node.js/Express Server
│   ├── server.js               # Main Express server
│   ├── package.json            # Node dependencies
│   └── .env                    # Environment variables
│
└── frontend/                    # React Application
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js              # Main React component
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## 🔧 API Endpoints

### Backend API (Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| POST | `/api/news/analyze` | Analyze news article |
| GET | `/api/history` | Get analysis history |
| GET | `/api/stats` | Get statistics |
| DELETE | `/api/history/:id` | Delete specific analysis |
| DELETE | `/api/history` | Clear all history |
| GET | `/api/health` | Health check |

### Example Request

```javascript
// Analyze news
POST http://localhost:5000/api/news/analyze
Content-Type: application/json

{
  "text": "Your news article text here..."
}

// Response
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "prediction": "Fake",
    "confidence": 0.85,
    "isFake": true,
    "textLength": 150,
    "analyzedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🎮 How to Use

1. **Make sure all three services are running:**
   - MongoDB (background service)
   - Backend (Port 5000)
   - Frontend (Port 3000)

2. **Open browser** and go to `http://localhost:3000`

3. **Three Tabs Available:**
   - **Analyze:** Paste news text and get predictions
   - **History:** View all past analyses
   - **Statistics:** See overall statistics

4. **Test it out:**
   - Use example buttons or paste your own news
   - Click "Analyze News"
   - View results with confidence scores

## 🔄 Training with New Dataset

To retrain the model with a new dataset:

```bash
cd ml-service

# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Train with new dataset
python ml_model.py train your_new_dataset.json

# Restart backend server to use new model
```

## ⚡ Environment Variables

Edit `backend/.env` to configure:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/fake-news-detection

# Server Port
PORT=5000

# Python Path
PYTHON_PATH=python  # Use 'python3' on Mac/Linux if needed

# Node Environment
NODE_ENV=development
```

## 🆘 Troubleshooting

### MongoDB Connection Issues

**Error: "MongoNetworkError"**
```bash
# Make sure MongoDB is running:
# Windows: Check Services for MongoDB
# Mac: brew services list
# Linux: sudo systemctl status mongodb
```

### Backend Can't Call Python

**Error: "Python process exited with code 1"**
```bash
# Check Python path in backend/.env
# Windows: PYTHON_PATH=python
# Mac/Linux: PYTHON_PATH=python3

# Make sure ML model is trained:
cd ml-service
python ml_model.py train dataset.json
```

### Frontend Can't Connect to Backend

**Error: "Network Error"**
- Verify backend is running on port 5000
- Check for CORS errors in browser console
- Ensure `API_URL` in `App.js` is correct

### Port Already in Use

```bash
# Kill process on port (if needed)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Model Not Found

```bash
# Train the model first
cd ml-service
python ml_model.py train dataset.json
```

## 📊 Dataset Requirements

- **Format:** JSON array
- **Minimum size:** 100+ samples (1000+ recommended)
- **Balance:** Roughly equal REAL/FAKE samples
- **Quality:** Full article text preferred over headlines

### Example Dataset Format

```json
[
  {
    "text": "News article content here...",
    "label": "REAL"
  },
  {
    "text": "Another article...",
    "label": "FAKE"
  }
]
```

## 🛠️ Technology Stack

### Frontend
- React 18
- Tailwind CSS
- Axios
- Modern UI/UX

### Backend
- Node.js
- Express.js
- Mongoose (MongoDB ODM)
- Child Process (for Python integration)

### Database
- MongoDB (NoSQL)
- Stores analysis history
- Real-time statistics

### Machine Learning
- Python 3
- Scikit-learn
- Pandas
- TF-IDF Vectorization
- Passive Aggressive Classifier

## 🔐 MongoDB Schema

```javascript
{
  text: String,              // News article text
  prediction: String,        // "Real" or "Fake"
  confidence: Number,        // ML confidence score
  isFake: Boolean,          // True if fake
  textLength: Number,       // Character count
  analyzedAt: Date,         // Timestamp
  ipAddress: String,        // User IP
  userAgent: String         // Browser info
}
```

## 📈 Performance Tips

1. **Use a large, quality dataset** (1000+ samples)
2. **Balance your dataset** (50% real, 50% fake)
3. **Include full article text**, not just headlines
4. **Clean your data** before training
5. **Retrain periodically** with new data

## 🚀 Deployment

### Backend + ML Service
- Deploy on: Heroku, AWS EC2, DigitalOcean
- Use MongoDB Atlas for cloud database
- Set environment variables

### Frontend
- Deploy on: Vercel, Netlify, GitHub Pages
- Update API_URL to production backend
- Build: `npm run build`

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions welcome! Areas to improve:
- Additional ML models
- Better UI/UX
- Real-time updates
- User authentication
- API rate limiting

## 📞 Support

If you encounter issues:
1. Check all services are running
2. Verify MongoDB connection
3. Ensure ML model is trained
4. Check console logs for errors
5. Review this README carefully

---

**Built with ❤️ using MERN Stack + Python ML**
