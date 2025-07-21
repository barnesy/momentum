// Momentum Data Flow Diagnostic Script
// Run this in Chrome DevTools Console to debug why data isn't showing

(function() {
    console.log('=== Momentum Data Flow Diagnostics ===\n');
    console.log('UI is visible but data is not populating. Checking data flow...\n');
    
    // 1. Check overlay content in detail
    const overlay = document.getElementById('momentum-overlay');
    if (overlay) {
        console.log('✓ Overlay found. Analyzing content structure:');
        
        // Get all text content
        const allText = overlay.innerText || overlay.textContent;
        console.log('  - Total text length:', allText.length);
        console.log('  - Text preview:', allText.trim().substring(0, 200));
        
        // Check for specific data containers
        const possibleSelectors = [
            '.momentum-data',
            '.data',
            '.content',
            '.message',
            '[data-content]',
            'pre',
            'code',
            '.json',
            '.output'
        ];
        
        console.log('\n  Checking for data containers:');
        possibleSelectors.forEach(selector => {
            const elements = overlay.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`    ✓ Found ${elements.length} "${selector}" element(s)`);
                elements.forEach((el, i) => {
                    if (i === 0) { // Show first one
                        const content = (el.innerText || el.textContent || '').trim();
                        console.log(`      Content: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);
                    }
                });
            }
        });
        
        // Check for empty elements that might be data placeholders
        const allElements = overlay.querySelectorAll('*');
        const emptyElements = Array.from(allElements).filter(el => {
            const text = (el.innerText || el.textContent || '').trim();
            return el.children.length === 0 && text === '';
        });
        
        if (emptyElements.length > 0) {
            console.log(`\n  ⚠ Found ${emptyElements.length} empty elements (possible data placeholders):`);
            emptyElements.slice(0, 3).forEach(el => {
                console.log(`    - <${el.tagName.toLowerCase()} class="${el.className}" id="${el.id}">`);
            });
        }
    }
    
    // 2. Monitor WebSocket traffic
    console.log('\n=== WebSocket Message Monitor ===');
    console.log('Setting up WebSocket interceptor to log next 10 messages...\n');
    
    let messageCount = 0;
    const maxMessages = 10;
    
    // Override WebSocket to intercept messages
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        console.log('🔌 WebSocket connection created:', url);
        
        const ws = new OriginalWebSocket(url, protocols);
        
        ws.addEventListener('open', function() {
            console.log('✓ WebSocket connected');
        });
        
        ws.addEventListener('message', function(event) {
            messageCount++;
            console.log(`\n📨 Message #${messageCount} received:`);
            console.log('  - Type:', typeof event.data);
            console.log('  - Size:', event.data.length, 'characters');
            
            try {
                const parsed = JSON.parse(event.data);
                console.log('  - Parsed JSON:', parsed);
            } catch (e) {
                console.log('  - Raw data:', event.data.substring(0, 200) + '...');
            }
            
            if (messageCount >= maxMessages) {
                console.log('\n✓ Captured 10 messages. Restoring original WebSocket.');
                window.WebSocket = OriginalWebSocket;
            }
        });
        
        ws.addEventListener('error', function(error) {
            console.error('✗ WebSocket error:', error);
        });
        
        ws.addEventListener('close', function(event) {
            console.log('🔌 WebSocket closed. Code:', event.code, 'Reason:', event.reason);
        });
        
        return ws;
    };
    
    // 3. Check for data update functions
    console.log('\n=== Checking for Update Functions ===');
    
    // Look for global functions that might update the overlay
    const functionPatterns = [
        'updateMomentum',
        'updateOverlay', 
        'updateData',
        'renderData',
        'displayData',
        'setContent',
        'momentum'
    ];
    
    functionPatterns.forEach(pattern => {
        const found = Object.keys(window).filter(key => 
            key.toLowerCase().includes(pattern.toLowerCase())
        );
        if (found.length > 0) {
            console.log(`  ✓ Found functions matching "${pattern}":`, found);
        }
    });
    
    // 4. Check localStorage/sessionStorage for cached data
    console.log('\n=== Storage Check ===');
    
    const checkStorage = (storage, name) => {
        const momentumKeys = Object.keys(storage).filter(key => 
            key.toLowerCase().includes('momentum')
        );
        if (momentumKeys.length > 0) {
            console.log(`  ✓ Found ${momentumKeys.length} Momentum keys in ${name}:`);
            momentumKeys.forEach(key => {
                const value = storage.getItem(key);
                console.log(`    - ${key}: ${value.substring(0, 50)}...`);
            });
        } else {
            console.log(`  - No Momentum keys found in ${name}`);
        }
    };
    
    checkStorage(localStorage, 'localStorage');
    checkStorage(sessionStorage, 'sessionStorage');
    
    // 5. Manual data injection test
    console.log('\n=== Manual Data Injection Test ===');
    console.log('Attempting to inject test data into empty elements...\n');
    
    if (overlay) {
        const emptyDivs = overlay.querySelectorAll('div:empty, span:empty, p:empty');
        if (emptyDivs.length > 0) {
            console.log(`Found ${emptyDivs.length} empty elements. Injecting test data into first one...`);
            emptyDivs[0].textContent = '🧪 TEST DATA INJECTED - If you see this in the UI, the container is working!';
            emptyDivs[0].style.color = 'red';
            console.log('✓ Test data injected. Check if it appears in the overlay.');
        }
    }
    
    // 6. Network activity check
    console.log('\n=== Quick Network Check ===');
    console.log('To see WebSocket messages:');
    console.log('1. Open Network tab');
    console.log('2. Filter by "WS" (WebSocket)');
    console.log('3. Click on the WebSocket connection');
    console.log('4. Go to "Messages" sub-tab');
    console.log('5. Look for incoming messages (down arrow ↓)');
    
    // 7. Final recommendations
    console.log('\n=== Recommendations ===');
    console.log('Since you can see the UI but no data:');
    console.log('1. The WebSocket might not be sending data');
    console.log('2. The data format might not match what the UI expects');
    console.log('3. There might be a JavaScript error preventing data rendering');
    console.log('4. The server might not be running or responding');
    console.log('\nCheck the Console for any red error messages!');
    
    console.log('\n📋 Copy this output and share it for debugging help.');
    
})();