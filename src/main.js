import { app, Menu } from 'electron';

import { createChatWindow } from './extras/chatWindow.js';
import { createTwitchAlertWindow } from './extras/twitchAlert.js';
import { createEmoteWallWindow } from './extras/emoteWall.js';

app.disableHardwareAcceleration();

console.log('Hello from Electron 👋', 'test');

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
	stopAuthServer(); // Ensure server is stopped when app quits
});

Menu.setApplicationMenu(null);
app.whenReady().then(() => {
	// working
	createChatWindow();
	createTwitchAlertWindow();
	createEmoteWallWindow();
});
