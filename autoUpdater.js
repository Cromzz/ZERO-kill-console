import { createRequire } from 'node:module';
import packageJson from './package.json' assert { type: 'json' };

const require = createRequire(import.meta.url);
const { autoUpdater } = require('electron-updater');



autoUpdater.on('update-available', () => {
  console.log('Update available', packageJson.version);
});

autoUpdater.on('update-not-available', () => {
  console.log('Up to date!', packageJson.version);
});

autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded');
});

autoUpdater.version = packageJson.version;

export { autoUpdater }; // ✅ This matches your import
