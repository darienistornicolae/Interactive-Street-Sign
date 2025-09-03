@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Interactive Street Sign (Windows)...
echo ===============================================

:: Check if .env exists
if not exist .env (
    echo ❌ .env file not found. Please run setup.bat first
    pause
    exit /b 1
)

:: Function to cleanup processes (will be called on exit)
set "cleanup_needed=false"

:: Start backend server
echo 🔧 Starting backend server...
start /b "" pnpm run server
if errorlevel 1 (
    echo ❌ Failed to start backend server
    pause
    exit /b 1
)

:: Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: Check if backend is running (using PowerShell for HTTP check)
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3001/api/form-count' -UseBasicParsing -TimeoutSec 5 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend failed to start properly
    echo    Check if port 3001 is available
    taskkill /f /im node.exe >nul 2>&1
    pause
    exit /b 1
)

echo ✅ Backend running on http://localhost:3001

:: Start frontend
echo 🌐 Starting frontend...
start /b "" pnpm run dev
if errorlevel 1 (
    echo ❌ Failed to start frontend
    taskkill /f /im node.exe >nul 2>&1
    pause
    exit /b 1
)

:: Wait for frontend to start
echo Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul

echo ✅ Frontend running on http://localhost:5173
echo.
echo 🎉 All services are running!
echo.
echo Access your app:
echo   Main page: http://localhost:5173
echo   Form: http://localhost:5173/harassment-form
echo.
echo Press Ctrl+C to stop all services, or close this window
echo.

:: Keep the window open and handle cleanup
:loop
timeout /t 1 >nul
goto loop
