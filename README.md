# 🎯 Employee Tracker

**The professional, offline-capable employee monitoring solution.**

---

## 📥 **[DOWNLOAD APPLICATION (Latest Release)](https://github.com/sangriait/screentime/releases)**
*(Click above to get the latest offline version)*

---

## 🚀 How to Run the App
**Just download, unzip, and run!**

1. **Download** the zip file from the "Releases" (link above).
2. **Unzip** the folder completely.
3. Double-click **`Employee Tracker.exe`**.
4. **Done!** No installation required.

---

## 📚 User Guides
- **[Installation Guide](INSTALLATION_GUIDE.md)**
- **[How to Share with Others](HOW_TO_SHARE_APP.md)**
- **[Admin Guide: Adding Employees](HOW_TO_ADD_EMPLOYEES.md)**

---

## ✨ Features at a Glance
- **Zero Installation**: Runs directly from a folder.
- **Fully Offline**: No internet required.
- **Session Tracking**: Automatic time and break calculation.
- **Screenshots**: Auto-capture monitoring (stored locally).

---

## 📋 System Requirements
- Windows 10 or Windows 11
- No Internet Required
- 300 MB Disk Space

---

### For Running Portable Build
- Windows 10 or Windows 11
- No Node.js required (all dependencies bundled)
- 300 MB disk space minimum

## 🚀 Installation & Setup

### Option 1: Development Mode (For Testing)

1. **Clone or Download the Repository**
   ```bash
   git clone  https://github.com/sangriait/employee
   cd employee
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Application**
   ```bash
   npm start
   ```

   The application window will open automatically on `http://localhost:3000`.

### Option 2: Build Portable Executable (For Distribution)

1. **Install Dependencies** (if not already done)
   ```bash
   npm install
   ```

2. **Build the Application**
   ```bash
   npm run pack
   ```

3. **Locate the Build**
   - Find the portable application in: `dist/win-unpacked/`
   - The main executable is: `Employee Tracker.exe`

4. **Distribute**
   - Copy the entire `win-unpacked` folder to target machines
   - No installation required - just run the `.exe` file
   - All dependencies are bundled

### Option 3: Create Installer (NSIS)

```bash
npm run build
```

This creates a Windows installer in the `dist` folder.

## 🔌 Offline Deployment Instructions (BEL)

**This application is fully offline-capable and requires NO internet connection to function.**

### Step 1: Prepare on Internet-Connected Machine

1. Download this repository as ZIP or clone it
2. Run `npm install` to download all dependencies
3. Run `npm run pack` to create portable build
4. Copy the entire `dist/win-unpacked/` folder to a USB drive

### Step 2: Deploy on Offline Machines

1. Copy the `win-unpacked` folder from USB to target machine
2. Navigate to the folder and run `Employee Tracker.exe`
3. No internet connection needed
4. No installation required
5. Data is stored locally in `database.json`

### Step 3: Backup Configuration

To transfer data or settings between machines:
- Copy `database.json` file from the application folder
- This contains all employees, sessions, and settings
- Screenshots are stored in `server/screenshots/` folder

## 🔑 Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Demo Employee Account  
- **Username**: `employee1`
- **Password**: `emp123`

> ⚠️ **IMPORTANT**: Change admin password immediately after first login for security.

## 📖 User Guide

### For Employees

1. **Login**
   - Open the application
   - Enter your username and password
   - Click "Sign In"

2. **View Your Dashboard**
   - See your session duration, work time, and break time
   - Monitor your current status (Active/On Break)
   - View login time and current time

3. **Take Breaks**
   - Click "Take a Break" button when leaving workstation
   - Status changes to "On Break" (yellow/orange indicator)
   - Click "Resume Work" when returning
   - Your break time is tracked separately

4. **Logout**
   - Click "Logout" button when ending your work day
   - Your session is saved with complete timing data

### For Administrators

1. **Login as Admin**
   - Use admin credentials to access admin dashboard

2. **Create New Employees**
   - Go to "Employees" tab
   - Click "+ New Employee"
   - Enter username, password, and full name
   - Click "Create Employee"

