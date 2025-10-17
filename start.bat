@echo off
echo Starting AI Chatbot Application...

echo.
echo Starting Django Backend...
start "Django Backend" cmd /k "cd backend && python manage.py runserver"

echo.
echo Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
