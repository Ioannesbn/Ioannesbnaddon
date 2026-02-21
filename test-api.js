const axios = require('axios');

async function testApi() {
    console.log('Testing SuperFlix API connectivity...');
    try {
        const response = await axios.get('https://superflixapi.help/calendario.php');
        console.log('API Status:', response.status);
        if (response.data && Array.isArray(response.data)) {
            console.log('API returned an array with', response.data.length, 'items.');
            console.log('First item sample:', JSON.stringify(response.data[0], null, 2));
        } else {
            console.log('API returned unexpected data format.');
        }
    } catch (error) {
        console.error('API Test Failed:', error.message);
    }
}

testApi();
