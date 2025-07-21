import { createNodeMiddleware, Webhooks } from '@octokit/webhooks';
import { App } from '@octokit/app';
import { WebSocketServer } from 'ws';
import http from 'http';
import { config } from 'dotenv';
import { ContextManager } from './context-manager.js';
import { MetricsTracker } from './metrics-tracker.js';
import { PatternDetector } from './pattern-detector.js';
import { DecisionTracker } from './decision-tracker.js';
import { messageTracer } from './message-tracer.js';
import { codexService } from './codex-service.js';
import ClaudeCodeHandler from './claude-code-handler.js';

config();

// Initialize GitHub App
const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY,
  webhooks: {
    secret: process.env.WEBHOOK_SECRET
  }
});

// Initialize components
const contextManager = new ContextManager();
const metricsTracker = new MetricsTracker();
const patternDetector = new PatternDetector();
const decisionTracker = new DecisionTracker();

// WebSocket server for real-time updates
const wss = new WebSocketServer({ port: 8765 });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total clients:', clients.size);
  
  // Send current context on connection
  ws.send(JSON.stringify({
    type: 'context-sync',
    context: contextManager.getCurrentContext(),
    timestamp: Date.now()
  }));
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });
  
  ws.on('error', console.error);
  
  // Handle messages from clients
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'client-error') {
        console.log('Client error reported:', data.error);
        
        // Create traced error message
        const errorMessage = messageTracer.createMessage(
          'client-error',
          data.error,
          'websocket-client'
        );
        
        // Track client errors in metrics
        metricsTracker.record({
          event: 'client-error',
          error: data.error.message,
          source: data.error.source,
          timestamp: data.timestamp
        });
        
        // Broadcast error to other clients for awareness
        broadcast({
          ...errorMessage,
          type: 'client-error-notification',
          error: data.error,
          timestamp: Date.now()
        });
      } else if (data.type === 'codex-request') {
        // Handle Codex/OpenAI requests
        handleCodexRequest(ws, data);
      }
    } catch (error) {
      console.error('Error parsing client message:', error);
    }
  });
});

// Broadcast to all connected clients (WebSocket and SSE)
function broadcast(data) {
  // Add message tracing if not already present
  if (!data.id) {
    const tracedMessage = messageTracer.createMessage(
      data.type || 'broadcast',
      data,
      'server'
    );
    data = { ...data, id: tracedMessage.id, trace: tracedMessage.trace };
  } else {
    // Add hop to existing trace
    messageTracer.addHop(data.id, 'server-broadcast', 'broadcasting');
  }
  
  const message = JSON.stringify(data);
  
  // WebSocket clients
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
      messageTracer.addHop(data.id, 'websocket-client', 'sent');
    }
  });
  
  // SSE clients
  broadcastSSE(data);
}

// Broadcast to SSE clients
function broadcastSSE(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  
  sseClients.forEach((client, id) => {
    try {
      client.write(message);
      if (data.id) {
        messageTracer.addHop(data.id, `sse-client-${id}`, 'sent');
      }
    } catch (error) {
      console.error(`Failed to send to SSE client ${id}:`, error);
      sseClients.delete(id);
    }
  });
}

