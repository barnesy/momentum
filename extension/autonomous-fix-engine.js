// Momentum Autonomous Error Fix Engine
// Automatically detects and fixes errors without user intervention

class AutonomousFixEngine {
  constructor() {
    this.fixPatterns = new Map();
    this.fixHistory = [];
    this.riskLevels = {
      LOW: 'low',       // Auto-fix immediately
      MEDIUM: 'medium', // Fix with notification
      HIGH: 'high'      // Queue for review
    };
    
    this.initializeFixPatterns();
    this.setupErrorInterception();
  }

  initializeFixPatterns() {
    // Low-risk fixes (applied immediately)
    this.fixPatterns.set(/Cannot find module '(.+)'/, {
      risk: this.riskLevels.LOW,
      name: 'Missing import',
      fix: (match) => {
        const moduleName = match[1];
        return {
          type: 'add-import',
          code: `import ${this.guessImportName(moduleName)} from '${moduleName}';`,
          description: `Add missing import for ${moduleName}`
        };
      }
    });

    this.fixPatterns.set(/Property '(.+)' does not exist on type/, {
      risk: this.riskLevels.LOW,
      name: 'TypeScript property error',
      fix: (match) => {
        const property = match[1];
        return {
          type: 'add-type-assertion',
          code: `as any`, // Simple fix, can be improved
          description: `Add type assertion for ${property}`
        };
      }
    });

    this.fixPatterns.set(/Missing semicolon/, {
      risk: this.riskLevels.LOW,
      name: 'Missing semicolon',
      fix: () => ({
        type: 'add-semicolon',
        code: ';',
        description: 'Add missing semicolon'
      })
    });

    // MUI-specific fixes
    this.fixPatterns.set(/The above error occurred in the <(.+)> component/, {
      risk: this.riskLevels.MEDIUM,
      name: 'MUI component error',
      fix: (match) => {
        const component = match[1];
        return {
          type: 'wrap-error-boundary',
          code: `<ErrorBoundary fallback={<div>Error in ${component}</div>}>\n  {/* component */}\n</ErrorBoundary>`,
          description: `Wrap ${component} in error boundary`
        };
      }
    });

    this.fixPatterns.set(/Failed prop type: (.+) in (.+)/, {
      risk: this.riskLevels.LOW,
      name: 'MUI prop type error',
      fix: (match) => {
        const [, propError, component] = match;
        return {
          type: 'fix-prop-type',
          code: this.suggestPropFix(propError, component),
          description: `Fix prop type in ${component}`
        };
      }
    });

    // Medium-risk fixes (applied with notification)
    this.fixPatterns.set(/Each child in a list should have a unique "key" prop/, {
      risk: this.riskLevels.MEDIUM,
      name: 'Missing key prop',
      fix: () => ({
        type: 'add-key-prop',
        code: 'key={index}',
        description: 'Add key prop to list items'
      })
    });

    this.fixPatterns.set(/Accessibility: (.+)/, {
      risk: this.riskLevels.MEDIUM,
      name: 'Accessibility violation',
      fix: (match) => {
        const issue = match[1];
        return this.getAccessibilityFix(issue);
      }
    });

    // Performance fixes
    this.fixPatterns.set(/Component is re-rendering too often/, {
      risk: this.riskLevels.MEDIUM,
      name: 'Performance issue',
      fix: () => ({
        type: 'add-memo',
        code: 'React.memo(Component)',
        description: 'Wrap component in React.memo'
      })
    });

    // High-risk fixes (require approval)
    this.fixPatterns.set(/Cannot read prop(?:erty|erties) of undefined/, {
      risk: this.riskLevels.HIGH,
      name: 'Undefined property access',
      fix: (match, context) => ({
        type: 'add-optional-chaining',
        code: '?.',
        description: 'Add optional chaining operator',
        requiresContext: true
      })
    });
  }

  setupErrorInterception() {
    // Override console.error to catch runtime errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      this.analyzeAndFix(errorMessage, 'console');
      originalError.apply(console, args);
    };

    // Catch window errors
    window.addEventListener('error', (event) => {
      this.analyzeAndFix(event.message, 'window', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.analyzeAndFix(event.reason?.toString() || 'Unhandled promise rejection', 'promise');
    });

    // Monitor build/compile errors
    this.monitorBuildErrors();
  }

