'use strict';

const iceServers = require('../utils/iceServers');

async function joinRoomResolver({
  socket,
  smsClient,
  rooms,
  roomId,
  username
}) {
  try {
    // Add user to room
    if (!rooms[roomId]) {
      rooms[roomId] = [
        username
      ];
    }
    else {
      rooms[roomId].push(username);
    }

    // Emit response with initiator value and iceServers
    socket.emit('joinRoomResponse', {
      iceServers: await iceServers(smsClient),
      initiator: rooms[roomId].length > 1
    })
  }
  catch (error) {
    console.error('joinRoomResolver error', error);
  }
}

module.exports = joinRoomResolver;
