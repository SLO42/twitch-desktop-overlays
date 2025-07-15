import { BrowserWindow, screen } from 'electron';
import path from 'path';

const TITLE_BAR_HEIGHT = 30; // pixels

export const createEmoteWallWindow = () => {
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.bounds;

	const win = new BrowserWindow({
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

	win.loadFile('./EmoteWall.html');

	win.setIgnoreMouseEvents(true, { forward: true });
	win.setAlwaysOnTop(true, 'screen-saver', 1);

	win.on('closed', () => {
		win = null; // Clear the reference when the window is closed
	});
};
