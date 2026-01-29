const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database');
const { requireAdmin } = require('../middleware/auth');
const screenshotService = require('../services/screenshotService');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

// Get all employees
router.get('/employees', (req, res) => {
    const db = getDatabase();

    db.all(
        `SELECT id, username, role, full_name, created_at FROM employees ORDER BY created_at DESC`,
        [],
        (err, employees) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ employees });
        }
    );
});

// Get all sessions with employee info
router.get('/sessions', (req, res) => {
    const db = getDatabase();
    const { employeeId, status } = req.query;

    let query = `
    SELECT 
      s.id, s.employee_id, s.login_time, s.logout_time, s.status,
      e.username, e.full_name,
      (SELECT COUNT(*) FROM screenshots WHERE session_id = s.id) as screenshot_count
    FROM sessions s
    JOIN employees e ON s.employee_id = e.id
    WHERE 1=1
  `;
    const params = [];

    if (employeeId) {
        query += ' AND s.employee_id = ?';
        params.push(employeeId);
    }

    if (status) {
        query += ' AND s.status = ?';
        params.push(status);
    }

    query += ' ORDER BY s.login_time DESC LIMIT 100';

    db.all(query, params, (err, sessions) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Calculate break duration for each session
        const sessionsWithBreaks = sessions.map(session => {
            return new Promise((resolve) => {
                db.all(
                    'SELECT type, timestamp FROM attendance_logs WHERE session_id = ? ORDER BY timestamp ASC',
                    [session.id],
                    (err, logs) => {
                        if (err || !logs) {
                            resolve({ ...session, break_duration: 0, work_duration: 0 });
                            return;
                        }

                        let totalBreakMs = 0;
                        let breakStart = null;

                        logs.forEach(log => {
                            if (log.type === 'break_start') {
                                breakStart = new Date(log.timestamp);
                            } else if (log.type === 'break_end' && breakStart) {
                                const breakEnd = new Date(log.timestamp);
                                totalBreakMs += (breakEnd - breakStart);
                                breakStart = null;
                            }
                        });

                        // If currently on break
                        if (breakStart) {
                            const now = new Date();
                            totalBreakMs += (now - breakStart);
                        }

                        const loginTime = new Date(session.login_time);
                        const logoutTime = session.logout_time ? new Date(session.logout_time) : new Date();
                        const totalSessionMs = logoutTime - loginTime;
                        const activeWorkMs = Math.max(0, totalSessionMs - totalBreakMs);

                        resolve({
                            ...session,
                            break_duration: totalBreakMs,
                            work_duration: activeWorkMs
                        });
                    }
                );
            });
        });

        Promise.all(sessionsWithBreaks).then(results => {
            res.json({ sessions: results });
        });
    });
});

// Get screenshots for a session
router.get('/screenshots/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const db = getDatabase();

    db.all(
        `SELECT id, filepath, timestamp FROM screenshots WHERE session_id = ? ORDER BY timestamp ASC`,
        [sessionId],
        (err, screenshots) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ screenshots });
        }
    );
});

// Get screenshot image
router.get('/screenshot-image/:screenshotId', async (req, res) => {
    const { screenshotId } = req.params;
    const db = getDatabase();

    db.get(
        'SELECT filepath FROM screenshots WHERE id = ?',
        [screenshotId],
        async (err, screenshot) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!screenshot) {
                return res.status(404).json({ error: 'Screenshot not found' });
            }

            try {
                const imageBuffer = await fs.readFile(screenshot.filepath);
                res.contentType('image/jpeg');
                res.send(imageBuffer);
            } catch (error) {
                console.error('Error reading screenshot:', error);
                res.status(500).json({ error: 'Failed to load screenshot' });
            }
        }
    );
});

// Create new employee
router.post('/create-employee', async (req, res) => {
    const { username, password, fullName } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const db = getDatabase();

    db.run(
        'INSERT INTO employees (username, password, role, full_name) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, 'employee', fullName || username],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
                success: true,
                employee: {
                    id: this.lastID,
                    username,
                    fullName: fullName || username
                }
            });
        }
    );
});

// Get current settings
router.get('/settings', (req, res) => {
    const interval = screenshotService.getInterval();
    res.json({
        screenshotInterval: interval,
        screenshotIntervalMinutes: interval / 60000
    });
});

// Update settings
router.post('/settings', async (req, res) => {
    const { screenshotInterval } = req.body;

    if (!screenshotInterval || screenshotInterval < 10000) {
        return res.status(400).json({ error: 'Invalid interval (minimum 10 seconds)' });
    }

    try {
        await screenshotService.updateInterval(screenshotInterval);
        res.json({ success: true, screenshotInterval });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Get dashboard statistics
router.get('/dashboard-stats', (req, res) => {
    const db = getDatabase();

    const stats = {};

    // Get total employees
    db.get('SELECT COUNT(*) as count FROM employees WHERE role = ?', ['employee'], (err, result) => {
        stats.totalEmployees = result ? result.count : 0;

        // Get active sessions
        db.get('SELECT COUNT(*) as count FROM sessions WHERE status = ?', ['active'], (err, result) => {
            stats.activeSessions = result ? result.count : 0;

            // Get total screenshots today
            db.get(
                `SELECT COUNT(*) as count FROM screenshots WHERE DATE(timestamp) = DATE('now')`,
                [],
                (err, result) => {
                    stats.screenshotsToday = result ? result.count : 0;

                    // Get total sessions today
                    db.get(
                        `SELECT COUNT(*) as count FROM sessions WHERE DATE(login_time) = DATE('now')`,
                        [],
                        (err, result) => {
                            stats.sessionsToday = result ? result.count : 0;

                            res.json({ stats });
                        }
                    );
                }
            );
        });
    });
});

module.exports = router;
