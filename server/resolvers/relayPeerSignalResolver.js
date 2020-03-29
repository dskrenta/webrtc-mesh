'use strict';

async function relayPeerSignalResolver({
  socket,
  io,
  originatingPeerId,
  roomId,
  signal,
  initiator = false
}) {
  try {
    // Check if socket is authenticated
    /*
    if (!socket.user) {
      console.error('Socket is not authenticated');
      return;
    }
    */

    console.log('peer signal', 'originatingPeerId', originatingPeerId, 'roomId', roomId, 'initiator', initiator, 'signal', signal);

    socket.broadcast.emit(`peerSignal:${roomId}`, {
      originatingPeerId,
      roomId,
      signal,
      initiator
    });
  }
  catch (error) {
    console.error('relayPeerSignalResolver error', error);
  }
}

module.exports = relayPeerSignalResolver;
