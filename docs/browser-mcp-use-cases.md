# Browser MCP Use Cases for Momentum

## What is Browser MCP?

Browser MCP allows Claude to directly control a browser instance, similar to Puppeteer but integrated into the conversation. This means I can:
- Navigate to pages and interact with them in real-time
- Take screenshots and analyze what's on screen
- Fill out forms and click buttons
- Debug issues by seeing exactly what you're seeing

## Key Differences from Puppeteer

| Feature | Puppeteer | Browser MCP |
|---------|-----------|-------------|
| Control | You write scripts | Claude controls directly |
| Feedback | Async/delayed | Real-time in conversation |
| Debugging | Console logs | Claude sees what happens |
| Use Case | Automated testing | Interactive debugging |

## Best Use Cases for Momentum

### 1. 🐛 Live Debugging Sessions

**Scenario**: "The theme editor isn't working correctly"

With Browser MCP, I can:
```
1. Open your app in the browser
2. See exactly what you're seeing
3. Try different interactions
4. Take screenshots of the issue
5. Suggest fixes based on what I observe
```

### 2. 🎯 Interactive Feature Testing

**Scenario**: "Can you test if the SSE connection works?"

I can:
```
1. Navigate to your app
2. Click the Connect button
3. Watch for connection status changes
4. Monitor network activity
5. Report back what actually happens
```

### 3. 📋 Form Filling and Data Entry

**Scenario**: "Set up test data in the app"

I can:
```
1. Open your theme editor
2. Change color values
3. Toggle dark mode
4. Send context updates
5. Create specific UI states for testing
```

### 4. 🔍 Cross-Browser Compatibility Checking

**Scenario**: "Does this work in Safari?"

I can:
```
1. Open your app in different browsers
2. Test the same features
3. Screenshot differences
4. Report compatibility issues
```

### 5. 📸 Documentation Screenshots

**Scenario**: "Generate screenshots for the README"

I can:
```
1. Open your app
2. Set up specific states (light/dark mode)
3. Take clean screenshots
4. Generate a gallery of features
```

### 6. 🎨 Design Review and Feedback

**Scenario**: "How does the new theme look?"

I can:
```
1. Open the app
2. Try different color combinations
3. Test responsive layouts
4. Provide visual feedback with screenshots
```

### 7. 🔄 Reproduction of User-Reported Issues

**Scenario**: "A user says clicking X causes Y"

I can:
```
1. Follow the exact steps
2. See if I can reproduce it
3. Document what happens
4. Explore edge cases
```

### 8. 🚦 Pre-Deployment Smoke Tests

**Scenario**: "Quick check before pushing to production"

I can:
```
1. Open staging environment
2. Click through critical paths
3. Verify everything loads
4. Check for console errors
```

## Example Browser MCP Workflow

Here's how a typical debugging session might go:

```
You: "The dark mode toggle isn't working"

Claude: "Let me open your app and check..."
[Opens http://localhost:5173/src/experiment/index.html]
[Takes screenshot]
"I can see the theme editor. Let me click the toggle button..."
[Clicks the first IconButton]
[Takes another screenshot]
"I notice the button clicked but the theme didn't change. Let me check the console..."
[Checks browser console]
"I see an error: 'Cannot read property mode of undefined'. The theme context might not be properly initialized."
```

## Best Practices with Browser MCP

1. **Be Specific**: Tell me exactly what URL to visit and what to look for
2. **Provide Context**: Let me know what should happen vs what's actually happening  
3. **Use for Debugging**: It's perfect for "can you see what I see?" moments
4. **Screenshots**: Ask me to take screenshots at key moments
5. **Interactive Testing**: Use it to test flows that are hard to automate

## When to Use Browser MCP vs Puppeteer

### Use Browser MCP when:
- You need immediate feedback
- You're debugging a specific issue
- You want Claude to explore and discover issues
- You need help understanding what's happening
- You're doing exploratory testing

### Use Puppeteer when:
- You need repeatable automated tests
- You're setting up CI/CD pipelines
- You need performance benchmarks
- You want to test multiple scenarios quickly
- You're doing regression testing

## Quick Commands You Can Give Me

- "Open my theme editor and try changing colors"
- "Test if the SSE connection works"
- "Take screenshots of the app in light and dark mode"
- "Check if the extension works on GitHub"
- "Try to break the theme editor and see what happens"
- "Test the mobile view on iPhone 14 size"
- "Fill in the context form and send a message"
- "Check for any console errors while using the app"

## Integration with Your Workflow

1. **During Development**: "Check if my latest change fixed the issue"
2. **Before Commits**: "Quick smoke test of the main features"
3. **Issue Investigation**: "Can you reproduce this bug?"
4. **Documentation**: "Take screenshots for the feature guide"
5. **Design Reviews**: "How does this look with different themes?"