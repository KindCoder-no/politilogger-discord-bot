const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const fetchById = require('./fetchById');
const moment = require('moment');
require('moment/locale/nb');

async function runMessageRecheck(client) {
    console.log("Running message recheck")
    const database_file = JSON.parse(fs.readFileSync('recheck_database.json', 'utf8'));

    for (const check of database_file) {
        const getObject = await fetchById(check.call_id);

        //console.log(getObject);

        const messages = getObject.messages;

        if(check.last_message != messages[messages.length - 1].id){
            console.log("New message!")

            const currentLastMessageId = Number(check.last_message.split('-')[1])
            //console.log(currentLastMessageId)

            const newMessageData = messages[currentLastMessageId + 1]

            let text;
            if(getObject.area == ''){
                text = getObject.category + ": " + getObject.municipality
            }else {
                text = getObject.category + ": " + getObject.municipality + ', ' + getObject.area
            }


            const exampleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(text)
                .setDescription(moment(newMessageData.createdOn).format("LT") + " - " + newMessageData.text)

            // reply to the old message
            const oldMessage = await client.channels.cache.get(check.channel).messages.fetch(check.message_id);
            const newMessage = oldMessage.reply({ embeds: [exampleEmbed] });

            if(newMessageData.isActive){
                // Update the database
                check.last_message = newMessageData.id;
                check.message_id = newMessage.id;

                fs.writeFileSync('recheck_database.json', JSON.stringify(database_file, null, 2));
            }else {
                // Remove the entry from the database
                const index = database_file.indexOf(check);
                if (index > -1) {
                    database_file.splice(index, 1);
                }
                fs.writeFileSync('recheck_database.json', JSON.stringify(database_file, null, 2));
            }




            //const newMessage

        }else if(getObject.isActive == false){
                console.log("Call is not active")

                // Remove the entry from the database
                const index = database_file.indexOf(check);
                if (index > -1) {
                    database_file.splice(index, 1);
                }
                fs.writeFileSync('recheck_database.json', JSON.stringify(database_file, null, 2));

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