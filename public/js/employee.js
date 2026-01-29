// Employee Dashboard Logic
let sessionTimer = null;

function initEmployeeDashboard() {
    console.log('Initializing employee dashboard');

    // Set employee name
    document.getElementById('employeeName').textContent = currentUser.fullName || currentUser.username;

    // Setup logout button
    document.getElementById('employeeLogout').addEventListener('click', logout);

    // Load session data
    loadEmployeeSession();

    // Start session timer
    startSessionTimer();
}

async function loadEmployeeSession() {
    try {
        const response = await fetch(`${API_BASE}/auth/status`);
        const data = await response.json();

        if (data.session) {
            const loginTime = new Date(data.session.login_time);
            document.getElementById('loginTime').textContent = formatTime(data.session.login_time);

            // Update duration
            updateSessionDuration(data.session.login_time);
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

function startSessionTimer() {
    // Clear existing timer
    if (sessionTimer) {
        clearInterval(sessionTimer);
    }

    // Update every second
    sessionTimer = setInterval(() => {
        loadEmployeeSession();
    }, 1000);
}

function updateSessionDuration(loginTime) {
    const duration = formatDuration(loginTime);
    document.getElementById('sessionDuration').textContent = duration;
}
