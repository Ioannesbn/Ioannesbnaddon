const axios = require('axios');

async function resolveStream() {
    const testUrl = 'https://vizer.online/filme/napoli-new-york';
    console.log(`Resolving stream for ${testUrl}...`);

    try {
        const response = await axios.get(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const html = response.data;

        // Look for any script that might contain the video URL
        // Patterns often used: file: "...", url: "...", source: "..."
        const patterns = [
            /file\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
            /file\s*:\s*["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i,
            /source\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
            /url\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i
        ];

        let found = false;
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
                console.log(`Found direct stream: ${match[1]}`);
                found = true;
                break;
            }
        }

        if (!found) {
            console.log('No direct stream found in main page. Checking iframes...');
            const iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"/i);
            if (iframeMatch) {
                console.log(`Checking iframe: ${iframeMatch[1]}`);
                // Recursively check iframe if needed, but for now just print it
            }
        }

        // Look for any Base64 strings that might be URLs
        const b64Regex = /["']([A-Za-z0-9+/=]{40,})["']/g;
        let b64Match;
        while ((b64Match = b64Regex.exec(html)) !== null) {
            try {
                const decoded = Buffer.from(b64Match[1], 'base64').toString('utf-8');
                if (decoded.includes('http')) {
                    console.log(`Found decoded URL: ${decoded}`);
                }
            } catch (e) { }
        }

    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

resolveStream();
