const axios = require('axios');

async function debugMovies() {
    try {
        const response = await axios.get('https://superflixapi.help/filmes');
        const html = response.data;

        // Find all blocks that contain movie info
        // The structure seems to be:
        // <button data-copy="TITLE" ...>Título</button>
        // <button data-copy="TT_ID" ...>IMDB ID</button>

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

        console.log(`Found ${titles.length} titles and ${ids.length} IDs.`);

        for (let i = 0; i < Math.min(titles.length, ids.length); i++) {
            movies.push({ title: titles[i], id: ids[i] });
        }

        console.log('Sample Movies:', JSON.stringify(movies.slice(0, 5), null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

debugMovies();
