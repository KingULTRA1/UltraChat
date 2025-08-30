// /backend/pluginManager.js
const DiscordPlugin = require('./plugins/discordPlugin');
const TelegramPlugin = require('./plugins/telegramPlugin');

class PluginManager {
    constructor() {
        this.plugins = [];
        this.messageCallback = null;
    }

    // Initialize all available plugins
    initAll() {
        if (process.env.DISCORD_TOKEN) this.plugins.push(new DiscordPlugin(process.env.DISCORD_TOKEN));
        if (process.env.TELEGRAM_TOKEN) this.plugins.push(new TelegramPlugin(process.env.TELEGRAM_TOKEN));

        // Listen for incoming messages from all plugins
        this.plugins.forEach(plugin =>
            plugin.receiveMessage((from, message) => {
                if (this.messageCallback) this.messageCallback(from, message);
            })
        );
    }

    // Send a message through all plugins or a specific plugin
    sendMessage(to, message) {
        return Promise.all(this.plugins.map(p => p.sendMessage(to, message)));
    }

    // Set callback for incoming messages
    onMessage(callback) {
        this.messageCallback = callback;
    }

    // Disconnect all plugins
    disconnectAll() {
        this.plugins.forEach(p => p.disconnect());
    }
}

module.exports = PluginManager;
