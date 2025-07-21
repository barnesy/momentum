# Momentum ⚡

A real-time development context system that tracks your coding momentum across GitHub and your local environment.

## Overview

Momentum provides intelligent context awareness by:
- 📊 Tracking code changes in real-time
- 🔍 Analyzing patterns across your repositories  
- 🤖 Providing AI-powered insights
- 🚀 Accelerating your development workflow

## Tech Stack

- **Frontend**: React 19 + TypeScript + Material-UI (MUI)
- **Build Tool**: Vite 7
- **Backend**: Node.js + Express
- **Extension**: Chrome Manifest V3
- **Real-time**: Server-Sent Events (SSE) + WebSockets

## Project Structure

```
momentum/
├── src/                    # Main application source
│   ├── experiment/         # React TypeScript app
│   ├── theme/              # MUI theme configuration
│   ├── types/              # TypeScript type definitions
│   └── demo/               # Demo components
├── github-app/             # GitHub integration server
│   └── src/                # Server source files
├── extension/              # Chrome extension (v2)
├── scripts/                # Build and utility scripts
├── tests/                  # Test files
└── docs/                   # Documentation
```

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for a 2-minute setup guide!

1. Install dependencies:
```bash
npm install
cd github-app && npm install
```

2. Configure environment:
```bash
cp github-app/.env.example github-app/.env
# Add your GitHub App credentials and OpenAI API key
```

## 🤝 Contributing

We welcome contributions! Please see:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [REPOSITORY_PERMISSIONS.md](docs/REPOSITORY_PERMISSIONS.md) - Fixing permission issues

### Quick Contribution Setup
```bash
# For new contributors
npm run setup:contributor

# For pattern generation
npm run dev:experiment
npm run create:pattern-branch "feature/your-patterns"
npm run submit:patterns
```

3. Start the development server:
```bash
npm run dev              # Starts Vite dev server on http://localhost:5173
```

4. Start the backend server:
```bash
cd github-app
npm run dev              # Starts server on http://localhost:3000
```

5. Load the Chrome extension:
   - Open Chrome Extensions (chrome://extensions)
   - Enable Developer Mode
   - Load unpacked from `extension/`

## Main Features

### Live Theme Editor
Access the theme editor at http://localhost:5173/src/experiment/index.html
- Real-time theme customization
- Material-UI component preview
- CSS variable integration
- Responsive design testing

### Context Management
- Automatic context tracking
- Pattern detection and analysis
- Error monitoring with AI-powered fixes
- Performance metrics visualization

### Chrome Extension
- GitHub activity monitoring
- Real-time error detection
- Autonomous fix suggestions
- MUI component detection

## Development Scripts

```bash
# Frontend
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript checks

# Backend (in github-app/)
npm run dev         # Start with auto-reload
npm run start       # Start production server
npm run claude      # Start Claude listener
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│    Vite +    │────▶│   GitHub    │
│  Extension  │◀────│ Express API  │◀────│   Webhooks  │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       └────────────────────┴─────────────────────┘
                     SSE + WebSocket
```

## Environment Variables

### GitHub App (.env)
```
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY=your_private_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret
OPENAI_API_KEY=your_openai_key
```

## Testing

```bash
# Run all tests
cd scripts && ./test-system.sh

# Test individual components
node tests/test-error-logger.js
```

## Troubleshooting

### Vite Import Errors
If you see "Failed to resolve import" errors:
1. Ensure all imports use relative paths (not aliases)
2. Check that file extensions are included for TypeScript files
3. Restart the Vite dev server

### Port Conflicts
- Frontend: http://localhost:5173 (Vite)
- Backend API: http://localhost:3000 (Express)
- Error Reporter: http://localhost:8765
- Claude Listener: http://localhost:8766

### Extension Not Loading
1. Check that manifest.json is valid
2. Ensure all referenced files exist
3. Check Chrome DevTools for errors

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checks
4. Submit a pull request

## License

MIT