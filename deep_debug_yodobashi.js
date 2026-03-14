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
        await page.waitForTimeout(5000); // 待機
        
        const screenshotPath = path.join(artifactDir, 'yodobashi_firefox_final_check.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log('Screenshot saved');

        const itemsInfo = await page.evaluate(() => {
            const allItems = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.innerText || '';
                return text.includes('3,400');
            });

            return {
                found3400: allItems.length > 0,
                itemClasses: allItems.map(el => ({
                    tag: el.tagName,
                    class: el.className,
                    text: el.innerText.substring(0, 100)
                })).slice(0, 10),
                bodyText: document.body.innerText.substring(0, 1000)
            };
        });

        console.log('Found elements with 3400:', itemsInfo.found3400);
        console.log('Sample elements:', itemsInfo.itemClasses);

    } catch (err) {
        console.error('Failed:', err.message);
    } finally {
        await browser.close();
    }
})();
