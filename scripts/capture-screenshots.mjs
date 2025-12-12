#!/usr/bin/env node

/**
 * Screenshot Capture Script
 * 
 * Usage:
 *   1. Make sure the dev server is running: pnpm dev
 *   2. Run: npx playwright install chromium (first time only)
 *   3. Run: node scripts/capture-screenshots.mjs
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotsDir = join(__dirname, '..', 'screenshots');

const BASE_URL = 'http://localhost:3000';

const pages = [
  { name: 'home', url: '/', viewport: { width: 1280, height: 800 } },
  { name: 'playground', url: '/playground.html', viewport: { width: 1280, height: 800 } },
  { name: 'login', url: '/login.html', viewport: { width: 1280, height: 800 } },
  { name: 'components', url: '/components/index.html', viewport: { width: 1280, height: 1200 } },
];

const themes = [
  { name: 'light', value: 'celestia-dawn' },
  { name: 'dark', value: 'celestia-night' },
];

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...\n');
  
  // Ensure screenshots directory exists
  await mkdir(screenshotsDir, { recursive: true });
  
  const browser = await chromium.launch();
  
  for (const page of pages) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: page.viewport,
      });
      
      const browserPage = await context.newPage();
      
      // Navigate to the page
      await browserPage.goto(`${BASE_URL}${page.url}`);
      
      // Set theme
      await browserPage.evaluate((themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
      }, theme.value);
      
      // Wait for styles to apply
      await browserPage.waitForTimeout(500);
      
      // Capture screenshot
      const filename = `${page.name}-${theme.name}.png`;
      const filepath = join(screenshotsDir, filename);
      
      await browserPage.screenshot({
        path: filepath,
        fullPage: page.name === 'components',
      });
      
      console.log(`✅ Captured: ${filename}`);
      
      await context.close();
    }
  }
  
  await browser.close();
  
  console.log('\n🎉 All screenshots captured successfully!');
  console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
}

captureScreenshots().catch(console.error);

