const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { initDatabase, closeDatabase } = require('./database');
const screenshotService = require('./services/screenshotService');

const app = express();
const PORT = 3000;

let server;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
    session({
        secret: 'employee-tracker-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true
        }
    })
);

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

async function startServer() {
    try {
        // Initialize database
        await initDatabase();

        // Initialize screenshot service
        await screenshotService.initialize();

        // Start server
        return new Promise((resolve, reject) => {
            server = app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
                resolve();
            });

            server.on('error', (error) => {
                console.error('Server error:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        throw error;
    }
}

async function stopServer() {
    try {
        // Stop screenshot service
        screenshotService.stopCapture();

        // Close database
        await closeDatabase();

        // Close server
        if (server) {
            return new Promise((resolve) => {
                server.close(() => {
                    console.log('Server stopped');
                    resolve();
                });
            });
        }
    } catch (error) {
        console.error('Error stopping server:', error);
    }
}

module.exports = {
    app,
    startServer,
    stopServer
};
