#!/bin/bash

echo "Starting AI Chatbot Application..."

echo ""
echo "Starting Django Backend..."
cd backend
python manage.py runserver &
BACKEND_PID=$!

echo ""
echo "Starting Next.js Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
