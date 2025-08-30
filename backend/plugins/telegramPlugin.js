// /backend/plugins/telegramPlugin.js
const TelegramBot = require('node-telegram-bot-api');

class TelegramPlugin {
    constructor(token) {
        // Polling mode for real-time messages
        this.bot = new TelegramBot(token, { polling: true });
    }

    // Send a message to a specific chat ID
    sendMessage(chatId, message) {
        return this.bot.sendMessage(chatId, message)
            .catch(err => console.error('Telegram sendMessage error:', err));
    }

    // Listen for incoming messages
    receiveMessage(callback) {
        this.bot.on('message', msg => {
            if (msg.text) {
                callback(msg.chat.id, msg.text);
            }
        });
    }

    // Stop the bot cleanly
    disconnect() {
        this.bot.stopPolling();
    }
}

module.exports = TelegramPlugin;
