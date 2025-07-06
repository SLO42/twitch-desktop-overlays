console.log('Hello from Electron 👋');

const { app, BrowserWindow } = require('electron');
const fs = require('fs');

// get css data for injecting into chat window
let cssData = '';
try {
	cssData = fs.readFileSync('./styles.css', 'utf8');
} catch (err) {
	console.error('Error reading file:', err);
}

const createChatWindow = () => {
	const win = new BrowserWindow({
		transparent: true,
		frame: false,
		width: 800,
		height: 1000,
		x: 0,
		y: -23,
		titleBarStyle: 'hidden',
		titleBarOverlay: false,
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
	win.setAlwaysOnTop(true, 'screen-saver');
};

const createTwitchAlertWindow = () => {
	const win = new BrowserWindow({
		transparent: true,
		frame: false,
		width: 800,
		height: 600,
		x: 1703,
		y: -100,
		titleBarStyle: 'hidden',
		titleBarOverlay: false,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	win.loadURL(
		'https://dashboard.twitch.tv/widgets/alertbox#eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGVydF9zZXRfaWQiOiI1YmYxY2M0ZS0zODYwLTRhNjEtYTAzZS1iMWEzNzYyMjZhMGEiLCJ1c2VyX2lkIjoiMjg4NTAxOTEifQ.-U93IHtd4fcpwP2IXOEsSW43bDbkpTyR0NOyNYt6a1U',
	);

	win.setIgnoreMouseEvents(true, { forward: true });
	win.setAlwaysOnTop(true, 'screen-saver');
};

const createEmoteWallWindow = () => {
	const win = new BrowserWindow({
		transparent: true,
		frame: false,
		width: 2560,
		height: 1110,
		y: -25,
		x: 0,
		titleBarStyle: 'hidden',
		titleBarOverlay: false,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	win.loadFile('./EmoteWall.html');

	win.setIgnoreMouseEvents(true, { forward: true });
	win.setAlwaysOnTop(true, 'screen-saver');
};

app.whenReady().then(() => {
	createChatWindow();
	createTwitchAlertWindow();
	createEmoteWallWindow();
});
