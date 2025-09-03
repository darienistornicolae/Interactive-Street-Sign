#!/bin/bash

# Interactive Street Sign - Start Script
# This script starts both backend and frontend services

echo "🚀 Starting Interactive Street Sign..."
echo "====================================="

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    pkill -f "node server.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    echo "✅ Services stopped"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run ./setup.sh first"
    exit 1
fi

# Start backend server
echo "🔧 Starting backend server..."
pnpm run server &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if command -v curl &> /dev/null; then
    if ! curl -s http://localhost:3001/api/form-count > /dev/null; then
        echo "❌ Backend failed to start"
        cleanup
    fi
else
    echo "⚠️  curl not found, skipping backend health check"
    sleep 2
fi

echo "✅ Backend running on http://localhost:3001"

# Start frontend
echo "🌐 Starting frontend..."
pnpm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo "✅ Frontend running on http://localhost:5173"
echo ""
echo "🎉 All services are running!"
echo ""
echo "Access your app:"
echo "  Main page: http://localhost:5173"
echo "  Form: http://localhost:5173/harassment-form"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait
