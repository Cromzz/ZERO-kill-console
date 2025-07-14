// Import Electron APIs
import { contextBridge, ipcRenderer } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a safe wrapper for the API
const api = {
  // Window control
  windowControl: (action) => ipcRenderer.send('window-control', action),
  
  // Game directory handling
  saveGameDirectory: (path) => ipcRenderer.send('save-game-directory', path),
  
  // API key handling
  saveApiKey: (key) => ipcRenderer.send('save-api-key', key),
  
  // Game events
  onKillEvent: (callback) => ipcRenderer.on('kill-event', (_, data) => callback(data)),
  onIncapEvent: (callback) => ipcRenderer.on('incap-event', (_, data) => callback(data)),
  sendTestKill: (type) => ipcRenderer.send('test-kill', type),
  
  // File status updates
  onFileStatusUpdate: (callback) => ipcRenderer.on('file-status-update', (_, status) => callback(status)),
  
  // Utility
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Update handling
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', () => callback()),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', () => callback()),
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', api);
