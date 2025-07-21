// Momentum Overlay Diagnostic Script
// Run this in Chrome DevTools Console to check the overlay status

(function() {
    console.log('=== Momentum Overlay Diagnostics ===\n');
    
    // 1. Check if overlay element exists
    const overlay = document.getElementById('momentum-overlay');
    if (overlay) {
        console.log('✓ Overlay element found');
        console.log('  - Display:', getComputedStyle(overlay).display);
        console.log('  - Visibility:', getComputedStyle(overlay).visibility);
        console.log('  - Position:', getComputedStyle(overlay).position);
        console.log('  - Z-index:', getComputedStyle(overlay).zIndex);
    } else {
        console.log('✗ Overlay element NOT found');
    }
    
    // 2. Check for specific overlay components
    const statusElement = document.querySelector('#momentum-overlay .status, #momentum-overlay [class*="status"]');
    const dataElement = document.querySelector('#momentum-overlay .data, #momentum-overlay [class*="data"]');
    
    if (statusElement) {
        console.log('\n✓ Status element found');
        console.log('  - Content:', statusElement.textContent.trim());
        console.log('  - HTML:', statusElement.innerHTML.substring(0, 100) + '...');
    } else {
        console.log('\n✗ Status element NOT found');
    }
    
    if (dataElement) {
        console.log('\n✓ Data element found');
        console.log('  - Content preview:', dataElement.textContent.trim().substring(0, 200) + '...');
    } else {
        console.log('\n✗ Data element NOT found');
    }
    
    // 3. Check for WebSocket connections
    console.log('\n=== WebSocket Status ===');
    
    // Try to find WebSocket in window or global scope
    let wsFound = false;
    
    // Check common WebSocket variable names
    const wsVariables = ['ws', 'websocket', 'socket', 'momentumWs', 'momentumSocket'];
    for (const varName of wsVariables) {
        if (window[varName] && window[varName] instanceof WebSocket) {
            wsFound = true;
            const ws = window[varName];
            console.log(`✓ WebSocket found at window.${varName}`);
            console.log('  - URL:', ws.url);
            console.log('  - Ready State:', ws.readyState, '(' + ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState] + ')');
            console.log('  - Protocol:', ws.protocol || 'none');
            console.log('  - Binary Type:', ws.binaryType);
        }
    }
    
    if (!wsFound) {
        console.log('✗ No WebSocket found in common window variables');
        console.log('  Note: WebSocket might be scoped within the extension or using a different variable name');
    }
    
    // 4. Check for any Momentum-related data attributes
    console.log('\n=== Momentum Data Attributes ===');
    const momentumElements = document.querySelectorAll('[data-momentum], [class*="momentum"]');
    if (momentumElements.length > 0) {
        console.log(`✓ Found ${momentumElements.length} elements with Momentum attributes`);
        momentumElements.forEach((el, index) => {
            if (index < 3) { // Show first 3 only
                console.log(`  - Element ${index + 1}:`, el.tagName, el.className || el.getAttribute('data-momentum'));
            }
        });
        if (momentumElements.length > 3) {
            console.log(`  ... and ${momentumElements.length - 3} more`);
        }
    } else {
        console.log('✗ No elements with Momentum attributes found');
    }
    
    // 5. Check for any console errors
    console.log('\n=== Recent Console Activity ===');
    console.log('Check the console for any red error messages above this diagnostic output');
    
    // 6. Check iframe if overlay might be in an iframe
    console.log('\n=== Iframe Check ===');
    const iframes = document.querySelectorAll('iframe');
    if (iframes.length > 0) {
        console.log(`Found ${iframes.length} iframe(s) on the page`);
        iframes.forEach((iframe, index) => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const iframeOverlay = iframeDoc.getElementById('momentum-overlay');
                if (iframeOverlay) {
                    console.log(`  ✓ Momentum overlay found in iframe ${index + 1}`);
                }
            } catch (e) {
                console.log(`  - Cannot access iframe ${index + 1} (cross-origin)`);
            }
        });
    } else {
        console.log('No iframes found on the page');
    }
    
    // 7. Summary
    console.log('\n=== Summary ===');
    const issues = [];
    if (!overlay) issues.push('Overlay element not found');
    if (!statusElement && overlay) issues.push('Status element not found within overlay');
    if (!dataElement && overlay) issues.push('Data element not found within overlay');
    if (!wsFound) issues.push('WebSocket connection not detected (may be scoped)');
    
    if (issues.length === 0) {
        console.log('✓ All basic checks passed!');
    } else {
        console.log('Issues found:');
        issues.forEach(issue => console.log('  - ' + issue));
    }
    
    console.log('\n=== Next Steps ===');
    console.log('1. Check Network tab for WebSocket connections (filter by WS)');
    console.log('2. Check Extensions panel to ensure Momentum is enabled');
    console.log('3. Try refreshing the page with DevTools open');
    console.log('4. Check for any CSP (Content Security Policy) violations in console');
    
})();