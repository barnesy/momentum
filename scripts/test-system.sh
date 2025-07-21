#!/bin/bash

# Momentum System Test Suite
# Run this after starting the system with start-system.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BLUE='\033[0;34m'

# Test results
PASSED=0
FAILED=0

# Print functions
print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Configuration
SERVER_URL="http://localhost:3000"
CLAUDE_URL="http://localhost:8766"

# Header
echo -e "${BLUE}"
cat << "EOF"
 __  __                            _                   
|  \/  | ___  _ __ ___   ___ _ __ | |_ _   _ _ __ ___  
| |\/| |/ _ \| '_ ` _ \ / _ \ '_ \| __| | | | '_ ` _ \ 
| |  | | (_) | | | | | |  __/ | | | |_| |_| | | | | | |
|_|  |_|\___/|_| |_| |_|\___|_| |_|\__|\__,_|_| |_| |_|
                                                        
            T E S T   S U I T E
EOF
echo -e "${NC}"
echo "Running Momentum System Tests..."
echo "================================"
echo

# Test 1: Basic connectivity
test_basic_connectivity() {
    print_test "Basic Connectivity"
    
    # Test server
    if curl -f -s "$SERVER_URL/health" > /dev/null; then
        print_pass "Server is accessible"
    else
        print_fail "Server is not accessible"
        return 1
    fi
    
    # Test Claude Code
    if curl -f -s "$CLAUDE_URL/health" > /dev/null; then
        print_pass "Claude Code listener is accessible"
    else
        print_fail "Claude Code listener is not accessible"
        return 1
    fi
    
    echo
}

# Test 2: Health endpoints
test_health_endpoints() {
    print_test "Health Endpoints"
    
    # Server health
    local server_health=$(curl -s "$SERVER_URL/health")
    if echo "$server_health" | jq -e '.status == "ok"' > /dev/null 2>&1; then
        print_pass "Server health check returns OK"
        print_info "Server uptime: $(echo "$server_health" | jq -r '.uptime')s"
    else
        print_fail "Server health check failed"
    fi
    
    # Claude health
    local claude_health=$(curl -s "$CLAUDE_URL/health")
    if echo "$claude_health" | jq -e '.status == "ok"' > /dev/null 2>&1; then
        print_pass "Claude Code health check returns OK"
        print_info "Messages received: $(echo "$claude_health" | jq -r '.messagesReceived')"
    else
        print_fail "Claude Code health check failed"
    fi
    
    echo
}

# Test 3: Diagnostic endpoints
test_diagnostic_endpoints() {
    print_test "Diagnostic Endpoints"
    
    # System diagnostics
    local diag=$(curl -s "$SERVER_URL/diagnostics/status")
    if [ $? -eq 0 ] && echo "$diag" | jq -e '.status == "ok"' > /dev/null 2>&1; then
        print_pass "Diagnostic status endpoint working"
        
        # Check Claude connection from server perspective
        local claude_status=$(echo "$diag" | jq -r '.claudeCode.status')
        if [ "$claude_status" = "connected" ]; then
            print_pass "Server reports Claude Code as connected"
        else
            print_fail "Server reports Claude Code as: $claude_status"
        fi
    else
        print_fail "Diagnostic status endpoint failed"
    fi
    
    # Connections endpoint
    if curl -f -s "$SERVER_URL/diagnostics/connections" > /dev/null; then
        print_pass "Connections endpoint accessible"
    else
        print_fail "Connections endpoint not accessible"
    fi
    
    # Messages endpoint
    if curl -f -s "$SERVER_URL/diagnostics/messages" > /dev/null; then
        print_pass "Messages endpoint accessible"
    else
        print_fail "Messages endpoint not accessible"
    fi
    
    echo
}

# Test 4: Message flow
test_message_flow() {
    print_test "Message Flow Test"
    
    # Send test message
    local test_payload='{"message": "Automated test message", "timestamp": '$(date +%s)'000}'
    local response=$(curl -s -X POST "$SERVER_URL/diagnostics/test" \
        -H "Content-Type: application/json" \
        -d "$test_payload")
    
    if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
        print_pass "Test message sent successfully"
        
        local test_id=$(echo "$response" | jq -r '.testId')
        print_info "Test ID: $test_id"
        
        # Check trace
        local trace_count=$(echo "$response" | jq '.message.trace | length')
        print_info "Message passed through $trace_count hops"
        
        # Check if Claude responded
        if echo "$response" | jq -e '.claudeResponse != null' > /dev/null 2>&1; then
            print_pass "Claude Code acknowledged the message"
        else
            print_fail "Claude Code did not respond"
        fi
    else
        print_fail "Failed to send test message"
    fi
    
    echo
}

