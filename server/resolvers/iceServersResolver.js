'use strict';

async function iceServersResolver({
  smsClient,
  socket
}) {
  try {
    // Check if socket is authenticated
    /*
    if (!socket.user) {
      console.error('Socket is not authenticated');
      return;
    }
    */

    const ntsData = await smsClient.tokens.create();
    socket.emit('iceServersResponse', ntsData.iceServers);
  }
  catch (error) {
    console.error('iceServersResolver error', error);
  }
}

module.exports = iceServersResolver;
