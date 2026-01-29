const express = require('express');
const { getData, saveData } = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Record a break start
router.post('/break/start', async (req, res) => {
    const { sessionId } = req.body;
    const employeeId = req.session.userId;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }

    try {
        const data = getData();

        // Create new attendance log
        const newLog = {
            id: data.attendance_logs.length > 0
                ? Math.max(...data.attendance_logs.map(l => l.id || 0)) + 1
                : 1,
            employee_id: employeeId,
            session_id: parseInt(sessionId),
            type: 'break_start',
            timestamp: new Date().toISOString()
        };

        data.attendance_logs.push(newLog);
        await saveData(data);

        console.log('Break started:', newLog);
        res.json({ success: true, message: 'Break started' });
    } catch (error) {
        console.error('Error starting break:', error);
        res.status(500).json({ error: 'Failed to start break' });
    }
});

// Record a break end
router.post('/break/end', async (req, res) => {
    const { sessionId } = req.body;
    const employeeId = req.session.userId;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }

    try {
        const data = getData();

        // Create new attendance log
        const newLog = {
            id: data.attendance_logs.length > 0
                ? Math.max(...data.attendance_logs.map(l => l.id || 0)) + 1
                : 1,
            employee_id: employeeId,
            session_id: parseInt(sessionId),
            type: 'break_end',
            timestamp: new Date().toISOString()
        };

        data.attendance_logs.push(newLog);
        await saveData(data);

        console.log('Break ended:', newLog);
        res.json({ success: true, message: 'Break ended' });
    } catch (error) {
        console.error('Error ending break:', error);
        res.status(500).json({ error: 'Failed to end break' });
    }
});

// Get logs for a session
router.get('/logs/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    try {
        const data = getData();
        const logs = data.attendance_logs.filter(
            log => log.session_id === parseInt(sessionId)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.json({ logs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Get session details with break calculations
router.get('/session-details/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    try {
        const data = getData();

        // Find session
        const session = data.sessions.find(s => s.id === parseInt(sessionId));
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Get all break logs for this session
        const logs = data.attendance_logs.filter(
            log => log.session_id === parseInt(sessionId)
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Calculate break duration
        let totalBreakMs = 0;
        const breakPeriods = [];
        let breakStart = null;

        logs.forEach(log => {
            if (log.type === 'break_start') {
                breakStart = new Date(log.timestamp);
            } else if (log.type === 'break_end' && breakStart) {
                const breakEnd = new Date(log.timestamp);
                const duration = breakEnd - breakStart;
                totalBreakMs += duration;
                breakPeriods.push({
                    start: breakStart.toISOString(),
                    end: breakEnd.toISOString(),
                    duration: duration
                });
                breakStart = null;
            }
        });

        // If currently on break, calculate up to now
        if (breakStart) {
            const now = new Date();
            const duration = now - breakStart;
            totalBreakMs += duration;
            breakPeriods.push({
                start: breakStart.toISOString(),
                end: null,
                duration: duration,
                active: true
            });
        }

        // Calculate total session duration
        const loginTime = new Date(session.login_time);
        const logoutTime = session.logout_time ? new Date(session.logout_time) : new Date();
        const totalSessionMs = logoutTime - loginTime;
        const activeWorkMs = totalSessionMs - totalBreakMs;

        res.json({
            session,
            breakDuration: totalBreakMs,
            workDuration: activeWorkMs,
            totalDuration: totalSessionMs,
            breakPeriods,
            isOnBreak: breakStart !== null
        });
    } catch (error) {
        console.error('Error fetching session details:', error);
        res.status(500).json({ error: 'Failed to fetch session details' });
    }
});

module.exports = router;