# Test 5: Error reporting
test_error_reporting() {
    print_test "Error Reporting"
    
    # Send error to Claude
    local error_payload='{
        "type": "test-error",
        "error": {
            "message": "Test error from automated tests",
            "stack": "Error: Test error\n    at test_suite.sh:1:1",
            "timestamp": '$(date +%s)'000
        }
    }'
    
    local error_response=$(curl -s -X POST "$CLAUDE_URL/report" \
        -H "Content-Type: application/json" \
        -d "$error_payload")
    
    if echo "$error_response" | jq -e '.success == true' > /dev/null 2>&1; then
        print_pass "Error report sent to Claude Code"
        print_info "Acknowledged: $(echo "$error_response" | jq -r '.acknowledged')"
    else
        print_fail "Failed to send error report"
    fi
    
    # Check if error appears in server
    sleep 1
    local server_errors=$(curl -s "$SERVER_URL/diagnostics/messages" | jq '.messages[] | select(.type | contains("error"))')
    if [ -n "$server_errors" ]; then
        print_pass "Errors are being tracked by server"
    else
        print_info "No errors found in server (this might be normal)"
    fi
    
    echo
}

# Test 6: Performance metrics
test_performance() {
    print_test "Performance Metrics"
    
    # Get message statistics
    local messages=$(curl -s "$SERVER_URL/diagnostics/messages")
    if [ $? -eq 0 ]; then
        local total=$(echo "$messages" | jq -r '.total')
        print_info "Total messages tracked: $total"
        
        if echo "$messages" | jq -e '.statistics' > /dev/null 2>&1; then
            print_pass "Message statistics available"
            
            # Check for bottlenecks
            local bottlenecks=$(echo "$messages" | jq '.bottlenecks | length')
            if [ "$bottlenecks" -gt 0 ]; then
                print_info "Found $bottlenecks bottlenecks"
            else
                print_pass "No bottlenecks detected"
            fi
        else
            print_fail "Message statistics not available"
        fi
    else
        print_fail "Could not retrieve message data"
    fi
    
    echo
}

# Test 7: Stress test (optional)
stress_test() {
    print_test "Stress Test (sending 50 messages)"
    
    local success=0
    local failed=0
    
    for i in {1..50}; do
        local response=$(curl -s -X POST "$SERVER_URL/diagnostics/test" \
            -H "Content-Type: application/json" \
            -d '{"message": "Stress test message '$i'"}' \
            -w "\n%{http_code}")
        
        local http_code=$(echo "$response" | tail -n1)
        if [ "$http_code" = "200" ]; then
            ((success++))
        else
            ((failed++))
        fi
        
        # Small delay to avoid overwhelming
        sleep 0.1
    done
    
    print_info "Successfully sent: $success/50"
    if [ $failed -eq 0 ]; then
        print_pass "All stress test messages sent successfully"
    else
        print_fail "$failed messages failed"
    fi
    
    echo
}

# Summary function
print_summary() {
    echo "================================"
    echo -e "${BLUE}Test Summary${NC}"
    echo "================================"
    echo -e "Passed: ${GREEN}$PASSED${NC}"
    echo -e "Failed: ${RED}$FAILED${NC}"
    echo
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}All tests passed! 🎉${NC}"
        return 0
    else
        echo -e "${RED}Some tests failed. Please check the output above.${NC}"
        return 1
    fi
}

# Main execution
main() {
    # Check if jq is installed (needed for JSON parsing)
    if ! command -v jq &> /dev/null; then
        print_info "Installing jq for JSON parsing..."
        if [[ "$OSTYPE" == "darwin"* ]] && command -v brew &> /dev/null; then
            brew install jq
        else
            echo "Please install jq manually: https://stedolan.github.io/jq/download/"
            exit 1
        fi
    fi
    
    # Run tests
    test_basic_connectivity
    test_health_endpoints
    test_diagnostic_endpoints
    test_message_flow
    test_error_reporting
    test_performance
    
    # Ask about stress test
    read -p "Run stress test? This will send 50 messages rapidly. (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stress_test
    fi
    
    # Print summary
    print_summary
}

# Run tests
main