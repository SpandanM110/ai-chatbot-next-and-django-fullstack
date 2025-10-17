@echo off
echo Starting AI Chatbot Application...
echo.

echo Starting Django Backend...
start "Django Backend" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"

echo.
echo Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Please wait 30-60 seconds for both servers to fully start.
echo Then open http://localhost:3000 in your browser.
echo.
echo Press any key to exit this window...
pause > nul
