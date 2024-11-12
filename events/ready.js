const { Events } = require('discord.js');
const fetchLatestUpdate = require('../lib/fetchLatestUpdate');
const runMessageCheck = require('../lib/runMessageCheck');
const runMessageRecheck = require('../lib/runMessageRecheck');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		async function sendUpdates (){
			const channel = client.channels.cache.get('1305654947756380280');
			channel.send('Test');
			const latest_calls = await fetchLatestUpdate('all', ['Kriminalitet', 'Trafikk', 'Brann', 'Hendelser', 'Annet'])

			console.log(latest_calls);
		}
		
		//sendUpdates();

		setInterval(() => {
			runMessageCheck(client);

			runMessageRecheck(client);
		}, 10 * 1000);

		
	},
};