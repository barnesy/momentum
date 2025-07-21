# Momentum Experimentation Lab - Testing Guide

## Prerequisites
- Backend server running on port 3001 ✓
- Web server running on port 8000 ✓
- Chrome with Browser MCP extension installed ✓

## 1. Test SSE Connection (Server-Sent Events)

### Steps:
1. Navigate to http://localhost:8000/experiment.html
2. Click on "Connection" in the left sidebar
3. Click the "Connect" button
4. You should see:
   - Status changes to "Connected" (green chip)
   - "Connected to SSE server" message in the log
   - Real-time events appear as they're received

### Expected Results:
- Connection establishes within 1-2 seconds
- Events stream continuously
- Disconnecting stops the event stream

### Troubleshooting:
If connection fails, check:
```bash
curl http://localhost:3001/events
```

## 2. Test Context Sending

### Steps:
1. Click on "Context" in the left sidebar
2. Type a message in the text area (e.g., "Test context from experiment page")
3. Click "Send Context"
4. Try the quick action buttons

### Expected Results:
- Text field clears after successful send
- No errors in browser console
- Context received by backend server

### Verify Backend Receipt:
```bash
# Check server logs
tail -f github-app/server.log
```

## 3. Test Theme Editor

### Steps:
1. Click on "Theme Editor" in the left sidebar
2. Try these changes:
   - Toggle between Light/Dark mode
   - Change Primary color
   - Adjust Border Radius slider
   - Modify Typography sizes

### Expected Results:
- All UI components update in real-time
- Changes persist after page reload
- Live preview panel shows all changes immediately

### Test Persistence:
1. Make several theme changes
2. Refresh the page (F5)
3. Theme changes should be retained

## 4. Test GitHub Integration

### Steps:
1. Click on "GitHub" in the left sidebar
2. Enter a GitHub repository URL
3. Click "Connect Repository"

### Expected Results:
- Webhook status indicator
- Connection confirmation

## 5. Test AI Integration

### Steps:
1. Click on "AI Integration" in the left sidebar
2. Enter a prompt
3. Click "Send to AI"

### Expected Results:
- Loading state while processing
- Response appears below

## 6. Test Performance Monitoring

### Steps:
1. Click on "Performance" in the left sidebar
2. Check the metrics dashboard
3. Change timeframe dropdown

### Expected Results:
- Metrics display with trend indicators
- Timeframe changes update the view

## 7. Test Error Handling

### Steps:
1. Stop the backend server:
   ```bash
   # Find and kill the server process
   ps aux | grep "node.*server.js" | grep -v grep
   kill [PID]
   ```
2. Try to connect SSE
3. Try to send context

### Expected Results:
- Graceful error messages
- UI remains responsive
- Clear error states

## 8. Test Mobile Responsiveness

### Steps:
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes

### Expected Results:
- Drawer becomes temporary on mobile
- All features remain accessible
- Touch interactions work properly

## Automated Test Script

Create this file as `test-momentum.js`:

```javascript
// Test SSE Connection
async function testSSE() {
    const response = await fetch('http://localhost:3001/events', {
        headers: {
            'Accept': 'text/event-stream',
        }
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    const result = await reader.read();
    console.log('SSE Test:', decoder.decode(result.value));
    return response.ok;
}

// Test Context Endpoint
async function testContext() {
    const response = await fetch('http://localhost:3001/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            source: 'test-script',
            content: 'Automated test context',
            timestamp: new Date().toISOString()
        })
    });
    
    console.log('Context Test:', response.status);
    return response.ok;
}

// Run all tests
async function runTests() {
    console.log('Starting Momentum Lab Tests...\n');
    
    try {
        console.log('1. Testing SSE Connection...');
        await testSSE();
        console.log('✓ SSE Connection works\n');
    } catch (e) {
        console.error('✗ SSE Connection failed:', e.message);
    }
    
    try {
        console.log('2. Testing Context Endpoint...');
        await testContext();
        console.log('✓ Context endpoint works\n');
    } catch (e) {
        console.error('✗ Context endpoint failed:', e.message);
    }
}

runTests();
```

Run with: `node test-momentum.js`

## Chrome Extension Testing

To verify the Browser MCP extension is working:

1. Click the extension icon in Chrome
2. Check connection status
3. Try browser automation commands

## Success Criteria

✅ All connections establish successfully
✅ Real-time updates work (SSE, theme changes)
✅ Data persists correctly (theme, settings)
✅ Error states are handled gracefully
✅ UI is responsive across devices
✅ No console errors during normal operation