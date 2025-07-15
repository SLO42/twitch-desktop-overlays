import { joinCommand } from '../commands/join.js';

// https://twurple.js.org/reference/chat/classes/ChatUser.html
// https://twurple.js.org/reference/chat/classes/ChatMessage.html

export const handleChatMessage = (
	channel,
	user,
	message,
	msg,
	authProvider,
) => {
	if (message[0] === '!') {
		switch (message.split(' ')[0].substring(1)) {
			case 'join':
				joinCommand(msg, authProvider);
				break;
			// add more commands here
			default:
				console.log(`Unknown command: ${message}`);
		}
		// handle commands
	}
};
