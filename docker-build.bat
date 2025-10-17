@echo off
echo 🐳 Building AI Chatbot with Docker...
echo ======================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Build and start services
echo 📦 Building Docker images...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps

REM Test the services
echo 🧪 Testing services...

REM Test backend
echo Testing backend...
curl -f http://localhost:8000/api/chat/export-info/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running at http://localhost:8000
) else (
    echo ❌ Backend is not responding
)

REM Test frontend
echo Testing frontend...
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running at http://localhost:3000
) else (
    echo ❌ Frontend is not responding
)

echo.
echo 🎉 AI Chatbot is now running in Docker!
echo ======================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
echo To stop the services:
echo docker-compose down
echo.
echo To view logs:
echo docker-compose logs -f
echo.
echo To rebuild and restart:
echo docker-compose up --build -d
echo.
pause
