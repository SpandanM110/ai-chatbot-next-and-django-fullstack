#!/bin/bash

# AI Chatbot Docker Build and Run Script

echo "🐳 Building AI Chatbot with Docker..."
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test the services
echo "🧪 Testing services..."

# Test backend
echo "Testing backend..."
if curl -f http://localhost:8000/api/chat/export-info/ > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "❌ Backend is not responding"
fi

# Test frontend
echo "Testing frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 AI Chatbot is now running in Docker!"
echo "======================================"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo ""
echo "To stop the services:"
echo "docker-compose down"
echo ""
echo "To view logs:"
echo "docker-compose logs -f"
echo ""
echo "To rebuild and restart:"
echo "docker-compose up --build -d"
