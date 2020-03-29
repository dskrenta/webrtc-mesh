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
const signalServer = require('simple-signal-server')(io);
const path = require('path');
const smsClient = require('twilio')(process.env.twilioAccountSid, process.env.twilioAuthToken);

// Internal utility imports
const {
  SERVER_PORT,
  LOGS
} = require('./utils/constants');

// Resolver imports
const iceServersResolver = require('./resolvers/iceServersResolver');

// Port to run server on
const PORT = process.env.PORT || SERVER_PORT;

// Enable cors
app.use(cors());

// Serve web on /static
app.use('/static', express.static(`${__dirname}/../web`));

// Rooms
const rooms = {};

// Peer discovery
signalServer.on('discover', request => {
  const roomId = request.discoveryData;
  const peerId = request.socket.id;

  if (!(roomId in rooms)) {
    rooms[roomId] = new Set();
  }

  rooms[roomId].add(peerId);
  request.socket.roomId = roomId;

  request.discover(peerId, {
    roomResponse: roomId,
    peers: Array.from(rooms[roomId]).filter(currentPeerId => currentPeerId !== peerId)
  });

  if(LOGS) console.log(peerId, 'joined', roomId);
});

// Peer disconnection
signalServer.on('disconnect', socket => {
  const peerId = socket.id;
  const roomId = socket.roomId;

  if (roomId in rooms) {
    rooms[roomId].delete(peerId);

    if (LOGS) console.log(peerId, 'left', roomId);
  }
});

// Relay peer requests
signalServer.on('request', request => {
  request.forward();
})

// On socket connection
io.on('connection', (socket) => {
  // Context for resolvers
  const context = { socket, io, smsClient, rooms };

  // Utility for generating socket resolvers
  const generateResolver = (name, fn) => socket.on(name, (args) => fn({ ...args, ...context }));

  // Resolvers
  generateResolver('getIceServers', iceServersResolver);
});

// Serve web/index.html on path '/' and '/index.html'
app.get('/', (req, res) => res.sendFile(path.resolve(`${__dirname}/../web/index.html`)));
app.get('/index.html', (req, res) => res.sendFile(path.resolve(`${__dirname}/../web/index.html`)));

// Start server
server.listen(
  PORT,
  () => console.log(`webrtc-conf server listening on port ${PORT}!`)
);
