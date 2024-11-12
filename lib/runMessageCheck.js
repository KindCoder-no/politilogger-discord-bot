const fetchLatestUpdate = require("./fetchLatestUpdate");
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const Channels = require('../models/channels');
const Rechecks = require('../models/rechecks');
const moment = require('moment');
require('moment/locale/nb');


async function runMessageCheck(client) {
    // Get data from the database
    const channels = await Channels.find({});



    // Go through each channel in the database
    for (const channel of channels) {
        // Get the channel object
        const channelObject = client.channels.cache.get(channel.channel);
        // Get the latest updates
        const latest_calls = await fetchLatestUpdate(channel.police_department, channel.categories);

        if (latest_calls.messageThreads.length > 0) {


            const lastCall = latest_calls.messageThreads[0]

            //console.log(lastCall)

            if (channel.last_message != lastCall.id) {
                // create a embed message
                let text;
                if (lastCall.area == '') {
                    text = lastCall.category + ": " + lastCall.municipality
                } else {
                    text = lastCall.category + ": " + lastCall.municipality + ', ' + lastCall.area
                }


                const exampleEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(text)
                    .setURL('https://www.politiet.no/politiloggen/hendelse/#/' + lastCall.id)
                    .setDescription(moment(lastCall.messages[0].createdOn).format("LT") + " - " + lastCall.messages[0].text)
                    .addFields(
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Doner', value: 'Jeg setter stor pris på donasjoner: https://buymeacoffee.com/kindcoder' },
                    )
                    .setFooter({ text: 'Laget av KindCoder' })
                    .setTimestamp();

                // Send the message to the channel
                const newMessage = await channelObject.send({ embeds: [exampleEmbed] });

                // Update the database
                const get_channel = await Channels.findById(channel._id);
                get_channel.last_message = lastCall.id;

                await get_channel.save();


                if (lastCall.isActive) {
                    // Add the channel and category to recheck database
                    const newRecheck = new Rechecks({
                        guild_id: channelObject.guildId,
                        channel: channelObject.id,
                        message_id: newMessage.id,
                        police_department: channel.police_department,
                        categories: [],
                        call_id: lastCall.id,
                        last_message: lastCall.messages[0].id
                    });

                    await newRecheck.save();
                } else {
                    // Send a message reply to the channel that the call is no longer active

                    const originalMessage = await channelObject.messages.fetch(newMessage.id);
                    const exampleEmbed = new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle("Hendelse avsluttet")
                        .setDescription("Hendelsen er avsluttet og vil ikke lenger bli oppdatert.")
                    originalMessage.reply({ embeds: [exampleEmbed] });
                }
            }



        }

    }

}

module.exports = runMessageCheck;