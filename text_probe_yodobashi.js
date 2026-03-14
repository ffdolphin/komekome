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
        await page.waitForTimeout(5000);
        
        const itemsData = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.srcResultItem_block'));
            return items.map(item => ({
                text: item.innerText.substring(0, 200),
                has3400: item.innerText.includes('3,400'),
                hasRice: /米|精米|玄米/.test(item.innerText),
                has5kg: /5[kｋ][gｇ]|5[キ][ロ]/.test(item.innerText)
            })).filter(i => i.has3400);
        });

        console.log('Items with 3400:', JSON.stringify(itemsData, null, 2));

    } catch (err) {
        console.error('Failed:', err.message);
    } finally {
        await browser.close();
    }
})();
