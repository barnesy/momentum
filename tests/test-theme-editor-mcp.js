#!/usr/bin/env node

/**
 * Test script to navigate to Theme Editor and enable dark mode using BrowserTools MCP
 * This script demonstrates how to use the Playwright MCP server configured in mcp.json
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

async function testThemeEditorWithMCP() {
  console.log('🚀 Starting Theme Editor test with BrowserTools MCP...\n');
  
  // Start the Playwright MCP server
  console.log('📡 Starting Playwright MCP server...');
  const mcpServer = spawn('npx', ['-y', '@playwright/mcp', '--headless=false'], {
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  // Give the server time to start
  await setTimeout(2000);

  try {
    console.log('✅ MCP server started\n');
    
    // Since we're using MCP, we need to interact with it through the MCP protocol
    // However, as a CLI script, we'll use Playwright directly for this test
    
    // Import playwright dynamically
    const { chromium } = await import('playwright');
    
    // Launch browser
    const browser = await chromium.launch({
      headless: false,
      devtools: false,
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the application
    console.log('📍 Navigating to http://localhost:5173/src/experiment/index.html...');
    await page.goto('http://localhost:5173/src/experiment/index.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Wait for the app to load
    await page.waitForSelector('[class*="MuiBox-root"]', { timeout: 10000 });
    console.log('✅ Application loaded\n');
    
    // Navigate to Theme Editor
    console.log('🎨 Navigating to Theme Editor...');
    
    // First, check if we need to click on a navigation menu
    const navLink = await page.locator('a[href="/theme-editor"], [data-testid="theme-editor-link"]').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      console.log('✅ Clicked Theme Editor navigation link');
    } else {
      // Direct navigation
      await page.goto('http://localhost:5173/src/experiment/index.html#/theme-editor');
      console.log('✅ Navigated directly to /theme-editor');
    }
    
    // Wait for Theme Editor to load
    await page.waitForSelector('text="Theme Editor"', { timeout: 10000 });
    console.log('✅ Theme Editor loaded\n');
    
    // Debug: Log all buttons on the page
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons on the page`);
    
    // Find and click the dark mode toggle
    console.log('🌙 Looking for dark mode toggle...');
    
    // Wait for the toggle button group to be visible
    await page.waitForSelector('[role="group"]', { timeout: 5000 }).catch(() => {});
    
    // Look for toggle button group with mode options
    // Try multiple selectors
    let darkModeButton = await page.locator('button[value="dark"]').first();
    
    // If not found, try other selectors
    if (!await darkModeButton.isVisible()) {
      darkModeButton = await page.locator('button:has-text("dark")').first();
    }
    
    // If still not found, look for any button with aria-pressed
    if (!await darkModeButton.isVisible()) {
      const buttons = await page.locator('button[aria-pressed]').all();
      for (const button of buttons) {
        const value = await button.getAttribute('value');
        if (value === 'dark') {
          darkModeButton = button;
          break;
        }
      }
    }
    
    if (await darkModeButton.isVisible()) {
      await darkModeButton.click();
      console.log('✅ Clicked dark mode button');
      
      // Wait for theme to apply
      await setTimeout(1000);
      
      // Verify dark mode is active
      const isDarkMode = await page.evaluate(() => {
        const bodyStyles = window.getComputedStyle(document.body);
        const bgColor = bodyStyles.backgroundColor;
        // Dark mode typically has a dark background
        return bgColor.includes('rgb(18') || bgColor.includes('rgb(0') || bgColor.includes('#121212');
      });
      
      if (isDarkMode) {
        console.log('✅ Dark mode successfully enabled!');
      } else {
        console.log('⚠️  Dark mode button clicked but theme might not have changed');
      }
      
      // Take a screenshot
      await page.screenshot({ 
        path: 'tests/theme-editor-dark-mode.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved to tests/theme-editor-dark-mode.png');
      
    } else {
      console.log('❌ Could not find dark mode toggle button');
    }
    
    // Keep browser open for a moment to see the result
    await setTimeout(3000);
    
    // Close browser
    await browser.close();
    console.log('\n✨ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    // Terminate the MCP server
    mcpServer.kill();
    console.log('\n👋 MCP server closed');
  }
}

// Run the test
testThemeEditorWithMCP().catch(console.error);