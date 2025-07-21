// Codex Integration for Momentum Extension
// Provides AI-powered code suggestions and analysis

class CodexIntegration {
  constructor() {
    this.serverUrl = 'http://localhost:3000';
    this.wsUrl = 'ws://localhost:8765';
    this.ws = null;
    this.requestCallbacks = new Map();
    this.connected = false;
    
    this.init();
  }

  init() {
    this.connectWebSocket();
    this.setupEventListeners();
  }

  connectWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        this.connected = true;
        console.log('Codex WebSocket connected');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'codex-response' && data.requestId) {
            const callback = this.requestCallbacks.get(data.requestId);
            if (callback) {
              callback(data.result);
              this.requestCallbacks.delete(data.requestId);
            }
          }
        } catch (error) {
          console.error('Error parsing Codex response:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('Codex WebSocket error:', error);
      };
      
      this.ws.onclose = () => {
        this.connected = false;
        console.log('Codex WebSocket disconnected, retrying...');
        setTimeout(() => this.connectWebSocket(), 5000);
      };
    } catch (error) {
      console.error('Failed to connect to Codex WebSocket:', error);
    }
  }

  async sendRequest(action, payload) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      // Try WebSocket first
      if (this.connected && this.ws.readyState === WebSocket.OPEN) {
        this.requestCallbacks.set(requestId, resolve);
        
        this.ws.send(JSON.stringify({
          type: 'codex-request',
          requestId,
          action,
          payload
        }));
        
        // Timeout after 30 seconds
        setTimeout(() => {
          if (this.requestCallbacks.has(requestId)) {
            this.requestCallbacks.delete(requestId);
            reject(new Error('Codex request timeout'));
          }
        }, 30000);
      } else {
        // Fallback to REST API
        this.sendRestRequest(action, payload)
          .then(resolve)
          .catch(reject);
      }
    });
  }

  async sendRestRequest(action, payload) {
    try {
      const response = await fetch(`${this.serverUrl}/codex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, payload })
      });
      
      const data = await response.json();
      if (data.success) {
        return data.result;
      } else {
        throw new Error(data.error || 'Codex request failed');
      }
    } catch (error) {
      console.error('Codex REST request error:', error);
      throw error;
    }
  }

  async getSuggestions(code, language, prompt, cursor) {
    return this.sendRequest('suggest', {
      code,
      language,
      prompt,
      cursor
    });
  }

  async analyzeCode(code, options = {}) {
    return this.sendRequest('analyze', { code, options });
  }

  async explainCode(code, options = {}) {
    return this.sendRequest('explain', { code, options });
  }

  async generateTests(code, options = {}) {
    return this.sendRequest('generate-tests', { code, options });
  }

  async refactorCode(code, options = {}) {
    return this.sendRequest('refactor', { code, options });
  }

  async getCompletion(prefix, suffix = '', options = {}) {
    return this.sendRequest('complete', { prefix, suffix, options });
  }

  async detectPatterns(code, patterns = []) {
    return this.sendRequest('detect-patterns', { code, patterns });
  }

  // Setup event listeners for code selection and context
  setupEventListeners() {
    // Listen for code selection
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection.toString().trim()) {
        this.handleCodeSelection(selection);
      }
    });
    
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for code suggestions
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.showSuggestionPanel();
      }
      
      // Ctrl/Cmd + Shift + E for explain code
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        this.explainSelectedCode();
      }
    });
  }

  handleCodeSelection(selection) {
    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Check if selection is within a code block
    const codeBlock = container.closest('pre, code, .blob-code, .CodeMirror');
    if (codeBlock) {
      this.selectedCode = {
        text: selectedText,
        element: codeBlock,
        language: this.detectLanguage(codeBlock)
      };
    }
  }

  detectLanguage(element) {
    // Try to detect language from class names
    const classes = element.className;
    const langMatch = classes.match(/language-(\w+)|lang-(\w+)|highlight-(\w+)/);
    if (langMatch) {
      return langMatch[1] || langMatch[2] || langMatch[3];
    }
    
    // Check data attributes
    const dataLang = element.getAttribute('data-language') || 
                    element.getAttribute('data-lang');
    if (dataLang) {
      return dataLang;
    }
    
    // GitHub specific
    const githubLang = element.closest('[data-file-type]');
    if (githubLang) {
      return githubLang.getAttribute('data-file-type');
    }
    
    return 'javascript'; // default
  }

  showSuggestionPanel() {
    if (!this.selectedCode) {
      this.showNotification('Please select some code first');
      return;
    }
    
    const panel = this.createSuggestionPanel();
    document.body.appendChild(panel);
    
    // Get suggestions
    this.getSuggestions(
      this.selectedCode.text,
      this.selectedCode.language
    ).then(result => {
      if (result.error) {
        panel.querySelector('.codex-content').innerHTML = 
          `<div class="error">Error: ${result.error}</div>`;
      } else {
        panel.querySelector('.codex-content').innerHTML = 
          `<pre>${result.suggestions}</pre>`;
      }
    });
  }

  explainSelectedCode() {
    if (!this.selectedCode) {
      this.showNotification('Please select some code first');
      return;
    }
    
    const panel = this.createExplanationPanel();
    document.body.appendChild(panel);
    
    // Get explanation
    this.explainCode(
      this.selectedCode.text,
      { language: this.selectedCode.language }
    ).then(result => {
      if (result.error) {
        panel.querySelector('.codex-content').innerHTML = 
          `<div class="error">Error: ${result.error}</div>`;
      } else {
        panel.querySelector('.codex-content').innerHTML = 
          `<div class="explanation">${this.formatExplanation(result.explanation)}</div>`;
      }
    });
  }

  createSuggestionPanel() {
    const panel = document.createElement('div');
    panel.className = 'codex-panel codex-suggestions';
    panel.innerHTML = `
      <div class="codex-header">
        <h3>AI Code Suggestions</h3>
        <button class="codex-close">×</button>
      </div>
      <div class="codex-content">
        <div class="loading">Getting suggestions...</div>
      </div>
      <div class="codex-actions">
        <button class="codex-action" data-action="analyze">Analyze</button>
        <button class="codex-action" data-action="refactor">Refactor</button>
        <button class="codex-action" data-action="test">Generate Tests</button>
      </div>
    `;
    
    // Event handlers
    panel.querySelector('.codex-close').onclick = () => panel.remove();
    panel.querySelectorAll('.codex-action').forEach(btn => {
      btn.onclick = () => this.handleAction(btn.dataset.action);
    });
    
    return panel;
  }

  createExplanationPanel() {
    const panel = document.createElement('div');
    panel.className = 'codex-panel codex-explanation';
    panel.innerHTML = `
      <div class="codex-header">
        <h3>Code Explanation</h3>
        <button class="codex-close">×</button>
      </div>
      <div class="codex-content">
        <div class="loading">Analyzing code...</div>
      </div>
    `;
    
    panel.querySelector('.codex-close').onclick = () => panel.remove();
    
    return panel;
  }

  formatExplanation(text) {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  handleAction(action) {
    if (!this.selectedCode) return;
    
    const panel = document.querySelector('.codex-panel');
    const content = panel.querySelector('.codex-content');
    content.innerHTML = '<div class="loading">Processing...</div>';
    
    let promise;
    switch (action) {
      case 'analyze':
        promise = this.analyzeCode(this.selectedCode.text, {
          language: this.selectedCode.language
        });
        break;
      case 'refactor':
        promise = this.refactorCode(this.selectedCode.text, {
          language: this.selectedCode.language
        });
        break;
      case 'test':
        promise = this.generateTests(this.selectedCode.text, {
          language: this.selectedCode.language
        });
        break;
    }
    
    promise.then(result => {
      if (result.error) {
        content.innerHTML = `<div class="error">Error: ${result.error}</div>`;
      } else {
        const key = action === 'analyze' ? 'analysis' : 
                   action === 'refactor' ? 'refactored' : 'tests';
        content.innerHTML = `<pre>${result[key]}</pre>`;
      }
    });
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'codex-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  // Inline code completion
  setupInlineCompletion() {
    // Monitor code input areas
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const codeAreas = document.querySelectorAll('textarea[name="comment"], .CodeMirror');
          codeAreas.forEach(area => this.attachCompletionHandler(area));
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  attachCompletionHandler(element) {
    if (element.dataset.codexEnabled) return;
    element.dataset.codexEnabled = 'true';
    
    let timeout;
    element.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.handleInlineCompletion(element);
      }, 500);
    });
  }

  async handleInlineCompletion(element) {
    const cursorPos = element.selectionStart;
    const text = element.value || element.textContent;
    const prefix = text.substring(0, cursorPos);
    const suffix = text.substring(cursorPos);
    
    // Only trigger if there's a reasonable amount of context
    if (prefix.trim().length < 10) return;
    
    try {
      const result = await this.getCompletion(prefix, suffix, {
        maxTokens: 50,
        temperature: 0.2
      });
      
      if (!result.error && result.completion) {
        this.showCompletionSuggestion(element, result.completion);
      }
    } catch (error) {
      console.error('Inline completion error:', error);
    }
  }

  showCompletionSuggestion(element, suggestion) {
    // Create ghost text overlay
    const ghost = document.createElement('div');
    ghost.className = 'codex-ghost-text';
    ghost.textContent = suggestion;
    
    // Position it after cursor
    const rect = element.getBoundingClientRect();
    ghost.style.position = 'absolute';
    ghost.style.left = rect.left + 'px';
    ghost.style.top = rect.top + 'px';
    
    document.body.appendChild(ghost);
    
    // Accept on Tab
    const handleKeydown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const cursorPos = element.selectionStart;
        const newValue = element.value.substring(0, cursorPos) + 
                        suggestion + 
                        element.value.substring(cursorPos);
        element.value = newValue;
        element.selectionStart = element.selectionEnd = cursorPos + suggestion.length;
        ghost.remove();
        element.removeEventListener('keydown', handleKeydown);
      } else if (e.key === 'Escape') {
        ghost.remove();
        element.removeEventListener('keydown', handleKeydown);
      }
    };
    
    element.addEventListener('keydown', handleKeydown);
    
    // Remove after 5 seconds
    setTimeout(() => {
      ghost.remove();
      element.removeEventListener('keydown', handleKeydown);
    }, 5000);
  }
}

// Initialize Codex integration
const codexIntegration = new CodexIntegration();

// Add styles
const style = document.createElement('style');
style.textContent = `
  .codex-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .codex-header {
    padding: 16px;
    background: #f6f8fa;
    border-bottom: 1px solid #e1e4e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .codex-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .codex-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #586069;
  }
  
  .codex-content {
    padding: 16px;
    overflow-y: auto;
    flex: 1;
  }
  
  .codex-content pre {
    margin: 0;
    white-space: pre-wrap;
    font-size: 14px;
  }
  
  .codex-actions {
    padding: 12px 16px;
    background: #f6f8fa;
    border-top: 1px solid #e1e4e8;
    display: flex;
    gap: 8px;
  }
  
  .codex-action {
    padding: 6px 12px;
    background: white;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .codex-action:hover {
    background: #f3f4f6;
  }
  
  .codex-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #0366d6;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10000;
  }
  
  .codex-ghost-text {
    color: #999;
    font-family: monospace;
    pointer-events: none;
    opacity: 0.7;
  }
  
  .loading {
    text-align: center;
    color: #586069;
    padding: 20px;
  }
  
  .error {
    color: #d73a49;
    padding: 12px;
    background: #ffeef0;
    border-radius: 6px;
  }
  
  .explanation {
    line-height: 1.6;
  }
  
  .explanation code {
    background: #f6f8fa;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 85%;
  }
`;
document.head.appendChild(style);