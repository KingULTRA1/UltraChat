// /backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const PluginManager = require('./pluginManager');
const qrLogin = require('./qrLogin');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const pluginManager = new PluginManager();
pluginManager.initAll();

// Example route for sending messages
app.post('/send', (req, res) => {
    const { to, message } = req.body;
    pluginManager.sendMessage(to, message)
        .then(() => res.status(200).send({ success: true }))
        .catch(err => res.status(500).send({ error: err.message }));
});

// Example route for QR login
app.get('/qr-login', (req, res) => {
    const qrData = qrLogin.generateQR();
    res.send({ qr: qrData });
});

// Incoming message handler
pluginManager.onMessage((from, message) => {
    console.log(`Message from ${from}: ${message}`);
});

app.listen(port, () => console.log(`UltraChat server running on port ${port}`));
