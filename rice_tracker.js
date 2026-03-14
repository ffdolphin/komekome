const { chromium, firefox } = require('playwright');

/**
 * 米の価格トラッカー (Scraper Core)
 */

async function searchAmazon(page, limitPrice = 3400) {
    // 価格 3400円以下のフィルタ付き検索URL
    const priceParam = `-${limitPrice}00`;
    const url = `https://www.amazon.co.jp/s?k=%E7%B1%B3+5kg&rh=p_36%3A${priceParam}`;
    
    try {
        await page.goto(url, { waitUntil: 'load', timeout: 60000 });
        
        // スクロールして全件読み込む
        await page.evaluate(async () => {
            for (let i = 0; i < 3; i++) {
                window.scrollBy(0, window.innerHeight);
                await new Promise(r => setTimeout(r, 800));
            }
        });

        const results = await page.evaluate((limitPrice) => {
            const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]'));
            
            return items.map(item => {
                const titleEl = item.querySelector('h2 a span') || item.querySelector('h2 a') || item.querySelector('h2');
                const priceEl = item.querySelector('.a-price-whole') || item.querySelector('.a-offscreen');
                const linkEl = item.querySelector('h2 a') || item.querySelector('a.a-link-normal');
                const imgEl = item.querySelector('.s-image');

                if (!titleEl || !priceEl || !linkEl || !imgEl) return null;

                const title = titleEl.innerText.trim();
                const priceText = priceEl.innerText.replace(/[^0-9]/g, '');
                if (!priceText) return null;
                const price = parseInt(priceText, 10);

                // 配送料の取得をさらに確実に
                const shipText = item.innerText.replace(/\s+/g, ' ');
                let shipping = 0;
                
                // パターン1: 配送料 ￥505
                // パターン2: ￥505 配送料
                // パターン3: +￥505 配送料
                const shipMatch = shipText.match(/(?:配送料|送料)\s*￥?\s*([\d,]+)|￥\s*([\d,]+)\s*(?:配送料|送料)|[+](?:￥|¥)\s*([\d,]+)/);
                
                if (shipMatch) {
                    const matchVal = shipMatch[1] || shipMatch[2] || shipMatch[3];
                    shipping = parseInt(matchVal.replace(/,/g, ''), 10);
                } else if (shipText.includes('無料配送') || shipText.includes('通常配送無料')) {
                    shipping = 0;
                }

                const totalPrice = price + shipping;
                
                // デバッグ用ログ (ブラウザコンソール)
                console.log(`Checking: ${title.substring(0,20)}... | Price: ${price} | Ship: ${shipping} | Total: ${totalPrice}`);

                const relativeUrl = linkEl.getAttribute('href');
                if (!relativeUrl) return null;
                
                const url = relativeUrl.startsWith('http') ? relativeUrl.split('?')[0] : 'https://www.amazon.co.jp' + relativeUrl.split('?')[0];
                const imgSrc = imgEl.getAttribute('src');

                const isRice = (title.includes('米') || title.includes('精米') || title.includes('玄米') || title.includes('コシヒカリ') || title.includes('まっしぐら') || title.includes('あきたこまち') || title.includes('ひとめボレ') || title.includes('ブレンド') || title.includes('つや姫')) 
                            && !/保存袋|ストッカー|コンテナ|計量|ケース|カップ|ボウル|エサ|餌|麦|米袋|真空パック|防虫剤|除湿剤|米唐番|殺虫剤|防虫|お試し|1kg|1[kｋ][gｇ]|1キロ/.test(title);
                const is5kg = /5[kｋ][gｇ]|5[キ][ロ]|５[kｋ][gｇ]|5[.]0[kｋ][gｇ]|5kgx1/.test(title);

                if (isRice && is5kg && totalPrice <= limitPrice && imgSrc) {
                    return { url, title, price, shipping, totalPrice, imgSrc, site: 'Amazon' };
                }
                return null;
            }).filter(Boolean);
        }, limitPrice);

        return results;
    } catch (err) {
        console.error('Amazon error:', err.message);
        return [];
    }
}

