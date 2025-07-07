import { autoUpdater, AppUpdater } from 'electron-updater';
import { packageJson } from './package.json';
import { app } from 'electron';

autoUpdater.autoDownload = true;    
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.autoUpdate = true;

app.whenReady().then(() => {
    autoUpdater.checkForUpdates();
});

autoUpdater.on('update-available', () => {
    console.log('Update available', packageJson.version);
});
autoUpdater.on('update-not-available', () => {
    console.log('We are up to date!', packageJson.version);
});
autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded');
});