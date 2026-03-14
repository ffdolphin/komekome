const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const artifactDir = '/Users/dolphin/.gemini/antigravity/brain/ce44db5a-7bc0-4241-b2c8-7df40e90f020';
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 1600 }
    });
    const page = await context.newPage();
    
    const url = 'https://www.yodobashi.com/?word=%E7%B1%B3+5kg&max_val=3400';
    console.log('Navigating to Yodobashi:', url);
    
    try {
        // Try with networkidle and a longer timeout
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        console.log('Page loaded successfully');
        
        await page.waitForTimeout(5000); // Wait for potential dynamic content
        
        const screenshotPath = path.join(artifactDir, 'yodobashi_debug.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log('Screenshot saved to:', screenshotPath);

        const itemsData = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.p_list_p, .p_list_item'));
            return items.map(item => ({
                title: item.querySelector('.p_title')?.innerText || 'NO TITLE',
                price: item.querySelector('.p_price')?.innerText || 'NO PRICE',
                htmlSnippet: item.outerHTML.substring(0, 500)
            }));
        });

        const dumpPath = path.join(artifactDir, 'yodobashi_items_dump.json');
        fs.writeFileSync(dumpPath, JSON.stringify(itemsData, null, 2));
        console.log(`Found ${itemsData.length} items. Dump saved to:`, dumpPath);

    } catch (err) {
        console.error('Yodobashi failed:', err.message);
    } finally {
        await browser.close();
    }
})();
