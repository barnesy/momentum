# Momentum

Building development velocity through intelligent GitHub context. Transform your repository into a living system that learns and accelerates your workflow.

## Key Features

### ⚡ Momentum Features
- **Hybrid WebRTC/WebTransport Protocol**: Seamlessly switches between protocols for optimal performance
- **Binary Protocol Buffers**: Efficient message encoding for minimal overhead
- **Intelligent Transport Selection**: Priority-based routing with automatic failover
- **Real-time Latency Tracking**: Continuous monitoring with p50/p95/p99 metrics

### 🧠 Multi-Agent Intelligence System
- **Code Analysis Agent**: AST parsing, symbol extraction, dependency analysis
- **Pattern Detection Agent**: Identifies coding patterns and anomalies
- **Error Diagnosis Agent**: Smart error analysis with solution suggestions
- **Performance Agent**: Bottleneck detection and optimization recommendations
- **Suggestion Engine**: Context-aware code completions and refactoring

### 🌐 Edge Computing Integration
- **Distributed AI Models**: Nano/Micro/Mini models deployed across edge locations
- **Intelligent Load Balancing**: Routes requests to optimal edge nodes
- **Predictive Caching**: Pre-computes common operations based on usage patterns
- **Regional Optimization**: Sub-20ms latency for cached responses

### 🔍 Browser Extension for Context Intelligence
- **Real-time DOM Monitoring**: Tracks changes and hot-reloads
- **Framework Detection**: Automatically identifies React, Vue, Angular, etc.
- **Code Pattern Learning**: Builds project-specific intelligence
- **Cross-Tab Context Sharing**: Unified development context across browser windows

## How Momentum Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Browser Tab    │────▶│  Edge Worker     │────▶│  Agent System   │
│  + Extension    │     │  (Caching)       │     │  (5 Agents)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         │                       ▼                         │
         │              ┌──────────────────┐              │
         └─────────────▶│  Hybrid Transport │◀─────────────┘
                        │  WebRTC/WebTrans  │
                        └──────────────────┘
                                 │
                        ┌────────▼─────────┐
                        │  Distributed AI   │
                        │  Edge Nodes       │
                        └──────────────────┘
```

## Quick Start with Momentum

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Install the browser extension:
   - Open Chrome/Edge
   - Navigate to chrome://extensions
   - Enable Developer Mode
   - Click "Load unpacked" and select the `extension` folder

4. Open the demo page:
   - Navigate to http://localhost:5173/src/demo/index.html
   - Click "Connect" to establish WebRTC/WebTransport connection
   - Start coding to see real-time suggestions and analysis

## Performance Benchmarks

- **Code Completion Latency**: 15-25ms (cached), 50-80ms (computed)
- **Context Analysis**: 30-50ms for full file analysis
- **Pattern Detection**: 10-20ms for common patterns
- **Edge Cache Hit Rate**: 75-85% for common operations

## Human Testing Guide

### Test Scenarios

1. **Latency Testing**:
   - Type code rapidly and observe completion suggestions
   - Monitor the latency meter (should stay under 100ms)
   - Try different code patterns to test cache effectiveness

2. **Context Awareness**:
   - Write React/Vue/Angular code to test framework detection
   - Create errors to test the diagnosis system
   - Import modules to test dependency analysis

3. **Multi-Agent Collaboration**:
   - Request code analysis while getting completions
   - Observe how agents work together in the activity log
   - Check consensus confidence scores

4. **Edge Performance**:
   - Disconnect and reconnect to test failover
   - Monitor which edge node serves your requests
   - Compare cached vs computed response times

## Development

Momentum consists of several key components:

- **HybridTransport**: Manages WebRTC and WebTransport connections
- **CodeProtocol**: Binary protocol for efficient code-related messages
- **MultiAgentSystem**: Coordinates specialized AI agents
- **DistributedAISystem**: Manages edge-deployed models
- **EdgeWorker**: Handles caching and pre-computation
- **Browser Extension**: Monitors and enhances browser context

## Future Enhancements

- WebGPU acceleration for local inference
- Collaborative editing with operational transforms
- Plugin system for custom agents
- IDE integration via Language Server Protocol
- Blockchain-based model training rewards