const express = require('express');
const config = require('../config')
const http = require('http');
const chokidar = require('chokidar');
const Bundler = require('./bundler');
const WebSocket = require("ws");
const open = require('opn');

const port = config.server.port;
const host = config.server.host;
const address = `http://${host}:${port}`;
const app = express();
app.use('/static', express.static(config.out));

app.get('/', (req, res) => {
    res.sendFile(`${config.out}/index.html`)
})
 
const server = http.createServer(app);

const webSocketServer = new WebSocket.Server({ server });
const bundler = new Bundler();

bundler.writeJsBundle();
bundler.writeHtml();

open(address, {
    app: null
});

webSocketServer.on('connection', ws => {
    ws.on('message', m => {
        webSocketServer.clients.forEach(client => client.send(m));
    });

    ws.on("error", e => ws.send(e));
    const watcher = chokidar.watch(config.sourceDirectory, {
        ignoreInitial: true,
        disableGlobbing: false,
    });

    watcher.on('change', (path) => {
        const ext = path.split('.').pop();
        if (ext === 'js') {
            bundler.writeJsBundle();
            ws.send('update');
        }
        if (ext === 'html') {
            bundler.writeHtml();
            ws.send('update');
        }
    })
});

app.listen(port);
server.listen(8999, () => console.log("Server started! Waiting for changes..."))