#!/bin/bash

# Smart URL Shortener Setup Script
echo "🔗 Setting up Smart URL Shortener..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your MongoDB password!"
    echo "   Replace 'YOUR_PASSWORD_HERE' with your actual password"
else
    echo "✅ .env file already exists"
fi

# Check for Docker
if command -v docker &> /dev/null; then
    echo "🐳 Docker is installed"
    
    # Check for Docker Compose
    if command -v docker-compose &> /dev/null; then
        echo "🐳 Docker Compose is installed"
        echo ""
        echo "🚀 You can now start the application with:"
        echo "   docker-compose up -d"
        echo ""
        echo "📊 Access your application at:"
        echo "   • Main app: http://localhost:5000"
        echo "   • MongoDB Express: http://localhost:8081 (dev mode)"
        echo "   • Health check: http://localhost:5000/health"
    else
        echo "❌ Docker Compose not found. Please install Docker Compose."
    fi
else
    echo "❌ Docker not found. Installing dependencies for local development..."
    npm install
    echo ""
    echo "🚀 You can now start the application with:"
    echo "   npm start (production)"
    echo "   npm run dev (development)"
fi

echo ""
echo "📚 For more information, see README.md"
echo "🔧 Need help? Check the troubleshooting section in README.md"