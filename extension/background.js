let ws = null;
let errorReporterWs = null;
let context = {
  connected: false,
  lastUpdate: null,
  metrics: {},
  patterns: [],
  events: []
};

// Connect to GitHub App WebSocket
function connectWebSocket() {
  // Get the configured endpoint (default to localhost for development)
  const wsUrl = 'ws://localhost:8765'; // In production, use wss://your-app.workers.dev/ws
  
  try {
    ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('Connected to Living Context server');
    context.connected = true;
    updateBadge('connected');
    
    // Notify all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url?.includes('github.com')) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'connection-status',
            connected: true
          });
        }
      });
    });
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleContextUpdate(data);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket closed, reconnecting in 5s...');
    context.connected = false;
    updateBadge('disconnected');
    setTimeout(connectWebSocket, 5000);
  };
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
    console.log('Will retry in 5s...');
    setTimeout(connectWebSocket, 5000);
  }
}

// Handle context updates from server
function handleContextUpdate(data) {
  context.lastUpdate = Date.now();
  
  switch (data.type) {
    case 'context-sync':
      context = { ...context, ...data.context };
      break;
      
    case 'context-update':
      context.events.unshift({
        event: data.event,
        timestamp: data.timestamp,
        latency: data.latency
      });
      
      if (context.events.length > 100) {
        context.events = context.events.slice(0, 100);
      }
      
      if (data.patterns?.length > 0) {
        context.patterns = [...data.patterns, ...context.patterns].slice(0, 50);
      }
      
      if (data.metrics) {
        context.metrics = { ...context.metrics, ...data.metrics };
      }
      
      // Show notification for important events
      if (data.latency > 100) {
        showNotification('High Latency Alert', `Processing took ${data.latency}ms`);
      }
      
      break;
  }
  
  // Update popup if open
  chrome.runtime.sendMessage({
    type: 'context-update',
    context
  }).catch(() => {}); // Ignore if popup is closed
  
  // Update content scripts
  chrome.tabs.query({ url: 'https://github.com/*' }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'context-update',
        data
      }).catch(() => {}); // Ignore if tab is not ready
    });
  });
}

// Update extension badge
function updateBadge(status) {
  // Badge removed since we don't have an action button
  console.log('Connection status:', status);
}

// Show notification
function showNotification(title, message) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message
    });
  }
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'get-context':
      sendResponse(context);
      break;
      
    case 'send-to-server':
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(request.data));
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Not connected' });
      }
      break;
      
    case 'reconnect':
      if (ws) {
        ws.close();
      }
      connectWebSocket();
      sendResponse({ success: true });
      break;
      
    case 'error-detected':
      handleDetectedError(request.error);
      sendResponse({ success: true });
      break;
      
    case 'ai-prompt':
      handleAIPrompt(request.data).then(response => {
        sendResponse(response);
      }).catch(error => {
        sendResponse({ error: error.message });
      });
      return true; // Keep channel open for async response
  }
  
  return true; // Keep message channel open for async response
});

// Handle errors detected by the error monitor
function handleDetectedError(error) {
  console.log('Error reported by monitor:', error);
  
  // Send to Claude Code error reporter
  if (errorReporterWs && errorReporterWs.readyState === WebSocket.OPEN) {
    errorReporterWs.send(JSON.stringify({
      type: 'browser-error',
      error: error,
      url: error.url || 'unknown',
      userAgent: error.userAgent || navigator.userAgent,
      timestamp: error.timestamp || Date.now()
    }));
    console.log('Error sent to Claude Code');
  } else {
    console.log('Cannot send to Claude Code - reporter not connected');
  }
  
  // If it's a WebSocket error and we're not connected, try to reconnect
  if (error.message.includes('WebSocket') && (!ws || ws.readyState !== WebSocket.OPEN)) {
    console.log('Attempting to reconnect WebSocket...');
    setTimeout(() => {
      connectWebSocket();
    }, 2000);
  }
  
  // Send error to server for tracking (if connected)
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'client-error',
      error: error,
      timestamp: Date.now()
    }));
  }
  
  // Track error in context
  if (!context.errors) {
    context.errors = [];
  }
  context.errors.unshift(error);
  if (context.errors.length > 10) {
    context.errors = context.errors.slice(0, 10);
  }
  
  // Notify all tabs about the error
  chrome.tabs.query({ url: 'https://github.com/*' }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'error-notification',
        error: error
      }).catch(() => {}); // Ignore if tab is not ready
    });
  });
}

// Initialize on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Living Context Browser extension installed');
  connectWebSocket();
});

// Connect to error reporter for Claude Code
function connectErrorReporter() {
  try {
    errorReporterWs = new WebSocket('ws://localhost:8766');
    
    errorReporterWs.onopen = () => {
      console.log('Connected to Claude Code error reporter');
    };
    
    errorReporterWs.onerror = (error) => {
      console.log('Error reporter not available');
    };
    
    errorReporterWs.onclose = () => {
      // Retry after 30 seconds
      setTimeout(connectErrorReporter, 30000);
    };
  } catch (error) {
    console.log('Failed to connect to error reporter:', error);
  }
}

// Handle AI prompts
async function handleAIPrompt(data) {
  console.log('AI prompt received:', data.prompt);
  
  // For now, simulate AI response
  // In production, this would call Claude/GPT API
  const mockResponse = {
    content: `## AI Analysis

Based on your selection and context, here's my analysis:

**Context Detected:**
- URL: ${data.context.url}
- Selection: "${data.context.selection?.text || 'No selection'}"
- Console Errors: ${data.context.console.length}
- Network Errors: ${data.context.network.length}

**Suggested Solution:**
\`\`\`javascript
// Example fix based on context
console.log('This is a mock response');
// In production, this would provide real solutions
\`\`\`

**Next Steps:**
1. Apply the suggested fix
2. Test the changes
3. Monitor for improvements

*Note: This is a demo response. Connect to Claude API for real AI assistance.*`
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockResponse;
}

// Connect on startup
connectWebSocket();
connectErrorReporter();