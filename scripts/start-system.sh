#!/bin/bash

# Momentum System Startup Script
# This script starts all components and runs tests

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Print colored messages
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# ASCII Art Header
echo -e "${BLUE}"
cat << "EOF"
 __  __                            _                   
|  \/  | ___  _ __ ___   ___ _ __ | |_ _   _ _ __ ___  
| |\/| |/ _ \| '_ ` _ \ / _ \ '_ \| __| | | | '_ ` _ \ 
| |  | | (_) | | | | | |  __/ | | | |_| |_| | | | | | |
|_|  |_|\___/|_| |_| |_|\___|_| |_|\__|\__,_|_| |_| |_|
                                                        
EOF
echo -e "${NC}"
echo "Starting Momentum Development System..."
echo "======================================="
echo

# Configuration
GITHUB_APP_DIR="$HOME/Projects/momentum/github-app"
EXPERIMENT_FILE="$HOME/Projects/momentum/experiment.html"
SERVER_PORT=3000
WEBSOCKET_PORT=8765
CLAUDE_PORT=8766

# Process tracking
PIDS=()

# Cleanup function
cleanup() {
    print_warning "Shutting down Momentum..."
    for pid in "${PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null || true
        fi
    done
    exit
}

# Set up trap for cleanup on exit
trap cleanup EXIT INT TERM

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check if github-app directory exists
    if [ ! -d "$GITHUB_APP_DIR" ]; then
        print_error "GitHub App directory not found: $GITHUB_APP_DIR"
        exit 1
    fi
    
    # Check if experiment.html exists
    if [ ! -f "$EXPERIMENT_FILE" ]; then
        print_error "Experiment file not found: $EXPERIMENT_FILE"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    cd "$GITHUB_APP_DIR"
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi
}

# Check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|204"; then
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    
    return 1
}

# Start the main server
start_server() {
    print_status "Starting Momentum server..."
    
    # Check if port is already in use
    if check_port $SERVER_PORT; then
        print_warning "Port $SERVER_PORT is already in use. Attempting to stop existing process..."
        lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    cd "$GITHUB_APP_DIR"
    
    # Start server in background
    npm run dev > server.log 2>&1 &
    local server_pid=$!
    PIDS+=($server_pid)
    
    print_status "Waiting for server to start (PID: $server_pid)..."
    
    if wait_for_service "http://localhost:$SERVER_PORT/health"; then
        print_success "Server started successfully on port $SERVER_PORT"
    else
        print_error "Server failed to start - check server.log"
        exit 1
    fi
}

# Start Claude Code listener
start_claude_listener() {
    print_status "Starting Claude Code listener..."
    
    # Check if port is already in use
    if check_port $CLAUDE_PORT; then
        print_warning "Port $CLAUDE_PORT is already in use. Attempting to stop existing process..."
        lsof -ti:$CLAUDE_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    cd "$GITHUB_APP_DIR"
    
    # Start Claude listener in background
    npm run claude > claude.log 2>&1 &
    local claude_pid=$!
    PIDS+=($claude_pid)
    
    print_status "Waiting for Claude Code listener to start (PID: $claude_pid)..."
    
    if wait_for_service "http://localhost:$CLAUDE_PORT/health"; then
        print_success "Claude Code listener started successfully on port $CLAUDE_PORT"
    else
        print_error "Claude Code listener failed to start - check claude.log"
        exit 1
    fi
}

