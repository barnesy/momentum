class ContextManager {
  constructor() {
    this.contexts = new Map();
    this.codePatterns = new Map();
    this.sessionData = new Map();
    this.initializeListeners();
  }

  initializeListeners() {
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    chrome.webNavigation.onCompleted.addListener(this.handleNavigationComplete.bind(this));
    
    chrome.storage.local.get(['contexts', 'patterns'], (data) => {
      if (data.contexts) {
        this.contexts = new Map(Object.entries(data.contexts));
      }
      if (data.patterns) {
        this.codePatterns = new Map(Object.entries(data.patterns));
      }
    });
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
      this.analyzeTabContent(tabId, tab);
    }
  }

  async analyzeTabContent(tabId, tab) {
    if (!this.isDevelopmentUrl(tab.url)) return;

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: this.extractPageContext
      });

      if (results && results[0]?.result) {
        this.updateContext(tabId, results[0].result);
      }
    } catch (error) {
      console.error('Failed to analyze tab:', error);
    }
  }

  extractPageContext() {
    const context = {
      url: window.location.href,
      title: document.title,
      timestamp: Date.now(),
      dom: {
        scripts: Array.from(document.scripts).map(s => ({
          src: s.src,
          type: s.type,
          inline: !s.src && s.textContent ? s.textContent.substring(0, 100) : null
        })),
        modules: []
      },
      javascript: {
        globals: Object.keys(window).filter(k => !k.startsWith('webkit')),
        frameworks: this.detectFrameworks()
      },
      errors: [],
      network: {
        resources: performance.getEntriesByType('resource').map(r => ({
          name: r.name,
          type: r.initiatorType,
          duration: r.duration
        }))
      }
    };

    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      context.javascript.react = true;
    }
    if (window.Vue || window.vue) {
      context.javascript.vue = true;
    }
    if (window.angular) {
      context.javascript.angular = true;
    }

    return context;
  }

  detectFrameworks() {
    const frameworks = [];
    
    if (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) frameworks.push('react');
    if (window.Vue || window.vue) frameworks.push('vue');
    if (window.angular) frameworks.push('angular');
    if (window.jQuery || window.$) frameworks.push('jquery');
    if (window.next) frameworks.push('nextjs');
    if (window.Svelte) frameworks.push('svelte');
    
    return frameworks;
  }

  updateContext(tabId, newContext) {
    const existing = this.contexts.get(tabId) || { history: [] };
    
    existing.current = newContext;
    existing.history.push({
      timestamp: newContext.timestamp,
      summary: this.summarizeContext(newContext)
    });
    
    if (existing.history.length > 50) {
      existing.history = existing.history.slice(-50);
    }
    
    this.contexts.set(tabId, existing);
    this.detectPatterns(tabId, newContext);
    this.persistContexts();
  }

  summarizeContext(context) {
    return {
      frameworks: context.javascript.frameworks,
      scriptCount: context.dom.scripts.length,
      hasErrors: context.errors.length > 0,
      resourceCount: context.network.resources.length
    };
  }

  detectPatterns(tabId, context) {
    const patterns = [];
    
    if (context.javascript.frameworks.includes('react')) {
      patterns.push('react-dev');
    }
    
    const hasHotReload = context.dom.scripts.some(s => 
      s.src && (s.src.includes('hot-update') || s.src.includes('webpack-dev-server'))
    );
    if (hasHotReload) {
      patterns.push('hot-reload');
    }
    
    const hasSourceMaps = context.network.resources.some(r => 
      r.name.endsWith('.map')
    );
    if (hasSourceMaps) {
      patterns.push('source-maps');
    }
    
    patterns.forEach(pattern => {
      const count = this.codePatterns.get(pattern) || 0;
      this.codePatterns.set(pattern, count + 1);
    });
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.type) {
      case 'getContext':
        sendResponse(this.getContextForTab(sender.tab.id));
        break;
        
      case 'analyzeCode':
        const analysis = await this.analyzeCode(request.code, sender.tab.id);
        sendResponse(analysis);
        break;
        
      case 'trackInteraction':
        this.trackInteraction(sender.tab.id, request.interaction);
        sendResponse({ success: true });
        break;
        
      case 'getPatterns':
        sendResponse(this.getRelevantPatterns(sender.tab.id));
        break;
    }
    
    return true;
  }

  getContextForTab(tabId) {
    const context = this.contexts.get(tabId);
    if (!context) return null;
    
    return {
      current: context.current,
      patterns: this.getRelevantPatterns(tabId),
      suggestions: this.generateSuggestions(context)
    };
  }

  async analyzeCode(code, tabId) {
    const context = this.contexts.get(tabId);
    
    const analysis = {
      language: this.detectLanguage(code),
      imports: this.extractImports(code),
      symbols: this.extractSymbols(code),
      complexity: this.calculateComplexity(code),
      suggestions: []
    };
    
    if (context && context.current) {
      analysis.frameworkSpecific = this.getFrameworkSuggestions(
        code,
        context.current.javascript.frameworks
      );
    }
    
    return analysis;
  }

  detectLanguage(code) {
    if (code.includes('import React') || code.includes('jsx')) return 'jsx';
    if (code.includes('import') || code.includes('export')) return 'javascript';
    if (code.includes('interface') || code.includes(': string')) return 'typescript';
    if (code.includes('<template>') || code.includes('<script>')) return 'vue';
    return 'javascript';
  }

  extractImports(code) {
    const imports = [];
    const importRegex = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  extractSymbols(code) {
    const symbols = [];
    
    const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*(?:=\s*)?(?:\([^)]*\)|=>)/g;
    const classRegex = /class\s+(\w+)/g;
    
    let match;
    while ((match = functionRegex.exec(code)) !== null) {
      symbols.push({ name: match[1], type: 'function' });
    }
    
    while ((match = classRegex.exec(code)) !== null) {
      symbols.push({ name: match[1], type: 'class' });
    }
    
    return symbols;
  }

  calculateComplexity(code) {
    const lines = code.split('\n').length;
    const conditions = (code.match(/if\s*\(|switch\s*\(|for\s*\(|while\s*\(/g) || []).length;
    const functions = (code.match(/function|=>/g) || []).length;
    
    return {
      lines,
      conditions,
      functions,
      score: Math.log(lines) + conditions * 2 + functions
    };
  }

  getFrameworkSuggestions(code, frameworks) {
    const suggestions = [];
    
    if (frameworks.includes('react')) {
      if (code.includes('componentDidMount') && !code.includes('useEffect')) {
        suggestions.push({
          type: 'modernize',
          message: 'Consider using useEffect hook instead of componentDidMount'
        });
      }
      
      if (code.match(/setState\s*\(/g)?.length > 3) {
        suggestions.push({
          type: 'optimize',
          message: 'Multiple setState calls detected. Consider combining state updates'
        });
      }
    }
    
    return suggestions;
  }

  trackInteraction(tabId, interaction) {
    const session = this.sessionData.get(tabId) || { interactions: [] };
    
    session.interactions.push({
      ...interaction,
      timestamp: Date.now()
    });
    
    if (session.interactions.length > 100) {
      session.interactions = session.interactions.slice(-100);
    }
    
    this.sessionData.set(tabId, session);
  }

  getRelevantPatterns(tabId) {
    const context = this.contexts.get(tabId);
    if (!context?.current) return [];
    
    const relevantPatterns = [];
    
    for (const [pattern, count] of this.codePatterns) {
      if (this.isPatternRelevant(pattern, context.current)) {
        relevantPatterns.push({ pattern, count, relevance: this.calculateRelevance(pattern, context.current) });
      }
    }
    
    return relevantPatterns
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  }

  isPatternRelevant(pattern, context) {
    if (pattern === 'react-dev' && context.javascript.frameworks.includes('react')) return true;
    if (pattern === 'hot-reload' && context.url.includes('localhost')) return true;
    if (pattern === 'source-maps') return true;
    return false;
  }

  calculateRelevance(pattern, context) {
    let score = 1;
    
    if (context.javascript.frameworks.some(f => pattern.includes(f))) {
      score *= 2;
    }
    
    const patternCount = this.codePatterns.get(pattern) || 0;
    score *= Math.log(patternCount + 1);
    
    return score;
  }

  generateSuggestions(context) {
    const suggestions = [];
    
    if (context.current?.errors?.length > 0) {
      suggestions.push({
        type: 'error',
        message: `${context.current.errors.length} errors detected. Check console for details.`
      });
    }
    
    if (context.current?.network?.resources?.length > 100) {
      suggestions.push({
        type: 'performance',
        message: 'High number of network requests detected. Consider bundling resources.'
      });
    }
    
    return suggestions;
  }

  isDevelopmentUrl(url) {
    return url.includes('localhost') || 
           url.includes('127.0.0.1') || 
           url.includes('192.168.') ||
           url.includes(':3000') ||
           url.includes(':8080') ||
           url.includes(':5173');
  }

  persistContexts() {
    const contextsObj = Object.fromEntries(this.contexts);
    const patternsObj = Object.fromEntries(this.codePatterns);
    
    chrome.storage.local.set({
      contexts: contextsObj,
      patterns: patternsObj,
      lastUpdated: Date.now()
    });
  }

  handleNavigationComplete(details) {
    if (details.frameId === 0) {
      this.analyzeTabContent(details.tabId, { url: details.url });
    }
  }
}

const contextManager = new ContextManager();

chrome.runtime.onInstalled.addListener(() => {
  console.log('Dev Context Intelligence extension installed');
});