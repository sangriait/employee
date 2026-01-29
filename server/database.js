const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.json');

let data = {
    employees: [],
    sessions: [],
    screenshots: [],
    attendance_logs: [],
    settings: [
        { key: 'screenshot_interval', value: '60000' }
    ]
};

async function initDatabase() {
    try {
        const fileExists = await fs.access(DB_PATH).then(() => true).catch(() => false);
        if (fileExists) {
            const raw = await fs.readFile(DB_PATH, 'utf8');
            data = JSON.parse(raw);

            // Ensure attendance_logs exists
            if (!data.attendance_logs) {
                data.attendance_logs = [];
            }

            console.log('Database loaded from JSON');

            // Auto-repair missing IDs
            let repaired = false;
            data.screenshots.forEach((s, idx) => {
                if (!s.id) {
                    s.id = data.screenshots.reduce((max, curr) => Math.max(max, curr.id || 0), 0) + 1;
                    repaired = true;
                }
            });
            if (repaired) await save();

        } else {
            const bcrypt = require('bcryptjs');
            data.employees.push({
                id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10),
                role: 'admin', full_name: 'System Administrator', created_at: new Date().toISOString()
            });
            data.employees.push({
                id: 2, username: 'employee1', password: bcrypt.hashSync('emp123', 10),
                role: 'employee', full_name: 'Demo Employee', created_at: new Date().toISOString()
            });
            await save();
            console.log('New JSON database initialized');
        }
    } catch (error) {
        console.error('Error initializing JSON database:', error);
    }
}

async function save() {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Failed to save JSON database:', e);
    }
}

const getDatabase = () => ({
    get: (query, params, callback) => {
        try {
            if (query.includes('FROM employees WHERE username = ?')) {
                const user = data.employees.find(e => e.username === params[0]);
                callback(null, user);
            } else if (query.includes('FROM settings WHERE key = ?')) {
                const setting = data.settings.find(s => s.key === params[0]);
                callback(null, setting);
            } else if (query.includes('FROM sessions WHERE id = ?')) {
                const session = data.sessions.find(s => s.id == params[0]);
                callback(null, session);
            } else if (query.includes('COUNT(*) as count FROM employees')) {
                callback(null, { count: data.employees.filter(e => e.role === 'employee').length });
            } else if (query.includes('COUNT(*) as count FROM sessions WHERE status = ?')) {
                callback(null, { count: data.sessions.filter(s => s.status === params[0]).length });
            } else if (query.includes("DATE(timestamp) = DATE('now')") || query.includes("DATE(timestamp) = DATE('today')")) {
                const today = new Date().toISOString().split('T')[0];
                const count = data.screenshots.filter(s => s.timestamp && s.timestamp.startsWith(today)).length;
                callback(null, { count });
            } else if (query.includes("DATE(login_time) = DATE('now')") || query.includes("DATE(login_time) = DATE('today')")) {
                const today = new Date().toISOString().split('T')[0];
                const count = data.sessions.filter(s => s.login_time && s.login_time.startsWith(today)).length;
                callback(null, { count });
            } else if (query.includes('FROM screenshots WHERE id = ?')) {
                const screenshot = data.screenshots.find(s => s.id == params[0]);
                callback(null, screenshot);
            } else {
                callback(null, null);
            }
        } catch (e) { callback(e); }
    },
    run: (query, params, callback) => {
        try {
            if (query.includes('INSERT INTO sessions')) {
                const id = data.sessions.reduce((max, s) => Math.max(max, s.id || 0), 0) + 1;
                data.sessions.push({
                    id, employee_id: parseInt(params[0]),
                    login_time: new Date().toISOString(), status: params[1] || 'active'
                });
                save().then(() => { if (callback) callback.call({ lastID: id }, null); });
            } else if (query.includes('UPDATE sessions SET logout_time')) {
                const session = data.sessions.find(s => s.id == params[1]);
                if (session) {
                    session.logout_time = new Date().toISOString();
                    session.status = params[0];
                }
                save().then(() => { if (callback) callback(null); });
            } else if (query.includes('INSERT INTO screenshots')) {
                const id = data.screenshots.reduce((max, s) => Math.max(max, (s.id || 0)), 0) + 1;
                data.screenshots.push({
                    id, session_id: parseInt(params[0]), employee_id: parseInt(params[1]),
                    filepath: params[2], timestamp: new Date().toISOString()
                });
                save().then(() => { if (callback) callback(null); });
            } else if (query.includes('INSERT OR REPLACE INTO settings')) {
                const setting = data.settings.find(s => s.key === params[0]);
                if (setting) setting.value = params[1];
                else data.settings.push({ key: params[0], value: params[1] });
                save().then(() => { if (callback) callback(null); });
            } else if (query.includes('INSERT INTO employees')) {
                const id = data.employees.reduce((max, e) => Math.max(max, e.id || 0), 0) + 1;
                data.employees.push({
                    id,
                    username: params[0],
                    password: params[1],
                    role: params[2],
                    full_name: params[3],
                    created_at: new Date().toISOString()
                });
                save().then(() => { if (callback) callback.call({ lastID: id }, null); });
            } else if (query.includes('INSERT INTO attendance_logs')) {
                const id = (data.attendance_logs || []).reduce((max, l) => Math.max(max, l.id || 0), 0) + 1;
                if (!data.attendance_logs) data.attendance_logs = [];
                data.attendance_logs.push({
                    id,
                    employee_id: parseInt(params[0]),
                    session_id: parseInt(params[1]),
                    type: params[2],
                    timestamp: new Date().toISOString()
                });
                save().then(() => { if (callback) callback(null); });
            } else { if (callback) callback(null); }
        } catch (e) { if (callback) callback(e); }
    },
    all: (query, params, callback) => {
        try {
            if (query.includes('FROM sessions')) {
                let results = [...data.sessions].reverse();
                if (query.includes('employee_id = ?')) {
                    results = results.filter(s => s.employee_id == params[0]);
                }
                if (query.includes('status = ?')) {
                    results = results.filter(s => s.status == params[0]);
                }
                results = results.map(s => {
                    const emp = data.employees.find(e => e.id == s.employee_id);
                    return {
                        ...s,
                        username: emp ? emp.username : 'Unknown',
                        full_name: emp ? emp.full_name : 'Unknown',
                        screenshot_count: data.screenshots.filter(sc => sc.session_id == s.id).length
                    };
                });
                callback(null, results);
            } else if (query.includes('FROM employees')) {
                callback(null, data.employees);
            } else if (query.includes('FROM screenshots')) {
                const results = data.screenshots.filter(s => s.session_id == params[0]);
                callback(null, results);
            } else if (query.includes('FROM attendance_logs')) {
                const results = (data.attendance_logs || []).filter(l => l.session_id == params[0]);
                callback(null, results);
            } else { callback(null, []); }
        } catch (e) { callback(e); }
    }
});

module.exports = {
    initDatabase,
    getDatabase,
    getData: () => data,
    saveData: save,
    closeDatabase: () => Promise.resolve()
};

