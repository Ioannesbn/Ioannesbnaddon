const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function resolveSuperFlix(metaId, type) {
    const parts = metaId.split(':');
    const imdbId = parts[0];
    const season = parts[1];
    const episode = parts[2];

    const mirrors = [
        'superflixapi.help',
        'superflix.vc',
        'superflix.top'
    ];

    for (const domain of mirrors) {
        try {
            const warezUrl = type === 'movie'
                ? `https://${domain}/api/v2/stream/${imdbId}`
                : `https://${domain}/api/v2/stream/${imdbId}/${season}/${episode}`;

            console.log(`Checking mirror: ${warezUrl}`);
            const response = await axios.get(warezUrl, {
                headers: { 'Referer': `https://${domain}/`, 'User-Agent': UA },
                timeout: 4000
            });

            if (response.data && response.data.url) {
                return {
                    url: response.data.url,
                    headers: { 'Referer': `https://${domain}/`, 'User-Agent': UA }
                };
            }
        } catch (e) {
            // Try next mirror
        }
    }

    // Try scraping the player page directly as a fallback
    try {
        const playerUrl = `https://superflixapi.help/${type === 'movie' ? 'filme' : 'serie'}/${imdbId}`;
        const res = await axios.get(playerUrl, { headers: { 'User-Agent': UA }, timeout: 4000 });
        const m3u8 = res.data.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
        if (m3u8) {
            return {
                url: m3u8[1],
                headers: { 'Referer': playerUrl, 'User-Agent': UA }
            };
        }
    } catch (e) { }

    return null;
}

async function resolveVizer(metaId, type) {
    const imdbId = metaId.split(':')[0];
    const mirrors = ['vizer.online', 'vizer.tv', 'vizer.link'];

    for (const domain of mirrors) {
        try {
            const path = type === 'movie' ? 'filme' : 'serie';
            const url = `https://${domain}/${path}/${imdbId}`;
            const res = await axios.get(url, { headers: { 'User-Agent': UA }, timeout: 4000 });

            const m3u8 = res.data.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
            if (m3u8) {
                return {
                    url: m3u8[1],
                    headers: { 'Referer': url, 'User-Agent': UA }
                };
            }
        } catch (e) { }
    }
    return null;
}

module.exports = { resolveSuperFlix, resolveVizer };
