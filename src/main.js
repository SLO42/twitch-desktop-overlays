import { app, BrowserWindow, ipcMain, shell, Menu } from 'electron';
import express from 'express';
import { RefreshingAuthProvider, exchangeCode } from '@twurple/auth';
import path from 'path';

import dotenv from 'dotenv';
dotenv.config({
	quiet: true,
	path: '.env',
});

import chatClient from './twitch/chatClient.js';
import { handleChatMessage } from './twitch/chat/handleChatMessage.js';
import { createChatWindow } from './extras/chatWindow.js';
import { createTwitchAlertWindow } from './extras/twitchAlert.js';
import { createEmoteWallWindow } from './extras/emoteWall.js';
import pgClient from './pg/setup.js';
import {
	createCustomChatOverlayWindow,
	handleMarbleIPC,
} from './twitch/chat/overlay.js';

console.log('Hello from Electron 👋', 'test');

const clientId = process.env.TWITCH_CLIENT_ID || 'YOUR_TWITCH_CLIENT_ID';
const clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
let mainWindow;
let authProvider;
let expressApp;
let authServer; // To hold the Express server instance
const port = 8080;

const scopes = [
	'user:read:email',
	'chat:read',
	'chat:edit',
	'moderator:read:chatters',
	'moderator:read:followers',
	'user:read:chat',
	'user:read:whispers',
	'user:manage:whispers',
	'whispers:read',
	// Add more scopes as needed for your application
];

const redirectUri = 'http://localhost:8080';

console.log(
	'Starting Electron app...',
	path.join(process.cwd(), 'src/preload.js'),
);

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(process.cwd(), 'src/preload.js'),
			nodeIntegration: false, // Keep false for security
			contextIsolation: true, // Keep true for security
		},
	});

	mainWindow.loadFile('src/index.html');

	// Open DevTools if needed
}

function startAuthServer() {
	return new Promise((resolve, reject) => {
		expressApp = express();

		expressApp.get('/', (req, res) => {
			const { code, scope, error, error_description } = req.query;

			if (error) {
				console.error('OAuth Error:', error_description || error);
				mainWindow.webContents.send('auth-status', {
					success: false,
					message: `Authentication failed: ${error_description || error}`,
				});
				res.send('Authentication failed. Please close this window.');
				stopAuthServer(); // Stop the server after handling the error
				return reject(new Error(error_description || error));
			}

			if (code) {
				console.log('Received authorization code:', code);
				// Exchange the code for tokens
				exchangeCode(clientId, clientSecret, code, redirectUri)
					.then(accessToken => {
						console.log('Successfully exchanged code for tokens!');
						mainWindow.webContents.send('auth-status', {
							success: true,
							message: 'Successfully authenticated with Twitch!',
						});

						pgClient
							.query(
								'INSERT INTO twitch_tokens (id, "accessToken", "refreshToken", "expiresIn", "obtainmentTimestamp") VALUES ( $1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET id = $1, "accessToken" = $2, "refreshToken" = $3, "expiresIn" = $4, "obtainmentTimestamp" = $5',
								[
									1,
									accessToken.accessToken,
									accessToken.refreshToken,
									accessToken.expiresIn,
									accessToken.obtainmentTimestamp,
								],
							)
							.catch(err => {
								console.error('Error saving token data to database:', err);
							});

						res.send('Authentication successful! You can close this window.');
					})
					.catch(err => {
						console.error('Error exchanging code:', err);
						mainWindow.webContents.send('auth-status', {
							success: false,
							message: `Failed to exchange code: ${err.message}`,
						});
						res.send('Error during token exchange. Please close this window.');
					})
					.finally(() => {
						stopAuthServer(); // Stop the server after successful exchange or error
					});
			} else {
				res.send('Waiting for Twitch authentication...');
			}
		});

		authServer = expressApp
			.listen(port, () => {
				console.log(`Auth server listening on ${redirectUri}`);
				resolve();
			})
			.on('error', err => {
				console.error(`Failed to start auth server on port ${port}:`, err);
				mainWindow.webContents.send('auth-status', {
					success: false,
					message: `Failed to start local server: ${err.message}`,
				});
				reject(err);
			});
	});
}

function stopAuthServer() {
	if (authServer) {
		authServer.close(() => {
			console.log('Auth server stopped.');
		});
		authServer = null;
	}
}

const appTest = authProvider => {
	chatClient.connect();

	chatClient.onMessage((channel, user, message, msg) =>
		handleChatMessage(channel, user, message, msg, authProvider),
	);
};

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
	stopAuthServer(); // Ensure server is stopped when app quits
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

Menu.setApplicationMenu(null);
app.whenReady().then(() => {
	authProvider = new RefreshingAuthProvider({
		clientId: clientId,
		clientSecret: clientSecret,
	});

	authProvider.onRefresh(async (userId, newTokenData) => {
		pgClient
			.query(
				'INSERT INTO twitch_tokens (id, "accessToken", "refreshToken", "expiresIn", "obtainmentTimestamp") VALUES ( $1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET "accessToken" = $2, "refreshToken" = $3, "expiresIn" = $4, "obtainmentTimestamp" = $5',
				[
					1,
					newTokenData.accessToken,
					newTokenData.refreshToken,
					newTokenData.expiresIn,
					newTokenData.obtainmentTimestamp,
				],
			)
			.catch(err => {
				console.error('Error saving token data to database:', err);
			});

		console.log(`Token refreshed for user ${userId}:`, newTokenData);
	});

	pgClient
		.query('SELECT * FROM twitch_tokens')
		.then(async result => {
			if (result.rows.length > 0) {
				const tokenData = result.rows[0];

				if (tokenData.refreshToken) {
					await authProvider.addUserForToken(tokenData);
				}
			} else {
				createWindow();

				ipcMain.handle('twitch-login', async () => {
					try {
						await startAuthServer(); // Start the server before opening the browser

						const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${
							process.env.TWITCH_CLIENT_ID
						}&redirect_uri=${encodeURIComponent(
							redirectUri,
						)}&response_type=code&scope=${scopes.join(' ')}`;

						console.log('Opening Twitch authorization URL:', authUrl);
						shell.openExternal(authUrl); // Open in default browser
						return {
							success: true,
							message: 'Opened Twitch login in your browser.',
						};
					} catch (error) {
						console.error('Error during login initiation:', error);
						return {
							success: false,
							message: `Failed to initiate login: ${error.message}`,
						};
					}
				});

				ipcMain.handle('get-auth-status', async () => {
					const isAuthenticated = authProvider.accessToken;
					const userName = isAuthenticated
						? (await authProvider.getCurrentUser()).displayName
						: null;
					return {
						isAuthenticated,
						userName,
						message: isAuthenticated
							? `Authenticated as ${userName}`
							: 'Not authenticated.',
					};
				});
			}
		})
		.catch(err => {
			console.error('Error fetching token data from database:', err);
		});

	// working
	createChatWindow();
	createTwitchAlertWindow();
	createEmoteWallWindow();

	// custom app window
	createCustomChatOverlayWindow();
	handleMarbleIPC();
	appTest(authProvider);
});
