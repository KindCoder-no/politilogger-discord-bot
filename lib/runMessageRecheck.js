const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const fetchById = require('./fetchById');
const moment = require('moment');
require('moment/locale/nb');
const Rechecks = require('../models/rechecks');

async function runMessageRecheck(client) {
    const database_file = await Rechecks.find({});

    for (const check of database_file) {
        const getObject = await fetchById(check.call_id);

        const messages = getObject.messages;

        if (check.last_message != messages[messages.length - 1].id) {
            console.log("New message!")

            const currentLastMessageId = Number(check.last_message.split('-')[1])

            const newMessageData = messages[currentLastMessageId + 1]

            let text;
            if (getObject.area == '') {
                text = getObject.category + ": " + getObject.municipality
            } else {
                text = getObject.category + ": " + getObject.municipality + ', ' + getObject.area
            }


            const exampleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(text)
                .setURL('https://www.politiet.no/politiloggen/hendelse/#/' + getObject.id)
                .setDescription(moment(newMessageData.createdOn).format("LT") + " - " + newMessageData.text)
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Doner', value: 'Jeg setter stor pris på donasjoner: https://buymeacoffee.com/kindcoder' },
                )
                .setFooter({ text: 'Laget av KindCoder' })
                .setTimestamp();

            // reply to the old message
            const oldMessage = await client.channels.cache.get(check.channel).messages.fetch(check.message_id);
            const newMessage = oldMessage.reply({ embeds: [exampleEmbed] });

            if (getObject.isActive) {
                // Update the database
                const get_recheck = await Rechecks.findById(check._id);

                get_recheck.last_message = newMessageData.id;
                get_recheck.message_id = newMessage.id;

                await get_recheck.save();
            } else {
                // Remove the entry from the database
                const deleteMessage = await client.channels.cache.get(check.channel).messages.fetch(check.message_id);
                const exampleEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle("Hendelse avsluttet")
                    .setDescription("Hendelsen er avsluttet og vil ikke lenger bli oppdatert.")
                deleteMessage.reply({ embeds: [exampleEmbed] });
                await Rechecks.findByIdAndDelete(check._id);
            }




            //const newMessage

        } else if (getObject.isActive == false) {
            console.log("Call is not active")

            // Remove the entry from the database
            /*const index = database_file.indexOf(check);
            if (index > -1) {
                database_file.splice(index, 1);
            }
            fs.writeFileSync('recheck_database.json', JSON.stringify(database_file, null, 2));*/
            await Rechecks.findByIdAndDelete(check._id);

            // reply to the old message with a message that the call is not active
            const oldMessage = await client.channels.cache.get(check.channel).messages.fetch(check.message_id);
            const exampleEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Hendelse avsluttet")
                .setDescription("Hendelsen er avsluttet og vil ikke lenger bli oppdatert.")
            oldMessage.reply({ embeds: [exampleEmbed] });



        }
    }
}

module.exports = runMessageRecheck;