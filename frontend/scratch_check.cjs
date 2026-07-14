const puppeteer = require('puppeteer');

(async () => {
  const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'; // Common path on mac
  try {
    const browser = await puppeteer.launch({
      executablePath,
      headless: "new"
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('PAGE_ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST_FAILED:', request.url(), request.failure().errorText));
    
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => console.log('GOTO ERR:', e.message));
    
    console.log('Page loaded.');
    await browser.close();
  } catch (err) {
    console.error('Puppeteer error:', err.message);
  }
})();
