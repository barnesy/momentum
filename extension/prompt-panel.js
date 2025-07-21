// Momentum AI Prompt Panel - Floating interface for AI collaboration

class MomentumPromptPanel {
  constructor() {
    this.panel = null;
    this.isOpen = false;
    this.isMinimized = false;
    this.context = {
      dom: null,
      selection: null,
      console: [],
      network: [],
      userPattern: []
    };
    this.templates = {
      debug: "Debug this {selection} - explain what's wrong and how to fix it",
      optimize: "Optimize this {selection} for better performance",
      explain: "Explain how this {selection} works in simple terms",
      refactor: "Refactor this {selection} to be more maintainable",
      mui: "Convert this {selection} to use MUI components with proper theming",
      muifix: "Fix MUI compliance issues in this {selection}",
      accessibility: "Improve accessibility for this {selection}",
      test: "Write tests for this {selection}"
    };
    
    this.init();
  }

  init() {
    this.createPanel();
    this.setupKeyboardShortcuts();
    this.setupContextCapture();
    this.injectStyles();
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.id = 'momentum-prompt-panel';
    this.panel.innerHTML = `
      <div class="mpp-header">
        <div class="mpp-title">
          <span class="mpp-icon">🤖</span>
          <span>Momentum AI</span>
        </div>
        <div class="mpp-controls">
          <button class="mpp-btn mpp-minimize" title="Minimize (Esc)">_</button>
          <button class="mpp-btn mpp-close" title="Close (Esc)">×</button>
        </div>
      </div>
      
      <div class="mpp-content">
        <div class="mpp-context-bar">
          <span class="mpp-context-indicator" title="Context captured">
            <span class="mpp-context-icon">📍</span>
            <span class="mpp-context-text">No context selected</span>
          </span>
        </div>
        
        <div class="mpp-templates">
          ${Object.entries(this.templates).map(([key, template]) => `
            <button class="mpp-template" data-template="${key}">
              ${key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          `).join('')}
        </div>
        
        <div class="mpp-input-area">
          <textarea 
            class="mpp-prompt-input" 
            placeholder="Describe what you want to do... (Cmd+Enter to send)"
            rows="4"
          ></textarea>
          
          <div class="mpp-input-footer">
            <div class="mpp-input-info">
              <span class="mpp-char-count">0</span> characters
            </div>
            <button class="mpp-send-btn" title="Send (Cmd+Enter)">
              Send to AI
            </button>
          </div>
        </div>
        
        <div class="mpp-response-area" style="display: none;">
          <div class="mpp-response-header">
            <span class="mpp-response-icon">💡</span>
            <span>AI Response</span>
          </div>
          <div class="mpp-response-content"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.panel);
    this.setupEventListeners();
    this.makeDraggable();
  }

  setupEventListeners() {
    // Close button
    this.panel.querySelector('.mpp-close').addEventListener('click', () => this.close());
    
    // Minimize button
    this.panel.querySelector('.mpp-minimize').addEventListener('click', () => this.toggleMinimize());
    
    // Template buttons
    this.panel.querySelectorAll('.mpp-template').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = e.target.dataset.template;
        this.applyTemplate(template);
      });
    });
    
    // Character count
    const input = this.panel.querySelector('.mpp-prompt-input');
    const charCount = this.panel.querySelector('.mpp-char-count');
    input.addEventListener('input', () => {
      charCount.textContent = input.value.length;
    });
    
    // Send button
    this.panel.querySelector('.mpp-send-btn').addEventListener('click', () => this.sendPrompt());
    
    // Cmd+Enter to send
    input.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this.sendPrompt();
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd+K to open/focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.focus();
        }
      }
      
      // Escape to close
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        this.close();
      }
    });
  }

  setupContextCapture() {
    // Capture selection
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection.toString().trim()) {
        this.context.selection = {
          text: selection.toString(),
          html: this.getSelectionHTML(selection),
          range: selection.getRangeAt(0)
        };
        this.updateContextIndicator();
      }
    });
    
    // Capture console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.context.console.push({
        type: 'error',
        message: args.join(' '),
        timestamp: Date.now()
      });
      originalError.apply(console, args);
    };
    
    // Capture network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.context.network.push({
            url: args[0],
            status: response.status,
            timestamp: Date.now()
          });
        }
        return response;
      } catch (error) {
        this.context.network.push({
          url: args[0],
          error: error.message,
          timestamp: Date.now()
        });
        throw error;
      }
    };
  }

  getSelectionHTML(selection) {
    const container = document.createElement('div');
    for (let i = 0; i < selection.rangeCount; i++) {
      container.appendChild(selection.getRangeAt(i).cloneContents());
    }
    return container.innerHTML;
  }

  updateContextIndicator() {
    const indicator = this.panel.querySelector('.mpp-context-text');
    const contexts = [];
    
    if (this.context.selection) {
      const preview = this.context.selection.text.substring(0, 30);
      contexts.push(`"${preview}${this.context.selection.text.length > 30 ? '...' : ''}"`);
    }
    
    if (this.context.console.length > 0) {
      contexts.push(`${this.context.console.length} console errors`);
    }
    
    if (this.context.network.length > 0) {
      contexts.push(`${this.context.network.length} network errors`);
    }
    
    indicator.textContent = contexts.length > 0 
      ? contexts.join(', ') 
      : 'No context selected';
  }

  applyTemplate(templateKey) {
    const template = this.templates[templateKey];
    const input = this.panel.querySelector('.mpp-prompt-input');
    
    let prompt = template;
    if (this.context.selection) {
      prompt = prompt.replace('{selection}', `"${this.context.selection.text}"`);
    } else {
      prompt = prompt.replace('{selection}', 'code');
    }
    
    input.value = prompt;
    input.focus();
    this.updateCharCount();
  }

  updateCharCount() {
    const input = this.panel.querySelector('.mpp-prompt-input');
    const charCount = this.panel.querySelector('.mpp-char-count');
    charCount.textContent = input.value.length;
  }

  async sendPrompt() {
    const input = this.panel.querySelector('.mpp-prompt-input');
    const prompt = input.value.trim();
    
    if (!prompt) return;
    
    // Show loading state
    const sendBtn = this.panel.querySelector('.mpp-send-btn');
    sendBtn.textContent = 'Sending...';
    sendBtn.disabled = true;
    
    // Prepare context
    const fullContext = {
      prompt,
      context: {
        url: window.location.href,
        title: document.title,
        selection: this.context.selection,
        console: this.context.console.slice(-10), // Last 10 console errors
        network: this.context.network.slice(-10), // Last 10 network errors
        dom: this.captureDOMContext(),
        timestamp: Date.now()
      }
    };
    
    try {
      // Send to background script
      const response = await chrome.runtime.sendMessage({
        type: 'ai-prompt',
        data: fullContext
      });
      
      this.displayResponse(response);
    } catch (error) {
      this.displayError(error.message);
    } finally {
      sendBtn.textContent = 'Send to AI';
      sendBtn.disabled = false;
    }
  }

  captureDOMContext() {
    // Capture relevant DOM context around selection
    if (!this.context.selection) return null;
    
    const range = this.context.selection.range;
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement 
      : container;
    
    // Check if MUI detector is available
    let muiContext = null;
    if (window.muiDetector) {
      const muiComponent = window.muiDetector.muiComponents.get(element);
      if (muiComponent) {
        muiContext = {
          componentName: muiComponent.name,
          props: muiComponent.props,
          compliance: muiComponent.compliance,
          suggestions: muiComponent.suggestions
        };
      }
    }
    
    return {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      attributes: Array.from(element.attributes || []).map(attr => ({
        name: attr.name,
        value: attr.value
      })),
      computedStyles: this.getRelevantStyles(element),
      muiContext
    };
  }

  getRelevantStyles(element) {
    const computed = window.getComputedStyle(element);
    const relevant = [
      'display', 'position', 'width', 'height', 
      'padding', 'margin', 'color', 'backgroundColor',
      'fontSize', 'fontFamily', 'lineHeight'
    ];
    
    const styles = {};
    relevant.forEach(prop => {
      styles[prop] = computed[prop];
    });
    
    return styles;
  }

  displayResponse(response) {
    const responseArea = this.panel.querySelector('.mpp-response-area');
    const responseContent = this.panel.querySelector('.mpp-response-content');
    
    responseArea.style.display = 'block';
    responseContent.innerHTML = this.formatResponse(response);
  }

  formatResponse(response) {
    // Convert markdown to HTML for better display
    return response.content
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  displayError(error) {
    const responseArea = this.panel.querySelector('.mpp-response-area');
    const responseContent = this.panel.querySelector('.mpp-response-content');
    
    responseArea.style.display = 'block';
    responseContent.innerHTML = `<div class="mpp-error">Error: ${error}</div>`;
  }

  makeDraggable() {
    const header = this.panel.querySelector('.mpp-header');
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.mpp-controls')) return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = this.panel.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      
      header.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      this.panel.style.left = `${initialX + deltaX}px`;
      this.panel.style.top = `${initialY + deltaY}px`;
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      header.style.cursor = 'grab';
    });
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const content = this.panel.querySelector('.mpp-content');
    content.style.display = this.isMinimized ? 'none' : 'block';
    this.panel.querySelector('.mpp-minimize').textContent = this.isMinimized ? '□' : '_';
  }

  open() {
    this.isOpen = true;
    this.panel.style.display = 'block';
    this.panel.querySelector('.mpp-prompt-input').focus();
    
    // Animate in
    this.panel.style.animation = 'mpp-slide-in 0.3s ease-out';
  }

  close() {
    this.isOpen = false;
    this.panel.style.animation = 'mpp-slide-out 0.3s ease-in';
    setTimeout(() => {
      this.panel.style.display = 'none';
    }, 300);
  }

  focus() {
    this.panel.querySelector('.mpp-prompt-input').focus();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #momentum-prompt-panel {
        position: fixed;
        top: 100px;
        right: 20px;
        width: 480px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        display: none;
      }
      
      .mpp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #1976d2;
        color: white;
        border-radius: 12px 12px 0 0;
        cursor: grab;
      }
      
      .mpp-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      }
      
      .mpp-icon {
        font-size: 20px;
      }
      
      .mpp-controls {
        display: flex;
        gap: 8px;
      }
      
      .mpp-btn {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .mpp-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .mpp-content {
        padding: 20px;
      }
      
      .mpp-context-bar {
        margin-bottom: 16px;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 8px;
        font-size: 14px;
      }
      
      .mpp-context-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
      }
      
      .mpp-templates {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }
      
      .mpp-template {
        padding: 6px 12px;
        background: #e3f2fd;
        border: 1px solid #90caf9;
        border-radius: 20px;
        font-size: 13px;
        color: #1976d2;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .mpp-template:hover {
        background: #bbdefb;
        border-color: #64b5f6;
      }
      
      .mpp-prompt-input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        resize: vertical;
        transition: border-color 0.2s;
      }
      
      .mpp-prompt-input:focus {
        outline: none;
        border-color: #1976d2;
      }
      
      .mpp-input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
      }
      
      .mpp-input-info {
        font-size: 12px;
        color: #999;
      }
      
      .mpp-send-btn {
        padding: 8px 20px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .mpp-send-btn:hover:not(:disabled) {
        background: #1565c0;
      }
      
      .mpp-send-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .mpp-response-area {
        margin-top: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .mpp-response-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: 600;
        color: #333;
      }
      
      .mpp-response-content {
        font-size: 14px;
        line-height: 1.6;
        color: #333;
      }
      
      .mpp-response-content pre {
        background: #f0f0f0;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
      }
      
      .mpp-response-content code {
        background: #f0f0f0;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 13px;
      }
      
      .mpp-error {
        color: #d32f2f;
        padding: 12px;
        background: #ffebee;
        border-radius: 6px;
      }
      
      @keyframes mpp-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes mpp-slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Initialize the prompt panel
const momentumPromptPanel = new MomentumPromptPanel();

console.log('🤖 Momentum AI Prompt Panel loaded - Press Cmd+K to open');