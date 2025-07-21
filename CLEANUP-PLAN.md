# Momentum Project Cleanup Plan

## Phase 1: Remove Obvious Dead Code
1. Delete old HTML experiments:
   - `experiment.html` (replaced by TypeScript version)
   - `momentum-ui-demo.html` (different UI framework)
   - `network-viz.html` (standalone visualization)
   - `test-sse.html` (functionality in React app)
   - `test-error.html` (minimal test page)
   - `src/demo/index-old.html` (528 lines of old code)

2. Remove duplicate test files:
   - `test-error-logger.js`
   - `test-page.html`
   - Move `test-momentum.js` to proper test directory

3. Choose one extension version (recommend extension-v2)

## Phase 2: Consolidate Code
1. Create shared modules:
   - `src/utils/connection.ts` - SSE and WebSocket logic
   - `src/config/index.ts` - Centralized configuration

2. Update all hardcoded URLs to use config

3. Remove unused dependencies from package.json

## Phase 3: Organize Structure
```
momentum/
├── src/
│   ├── app/           # Main React application
│   ├── extension/     # Chrome extension (v2 only)
│   ├── server/        # Backend server
│   ├── shared/        # Shared utilities
│   └── types/         # TypeScript types
├── docs/              # Consolidated documentation
├── scripts/           # Build and utility scripts
└── tests/             # Organized test suite
```

## Phase 4: Documentation
1. Merge all README files into one comprehensive README.md
2. Archive old documentation in docs/archive/
3. Create clear setup and usage instructions

## Tech Debt Metrics
- **Files to Remove**: ~15
- **Lines of Dead Code**: ~3,000+
- **Duplicate Implementations**: 5 (SSE connections)
- **Unused Dependencies**: 3-5
- **Time Estimate**: 2-3 hours for complete cleanup