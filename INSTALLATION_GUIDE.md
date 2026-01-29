# 📦 Employee Tracker - Complete Installation Guide

This guide will walk you through installing and running the Employee Tracker application step-by-step.

---

## ✅ Prerequisites Check

Before starting, verify you have Node.js installed:

1. Open **PowerShell** or **Command Prompt**
2. Type: `node --version`
3. You should see something like `v22.13.0` ✅

> **Good News**: You already have Node.js v22.13.0 and npm 11.0.0 installed!

---

## 🎯 Choose Your Installation Method

Pick the method that best suits your needs:

| Method | Time | Best For | Output |
|--------|------|----------|--------|
| **Method 1** | 30 seconds | Testing right now | Runs in development mode |
| **Method 2** | 2-3 minutes | Sharing with others | Portable .exe file |
| **Method 3** | 3-5 minutes | Professional deployment | Windows installer |

---

## 🚀 Method 1: Quick Start (Development Mode)

**Use this to test the app immediately!**

### Step 1: Open Terminal
- Press `Win + R`
- Type: `powershell`
- Press Enter

### Step 2: Navigate to Project Folder
```powershell
cd f:\employee_tracker
```

### Step 3: Start the Application
```powershell
npm start
```

### Step 4: Wait for Launch
- The terminal will show: `Server running on http://localhost:3000`
- An Electron window will automatically open
- You'll see the login screen

### Step 5: Login
Use these default credentials:

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**Employee Login:**
- Username: `employee1`
- Password: `emp123`

### ✅ Done! The app is running!

> **Note**: The app will close when you close the terminal. This is for testing only.

---

## 📦 Method 2: Build Portable Executable

**Use this to create a standalone .exe that works on any Windows PC without Node.js!**

### Step 1: Open PowerShell
- Press `Win + R`
- Type: `powershell`
- Press Enter

### Step 2: Navigate to Project
```powershell
cd f:\employee_tracker
```

### Step 3: Build the Portable App
```powershell
npm run pack
```

### Step 4: Wait for Build
- This takes 2-3 minutes
- You'll see progress messages
- Wait for "Build complete" message

### Step 5: Locate the Executable
The portable app is created at:
```
f:\employee_tracker\dist\win-unpacked\
```

Inside this folder, you'll find:
- **`Employee Tracker.exe`** ← This is your app!
- Supporting files and folders

