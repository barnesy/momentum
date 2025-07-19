(function() {
    const originalFetch = window.fetch;
    const originalXHR = window.XMLHttpRequest;
    
    // Monitor fetch requests
    window.fetch = function(...args) {
        const result = originalFetch.apply(this, args);
        
        result.then(response => {
            if (response.url.includes('.js') || response.url.includes('.jsx')) {
                window.postMessage({
                    type: 'devtools-context',
                    context: {
                        type: 'fetch',
                        url: response.url,
                        status: response.status
                    }
                }, '*');
            }
        });
        
        return result;
    };
    
    // Monitor XHR requests
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        
        xhr.open = function(method, url, ...args) {
            xhr.addEventListener('load', function() {
                if (url.includes('.js') || url.includes('.jsx')) {
                    window.postMessage({
                        type: 'devtools-context',
                        context: {
                            type: 'xhr',
                            url: url,
                            status: xhr.status
                        }
                    }, '*');
                }
            });
            
            return originalOpen.apply(xhr, [method, url, ...args]);
        };
        
        return xhr;
    };
    
    // Monitor console errors
    const originalError = console.error;
    console.error = function(...args) {
        window.postMessage({
            type: 'devtools-context',
            context: {
                type: 'console-error',
                message: args.join(' ')
            }
        }, '*');
        
        return originalError.apply(console, args);
    };
})();