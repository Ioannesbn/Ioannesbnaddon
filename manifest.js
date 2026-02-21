const manifest = {
    id: 'com.ioannesbn.addon',
    version: '1.2.0',
    name: 'IoannesBn',
    description: 'Era isso que você queria bolsonaro? uma menina pescotapa?',
    logo: 'https://i.pinimg.com/1200x/29/70/68/297068f0428d077d9ac4a00f56d99147.jpg',
    background: 'https://i.pinimg.com/1200x/29/70/68/297068f0428d077d9ac4a00f56d99147.jpg',
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
        },
        {
            type: 'movie',
            id: 'ioannesbn_all_movies',
            name: 'IoannesBn - Todos os Filmes'
        },
        {
            type: 'series',
            id: 'ioannesbn_all_series',
            name: 'IoannesBn - Todas as Séries'
        },
        {
            type: 'anime',
            id: 'ioannesbn_all_anime',
            name: 'IoannesBn - Todos os Animes'
        },
        {
            type: 'anime',
            id: 'ioannesbn_all_doramas',
            name: 'IoannesBn - Todos os Doramas'
        }
    ],
    contactEmail: 'admin@ioannesbn.com'
};

module.exports = manifest;
