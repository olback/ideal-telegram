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

    socket.on('login', data => {
        // console.log('clients: ' + JSON.stringify(clients));
        clients[data] = {
            socket: socket.id
        };

        let o = [];

        for(let c in clients) {
            o.push(c);
        }

        io.sockets.connected[clients[data].socket].emit('online', o);

    });

    socket.on('message', data => {
        // console.log('Sending: ' + data.message + ' to ' + data.to);
        if (clients[data.to]) {
            io.sockets.connected[clients[data.to].socket].emit('message', data);
        } else {
            io.sockets.connected[clients[data.from].socket].emit('err', {
                msg: `User ${data.to} is not online`
            });
        }
    });

    socket.on('disconnect', () => {
        for (let name in clients) {
            if (clients[name].socket === socket.id) {
                console.log(name + ' disconnected');
                delete clients[name];
                break;
            }
        }
    });


    // socket.on('typing', name => {
    //     socket.broadcast.emit('typing', name);
    // });

})
