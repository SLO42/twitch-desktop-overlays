const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	twitchLogin: () => ipcRenderer.invoke('twitch-login'),
	getAuthStatus: () => ipcRenderer.invoke('get-auth-status'),
	onAuthStatus: callback =>
		ipcRenderer.on('auth-status', (_event, value) => callback(value)),

	spawnMarble: config => ipcRenderer.send('spawn-marble', config),

	// NEW: Function for the overlay window to listen for marble spawn requests
	onAddMarble: callback =>
		ipcRenderer.on('add-marble', (event, config) => callback(config)),
});
