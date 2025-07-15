import { BrowserWindow, screen, ipcMain } from 'electron';
import path from 'path';

const TITLE_BAR_HEIGHT = 30; // pixels

let win;

export const createCustomChatOverlayWindow = () => {
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.bounds;

	win = new BrowserWindow({
		transparent: true,
		frame: false,
		width: width,
		height: height + TITLE_BAR_HEIGHT,
		y: -TITLE_BAR_HEIGHT,
		x: 0,
		titleBarStyle: 'hidden',
		titleBarOverlay: false,
		focusable: false,
		alwaysOnTop: true,
		webPreferences: {
			preload: path.join(process.cwd(), 'src/preload.js'),
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	win.loadFile('src/twitch/chat/overlay.html');

	win.setIgnoreMouseEvents(true, { forward: true });
	win.setAlwaysOnTop(true, 'screen-saver', 1);

	// win.simpleFullScreen = true; // Enable simple fullscreen mode
	win.setFullScreen(true);

	win.on('closed', () => {
		win = null; // Clear the reference when the window is closed
	});
};

export const handleMarbleIPC = () => {
	ipcMain.on('spawn-marble', (event, marbleConfig) => {
		console.log(
			'[main.js] Received "spawn-marble" IPC event from chat window:',
			marbleConfig.id,
		);
		if (win && win.webContents) {
			// Forward the marble config to the overlay window's renderer process
			win.webContents.send('add-marble', marbleConfig);
			console.log(
				'Marble spawn request forwarded to overlay window:',
				marbleConfig,
			);
		} else {
			console.warn('Overlay window not active, cannot spawn marble.');
		}
	});
};

export const getOverlayWindow = () => {
	if (!win) {
		console.error('Overlay window is not created yet.');
		return null;
	}
	return win;
};
