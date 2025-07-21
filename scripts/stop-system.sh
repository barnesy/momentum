#!/bin/bash

# Momentum System Shutdown Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping Momentum System...${NC}"
echo

# Function to stop process on port
stop_port() {
    local port=$1
    local name=$2
    
    echo -n "Stopping $name on port $port... "
    
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        kill $pids 2>/dev/null
        sleep 1
        
        # Force kill if still running
        if lsof -ti:$port >/dev/null 2>&1; then
            kill -9 $(lsof -ti:$port) 2>/dev/null
        fi
        
        echo -e "${GREEN}Stopped${NC}"
    else
        echo -e "${YELLOW}Not running${NC}"
    fi
}

# Stop all services
stop_port 3000 "Momentum Server"
stop_port 8765 "WebSocket Server"
stop_port 8766 "Claude Code Listener"

echo
echo -e "${GREEN}Momentum System stopped successfully${NC}"

# Clean up log files if requested
read -p "Remove log files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f ~/Projects/momentum/github-app/server.log
    rm -f ~/Projects/momentum/github-app/claude.log
    echo -e "${GREEN}Log files removed${NC}"
fi