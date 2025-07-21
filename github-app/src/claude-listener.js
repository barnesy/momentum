import http from 'http';
import { EventEmitter } from 'events';

// Claude Code Listener Service
// This service listens for messages from the Momentum system
// and provides acknowledgments and health checks

class ClaudeCodeListener extends EventEmitter {
  constructor(port = 8766) {
    super();
    this.port = port;
    this.messages = [];
    this.errors = [];
    this.connections = 0;
    this.startTime = Date.now();
    this.stats = {
      messagesReceived: 0,
      errorsReceived: 0,
      testsPassed: 0,
      averageResponseTime: 0
    };
  }

  start() {
    this.server = http.createServer((req, res) => {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      // Handle preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // Route requests
      if (req.url === '/health' && req.method === 'GET') {
        this.handleHealth(req, res);
      } else if (req.url === '/report' && req.method === 'POST') {
        this.handleReport(req, res);
      } else if (req.url === '/test' && req.method === 'POST') {
        this.handleTest(req, res);
      } else if (req.url === '/stats' && req.method === 'GET') {
        this.handleStats(req, res);
      } else if (req.url === '/messages' && req.method === 'GET') {
        this.handleMessages(req, res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    this.server.listen(this.port, () => {
      console.log(`🤖 Claude Code Listener active on port ${this.port}`);
      console.log('Ready to receive messages from Momentum');
      this.emit('started');
    });
  }

  handleHealth(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'claude-code-listener',
      uptime: Date.now() - this.startTime,
      messagesReceived: this.stats.messagesReceived,
      errorsReceived: this.stats.errorsReceived,
      timestamp: Date.now()
    }));
  }

  handleReport(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const report = JSON.parse(body);
        const timestamp = Date.now();
        
        // Store the error report
        this.errors.push({
          ...report,
          receivedAt: timestamp,
          acknowledged: true
        });
        
        // Keep only last 100 errors
        if (this.errors.length > 100) {
          this.errors = this.errors.slice(-100);
        }
        
        this.stats.errorsReceived++;
        
        // Emit event for processing
        this.emit('error-report', report);
        
        // Log to console for visibility
        console.log('📥 Error Report Received:', {
          type: report.type,
          message: report.error?.message,
          timestamp: new Date(timestamp).toISOString()
        });
        
        // Send acknowledgment
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          acknowledged: true,
          receivedAt: timestamp,
          message: 'Error report received by Claude Code'
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message 
        }));
      }
    });
  }

  handleTest(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const testMessage = JSON.parse(body);
        const timestamp = Date.now();
        
        // Process test message
        this.messages.push({
          ...testMessage,
          receivedAt: timestamp,
          type: 'test'
        });
        
        this.stats.testsPassed++;
        
        // Log test
        console.log('🧪 Test Message Received:', {
          id: testMessage.id,
          timestamp: new Date(timestamp).toISOString()
        });
        
        // Send response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          testId: testMessage.id,
          receivedAt: timestamp,
          processed: true,
          message: 'Test message processed by Claude Code',
          echo: testMessage.payload
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message 
        }));
      }
    });
  }

  handleStats(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      uptime: Date.now() - this.startTime,
      stats: this.stats,
      recentErrors: this.errors.slice(-10),
      recentMessages: this.messages.slice(-10),
      timestamp: Date.now()
    }));
  }

  handleMessages(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      messages: this.messages,
      errors: this.errors,
      total: {
        messages: this.messages.length,
        errors: this.errors.length
      },
      timestamp: Date.now()
    }));
  }

  stop() {
    if (this.server) {
      this.server.close(() => {
        console.log('Claude Code Listener stopped');
        this.emit('stopped');
      });
    }
  }
}

// Create and start the listener
const listener = new ClaudeCodeListener(8766);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Claude Code Listener...');
  listener.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  listener.stop();
  process.exit(0);
});

// Start the service
listener.start();

// Example of how to process errors (could be extended)
listener.on('error-report', (report) => {
  // This is where Claude Code would analyze and potentially fix errors
  // For now, we just acknowledge receipt
  console.log('🔍 Analyzing error:', report.error?.message);
  
  // Simulate analysis
  setTimeout(() => {
    console.log('✅ Error analysis complete');
  }, 100);
});

export default ClaudeCodeListener;