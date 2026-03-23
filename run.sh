#!/bin/bash

echo "===================================="
echo "Event Booking System - Backend"
echo "===================================="
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo ""
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo ""
echo "Installing/Updating dependencies..."
pip install -r requirements.txt

echo ""
echo "Starting FastAPI server..."
echo "Server will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
