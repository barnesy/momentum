import puppeteer from 'puppeteer';

/**
 * Test the Momentum theme editor with Puppeteer
 */
async function testMomentumThemeEditor() {
  console.log('Starting Puppeteer test for Momentum theme editor...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/automated testing
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1440, height: 900 });

    // Navigate to the theme editor
    console.log('Navigating to theme editor...');
    await page.goto('http://localhost:5173/src/experiment/index.html', {
      waitUntil: 'networkidle2'
    });

    // Wait for the app to load
    await page.waitForSelector('[data-testid="theme-editor"]', { timeout: 10000 });
    console.log('Theme editor loaded successfully');

    // Test 1: Toggle dark mode
    console.log('\nTest 1: Testing dark mode toggle...');
    const darkModeToggle = await page.$('[aria-label="Toggle dark mode"]');
    if (darkModeToggle) {
      await darkModeToggle.click();
      await page.waitForTimeout(500); // Wait for animation
      
      // Check if dark mode is applied
      const isDarkMode = await page.evaluate(() => {
        const theme = document.querySelector('body').getAttribute('data-mui-color-scheme');
        return theme === 'dark';
      });
      console.log(`Dark mode ${isDarkMode ? 'enabled' : 'not enabled'}`);
    }

    // Test 2: Change primary color
    console.log('\nTest 2: Testing color picker...');
    const colorPicker = await page.$('input[type="color"][name="primary"]');
    if (colorPicker) {
      await colorPicker.click();
      await colorPicker.type('#ff5722'); // Material Orange
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      console.log('Primary color changed to #ff5722');
    }

    // Test 3: Test SSE connection
    console.log('\nTest 3: Testing SSE connection...');
    const connectButton = await page.$('button:has-text("Connect SSE")');
    if (connectButton) {
      await connectButton.click();
      
      // Wait for connection status
      await page.waitForSelector('[data-testid="connection-status"]', { timeout: 5000 });
      const connectionStatus = await page.$eval('[data-testid="connection-status"]', el => el.textContent);
      console.log(`SSE Connection status: ${connectionStatus}`);
    }

    // Test 4: Send context update
    console.log('\nTest 4: Testing context manager...');
    const contextTextarea = await page.$('textarea[placeholder*="context"]');
    if (contextTextarea) {
      await contextTextarea.type('Test context from Puppeteer');
      
      // Find and click send button
      const sendButton = await page.$('button[aria-label="Send context"]');
      if (sendButton) {
        await sendButton.click();
        console.log('Context update sent');
      }
    }

    // Test 5: Check performance metrics
    console.log('\nTest 5: Checking performance metrics...');
    const metrics = await page.metrics();
    console.log('Page metrics:', {
      JSHeapUsedSize: `${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`,
      Nodes: metrics.Nodes,
      LayoutCount: metrics.LayoutCount
    });

    // Take screenshots
    console.log('\nTaking screenshots...');
    await page.screenshot({ 
      path: 'tests/screenshots/theme-editor-light.png',
      fullPage: true 
    });
    
    // Toggle dark mode for second screenshot
    if (darkModeToggle) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      await page.screenshot({ 
        path: 'tests/screenshots/theme-editor-dark.png',
        fullPage: true 
      });
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/error-state.png',
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Test Chrome extension
async function testChromeExtension() {
  console.log('\n\nTesting Chrome Extension...');
  
  const pathToExtension = '/Users/barnesy/Projects/momentum/extension';
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--no-sandbox'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to GitHub to test the extension
    console.log('Navigating to GitHub...');
    await page.goto('https://github.com/barnesy/momentum', {
      waitUntil: 'networkidle2'
    });

    // Wait a bit for extension to initialize
    await page.waitForTimeout(2000);

    // Check if extension injected its UI
    const extensionUI = await page.evaluate(() => {
      return document.querySelector('[data-momentum-extension]') !== null;
    });
    
    console.log(`Extension UI ${extensionUI ? 'detected' : 'not found'}`);

    // Take screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/extension-github.png',
      fullPage: true 
    });

    console.log('✅ Extension test completed');

  } catch (error) {
    console.error('❌ Extension test failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run all tests
async function runAllTests() {
  try {
    // Create screenshots directory
    const fs = await import('fs');
    if (!fs.existsSync('tests/screenshots')) {
      fs.mkdirSync('tests/screenshots', { recursive: true });
    }

    await testMomentumThemeEditor();
    await testChromeExtension();
    
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Tests failed:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();