// Message Batcher for efficient communication
// Batches multiple messages to reduce network overhead

export class MessageBatcher {
  constructor(options = {}) {
    this.flushInterval = options.flushInterval || 100; // ms
    this.maxBatchSize = options.maxBatchSize || 50;
    this.maxBatchBytes = options.maxBatchBytes || 64 * 1024; // 64KB
    this.batch = [];
    this.batchSize = 0;
    this.flushTimer = null;
    this.sendFunction = options.sendFunction || this.defaultSend;
  }

  // Add message to batch
  add(message) {
    const messageSize = JSON.stringify(message).length;
    
    // Check if adding this message would exceed limits
    if (this.batch.length >= this.maxBatchSize || 
        this.batchSize + messageSize > this.maxBatchBytes) {
      this.flush();
    }
    
    this.batch.push({
      ...message,
      batchTimestamp: Date.now()
    });
    this.batchSize += messageSize;
    
    // Schedule flush if not already scheduled
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  // Flush the batch
  async flush() {
    if (this.batch.length === 0) return;
    
    // Clear timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Copy and clear batch
    const messages = [...this.batch];
    this.batch = [];
    this.batchSize = 0;
    
    // Send batch
    try {
      await this.sendFunction(messages);
    } catch (error) {
      console.error('Failed to send batch:', error);
      
      // Re-queue messages on failure
      messages.forEach(msg => this.add(msg));
    }
  }

  // Default send function
  async defaultSend(messages) {
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

  // Get current batch size
  size() {
    return this.batch.length;
  }

  // Clear batch without sending
  clear() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.batch = [];
    this.batchSize = 0;
  }
}