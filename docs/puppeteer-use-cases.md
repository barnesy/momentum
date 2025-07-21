# Best Ways to Use Puppeteer for Momentum

## 1. 🧪 End-to-End (E2E) Testing

### User Journey Tests
Test complete user workflows from start to finish:

```javascript
// tests/e2e/user-journey.test.js
describe('Developer Workflow', () => {
  test('Developer connects, changes theme, and sends context', async () => {
    // 1. Load the app
    // 2. Connect to SSE
    // 3. Change theme colors
    // 4. Send context update
    // 5. Verify context appears in message log
  });
});
```

### Cross-Browser Testing
```javascript
// Test in different browsers
const browsers = ['chrome', 'firefox', 'webkit'];
for (const browserType of browsers) {
  await playwright[browserType].launch();
}
```

## 2. 📸 Visual Regression Testing

### Automated Screenshot Comparison
```javascript
// tests/visual/theme-regression.test.js
import { toMatchImageSnapshot } from 'jest-image-snapshot';

test('Theme editor matches baseline', async () => {
  const screenshot = await page.screenshot();
  expect(screenshot).toMatchImageSnapshot({
    customSnapshotsDir: './tests/visual/snapshots',
    customDiffDir: './tests/visual/diffs',
    threshold: 0.01 // 1% difference threshold
  });
});
```

### Component Visual Testing
- Screenshot individual components in different states
- Test responsive design at different viewports
- Verify dark/light mode rendering

## 3. 🎭 Real User Monitoring (RUM) Simulation

### Performance Testing
```javascript
// tests/performance/load-time.test.js
const metrics = await page.metrics();
const performanceTiming = await page.evaluate(() => 
  JSON.stringify(window.performance.timing)
);

// Assert performance benchmarks
expect(metrics.TaskDuration).toBeLessThan(3000);
expect(loadTime).toBeLessThan(2000);
```

### Network Condition Testing
```javascript
// Test under different network conditions
await page.emulateNetworkConditions({
  offline: false,
  downloadThroughput: 50 * 1024, // 50kb/s
  uploadThroughput: 20 * 1024,
  latency: 500
});
```

## 4. 🤖 Automated GitHub Integration Testing

### Test Your Chrome Extension on Real GitHub Pages
```javascript
// tests/extension/github-integration.test.js
test('Extension detects React components on GitHub', async () => {
  // Load extension
  const browser = await puppeteer.launch({
    args: [`--load-extension=${extensionPath}`]
  });
  
  // Navigate to a React GitHub repo
  await page.goto('https://github.com/facebook/react');
  
  // Verify extension UI appears
  // Test error detection
  // Test context capture
});
```

## 5. 📊 Automated Reporting & Monitoring

### Generate Test Reports
```javascript
// tests/utils/report-generator.js
async function generateReport() {
  const results = await runAllTests();
  
  // Generate HTML report with screenshots
  const html = `
    <h1>Momentum Test Report - ${new Date()}</h1>
    <h2>Visual Tests: ${results.visual.passed}/${results.visual.total}</h2>
    <h2>E2E Tests: ${results.e2e.passed}/${results.e2e.total}</h2>
    ${results.screenshots.map(img => `<img src="${img}" />`)}
  `;
  
  await fs.writeFile('test-report.html', html);
}
```

## 6. 🎨 Design System Documentation

### Auto-generate Component Gallery
```javascript
// scripts/generate-component-docs.js
async function documentComponents() {
  const components = ['Button', 'Card', 'Theme Editor'];
  
  for (const component of components) {
    // Navigate to component
    await page.goto(`http://localhost:5173/components/${component}`);
    
    // Screenshot all variations
    await captureVariations(component);
  }
}
```

## 7. 🐛 Debugging Production Issues

### Record User Sessions
```javascript
// Reproduce user-reported bugs
await page.startTracing({ screenshots: true });
// ... reproduce issue
const trace = await page.stopTracing();
// Analyze trace file
```

## 8. 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/visual-tests.yml
name: Visual Regression Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Puppeteer tests
        run: |
          npm install
          npm run test:visual
      - uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: tests/screenshots
```

## 9. 📱 Device Testing

### Mobile Responsive Testing
```javascript
const devices = puppeteer.devices;
const iPhone = devices['iPhone 12'];

await page.emulate(iPhone);
await page.goto('http://localhost:5173');
await page.screenshot({ path: 'mobile-view.png' });
```

## 10. 🔍 Accessibility Testing

### Automated A11y Audits
```javascript
// tests/a11y/accessibility.test.js
import { AxePuppeteer } from '@axe-core/puppeteer';

test('Theme editor is accessible', async () => {
  const results = await new AxePuppeteer(page)
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
    
  expect(results.violations).toHaveLength(0);
});
```

## Implementation Priority for Momentum

1. **Start with E2E tests** for critical user paths
2. **Add visual regression** for theme changes
3. **Monitor performance** metrics
4. **Test extension** on real GitHub pages
5. **Automate in CI/CD** for every PR

## Sample Test Suite Structure

```
tests/
├── e2e/
│   ├── connection.test.js
│   ├── theme-editor.test.js
│   └── context-manager.test.js
├── visual/
│   ├── snapshots/
│   └── theme-variations.test.js
├── performance/
│   └── load-metrics.test.js
├── extension/
│   └── github-integration.test.js
└── utils/
    ├── test-helpers.js
    └── report-generator.js
```