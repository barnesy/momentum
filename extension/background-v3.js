// Momentum Background Service Worker - Manifest V3 Compatible
// Uses SSE instead of WebSocket for real-time communication

import { SSEConnection } from './lib/sse-connection.js';
import { ContextBridge } from './lib/context-bridge.js';
import { MessageBatcher } from './lib/message-batcher.js';

// Global state
let sseConnection = null;
let contextBridge = null;
let messageBatcher = null;
let context = {
  connected: false,
  lastUpdate: null,
  metrics: {},
  patterns: [],
  events: [],
  errors: []
};

// Initialize components
function initialize() {
  // Create context bridge
  contextBridge = new ContextBridge();
  
  // Create message batcher
  messageBatcher = new MessageBatcher({
    flushInterval: 200,
    maxBatchSize: 20,
    sendFunction: sendBatchToServer
  });
  
  // Connect to SSE
  connectToServer();
  
  // Cleanup old contexts periodically
  setInterval(() => contextBridge.cleanup(), 300000); // Every 5 minutes
}

// Connect to server using SSE
async function connectToServer() {
  try {
    // First check health
    const healthResponse = await fetch('http://localhost:3000/health');
    const health = await healthResponse.json();
    
    if (health.status !== 'ok') {
      throw new Error('Server not healthy');
    }
    
    // Create SSE connection with circuit breaker
    sseConnection = new SSEConnection('http://localhost:3000/events', {
      failureThreshold: 5,
      resetTimeout: 60000,
      heartbeatInterval: 30000,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000
    });
    
    // Set up event handlers
    sseConnection.on('open', handleSSEOpen);
    sseConnection.on('message', handleSSEMessage);
    sseConnection.on('error', handleSSEError);
    sseConnection.on('close', handleSSEClose);
    sseConnection.on('heartbeat', handleHeartbeat);
    
    // Circuit breaker events
    sseConnection.on('circuitOpen', handleCircuitOpen);
    sseConnection.on('circuitClosed', handleCircuitClosed);
    sseConnection.on('requestRejected', handleRequestRejected);
    
    // Connect
    await sseConnection.connect();
  } catch (error) {
    console.error('Failed to connect to server:', error);
    context.connected = false;
    updateContextState();
    
    // Retry after 5 seconds
    setTimeout(connectToServer, 5000);
  }
}

// Handle SSE events
function handleSSEOpen() {
  console.log('Connected to Momentum server via SSE');
  context.connected = true;
  updateContextState();
  notifyTabs('connection-status', { connected: true });
}

function handleSSEMessage(data) {
  console.log('SSE message received:', data.type);
  
  switch (data.type) {
    case 'connected':
      // Initial connection with context
      if (data.context) {
        context = { ...context, ...data.context };
      }
      break;
      
    case 'context-update':
      handleContextUpdate(data);
      break;
      
    case 'error-reported':
      handleErrorReported(data);
      break;
      
    default:
      console.log('Unknown message type:', data.type);
  }
}

function handleSSEError(error) {
  console.error('SSE error:', error);
  context.connected = false;
  updateContextState();
}

function handleSSEClose() {
  console.log('SSE connection closed');
  context.connected = false;
  updateContextState();
}

function handleHeartbeat() {
  // Keep service worker alive
  console.log('Heartbeat received');
}

// Handle context updates
function handleContextUpdate(data) {
  context.lastUpdate = Date.now();
  
  if (data.context) {
    context = { ...context, ...data.context };
  }
  
  if (data.events) {
    context.events = [...data.events, ...context.events].slice(0, 100);
  }
  
  if (data.patterns) {
    context.patterns = data.patterns;
  }
  
  if (data.metrics) {
    context.metrics = data.metrics;
  }
  
  updateContextState();
  notifyTabs('context-update', data);
}

// Handle error reports
function handleErrorReported(data) {
  context.errors.unshift(data.error);
  if (context.errors.length > 10) {
    context.errors = context.errors.slice(0, 10);
  }
  
  notifyTabs('error-notification', { error: data.error });
}

// Update context state
function updateContextState() {
  // Store in chrome.storage for persistence
  chrome.storage.local.set({ momentumContext: context });
}

