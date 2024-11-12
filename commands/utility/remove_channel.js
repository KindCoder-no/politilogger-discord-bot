const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove-channel')
		.setDescription('Remove a notification channel')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('The channel the reports is sendt to')
                .setRequired(true)
            ),
		
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel');
		// Check if the user has the required permissions
		const member = interaction.guild.members.cache.get(interaction.user.id);
		if (!member.permissions.has('ADMINISTRATOR')) {
			return interaction.reply('You do not have the required permissions to use this command.');
		}
		//console.log(member.permissions.toArray())
		// Check if the channel is a text channel
		const channelType = channel.type;
		//console.log(channel)
		if (channelType !== 0) {
			return interaction.reply('The channel must be a text channel.');
		}
		const database_file = JSON.parse(fs.readFileSync('database.json', 'utf8'))

		// Check if the channel is in the same guild as the interaction
		if (channel.guildId !== interaction.guildId) {
			return interaction.reply('The channel must be in the same guild as the interaction.');
		}
		// Check if the channel is not already in the database
		const channelExists = database_file.find(row => row.channel === channel.id);
		if (!channelExists) {
			return interaction.reply('The channel does not exist in database.');
		}
		// Remove the channel from the database
        const index = database_file.findIndex(row => row.channel === channel.id);
        database_file.splice(index, 1);

        // Save the database
        fs.writeFileSync('database.json', JSON.stringify(database_file, null, 2));

		// Delete all recheck entries for the channel
		const recheck_database_file = JSON.parse(fs.readFileSync('recheck_database.json', 'utf8'));

		const recheck_entries = recheck_database_file.filter(row => row.channel === channel.id);
		for (const entry of recheck_entries) {
			const index = recheck_database_file.indexOf(entry);
			recheck_database_file.splice(index, 1);
		}

		// Save the recheck database
		fs.writeFileSync('recheck_database.json', JSON.stringify(recheck_database_file, null, 2));




		//console.log(channel)
		await interaction.reply(`Removing channel ${channel}`);

		

		//await interaction.guild.members.ban(target);
		//await interaction.reply('Pong!');
	},
};