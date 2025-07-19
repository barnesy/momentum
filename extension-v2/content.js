// Inject context overlay into GitHub pages
let overlay = null;
let minimized = false;

function createOverlay() {
  overlay = document.createElement('div');
  overlay.id = 'living-context-overlay';
  overlay.innerHTML = `
    <div class="lc-header">
      <span class="lc-title">Living Context</span>
      <span class="lc-status" id="lc-status">●</span>
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
  status.style.color = data.connected ? '#4ec9b0' : '#f44747';
  
  if (data.metrics) {
    document.getElementById('lc-throughput').textContent = 
      data.metrics.throughput || '--';
    document.getElementById('lc-latency').textContent = 
      data.metrics.performance?.avg || '--';
  }
  
  if (data.context?.summary) {
    document.getElementById('lc-prs').textContent = 
      data.context.summary.openPRs || '--';
  }
  
  if (data.patterns && data.patterns.length > 0) {
    const patternsEl = document.getElementById('lc-patterns');
    patternsEl.innerHTML = '<div class="lc-pattern-header">Recent Patterns:</div>' +
      data.patterns.slice(0, 3).map(p => 
        `<div class="lc-pattern">${p.description}</div>`
      ).join('');
  }
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

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createOverlay();
    enhanceGitHub();
  });
} else {
  createOverlay();
  enhanceGitHub();
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