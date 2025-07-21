// Circuit Breaker Pattern for Resilient Connections
// Prevents cascade failures and provides graceful degradation

export class CircuitBreaker {
  constructor(options = {}) {
    // Configuration
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    this.halfOpenRequests = options.halfOpenRequests || 3;
    
    // State management
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
    
    // Metrics
    this.metrics = {
      totalRequests: 0,
      failedRequests: 0,
      successfulRequests: 0,
      rejectedRequests: 0,
      stateChanges: [],
      averageResponseTime: 0,
      responseTimes: []
    };
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Start monitoring
    this.startMonitoring();
  }
  
  // Execute a function with circuit breaker protection
  async execute(fn, fallback = null) {
    this.metrics.totalRequests++;
    
    // Check circuit state
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        this.metrics.rejectedRequests++;
        this.emit('rejected', { state: this.state, nextAttemptTime: this.nextAttemptTime });
        
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is OPEN');
      } else {
        // Try to transition to HALF_OPEN
        this.transitionTo('HALF_OPEN');
      }
    }
    
    // Execute the function
    const startTime = Date.now();
    
    try {
      const result = await fn();
      this.onSuccess(Date.now() - startTime);
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }
  
  // Handle successful execution
  onSuccess(responseTime) {
    this.metrics.successfulRequests++;
    this.metrics.responseTimes.push(responseTime);
    this.updateAverageResponseTime();
    
    switch (this.state) {
      case 'CLOSED':
        this.failures = 0;
        break;
        
      case 'HALF_OPEN':
        this.successes++;
        if (this.successes >= this.halfOpenRequests) {
          this.transitionTo('CLOSED');
        }
        break;
    }
    
    this.emit('success', { 
      state: this.state, 
      responseTime,
      averageResponseTime: this.metrics.averageResponseTime 
    });
  }
  
  // Handle failed execution
  onFailure(error) {
    this.metrics.failedRequests++;
    this.lastFailureTime = Date.now();
    
    switch (this.state) {
      case 'CLOSED':
        this.failures++;
        if (this.failures >= this.failureThreshold) {
          this.transitionTo('OPEN');
        }
        break;
        
      case 'HALF_OPEN':
        this.transitionTo('OPEN');
        break;
    }
    
    this.emit('failure', { 
      state: this.state, 
      error: error.message,
      failures: this.failures 
    });
  }
  
  // State transitions
  transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;
    
    switch (newState) {
      case 'OPEN':
        this.nextAttemptTime = Date.now() + this.resetTimeout;
        this.emit('open', { 
          previousState: oldState,
          nextAttemptTime: this.nextAttemptTime 
        });
        break;
        
      case 'HALF_OPEN':
        this.successes = 0;
        this.failures = 0;
        this.emit('halfOpen', { previousState: oldState });
        break;
        
      case 'CLOSED':
        this.failures = 0;
        this.successes = 0;
        this.nextAttemptTime = null;
        this.emit('closed', { previousState: oldState });
        break;
    }
    
    this.metrics.stateChanges.push({
      from: oldState,
      to: newState,
      timestamp: Date.now()
    });
  }
  
  // Force reset the circuit
  reset() {
    this.transitionTo('CLOSED');
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }
  
  // Get current state
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      isOpen: this.state === 'OPEN',
      canAttempt: this.state !== 'OPEN' || Date.now() >= this.nextAttemptTime
    };
  }
  
  // Get metrics
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      failureRate: this.metrics.totalRequests > 0
        ? (this.metrics.failedRequests / this.metrics.totalRequests * 100).toFixed(2) + '%'
        : '0%',
      currentState: this.state,
      stateUptime: this.getStateUptime()
    };
  }
  
  // Calculate how long we've been in current state
  getStateUptime() {
    if (this.metrics.stateChanges.length === 0) {
      return 0;
    }
    
    const lastChange = this.metrics.stateChanges[this.metrics.stateChanges.length - 1];
    return Date.now() - lastChange.timestamp;
  }
  
  // Update average response time
  updateAverageResponseTime() {
    const recentTimes = this.metrics.responseTimes.slice(-100); // Last 100 requests
    if (recentTimes.length > 0) {
      const sum = recentTimes.reduce((a, b) => a + b, 0);
      this.metrics.averageResponseTime = Math.round(sum / recentTimes.length);
    }
  }
  
  // Monitoring for adaptive behavior
  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      // Check if we should reduce failure threshold based on error rate
      const errorRate = this.metrics.failedRequests / this.metrics.totalRequests;
      
      if (errorRate > 0.5 && this.failureThreshold > 3) {
        this.failureThreshold = Math.max(3, this.failureThreshold - 1);
        this.emit('adaptiveChange', { 
          type: 'failureThreshold', 
          newValue: this.failureThreshold,
          reason: 'High error rate detected'
        });
      }
      
      // Check if circuit has been open too long
      if (this.state === 'OPEN' && this.getStateUptime() > this.resetTimeout * 2) {
        this.transitionTo('HALF_OPEN');
        this.emit('adaptiveChange', { 
          type: 'forceHalfOpen',
          reason: 'Circuit open too long'
        });
      }
      
      // Clean old metrics
      if (this.metrics.responseTimes.length > 1000) {
        this.metrics.responseTimes = this.metrics.responseTimes.slice(-500);
      }
    }, this.monitoringPeriod);
  }
  
  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
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
          console.error(`Error in circuit breaker event handler for ${event}:`, error);
        }
      });
    }
  }
  
  // Cleanup
  destroy() {
    this.stopMonitoring();
    this.eventHandlers.clear();
  }
}

