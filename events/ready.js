const { Events, ActivityType } = require('discord.js');
const fetchLatestUpdate = require('../lib/fetchLatestUpdate');
const runMessageCheck = require('../lib/runMessageCheck');
const runMessageRecheck = require('../lib/runMessageRecheck');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		console.log("Starting checks for new messages");
		client.user.setActivity('politiet.no', { type: ActivityType.Watching });

		// Check for new messages every 10
		setInterval(() => {
			console.log("Checking for new messages and updates");
			runMessageCheck(client);

			runMessageRecheck(client);
		}, 10 * 1000);


	},
};