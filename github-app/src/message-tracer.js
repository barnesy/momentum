// Message Tracing System
// Adds unique IDs and tracking to all messages flowing through Momentum

export class MessageTracer {
  constructor() {
    this.traces = new Map();
    this.maxTraces = 1000;
  }

  // Generate unique message ID
  generateId(type = 'msg') {
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create a traced message
  createMessage(type, payload, source = 'unknown') {
    const id = this.generateId(type);
    const timestamp = Date.now();
    
    const message = {
      id,
      type,
      payload,
      source,
      timestamp,
      trace: [{
        hop: source,
        timestamp,
        action: 'created'
      }]
    };
    
    this.traces.set(id, message);
    this.cleanup();
    
    return message;
  }

  // Add a hop to existing message
  addHop(messageId, hop, action = 'processed', metadata = {}) {
    const trace = this.traces.get(messageId);
    if (!trace) {
      console.warn(`Message ${messageId} not found in traces`);
      return null;
    }
    
    const hopData = {
      hop,
      timestamp: Date.now(),
      action,
      ...metadata
    };
    
    trace.trace.push(hopData);
    
    // Calculate latency from previous hop
    if (trace.trace.length > 1) {
      const prevHop = trace.trace[trace.trace.length - 2];
      hopData.latency = hopData.timestamp - prevHop.timestamp;
    }
    
    return hopData;
  }

  // Get message trace
  getTrace(messageId) {
    return this.traces.get(messageId);
  }

  // Get all traces
  getAllTraces() {
    return Array.from(this.traces.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get traces by type
  getTracesByType(type) {
    return this.getAllTraces().filter(trace => trace.type === type);
  }

  // Get recent traces
  getRecentTraces(limit = 50) {
    return this.getAllTraces().slice(0, limit);
  }

  // Calculate statistics
  getStatistics() {
    const traces = this.getAllTraces();
    const now = Date.now();
    
    // Group by type
    const byType = {};
    traces.forEach(trace => {
      if (!byType[trace.type]) {
        byType[trace.type] = {
          count: 0,
          totalLatency: 0,
          avgLatency: 0
        };
      }
      
      byType[trace.type].count++;
      
      // Calculate total journey time
      if (trace.trace.length > 1) {
        const journeyTime = trace.trace[trace.trace.length - 1].timestamp - trace.trace[0].timestamp;
        byType[trace.type].totalLatency += journeyTime;
      }
    });
    
    // Calculate averages
    Object.keys(byType).forEach(type => {
      if (byType[type].count > 0) {
        byType[type].avgLatency = Math.round(byType[type].totalLatency / byType[type].count);
      }
    });
    
    // Recent activity (last 5 minutes)
    const recentCutoff = now - 5 * 60 * 1000;
    const recentTraces = traces.filter(t => t.timestamp > recentCutoff);
    
    return {
      total: traces.length,
      byType,
      recentActivity: {
        count: recentTraces.length,
        messagesPerMinute: (recentTraces.length / 5).toFixed(2)
      },
      timestamp: now
    };
  }

  // Find bottlenecks
  findBottlenecks(threshold = 1000) {
    const bottlenecks = [];
    
    this.getAllTraces().forEach(trace => {
      trace.trace.forEach((hop, index) => {
        if (hop.latency && hop.latency > threshold) {
          bottlenecks.push({
            messageId: trace.id,
            messageType: trace.type,
            hop: hop.hop,
            previousHop: index > 0 ? trace.trace[index - 1].hop : null,
            latency: hop.latency,
            timestamp: hop.timestamp
          });
        }
      });
    });
    
    return bottlenecks.sort((a, b) => b.latency - a.latency);
  }

  // Clean up old traces
  cleanup() {
    if (this.traces.size > this.maxTraces) {
      const sortedIds = Array.from(this.traces.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .map(entry => entry[0]);
      
      // Remove oldest traces
      const toRemove = sortedIds.slice(0, this.traces.size - this.maxTraces);
      toRemove.forEach(id => this.traces.delete(id));
    }
  }

  // Export traces for debugging
  exportTraces() {
    return {
      traces: this.getAllTraces(),
      statistics: this.getStatistics(),
      bottlenecks: this.findBottlenecks(),
      exported: new Date().toISOString()
    };
  }

  // Visualize message flow
  getFlowVisualization(messageId) {
    const trace = this.getTrace(messageId);
    if (!trace) return null;
    
    const flow = {
      id: messageId,
      type: trace.type,
      duration: 0,
      hops: []
    };
    
    trace.trace.forEach((hop, index) => {
      const hopInfo = {
        name: hop.hop,
        action: hop.action,
        timestamp: hop.timestamp,
        time: new Date(hop.timestamp).toISOString()
      };
      
      if (index > 0) {
        hopInfo.latency = hop.latency || 0;
        hopInfo.latencyMs = `${hopInfo.latency}ms`;
      }
      
      flow.hops.push(hopInfo);
    });
    
    // Total duration
    if (trace.trace.length > 1) {
      flow.duration = trace.trace[trace.trace.length - 1].timestamp - trace.trace[0].timestamp;
      flow.durationMs = `${flow.duration}ms`;
    }
    
    return flow;
  }
}

// Singleton instance
export const messageTracer = new MessageTracer();