async function searchYodobashi(page, limitPrice = 3400) {
    const searchUrl = 'https://www.yodobashi.com/?word=%E7%B1%B3+5kg';
    try {
        await page.goto(searchUrl, { waitUntil: 'load', timeout: 60000 });
        await page.waitForTimeout(4000);

        const results = await page.evaluate((limitPrice) => {
            const items = Array.from(document.querySelectorAll('.srcResultItem_block, .srcResultItem'));
            console.log(`[Yodobashi] Found ${items.length} raw items`);

            return items.map(item => {
                const titleEl = item.querySelector('.p_title, .title') || item.querySelector('p:not([class])') || item;
                const priceEl = item.querySelector('.productPrice, .p_price, .price');
                const linkEl = item.querySelector('a');
                const imgEl = item.querySelector('img');
                
                if (!priceEl || !linkEl || !imgEl) return null;

                const fullText = item.innerText;
                const priceText = priceEl.innerText.replace(/[^0-9]/g, '');
                if (!priceText) return null;
                const price = parseInt(priceText, 10);

                let shipping = 0;
                const totalPrice = price + shipping;
                
                const relativeUrl = linkEl.getAttribute('href');
                if (!relativeUrl) return null;
                const url = relativeUrl.startsWith('http') ? relativeUrl : 'https://www.yodobashi.com' + relativeUrl;
                const imgSrc = imgEl.getAttribute('src');

                const title = titleEl === item ? fullText.split('\n')[1] || fullText.split('\n')[0] : titleEl.innerText;

                const isRice = (fullText.includes('米') || fullText.includes('精米') || fullText.includes('玄米')) && !/麦|保存袋|ストッカー|米唐番|殺虫剤|防虫剤|除湿剤|防虫|お試し|1kg|1[kｋ][gｇ]|1キロ/.test(fullText);
                const is5kg = /5[kｋ][gｇ]|5[キ][ロ]|５[kｋ][gｇ]/.test(fullText);

                console.log(`[Yodobashi Context] ${title.trim().substring(0,25)}... | Price: ${price} | isRice/5kg: ${isRice}/${is5kg}`);

                if (isRice && is5kg && totalPrice <= limitPrice && imgSrc) {
                    return { url, title: title.trim(), price, shipping, totalPrice, imgSrc, site: 'ヨドバシ' };
                }
                return null;
            }).filter(Boolean);
        }, limitPrice);
        return results;
    } catch (err) {
        console.warn('Yodobashi error:', err.message);
        return [];
    }
}

async function runTracker(limitPrice = 3400) {
    // Amazon用 Chromium
    const amazonBrowser = await chromium.launch({ headless: true });
    // ヨドバシ用 Firefox (HTTP2エラー回避のため)
    const yodobashiBrowser = await firefox.launch({ headless: true });

    try {
        const amazonContext = await amazonBrowser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 }
        });
        const amazonPage = await amazonContext.newPage();
        await amazonPage.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });
        
        // デバッグログ
        amazonPage.on('console', msg => {
            if (msg.text().startsWith('Checking:')) console.log(`[Amazon] ${msg.text()}`);
        });

        const yodobashiContext = await yodobashiBrowser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 }
        });
        const yodobashiPage = await yodobashiContext.newPage();
        
        yodobashiPage.on('console', msg => {
            console.log(`[Yodobashi Browser] ${msg.text()}`);
        });

        const [amazonResults, yodobashiResults] = await Promise.all([
            searchAmazon(amazonPage, limitPrice),
            searchYodobashi(yodobashiPage, limitPrice)
        ]);

        return [...amazonResults, ...yodobashiResults];
    } finally {
        await Promise.all([amazonBrowser.close(), yodobashiBrowser.close()]);
    }
}

module.exports = { runTracker };
