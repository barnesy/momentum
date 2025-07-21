import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  console.log('Navigating to theme editor...');
  await page.goto('http://localhost:5173/src/experiment/index.html', {
    waitUntil: 'networkidle0'
  });

  // Wait for the app to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Find and expand the Color Palette section
  console.log('Looking for Color Palette section...');
  
  // Find all buttons that might be expand buttons
  const buttons = await page.$$('button.MuiIconButton-root');
  
  // Look for the Color Palette heading and its expand button
  for (const button of buttons) {
    const card = await button.evaluateHandle(el => el.closest('.MuiCard-root'));
    if (card) {
      const hasColorPalette = await page.evaluate(cardEl => {
        const headings = cardEl.querySelectorAll('h6');
        return Array.from(headings).some(h => h.textContent?.includes('Color Palette'));
      }, card);
      
      if (hasColorPalette) {
        console.log('Found Color Palette section, clicking expand button...');
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      }
    }
  }

  // Scroll to make sure color palette is visible
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h6'));
    const colorHeading = headings.find(h => h.textContent?.includes('Color Palette'));
    if (colorHeading) {
      colorHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Take screenshot
  console.log('Taking screenshot...');
  await page.screenshot({ 
    path: 'tests/color-palette-alignment.png',
    fullPage: false 
  });
  
  console.log('Screenshot saved: tests/color-palette-alignment.png');
  console.log('Keeping browser open for 5 seconds...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();
})();