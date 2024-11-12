const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const Channels = require('../../models/channels');
const Rechecks = require('../../models/rechecks');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove-channel')
		.setDescription('Fjern varsler for en kanal')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Kanelen du vil fjerne varsler for')
				.setRequired(true)
		),

	async execute(interaction) {
		const channel = interaction.options.getChannel('channel');
		// Check if the user has the required permissions
		const member = interaction.guild.members.cache.get(interaction.user.id);
		if (!member.permissions.has('ADMINISTRATOR')) {
			return interaction.reply('Du har ikke administrator tilgang til å bruke denne kommandoen.');
		}

		// Check if the channel is a text channel
		const channelType = channel.type;
		//console.log(channel)
		if (channelType !== 0) {
			return interaction.reply('Kanalen må være en tekst kanal.');
		}
		const database = await Channels.findOne({ guild_id: interaction.guildId });

		// Check if the channel is in the same guild as the interaction
		if (channel.guildId !== interaction.guildId) {
			return interaction.reply('Kanalen må være i samme guild som interaksjonen.');
		}
		// Check if the channel is not already in the database
		if (!database) {
			return interaction.reply('Kanalen eksisterer ikke i databasen.');
		}
		// Remove the channel from the database
		await Channels.findByIdAndDelete(database._id);

		// Delete all recheck entries for the channel
		const recheck_database_file = await Rechecks.find({
			channel: channel.id
		});

		for (const entry of recheck_database_file) {
			await Rechecks.findByIdAndDelete(entry._id);
		}

		await interaction.reply(`Fjernet notifikasjoner for kanalen ${channel}`);

	},
};