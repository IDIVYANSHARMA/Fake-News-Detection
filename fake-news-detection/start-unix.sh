#!/bin/bash

echo "=========================================="
echo "Starting Fake News Detection - MERN Stack"
echo "=========================================="
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  WARNING: MongoDB doesn't appear to be running!"
    echo "Please start MongoDB first:"
    echo "  Mac: brew services start mongodb-community"
    echo "  Linux: sudo systemctl start mongodb"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "[1/2] Starting Backend Server..."
cd backend
npm start &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

cd ..

sleep 5

echo ""
echo "[2/2] Starting Frontend Server..."
cd frontend
npm start &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

cd ..

echo ""
echo "=========================================="
echo "All services are running!"
echo "=========================================="
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "=========================================="
echo ""

# Trap Ctrl+C and kill both processes
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Wait for user interrupt
wait
