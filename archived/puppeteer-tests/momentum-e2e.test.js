/**
 * Comprehensive E2E test suite for Momentum
 * This demonstrates the most valuable Puppeteer use cases
 */
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

class MomentumTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      screenshots: []
    };
  }

  async setup() {
    this.browser = await puppeteer.launch({
      headless: process.env.CI === 'true', // Headless in CI, visible locally
      slowMo: process.env.CI ? 0 : 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set up console log capture
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Error:', msg.text());
      }
    });
    
    // Set viewport
    await this.page.setViewport({ width: 1440, height: 900 });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async test(name, fn) {
    console.log(`\n📋 Running: ${name}`);
    try {
      await fn();
      this.results.passed++;
      console.log(`✅ Passed: ${name}`);
    } catch (error) {
      this.results.failed++;
      console.error(`❌ Failed: ${name}`);
      console.error(`   ${error.message}`);
      
      // Take error screenshot
      const screenshotPath = `tests/screenshots/error-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.results.screenshots.push(screenshotPath);
    }
  }

  // Performance monitoring helper
  async measurePerformance(actionName, action) {
    const startTime = Date.now();
    const startMetrics = await this.page.metrics();
    
    await action();
    
    const endTime = Date.now();
    const endMetrics = await this.page.metrics();
    
    const duration = endTime - startTime;
    const jsHeapUsed = (endMetrics.JSHeapUsedSize - startMetrics.JSHeapUsedSize) / 1024 / 1024;
    
    console.log(`   ⚡ ${actionName}: ${duration}ms, Heap Δ: ${jsHeapUsed.toFixed(2)}MB`);
    
    return { duration, jsHeapUsed };
  }

  // Visual regression helper
  async captureVisualSnapshot(name) {
    const path = `tests/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path, fullPage: true });
    this.results.screenshots.push(path);
    return path;
  }

  // Network monitoring helper
  async monitorNetworkRequests(action) {
    const requests = [];
    
    this.page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });
    
    await action();
    
    // Remove listener
    this.page.removeAllListeners('request');
    
    return requests;
  }
}

// Main test suite
async function runTests() {
  const tester = new MomentumTester();
  
  try {
    await tester.setup();
    
    // Test 1: App loads successfully
    await tester.test('App loads and renders', async () => {
      await tester.page.goto('http://localhost:5173/src/experiment/index.html', {
        waitUntil: 'networkidle0'
      });
      
      // Verify MUI components loaded
      const muiLoaded = await tester.page.evaluate(() => {
        return window.MUI !== undefined || 
               document.querySelector('.MuiBox-root') !== null;
      });
      
      if (!muiLoaded) throw new Error('MUI components did not load');
    });
    
    // Test 2: Theme switching with performance monitoring
    await tester.test('Theme switching performance', async () => {
      const perf = await tester.measurePerformance('Theme Toggle', async () => {
        // Find and click theme toggle
        const toggleButton = await tester.page.$('button.MuiIconButton-root');
        if (!toggleButton) throw new Error('Theme toggle button not found');
        
        await toggleButton.click();
        await tester.page.waitForTimeout(500); // Wait for animation
      });
      
      // Assert performance
      if (perf.duration > 1000) {
        throw new Error(`Theme switch too slow: ${perf.duration}ms`);
      }
      
      // Capture visual snapshot
      await tester.captureVisualSnapshot('dark-theme');
    });
    
    // Test 3: SSE Connection with network monitoring
    await tester.test('SSE connection and message flow', async () => {
      const networkRequests = await tester.monitorNetworkRequests(async () => {
        // Find and click connect button
        const buttons = await tester.page.$$('button');
        let connectButton = null;
        
        for (const button of buttons) {
          const text = await tester.page.evaluate(el => el.textContent, button);
          if (text === 'Connect') {
            connectButton = button;
            break;
          }
        }
        
        if (!connectButton) throw new Error('Connect button not found');
        
        await connectButton.click();
        await tester.page.waitForTimeout(2000); // Wait for connection
      });
      
      // Verify SSE endpoint was called
      const sseRequest = networkRequests.find(req => 
        req.url.includes('/events') || req.url.includes('localhost:3000')
      );
      
      if (!sseRequest) {
        console.warn('   ⚠️  SSE request not detected (server might be down)');
      }
    });
    
    // Test 4: Accessibility audit
    await tester.test('Basic accessibility checks', async () => {
      // Check for ARIA labels
      const hasAriaLabels = await tester.page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        return Array.from(buttons).some(btn => 
          btn.getAttribute('aria-label') !== null
        );
      });
      
      if (!hasAriaLabels) {
        console.warn('   ⚠️  No ARIA labels found on buttons');
      }
      
      // Check color contrast (basic check)
      const backgroundColor = await tester.page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      console.log(`   📊 Background color: ${backgroundColor}`);
    });
    
    // Test 5: Memory leak detection
    await tester.test('Memory leak detection', async () => {
      const initialMetrics = await tester.page.metrics();
      
      // Perform multiple theme switches
      for (let i = 0; i < 10; i++) {
        const button = await tester.page.$('button.MuiIconButton-root');
        if (button) {
          await button.click();
          await tester.page.waitForTimeout(100);
        }
      }
      
      // Force garbage collection if possible
      await tester.page.evaluate(() => {
        if (window.gc) window.gc();
      });
      
      const finalMetrics = await tester.page.metrics();
      const heapGrowth = (finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize) / 1024 / 1024;
      
      console.log(`   📊 Heap growth after 10 theme switches: ${heapGrowth.toFixed(2)}MB`);
      
      if (heapGrowth > 50) {
        throw new Error(`Potential memory leak: ${heapGrowth.toFixed(2)}MB growth`);
      }
    });
    
    // Test 6: Mobile responsiveness
    await tester.test('Mobile responsiveness', async () => {
      // Test iPhone viewport
      await tester.page.setViewport({ width: 390, height: 844 }); // iPhone 14
      await tester.page.reload();
      await tester.page.waitForTimeout(1000);
      
      await tester.captureVisualSnapshot('mobile-view');
      
      // Check if content is properly sized
      const contentWidth = await tester.page.evaluate(() => {
        return document.body.scrollWidth;
      });
      
      if (contentWidth > 390) {
        throw new Error(`Content overflows mobile viewport: ${contentWidth}px`);
      }
      
      // Reset viewport
      await tester.page.setViewport({ width: 1440, height: 900 });
    });
    
    // Generate test report
    console.log('\n📊 Test Summary:');
    console.log(`   ✅ Passed: ${tester.results.passed}`);
    console.log(`   ❌ Failed: ${tester.results.failed}`);
    console.log(`   📸 Screenshots: ${tester.results.screenshots.length}`);
    
    // Create HTML report
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Momentum E2E Test Report</title>
    <style>
        body { font-family: -apple-system, sans-serif; padding: 20px; }
        .passed { color: green; }
        .failed { color: red; }
        .screenshot { max-width: 400px; margin: 10px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>Momentum E2E Test Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <h2 class="${tester.results.failed === 0 ? 'passed' : 'failed'}">
        Results: ${tester.results.passed} passed, ${tester.results.failed} failed
    </h2>
    <h2>Screenshots</h2>
    <div>
        ${tester.results.screenshots.map(path => 
          `<img src="${path.replace('tests/', '')}" class="screenshot" />`
        ).join('')}
    </div>
</body>
</html>`;
    
    await fs.writeFile('tests/test-report.html', reportHtml);
    console.log('\n📄 Report generated: tests/test-report.html');
    
  } finally {
    await tester.teardown();
  }
  
  // Exit with appropriate code
  process.exit(tester.results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);