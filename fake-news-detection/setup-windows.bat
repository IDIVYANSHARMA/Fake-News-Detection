@echo off
echo ==========================================
echo Fake News Detection - MERN Stack Setup
echo ==========================================
echo.

echo [1/4] Setting up Python ML Service...
cd ml-service

echo Creating Python virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo Downloading ML models and NLTK data...
python setup_ml.py

echo.
echo Checking for dataset.json...
if exist dataset.json (
    echo Dataset found! Training ML model...
    python ml_model.py train dataset.json
) else (
    echo.
    echo WARNING: dataset.json not found!
    echo Please add your Kaggle dataset as dataset.json
    echo You can use dataset_sample.json as reference
    echo.
)

cd ..

echo.
echo [2/4] Setting up Node.js Backend...
cd backend

echo Installing backend dependencies...
call npm install

cd ..

echo.
echo [3/4] Setting up React Frontend...
cd frontend

echo Installing frontend dependencies...
call npm install

cd ..

echo.
echo [4/4] Setup Complete!
echo.
echo ==========================================
echo Next Steps:
echo ==========================================
echo 1. Make sure MongoDB is running
echo 2. Add dataset.json to ml-service folder (if not done)
echo 3. Run start-windows.bat to launch the app
echo ==========================================
echo.
pause
