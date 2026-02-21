const { addonBuilder } = require('stremio-addon-sdk');
const axios = require('axios');
const manifest = require('./manifest');

const builder = new addonBuilder(manifest);

const SUPERFLIX_API_BASE = 'https://superflixapi.help';
const VIZER_BASE = 'https://vizer.online';
const CALENDARIO_URL = `${SUPERFLIX_API_BASE}/calendario.php`;

// Simple in-memory cache
const cache = {
    calendar: null,
    movies: null,
    vizer: null,
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
        console.log('Scraping fresh movie data...');
        const response = await axios.get(`${SUPERFLIX_API_BASE}/filmes`, { timeout: 10000 });
        const html = response.data;

        const movies = [];
        const titleRegex = /data-copy="([^"]+)"[^>]*>\s*<i[^>]*><\/i>\s*Título/g;
        const imdbRegex = /data-copy="(tt\d+)"[^>]*>\s*<i[^>]*><\/i>\s*IMDB/g;

        let titleMatch;
        let imdbMatch;

        const titles = [];
        while ((titleMatch = titleRegex.exec(html)) !== null) {
            titles.push(titleMatch[1]);
        }

        const ids = [];
        while ((imdbMatch = imdbRegex.exec(html)) !== null) {
            ids.push(imdbMatch[1]);
        }

        for (let i = 0; i < Math.min(titles.length, ids.length); i++) {
            movies.push({
                title: titles[i],
                imdb_id: ids[i],
                type: 1
            });
        }

        if (movies.length > 0) {
            cache.movies = movies;
            cache.lastFetched = now;
        }
        return movies;
    } catch (error) {
        console.error('Error fetching movies:', error.message);
        return cache.movies || [];
    }
}

// Helper: Scrape all content from specific category pages
async function fetchAll(category) {
    const cacheKey = `all_${category}`;
    const now = Date.now();
    if (cache[cacheKey] && (now - cache.lastFetched < cache.ttl)) return cache[cacheKey];

    try {
        console.log(`Scraping all content for ${category}...`);
        const response = await axios.get(`${SUPERFLIX_API_BASE}/${category}`, { timeout: 10000 });
        const html = response.data;

        const items = [];
        const titleRegex = /data-copy="([^"]+)"[^>]*>\s*<i[^>]*><\/i>\s*Título/g;
        const imdbRegex = /data-copy="(tt\d+)"[^>]*>\s*<i[^>]*><\/i>\s*IMDB/g;

        const titles = [];
        let match;
        while ((match = titleRegex.exec(html)) !== null) titles.push(match[1]);

        const ids = [];
        while ((match = imdbRegex.exec(html)) !== null) ids.push(match[1]);

        for (let i = 0; i < Math.min(titles.length, ids.length); i++) {
            items.push({
                title: titles[i],
                imdb_id: ids[i],
                type: category === 'filmes' ? 1 : (category === 'series' ? 2 : 3)
            });
        }

        if (items.length > 0) {
            cache[cacheKey] = items;
            cache.lastFetched = now;
        }
        return items;
    } catch (error) {
        console.error(`Error fetching all ${category}:`, error.message);
        return cache[cacheKey] || [];
    }
}

// Catalog Handler
builder.defineCatalogHandler(async (args) => {
    const { type, id } = args;
    console.log(`Requested catalog: ${type} - ${id}`);

    // Recent Movies
    if (id === 'ioannesbn_movies') {
        const movies = await fetchMovies();
        return {
            metas: movies.map(item => ({
                id: item.imdb_id,
                type: 'movie',
                name: item.title,
                poster: `https://images.metahub.space/poster/small/${item.imdb_id}/img`,
                description: 'SuperFlixAPI Recent Movie'
            }))
        };
    }

    // All Movies
    if (id === 'ioannesbn_all_movies') {
        const movies = await fetchAll('filmes');
        return {
            metas: movies.map(item => ({
                id: item.imdb_id,
                type: 'movie',
                name: item.title,
                poster: `https://images.metahub.space/poster/small/${item.imdb_id}/img`,
                description: 'SuperFlixAPI All Movies'
            }))
        };
    }

    // Recent Series / Anime / Dorama
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

        const uniqueMetas = Array.from(new Set(metas.map(m => m.id)))
            .map(id => metas.find(m => m.id === id));
        return { metas: uniqueMetas };
    }

    // All Series
    if (id === 'ioannesbn_all_series') {
        const series = await fetchAll('series');
        return {
            metas: series.map(item => ({
                id: item.imdb_id,
                type: 'series',
                name: item.title,
                poster: `https://images.metahub.space/poster/small/${item.imdb_id}/img`,
                description: 'SuperFlixAPI All Series'
            }))
        };
    }

    // All Anime
    if (id === 'ioannesbn_all_anime') {
        const animes = await fetchAll('animes');
        return {
            metas: animes.map(item => ({
                id: item.imdb_id,
                type: 'anime',
                name: item.title,
                poster: `https://images.metahub.space/poster/small/${item.imdb_id}/img`,
                description: 'SuperFlixAPI All Animes'
            }))
        };
    }

    // All Dorama
    if (id === 'ioannesbn_all_doramas') {
        const doramas = await fetchAll('doramas');
        return {
            metas: doramas.map(item => ({
                id: item.imdb_id,
                type: 'anime',
                name: item.title,
                poster: `https://images.metahub.space/poster/small/${item.imdb_id}/img`,
                description: 'SuperFlixAPI All Doramas'
            }))
        };
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

const { resolveSuperFlix, resolveVizer } = require('./resolve-stream');

// ... (previous handlers)

// Stream Handler
builder.defineStreamHandler(async (args) => {
    const { type, id } = args;
    console.log(`Requested stream for: ${type} - ${id}`);

    if (id.startsWith('tt')) {
        const streams = [];

        // Attempt internal resolution for SuperFlix
        const sfInternal = await resolveSuperFlix(id, type);
        if (sfInternal) {
            streams.push({
                name: 'IoannesBn - Interno 01',
                title: `Player SuperFlix (Nativo)\nHD 1080p - Português`,
                url: sfInternal.url,
                behaviorHints: {
                    notWebReady: false,
                    proxyHeaders: {
                        "request": sfInternal.headers
                    }
                }
            });
        }

        // Attempt internal resolution for Vizer
        const vizerInternal = await resolveVizer(id, type);
        if (vizerInternal) {
            streams.push({
                name: 'IoannesBn - Interno 02',
                title: `Player Vizer (Nativo)\nHD 720p - Português`,
                url: vizerInternal.url,
                behaviorHints: {
                    notWebReady: false,
                    proxyHeaders: {
                        "request": vizerInternal.headers
                    }
                }
            });
        }

        // If both fail, let's provide a "Browser" fallback as a LAST resort 
        // to avoid "No streams found" which is even worse
        if (streams.length === 0) {
            const parts = id.split(':');
            const imdbId = parts[0];
            const fallbackUrl = type === 'movie'
                ? `${SUPERFLIX_API_BASE}/filme/${imdbId}`
                : `${SUPERFLIX_API_BASE}/serie/${imdbId}`;

            streams.push({
                name: 'IoannesBn - Navegador',
                title: `⚠️ Erro no modo interno. Abrir no navegador.`,
                externalUrl: fallbackUrl
            });
        }

        return { streams };
    }

    return { streams: [] };
});

module.exports = builder.getInterface();
