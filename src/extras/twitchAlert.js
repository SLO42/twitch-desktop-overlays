import { BrowserWindow } from 'electron';

export const createTwitchAlertWindow = () => {
	const win = new BrowserWindow({
		transparent: true,
		frame: false,
		width: 800,
		height: 600,
		x: 1703,
		y: -24,
		titleBarStyle: 'hidden',
		// titleBarOverlay: false,
		resizable: false,
		titleBarOverlay: false,
		focusable: false,
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	win.loadURL(
		'https://dashboard.twitch.tv/widgets/alertbox#eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGVydF9zZXRfaWQiOiI1YmYxY2M0ZS0zODYwLTRhNjEtYTAzZS1iMWEzNzYyMjZhMGEiLCJ1c2VyX2lkIjoiMjg4NTAxOTEifQ.-U93IHtd4fcpwP2IXOEsSW43bDbkpTyR0NOyNYt6a1U',
	);

	win.setIgnoreMouseEvents(true, { forward: true });
	win.setAlwaysOnTop(true, 'screen-saver', 1);
};
