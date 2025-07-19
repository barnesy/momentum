# GitHub Living Context App

A GitHub App that transforms your repository into a self-improving development context system with ultra-low latency feedback.

## Features

- 🚀 **<100ms feedback loops** via webhooks and WebSockets
- 🧠 **Self-learning context** that improves over time
- 📊 **Real-time metrics** tracking development velocity
- 🔄 **Automatic documentation** from actual usage
- 💡 **Intelligent suggestions** based on patterns

## Architecture

```
GitHub Events → Webhook → Edge Worker → WebSocket → Browser
     ↓                         ↓                        ↓
Context Store ← GitHub API ← Analytics ← Learning System
```

## Quick Setup

1. **Create GitHub App**:
   - Go to Settings → Developer settings → GitHub Apps → New GitHub App
   - Use the manifest.json from this directory
   - Install on your repository

2. **Deploy Edge Worker**:
   ```bash
   npm install
   npm run deploy
   ```

3. **Connect Browser**:
   - Install browser extension
   - Open your repository
   - Watch context flow in real-time!

## How It Works

Every GitHub event (commits, PRs, issues, discussions) feeds into a living context system that:

1. **Captures** - All development activity
2. **Analyzes** - Patterns and velocity
3. **Learns** - What speeds you up
4. **Suggests** - Improvements in real-time
5. **Evolves** - Gets smarter with use