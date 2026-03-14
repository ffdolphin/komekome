const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    const artifactDir = '/Users/dolphin/.gemini/antigravity/brain/ce44db5a-7bc0-4241-b2c8-7df40e90f020';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 1600 }
    });
    const page = await context.newPage();
    
    const url = 'https://www.amazon.co.jp/s?k=%E7%B1%B3+5kg&rh=p_36%3A-340000';
    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    
    await page.evaluate(async () => {
        window.scrollBy(0, 1000);
        await new Promise(r => setTimeout(r, 1000));
    });

    const screenshotPath = path.join(artifactDir, 'amazon_debug_shipping.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('Screenshot saved to:', screenshotPath);

    const itemsData = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]'));
        return items.slice(0, 15).map(item => ({
            title: item.querySelector('h2')?.innerText,
            fullText: item.innerText,
            deliveryHtml: item.querySelector('.s-delivery-instructions')?.innerHTML || 'NOT FOUND'
        }));
    });

    const dumpPath = path.join(artifactDir, 'amazon_items_dump.json');
    fs.writeFileSync(dumpPath, JSON.stringify(itemsData, null, 2));
    console.log('Dump saved to:', dumpPath);

    await browser.close();
})();