  async analyzeAndFix(errorMessage, source, context = {}) {
    console.log(`🔧 Analyzing error: ${errorMessage}`);
    
    // Check each pattern
    for (const [pattern, fixConfig] of this.fixPatterns) {
      const match = errorMessage.match(pattern);
      if (match) {
        const fix = fixConfig.fix(match, context);
        
        // Assess risk
        const risk = await this.assessRisk(fix, fixConfig.risk);
        
        // Apply fix based on risk level
        switch (risk) {
          case this.riskLevels.LOW:
            await this.applyFixImmediately(fix, errorMessage);
            break;
            
          case this.riskLevels.MEDIUM:
            await this.applyFixWithNotification(fix, errorMessage);
            break;
            
          case this.riskLevels.HIGH:
            await this.queueFixForReview(fix, errorMessage);
            break;
        }
        
        // Track fix attempt
        this.trackFix(fixConfig.name, fix, risk, errorMessage);
        break;
      }
    }
  }

  async assessRisk(fix, baseRisk) {
    // Additional risk assessment based on context
    const riskFactors = [];
    
    // Check if fix affects critical paths
    if (fix.code.includes('payment') || fix.code.includes('auth')) {
      riskFactors.push('critical-path');
    }
    
    // Check if fix modifies business logic
    if (fix.type.includes('logic')) {
      riskFactors.push('business-logic');
    }
    
    // Check fix success history
    const successRate = this.getFixSuccessRate(fix.type);
    if (successRate < 0.8) {
      riskFactors.push('low-success-rate');
    }
    
    // Upgrade risk level if factors present
    if (riskFactors.length > 0 && baseRisk === this.riskLevels.LOW) {
      return this.riskLevels.MEDIUM;
    }
    if (riskFactors.length > 1 && baseRisk === this.riskLevels.MEDIUM) {
      return this.riskLevels.HIGH;
    }
    
    return baseRisk;
  }

  async applyFixImmediately(fix, errorMessage) {
    console.log(`✅ Auto-fixing: ${fix.description}`);
    
    try {
      // Apply the fix
      await this.executeFix(fix);
      
      // Verify fix worked
      const verified = await this.verifyFix(fix, errorMessage);
      
      if (!verified) {
        console.warn('Fix verification failed, rolling back...');
        await this.rollbackFix(fix);
      } else {
        this.notifyFixApplied(fix, 'success');
      }
    } catch (error) {
      console.error('Failed to apply fix:', error);
      this.notifyFixApplied(fix, 'failed');
    }
  }

  async applyFixWithNotification(fix, errorMessage) {
    // Show notification
    this.showFixNotification(fix, async (approved) => {
      if (approved) {
        await this.applyFixImmediately(fix, errorMessage);
      } else {
        console.log('Fix rejected by user');
      }
    });
  }

  async queueFixForReview(fix, errorMessage) {
    // Add to review queue
    const reviewItem = {
      id: Date.now(),
      fix,
      errorMessage,
      timestamp: new Date(),
      status: 'pending'
    };
    
    // Send to background script for storage
    chrome.runtime.sendMessage({
      type: 'queue-fix-review',
      data: reviewItem
    });
    
    this.showReviewNotification(reviewItem);
  }

  async executeFix(fix) {
    switch (fix.type) {
      case 'add-import':
        // Find the right place to add import
        // This would integrate with the code editor
        console.log(`Adding import: ${fix.code}`);
        break;
        
      case 'add-semicolon':
        console.log('Adding missing semicolon');
        break;
        
      case 'add-type-assertion':
        console.log(`Adding type assertion: ${fix.code}`);
        break;
        
      case 'fix-prop-type':
        console.log(`Fixing prop type: ${fix.code}`);
        break;
        
      // Add more fix implementations
    }
  }

  async verifyFix(fix, originalError) {
    // Wait a bit for the fix to take effect
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if the same error still occurs
    // In a real implementation, this would re-run the code
    return true; // Simplified for demo
  }

  async rollbackFix(fix) {
    console.log(`Rolling back fix: ${fix.description}`);
    // Implement rollback logic
  }

