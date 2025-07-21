// Simple Puppeteer test for the theme editor
import puppeteer from 'puppeteer';

async function testThemeEditor() {
  console.log('🚀 Starting theme editor test...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    console.log('📍 Navigating to http://localhost:5173/src/experiment/index.html');
    await page.goto('http://localhost:5173/src/experiment/index.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if the page loaded
    const title = await page.title();
    console.log(`✅ Page loaded with title: "${title}"`);

    // Look for MUI components
    console.log('\n🔍 Checking for MUI components...');
    
    const hasMuiApp = await page.evaluate(() => {
      return !!document.querySelector('[class*="MuiBox-root"]');
    });
    console.log(`MUI Box component: ${hasMuiApp ? '✅ Found' : '❌ Not found'}`);

    const hasAppBar = await page.evaluate(() => {
      return !!document.querySelector('[class*="MuiAppBar-root"]');
    });
    console.log(`MUI AppBar: ${hasAppBar ? '✅ Found' : '❌ Not found'}`);

    // Check for dark mode toggle
    const hasDarkModeToggle = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => 
        btn.getAttribute('aria-label')?.includes('dark mode') ||
        btn.textContent?.toLowerCase().includes('dark')
      );
    });
    console.log(`Dark mode toggle: ${hasDarkModeToggle ? '✅ Found' : '❌ Not found'}`);

    // Take a screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'tests/theme-editor-test.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved to tests/theme-editor-test.png');

    // Get page content for debugging
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('\n📄 Page content preview:');
    console.log(bodyText.substring(0, 200) + '...');

    console.log('\n✨ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'tests/error-screenshot.png',
      fullPage: true 
    });
    console.log('📸 Error screenshot saved to tests/error-screenshot.png');
    
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed');
  }
}

// Run the test
testThemeEditor().catch(console.error);