const manifest = {
    id: 'com.ioannesbn.addon',
    version: '1.0.1',
    name: 'IoannesBn',
    description: 'Extensão Stremio completa para filmes, séries, animes e doramas (SuperFlixAPI.help)',
    resources: ['catalog', 'meta', 'stream'],
    types: ['movie', 'series', 'anime'],
    idPrefixes: ['tt'],
    catalogs: [
        {
            type: 'movie',
            id: 'ioannesbn_movies',
            name: 'IoannesBn - Filmes Recentes'
        },
        {
            type: 'series',
            id: 'ioannesbn_series',
            name: 'IoannesBn - Séries Recentes'
        },
        {
            type: 'anime',
            id: 'ioannesbn_anime',
            name: 'IoannesBn - Animes & Doramas'
        }
    ],
    background: 'https://superflixapi.help/images/logo.png',
    logo: 'https://superflixapi.help/images/logo.png',
    contactEmail: 'admin@ioannesbn.com'
};

module.exports = manifest;
