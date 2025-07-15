import pgClient from '../../pg/setup.js';
import apiClient from '../api.js';
import { getOverlayWindow } from '../chat/overlay.js';

export const joinCommand = (msg, authProvider) => {
	const userId = msg.userInfo.userId;
	const subscribed = msg.userInfo.isSubscriber;

	const window = getOverlayWindow();

	apiClient(authProvider)
		.users.getUserById(userId)
		.then(user => {
			if (!user) {
				console.error(`User with ID ${userId} not found.`);
				return;
			}
			console.log(
				`User ${user.displayName} has joined the channel with ${user.profilePictureUrl}`,
			);

			const randomX = Math.random() * 8 - 4; // Between -4 and 4
			const randomY = 10 + Math.random() * 10; // Between 10 and 20
			const randomRadius = 0.2; // Between 0.5 and 1.5
			const randomMass = Math.random(); // Between 1 and 10
			const randomDamping = 0.3 + Math.random() * 0.4; // Between 0.3 and 0.7

			const newMarbleConfig = {
				id: `marble-${user.id}`, // Unique ID for the marble
				radius: randomRadius,
				mass: randomMass,
				initialPosition: { x: randomX, y: randomY, z: 0 },
				linearDamping: randomDamping,
				textureUrl: user.profilePictureUrl,
			};

			window.webContents.send('add-marble', newMarbleConfig);
		});

	pgClient
		.query(
			'INSERT INTO viewers ("userId", username, "isSubscribed") VALUES ($1, $2, $3) ON CONFLICT ("userId") DO UPDATE SET username = $2, "isSubscribed" = $3',
			[userId, msg.userInfo.displayName, subscribed ? '1' : '0'],
		)
		.catch(err => {
			console.error('Error inserting into viewers:', err);
		});

	// console.log(`User ${msg.userInfo.displayName} has joined.`);
};