// Handle Codex requests
async function handleCodexRequest(ws, data) {
  try {
    const { action, payload } = data;
    let result;

    switch (action) {
      case 'suggest':
        result = await codexService.getSuggestions(payload);
        break;
      case 'analyze':
        result = await codexService.analyzeCode(payload.code, payload.options);
        break;
      case 'explain':
        result = await codexService.explainCode(payload.code, payload.options);
        break;
      case 'generate-tests':
        result = await codexService.generateTests(payload.code, payload.options);
        break;
      case 'refactor':
        result = await codexService.refactorCode(payload.code, payload.options);
        break;
      case 'complete':
        result = await codexService.getCompletion(payload.prefix, payload.suffix, payload.options);
        break;
      case 'detect-patterns':
        result = await codexService.detectPatterns(payload.code, payload.patterns);
        break;
      default:
        result = { error: `Unknown Codex action: ${action}` };
    }

    // Send response back to client
    ws.send(JSON.stringify({
      type: 'codex-response',
      requestId: data.requestId,
      action,
      result,
      timestamp: Date.now()
    }));

    // Track metrics
    metricsTracker.record({
      event: 'codex-request',
      action,
      success: !result.error,
      usage: result.usage,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Codex request error:', error);
    ws.send(JSON.stringify({
      type: 'codex-response',
      requestId: data.requestId,
      error: error.message,
      timestamp: Date.now()
    }));
  }
}

// Handle SSE connections
function handleSSEConnection(req, res) {
  const clientId = sseClientId++;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // Send initial connection event
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    clientId,
    context: contextManager.getCurrentContext(),
    timestamp: Date.now()
  })}\n\n`);
  
  // Store client
  sseClients.set(clientId, res);
  console.log(`SSE client ${clientId} connected. Total SSE clients: ${sseClients.size}`);
  
  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);
  
  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(clientId);
    console.log(`SSE client ${clientId} disconnected. Total SSE clients: ${sseClients.size}`);
  });
}

// Handle context update from client
async function handleContextUpdate(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      // Process the update based on the data type
      let context;
      if (data.type === 'push') {
        context = contextManager.processPush(data);
      } else if (data.type === 'pull_request') {
        context = contextManager.processPullRequest(data);
      } else if (data.type === 'issue') {
        context = contextManager.processIssue(data);
      } else {
        // For generic updates, just add to context
        context = contextManager.getCurrentContext();
        if (!context.customData) context.customData = [];
        context.customData.push({
          ...data,
          timestamp: Date.now()
        });
      }
      
      // Broadcast update to all clients
      broadcast({
        type: 'context-update',
        context,
        timestamp: Date.now()
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, context }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Handle AI prompt
async function handleAIPrompt(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      
      // For now, return mock response
      // In production, this would call Claude/GPT API
      const mockResponse = {
        content: `AI response for: ${data.prompt}`,
        context: data.context,
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        timestamp: Date.now()
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockResponse));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Handle Codex API requests
async function handleCodexAPI(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const { action, payload } = data;
      let result;

      switch (action) {
        case 'suggest':
          result = await codexService.getSuggestions(payload);
          break;
        case 'analyze':
          result = await codexService.analyzeCode(payload.code, payload.options);
          break;
        case 'explain':
          result = await codexService.explainCode(payload.code, payload.options);
          break;
        case 'generate-tests':
          result = await codexService.generateTests(payload.code, payload.options);
          break;
        case 'refactor':
          result = await codexService.refactorCode(payload.code, payload.options);
          break;
        case 'complete':
          result = await codexService.getCompletion(payload.prefix, payload.suffix, payload.options);
          break;
        case 'detect-patterns':
          result = await codexService.detectPatterns(payload.code, payload.patterns);
          break;
        default:
          result = { error: `Unknown Codex action: ${action}` };
      }

      // Track metrics
      metricsTracker.record({
        event: 'codex-api-request',
        action,
        success: !result.error,
        usage: result.usage,
        timestamp: Date.now()
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: !result.error,
        result,
        timestamp: Date.now()
      }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Handle error report
async function handleErrorReport(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      console.log('Error reported:', data);
      
      // Track error in metrics
      metricsTracker.record({
        event: 'client-error',
        error: data.error,
        timestamp: data.timestamp
      });
      
      // Broadcast error notification
      broadcast({
        type: 'error-reported',
        error: data.error,
        timestamp: Date.now()
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Handle Claude Code API requests
async function handleClaudeCodeRequest(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      console.log('Claude Code request:', data);
      
      // Initialize handler
      const claudeHandler = new ClaudeCodeHandler();
      
      // Process based on request type
      let result;
      if (data.type === 'component_generation') {
        result = await claudeHandler.handleComponentGeneration(data.prompt);
      } else {
        result = { error: 'Unknown request type' };
      }
      
      // Track metrics
      metricsTracker.record({
        event: 'claude-code-request',
        type: data.type,
        success: !result.error,
        timestamp: Date.now()
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error('Claude Code request error:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

// Handle GitHub webhook events
const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET
});

// Track all events for context
webhooks.onAny(async ({ name, payload }) => {
  const startTime = Date.now();
  
  try {
    // Update context
    const context = await contextManager.processEvent(name, payload);
    
    // Detect patterns
    const patterns = await patternDetector.analyze(name, payload, context);
    
    // Track decisions
    const decision = await decisionTracker.extractDecision(name, payload);
    if (decision) {
      decisionTracker.storeDecision(decision);
    }
    
    // Track metrics
    const metrics = metricsTracker.record({
      event: name,
      repository: payload.repository?.full_name,
      processingTime: Date.now() - startTime
    });
    
    // Broadcast update to all clients
    broadcast({
      type: 'context-update',
      event: name,
      context,
      patterns,
      metrics,
      decision,
      latency: Date.now() - startTime,
      timestamp: Date.now()
    });
    
    console.log(`Processed ${name} in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`Error processing ${name}:`, error);
  }
});

