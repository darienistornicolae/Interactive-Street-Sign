#!/bin/bash

set -e

echo "🚀 Interactive Street Sign - Setup Script"
echo "=========================================="

check_prerequisites() {
    local missing_deps=()
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo "❌ Missing prerequisites: ${missing_deps[*]}"
        echo ""
        echo "Please install the following before running this script:"
        echo ""
        
        if [[ " ${missing_deps[*]} " =~ " Node.js " ]]; then
            echo "📦 Node.js (v18 or higher):"
            echo "   • Visit: https://nodejs.org/"
            echo "   • Or use a package manager:"
            echo "     - macOS: brew install node"
            echo "     - Ubuntu/Debian: sudo apt install nodejs npm"
            echo "     - Windows: Download from nodejs.org"
            echo ""
        fi
        
        if [[ " ${missing_deps[*]} " =~ " npm " ]] && [[ ! " ${missing_deps[*]} " =~ " Node.js " ]]; then
            echo "📦 npm (usually comes with Node.js):"
            echo "   • Try reinstalling Node.js from https://nodejs.org/"
            echo "   • Or install separately: sudo apt install npm"
            echo ""
        fi
        
        echo "After installation, run this script again:"
        echo "  ./setup.sh"
        echo ""
        exit 1
    fi
}

echo "🔍 Checking prerequisites..."
check_prerequisites

echo "✅ Node.js $(node --version) is installed"
echo "✅ npm $(npm --version) is installed"

if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm package manager..."
    npm install -g pnpm
    echo "✅ pnpm installed successfully"
else
    echo "✅ pnpm $(pnpm --version) is already installed"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating template..."
    cat > .env << EOF
# Database configuration
# Replace with your actual Prisma Accelerate URL
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
EOF
    echo "⚠️  Please update .env with your actual DATABASE_URL"
    echo "   You can get this from Prisma Accelerate dashboard"
else
    echo "✅ .env file exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate --no-engine

# Push database schema
echo "🗄️  Setting up database..."
npx prisma db push

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your DATABASE_URL"
echo "2. Start the backend: pnpm run server"
echo "3. Start the frontend: pnpm run dev"
echo ""
echo "Access your app at:"
echo "  Main page: http://localhost:5173"
echo "  Form: http://localhost:5173/harassment-form"
echo ""
echo "For network access, find your IP with: ifconfig | grep 'inet ' | grep -v 127.0.0.1"
echo ""
