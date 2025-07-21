import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import boxen from 'boxen';

// Error reporting server that Claude Code can monitor
export class ErrorReporter {
  constructor(port = 8766) {
    this.port = port;
    this.wss = null;
    this.errors = [];
  }

  start() {
    this.wss = new WebSocketServer({ port: this.port });
    
    this.wss.on('connection', (ws) => {
      console.log(chalk.green('✓ Browser error reporter connected'));
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'browser-error') {
            this.handleBrowserError(data);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log(chalk.yellow('Browser error reporter disconnected'));
      });
    });
    
    console.log(chalk.blue(`Error reporter listening on ws://localhost:${this.port}`));
  }

  handleBrowserError(data) {
    const { error, url, userAgent, timestamp } = data;
    
    // Store error
    this.errors.push({
      ...data,
      receivedAt: Date.now()
    });
    
    // Display error prominently for Claude Code to see
    const errorBox = boxen(
      `${chalk.red.bold('🚨 BROWSER ERROR DETECTED')}

${chalk.yellow('Error:')} ${error.message}
${chalk.yellow('Source:')} ${error.source}
${chalk.yellow('URL:')} ${url}
${chalk.yellow('Time:')} ${new Date(timestamp).toLocaleTimeString()}

${error.stack ? chalk.gray('Stack trace:\n' + error.stack) : ''}

${chalk.green.bold('Suggested Actions:')}
${this.getSuggestedActions(error)}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'red',
        title: 'Browser Error',
        titleAlignment: 'center'
      }
    );
    
    console.log(errorBox);
    
    // Also log a simple message that's easy for Claude Code to parse
    console.log(`BROWSER_ERROR: ${error.message} | ${error.source} | ${url}`);
  }

  getSuggestedActions(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('websocket')) {
      return `1. Check if the WebSocket server is running (port 8765)
2. Run: npm run dev
3. Check for port conflicts: lsof -i :8765`;
    }
    
    if (message.includes('cannot read properties of undefined')) {
      return `1. Check the property chain: ${error.message}
2. Add null checks or optional chaining
3. Review recent code changes`;
    }
    
    if (message.includes('failed to fetch') || message.includes('network')) {
      return `1. Check if the API server is running
2. Verify CORS settings
3. Check network connectivity`;
    }
    
    if (message.includes('syntax error')) {
      return `1. Check for syntax errors in recent changes
2. Validate JSON if parsing JSON
3. Check for missing brackets or quotes`;
    }
    
    return `1. Review the error stack trace
2. Check recent code changes
3. Add error handling for this case`;
  }

  getRecentErrors(count = 10) {
    return this.errors.slice(-count);
  }

  clearErrors() {
    this.errors = [];
    console.log(chalk.green('Error history cleared'));
  }
}

// Start the error reporter if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const reporter = new ErrorReporter();
  reporter.start();
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\nShutting down error reporter...'));
    process.exit(0);
  });
}