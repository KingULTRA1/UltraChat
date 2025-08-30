// /backend/config.js

module.exports = {
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
    },

    qrLogin: {
        tokenExpiryMinutes: 5, // token validity in minutes
    },

    plugins: {
        discord: {
            token: process.env.DISCORD_TOKEN || 'your-discord-bot-token',
            clientId: process.env.DISCORD_CLIENT_ID || 'your-client-id',
            guildId: process.env.DISCORD_GUILD_ID || 'your-guild-id'
        },
        telegram: {
            token: process.env.TELEGRAM_TOKEN || 'your-telegram-bot-token',
            chatId: process.env.TELEGRAM_CHAT_ID || 'your-chat-id'
        }
    }
};