// Specialized circuit breaker for HTTP requests
export class HTTPCircuitBreaker extends CircuitBreaker {
  constructor(options = {}) {
    super(options);
    
    // HTTP-specific configuration
    this.timeoutDuration = options.timeoutDuration || 30000; // 30 seconds
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
  }
  
  // Execute HTTP request with circuit breaker
  async request(url, options = {}, fallback = null) {
    return this.execute(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutDuration);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        throw error;
      }
    }, fallback);
  }
  
  // Execute with retry logic
  async requestWithRetry(url, options = {}, fallback = null) {
    let lastError;
    
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        return await this.request(url, options, fallback);
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retryAttempts - 1) {
          // Wait before retry with exponential backoff
          const delay = this.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
}

// Specialized circuit breaker for WebSocket/SSE connections
export class ConnectionCircuitBreaker extends CircuitBreaker {
  constructor(connection, options = {}) {
    super(options);
    
    this.connection = connection;
    this.reconnectDelay = options.reconnectDelay || 1000;
    this.maxReconnectDelay = options.maxReconnectDelay || 30000;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.heartbeatTimeout = options.heartbeatTimeout || 5000;
    
    this.setupConnectionHandlers();
    this.startHeartbeat();
  }
  
  // Setup connection event handlers
  setupConnectionHandlers() {
    if (this.connection.on) {
      this.connection.on('open', () => this.onConnectionOpen());
      this.connection.on('close', () => this.onConnectionClose());
      this.connection.on('error', (error) => this.onConnectionError(error));
      this.connection.on('message', () => this.onConnectionMessage());
    }
  }
  
  onConnectionOpen() {
    this.onSuccess(0);
    this.emit('connectionOpen');
  }
  
  onConnectionClose() {
    this.emit('connectionClose');
    this.scheduleReconnect();
  }
  
  onConnectionError(error) {
    this.onFailure(error);
    this.emit('connectionError', { error: error.message });
  }
  
  onConnectionMessage() {
    this.lastMessageTime = Date.now();
  }
  
  // Heartbeat monitoring
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.connection.isConnected && this.connection.isConnected()) {
        const timeSinceLastMessage = Date.now() - (this.lastMessageTime || 0);
        
        if (timeSinceLastMessage > this.heartbeatInterval + this.heartbeatTimeout) {
          this.onFailure(new Error('Heartbeat timeout'));
          this.connection.close();
        }
      }
    }, this.heartbeatInterval);
  }
  
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  // Schedule reconnection with circuit breaker
  async scheduleReconnect() {
    const state = this.getState();
    
    if (!state.canAttempt) {
      // Circuit is open, wait for reset timeout
      setTimeout(() => this.scheduleReconnect(), this.resetTimeout);
      return;
    }
    
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.failures),
      this.maxReconnectDelay
    );
    
    setTimeout(() => {
      this.execute(async () => {
        await this.connection.connect();
      }).catch(error => {
        console.error('Reconnection failed:', error);
        this.scheduleReconnect();
      });
    }, delay);
  }
  
  // Override destroy to clean up connection handlers
  destroy() {
    super.destroy();
    this.stopHeartbeat();
  }
}