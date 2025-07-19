chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    
    chrome.runtime.sendMessage(
        { type: 'getContext' },
        (response) => {
            if (response) {
                document.getElementById('status').classList.add('active');
                document.getElementById('status-text').textContent = 'Active';
                
                if (response.current) {
                    const frameworks = response.current.javascript?.frameworks || [];
                    document.getElementById('framework').textContent = 
                        frameworks.length > 0 ? frameworks.join(', ') : 'None';
                }
                
                if (response.patterns) {
                    document.getElementById('pattern-count').textContent = 
                        response.patterns.length;
                }
            }
        }
    );
});

chrome.storage.local.get(['contexts', 'patterns'], (data) => {
    if (data.contexts) {
        const contextCount = Object.keys(data.contexts).length;
        document.getElementById('context-count').textContent = contextCount;
    }
    
    if (data.patterns) {
        const patternCount = Object.keys(data.patterns).length;
        document.getElementById('pattern-count').textContent = patternCount;
    }
});