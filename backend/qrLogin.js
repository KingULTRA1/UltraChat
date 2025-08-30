// /backend/qrLogin.js
const crypto = require('crypto');

class QRLogin {
    constructor() {
        this.tokens = new Map(); // single-use tokens
    }

    // Generate a new QR login token
    generateToken(userId) {
        const token = crypto.randomBytes(16).toString('hex');
        this.tokens.set(token, { userId, created: Date.now() });
        return token;
    }

    // Verify and consume token
    verifyToken(token) {
        const data = this.tokens.get(token);
        if (!data) return null;
        this.tokens.delete(token); // single-use
        return data.userId;
    }

    // Clean up expired tokens (optional, e.g., older than 5 minutes)
    cleanup(expiry = 5 * 60 * 1000) {
        const now = Date.now();
        for (const [token, { created }] of this.tokens.entries()) {
            if (now - created > expiry) this.tokens.delete(token);
        }
    }
}

module.exports = new QRLogin();
