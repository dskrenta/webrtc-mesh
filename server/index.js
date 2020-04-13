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
const twilioClient = require('twilio')(process.env.twilioAccountSid, process.env.twilioAuthToken);

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
// app.use('/static', express.static(`${__dirname}/../web`));
app.use(express.static(`${__dirname}/../web`));

// Rooms
const rooms = {};

// Peer discovery
signalServer.on('discover', request => {
  const roomId = request.discoveryData.roomId;
  const publicRoom = request.discoveryData.publicRoom || false;
  const peerId = request.socket.id;

  if (!(roomId in rooms)) {
    rooms[roomId] = {
      peers: new Set(),
      publicRoom
    };
  }

  rooms[roomId].peers.add(peerId);
  request.socket.roomId = roomId;

  request.discover(peerId, {
    roomResponse: roomId,
    peers: Array.from(rooms[roomId].peers).filter(currentPeerId => currentPeerId !== peerId)
  });

  if(LOGS) console.log(peerId, 'joined', roomId);
});

// Peer disconnection
signalServer.on('disconnect', socket => {
  const peerId = socket.id;
  const roomId = socket.roomId;

  if (roomId in rooms) {
    rooms[roomId].peers.delete(peerId);

    if (rooms[roomId].peers.size === 0) {
      delete rooms[roomId];
    }

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
  const context = { socket, io, twilioClient, rooms };

  // Utility for generating socket resolvers
  const generateResolver = (name, fn) => socket.on(name, (args) => fn({ ...args, ...context }));

  // Resolvers
  generateResolver('getIceServers', iceServersResolver);
  generateResolver('getRooms', async ({ socket }) => {
    socket.emit(
      'getRoomsResponse',
      Object.keys(rooms)
        .filter(roomId => rooms[roomId].publicRoom === true)
        .map(roomId => {
          return {
            roomId,
            numParticipants: rooms[roomId].peers.size
          };
        })
    )
  });
});

// Start server
server.listen(
  PORT,
  () => console.log(`webrtc-mesh server listening on port ${PORT}!`)
);