// Notify all tabs
async function notifyTabs(type, data) {
  const tabs = await chrome.tabs.query({ url: 'https://github.com/*' });
  
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type, ...data });
    } catch (error) {
      // Tab might not be ready
    }
  }
}

// Send batch to server
async function sendBatchToServer(messages) {
  const response = await fetch('http://localhost:3000/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      timestamp: Date.now()
    })
  });
  
  if (!response.ok) {
    throw new Error(`Batch send failed: ${response.status}`);
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'get-context':
      sendResponse(context);
      break;
      
    case 'capture-context':
      handleCaptureContext(request.data, sender.tab?.id)
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'error-detected':
      handleDetectedError(request.error)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'ai-prompt':
      handleAIPrompt(request.data)
        .then(response => sendResponse(response))
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'reconnect':
      connectToServer();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// Handle context capture
async function handleCaptureContext(data, tabId) {
  if (!tabId) return { error: 'No tab ID' };
  
  // Capture and process context
  const capturedContext = contextBridge.captureContext(tabId, data);
  
  // Queue for batching
  messageBatcher.add({
    type: 'context-update',
    tabId,
    context: capturedContext
  });
  
  return { success: true, contextId: capturedContext.id };
}

// Handle detected errors
async function handleDetectedError(error) {
  console.log('Error detected:', error);
  
  // Add to context
  context.errors.unshift(error);
  if (context.errors.length > 10) {
    context.errors = context.errors.slice(0, 10);
  }
  
  // Send to error reporter
  try {
    const response = await fetch('http://localhost:8766/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'browser-error',
        error: error,
        timestamp: Date.now()
      })
    });
    
    if (!response.ok) {
      console.error('Failed to report error to Claude Code');
    }
  } catch (err) {
    console.error('Error reporter unavailable:', err);
  }
  
  // Also send to main server
  await fetch('http://localhost:3000/error/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error,
      timestamp: Date.now()
    })
  });
  
  // Notify tabs
  notifyTabs('error-notification', { error });
}

// Handle AI prompts
async function handleAIPrompt(data) {
  console.log('AI prompt received:', data.prompt);
  
  const response = await fetch('http://localhost:3000/prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`AI prompt failed: ${response.status}`);
  }
  
  return response.json();
}

// Circuit breaker event handlers
function handleCircuitOpen(data) {
  console.warn('Circuit breaker opened - connection issues detected', data);
  context.circuitState = 'OPEN';
  context.nextRetryTime = data.nextAttemptTime;
  updateContextState();
  
  // Notify user of connection issues
  notifyTabs('circuit-status', {
    state: 'OPEN',
    message: 'Connection temporarily disabled due to repeated failures',
    nextRetryTime: data.nextAttemptTime
  });
}

function handleCircuitClosed(data) {
  console.log('Circuit breaker closed - connection restored', data);
  context.circuitState = 'CLOSED';
  context.nextRetryTime = null;
  updateContextState();
  
  notifyTabs('circuit-status', {
    state: 'CLOSED',
    message: 'Connection restored'
  });
}

function handleRequestRejected(data) {
  console.warn('Request rejected by circuit breaker', data);
  
  // Store rejected request for retry
  context.rejectedRequests = (context.rejectedRequests || 0) + 1;
  updateContextState();
}

// Get circuit breaker status
function getCircuitStatus() {
  if (!sseConnection) {
    return { state: 'UNKNOWN', metrics: {} };
  }
  
  return {
    state: sseConnection.getCircuitState(),
    metrics: sseConnection.getCircuitMetrics()
  };
}

// Keep service worker alive
chrome.alarms.create('keep-alive', { periodInMinutes: 0.25 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keep-alive') {
    // Just a keep-alive ping
    console.log('Keep alive ping');
    
    // Flush any pending messages
    if (messageBatcher) {
      messageBatcher.flush();
    }
    
    // Check circuit breaker health
    if (sseConnection) {
      const status = getCircuitStatus();
      if (status.state.state === 'OPEN' && Date.now() >= status.state.nextAttemptTime) {
        console.log('Attempting to reconnect after circuit breaker timeout');
        connectToServer();
      }
    }
  }
});

// Initialize on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Momentum extension installed');
  initialize();
});

// Initialize on startup
initialize();