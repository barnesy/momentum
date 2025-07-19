class DevContextObserver {
  constructor() {
    this.observer = null;
    this.errorListener = null;
    this.networkInterceptor = null;
    this.codeAnalyzer = null;
    this.init();
  }

  init() {
    this.injectContextCapture();
    this.observeDOM();
    this.interceptErrors();
    this.monitorNetworkActivity();
    this.setupCodeAnalysis();
  }

  injectContextCapture() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }

  observeDOM() {
    this.observer = new MutationObserver((mutations) => {
      const relevantChanges = this.filterRelevantMutations(mutations);
      
      if (relevantChanges.length > 0) {
        this.analyzeChanges(relevantChanges);
      }
    });

    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'href', 'data-react-root', 'data-vue-app']
    });
  }

  filterRelevantMutations(mutations) {
    return mutations.filter(mutation => {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SCRIPT' || 
                node.tagName === 'LINK' ||
                node.classList?.contains('hot-update')) {
              return true;
            }
          }
        }
      }
      
      if (mutation.type === 'attributes') {
        return mutation.attributeName === 'src' || 
               mutation.attributeName === 'href';
      }
      
      return false;
    });
  }

  analyzeChanges(changes) {
    const analysis = {
      timestamp: Date.now(),
      scriptChanges: 0,
      styleChanges: 0,
      hotReloads: 0
    };

    changes.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'SCRIPT') analysis.scriptChanges++;
          if (node.tagName === 'LINK') analysis.styleChanges++;
          if (node.classList?.contains('hot-update')) analysis.hotReloads++;
        });
      }
    });

    if (analysis.scriptChanges > 0 || analysis.hotReloads > 0) {
      chrome.runtime.sendMessage({
        type: 'trackInteraction',
        interaction: {
          type: 'dom-change',
          analysis
        }
      });
    }
  }

  interceptErrors() {
    const originalError = window.onerror;
    
    window.onerror = (message, source, lineno, colno, error) => {
      chrome.runtime.sendMessage({
        type: 'trackInteraction',
        interaction: {
          type: 'error',
          error: {
            message,
            source,
            line: lineno,
            column: colno,
            stack: error?.stack
          }
        }
      });
      
      if (originalError) {
        return originalError(message, source, lineno, colno, error);
      }
    };

    window.addEventListener('unhandledrejection', event => {
      chrome.runtime.sendMessage({
        type: 'trackInteraction',
        interaction: {
          type: 'unhandled-promise',
          reason: event.reason?.toString(),
          promise: event.promise
        }
      });
    });
  }

  monitorNetworkActivity() {
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const relevantEntries = entries.filter(entry => 
          entry.name.includes('.js') || 
          entry.name.includes('.jsx') ||
          entry.name.includes('.ts') ||
          entry.name.includes('.tsx') ||
          entry.name.includes('hot-update')
        );

        if (relevantEntries.length > 0) {
          chrome.runtime.sendMessage({
            type: 'trackInteraction',
            interaction: {
              type: 'network',
              resources: relevantEntries.map(e => ({
                name: e.name,
                duration: e.duration,
                size: e.transferSize
              }))
            }
          });
        }
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  setupCodeAnalysis() {
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 50 && this.looksLikeCode(text)) {
        chrome.runtime.sendMessage({
          type: 'analyzeCode',
          code: text
        }, response => {
          if (response?.suggestions?.length > 0) {
            this.showSuggestions(response.suggestions);
          }
        });
      }
    });

    document.addEventListener('paste', event => {
      const text = event.clipboardData?.getData('text');
      
      if (text && text.length > 100 && this.looksLikeCode(text)) {
        chrome.runtime.sendMessage({
          type: 'analyzeCode',
          code: text
        });
      }
    });
  }

  looksLikeCode(text) {
    const codeIndicators = [
      'function', 'const', 'let', 'var', 'class',
      'import', 'export', 'return', '=>', '{}',
      'if (', 'for (', 'while ('
    ];
    
    return codeIndicators.some(indicator => text.includes(indicator));
  }

  showSuggestions(suggestions) {
    const existingTooltip = document.getElementById('dev-context-tooltip');
    if (existingTooltip) existingTooltip.remove();

    const tooltip = document.createElement('div');
    tooltip.id = 'dev-context-tooltip';
    tooltip.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1e1e1e;
      color: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    suggestions.forEach(suggestion => {
      const item = document.createElement('div');
      item.style.marginBottom = '8px';
      item.innerHTML = `<strong>${suggestion.type}:</strong> ${suggestion.message}`;
      tooltip.appendChild(item);
    });

    document.body.appendChild(tooltip);

    setTimeout(() => {
      tooltip.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => tooltip.remove(), 300);
    }, 5000);
  }
}

window.addEventListener('message', event => {
  if (event.data?.type === 'devtools-context') {
    chrome.runtime.sendMessage({
      type: 'trackInteraction',
      interaction: {
        type: 'devtools',
        data: event.data.context
      }
    });
  }
});

const devObserver = new DevContextObserver();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getPageContext') {
    sendResponse({
      url: window.location.href,
      title: document.title,
      framework: devObserver.detectFramework()
    });
  }
});