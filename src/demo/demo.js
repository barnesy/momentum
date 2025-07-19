class DemoClient {
    constructor() {
        this.connected = false;
        this.metrics = {
            latency: [],
            cacheHits: 0,
            totalRequests: 0
        };
        
        this.initializeUI();
    }

    initializeUI() {
        document.getElementById('connect-btn').addEventListener('click', () => this.connect());
        document.getElementById('analyze-btn').addEventListener('click', () => this.analyzeCode());
        document.getElementById('complete-btn').addEventListener('click', () => this.getCompletions());
        
        const editor = document.getElementById('code-editor');
        editor.addEventListener('input', () => this.handleCodeChange());
    }

    async connect() {
        this.log('Connecting to development server...', 'info');
        
        try {
            // Simulate connection establishment
            this.updateConnectionStatus(false);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.log('WebRTC connected (simulated)', 'success');
            this.updateConnectionStatus(true);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.log('WebTransport connected (simulated)', 'success');
            
            this.connected = true;
            document.getElementById('analyze-btn').disabled = false;
            document.getElementById('complete-btn').disabled = false;
            document.getElementById('connect-btn').textContent = 'Connected';
            document.getElementById('connect-btn').disabled = true;
            
            this.startMetricsPolling();
            
            // Start simulated latency updates
            setInterval(() => {
                const latency = Math.random() * 30 + 15; // 15-45ms
                this.updateLatency(latency);
            }, 2000);
        } catch (error) {
            this.log(`Connection failed: ${error.message}`, 'error');
        }
    }

    async analyzeCode() {
        const code = document.getElementById('code-editor').value;
        
        this.log('Analyzing code...', 'info');
        
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 30));
        
        const symbols = this.mockAnalyzeCode(code);
        this.log(`Analysis complete: ${symbols.length} symbols found`, 'success');
        
        this.metrics.totalRequests++;
        if (Math.random() > 0.3) this.metrics.cacheHits++;
        this.updateCacheRate();
    }

    async getCompletions() {
        const code = document.getElementById('code-editor').value;
        const cursorPos = document.getElementById('code-editor').selectionStart;
        
        this.log('Getting completions...', 'info');
        
        // Simulate completion generation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 40 + 20));
        
        const completions = this.mockGetCompletions(code, cursorPos);
        this.displaySuggestions(completions);
        
        this.metrics.totalRequests++;
        if (Math.random() > 0.25) this.metrics.cacheHits++;
        this.updateCacheRate();
        
        // Update edge node
        const nodes = ['us-west', 'us-east', 'eu-west', 'ap-south'];
        document.getElementById('edge-value').textContent = nodes[Math.floor(Math.random() * nodes.length)];
    }

    mockAnalyzeCode(code) {
        const symbols = [];
        const functionRegex = /function\s+(\w+)|const\s+(\w+)\s*=|let\s+(\w+)\s*=/g;
        let match;
        
        while ((match = functionRegex.exec(code)) !== null) {
            const name = match[1] || match[2] || match[3];
            if (name) {
                symbols.push({ name, type: 'function' });
            }
        }
        
        return symbols;
    }

    mockGetCompletions(code, cursorPos) {
        const prefix = code.substring(0, cursorPos);
        const lastWord = prefix.match(/\w+$/)?.[0] || '';
        
        const suggestions = [
            { text: 'addEventListener', label: 'addEventListener', detail: 'Attaches an event handler' },
            { text: 'getElementById', label: 'getElementById', detail: 'Returns element by ID' },
            { text: 'console.log', label: 'console.log', detail: 'Logs to console' },
            { text: 'Array.from', label: 'Array.from', detail: 'Creates array from iterable' },
            { text: 'Promise.all', label: 'Promise.all', detail: 'Waits for all promises' }
        ];
        
        return suggestions.filter(s => 
            !lastWord || s.text.toLowerCase().includes(lastWord.toLowerCase())
        ).slice(0, 5);
    }

    displaySuggestions(completions) {
        const list = document.getElementById('suggestions-list');
        list.innerHTML = '';
        
        completions.forEach(completion => {
            const item = document.createElement('li');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <strong>${completion.label}</strong>
                ${completion.detail ? `<br><small>${completion.detail}</small>` : ''}
            `;
            item.addEventListener('click', () => this.applySuggestion(completion));
            list.appendChild(item);
        });
        
        this.log(`Received ${completions.length} suggestions`, 'success');
    }

    applySuggestion(completion) {
        const editor = document.getElementById('code-editor');
        const cursorPos = editor.selectionStart;
        const code = editor.value;
        
        // Find the word being typed
        const beforeCursor = code.substring(0, cursorPos);
        const afterCursor = code.substring(cursorPos);
        const wordMatch = beforeCursor.match(/\w+$/);
        const wordStart = wordMatch ? cursorPos - wordMatch[0].length : cursorPos;
        
        editor.value = code.substring(0, wordStart) + completion.text + afterCursor;
        editor.selectionStart = editor.selectionEnd = wordStart + completion.text.length;
        editor.focus();
        
        this.log(`Applied suggestion: ${completion.label}`, 'success');
    }

    handleCodeChange() {
        if (!this.connected) return;
        
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(() => {
            this.log('Context update sent', 'info');
        }, 300);
    }

    updateLatency(latency) {
        this.metrics.latency.push(latency);
        if (this.metrics.latency.length > 100) {
            this.metrics.latency.shift();
        }

        const avg = this.metrics.latency.reduce((a, b) => a + b, 0) / this.metrics.latency.length;
        document.getElementById('latency-value').textContent = `${avg.toFixed(1)}ms`;
        
        const fill = document.getElementById('latency-fill');
        const percentage = Math.min((avg / 200) * 100, 100);
        fill.style.width = `${percentage}%`;
        
        if (avg < 50) {
            fill.style.background = '#4ec9b0';
        } else if (avg < 100) {
            fill.style.background = '#dcdcaa';
        } else {
            fill.style.background = '#f44747';
        }
    }

    updateCacheRate() {
        const rate = this.metrics.totalRequests > 0 
            ? (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(1)
            : 0;
        document.getElementById('cache-value').textContent = `${rate}%`;
    }

    updateConnectionStatus(connected) {
        const status = document.getElementById('connection-status');
        status.className = `status ${connected ? 'connected' : 'disconnected'}`;
    }

    startMetricsPolling() {
        document.getElementById('agents-value').textContent = '5';
        
        // Simulate cache hit rate changes
        setInterval(() => {
            if (Math.random() > 0.7 && this.metrics.totalRequests > 0) {
                this.metrics.cacheHits++;
                this.metrics.totalRequests++;
                this.updateCacheRate();
            }
        }, 5000);
    }

    log(message, type = 'info') {
        const log = document.getElementById('activity-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    generateId() {
        return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.demoClient = new DemoClient();
    });
} else {
    window.demoClient = new DemoClient();
}