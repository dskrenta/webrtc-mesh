'use strict';

async function iceServersResolver({
  twilioClient,
  socket
}) {
  try {
    const ntsData = await twilioClient.tokens.create();
    socket.emit('iceServersResponse', ntsData.iceServers);
  }
  catch (error) {
    console.error('iceServersResolver error', error);
  }
}

module.exports = iceServersResolver;
