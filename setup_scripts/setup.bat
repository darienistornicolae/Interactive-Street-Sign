@echo off
setlocal enabledelayedexpansion

echo 🚀 Interactive Street Sign - Setup Script (Windows)
echo =====================================================

echo 🔍 Checking prerequisites...

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo.
    echo Please install Node.js (v18 or higher):
    echo   • Visit: https://nodejs.org/
    echo   • Download the Windows installer
    echo   • Restart your command prompt after installation
    echo.
    echo After installation, run this script again:
    echo   setup.bat
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js !NODE_VERSION! is installed
)

:: Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed
    echo.
    echo npm should come with Node.js. Please reinstall Node.js from:
    echo   https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm !NPM_VERSION! is installed
)

:: Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing pnpm package manager...
    npm install -g pnpm
    if errorlevel 1 (
        echo ❌ Failed to install pnpm
        pause
        exit /b 1
    )
    echo ✅ pnpm installed successfully
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
    echo ✅ pnpm !PNPM_VERSION! is already installed
)

:: Install dependencies
echo 📦 Installing dependencies...
pnpm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

:: Check if .env file exists
if not exist .env (
    echo ❌ .env file not found. Creating template...
    (
        echo # Database configuration
        echo # Replace with your actual Prisma Accelerate URL
        echo DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
    ) > .env
    echo ⚠️  Please update .env with your actual DATABASE_URL
    echo    You can get this from Prisma Accelerate dashboard
) else (
    echo ✅ .env file exists
)

:: Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate --no-engine
if errorlevel 1 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

:: Push database schema
echo 🗄️  Setting up database...
npx prisma db push
if errorlevel 1 (
    echo ❌ Failed to setup database
    pause
    exit /b 1
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your DATABASE_URL
echo 2. Start the application: start.bat
echo.
echo Access your app at:
echo   Main page: http://localhost:5173
echo   Form: http://localhost:5173/harassment-form
echo.
echo For network access, find your IP with: ipconfig
echo.
pause
