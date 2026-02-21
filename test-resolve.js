const { resolveSuperFlix, resolveVizer } = require('./resolve-stream');

async function test() {
    const testId = 'tt15327088'; // Example ID
    console.log('Testing SuperFlix Resolution...');
    const sf = await resolveSuperFlix(testId, 'movie');
    console.log('SuperFlix Result:', sf);

    console.log('\nTesting Vizer Resolution...');
    const vizer = await resolveVizer(testId, 'movie');
    console.log('Vizer Result:', vizer);
}

test();
