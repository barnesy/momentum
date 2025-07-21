// Interactive Puppeteer test that interacts with the UI
import puppeteer from 'puppeteer';

async function interactiveTest() {
  console.log('🎮 Starting interactive test...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Watch it happen!
    slowMo: 50,     // Slow down actions so you can see them
    devtools: false,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    console.log('📍 Navigating to theme editor...');
    await page.goto('http://localhost:5173/src/experiment/index.html', {
      waitUntil: 'networkidle0'
    });

    console.log('⏳ Waiting for app to fully load...');
    await page.waitForSelector('.MuiBox-root', { timeout: 10000 });

    // Find and click the dark mode toggle (icon button)
    console.log('\n🌙 Looking for dark mode toggle...');
    const darkModeButton = await page.$('button[aria-label*="dark"], button[aria-label*="theme"], [data-testid*="dark"], [data-testid*="theme"]');
    
    if (darkModeButton) {
      console.log('✅ Found theme toggle, clicking...');
      await darkModeButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('🌙 Toggled theme mode');
    } else {
      // Try to find any IconButton that might be the theme toggle
      const iconButtons = await page.$$('button.MuiIconButton-root');
      console.log(`Found ${iconButtons.length} icon buttons, clicking the first one...`);
      if (iconButtons.length > 0) {
        await iconButtons[0].click();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Try to interact with SSE connection
    console.log('\n📡 Testing SSE Connection...');
    const connectButtons = await page.$$eval('button', buttons => 
      buttons.map((btn, index) => ({
        index,
        text: btn.textContent,
        ariaLabel: btn.getAttribute('aria-label')
      })).filter(btn => 
        btn.text?.toLowerCase().includes('connect') ||
        btn.ariaLabel?.toLowerCase().includes('connect')
      )
    );

    if (connectButtons.length > 0) {
      console.log(`Found ${connectButtons.length} connect button(s)`);
      // Click the first connect button
      const buttons = await page.$$('button');
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].evaluate(el => el.textContent);
        if (text?.toLowerCase().includes('connect')) {
          console.log(`Clicking "${text}" button...`);
          await buttons[i].click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
        }
      }
    }

    // Try to find and interact with color pickers
    console.log('\n🎨 Looking for color inputs...');
    const colorInputs = await page.$$('input[type="color"]');
    if (colorInputs.length > 0) {
      console.log(`Found ${colorInputs.length} color picker(s)`);
      // Change the first color
      await colorInputs[0].evaluate(input => input.value = '#ff5722');
      await colorInputs[0].evaluate(input => input.dispatchEvent(new Event('change', { bubbles: true })));
      console.log('🎨 Changed primary color to Material Orange (#ff5722)');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Look for text inputs or textareas
    console.log('\n📝 Looking for input fields...');
    const textAreas = await page.$$('textarea, input[type="text"]');
    if (textAreas.length > 0) {
      console.log(`Found ${textAreas.length} input field(s)`);
      await textAreas[0].click();
      await textAreas[0].type('Hello from Puppeteer! 🤖');
      console.log('✅ Typed test message');
    }

    // Take final screenshot
    console.log('\n📸 Taking final screenshot...');
    await page.screenshot({ 
      path: 'tests/interactive-test-final.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved');

    // Get final page state
    const pageState = await page.evaluate(() => {
      const body = document.body;
      return {
        backgroundColor: window.getComputedStyle(body).backgroundColor,
        theme: body.getAttribute('data-mui-color-scheme') || 'light',
        hasConnectedStatus: document.body.textContent.includes('Connected'),
        muiComponents: Array.from(document.querySelectorAll('[class*="Mui"]'))
          .map(el => el.className.match(/Mui\w+/)?.[0])
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i) // unique
          .slice(0, 10) // first 10
      };
    });

    console.log('\n📊 Final page state:');
    console.log('- Theme:', pageState.theme);
    console.log('- Background:', pageState.backgroundColor);
    console.log('- Connected:', pageState.hasConnectedStatus);
    console.log('- MUI Components found:', pageState.muiComponents.join(', '));

    console.log('\n✨ Interactive test completed!');
    console.log('👀 Check the browser window to see the results');
    
    // Keep browser open for 5 seconds so you can see the result
    console.log('\n⏰ Keeping browser open for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'tests/interactive-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed');
  }
}

// Run the test
interactiveTest().catch(console.error);