// Simple Puppeteer demo showing how to test your Momentum app
import puppeteer from 'puppeteer';

async function runDemo() {
  console.log('🚀 Puppeteer Demo for Momentum\n');
  
  // Launch browser in non-headless mode so you can watch
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100, // Slow down by 100ms per action
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  console.log('1️⃣ Opening your Momentum theme editor...');
  await page.goto('http://localhost:5173/src/experiment/index.html');
  
  // Wait for React to render
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('2️⃣ Taking a screenshot of the initial state...');
  await page.screenshot({ path: 'tests/demo-1-initial.png' });
  
  console.log('3️⃣ Clicking the first button (should be dark mode toggle)...');
  const firstButton = await page.$('button.MuiIconButton-root');
  if (firstButton) {
    await firstButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'tests/demo-2-after-toggle.png' });
  }
  
  console.log('4️⃣ Looking for the Connect button...');
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const text = await page.evaluate(el => el.textContent, button);
    if (text === 'Connect') {
      console.log('   ✅ Found Connect button, clicking it...');
      await button.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.screenshot({ path: 'tests/demo-3-after-connect.png' });
      break;
    }
  }
  
  console.log('5️⃣ Demonstrating navigation...');
  // Click on different navigation items if they exist
  const navItems = await page.$$('[role="navigation"] button, nav button');
  console.log(`   Found ${navItems.length} navigation items`);
  
  console.log('\n✅ Demo complete! Check the screenshots in the tests/ folder:');
  console.log('   - tests/demo-1-initial.png');
  console.log('   - tests/demo-2-after-toggle.png');
  console.log('   - tests/demo-3-after-connect.png');
  
  console.log('\n⏰ Keeping browser open for 10 seconds so you can explore...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  await browser.close();
  console.log('👋 Done!');
}

// Also export some useful Puppeteer patterns for testing
export const PuppeteerPatterns = {
  // Wait for React to render
  waitForReact: async (page, timeout = 3000) => {
    await new Promise(resolve => setTimeout(resolve, timeout));
  },
  
  // Click button by text
  clickButtonByText: async (page, text) => {
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const buttonText = await page.evaluate(el => el.textContent, button);
      if (buttonText?.includes(text)) {
        await button.click();
        return true;
      }
    }
    return false;
  },
  
  // Get all MUI component classes on page
  getMuiComponents: async (page) => {
    return await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="Mui"]');
      const classes = new Set();
      elements.forEach(el => {
        const matches = el.className.toString().match(/Mui[\w-]+/g);
        if (matches) matches.forEach(m => classes.add(m));
      });
      return Array.from(classes);
    });
  },
  
  // Check theme mode
  getThemeMode: async (page) => {
    return await page.evaluate(() => {
      return document.body.getAttribute('data-mui-color-scheme') || 
             (document.body.classList.contains('dark') ? 'dark' : 'light');
    });
  }
};

// Run the demo
runDemo().catch(console.error);