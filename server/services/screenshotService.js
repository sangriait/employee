const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { getDatabase } = require('../database');

class ScreenshotService {
    constructor() {
        this.intervalId = null;
        this.currentSessionId = null;
        this.currentEmployeeId = null;
        this.screenshotInterval = 60000;
        this.screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');
    }

    async initialize() {
        try {
            await fs.mkdir(this.screenshotsDir, { recursive: true });
            console.log('Screenshots directory ready:', this.screenshotsDir);
        } catch (error) { }
        await this.loadSettings();
    }

    async loadSettings() {
        const db = getDatabase();
        return new Promise((resolve) => {
            db.get('SELECT value FROM settings WHERE key = ?', ['screenshot_interval'], (err, row) => {
                if (!err && row) this.screenshotInterval = parseInt(row.value);
                resolve();
            });
        });
    }

    async startCapture(sessionId, employeeId) {
        if (this.intervalId) {
            this.stopCapture();
        }
        this.currentSessionId = sessionId;
        this.currentEmployeeId = employeeId;
        console.log(`Starting stable PowerShell capture for session ${sessionId}, employee ${employeeId}`);

        // Take first screenshot immediately
        await this.captureScreenshot();

        // Then continue at intervals
        this.intervalId = setInterval(() => this.captureScreenshot(), this.screenshotInterval);
    }

    async captureScreenshot() {
        if (!this.currentSessionId || !this.currentEmployeeId) {
            console.log('Capture skipped: No active session/employee');
            return;
        }

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `screenshot_${timestamp}.jpg`;
            const employeeDir = path.join(this.screenshotsDir, `employee_${this.currentEmployeeId}`);
            const filepath = path.join(employeeDir, filename);

            await fs.mkdir(employeeDir, { recursive: true });

            console.log(`Capturing screenshot via PowerShell to: ${filename}`);

            // PowerShell command to take a screenshot and save as JPEG
            // Fixed path string handling for Windows
            const psCommand = `
                [Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms');
                [Reflection.Assembly]::LoadWithPartialName('System.Drawing');
                $screen = [System.Windows.Forms.Screen]::PrimaryScreen;
                $bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height);
                $graphics = [System.Drawing.Graphics]::FromImage($bitmap);
                $graphics.CopyFromScreen($screen.Bounds.X, $screen.Bounds.Y, 0, 0, $bitmap.Size);
                $bitmap.Save('${filepath.replace(/\\/g, '\\\\')}', [System.Drawing.Imaging.ImageFormat]::Jpeg);
                $graphics.Dispose();
                $bitmap.Dispose();
            `.replace(/\n/g, ' ').trim();

            await new Promise((resolve, reject) => {
                exec(`powershell -NoProfile -Command "${psCommand}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('PowerShell Error:', stderr);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            // Save to database
            const db = getDatabase();
            db.run(`INSERT INTO screenshots (session_id, employee_id, filepath, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                [this.currentSessionId, this.currentEmployeeId, filepath]);

            console.log(`Screenshot saved successfully: ${filename}`);
        } catch (error) {
            console.error('Screenshot processing failed:', error.message);
        }
    }

    stopCapture() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.currentSessionId = null;
            this.currentEmployeeId = null;
            console.log('Capture stopped');
        }
    }

    async updateInterval(newInterval) {
        this.screenshotInterval = newInterval;
        const db = getDatabase();
        db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['screenshot_interval', newInterval.toString()]);

        if (this.intervalId) {
            const sId = this.currentSessionId;
            const eId = this.currentEmployeeId;
            this.stopCapture();
            this.startCapture(sId, eId);
        }
    }
}

module.exports = new ScreenshotService();
