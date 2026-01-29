const { startServer } = require('./app');

async function run() {
    try {
        await startServer();
        console.log('Backend server process started successfully');
    } catch (error) {
        console.error('Failed to start backend server:', error);
        process.exit(1);
    }
}

run();

// Handle termination
process.on('SIGTERM', () => {
    process.exit(0);
});