### Step 6: Run the Application
**Option A - Run from current location:**
1. Navigate to `f:\employee_tracker\dist\win-unpacked\`
2. Double-click `Employee Tracker.exe`

**Option B - Copy to another location:**
1. Copy the **entire** `win-unpacked` folder to:
   - Desktop
   - USB drive
   - Another computer
   - Network drive
2. Double-click `Employee Tracker.exe` from the new location

### ✅ Done! You have a portable application!

> **Important**: Always keep the entire `win-unpacked` folder together. Don't move just the .exe file alone.

---

## 🎁 Method 3: Create Windows Installer

**Use this to create a professional installer like other Windows programs!**

### Step 1: Open PowerShell
- Press `Win + R`
- Type: `powershell`
- Press Enter

### Step 2: Navigate to Project
```powershell
cd f:\employee_tracker
```

### Step 3: Build the Installer
```powershell
npm run build
```

### Step 4: Wait for Build
- This takes 3-5 minutes
- You'll see progress messages
- Wait for "Build complete" message

### Step 5: Locate the Installer
The installer is created at:
```
f:\employee_tracker\dist\Employee Tracker Setup 1.0.0.exe
```

### Step 6: Install the Application

**On your computer:**
1. Navigate to `f:\employee_tracker\dist\`
2. Double-click `Employee Tracker Setup 1.0.0.exe`
3. Follow the installation wizard
4. Click "Install"
5. Launch from Start Menu or Desktop shortcut

**On other computers:**
1. Copy `Employee Tracker Setup 1.0.0.exe` to USB drive
2. Transfer to target computer
3. Double-click the installer
4. Follow installation wizard
5. No internet required!

### ✅ Done! Professional installation complete!

---

## 🔐 Default Login Credentials

After installation, use these credentials:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full admin dashboard, employee management, settings

### Demo Employee Account
- **Username**: `employee1`
- **Password**: `emp123`
- **Access**: Employee dashboard, time tracking, breaks

> ⚠️ **Security**: Change the admin password immediately after first login!

---

## 🎯 What to Do After Installation

### For Administrators:

1. **Login as Admin**
   - Use `admin` / `admin123`

2. **Change Admin Password**
   - Go to Settings
   - Update password
   - Save changes

3. **Create Employee Accounts**
   - Click "Employees" tab
   - Click "+ New Employee"
   - Enter details:
     - Username (e.g., `john.doe`)
     - Password (e.g., `temp123`)
     - Full Name (e.g., `John Doe`)
   - Click "Create Employee"

4. **Configure Screenshot Settings**
   - Go to "Settings" tab
   - Set screenshot interval (default: 1 minute)
   - Click "Save Settings"

### For Employees:

1. **Login**
   - Use credentials provided by admin
   - Click "Sign In"

2. **View Dashboard**
   - See your session timer
   - Monitor work time vs break time
   - Check current status

3. **Take Breaks**
   - Click "Take a Break" when leaving
   - Click "Resume Work" when returning
   - Break time is tracked separately

4. **Logout**
   - Click "Logout" when done for the day
   - Your session is saved automatically

---

## 🌐 Offline Deployment (No Internet Required)

This app works **100% offline**! Here's how to deploy it:

### Scenario: Deploy to 10 computers without internet

**Step 1: Prepare on Internet-Connected PC**
1. Build the portable app: `npm run pack`
2. Copy `dist\win-unpacked\` folder to USB drive

**Step 2: Deploy to Offline PCs**
1. Insert USB drive
2. Copy `win-unpacked` folder to each PC (e.g., `C:\EmployeeTracker\`)
3. Run `Employee Tracker.exe`
4. No installation needed!
5. No internet required!

**Step 3: Centralize Data (Optional)**
- To sync data between PCs, copy `database.json` file
- Screenshots are in `server\screenshots\` folder

---

## 🐛 Troubleshooting

### Problem: "npm is not recognized"

**Solution:**
- Node.js is not installed or not in PATH
- Download from: https://nodejs.org/
- Install and restart PowerShell

---

### Problem: "Port 3000 is already in use"

**Solution:**
- Another app is using port 3000
- Close other applications
- Or change port in `server\app.js` (line 9)

---

### Problem: Application window doesn't open

**Solution:**
1. Check terminal for error messages
2. Try running as Administrator:
   - Right-click `Employee Tracker.exe`
   - Select "Run as administrator"

---

### Problem: Can't login with default credentials

**Solution:**
1. Check if `database.json` exists in app folder
2. If corrupted, delete `database.json` (app will recreate it)
3. Try default credentials again

---

### Problem: Screenshots not saving

**Solution:**
1. Check if `server\screenshots\` folder exists
2. Ensure app has write permissions
3. Check available disk space

---

## 📊 File Locations

After installation, important files are located here:

### Development Mode (`npm start`)
```
f:\employee_tracker\
├── database.json          ← All data stored here
├── server\screenshots\    ← Screenshots saved here
└── main.js                ← Main application file
```

### Portable Build (`npm run pack`)
```
f:\employee_tracker\dist\win-unpacked\
├── Employee Tracker.exe   ← Main executable
├── resources\
│   └── app.asar          ← Bundled application
└── [other support files]
```

### Installed Version (`npm run build`)
```
C:\Users\[YourName]\AppData\Local\Programs\employee-tracker\
├── Employee Tracker.exe
├── database.json          ← Created on first run
└── server\screenshots\    ← Created on first run
```

---

## 🎓 Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Run in development mode |
| `npm run pack` | Build portable .exe |
| `npm run build` | Create installer |
| `npm install` | Install dependencies (if missing) |

---

## ✨ Next Steps

1. ✅ Choose your installation method above
2. ✅ Follow the step-by-step instructions
3. ✅ Login with default credentials
4. ✅ Change admin password
5. ✅ Create employee accounts
6. ✅ Start tracking!

---

## 📞 Need Help?

- Check the main `README.md` for detailed documentation
- Review troubleshooting section above
- Verify all steps were followed correctly

---

**Status**: Ready to Install! 🚀  
**Platform**: Windows 10/11  
**Internet Required**: No (fully offline)  
**Installation Time**: 30 seconds - 5 minutes
