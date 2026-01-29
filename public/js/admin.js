// Admin Dashboard Logic
let currentTab = 'employees';
let currentFilter = 'all';

function initAdminDashboard() {
    console.log('Initializing admin dashboard');

    // Setup logout button
    document.getElementById('adminLogout').addEventListener('click', logout);

    // Setup tabs
    setupTabs();

    // Setup filters
    setupFilters();

    // Setup forms
    setupAdminForms();

    // Load initial data
    loadDashboardStats();
    loadEmployees();
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    currentTab = tab;

    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
            btn.style.background = 'var(--primary-blue)';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'var(--bg-light)';
        }
    });

    // Show/hide tab content
    document.getElementById('employeesTab').classList.toggle('hidden', tab !== 'employees');
    document.getElementById('sessionsTab').classList.toggle('hidden', tab !== 'sessions');
    document.getElementById('settingsTab').classList.toggle('hidden', tab !== 'settings');

    // Load tab data
    if (tab === 'employees') {
        loadEmployees();
    } else if (tab === 'sessions') {
        loadSessions();
    } else if (tab === 'settings') {
        loadSettings();
    }
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('[data-filter]');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;

            // Update button states
            filterButtons.forEach(b => {
                if (b.dataset.filter === currentFilter) {
                    b.style.background = 'var(--primary-blue)';
                } else {
                    b.style.background = 'var(--bg-light)';
                }
            });

            loadSessions();
        });
    });
}

function setupAdminForms() {
    // Settings form
    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettings();
    });

    // Create employee button
    document.getElementById('createEmployeeBtn').addEventListener('click', () => {
        document.getElementById('createEmployeeForm').classList.remove('hidden');
    });

    document.getElementById('cancelCreateEmployee').addEventListener('click', () => {
        document.getElementById('createEmployeeForm').classList.add('hidden');
        document.getElementById('newEmployeeForm').reset();
    });

    // New employee form
    document.getElementById('newEmployeeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createEmployee();
    });

    // Modal close
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('imageModal').classList.remove('active');
    });

    document.getElementById('closeScreenshots').addEventListener('click', () => {
        document.getElementById('screenshotsModal').classList.add('hidden');
    });
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard-stats`);
        const data = await response.json();

        if (data.stats) {
            document.getElementById('totalEmployees').textContent = data.stats.totalEmployees;
            document.getElementById('activeSessions').textContent = data.stats.activeSessions;
            document.getElementById('screenshotsToday').textContent = data.stats.screenshotsToday;
            document.getElementById('sessionsToday').textContent = data.stats.sessionsToday;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE}/admin/employees`);
        const data = await response.json();

        const tbody = document.querySelector('#employeesTable tbody');
        tbody.innerHTML = '';

        data.employees.forEach(emp => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.username}</td>
        <td>${emp.full_name || '--'}</td>
        <td><span class="status-badge ${emp.role === 'admin' ? 'active' : 'inactive'}">${emp.role}</span></td>
        <td>${formatDateTime(emp.created_at)}</td>
        <td>
          <button class="btn btn-secondary" onclick="viewEmployeeSessions(${emp.id})">View Sessions</button>
        </td>
      `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

async function loadSessions() {
    try {
        const params = new URLSearchParams();
        if (currentFilter !== 'all') {
            params.append('status', currentFilter);
        }

        const response = await fetch(`${API_BASE}/admin/sessions?${params}`);
        const data = await response.json();

        const tbody = document.querySelector('#sessionsTable tbody');
        tbody.innerHTML = '';

        data.sessions.forEach(session => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${session.full_name || session.username}</td>
        <td>${formatDateTime(session.login_time)}</td>
        <td>${session.logout_time ? formatDateTime(session.logout_time) : '--'}</td>
        <td>${formatDuration(session.login_time, session.logout_time)}</td>
        <td>${session.screenshot_count}</td>
        <td><span class="status-badge ${session.status === 'active' ? 'active' : 'inactive'}">${session.status}</span></td>
        <td>
          <button class="btn btn-secondary" onclick="viewScreenshots(${session.id})">View Screenshots</button>
        </td>
      `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

async function viewEmployeeSessions(employeeId) {
    currentFilter = 'all';
    switchTab('sessions');

    try {
        const response = await fetch(`${API_BASE}/admin/sessions?employeeId=${employeeId}`);
        const data = await response.json();

        const tbody = document.querySelector('#sessionsTable tbody');
        tbody.innerHTML = '';

        data.sessions.forEach(session => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${session.full_name || session.username}</td>
        <td>${formatDateTime(session.login_time)}</td>
        <td>${session.logout_time ? formatDateTime(session.logout_time) : '--'}</td>
        <td>${formatDuration(session.login_time, session.logout_time)}</td>
        <td>${session.screenshot_count}</td>
        <td><span class="status-badge ${session.status === 'active' ? 'active' : 'inactive'}">${session.status}</span></td>
        <td>
          <button class="btn btn-secondary" onclick="viewScreenshots(${session.id})">View Screenshots</button>
        </td>
      `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading employee sessions:', error);
    }
}

async function viewScreenshots(sessionId) {
    try {
        const response = await fetch(`${API_BASE}/admin/screenshots/${sessionId}`);
        const data = await response.json();

        const gallery = document.getElementById('screenshotsGallery');
        gallery.innerHTML = '';

        if (data.screenshots.length === 0) {
            gallery.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No screenshots available for this session.</p>';
        } else {
            data.screenshots.forEach(screenshot => {
                const item = document.createElement('div');
                item.className = 'screenshot-item';
                item.innerHTML = `
          <img src="${API_BASE}/admin/screenshot-image/${screenshot.id}" alt="Screenshot">
          <div class="screenshot-time">${formatDateTime(screenshot.timestamp)}</div>
        `;

                item.addEventListener('click', () => {
                    showImageModal(`${API_BASE}/admin/screenshot-image/${screenshot.id}`);
                });

                gallery.appendChild(item);
            });
        }

        document.getElementById('screenshotsModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading screenshots:', error);
    }
}

function showImageModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');

    modalImage.src = imageSrc;
    modal.classList.add('active');
}

async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE}/admin/settings`);
        const data = await response.json();

        document.getElementById('intervalMinutes').value = data.screenshotIntervalMinutes;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    const minutes = parseFloat(document.getElementById('intervalMinutes').value);
    const milliseconds = minutes * 60000;

    try {
        const response = await fetch(`${API_BASE}/admin/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ screenshotInterval: milliseconds })
        });

        const data = await response.json();

        if (response.ok) {
            const successDiv = document.getElementById('settingsSuccess');
            successDiv.textContent = 'Settings saved successfully!';
            successDiv.classList.remove('hidden');

            setTimeout(() => {
                successDiv.classList.add('hidden');
            }, 3000);
        }
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

async function createEmployee() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const fullName = document.getElementById('newFullName').value;

    const errorDiv = document.getElementById('createEmployeeError');
    const successDiv = document.getElementById('createEmployeeSuccess');

    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE}/admin/create-employee`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, fullName })
        });

        const data = await response.json();

        if (response.ok) {
            successDiv.textContent = 'Employee created successfully!';
            successDiv.classList.remove('hidden');

            document.getElementById('newEmployeeForm').reset();

            setTimeout(() => {
                document.getElementById('createEmployeeForm').classList.add('hidden');
                successDiv.classList.add('hidden');
                loadEmployees();
            }, 2000);
        } else {
            errorDiv.textContent = data.error || 'Failed to create employee';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error creating employee:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.remove('hidden');
    }
}
