import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Store from 'electron-store';
import { splitEntriesByTimestamp, parseKillEntry, parseIncapEntry } from './logParser.js';

// Get the current directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Ensure proper error handling for ESM
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize the store
const store = new Store({
  defaults: {
    gameDirectory: 'C:\\Program Files\\Roberts Space Industries\\StarCitizen',
    apiKey: '',
  }
});

let store_dir = store.get('gameDirectory');
let LOG_FILE_PATH = path.resolve(  store_dir + '/LIVE/Game.log');

let lastSize = 0;
let mainWindow = null;
const processedEntries = new Set();

function createWindow() {
    mainWindow = new BrowserWindow({
      width: 600,
      height: 1000,
      resizable: true,          //  Disable resizing
      frame: false,              //  Remove native frame
      titleBarStyle: 'hidden',   // Optional: cleaner mac look
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        nodeIntegration: false,  // Disable Node.js integration in the renderer process
        contextIsolation: true,  // Enable context isolation
        enableRemoteModule: false, // Disable remote module
        sandbox: false,          // Required for some nodeIntegration features
        webSecurity: true,       // Enable web security
        webviewTag: false        // Disable webview tag for security
      },
    });
  
    mainWindow.loadFile('index.html');
  }

function sendStatusUpdate(status, isError = false) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('file-status-update', { status, isError });
  }
}

function readNewLogData() {
  sendStatusUpdate('Reading log file... ' + LOG_FILE_PATH);
  
  fs.stat(LOG_FILE_PATH, (err, stats ) => {
    if (err) {
      sendStatusUpdate('Log file not found: ' + LOG_FILE_PATH, true);
      return;
    }
    
    // On first run, set initial size and don't read anything
    if (lastSize === 0) {
      lastSize = stats.size;
      sendStatusUpdate(`Watching log file: ${LOG_FILE_PATH}`);
      return;
    }
    
    // Handle log rotation (file became smaller)
    if (stats.size < lastSize) {
      sendStatusUpdate('Log file rotated, resetting...');
      lastSize = 0;
      return;
    }
    
    // Only read if there's new content
    if (stats.size > lastSize) {
      const stream = fs.createReadStream(LOG_FILE_PATH, {
        start: lastSize,
        end: stats.size,
        encoding: 'utf-8',
      });
  
      let leftover = '';
  
      stream.on('data', (chunk) => {
        const data = leftover + chunk;
        const entries = splitEntriesByTimestamp(data);
        sendStatusUpdate('Processing log entries... ' + LOG_FILE_PATH);
        for (const entry of entries) {
          if (entry.includes('killed by') && !entry.includes('_NPC_')) {
            const killInfo = parseKillEntry(entry);
            if (killInfo) {
              const uniqueKey = killInfo.timestamp + "KILL" +killInfo.killerName + Math.random()*1000;
  
              if (!processedEntries.has(uniqueKey)) {
                processedEntries.add(uniqueKey);
                mainWindow.webContents.send('kill-event', killInfo);
              }
            }
          }
          if (entry.includes('<Spawn Flow> CSCPlayerPUSpawningComponent::UnregisterFromExternalSystems')) {
            const incapInfo = parseIncapEntry(entry);
            if (incapInfo) {
              const uniqueKey = incapInfo.timestamp + "INCAP" +incapInfo.victimName + Math.random()*1000;
  
              if (!processedEntries.has(uniqueKey)) {
                processedEntries.add(uniqueKey);
              mainWindow.webContents.send('incap-event', incapInfo);
              }
            }
          }
        }
    });
  
      stream.on('end', () => {
        lastSize = stats.size;
      });
  
      stream.on('error', (error) => {
        sendStatusUpdate('Stream read error', true);
      });
    }
  });
}

app.whenReady().then(() => {
  const POLL_INTERVAL_MS = 5000; // 0.5 second

  createWindow();
  
  // Start a loop to poll the file
  setInterval(() => {
    readNewLogData();
  }, POLL_INTERVAL_MS);

});


ipcMain.on('simulate-kill', (event, entryType) => {
    const logLine = TEST_ENTRIES[entryType] || TEST_ENTRIES.basic;
    fs.appendFile(LOG_FILE_PATH, logLine, (err) => {
      if (err) console.error('Failed to write test log:', err);
      else console.log('Test kill written to log.');
    });
});

ipcMain.on('window-control', (event, action) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return;
  
    if (action === 'minimize') win.minimize();
    else if (action === 'close') win.close(); // removed maximize
  });


// Handle window closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle saving the API key
ipcMain.on('save-api-key', (event, apiKey) => {
  store.set('apiKey', apiKey);
});

// Handle saving the game directory
ipcMain.on('save-game-directory', (event, gameDirectory) => {
  try {
    store.set('gameDirectory', gameDirectory);
    event.sender.send('game-directory-saved', { success: true });
    LOG_FILE_PATH = path.resolve(  store_dir + '/LIVE/Game.log');

  } catch (error) {
    console.error('Error saving game directory:', error);
    event.sender.send('game-directory-saved', { 
      success: false, 
      error: error.message 
    });
  }
});

// Handle getting the game directory
ipcMain.on('get-game-directory', (event) => {
  const gameDir = store.get('gameDirectory');

  event.sender.send('game-directory', gameDir);
});

const TEST_ENTRIES = {
    basic: `<${returnDate()}> 'Cromz' [111] was killed by 'Mezame' [222] using 'gmni_pistol_ballistic_01_firerats01_4782460779063' with damage type 'Bullet'\n`,
    alt: `<${returnDate()}> [Notice] <Spawn Flow> CSCPlayerPUSpawningComponent::UnregisterFromExternalSystems: Player 'HansVonBanenenbiegr' [1693825761550] lost reservation for spawnpoint bed_hospital_2_a-005 [4755889825939] at location 3515131989 [Team_ActorFeatures][Gamerules]\n`,
  };
  
function returnDate() {
    let d = new Date().toISOString()
    return d;
}
