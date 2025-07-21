# Archived Puppeteer Tests

This directory contains the archived Puppeteer-based testing infrastructure that has been replaced by BrowserTools MCP integration.

## Migration Date
July 21, 2025

## Why These Were Archived

We migrated from Puppeteer to BrowserTools MCP for the following benefits:
- AI-driven browser automation (natural language commands)
- Real-time debugging capabilities
- Integrated console and network monitoring
- Simplified test maintenance
- No complex test scripts to maintain

## Archived Files

- `puppeteer-test.js` - Main Puppeteer test suite for theme editor and extension
- `interactive-test.js` - Interactive UI testing with visual feedback
- `simple-puppeteer-demo.js` - Basic Puppeteer demonstration
- `momentum-e2e.test.js` - End-to-end test suite
- `puppeteer-use-cases.md` - Documentation for Puppeteer use cases

## How to Use BrowserTools Instead

See `/docs/BROWSERTOOLS_GUIDE.md` for the new testing approach.

### Quick Examples

**Instead of Puppeteer script:**
```javascript
await page.goto('http://localhost:5173');
await page.click('[data-testid="theme-toggle"]');
await page.screenshot({path: 'screenshot.png'});
```

**Use BrowserTools command:**
"Navigate to localhost:5173, toggle the theme, and take a screenshot"

## If You Need These Files

These files are kept for reference only. The project no longer uses Puppeteer.
If you need to reference the old testing patterns, they are preserved here.

For new testing needs, use BrowserTools MCP integration.