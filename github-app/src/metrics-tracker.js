export class MetricsTracker {
  constructor() {
    this.metrics = {
      events: new Map(),
      latencies: [],
      throughput: [],
      errors: [],
      performance: {
        p50: 0,
        p95: 0,
        p99: 0,
        avg: 0
      }
    };
    
    this.windowSize = 1000; // Keep last 1000 measurements
  }

  record(data) {
    const { event, processingTime, repository } = data;
    
    // Record event count
    const eventMetric = this.metrics.events.get(event) || {
      count: 0,
      totalTime: 0,
      avgTime: 0
    };
    
    eventMetric.count++;
    eventMetric.totalTime += processingTime;
    eventMetric.avgTime = eventMetric.totalTime / eventMetric.count;
    
    this.metrics.events.set(event, eventMetric);
    
    // Record latency
    this.metrics.latencies.push({
      timestamp: Date.now(),
      value: processingTime,
      event,
      repository
    });
    
    // Trim old data
    if (this.metrics.latencies.length > this.windowSize) {
      this.metrics.latencies = this.metrics.latencies.slice(-this.windowSize);
    }
    
    // Update performance percentiles
    this.updatePerformanceMetrics();
    
    // Calculate throughput (events per minute)
    this.updateThroughput();
    
    return this.getSnapshot();
  }

  recordError(error, context) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      context
    });
    
    // Keep only recent errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }
  }

  updatePerformanceMetrics() {
    const latencies = this.metrics.latencies.map(l => l.value).sort((a, b) => a - b);
    
    if (latencies.length === 0) return;
    
    this.metrics.performance = {
      p50: this.percentile(latencies, 0.5),
      p95: this.percentile(latencies, 0.95),
      p99: this.percentile(latencies, 0.99),
      avg: latencies.reduce((a, b) => a + b, 0) / latencies.length
    };
  }

  updateThroughput() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    // Count events in last minute
    const recentEvents = this.metrics.latencies.filter(l => l.timestamp > oneMinuteAgo);
    
    this.metrics.throughput.push({
      timestamp: now,
      eventsPerMinute: recentEvents.length
    });
    
    // Keep only last hour of throughput data
    const oneHourAgo = now - 60 * 60 * 1000;
    this.metrics.throughput = this.metrics.throughput.filter(t => t.timestamp > oneHourAgo);
  }

  percentile(sortedArray, p) {
    const index = Math.ceil(sortedArray.length * p) - 1;
    return sortedArray[Math.max(0, index)];
  }

  getSnapshot() {
    const eventSummary = {};
    this.metrics.events.forEach((value, key) => {
      eventSummary[key] = {
        count: value.count,
        avgTime: Math.round(value.avgTime) + 'ms'
      };
    });
    
    const currentThroughput = this.metrics.throughput.length > 0
      ? this.metrics.throughput[this.metrics.throughput.length - 1].eventsPerMinute
      : 0;
    
    return {
      events: eventSummary,
      performance: {
        p50: Math.round(this.metrics.performance.p50) + 'ms',
        p95: Math.round(this.metrics.performance.p95) + 'ms',
        p99: Math.round(this.metrics.performance.p99) + 'ms',
        avg: Math.round(this.metrics.performance.avg) + 'ms'
      },
      throughput: currentThroughput + ' events/min',
      errorRate: this.calculateErrorRate(),
      health: this.getHealthStatus()
    };
  }

  calculateErrorRate() {
    const recentErrors = this.metrics.errors.filter(e => 
      e.timestamp > Date.now() - 5 * 60 * 1000
    ).length;
    
    const recentEvents = this.metrics.latencies.filter(l => 
      l.timestamp > Date.now() - 5 * 60 * 1000
    ).length;
    
    if (recentEvents === 0) return '0%';
    
    return Math.round((recentErrors / recentEvents) * 100) + '%';
  }

  getHealthStatus() {
    // Determine health based on metrics
    const avgLatency = this.metrics.performance.avg;
    const errorRate = parseFloat(this.calculateErrorRate());
    
    if (avgLatency < 50 && errorRate < 1) {
      return { status: 'healthy', color: 'green' };
    } else if (avgLatency < 100 && errorRate < 5) {
      return { status: 'degraded', color: 'yellow' };
    } else {
      return { status: 'unhealthy', color: 'red' };
    }
  }

  getDetailedMetrics() {
    return {
      ...this.getSnapshot(),
      latencyDistribution: this.getLatencyDistribution(),
      throughputTrend: this.getThroughputTrend(),
      errorDetails: this.getErrorDetails()
    };
  }

  getLatencyDistribution() {
    const buckets = [0, 10, 25, 50, 100, 200, 500, 1000];
    const distribution = {};
    
    buckets.forEach((bucket, i) => {
      const nextBucket = buckets[i + 1] || Infinity;
      const count = this.metrics.latencies.filter(l => 
        l.value >= bucket && l.value < nextBucket
      ).length;
      
      distribution[`${bucket}-${nextBucket}ms`] = count;
    });
    
    return distribution;
  }

  getThroughputTrend() {
    // Return last 10 throughput measurements
    return this.metrics.throughput.slice(-10).map(t => ({
      time: new Date(t.timestamp).toLocaleTimeString(),
      value: t.eventsPerMinute
    }));
  }

  getErrorDetails() {
    // Group errors by type
    const errorGroups = {};
    
    this.metrics.errors.forEach(error => {
      const key = error.error.split(':')[0]; // Group by error type
      if (!errorGroups[key]) {
        errorGroups[key] = {
          count: 0,
          lastOccurred: 0,
          examples: []
        };
      }
      
      errorGroups[key].count++;
      errorGroups[key].lastOccurred = error.timestamp;
      
      if (errorGroups[key].examples.length < 3) {
        errorGroups[key].examples.push({
          message: error.error,
          context: error.context
        });
      }
    });
    
    return errorGroups;
  }
}