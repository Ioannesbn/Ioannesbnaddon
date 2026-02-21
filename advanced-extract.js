const axios = require('axios');

async function extractStream(imdbId) {
    console.log(`Extracting stream for ${imdbId}...`);

    // Attempt 1: WarezCDN Embed
    try {
        const url = `https://embed.warezcdn.com/filme/${imdbId}`;
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const html = res.data;

        // Look for common patterns
        const patterns = [
            /file\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
            /url\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
            /var\s+server\s*=\s*["']([^"']+)["']/i
        ];

        for (const p of patterns) {
            const m = html.match(p);
            if (m) console.log(`Found pattern match: ${m[1]}`);
        }

    } catch (e) {
        console.log(`WarezCDN probe failed: ${e.message}`);
    }

    // Attempt 2: SuperFlix Player API
    try {
        const url = `https://superflixapi.help/api/player?id=${imdbId}`;
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        console.log(`SuperFlix Player API Response: ${JSON.stringify(res.data).substring(0, 500)}`);
    } catch (e) {
        console.log(`SuperFlix Player API failed: ${e.message}`);
    }
}

extractStream('tt15327088');
