// Employee Dashboard Logic
let sessionTimer = null;
let currentSessionId = null;
let isOnBreak = false;
let sessionData = null;

function initEmployeeDashboard() {
    console.log('Initializing employee dashboard');

    // Set employee name
    document.getElementById('employeeName').textContent = currentUser.fullName || currentUser.username;

    // Setup logout button
    document.getElementById('employeeLogout').addEventListener('click', logout);

    // Setup break button
    const breakBtn = document.getElementById('breakBtn');
    if (breakBtn) {
        breakBtn.addEventListener('click', toggleBreak);
    }

    // Load session data
    loadEmployeeSession();

    // Start session timer
    startSessionTimer();

    // Update current time every second
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}

async function loadEmployeeSession() {
    try {
        const response = await fetch(`${API_BASE}/auth/status`);
        const data = await response.json();

        if (data.session) {
            currentSessionId = data.session.id;
            const loginTime = new Date(data.session.login_time);
            document.getElementById('loginTime').textContent = formatTime(data.session.login_time);

            // Load detailed session info with breaks
            await loadSessionDetails();
        }

        // Load screenshot interval
        const settingsResponse = await fetch(`${API_BASE}/admin/settings`);
        const settingsData = await settingsResponse.json();

        if (settingsData.screenshotIntervalMinutes) {
            const minutes = settingsData.screenshotIntervalMinutes;
            if (minutes < 1) {
                const seconds = Math.round(minutes * 60);
                document.getElementById('screenshotInterval').textContent = `${seconds} seconds`;
            } else {
                document.getElementById('screenshotInterval').textContent = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
            }
        }
    } catch (error) {
        console.error('Error loading session:', error);
    }
}

async function loadSessionDetails() {
    if (!currentSessionId) return;

    try {
        const response = await fetch(`${API_BASE}/tracking/session-details/${currentSessionId}`);
        const data = await response.json();

        if (data) {
            sessionData = data;
            isOnBreak = data.isOnBreak || false;

            // Update break button state if on break
            if (isOnBreak) {
                const breakBtn = document.getElementById('breakBtn');
                const statusBadge = document.getElementById('statusBadge');
                const statusText = document.getElementById('statusText');
                const statusDot = statusBadge.querySelector('.status-dot');

                breakBtn.textContent = 'Resume Work';
                breakBtn.classList.remove('btn-secondary');
                breakBtn.classList.add('btn-primary');

                statusBadge.classList.remove('active');
                statusBadge.classList.add('inactive');
                statusBadge.style.background = '#fff3cd';
                statusBadge.style.color = '#856404';

                statusDot.classList.remove('active');
                statusDot.style.background = '#856404';

                statusText.textContent = 'On Break';
            }

            // Update durations
            updateDurationDisplays();
        }
    } catch (error) {
        console.error('Error loading session details:', error);
    }
}

async function toggleBreak() {
    if (!currentSessionId) return;

    const breakBtn = document.getElementById('breakBtn');
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const statusDot = statusBadge.querySelector('.status-dot');

    try {
        if (!isOnBreak) {
            // Start Break
            const response = await fetch(`${API_BASE}/tracking/break/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: currentSessionId })
            });
            if (response.ok) {
                isOnBreak = true;
                breakBtn.textContent = 'Resume Work';
                breakBtn.classList.remove('btn-secondary');
                breakBtn.classList.add('btn-primary');

                statusBadge.classList.remove('active');
                statusBadge.classList.add('inactive');
                statusBadge.style.background = '#fff3cd';
                statusBadge.style.color = '#856404';

                statusDot.classList.remove('active');
                statusDot.style.background = '#856404';

                statusText.textContent = 'On Break';

                // Reload session details
                await loadSessionDetails();
            }
        } else {
            // End Break
            const response = await fetch(`${API_BASE}/tracking/break/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: currentSessionId })
            });
            if (response.ok) {
                isOnBreak = false;
                breakBtn.textContent = 'Take a Break';
                breakBtn.classList.add('btn-secondary');
                breakBtn.classList.remove('btn-primary');

                statusBadge.classList.add('active');
                statusBadge.classList.remove('inactive');
                statusBadge.removeAttribute('style');

                statusDot.classList.add('active');
                statusDot.removeAttribute('style');

                statusText.textContent = 'Active';

                // Reload session details
                await loadSessionDetails();
            }
        }
    } catch (error) {
        console.error('Error toggling break:', error);
        alert('Failed to update status. Please try again.');
    }
}

function startSessionTimer() {
    // Clear existing timer
    if (sessionTimer) {
        clearInterval(sessionTimer);
    }

    // Update every second
    sessionTimer = setInterval(() => {
        updateDurationDisplays();
    }, 1000);
}

function updateDurationDisplays() {
    if (!currentSessionId) return;

    // Reload session details periodically to get accurate break data
    if (Math.random() < 0.1) { // 10% chance each second = ~every 10 seconds
        loadSessionDetails();
    }

    // Calculate durations locally for smooth updates
    const loginTimeEl = document.getElementById('loginTime');
    const loginTimeText = loginTimeEl.textContent;

    if (sessionData && sessionData.session) {
        const loginTime = new Date(sessionData.session.login_time);
        const now = new Date();
        const totalMs = now - loginTime;

        // Display total duration
        document.getElementById('sessionDuration').textContent = formatDurationMs(totalMs);

        // Calculate current break duration
        let currentBreakMs = sessionData.breakDuration || 0;
        if (isOnBreak && sessionData.breakPeriods) {
            const lastBreak = sessionData.breakPeriods[sessionData.breakPeriods.length - 1];
            if (lastBreak && lastBreak.active) {
                const breakStart = new Date(lastBreak.start);
                currentBreakMs = sessionData.breakDuration - lastBreak.duration + (now - breakStart);
            }
        }

        // Display break and work durations
        document.getElementById('breakDuration').textContent = formatDurationMs(currentBreakMs);
        document.getElementById('workDuration').textContent = formatDurationMs(Math.max(0, totalMs - currentBreakMs));
    }
}

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDurationMs(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
