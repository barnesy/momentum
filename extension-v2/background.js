let ws = null;
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
  const wsUrl = 'ws://localhost:8080'; // In production, use wss://your-app.workers.dev/ws
  
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
  const colors = {
    connected: '#4ec9b0',
    disconnected: '#f44747',
    active: '#dcdcaa'
  };
  
  chrome.action.setBadgeBackgroundColor({ color: colors[status] || colors.disconnected });
  chrome.action.setBadgeText({ text: status === 'connected' ? '●' : '○' });
}

// Show notification
function showNotification(title, message) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: 'icon-48.png'
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
  }
  
  return true; // Keep message channel open for async response
});

// Initialize on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Living Context Browser extension installed');
  connectWebSocket();
});

// Connect on startup
connectWebSocket();