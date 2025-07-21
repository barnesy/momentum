#!/bin/bash

# Start both the main server and error reporter for Claude Code

echo "Starting Momentum with Claude Code error reporting..."

# Start error reporter in background
echo "Starting error reporter on port 8766..."
node src/error-reporter.js &
ERROR_REPORTER_PID=$!

# Give it a moment to start
sleep 1

# Start main server
echo "Starting main server..."
npm run dev

# Cleanup on exit
trap "kill $ERROR_REPORTER_PID 2>/dev/null" EXIT