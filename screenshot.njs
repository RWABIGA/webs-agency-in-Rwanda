const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Auto-increment — never overwrite
let n = 1;
let filename;
do {
  filename = label
    ? `screenshot-${n}-${label}.png`
    : `screenshot-${n}.png`;
  n++;
} while (fs.existsSync(path.join(screenshotDir, filename)));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Scroll through page to trigger IntersectionObserver callbacks
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let pos = 0;
      const step = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        pos += step;
        if (pos >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 40);
    });
  });

  // Wait for fade-in transitions to complete
  await new Promise(r => setTimeout(r, 900));

  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  await browser.close();

  console.log(`\n  Screenshot saved: ${filepath}\n`);
})().catch(err => {
  console.error('Screenshot failed:', err.message);
  process.exit(1);
});
