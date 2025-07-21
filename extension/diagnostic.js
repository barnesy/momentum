// Momentum Diagnostic System
window.momentumDiagnostic = function() {
  const diagnostic = document.createElement('div');
  diagnostic.id = 'momentum-diagnostic';
  diagnostic.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #24292e;
    color: #e1e4e8;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    max-width: 500px;
  `;

  // Check overlay
  const overlay = document.getElementById('living-context-overlay');
  const overlayStatus = overlay ? '✅ Found' : '❌ Not found';
  
  // Check data
  const throughput = document.getElementById('lc-throughput');
  const latency = document.getElementById('lc-latency');
  const hasData = throughput && throughput.textContent !== '--';
  
  diagnostic.innerHTML = `
    <h2 style="margin: 0 0 16px 0; color: #58a6ff;">⚡ Momentum Status</h2>
    
    <div style="background: #30363d; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
      <div style="margin-bottom: 8px;">Overlay: ${overlayStatus}</div>
      <div style="margin-bottom: 8px;">Data flowing: ${hasData ? '✅ Yes' : '❌ No'}</div>
      <div style="margin-bottom: 8px;">Current values:</div>
      <ul style="margin: 8px 0 0 20px;">
        <li>Events/min: ${throughput?.textContent || 'not found'}</li>
        <li>Latency: ${latency?.textContent || 'not found'}</li>
      </ul>
    </div>
    
    <div style="background: #30363d; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px 0; color: #f0883e;">Quick Fixes:</h3>
      <ol style="margin: 0; padding-left: 20px;">
        <li>Check server is running: npm run dev</li>
        <li>Reload this page</li>
        <li>Make a commit to trigger webhooks</li>
      </ol>
    </div>
    
    <button onclick="document.getElementById('momentum-diagnostic').remove()" style="
      background: #238636;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
    ">Close</button>
  `;
  
  // Remove any existing diagnostic
  const existing = document.getElementById('momentum-diagnostic');
  if (existing) existing.remove();
  
  document.body.appendChild(diagnostic);
};

console.log('Momentum diagnostic ready!');