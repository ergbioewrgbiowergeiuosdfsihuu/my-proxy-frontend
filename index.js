const express = require('express');
const { createServer } = require('http');
const { Server } = require('@tomphttp/bare-server-node');
const { join } = require('path');
const { uvPath } = require('@titaniumnetwork-dev/ultraviolet');

// Initialize the Bare proxy server
const bare = new Server('/bare/', '');
const app = express();

// Serve the official Ultraviolet core scripts
app.use('/uv/', express.static(uvPath));

// Serve your custom frontend HTML/JS (we will put this in a "public" folder)
app.use(express.static('public'));

const server = createServer();

// Route the traffic: proxy stuff goes to Bare, normal visits go to your HTML
server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
        bare.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
        bare.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`[+] Ultraviolet Engine running on port ${PORT}`);
});
