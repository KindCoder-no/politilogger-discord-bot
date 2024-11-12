

const fs = require('node:fs');
const path = require('node:path');
const mongoose = require("mongoose");

const { REST, Routes, Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB
mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost:27017/politilogger-discord-bot");
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to MongoDB"));

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// check if database.json exists
if (!fs.existsSync('database.json')) {
	fs.writeFileSync('database.json', JSON.stringify([]));
}
// check if recheck_database.json exists
if (!fs.existsSync('recheck_database.json')) {
	fs.writeFileSync('recheck_database.json', JSON.stringify([]));
}


client.commands = new Collection();
const commands = [];

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}




client.login(process.env.DISCORD_TOKEN);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
               
		// The put method is used to fully refresh all commands in the guild with the current set (USE IN DEV)
        const data = await await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );
		

		// This function is for registering global commands (USE IN PRODUCTION)
		/*const data = await await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );*/

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();