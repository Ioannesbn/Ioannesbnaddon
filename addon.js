const { addonBuilder } = require('stremio-addon-sdk');
const axios = require('axios');
const manifest = require('./manifest');

const builder = new addonBuilder(manifest);

const SUPERFLIX_API_BASE = 'https://superflixapi.help';
const CALENDARIO_URL = `${SUPERFLIX_API_BASE}/calendario.php`;

// Simple in-memory cache
const cache = {
    data: null,
    lastFetched: 0,
    ttl: 15 * 60 * 1000 // 15 minutes
};

// Helper to fetch data from SuperFlix
async function fetchCalendar() {
    const now = Date.now();
    if (cache.data && (now - cache.lastFetched < cache.ttl)) {
        console.log('Returning calendar from cache');
        return cache.data;
    }

    try {
        console.log('Fetching fresh calendar data...');
        const response = await axios.get(CALENDARIO_URL, { timeout: 5000 });
        cache.data = response.data;
        cache.lastFetched = now;
        return response.data;
    } catch (error) {
        console.error('Error fetching calendar:', error.message);
        return cache.data || []; // Return stale data if fetch fails
    }
}

// Catalog Handler
builder.defineCatalogHandler(async (args) => {
    const { type, id } = args;
    console.log(`Requested catalog: ${type} - ${id}`);

    if (id === 'ioannesbn_recent_movies' || id === 'ioannesbn_recent_series') {
        const calendarData = await fetchCalendar();

        const metas = calendarData
            .filter(item => {
                if (type === 'movie') return item.type === 1; // 1 for movies usually, but let's check
                if (type === 'series') return item.type === 2 || item.type === 3 || item.type === 5;
                return false;
            })
            .map(item => ({
                id: item.imdb_id || `sf:${item.tmdb_id}`,
                type: type,
                name: item.title,
                poster: `https://image.tmdb.org/t/p/w500${item.poster}`,
                description: `Última atualização: ${item.status}. Temporada ${item.season}, Episódio ${item.number}`,
                releaseInfo: item.air_date
            }))
            .filter(meta => meta.id && !meta.id.includes('undefined'));

        // Removing duplicates
        const uniqueMetas = Array.from(new Set(metas.map(m => m.id)))
            .map(id => metas.find(m => m.id === id));

        return { metas: uniqueMetas };
    }

    return { metas: [] };
});

// Stream Handler
builder.defineStreamHandler(async (args) => {
    const { type, id } = args;
    console.log(`Requested stream for: ${type} - ${id}`);

    // Standard IMDb ID (tt...)
    if (id.startsWith('tt')) {
        const parts = id.split(':');
        const imdbId = parts[0];
        const season = parts[1];
        const episode = parts[2];

        let externalUrl = '';
        if (type === 'movie') {
            externalUrl = `${SUPERFLIX_API_BASE}/filme/${imdbId}`;
        } else if (type === 'series' && season && episode) {
            // Some APIs support direct season/episode path
            externalUrl = `${SUPERFLIX_API_BASE}/serie/${imdbId}`;
            // Optional: add hash for direct episode if the site supports it
            // Based on doc, they use /serie/ID or /episodio/ID?
            // Let's stick to the main series player which usually has episode selection
        } else {
            externalUrl = `${SUPERFLIX_API_BASE}/serie/${imdbId}`;
        }

        if (externalUrl) {
            return {
                streams: [
                    {
                        name: 'IoannesBn',
                        title: `Assistir no SuperFlixAPI\n${type === 'series' && season ? `T${season} E${episode}` : ''}`,
                        externalUrl: externalUrl
                    }
                ]
            };
        }
    }

    return { streams: [] };
});

module.exports = builder.getInterface();
