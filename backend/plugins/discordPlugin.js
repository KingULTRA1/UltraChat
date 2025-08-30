// /backend/plugins/discordPlugin.js
const { Client, GatewayIntentBits } = require('discord.js');

class DiscordPlugin {
    constructor(token) {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        this.client.login(token);
    }

    // Send a message to a specific channel ID
    sendMessage(channelId, message) {
        return this.client.channels.fetch(channelId)
            .then(channel => channel.send(message))
            .catch(err => console.error('Discord sendMessage error:', err));
    }

    // Listen for incoming messages
    receiveMessage(callback) {
        this.client.on('messageCreate', msg => {
            if (!msg.author.bot) {
                callback(msg.author.id, msg.content);
            }
        });
    }

    // Cleanly disconnect the bot
    disconnect() {
        this.client.destroy();
    }
}

module.exports = DiscordPlugin;
