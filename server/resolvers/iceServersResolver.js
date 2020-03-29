'use strict';

async function iceServersResolver({
  smsClient,
  socket
}) {
  try {
    const ntsData = await smsClient.tokens.create();
    socket.emit('iceServersResponse', ntsData.iceServers);
  }
  catch (error) {
    console.error('iceServersResolver error', error);
  }
}

module.exports = iceServersResolver;
