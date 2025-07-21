import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Keep browser visible
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  console.log('Opening theme editor...');
  await page.goto('http://localhost:5173/src/experiment/index.html');
  
  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Page loaded. Looking for expand buttons...');
  
  // Click all expand buttons to show all sections
  try {
    const expandButtons = await page.$$('button[aria-label*="expand"], svg[data-testid*="AddIcon"]');
    console.log(`Found ${expandButtons.length} potential expand buttons`);
    
    // Click the second button (likely the Color Palette expand)
    if (expandButtons.length >= 2) {
      const button = expandButtons[1];
      const parent = await button.evaluateHandle(el => el.closest('button') || el);
      await parent.click();
      console.log('Clicked Color Palette expand button');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (e) {
    console.log('Could not find expand buttons, trying alternative method...');
    
    // Alternative: click any IconButton that might expand the color section
    const iconButtons = await page.$$('.MuiIconButton-root');
    if (iconButtons.length >= 2) {
      await iconButtons[1].click(); // Usually the second one is Color Palette
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'tests/color-palette-view.png',
    fullPage: true 
  });
  
  console.log('Screenshot saved to tests/color-palette-view.png');
  console.log('Browser will remain open. Close it manually when done.');
  
  // Keep browser open so you can see what's happening
})();