// Import any necessary modules here
// Example: import { someFunction } from './someModule.js';

// Ensure electronAPI is available
const electronAPI = window.electronAPI || {};

// Handle file status updates
electronAPI.onFileStatusUpdate?.(({ status, isError }) => {
  const fileReadInfo = document.getElementById('file-read-info');
  if (fileReadInfo) {
    fileReadInfo.textContent = status;
    fileReadInfo.className = 'text-xs p-1 rounded';
    fileReadInfo.classList.add(isError ? 'bg-black/30' : 'bg-black/30', 'text-white');
  }
});

// Settings modal functions
function saveApiKey() {
  try {
    const apiKey = document.getElementById('api-key')?.value;
    if (!apiKey) {
      console.error('API key input not found');
      return;
    }
    if (electronAPI.saveApiKey) {
      electronAPI.saveApiKey(apiKey);
      console.log('API key saved');
    } else {
      console.error('saveApiKey API not available');
    }
  } catch (error) {
    console.error('Error saving API key:', error);
  }
}

function saveGameDirectory() {
  try {
    const gamePathInput = document.getElementById('game-path');
    const gamePathInfo = document.getElementById('game-path-info');
    
    if (!gamePathInput) {
      console.error('Game path input not found');
      return;
    }
    
    const gamePath = gamePathInput.value;
    
    if (electronAPI.saveGameDirectory) {
      electronAPI.saveGameDirectory(gamePath);
      gamePathInfo.textContent = 'Updated successfully';
      gamePathInfo.classList.add('text-white', 'bg-green-800', 'p-1', 'rounded');
    } else {
      gamePathInfo.textContent = 'Failed to update';
      gamePathInfo.classList.add('text-white', 'bg-red-800', 'p-1', 'rounded');
      console.error('saveGameDirectory API not available');
    }
  } catch (error) {
    gamePathInfo.textContent = error;
    gamePathInfo.classList.add('text-white', 'bg-red-800', 'p-1', 'rounded');
    console.error('Error saving game directory:', error);
  }
}

function saveAllSettings() {
  saveApiKey();
  saveGameDirectory();
  closeModal();
}

// Make functions available globally
window.saveApiKey = saveApiKey;
window.saveGameDirectory = saveGameDirectory;
window.saveAllSettings = saveAllSettings;
window.openModal = openModal;
window.closeModal = closeModal;
window.openUpdateModal = openUpdateModal;

// Event listeners
window.electronAPI.onKillEvent((data) => {
    const container = document.getElementById('events');
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `
      <div class="flex space-x-2 text-sm p-1 bg-red-900/30 bg-black rounded">
        <p class="">${new Date(data.timestamp).toLocaleString().replace(/,/g, '')} </p> 
        <p class=""><span class="killer">${data.killerName}</span> killed <span class="victim">${data.victimName}</span> with <span class="weapon">${data.weaponName}</span> (type: ${data.damageType})</p>
      </div>
    `;
    container.prepend(div);
});
    
window.electronAPI.onIncapEvent((data) => {
  const container = document.getElementById('events');
  const div = document.createElement('div');
  div.className = 'event';
  div.innerHTML = `
    <div class="flex space-x-2 text-sm p-1 bg-green-900/30 bg-black rounded">
      <p class="">${new Date(data.timestamp).toLocaleString().replace(/,/g, '')}</p> 
      <p class=""><span class="victim">${data.victimName}</span> was incapacitated near you.</p>
    </div>
  `;
  container.prepend(div);
});



// Handle update available event
document.addEventListener('DOMContentLoaded', () => {
  if (window.electronAPI?.onUpdateAvailable) {
    window.electronAPI.onUpdateAvailable(() => {
      openUpdateModal();
    });
  }
  if (window.electronAPI?.onUpdateDownloaded)
    {
      window.electronAPI.onUpdateDownloaded(() => {
        const updateModalImage = document.getElementById('updateModalImage');
        const updateModalButton = document.getElementById('updateModalButton');
        updateModalButton.disabled = false;
        updateModalImage.classList.remove('grayscale');
      });
    }
});

