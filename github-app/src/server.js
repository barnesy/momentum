import { createNodeMiddleware, Webhooks } from '@octokit/webhooks';
import { App } from '@octokit/app';
import { WebSocketServer } from 'ws';
import http from 'http';
import { config } from 'dotenv';
import { ContextManager } from './context-manager.js';
import { MetricsTracker } from './metrics-tracker.js';
import { PatternDetector } from './pattern-detector.js';

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

// WebSocket server for real-time updates
const wss = new WebSocketServer({ port: 8080 });
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
});

// Broadcast to all connected clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// Handle GitHub webhook events
const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET
});

// Track all events for context
webhooks.on('*', async ({ name, payload }) => {
  const startTime = Date.now();
  
  try {
    // Update context
    const context = await contextManager.processEvent(name, payload);
    
    // Detect patterns
    const patterns = await patternDetector.analyze(name, payload, context);
    
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

// Create HTTP server
const server = http.createServer(createNodeMiddleware(webhooks));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`GitHub App server running on port ${PORT}`);
  console.log(`WebSocket server running on port 8080`);
  console.log('Ready to receive webhooks!');
});