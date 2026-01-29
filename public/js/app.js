// Main Application Logic
const API_BASE = '/api';

let currentUser = null;
let currentView = 'login';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App initialized');

    // Check if user is already logged in
    await checkAuthStatus();

    // Setup login form
    setupLoginForm();
});

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}/auth/status`);
        const data = await response.json();

        if (data.loggedIn) {
            currentUser = data.user;
            showView(data.user.role === 'admin' ? 'admin' : 'employee');
        } else {
            showView('login');
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showView('login');
    }
}

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        await login(username, password);
    });
}

async function login(username, password) {
    const errorDiv = document.getElementById('loginError');
    const buttonText = document.getElementById('loginButtonText');
    const spinner = document.getElementById('loginSpinner');

    // Show loading state
    buttonText.classList.add('hidden');
    spinner.classList.remove('hidden');
    errorDiv.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            showView(data.user.role === 'admin' ? 'admin' : 'employee');
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.remove('hidden');
    } finally {
        buttonText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST'
        });

        currentUser = null;
        showView('login');

        // Clear form
        document.getElementById('loginForm').reset();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function showView(view) {
    currentView = view;

    // Hide all views
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('employeeView').classList.add('hidden');
    document.getElementById('adminView').classList.add('hidden');

    // Show selected view
    if (view === 'login') {
        document.getElementById('loginView').classList.remove('hidden');
    } else if (view === 'employee') {
        document.getElementById('employeeView').classList.remove('hidden');
        initEmployeeDashboard();
    } else if (view === 'admin') {
        document.getElementById('adminView').classList.remove('hidden');
        initAdminDashboard();
    }
}

// Utility function to format date/time
function formatDateTime(dateString) {
    if (!dateString || dateString === 'CURRENT_TIMESTAMP') return '--';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--';
    return date.toLocaleString();
}

function formatTime(dateString) {
    if (!dateString || dateString === 'CURRENT_TIMESTAMP') return '--:--';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(startTime, endTime) {
    if (!startTime || startTime === 'CURRENT_TIMESTAMP') return '00:00:00';

    const start = new Date(startTime);
    const end = (endTime && endTime !== 'CURRENT_TIMESTAMP') ? new Date(endTime) : new Date();

    if (isNaN(start.getTime())) return '00:00:00';

    const diff = Math.max(0, end - start);

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
