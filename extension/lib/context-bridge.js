// Context Bridge for Browser-AI synchronization
// Manages context capture, compression, and synchronization

export class ContextBridge {
  constructor() {
    this.contexts = new Map();
    this.syncQueue = [];
    this.processingQueue = false;
    this.lastSync = new Map();
  }

  // Capture browser context
  captureContext(tabId, rawContext) {
    const context = {
      id: this.generateContextId(),
      tabId,
      url: rawContext.url,
      title: rawContext.title,
      timestamp: Date.now(),
      dom: this.compressDOMSnapshot(rawContext.dom),
      selection: rawContext.selection,
      viewport: rawContext.viewport,
      console: this.filterConsoleMessages(rawContext.console),
      network: this.filterNetworkRequests(rawContext.network),
      performance: rawContext.performance,
      mui: rawContext.muiComponents
    };

    // Store context
    this.contexts.set(tabId, context);
    
    // Calculate delta from last sync
    const delta = this.calculateDelta(tabId, context);
    
    // Queue for synchronization
    if (delta) {
      this.queueSync('context-update', tabId, delta);
    }
    
    return context;
  }

  // Compress DOM snapshot
  compressDOMSnapshot(dom) {
    if (!dom) return null;
    
    // Remove redundant information
    const compressed = {
      structure: this.extractDOMStructure(dom),
      styles: this.extractCriticalStyles(dom),
      interactive: this.extractInteractiveElements(dom)
    };
    
    // Convert to compact format
    return this.compactify(compressed);
  }

  // Extract essential DOM structure
  extractDOMStructure(dom) {
    const structure = [];
    const seen = new Set();
    
    const traverse = (element, depth = 0) => {
      if (depth > 10 || seen.has(element)) return;
      seen.add(element);
      
      const node = {
        tag: element.tagName,
        id: element.id,
        classes: Array.from(element.classList || []),
        attributes: this.getEssentialAttributes(element),
        text: element.textContent?.slice(0, 100)
      };
      
      if (element.children?.length > 0) {
        node.children = Array.from(element.children)
          .slice(0, 5) // Limit children
          .map(child => traverse(child, depth + 1))
          .filter(Boolean);
      }
      
      structure.push(node);
      return node;
    };
    
    if (dom.root) {
      traverse(dom.root);
    }
    
    return structure;
  }

  // Get essential attributes only
  getEssentialAttributes(element) {
    const essential = ['href', 'src', 'alt', 'title', 'value', 'placeholder', 'aria-label'];
    const attrs = {};
    
    essential.forEach(attr => {
      if (element.hasAttribute?.(attr)) {
        attrs[attr] = element.getAttribute(attr);
      }
    });
    
    return attrs;
  }

  // Extract critical styles
  extractCriticalStyles(dom) {
    const styles = {};
    const critical = ['display', 'position', 'visibility', 'opacity', 'z-index'];
    
    if (dom.computedStyles) {
      critical.forEach(prop => {
        if (dom.computedStyles[prop]) {
          styles[prop] = dom.computedStyles[prop];
        }
      });
    }
    
    return styles;
  }

  // Extract interactive elements
  extractInteractiveElements(dom) {
    const interactive = [];
    const selectors = ['button', 'a', 'input', 'select', 'textarea', '[onclick]', '[role="button"]'];
    
    selectors.forEach(selector => {
      const elements = dom.root?.querySelectorAll?.(selector) || [];
      Array.from(elements).slice(0, 20).forEach(el => {
        interactive.push({
          type: el.tagName,
          text: el.textContent?.slice(0, 50),
          action: el.getAttribute('onclick') || el.href || 'interactive'
        });
      });
    });
    
    return interactive;
  }

  // Calculate delta between contexts
  calculateDelta(tabId, newContext) {
    const lastContext = this.lastSync.get(tabId);
    if (!lastContext) {
      this.lastSync.set(tabId, newContext);
      return newContext; // First sync, send everything
    }
    
    const delta = {
      id: newContext.id,
      tabId,
      timestamp: newContext.timestamp,
      changes: {}
    };
    
    // Compare each field
    if (newContext.url !== lastContext.url) {
      delta.changes.url = newContext.url;
    }
    
    if (newContext.selection?.text !== lastContext.selection?.text) {
      delta.changes.selection = newContext.selection;
    }
    
    if (this.hasSignificantDOMChanges(newContext.dom, lastContext.dom)) {
      delta.changes.dom = newContext.dom;
    }
    
    // Only send if there are changes
    if (Object.keys(delta.changes).length > 0) {
      this.lastSync.set(tabId, newContext);
      return delta;
    }
    
    return null;
  }

  // Check for significant DOM changes
  hasSignificantDOMChanges(newDOM, oldDOM) {
    if (!oldDOM) return true;
    if (!newDOM) return false;
    
    // Simple comparison for now
    return JSON.stringify(newDOM) !== JSON.stringify(oldDOM);
  }

  // Filter console messages
  filterConsoleMessages(messages) {
    if (!messages || !Array.isArray(messages)) return [];
    
    // Keep only recent errors and warnings
    return messages
      .filter(msg => msg.type === 'error' || msg.type === 'warning')
      .slice(-10); // Keep last 10
  }

  // Filter network requests
  filterNetworkRequests(requests) {
    if (!requests || !Array.isArray(requests)) return [];
    
    // Keep only failed requests and API calls
    return requests
      .filter(req => req.status >= 400 || req.url?.includes('/api/'))
      .slice(-20); // Keep last 20
  }

  // Queue synchronization
  async queueSync(type, id, data) {
    this.syncQueue.push({
      type,
      id,
      data,
      timestamp: Date.now(),
      attempts: 0
    });
    
    if (!this.processingQueue) {
      await this.processQueue();
    }
  }

  // Process sync queue
  async processQueue() {
    if (this.processingQueue || this.syncQueue.length === 0) return;
    
    this.processingQueue = true;
    
    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();
      
      try {
        await this.sendToServer(item);
      } catch (error) {
        console.error('Sync failed:', error);
        
        // Retry logic
        item.attempts++;
        if (item.attempts < 3) {
          // Re-queue for retry
          this.syncQueue.push(item);
        }
      }
    }
    
    this.processingQueue = false;
  }

  // Send to server
  async sendToServer(item) {
    const response = await fetch('http://localhost:3000/context/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return response.json();
  }

  // Compactify object
  compactify(obj) {
    // Remove null/undefined values and empty arrays
    const clean = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length === 0) return;
        clean[key] = value;
      }
    });
    
    return clean;
  }

  // Generate unique context ID
  generateContextId() {
    return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get context for tab
  getContext(tabId) {
    return this.contexts.get(tabId);
  }

  // Clear old contexts
  cleanup(maxAge = 3600000) { // 1 hour
    const now = Date.now();
    
    this.contexts.forEach((context, tabId) => {
      if (now - context.timestamp > maxAge) {
        this.contexts.delete(tabId);
        this.lastSync.delete(tabId);
      }
    });
  }
}