# Run connection tests
run_connection_tests() {
    print_status "Running connection tests..."
    echo
    
    # Test server health
    print_status "Testing server health endpoint..."
    local health_response=$(curl -s "http://localhost:$SERVER_PORT/health")
    if echo "$health_response" | grep -q '"status":"ok"'; then
        print_success "Server health check passed"
        echo "  Uptime: $(echo "$health_response" | grep -o '"uptime":[0-9.]*' | cut -d':' -f2)s"
    else
        print_error "Server health check failed"
    fi
    
    # Test Claude Code health
    print_status "Testing Claude Code health endpoint..."
    local claude_health=$(curl -s "http://localhost:$CLAUDE_PORT/health")
    if echo "$claude_health" | grep -q '"status":"ok"'; then
        print_success "Claude Code health check passed"
    else
        print_error "Claude Code health check failed"
    fi
    
    # Test diagnostic endpoints
    print_status "Testing diagnostic endpoints..."
    local diag_response=$(curl -s "http://localhost:$SERVER_PORT/diagnostics/status")
    if echo "$diag_response" | grep -q '"status":"ok"'; then
        print_success "Diagnostic endpoint working"
        
        # Check Claude connection from server
        local claude_status=$(echo "$diag_response" | grep -o '"claudeCode":{[^}]*}' | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$claude_status" = "connected" ]; then
            print_success "Server can connect to Claude Code"
        else
            print_warning "Server cannot connect to Claude Code (status: $claude_status)"
        fi
    else
        print_error "Diagnostic endpoint not working"
    fi
    
    echo
}

# Run message flow test
run_message_test() {
    print_status "Running message flow test..."
    
    # Send test message through the system
    local test_response=$(curl -s -X POST "http://localhost:$SERVER_PORT/diagnostics/test" \
        -H "Content-Type: application/json" \
        -d '{"message": "System startup test", "source": "startup-script"}')
    
    if echo "$test_response" | grep -q '"success":true'; then
        print_success "Test message sent successfully"
        
        # Extract trace information
        local test_id=$(echo "$test_response" | grep -o '"testId":"[^"]*"' | cut -d'"' -f4)
        print_status "Test ID: $test_id"
        
        # Check if Claude received it
        if echo "$test_response" | grep -q '"claudeResponse":{'; then
            print_success "Claude Code received and acknowledged the message"
        else
            print_warning "Claude Code did not respond to test message"
        fi
    else
        print_error "Failed to send test message"
    fi
    
    echo
}

# Open experiment page
open_experiment_page() {
    print_status "Opening experiment page..."
    
    # Detect OS and open browser
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$EXPERIMENT_FILE"
        print_success "Opened experiment.html in default browser"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open "$EXPERIMENT_FILE"
            print_success "Opened experiment.html in default browser"
        else
            print_warning "Please open $EXPERIMENT_FILE in your browser"
        fi
    else
        print_warning "Please open $EXPERIMENT_FILE in your browser"
    fi
}

# Display status summary
display_status() {
    echo
    echo "======================================="
    echo -e "${GREEN}Momentum System Status${NC}"
    echo "======================================="
    echo "Main Server:        http://localhost:$SERVER_PORT"
    echo "WebSocket:          ws://localhost:$WEBSOCKET_PORT"
    echo "Claude Code:        http://localhost:$CLAUDE_PORT"
    echo "Experiment Page:    $EXPERIMENT_FILE"
    echo
    echo "Diagnostic Tools:"
    echo "  System Status:    http://localhost:$SERVER_PORT/diagnostics/status"
    echo "  Connections:      http://localhost:$SERVER_PORT/diagnostics/connections"
    echo "  Message Traces:   http://localhost:$SERVER_PORT/diagnostics/traces"
    echo
    print_status "System is ready! Press Ctrl+C to shutdown."
    echo
}

# Monitor logs
monitor_logs() {
    print_status "Monitoring logs (last 5 lines from each service)..."
    echo
    
    while true; do
        # Clear previous output
        printf "\033[2J\033[H"
        
        echo "======================================="
        echo -e "${BLUE}Momentum System Monitor${NC}"
        echo "======================================="
        echo
        
        # Server logs
        echo -e "${YELLOW}[Server Logs]${NC}"
        tail -n 5 "$GITHUB_APP_DIR/server.log" 2>/dev/null || echo "No server logs yet"
        echo
        
        # Claude logs
        echo -e "${YELLOW}[Claude Code Logs]${NC}"
        tail -n 5 "$GITHUB_APP_DIR/claude.log" 2>/dev/null || echo "No Claude logs yet"
        echo
        
        # Quick stats
        echo -e "${YELLOW}[Quick Stats]${NC}"
        local stats=$(curl -s "http://localhost:$SERVER_PORT/diagnostics/status" 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "SSE Clients: $(echo "$stats" | grep -o '"sse":{"active":[0-9]*' | grep -o '[0-9]*$')"
            echo "WebSocket Clients: $(echo "$stats" | grep -o '"websocket":{"active":[0-9]*' | grep -o '[0-9]*$')"
            echo "Uptime: $(echo "$stats" | grep -o '"uptime":[0-9.]*' | cut -d':' -f2)s"
        else
            echo "Unable to fetch stats"
        fi
        echo
        echo "Press Ctrl+C to stop monitoring and shutdown"
        
        sleep 5
    done
}

# Main execution
main() {
    check_prerequisites
    install_dependencies
    
    # Start services
    start_server
    start_claude_listener
    
    # Run tests
    echo
    run_connection_tests
    run_message_test
    
    # Open browser
    open_experiment_page
    
    # Display status
    display_status
    
    # Option to monitor logs
    read -p "Would you like to monitor system logs? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        monitor_logs
    else
        print_status "System running in background. Press Ctrl+C to shutdown."
        # Keep script running
        while true; do
            sleep 1
        done
    fi
}

# Run main function
main