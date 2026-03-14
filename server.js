const express = require('express');
const { runTracker } = require('./rice_tracker');
const path = require('path');

const app = express();
const PORT = 3333;

app.use(express.static('public'));

app.get('/api/track', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 3400;
        console.log(`Scraping started (Limit: ${limit} JPY)...`);
        const results = await runTracker(limit);
        console.log(`Scraping finished. Found ${results.length} items.`);
        res.json(results);
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
