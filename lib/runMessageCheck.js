const fetchLatestUpdate = require("./fetchLatestUpdate");
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
require('moment/locale/nb');


async function runMessageCheck(client) {
    console.log("Running message check")
    // Get data from the database
    const database_file = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    // Go through each channel in the database
    for (const channel of database_file) {
        // Get the channel object
        const channelObject = client.channels.cache.get(channel.channel);
        // Get the latest updates
        const latest_calls = await fetchLatestUpdate(channel.police_department, channel.categories);

        if (latest_calls.messageThreads.length > 0) {
            
        
        //console.log(latest_calls)

        const lastCall = latest_calls.messageThreads[0]

        //console.log(lastCall)

        if (channel.last_message != lastCall.id) {
            // create a embed message
            let text;
            if(lastCall.area == ''){
                text = lastCall.category + ": " + lastCall.municipality
            }else {
                text = lastCall.category + ": " + lastCall.municipality + ', ' + lastCall.area
            }


            const exampleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(text)
                .setDescription(moment(lastCall.messages[0].createdOn).format("LT") + " - " + lastCall.messages[0].text)

            // Send the message to the channel
            const newMessage = await channelObject.send({ embeds: [exampleEmbed] });

            //console.log(newMessage)


            // Update the database
            channel.last_message = lastCall.id;
            fs.writeFileSync('database.json', JSON.stringify(database_file, null, 2));

            
            if(lastCall.isActive){
                // Add the channel and category to recheck database
                const recheck_database_file = JSON.parse(fs.readFileSync('recheck_database.json', 'utf8'));

                recheck_database_file.push({ 
                    guild_id: channelObject.guildId, 
                    channel: channelObject.id, 
                    message_id: newMessage.id,
                    police_department: channel.police_department, 
                    categories: [], 
                    call_id: lastCall.id, 
                    last_message: lastCall.messages[0].id 
                });
                // Save the database
                fs.writeFileSync('recheck_database.json', JSON.stringify(recheck_database_file, null, 2));
            }else {
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


        // Go through each latest call
    }

}

module.exports = runMessageCheck;