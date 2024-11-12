const { SlashCommandBuilder, PermissionsBitField, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const fs = require('fs');
const Channels = require('../../models/channels');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-channel')
		.setDescription('Legg til en kanal for varsler')
		.addStringOption(option =>
			option.setName('police_department')
				.setDescription('Velg politidistrikt')
				.setRequired(true)
				.addChoices(
					{ name: 'All', value: 'all' },
					{ name: 'Oslo politidistrikt', value: 'Oslo politidistrikt' },
					{ name: 'Øst politidistrikt', value: 'Øst politidistrikt' },
					{ name: 'Innlandet politidistrikt', value: 'Innlandet politidistrikt' },
					{ name: 'Sør-Øst politidistrikt', value: 'Sør-Øst politidistrikt' },
					{ name: 'Agder politidistrikt', value: 'Agder politidistrikt' },
					{ name: 'Sør-Vest politidistrikt', value: 'Sør-Vest politidistrikt' },
					{ name: 'Vest politidistrikt', value: 'Vest politidistrikt' },
					{ name: 'Møre og Romsdal politidistrikt', value: 'Møre og Romsdal politidistrikt' },
					{ name: 'Trøndelag politidistrikt', value: 'Trøndelag politidistrikt' },
					{ name: 'Nordland politidistrikt', value: 'Nordland politidistrikt' },
					{ name: 'Troms politidistrikt', value: 'Troms politidistrikt' },
					{ name: 'Finnmark politidistrikt', value: 'Finnmark politidistrikt' }
				))
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Velg kanal for varsler')
				.setRequired(true)
		),

	async execute(interaction) {
		const policeDepartment = interaction.options.getString('police_department');
		const channel = interaction.options.getChannel('channel');
		const member = interaction.guild.members.cache.get(interaction.user.id);

		if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.reply('Du har ikke administrator tilgang til å bruke denne kommandoen.');
		}

		if (channel.type !== 0) {
			return interaction.reply('Kanalen må være en tekst kanal.');
		}

		//const database = JSON.parse(fs.readFileSync('database.json', 'utf8'));
		const database = await Channels.findOne({ channel: channel.id });

		if (channel.guildId !== interaction.guildId) {
			return interaction.reply('Kanalen må være i samme guild som interaksjonen.');
		}

		if (database) {
			return interaction.reply('Kanalen eksisterer allerede i databasen.');
		}

		if (!channel.permissionsFor(interaction.client.user).has(PermissionsBitField.Flags.ViewChannel)) {
			return interaction.reply('Boten har ikke skrive tilgang til kanalen.');
		}

		const choices = [
			{ label: 'Alle', value: 'all_categories' },
			{ label: '⛺️ Arrangement', value: 'Arrangement' },
			{ label: '🚒 Brann', value: 'Brann' },
			{ label: '🐕 Dyr', value: 'Dyr' },
			{ label: '🏠 Innbrudd', value: 'Innbrudd' },
			{ label: '💥 Ro og orden', value: 'Ro og orden' },
			{ label: '🛟 Redning', value: 'Redning' },
			{ label: '😶‍🌫️ Savnet', value: 'Savnet' },
			{ label: '🌊 Sjø', value: 'Sjø' },
			{ label: '💥 Skadeverk', value: 'Skadeverk' },
			{ label: '💥 Tyveri', value: 'Tyveri' },
			{ label: '🚗 Ulykke', value: 'Ulykke' },
			{ label: '💥 Voldshendelse', value: 'Voldshendelse' },
			{ label: '⛅️ Vær', value: 'Vær' },
			{ label: '🤔 Andre hendelser', value: 'Andre hendelser' }
		];

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(interaction.id)
			.setPlaceholder('Velg kategorier')
			.setMinValues(1)
			.setMaxValues(choices.length)
			.addOptions(choices.map(choice => new StringSelectMenuOptionBuilder().setLabel(choice.label).setValue(choice.value)));

		const actionRow = new ActionRowBuilder().addComponents(selectMenu);

		const reply = await interaction.reply({
			content: 'Velg kategorier',
			components: [actionRow]
		});

		const collector = reply.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			filter: i => i.user.id === interaction.user.id && i.customId === interaction.id,
			time: 60000
		});

		collector.on('collect', async i => {
			if (!i.values.length) {
				return i.reply('Du må velge minst en kategori');
			}


			let send_categories = [];

			if (!i.values.includes('all_categories')) {
				send_categories = i.values;
			}

			const newChannel = new Channels({
				guild_id: channel.guildId,
				channel: channel.id,
				police_department: policeDepartment,
				categories: send_categories,
				last_message: null
			});

			await newChannel.save();

			i.update({ content: `Notifikasjoner fra ${policeDepartment} satt opp for kanalen ${channel} med kategoriene: ${i.values.join(", ")}`, components: [] });

		});
	}
};
