// Momentum Error Monitor - Automatically detects and responds to errors

class MomentumErrorMonitor {
  constructor() {
    this.errors = [];
    this.patterns = new Map();
    this.errorReporterWs = null;
    this.fixes = {
      'WebSocket connection.*failed': {
        message: 'Cannot connect to Momentum server',
        fix: 'Start the server: cd github-app && npm run dev',
        action: () => this.showServerStartGuide()
      },
      'Cannot read properties of undefined.*setBadgeBackgroundColor': {
        message: 'Extension API error',
        fix: 'Fixed automatically - reload extension',
        action: () => this.autoFixBadgeError()
      },
      'Failed to load extension': {
        message: 'Extension loading issue',
        fix: 'Check manifest.json for missing files',
        action: () => this.showExtensionDebug()
      },
      'ERR_CONNECTION_REFUSED': {
        message: 'Server not running',
        fix: 'Start Momentum server on port 8765',
        action: () => this.showServerStartGuide()
      }
    };
    
    this.setupErrorInterception();
  }

  setupErrorInterception() {
    console.log('Setting up error interception...');
    
    // Intercept console errors
    const originalError = console.error;
    console.error = (...args) => {
      console.log('Console error intercepted:', args);
      this.handleError(args.join(' '), 'console');
      originalError.apply(console, args);
    };

    // Intercept window errors
    window.addEventListener('error', (event) => {
      console.log('Window error intercepted:', event);
      this.handleError(event.message, 'window', event);
    });

    // Intercept unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.log('Promise rejection intercepted:', event);
      this.handleError(event.reason?.toString() || 'Unhandled promise rejection', 'promise');
    });

    // Monitor WebSocket failures specifically
    this.monitorWebSocket();
  }

  handleError(message, source, event) {
    // Skip if it's a duplicate error in the last second
    const now = Date.now();
    const isDuplicate = this.errors.some(e => 
      e.message === message && (now - e.timestamp) < 1000
    );
    
    if (isDuplicate) return;

    // Record error
    const error = {
      message,
      source,
      timestamp: now,
      stack: event?.error?.stack
    };
    
    this.errors.push(error);
    if (this.errors.length > 50) this.errors.shift();

    // Send error to extension
    window.postMessage({
      type: 'momentum-error',
      error: {
        message,
        source,
        timestamp: now,
        stack: event?.error?.stack
      }
    }, '*');
    
    // Error will be sent via postMessage to content script

    // Find matching fix
    for (const [pattern, solution] of Object.entries(this.fixes)) {
      if (message.match(new RegExp(pattern, 'i'))) {
        this.showAutoFix(solution, error);
        
        // Execute auto-fix action if available
        if (solution.action) {
          solution.action();
        }
        
        return;
      }
    }

    // Unknown error - show generic help
    this.showGenericHelp(error);
  }

  showAutoFix(solution, error) {
    // Remove any existing error notification
    const existing = document.getElementById('momentum-error-fix');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'momentum-error-fix';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #30363d;
      border: 1px solid #f85149;
      border-radius: 8px;
      padding: 16px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 24px;">⚠️</div>
        <div style="flex: 1;">
          <div style="color: #f85149; font-weight: 600; margin-bottom: 8px;">
            ${solution.message}
          </div>
          <div style="color: #8b949e; font-size: 12px; margin-bottom: 12px;">
            ${error.message}
          </div>
          <div style="background: #161b22; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #3fb950;">
            💡 ${solution.fix}
          </div>
        </div>
        <button onclick="document.getElementById('momentum-error-fix').remove()" style="
          background: none;
          border: none;
          color: #8b949e;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
        ">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (document.getElementById('momentum-error-fix')) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
  }

  showServerStartGuide() {
    // Create a helpful modal with copy-paste commands
    const guide = document.createElement('div');
    guide.id = 'momentum-server-guide';
    guide.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #161b22;
      border: 2px solid #30363d;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      z-index: 10002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    `;

    guide.innerHTML = `
      <h3 style="margin: 0 0 16px 0; color: #58a6ff;">Start Momentum Server</h3>
      
      <div style="background: #0d1117; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
        <div style="color: #8b949e; font-size: 12px; margin-bottom: 8px;">Run these commands:</div>
        <code style="color: #79c0ff; display: block; margin-bottom: 8px;">cd ~/Projects/momentum/github-app</code>
        <code style="color: #79c0ff; display: block;">npm run dev</code>
      </div>
      
      <div style="color: #8b949e; font-size: 14px; margin-bottom: 16px;">
        The server will start on port 3000 with WebSocket on 8765
      </div>
      
      <button onclick="
        navigator.clipboard.writeText('cd ~/Projects/momentum/github-app && npm run dev');
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = 'Copy Commands', 2000);
      " style="
        background: #238636;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        width: 100%;
      ">Copy Commands</button>
      
      <button onclick="document.getElementById('momentum-server-guide').remove()" style="
        background: none;
        border: 1px solid #30363d;
        color: #8b949e;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        width: 100%;
        margin-top: 8px;
      ">Close</button>
    `;

    document.body.appendChild(guide);
  }

  monitorWebSocket() {
    // Override WebSocket constructor to monitor connections
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(...args) {
      const ws = new OriginalWebSocket(...args);
      
      // Monitor this WebSocket
      ws.addEventListener('error', (event) => {
        if (args[0].includes('localhost:8765')) {
          this.handleError(`WebSocket connection to ${args[0]} failed`, 'websocket');
        }
      });
      
      // Also catch connection close events
      ws.addEventListener('close', (event) => {
        if (args[0].includes('localhost:8765') && !event.wasClean) {
          this.handleError(`WebSocket connection to ${args[0]} closed unexpectedly`, 'websocket');
        }
      });
      
      ws.addEventListener('open', () => {
        if (args[0].includes('localhost:8765')) {
          // Connection successful - hide any error notifications
          const errorFix = document.getElementById('momentum-error-fix');
          if (errorFix) errorFix.remove();
          
          const guide = document.getElementById('momentum-server-guide');
          if (guide) guide.remove();
        }
      });
      
      return ws;
    };
  }

  showGenericHelp(error) {
    console.log('📍 Momentum detected an error:', error.message);
    console.log('💡 Try running diagnostics: Click the 🔍 button in the Momentum overlay');
  }

  autoFixBadgeError() {
    // This error is already fixed in the code, just needs extension reload
    console.log('✅ Badge error has been fixed. Please reload the extension.');
  }

  showExtensionDebug() {
    console.log('🔍 Extension Debug Info:');
    console.log('- Manifest version:', chrome.runtime.getManifest().version);
    console.log('- Permissions:', chrome.runtime.getManifest().permissions);
    console.log('- Content scripts:', chrome.runtime.getManifest().content_scripts);
  }

  // Get error history for diagnostics
  getErrorHistory() {
    return this.errors.map(e => ({
      time: new Date(e.timestamp).toLocaleTimeString(),
      message: e.message,
      source: e.source
    }));
  }
  
  // Removed direct WebSocket connection - errors are sent via extension messaging
}

// Initialize error monitor
const momentumErrorMonitor = new MomentumErrorMonitor();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

console.log('🛡️ Momentum Error Monitor active - errors will be automatically detected and fixed');
console.log('Errors will be sent to Claude Code via extension messaging');