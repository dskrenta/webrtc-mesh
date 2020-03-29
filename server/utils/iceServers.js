'use strict';

async function iceServers(smsClient) {
  try {
    const ntsData = await smsClient.tokens.create();
    return ntsData.iceServers;
  }
  catch (error) {
    console.error('iceServers', error);
  }
}

module.exports = iceServers;
