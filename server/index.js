'use strict';

// If development use environment variables from blazebuddies/.env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({path: `${__dirname}/../.env`});
}

// External imports
const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const smsClient = require('twilio')(process.env.twilioAccountSid, process.env.twilioAuthToken);

// Internal utility imports
const {
  SERVER_PORT
} = require('./utils/constants');

// Resolver imports
const relayPeerSignalResolver = require('./resolvers/relayPeerSignalResolver');
const iceServersResolver = require('./resolvers/iceServersResolver');
const joinRoomResolver = require('./resolvers/joinRoomResolver');
const leaveRoomResolver = require('./resolvers/leaveRoomResolver');

// Port to run server on
const PORT = process.env.PORT || SERVER_PORT;

// Enable cors
app.use(cors());

// Serve web on /static
app.use('/static', express.static(`${__dirname}/../web`));

// Socket authentication middleware
/*
io.use((socket, next) => {
  socket.user = (socket.handshake.query.token && socket.handshake.query.token !== 'null')
    ? getPayload(socket.handshake.query.token)
    : null;

  next();
});
*/

// Rooms object
const rooms = {};

/*
  start conf:
    create new roomId
    listen for incoming peers on roomId

  rooms = {
    'roomid': [
      part1,
      part2
    ]
  }
*/

// On socket connection
io.on('connection', (socket) => {
  // Context for resolvers
  const context = { socket, io, smsClient, rooms };

  // Utility for generating socket resolvers
  const generateResolver = (name, fn) => socket.on(name, (args) => fn({ ...args, ...context }));

  // Resolvers
  generateResolver('relayPeerSignal', relayPeerSignalResolver);
  generateResolver('getIceServers', iceServersResolver);
  generateResolver('joinRoom', joinRoomResolver);
  generateResolver('leaveRoom', leaveRoomResolver);
});

// Serve web/index.html on path '/' and '/index.html'
app.get('/', (req, res) => res.sendFile(path.resolve(`${__dirname}/../web/index.html`)));
app.get('/index.html', (req, res) => res.sendFile(path.resolve(`${__dirname}/../web/index.html`)));

// Start server
server.listen(
  PORT,
  () => console.log(`webrtc-conf server listening on port ${PORT}!`)
);
