const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
