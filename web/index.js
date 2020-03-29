(() => {
  'use strict';

  async function start({
    // username,
    roomId
  }) {
    try {
      // get ice servers

      const peerId = randomId();

      const internalPeers = {};

      // Get video stream from browser
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      window.socket.on(`peerSignal:${roomId}`, ({
        originatingPeerId,
        roomId,
        signal
      }) => {
        if (peerId !== originatingPeerId) {
          if (originatingPeerId in internalPeers) {
            internalPeers[originatingPeerId].signal(signal);
          }
          else {
            internalPeers[originatingPeerId] = new SimplePeer({
              initiator: false,
              // stream,
              trickle: false,
              // config: peerConfig
            });

            // May need to pass both originating and actual peerId
            internalPeers[originatingPeerId].on('signal', signal => {
              window.socket.emit('relayPeerSignal', {
                originatingPeerId,
                roomId,
                signal
              });
            })
          }
        }
      });
    }
    catch (error) {
      console.error(error);
    }
  }


  async function main() {
    try {
      // Register socket.io
      window.socket = io('http://localhost:3000');

      // HTML elements
      const formElement = document.getElementById('inputForm');
      const usernameInputElement = document.getElementById('username');
      const roomIdInputElement = document.getElementById('roomId');

      // Form on submit listener
      formElement.addEventListener('submit', event => {
        event.preventDefault();

        const username = usernameInputElement.value;
        const roomId = roomIdInputElement.value;

        // Run start with username and roomId from form
        start({
          username,
          roomId
        });
      });
    }
    catch (error) {
      console.error('main error', error);
    }
  }

  function randomId() {
    return Math.random().toString(36).substr(2, 9);
  }

  function api({
    request,
    data,
    response,
    timeout = 10000 // 10 seconds
  }) {
    return new Promise((resolve, reject) => {
      const tempListener = window.socket.on(response, (resData) => {
        window.socket.off(response, tempListener);
        resolve(resData);
      });

      setTimeout(() => {
        window.socket.off(response, tempListener);
        reject(`Api request ${request} timed out`);
      }, timeout);

      window.socket.emit(request, data);
    });
  }

  // Run main
  main();
})();