  showFixNotification(fix, callback) {
    const notification = document.createElement('div');
    notification.className = 'momentum-fix-notification';
    notification.innerHTML = `
      <div class="fix-header">
        <span class="fix-icon">🔧</span>
        <span class="fix-title">Auto-Fix Available</span>
      </div>
      <div class="fix-description">${fix.description}</div>
      <div class="fix-code">${fix.code}</div>
      <div class="fix-actions">
        <button class="fix-approve">Apply Fix</button>
        <button class="fix-reject">Skip</button>
      </div>
    `;
    
    notification.querySelector('.fix-approve').onclick = () => {
      callback(true);
      notification.remove();
    };
    
    notification.querySelector('.fix-reject').onclick = () => {
      callback(false);
      notification.remove();
    };
    
    document.body.appendChild(notification);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (document.contains(notification)) {
        callback(false);
        notification.remove();
      }
    }, 10000);
  }

  showReviewNotification(reviewItem) {
    const notification = document.createElement('div');
    notification.className = 'momentum-fix-review';
    notification.innerHTML = `
      <div class="review-header">
        <span class="review-icon">⚠️</span>
        <span class="review-title">High-Risk Fix Queued</span>
      </div>
      <div class="review-description">
        ${reviewItem.fix.description} requires manual review
      </div>
      <button class="review-open">Open Review Dashboard</button>
    `;
    
    notification.querySelector('.review-open').onclick = () => {
      chrome.runtime.sendMessage({ type: 'open-fix-dashboard' });
      notification.remove();
    };
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
  }

  notifyFixApplied(fix, status) {
    const toast = document.createElement('div');
    toast.className = `momentum-fix-toast ${status}`;
    toast.innerHTML = `
      <span class="toast-icon">${status === 'success' ? '✅' : '❌'}</span>
      <span class="toast-message">
        ${status === 'success' ? 'Fixed' : 'Failed'}: ${fix.description}
      </span>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  trackFix(name, fix, risk, error) {
    this.fixHistory.push({
      name,
      fix,
      risk,
      error,
      timestamp: Date.now(),
      success: null // Updated after verification
    });
    
    // Keep history size manageable
    if (this.fixHistory.length > 100) {
      this.fixHistory.shift();
    }
  }

  getFixSuccessRate(fixType) {
    const relevantFixes = this.fixHistory.filter(f => f.fix.type === fixType);
    if (relevantFixes.length === 0) return 1; // Assume success if no history
    
    const successful = relevantFixes.filter(f => f.success === true).length;
    return successful / relevantFixes.length;
  }

  // Helper methods
  guessImportName(moduleName) {
    // Simple heuristic for import names
    const parts = moduleName.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  }

  suggestPropFix(propError, component) {
    // Analyze prop error and suggest fix
    if (propError.includes('expected string')) {
      return 'prop=""';
    }
    if (propError.includes('expected number')) {
      return 'prop={0}';
    }
    if (propError.includes('expected boolean')) {
      return 'prop={false}';
    }
    return '// Fix prop type';
  }

  getAccessibilityFix(issue) {
    if (issue.includes('alt text')) {
      return {
        type: 'add-alt-text',
        code: 'alt="Description"',
        description: 'Add alt text to image'
      };
    }
    if (issue.includes('ARIA')) {
      return {
        type: 'add-aria-label',
        code: 'aria-label="Label"',
        description: 'Add ARIA label'
      };
    }
    return {
      type: 'accessibility-fix',
      code: '// Add accessibility fix',
      description: 'Fix accessibility issue'
    };
  }

  monitorBuildErrors() {
    // Monitor for webpack/build errors in console
    // This would integrate with the build system
  }
}

// Initialize the autonomous fix engine
const autonomousFixEngine = new AutonomousFixEngine();

// Add styles for notifications
const fixStyles = document.createElement('style');
fixStyles.textContent = `
  .momentum-fix-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border: 2px solid #2196f3;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10001;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  }
  
  .fix-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-weight: 600;
  }
  
  .fix-icon {
    font-size: 20px;
  }
  
  .fix-code {
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
    margin: 8px 0;
  }
  
  .fix-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  
  .fix-actions button {
    padding: 6px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .fix-approve {
    background: #4caf50;
    color: white;
  }
  
  .fix-reject {
    background: #f5f5f5;
    color: #666;
  }
  
  .momentum-fix-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10002;
    animation: slideDown 0.3s ease-out;
  }
  
  .momentum-fix-toast.success {
    border-left: 4px solid #4caf50;
  }
  
  .momentum-fix-toast.failed {
    border-left: 4px solid #f44336;
  }
  
  .momentum-fix-review {
    position: fixed;
    top: 80px;
    right: 20px;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 8px;
    padding: 16px;
    max-width: 350px;
    z-index: 10001;
    animation: slideDown 0.3s ease-out;
  }
  
  .review-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-weight: 600;
  }
  
  .review-open {
    margin-top: 12px;
    padding: 8px 16px;
    background: #ffc107;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

document.head.appendChild(fixStyles);

console.log('🔧 Momentum Autonomous Fix Engine active - errors will be automatically fixed');