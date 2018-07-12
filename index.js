/**
 *  © olback 2018
 */

'use strict';

const express = require('express');
const socket = require('socket.io');
const env = require('process').env;

let app = express();
let server = app.listen(env.PORT || 5000, () => {
    console.log(`Listening on ${env.PORT || 5000}`);
});

// Static files
app.use(express.static('client'));
app.use(express.static('node_modules/openpgp/dist/'));

// Socket setup
let io = socket(server);

let clients = {};

io.on('connection', socket => {

    console.log('Connected:', socket.id);

    socket.on('login', data => {

        // console.log('clients: ' + JSON.stringify(clients));
        clients[data] = {
            socket: socket.id,
            lastMsg: clients[data] ? clients[data].lastMsg : 0
        };

        let o = [];

        for (let c in clients) {
            o.push(c);
        }

        io.sockets.connected[clients[data].socket].emit('online', o);

    });

    socket.on('message', data => {

        // console.log('Sending: ' + data.message + ' to ' + data.to);
        if (clients[data.to]) {

            if (new Date().getTime() - clients[data.from].lastMsg >= 500) {

                clients[data.from].lastMsg = new Date().getTime();
                io.sockets.connected[clients[data.to].socket].emit('message', data);

            } else {

                // Respond with error
                io.sockets.connected[clients[data.from].socket].emit('err', {
                    msg: 'You may only send 2 messages a second. Message not sent.'
                });

            }

        } else {

            io.sockets.connected[clients[data.from].socket].emit('err', {
                msg: `User ${data.to} is not online`
            });

        }

    });

    socket.on('disconnect', () => {

        for (let name in clients) {

            if (clients[name].socket === socket.id) {

                console.log(`Disconnected: ${socket.id} (${name})`);
                delete clients[name];
                break;

            }

        }

    });


    // socket.on('typing', name => {
    //     socket.broadcast.emit('typing', name);
    // });

})
