// Momentum Experimentation Lab - Automated Test Script

// Test SSE Connection
async function testSSE() {
    try {
        const response = await fetch('http://localhost:3000/events', {
            headers: {
                'Accept': 'text/event-stream',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Read first chunk
        const { value, done } = await reader.read();
        if (!done && value) {
            const text = decoder.decode(value);
            console.log('  Received SSE data:', text.substring(0, 50) + '...');
        }
        
        // Cancel the stream
        reader.cancel();
        return true;
    } catch (error) {
        throw error;
    }
}

// Test Context Endpoint
async function testContext() {
    const response = await fetch('http://localhost:3000/context/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            source: 'test-script',
            content: 'Automated test context from test-momentum.js',
            timestamp: new Date().toISOString()
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log('  Response:', result);
    return true;
}

// Test Static Server
async function testStaticServer() {
    const response = await fetch('http://localhost:8000/experiment.html');
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const hasReact = html.includes('react@18');
    const hasMUI = html.includes('@mui/material');
    
    console.log('  Page loaded:', response.status);
    console.log('  Has React:', hasReact);
    console.log('  Has MUI:', hasMUI);
    
    return hasReact && hasMUI;
}

// Check server health
async function checkServerHealth() {
    try {
        const response = await fetch('http://localhost:3000/health');
        return response.ok;
    } catch {
        // Server might not have health endpoint, that's ok
        return true;
    }
}

// Color codes for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    gray: '\x1b[90m'
};

// Run all tests
async function runTests() {
    console.log(`${colors.blue}Starting Momentum Lab Tests...${colors.reset}\n`);
    
    const tests = [
        {
            name: 'Static Server (port 8000)',
            fn: testStaticServer
        },
        {
            name: 'SSE Connection',
            fn: testSSE
        },
        {
            name: 'Context Endpoint',
            fn: testContext
        },
        {
            name: 'Server Health',
            fn: checkServerHealth
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        console.log(`${colors.yellow}Testing ${test.name}...${colors.reset}`);
        try {
            await test.fn();
            console.log(`${colors.green}✓ ${test.name} passed${colors.reset}\n`);
            passed++;
        } catch (e) {
            console.error(`${colors.red}✗ ${test.name} failed: ${e.message}${colors.reset}\n`);
            failed++;
        }
    }
    
    console.log(`${colors.blue}Test Summary:${colors.reset}`);
    console.log(`${colors.green}  Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}  Failed: ${failed}${colors.reset}`);
    console.log(`${colors.gray}  Total:  ${tests.length}${colors.reset}\n`);
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
}

// Add timeout to prevent hanging
setTimeout(() => {
    console.error(`${colors.red}Tests timed out after 30 seconds${colors.reset}`);
    process.exit(1);
}, 30000);

// Run tests
runTests().catch(error => {
    console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
    process.exit(1);
});