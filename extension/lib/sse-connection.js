// SSE Connection for Manifest V3 Service Workers
// Provides Server-Sent Events functionality compatible with service workers

import { ConnectionCircuitBreaker } from './circuit-breaker.js';

export class SSEConnection {
  constructor(url, options = {}) {
    this.url = url;
    this.reconnectDelay = options.reconnectDelay || 1000;
    this.maxReconnectDelay = options.maxReconnectDelay || 30000;
    this.reconnectAttempts = 0;
    this.eventHandlers = new Map();
    this.connected = false;
    this.abortController = null;
    
    // Initialize circuit breaker
    this.circuitBreaker = new ConnectionCircuitBreaker(this, {
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 60000,
      heartbeatInterval: options.heartbeatInterval || 30000
    });
    
    // Setup circuit breaker events
    this.setupCircuitBreakerEvents();
  }

  // Connect to SSE endpoint
  async connect() {
    try {
      this.abortController = new AbortController();
      
      const response = await fetch(this.url, {
        headers: {
          'Accept': 'text/event-stream'
        },
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('open', { timestamp: Date.now() });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          this.processLine(line);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('SSE connection aborted');
        return;
      }
      
      console.error('SSE connection error:', error);
      this.connected = false;
      this.emit('error', error);
      
      // Reconnect with exponential backoff
      const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
        this.maxReconnectDelay
      );
      this.reconnectAttempts++;
      
      console.log(`Reconnecting in ${delay}ms...`);
      setTimeout(() => this.connect(), delay);
    }
  }

  // Process a single SSE line
  processLine(line) {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6));
        this.emit('message', data);
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    } else if (line.startsWith('event: ')) {
      const eventType = line.slice(7);
      this.currentEventType = eventType;
    } else if (line.startsWith(':')) {
      // Comment line, ignore or use for heartbeat
      if (line === ':heartbeat') {
        this.emit('heartbeat', { timestamp: Date.now() });
      }
    }
  }

  // Event emitter methods
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in SSE event handler for ${event}:`, error);
        }
      });
    }
  }

  // Close the connection
  close() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.connected = false;
    this.emit('close', { timestamp: Date.now() });
  }

  // Check if connected
  isConnected() {
    return this.connected;
  }
  
  // Setup circuit breaker event handlers
  setupCircuitBreakerEvents() {
    this.circuitBreaker.on('open', (data) => {
      console.warn('Circuit breaker opened:', data);
      this.emit('circuitOpen', data);
    });
    
    this.circuitBreaker.on('halfOpen', (data) => {
      console.log('Circuit breaker half-open:', data);
      this.emit('circuitHalfOpen', data);
    });
    
    this.circuitBreaker.on('closed', (data) => {
      console.log('Circuit breaker closed:', data);
      this.emit('circuitClosed', data);
    });
    
    this.circuitBreaker.on('rejected', (data) => {
      console.warn('Request rejected by circuit breaker:', data);
      this.emit('requestRejected', data);
    });
  }
  
  // Get circuit breaker state
  getCircuitState() {
    return this.circuitBreaker.getState();
  }
  
  // Get circuit breaker metrics
  getCircuitMetrics() {
    return this.circuitBreaker.getMetrics();
  }
  
  // Force reset circuit breaker
  resetCircuit() {
    this.circuitBreaker.reset();
  }
  
  // Cleanup
  destroy() {
    this.close();
    this.circuitBreaker.destroy();
  }
}