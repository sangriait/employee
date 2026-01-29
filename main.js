const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { startServer, stopServer } = require('./server/app');

// Disable hardware acceleration to prevent potential rendering crashes
app.disableHardwareAcceleration();

let mainWindow;
let tray;
let isQuitting = false;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false
  });

  mainWindow.loadURL('http://localhost:3000').catch(err => {
    console.error('Failed to load URL:', err);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`Window failed to load: ${errorCode} - ${errorDescription}`);
  });

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  try {
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show App', click: () => { if (mainWindow) mainWindow.show(); } },
      { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('Employee Tracker');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => { if (mainWindow) mainWindow.show(); });
  } catch (e) {
    console.log('Tray creation skipped');
  }
}

app.whenReady().then(async () => {
  try {
    // Start the pure-JS server
    await startServer();
    console.log('Server started successfully');

    createWindow();
    createTray();
    console.log('Application ready');
  } catch (error) {
    console.error('Failed to start:', error);
    app.quit();
  }
});

app.on('before-quit', async () => {
  isQuitting = true;
  await stopServer();
});

ipcMain.handle('minimize-to-tray', () => { if (mainWindow) mainWindow.hide(); });
ipcMain.handle('get-app-version', () => { return app.getVersion(); });
