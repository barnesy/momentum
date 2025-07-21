import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8766');

ws.on('open', () => {
  console.log('Connected to error logger');
  
  // Send a test error
  ws.send(JSON.stringify({
    type: 'browser-error',
    error: {
      message: 'Test error from Node.js script',
      source: 'test-script',
      timestamp: Date.now()
    },
    url: 'http://test.local',
    userAgent: 'Node.js Test',
    timestamp: Date.now()
  }));
  
  console.log('Test error sent');
  
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 1000);
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});