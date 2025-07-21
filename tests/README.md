# Testing with BrowserTools

## Overview

Testing in the Momentum project is now powered by BrowserTools MCP, providing AI-driven browser automation and debugging capabilities.

## Getting Started

1. Ensure BrowserTools is configured (see `/mcp.json`)
2. Start your development server: `npm run dev`
3. Use natural language commands to test

## Common Test Scenarios

### Theme Editor Testing
```
"Open the theme editor and test dark mode toggle"
"Change the primary color to orange and verify it applies"
"Take screenshots of light and dark themes"
```

### SSE Connection Testing
```
"Check if SSE connection is established"
"Monitor network tab for SSE events"
"Verify connection status shows as 'Connected'"
```

### Component Generator Testing
```
"Navigate to component generator and verify all tabs work"
"Check if pending components section is empty"
"Verify rejected components are displayed correctly"
```

### Pattern Catalog Testing
```
"Open pattern catalog and verify navigation"
"Test pattern preview functionality"
"Check if approved patterns load correctly"
```

## Debugging Workflows

### Finding Issues
```
"Show me all console errors on this page"
"Check network requests for failed API calls"
"Inspect the current component state"
```

### Performance Testing
```
"Measure page load time"
"Check memory usage after navigation"
"Monitor for memory leaks during theme changes"
```

## Visual Testing

### Screenshot Comparisons
```
"Take a screenshot of the current state"
"Make changes and take another screenshot"
"Compare the before and after states"
```

### Responsive Testing
```
"Test the app at mobile viewport (375x667)"
"Check if navigation works on tablet size"
"Verify responsive layout at 1920x1080"
```

## Best Practices

1. **Be Specific**: Provide clear, detailed instructions
2. **Use Selectors When Needed**: "Click the button with text 'Connect'"
3. **Wait for States**: "Wait for the loading spinner to disappear"
4. **Capture Evidence**: Take screenshots of important states
5. **Document Issues**: Note console errors and network failures

## Example Test Session

```
1. "Open http://localhost:5173/src/experiment/"
2. "Wait for the app to fully load"
3. "Click on the theme editor navigation item"
4. "Toggle dark mode and verify the background changes"
5. "Change the primary color to #FF5722"
6. "Take a screenshot of the customized theme"
7. "Refresh the page and verify settings persist"
8. "Check console for any errors"
```

## Troubleshooting

### Element Not Found
- Use more specific selectors
- Wait for dynamic content to load
- Check if element is in viewport

### Test Failures
- Check if dev server is running
- Verify the URL is correct
- Look for console errors

### Performance Issues
- Close other browser tabs
- Clear browser cache
- Check system resources

## Migration from Puppeteer

If you're familiar with our old Puppeteer tests:
- Archived tests are in `/archived/puppeteer-tests/`
- See `/docs/BROWSERTOOLS_GUIDE.md` for detailed migration guide
- Focus on describing what to test, not how to test

## Resources

- [BrowserTools Guide](/docs/BROWSERTOOLS_GUIDE.md)
- [Component Testing Patterns](/docs/COMPONENT_TESTING.md)
- [Debugging Guide](/docs/DEBUGGING.md)