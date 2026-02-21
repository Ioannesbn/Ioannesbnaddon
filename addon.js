const { addonBuilder } = require('stremio-addon-sdk');
const axios = require('axios');
const manifest = require('./manifest');

const builder = new addonBuilder(manifest);

const SUPERFLIX_API_BASE = 'https://superflixapi.help';
const CALENDARIO_URL = `${SUPERFLIX_API_BASE}/calendario.php`;

// Simple in-memory cache
const cache = {
    calendar: null,
    movies: null,
    lastFetched: 0,
    ttl: 30 * 60 * 1000 // 30 minutes
};

// Helper: Fetch Episodes/Series/Anime from Calendar
async function fetchCalendar() {
    const now = Date.now();
    if (cache.calendar && (now - cache.lastFetched < cache.ttl)) return cache.calendar;

    try {
        const response = await axios.get(CALENDARIO_URL, { timeout: 5000 });
        cache.calendar = response.data;
        cache.lastFetched = now;
        return response.data;
    } catch (error) {
        console.error('Error fetching calendar:', error.message);
        return cache.calendar || [];
    }
}

// Helper: Scrape movies from /filmes (since they are not in the calendar)
async function fetchMovies() {
    const now = Date.now();
    if (cache.movies && (now - cache.lastFetched < cache.ttl)) return cache.movies;

    try {
        const response = await axios.get(`${SUPERFLIX_API_BASE}/filmes`, { timeout: 10000 });
        const html = response.data;

        // Simple regex to extract movie basic info
        // Pattern: find titles and tt IDs
        const movieRegex = /<h3[^>]*>(.*?)<\/h3>.*?href="[^"]*\/filme\/(tt\d+)"/gs;
        const movies = [];
        let match;
        while ((match = movieRegex.exec(html)) !== null) {
            movies.push({
                title: match[1].trim(),
                imdb_id: match[2],
                type: 1 // Movie
            });
        }

        if (movies.length > 0) cache.movies = movies;
        return movies;
    } catch (error) {
        console.error('Error fetching movies:', error.message);
        return cache.movies || [];
    }
}

// Catalog Handler
builder.defineCatalogHandler(async (args) => {
    const { type, id } = args;
    console.log(`Requested catalog: ${type} - ${id}`);

    if (id === 'ioannesbn_movies') {
        const movies = await fetchMovies();
        return {
            metas: movies.map(item => ({
                id: item.imdb_id,
                type: 'movie',
                name: item.title,
                poster: `https://images.metahub.space/poster/small/${item.imdb_id}/img`, // Fallback poster
                description: 'SuperFlixAPI Movie'
            }))
        };
    }

    if (id === 'ioannesbn_series' || id === 'ioannesbn_anime') {
        const calendarData = await fetchCalendar();
        const metas = calendarData
            .filter(item => {
                const itemType = parseInt(item.type);
                if (type === 'series') return itemType === 2;
                if (type === 'anime') return itemType === 3 || itemType === 5;
                return false;
            })
            .map(item => ({
                id: item.imdb_id || `sf:${item.tmdb_id}`,
                type: type,
                name: item.title,
                poster: item.poster ? `https://image.tmdb.org/t/p/w500${item.poster}` : `https://images.metahub.space/poster/small/${item.imdb_id}/img`,
                description: `Atualizado: ${item.status}. ${item.episode}`,
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

// Meta Handler
builder.defineMetaHandler(async (args) => {
    const { type, id } = args;
    if (!id.startsWith('tt')) return { meta: null };

    // Try to find in cache first for better info
    const allData = [...(cache.calendar || []), ...(cache.movies || [])];
    const cachedItem = allData.find(i => i.imdb_id === id);

    if (cachedItem) {
        return {
            meta: {
                id: id,
                type: type,
                name: cachedItem.title || cachedItem.name,
                poster: cachedItem.poster ? `https://image.tmdb.org/t/p/w500${cachedItem.poster}` : undefined,
                background: cachedItem.backdrop ? `https://image.tmdb.org/t/p/original${cachedItem.backdrop}` : undefined,
                description: `Recurso da SuperFlixAPI (IMDb: ${id})`,
                releaseInfo: cachedItem.air_date
            }
        };
    }

    return { meta: null }; // Let Cinemeta handle it if not in our recent cache
});

// Stream Handler
builder.defineStreamHandler(async (args) => {
    const { type, id } = args;
    console.log(`Requested stream for: ${type} - ${id}`);

    if (id.startsWith('tt')) {
        const parts = id.split(':');
        const imdbId = parts[0];
        const season = parts[1];
        const episode = parts[2];

        // Construct source URL
        const sourceUrl = type === 'movie'
            ? `${SUPERFLIX_API_BASE}/filme/${imdbId}`
            : `${SUPERFLIX_API_BASE}/serie/${imdbId}`;

        // We provide the player URL. To avoid "browser redirect", 
        // we use the official player name and title.
        return {
            streams: [
                {
                    name: 'SuperFlix (HLS)',
                    title: `Assistir em 1080p/720p\n${type !== 'movie' && season ? `T${season} E${episode}` : ''}`,
                    url: sourceUrl, // Providing it as URL might work in some player wrappers
                    behaviorHints: {
                        notWebReady: false,
                        proxyHeaders: {
                            "Referer": SUPERFLIX_API_BASE,
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                        }
                    }
                },
                {
                    name: 'SuperFlix (External)',
                    title: 'Abrir no Player Externo (100% Funcional)',
                    externalUrl: sourceUrl
                }
            ]
        };
    }

    return { streams: [] };
});

module.exports = builder.getInterface();
