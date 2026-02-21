const axios = require('axios');

async function testPerformance() {
    const url = 'http://localhost:7000/catalog/movie/ioannesbn_recent_movies.json';
    console.log('Testing Catalog Performance...');

    console.time('First Request (No Cache)');
    try {
        await axios.get(url);
        console.timeEnd('First Request (No Cache)');
    } catch (e) {
        console.error('First request failed:', e.message);
    }

    console.time('Second Request (Cached)');
    try {
        await axios.get(url);
        console.timeEnd('Second Request (Cached)');
    } catch (e) {
        console.error('Second request failed:', e.message);
    }
}

testPerformance();
