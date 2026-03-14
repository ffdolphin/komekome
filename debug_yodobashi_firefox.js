const { firefox } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const artifactDir = '/Users/dolphin/.gemini/antigravity/brain/ce44db5a-7bc0-4241-b2c8-7df40e90f020';
    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 1600 }
    });
    const page = await context.newPage();
    
    const url = 'https://www.yodobashi.com/?word=%E7%B1%B3+5kg';
    console.log('Navigating to Yodobashi (Firefox):', url);
    
    try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        console.log('Page loaded');
        await page.waitForTimeout(5000);
        
        const screenshotPath = path.join(artifactDir, 'yodobashi_firefox_debug.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log('Screenshot saved');

        const itemsInfo = await page.evaluate(() => {
            return {
                htmlClasses: Array.from(new Set(Array.from(document.querySelectorAll('*')).map(el => el.className).filter(c => typeof c === 'string' && c.includes('product') || c.includes('list')))),
                itemsCount: document.querySelectorAll('.p_list_p, .p_list_item').length,
                bodyTextContent: document.body.innerText.substring(0, 1000)
            };
        });

        console.log('Items found with .p_list_p:', itemsInfo.itemsCount);
        console.log('Common classes:', itemsInfo.htmlClasses.slice(0, 10));

    } catch (err) {
        console.error('Failed:', err.message);
    } finally {
        await browser.close();
    }
})();
