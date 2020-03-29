'use strict';

async function relayPeerSignalResolver({
  socket,
  io,
  data,
  id,
  type,
  consumingPeerId
}) {
  try {
    // Check if socket is authenticated
    /*
    if (!socket.user) {
      console.error('Socket is not authenticated');
      return;
    }
    */

    io.emit(`peerSignal:${id}`, {
      data,
      type,
      consumingPeerId
    });
  }
  catch (error) {
    console.error('relayPeerSignalResolver error', error);
  }
}

module.exports = relayPeerSignalResolver;
