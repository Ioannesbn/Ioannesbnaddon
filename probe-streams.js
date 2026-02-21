const axios = require('axios');

async function probe() {
    const imdbId = 'tt15327088'; // Example ID
    const endpoints = [
        `https://embed.warezcdn.com/filme/${imdbId}`,
        `https://embed.warezcdn.com/api/v2/stream/${imdbId}`,
        `https://superflixapi.help/api/player?id=${imdbId}&link=1`,
        `https://superflixapi.help/api/v1/stream?id=${imdbId}`,
        `https://vizer.online/vapi/stream/${imdbId}`
    ];

    for (const url of endpoints) {
        try {
            console.log(`Probing: ${url}`);
            const res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://vizer.online/'
                },
                timeout: 5000
            });
            console.log(`Status: ${res.status}`);
            console.log(`Body (first 200 chars): ${JSON.stringify(res.data).substring(0, 200)}`);
        } catch (e) {
            console.log(`Failed: ${url} - ${e.message}`);
        }
    }
}

probe();
