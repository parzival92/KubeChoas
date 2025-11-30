#!/bin/bash
set -e

echo "🚀 Starting KubeChaos E2E Test"
echo "=============================="

# 1. Start Backend in background
echo "📦 Starting Backend..."
cd backend
python3 -m uvicorn main:app --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 5

# 2. Run CLI Commands
echo ""
echo "🧪 Testing CLI Commands..."

echo "1. Listing Scenarios:"
python3 backend/cli.py list

echo ""
echo "2. Checking Initial Status:"
python3 backend/cli.py status

echo ""
echo "3. Starting 'pod-kill-basic' Scenario:"
python3 backend/cli.py start pod-kill-basic

echo ""
echo "4. Checking Status (Should show active chaos):"
python3 backend/cli.py status

echo ""
echo "5. Getting Hint:"
python3 backend/cli.py hint

echo ""
echo "6. Stopping Chaos:"
python3 backend/cli.py stop

echo ""
echo "7. Final Status Check:"
python3 backend/cli.py status

# 3. Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $BACKEND_PID

echo ""
echo "✅ E2E Test Completed Successfully!"
