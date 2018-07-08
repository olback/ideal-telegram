/**
 *  © olback 2018
 */

const express = require('express');
const socket = require('socket.io');
const env = require('process').env;
const path = require('path');

let app = express();
let server = app.listen(env.PORT || 5000, () => {
    console.log(`Listening on ${env.PORT || 5000}`);
});

// Static files
app.use(express.static('client'));
app.get('/js/openpgp.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/openpgp/dist/openpgp.min.js'));
});

// Socket setup
let io = socket(server);

let clients = {};

io.on('connection', socket => {

    console.log('Connected', socket.id);

    socket.on('login', function (data) {
        clients[data.username] = {
            "socket": socket.id
        };
    });

    socket.on('chat', data => {
        console.log(data);
        io.sockets.emit('chat', data);
    });


    socket.on('typing', name => {
        socket.broadcast.emit('typing', name);
    })

})
