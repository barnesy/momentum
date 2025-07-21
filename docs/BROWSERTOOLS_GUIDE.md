# BrowserTools Integration Guide

## Overview

BrowserTools MCP provides AI-driven browser automation and debugging capabilities for the Momentum project. This replaces our previous Puppeteer-based testing infrastructure with a more intuitive, AI-powered approach.

## Installation

BrowserTools is configured via MCP (Model Context Protocol) and requires:
- Node.js 18+
- Google Chrome or Chromium
- An MCP-compatible AI assistant (Claude, Cursor, etc.)

## Configuration

The BrowserTools configuration is defined in `/mcp.json`:

```json
{
  "mcpServers": {
    "browsertools": {
      "command": "npx",
      "args": ["-y", "@agentdesk/browsertools-mcp", "--port", "3000"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Key Features

### 1. Browser Control
- Launch and control Chrome/Chromium browsers
- Navigate to URLs
- Interact with page elements
- Take screenshots

### 2. Debugging Capabilities
- Monitor console logs in real-time
- Inspect network requests
- Enter debugger mode for step-by-step execution
- Inspect and modify DOM elements

### 3. Testing & QA
- Perform visual regression testing
- Run accessibility scans
- Check SEO compliance
- Monitor performance metrics

## Common Commands

### Testing Theme Editor
Instead of complex Puppeteer scripts, simply ask:
- "Open the theme editor and toggle dark mode"
- "Change the primary color to orange and take a screenshot"
- "Check if the theme changes are applied correctly"

### Testing SSE Connection
- "Monitor the SSE connection and check for incoming messages"
- "Verify the connection status shows as 'Connected'"
- "Check network tab for SSE events"

### Component Testing
- "Navigate to the component generator and verify all patterns load"
- "Test the pattern catalog navigation"
- "Check if rejected components display correctly"

### Debugging
- "Enter debugger mode and inspect the current component state"
- "Show me all console errors on this page"
- "Check the network requests for failed API calls"

## Workflow Examples

### Example 1: Visual Regression Test
```
1. "Open http://localhost:5173/src/experiment/"
2. "Take a screenshot of the current theme"
3. "Toggle dark mode"
4. "Take another screenshot"
5. "Compare the two screenshots"
```

### Example 2: Component State Debugging
```
1. "Navigate to the component generator"
2. "Enter debugger mode"
3. "Inspect the component state for pending items"
4. "Check if the rejected components are loading correctly"
```

### Example 3: Performance Testing
```
1. "Open the app and measure page load time"
2. "Check memory usage after navigating through all routes"
3. "Monitor network requests for slow API calls"
```

## Migration from Puppeteer

### What's Removed
- All Puppeteer test files in `/tests/`
- Puppeteer dependencies
- Complex test orchestration scripts
- Manual screenshot management

### What's New
- Natural language browser control
- Real-time debugging capabilities
- Integrated console and network monitoring
- AI-assisted problem solving

## Best Practices

1. **Be Specific**: Instead of "test the app", say "test the theme editor by changing colors and toggling dark mode"

2. **Use Debugger Mode**: When investigating issues, enter debugger mode for detailed inspection

3. **Capture Evidence**: Take screenshots of important states for documentation

4. **Monitor Performance**: Regularly check performance metrics during development

5. **Collaborative Debugging**: Share your debugging session descriptions with the team

## Troubleshooting

### BrowserTools Not Responding
1. Check if Chrome/Chromium is installed
2. Verify the MCP configuration is correct
3. Ensure port 3000 is not in use

### Cannot Find Elements
1. Use more specific selectors
2. Wait for page to fully load
3. Check if elements are in shadow DOM

### Performance Issues
1. Close unnecessary browser tabs
2. Clear browser cache
3. Restart the BrowserTools server

## Team Collaboration

### Sharing Test Scenarios
Document your test scenarios in natural language:
```
Theme Editor Test:
1. Open theme editor
2. Change primary color to #FF5722
3. Toggle dark mode
4. Verify background changes
5. Check if color persists after refresh
```

### Recording Debug Sessions
When debugging issues:
1. Document the steps to reproduce
2. Note any console errors
3. Capture screenshots of the issue
4. Share findings with the team

## Future Enhancements

- Automated test scenario recording
- Visual diff reporting
- Performance benchmarking
- Cross-browser testing support

## Resources

- [BrowserTools Documentation](https://browsertools.agentdesk.ai/)
- [MCP Protocol Spec](https://modelcontextprotocol.com/)
- [Momentum Testing Guide](./TESTING.md)