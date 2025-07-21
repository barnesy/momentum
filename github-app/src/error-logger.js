import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ERROR_LOG_FILE = path.join(__dirname, '..', '..', 'browser-errors.log');

// Simple error logger that writes to a file Claude Code can monitor
export class ErrorLogger {
  constructor(port = 8766) {
    this.port = port;
    this.wss = null;
    
    // Clear the log file on startup
    fs.writeFileSync(ERROR_LOG_FILE, '');
    console.log(`Browser errors will be logged to: ${ERROR_LOG_FILE}`);
  }

  start() {
    this.wss = new WebSocketServer({ port: this.port });
    
    this.wss.on('connection', (ws) => {
      console.log('Browser connected to error logger');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'browser-error') {
            this.logError(data);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('Browser disconnected from error logger');
      });
    });
    
    console.log(`Error logger listening on ws://localhost:${this.port}`);
  }

  logError(data) {
    const { error, url, timestamp } = data;
    
    // Format error for Claude Code to parse
    const errorEntry = {
      timestamp: new Date(timestamp).toISOString(),
      type: 'BROWSER_ERROR',
      message: error.message,
      source: error.source,
      url: url,
      stack: error.stack || null
    };
    
    // Append to log file
    fs.appendFileSync(ERROR_LOG_FILE, JSON.stringify(errorEntry) + '\n');
    
    // Also log to console for immediate visibility
    console.log('BROWSER_ERROR_LOGGED:', error.message);
  }
}

// Start the error logger if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const logger = new ErrorLogger();
  logger.start();
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\nShutting down error logger...');
    process.exit(0);
  });
}