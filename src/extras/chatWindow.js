import { BrowserWindow } from 'electron';
import fs from 'fs';
// get css data for injecting into chat window
let cssData = '';
try {
	cssData = fs.readFileSync('./styles.css', 'utf8');
} catch (err) {
	console.error('Error reading file:', err);
}

export const createChatWindow = () => {
	const win = new BrowserWindow({
		transparent: true,
		frame: false,
		width: 800,
		height: 1000,
		x: 0,
		y: -23,
		titleBarStyle: 'hidden',
		titleBarOverlay: false,
		focusable: false,
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	win.loadURL(
		'https://chatis.is2511.com/v2/?channel=SaucyEnchiladas&animate=true&fade=25&size=1&font=2&stroke=1&emoteScale=2',
	);

	win.webContents.on('did-finish-load', () => {
		win.webContents.insertCSS(cssData);
	});

	win.setIgnoreMouseEvents(true, { forward: true });
	win.setAlwaysOnTop(true, 'screen-saver', 1);
};
