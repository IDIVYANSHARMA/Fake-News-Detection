@echo off
echo ==========================================
echo Starting Fake News Detection - MERN Stack
echo ==========================================
echo.

echo [1/3] Starting ML Service...
start "ML Service" cmd /k "cd ml-service && venv\Scripts\activate && python -m api.main"

timeout /t 5

echo [2/3] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 5

echo [3/3] Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo All services are starting!
echo ==========================================
echo.
echo ML Service: http://localhost:8000
echo Backend:    http://localhost:5000
echo Frontend:   http://localhost:3000
echo.
echo Make sure MongoDB is running!
echo.
echo Press any key to exit this window...
echo (Keep other windows open)
echo ==========================================
pause
