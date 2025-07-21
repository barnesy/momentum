// Inject context overlay into GitHub pages
let overlay = null;
let minimized = false;

function createOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'living-context-overlay';
  overlay.innerHTML = `
    <div class="lc-header">
      <span class="lc-title">Momentum</span>
      <span class="lc-status" id="lc-status" title="Connection status">●</span>
      <button class="lc-diagnostic" id="lc-diagnostic" title="Run diagnostics (Cmd+Shift+M)">🔍</button>
      <button class="lc-minimize" id="lc-minimize">_</button>
    </div>
    <div class="lc-content" id="lc-content">
      <div class="lc-metric">
        <span class="lc-label">Events/min:</span>
        <span class="lc-value" id="lc-throughput">--</span>
      </div>
      <div class="lc-metric">
        <span class="lc-label">Avg Latency:</span>
        <span class="lc-value" id="lc-latency">--</span>
      </div>
      <div class="lc-metric">
        <span class="lc-label">Active PRs:</span>
        <span class="lc-value" id="lc-prs">--</span>
      </div>
      <div class="lc-patterns" id="lc-patterns"></div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add minimize functionality
  document.getElementById('lc-minimize').addEventListener('click', toggleMinimize);
  
  // Add diagnostic button
  document.getElementById('lc-diagnostic').addEventListener('click', () => {
    if (window.momentumDiagnostic) {
      window.momentumDiagnostic();
    } else {
      console.error('Diagnostic system not loaded yet');
    }
  });
  
  // Make draggable
  makeDraggable(overlay);
}

function toggleMinimize() {
  minimized = !minimized;
  const content = document.getElementById('lc-content');
  content.style.display = minimized ? 'none' : 'block';
  document.getElementById('lc-minimize').textContent = minimized ? '□' : '_';
}

function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = element.querySelector('.lc-header');
  
  header.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Update overlay with context data
function updateOverlay(data) {
  if (!overlay) return;
  
  const status = document.getElementById('lc-status');
  
  // Update connection status
  if (data.connected !== undefined) {
    status.style.color = data.connected ? '#4ec9b0' : '#f44747';
    status.title = data.connected ? 'Connected to Momentum server' : 'Disconnected - start server with npm run dev';
  }
  
  // Update metrics if provided
  if (data.metrics) {
    document.getElementById('lc-throughput').textContent = 
      data.metrics.throughput || '--';
    document.getElementById('lc-latency').textContent = 
      data.metrics.performance?.avg || '--';
  }
  
  // Update PR count if provided
  if (data.context?.summary) {
    document.getElementById('lc-prs').textContent = 
      data.context.summary.openPRs || '--';
  }
  
  // Update patterns if provided
  if (data.patterns && data.patterns.length > 0) {
    const patternsEl = document.getElementById('lc-patterns');
    patternsEl.innerHTML = '<div class="lc-pattern-header">Recent Patterns:</div>' +
      data.patterns.slice(0, 3).map(p => 
        `<div class="lc-pattern">${p.description}</div>`
      ).join('');
  }
  
  // Log update for debugging
  console.log('Momentum overlay updated:', data);
}

// Enhance GitHub UI with context
function enhanceGitHub() {
  // Add context indicators to PRs
  if (window.location.pathname.includes('/pull/')) {
    enhancePullRequest();
  }
  
  // Add context to issues
  if (window.location.pathname.includes('/issues/')) {
    enhanceIssues();
  }
  
  // Add velocity indicator to repo header
  if (document.querySelector('[data-hovercard-type="repository"]')) {
    enhanceRepoHeader();
  }
}

function enhancePullRequest() {
  chrome.runtime.sendMessage({ type: 'get-context' }, (response) => {
    if (!response?.metrics) return;
    
    const sidebar = document.querySelector('.discussion-sidebar');
    if (!sidebar) return;
    
    const contextWidget = document.createElement('div');
    contextWidget.className = 'discussion-sidebar-item';
    contextWidget.innerHTML = `
      <div class="lc-pr-context">
        <h3 class="discussion-sidebar-heading">Development Context</h3>
        <div class="lc-pr-metric">
          <span>Avg PR Time:</span>
          <strong>${response.metrics.avgPRTime || 'N/A'}</strong>
        </div>
        <div class="lc-pr-metric">
          <span>Merge Rate:</span>
          <strong>${response.metrics.mergeRate || '0'}%</strong>
        </div>
        <div class="lc-pr-metric">
          <span>Current Velocity:</span>
          <strong>${response.metrics.eventsPerHour || '0'} events/hr</strong>
        </div>
      </div>
    `;
    
    sidebar.appendChild(contextWidget);
  });
}

function enhanceIssues() {
  // Add similar issues indicator
  const issuesList = document.querySelectorAll('[aria-label="Issues"] .js-issue-row');
  
  issuesList.forEach(issue => {
    const titleEl = issue.querySelector('.Link--primary');
    if (!titleEl) return;
    
    // Add context indicator
    const indicator = document.createElement('span');
    indicator.className = 'lc-issue-indicator';
    indicator.textContent = '◉';
    indicator.title = 'Has similar issues';
    
    titleEl.parentNode.insertBefore(indicator, titleEl);
  });
}

function enhanceRepoHeader() {
  chrome.runtime.sendMessage({ type: 'get-context' }, (response) => {
    if (!response?.context?.velocity) return;
    
    const repoHeader = document.querySelector('.repository-content .pagehead-actions');
    if (!repoHeader) return;
    
    const velocityBadge = document.createElement('div');
    velocityBadge.className = 'lc-velocity-badge';
    velocityBadge.innerHTML = `
      <span class="lc-velocity-icon">⚡</span>
      <span>${response.context.velocity.eventsPerHour || 0}/hr</span>
    `;
    velocityBadge.title = 'Current development velocity';
    
    repoHeader.appendChild(velocityBadge);
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'connection-status':
      updateOverlay({ connected: request.connected });
      break;
      
    case 'context-update':
      updateOverlay(request.data);
      
      // Re-enhance GitHub UI with new data
      enhanceGitHub();
      break;
  }
});

// Listen for error messages from the page
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'momentum-error') {
    // Forward error to background script
    console.log('Content script forwarding error to background:', event.data.error);
    chrome.runtime.sendMessage({
      type: 'error-detected',
      error: event.data.error
    }, (response) => {
      console.log('Background script response:', response);
    });
    
    // Log for debugging
    console.log('Momentum detected error:', event.data.error.message);
  }
});

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createOverlay();
    enhanceGitHub();
    injectDiagnostics();
    injectErrorMonitor();
    injectMUIDetector();
    injectPromptPanel();
    injectAutonomousFix();
    injectCodexIntegration();
  });
} else {
  createOverlay();
  enhanceGitHub();
  injectDiagnostics();
  injectErrorMonitor();
  injectMUIDetector();
  injectPromptPanel();
  injectAutonomousFix();
  injectCodexIntegration();
}

// Inject diagnostic system
function injectDiagnostics() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('diagnostic.js');
  script.onload = function() {
    console.log('Momentum Diagnostic loaded successfully');
  };
  script.onerror = function() {
    console.error('Failed to load diagnostic.js');
  };
  (document.head || document.documentElement).appendChild(script);
}

// Inject error monitor system
function injectErrorMonitor() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('error-monitor.js');
  script.onload = function() {
    console.log('Momentum Error Monitor loaded successfully');
    
    // Test error removed - no inline scripts allowed due to CSP
  };
  script.onerror = function() {
    console.error('Failed to load error-monitor.js');
  };
  (document.head || document.documentElement).appendChild(script);
  console.log('Injecting error monitor from:', chrome.runtime.getURL('error-monitor.js'));
}

// Inject MUI detector
function injectMUIDetector() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('mui-detector.js');
  script.onload = function() {
    console.log('Momentum MUI Detector loaded');
  };
  script.onerror = function() {
    console.error('Failed to load mui-detector.js');
  };
  (document.head || document.documentElement).appendChild(script);
}

// Inject prompt panel system
function injectPromptPanel() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('prompt-panel.js');
  script.onload = function() {
    console.log('Momentum Prompt Panel loaded');
  };
  script.onerror = function() {
    console.error('Failed to load prompt-panel.js');
  };
  (document.head || document.documentElement).appendChild(script);
}

// Inject autonomous fix engine
function injectAutonomousFix() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('autonomous-fix-engine.js');
  script.onload = function() {
    console.log('Momentum Autonomous Fix Engine loaded');
  };
  script.onerror = function() {
    console.error('Failed to load autonomous-fix-engine.js');
  };
  (document.head || document.documentElement).appendChild(script);
}

// Inject Codex integration
function injectCodexIntegration() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('codex-integration.js');
  script.onload = function() {
    console.log('Codex integration loaded successfully');
    this.remove();
  };
  script.onerror = function() {
    console.error('Failed to load codex-integration.js');
  };
  (document.head || document.documentElement).appendChild(script);
}

// Re-enhance on navigation (GitHub is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(enhanceGitHub, 500);
  }
}).observe(document, { subtree: true, childList: true });