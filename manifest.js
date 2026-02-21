const manifest = {
    id: 'com.ioannesbn.addon',
    version: '1.0.0',
    name: 'IoannesBn',
    description: 'Extensão Stremio para reproduzir filmes e séries do SuperFlixAPI.help',
    resources: ['catalog', 'meta', 'stream'],
    types: ['movie', 'series', 'anime'],
    idPrefixes: ['tt'],
    catalogs: [
        {
            type: 'movie',
            id: 'ioannesbn_recent_movies',
            name: 'IoannesBn - Filmes'
        },
        {
            type: 'series',
            id: 'ioannesbn_recent_series',
            name: 'IoannesBn - Séries'
        },
        {
            type: 'anime',
            id: 'ioannesbn_recent_anime',
            name: 'IoannesBn - Animes'
        }
    ],
    background: 'https://superflixapi.help/images/logo.png',
    logo: 'https://superflixapi.help/images/logo.png',
    contactEmail: 'admin@ioannesbn.com'
};

module.exports = manifest;