// Specific handlers for important events
webhooks.on('push', async ({ payload }) => {
  const installation = await app.getInstallationOctokit(payload.installation.id);
  
  // Update context files in repository
  try {
    const context = contextManager.getCurrentContext();
    await installation.rest.repos.createOrUpdateFileContents({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      path: '.github/CONTEXT/current-state.json',
      message: `Context: Update after push ${payload.head_commit.id.substring(0, 7)}`,
      content: Buffer.from(JSON.stringify(context, null, 2)).toString('base64'),
      sha: await getFileSha(installation, payload.repository, '.github/CONTEXT/current-state.json')
    });
  } catch (error) {
    console.error('Error updating context file:', error);
  }
});

webhooks.on('pull_request.opened', async ({ payload }) => {
  const installation = await app.getInstallationOctokit(payload.installation.id);
  
  // Add context comment to PR
  const context = contextManager.getRelevantContext(payload.pull_request);
  const patterns = patternDetector.getSimilarPRs(payload.pull_request);
  
  await installation.rest.issues.createComment({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    issue_number: payload.pull_request.number,
    body: generatePRContextComment(context, patterns)
  });
});

webhooks.on('issues.opened', async ({ payload }) => {
  const patterns = patternDetector.findSimilarIssues(payload.issue);
  
  if (patterns.similar.length > 0) {
    const installation = await app.getInstallationOctokit(payload.installation.id);
    
    await installation.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.issue.number,
      body: `🔍 **Similar issues found:**\n\n${patterns.similar.map(issue => 
        `- #${issue.number}: ${issue.title} (${issue.similarity}% match)`
      ).join('\n')}`
    });
  }
});

// Helper functions
async function getFileSha(installation, repository, path) {
  try {
    const { data } = await installation.rest.repos.getContent({
      owner: repository.owner.login,
      repo: repository.name,
      path
    });
    return data.sha;
  } catch (error) {
    if (error.status === 404) {
      return undefined; // File doesn't exist yet
    }
    throw error;
  }
}

function generatePRContextComment(context, patterns) {
  return `## 📊 Development Context

**Recent Activity:**
${context.recentCommits.map(c => `- \`${c.sha.substring(0, 7)}\` ${c.message}`).join('\n')}

**Related Files:**
${context.relatedFiles.map(f => `- \`${f.path}\` (${f.changes} changes)`).join('\n')}

**Similar PRs:**
${patterns.similarPRs.map(pr => `- #${pr.number}: ${pr.title} (${pr.similarity}% similar)`).join('\n')}

**Velocity Metrics:**
- Average PR completion: ${context.metrics.avgPRTime}
- Recent merge rate: ${context.metrics.mergeRate}%
- Code review time: ${context.metrics.avgReviewTime}

---
*This context is automatically generated and improves over time.*`;
}

// SSE clients registry
const sseClients = new Map();
let sseClientId = 0;

// Create HTTP server with multiple endpoints
const server = http.createServer((req, res) => {
  // Enable CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      uptime: process.uptime(),
      connections: clients.size,
      sseConnections: sseClients.size,
      timestamp: Date.now()
    }));
    return;
  }
  
  // Server-Sent Events endpoint
  if (req.url === '/events' && req.method === 'GET') {
    handleSSEConnection(req, res);
    return;
  }
  
  // Context endpoint
  if (req.url === '/context' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      context: contextManager.getCurrentContext(),
      metrics: metricsTracker.getSnapshot(),
      patterns: patternDetector.getPatterns(),
      versioning: contextManager.getVersionAnalytics(),
      timestamp: Date.now()
    }));
    return;
  }
  
  // Context update endpoint
  if (req.url === '/context/update' && req.method === 'POST') {
    handleContextUpdate(req, res);
    return;
  }
  
  // AI prompt endpoint
  if (req.url === '/prompt' && req.method === 'POST') {
    handleAIPrompt(req, res);
    return;
  }
  
  // Codex API endpoint
  if (req.url === '/codex' && req.method === 'POST') {
    handleCodexAPI(req, res);
    return;
  }
  
  // Error report endpoint
  if (req.url === '/error/report' && req.method === 'POST') {
    handleErrorReport(req, res);
    return;
  }
  
  // Claude Code API endpoint for component generation
  if (req.url === '/api/claude-code' && req.method === 'POST') {
    handleClaudeCodeRequest(req, res);
    return;
  }
  
  // Diagnostic endpoints
  if (req.url === '/diagnostics/status' && req.method === 'GET') {
    (async () => {
      const diagnostics = {
        status: 'ok',
        timestamp: Date.now(),
        uptime: process.uptime(),
        connections: {
        websocket: {
          active: clients.size,
          clients: Array.from(clients).map((client, index) => ({
            id: index,
            readyState: client.readyState,
            readyStateText: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][client.readyState]
          }))
        },
        sse: {
          active: sseClients.size,
          clients: Array.from(sseClients.keys()).map(id => ({ id, connected: true }))
        }
      },
      claudeCode: {
        endpoint: 'http://localhost:8766',
        status: 'unknown', // Will be checked dynamically
        lastContact: null
      },
      metrics: {
        messagesProcessed: metricsTracker.getSnapshot().totalEvents || 0,
        errorsReported: metricsTracker.getSnapshot().errors || 0,
        averageLatency: metricsTracker.getSnapshot().avgProcessingTime || 0
      },
      memory: process.memoryUsage(),
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    };
    
    // Check Claude Code connection
    try {
      const claudeResponse = await fetch('http://localhost:8766/health', { 
        method: 'GET',
        timeout: 2000 
      }).catch(() => null);
      
      if (claudeResponse && claudeResponse.ok) {
        diagnostics.claudeCode.status = 'connected';
        diagnostics.claudeCode.lastContact = Date.now();
      } else {
        diagnostics.claudeCode.status = 'disconnected';
      }
    } catch (error) {
      diagnostics.claudeCode.status = 'error';
      diagnostics.claudeCode.error = error.message;
    }
    
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(diagnostics));
    })();
    return;
  }
  
  if (req.url === '/diagnostics/connections' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      websocket: {
        total: clients.size,
        clients: Array.from(clients).map((client, index) => ({
          id: `ws-${index}`,
          state: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][client.readyState],
          bufferedAmount: client.bufferedAmount
        }))
      },
      sse: {
        total: sseClients.size,
        clients: Array.from(sseClients.entries()).map(([id, client]) => ({
          id: `sse-${id}`,
          connected: true,
          created: Date.now() // Would need to track this properly
        }))
      },
      timestamp: Date.now()
    }));
    return;
  }
  
  if (req.url === '/diagnostics/messages' && req.method === 'GET') {
    // Get recent messages from message tracer
    const messages = messageTracer.getRecentTraces(100);
    const statistics = messageTracer.getStatistics();
    const bottlenecks = messageTracer.findBottlenecks();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      messages,
      statistics,
      bottlenecks,
      total: messages.length,
      timestamp: Date.now()
    }));
    return;
  }
  
  if (req.url === '/diagnostics/test' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const testData = JSON.parse(body);
        const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const testMessage = {
          id: testId,
          type: 'diagnostic-test',
          payload: testData,
          trace: [
            { hop: 'client', timestamp: Date.now() },
            { hop: 'server', timestamp: Date.now() }
          ]
        };
        
        // Broadcast to all connections
        broadcast({
          ...testMessage,
          timestamp: Date.now()
        });
        
        // Try to send to Claude Code
        let claudeResponse = null;
        try {
          const response = await fetch('http://localhost:8766/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testMessage)
          });
          
          if (response.ok) {
            claudeResponse = await response.json();
            testMessage.trace.push({ 
              hop: 'claude-code', 
              timestamp: Date.now(),
              response: claudeResponse
            });
          }
        } catch (error) {
          testMessage.trace.push({ 
            hop: 'claude-code', 
            timestamp: Date.now(),
            error: error.message
          });
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          testId,
          message: testMessage,
          claudeResponse
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  if (req.url.startsWith('/diagnostics/trace/') && req.method === 'GET') {
    const messageId = req.url.split('/').pop();
    const trace = messageTracer.getTrace(messageId);
    const visualization = trace ? messageTracer.getFlowVisualization(messageId) : null;
    
    res.writeHead(trace ? 200 : 404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(visualization || { error: 'Message not found' }));
    return;
  }
  
  if (req.url === '/diagnostics/traces' && req.method === 'GET') {
    const exportData = messageTracer.exportTraces();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(exportData));
    return;
  }
  
  if (req.url === '/diagnostics/claude' && req.method === 'GET') {
    (async () => {
      // Check Claude Code connection in detail
      const claudeStatus = {
      endpoint: 'http://localhost:8766',
      checks: {
        health: { status: 'pending' },
        errorReporter: { status: 'pending' },
        responseTime: null
      },
      timestamp: Date.now()
    };
    
    // Health check
    const startTime = Date.now();
    try {
      const healthResponse = await fetch('http://localhost:8766/health', {
        method: 'GET',
        timeout: 3000
      }).catch(() => null);
      
      if (healthResponse && healthResponse.ok) {
        claudeStatus.checks.health = { 
          status: 'connected',
          responseTime: Date.now() - startTime
        };
        claudeStatus.checks.responseTime = Date.now() - startTime;
      } else {
        claudeStatus.checks.health = { 
          status: 'disconnected',
          code: healthResponse?.status
        };
      }
    } catch (error) {
      claudeStatus.checks.health = { 
        status: 'error',
        error: error.message
      };
    }
    
    // Error reporter check
    try {
      const testError = {
        type: 'diagnostic-check',
        error: { message: 'Test error for diagnostic check' },
        timestamp: Date.now()
      };
      
      const errorResponse = await fetch('http://localhost:8766/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testError),
        timeout: 3000
      }).catch(() => null);
      
      if (errorResponse && errorResponse.ok) {
        claudeStatus.checks.errorReporter = { status: 'working' };
      } else {
        claudeStatus.checks.errorReporter = { 
          status: 'failed',
          code: errorResponse?.status
        };
      }
    } catch (error) {
      claudeStatus.checks.errorReporter = { 
        status: 'error',
        error: error.message
      };
    }
    
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(claudeStatus));
    })();
    return;
  }
  
  // Codex diagnostics endpoint
  if (req.url === '/diagnostics/codex' && req.method === 'GET') {
    (async () => {
      const codexStatus = {
        configured: codexService.initialized,
        model: codexService.model,
        codeModel: codexService.codeModel,
        checks: {
          apiKey: { status: codexService.initialized ? 'configured' : 'missing' },
          testRequest: { status: 'pending' }
        },
        timestamp: Date.now()
      };
      
      // Test API connection if configured
      if (codexService.initialized) {
        const startTime = Date.now();
        try {
          const testResult = await codexService.analyzeCode(
            'function test() { return true; }',
            { checkFor: ['syntax'] }
          );
          
          if (testResult.error) {
            codexStatus.checks.testRequest = {
              status: 'error',
              error: testResult.error,
              responseTime: Date.now() - startTime
            };
          } else {
            codexStatus.checks.testRequest = {
              status: 'success',
              responseTime: Date.now() - startTime,
              usage: testResult.usage
            };
          }
        } catch (error) {
          codexStatus.checks.testRequest = {
            status: 'error',
            error: error.message
          };
        }
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(codexStatus));
    })();
    return;
  }
  
  // Context versioning endpoints
  if (req.url === '/context/versions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      versions: contextManager.getVersionHistory(),
      analytics: contextManager.getVersionAnalytics(),
      timestamp: Date.now()
    }));
    return;
  }
  
  if (req.url.match(/^\/context\/versions\/compare\?/) && req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const v1 = url.searchParams.get('v1');
    const v2 = url.searchParams.get('v2');
    
    if (!v1 || !v2) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing version parameters v1 and v2' }));
      return;
    }
    
    try {
      const comparison = contextManager.compareVersions(v1, v2);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(comparison));
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  
  if (req.url.match(/^\/context\/rollback/) && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { versionId } = JSON.parse(body);
        const version = contextManager.rollbackToVersion(versionId);
        
        // Broadcast rollback event
        broadcast({
          type: 'context-rollback',
          version,
          timestamp: Date.now()
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, version }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }
  
  // Decision tracking endpoints
  if (req.url === '/decisions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      decisions: decisionTracker.getDecisionHistory(),
      analytics: decisionTracker.getAnalytics(),
      timestamp: Date.now()
    }));
    return;
  }
  
  if (req.url === '/decisions/report' && req.method === 'GET') {
    const report = decisionTracker.generateReport('markdown');
    res.writeHead(200, { 'Content-Type': 'text/markdown' });
    res.end(report);
    return;
  }
  
  if (req.url === '/decisions/analytics' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(decisionTracker.getAnalytics()));
    return;
  }
  
  // Webhook handling
  const middleware = createNodeMiddleware(webhooks);
  return middleware(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`GitHub App server running on port ${PORT}`);
  console.log(`WebSocket server running on port 8765`);
  console.log('Ready to receive webhooks!');
});