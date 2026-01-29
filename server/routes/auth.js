const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database');
const screenshotService = require('../services/screenshotService');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const db = getDatabase();

    db.get(
        'SELECT * FROM employees WHERE username = ?',
        [username],
        async (err, employee) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!employee) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, employee.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Create session in database
            db.run(
                'INSERT INTO sessions (employee_id, login_time, status) VALUES (?, CURRENT_TIMESTAMP, ?)',
                [employee.id, 'active'],
                function (err) {
                    if (err) {
                        console.error('Error creating session:', err);
                        return res.status(500).json({ error: 'Failed to create session' });
                    }

                    const sessionId = this.lastID;

                    // Set session data
                    req.session.userId = employee.id;
                    req.session.username = employee.username;
                    req.session.role = employee.role;
                    req.session.sessionId = sessionId;
                    req.session.fullName = employee.full_name;

                    // Start screenshot capture for employees (not admins)
                    if (employee.role === 'employee') {
                        screenshotService.startCapture(sessionId, employee.id);
                    }

                    res.json({
                        success: true,
                        user: {
                            id: employee.id,
                            username: employee.username,
                            role: employee.role,
                            fullName: employee.full_name,
                            sessionId: sessionId
                        }
                    });
                }
            );
        }
    );
});

// Logout endpoint
router.post('/logout', (req, res) => {
    if (!req.session.userId) {
        return res.status(400).json({ error: 'Not logged in' });
    }

    const sessionId = req.session.sessionId;
    const db = getDatabase();

    // Update session end time
    db.run(
        'UPDATE sessions SET logout_time = CURRENT_TIMESTAMP, status = ? WHERE id = ?',
        ['ended', sessionId],
        (err) => {
            if (err) {
                console.error('Error updating session:', err);
            }

            // Stop screenshot capture
            screenshotService.stopCapture();

            // Destroy session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ error: 'Failed to logout' });
                }

                res.json({ success: true });
            });
        }
    );
});

// Get current session status
router.get('/status', (req, res) => {
    if (!req.session.userId) {
        return res.json({ loggedIn: false });
    }

    const db = getDatabase();

    db.get(
        'SELECT * FROM sessions WHERE id = ?',
        [req.session.sessionId],
        (err, session) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
                loggedIn: true,
                user: {
                    id: req.session.userId,
                    username: req.session.username,
                    role: req.session.role,
                    fullName: req.session.fullName,
                    sessionId: req.session.sessionId
                },
                session: session
            });
        }
    );
});

module.exports = router;