3. **View Employee Sessions**
   - Go to "Sessions" tab
   - See all sessions with:
     - Login/logout times
     - Total duration
     - Break time (in yellow/orange)
     - Work hours (in green)
     - Screenshot count
   - Click "View Screenshots" to see captured images

4. **Filter Sessions**
   - Use filter buttons: All / Active / Ended
   - View specific employee sessions by clicking "View Sessions" in Employees tab

5. **Configure Settings**
   - Go to "Settings" tab
   - Adjust screenshot interval (in minutes)
   - Click "Save Settings"

## 📊 Data Structure

All data is stored in `database.json` in the application root:

```json
{
  "employees": [...],
  "sessions": [...],
  "screenshots": [...],
  "attendance_logs": [...], // Break start/end records
  "settings": [...]
}
```

### Break Timing Calculation

**Total Session Duration** = Logout Time - Login Time

**Break Duration** = Sum of all (Break End - Break Start) intervals

**Actual Work Hours** = Total Session Duration - Break Duration

## 🔧 Configuration

### Screenshot Interval

Default: 60 seconds (1 minute)

To change:
1. Login as admin
2. Go to Settings tab
3. Enter new interval in minutes (minimum 0.16 = 10 seconds)
4. Click "Save Settings"

### Port Configuration

The application runs on port `3000` by default. To change:
- Edit `server/app.js`, line with `const PORT = 3000`

## 🐛 Troubleshooting

### Application Won't Start

**Problem**: Double-clicking .exe doesn't launch
- **Solution**: Right-click → Run as Administrator
- Check if port 3000 is available

### Can't Login

**Problem**: Username/password not working
- **Solution**: Use default credentials listed above
- Check if `database.json` exists
- Delete `database.json` to reset (will lose data)

### Screenshots Not Saving

**Problem**: No screenshots in gallery
- **Solution**: Check `server/screenshots/` folder exists
- Ensure write permissions on application folder
- Verify screenshot interval is set correctly

### Break Time Not Updating

**Problem**: Break duration shows 00:00:00
- **Solution**:  Ensure you clicked "Take a Break" button
- Check `attendance_logs` in `database.json` for entries
- Refresh the admin dashboard

### Data Loss After Restart

**Problem**: Sessions disappear after closing app
- **Solution**: Check `database.json` file exists
- Ensure app has write permissions to folder
- Don't delete `database.json` file

## 📁 Folder Structure

```
employee_tracker/
├── main.js                 # Electron main process
├── preload.js             # Electron preload script
├── package.json           # Dependencies and scripts
├── database.json          # Data storage (auto-created)
├── public/                # Frontend files
│   ├── index.html         # Main HTML
│   ├── css/               # Styles
│   └── js/                # Frontend JavaScript
│       ├── app.js         # Main app logic
│       ├── employee.js    # Employee dashboard
│       └── admin.js       # Admin dashboard
├── server/                # Backend files
│   ├── app.js             # Express server
│   ├── database.js        # JSON database handler
│   ├── routes/            # API endpoints
│   │   ├── auth.js        # Login/logout
│   │   ├── admin.js       # Admin operations
│   │   └── tracking.js    # Break tracking
│   ├── middleware/        # Authentication
│   ├── services/          # Screenshot service
│   └── screenshots/       # Captured images (auto-created)
└── dist/                  # Build output (after npm run pack)
```

## 🔒 Security Notes

- Passwords are hashed using bcryptjs
- Session management via express-session
- No external network calls required
- Data stored locally - ensure folder permissions are secure
- Change default admin password immediately

## 🆘 Support

For issues or questions:
1. Check this README thoroughly
2. Review the `HOW_TO_SHARE_APP.md` for detailed sharing instructions
3. Check troubleshooting section above
4. Contact your system administrator

## 📝 License

MIT License - See LICENSE file for details

---

**Status**: Production Ready ✅  
**Platform**: Windows 10/11 🪟  
**Mode**: Fully Offline 🔌  
**Version**: 1.0.0
