(() => {
  'use strict';

  async function start({
    username,
    roomId
  }) {
    try {
		  const localVideoContainer = document.getElementById('localVideo');
		  const remoteVideoContainer = document.getElementById('remoteVideos');

      // Signal client
      const signalClient = new SimpleSignalClient(window.socket);

      // Current room
      let currentRoom = null;

      // creates a DOM element to allow the user to see/join rooms
      function createRoomElement(id) {
        const element = document.createElement('div');
        element.className = 'el';
        element.id = id;
        element.innerHTML = id;
        roomContainer.appendChild(element);
        return element;
      }

      // creates a video element, sets a mediastream as it's source, and appends it to the DOM
      function createVideoElement(container, mediaStream, muted=false) {
        const videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.srcObject = mediaStream;
        videoElement.muted = muted;
        container.appendChild(videoElement);
        return videoElement;
      }

      function onPeer(peer, localStream) {
        peer.addStream(localStream);
        peer.on('stream', remoteStream => {
          const videoElement = createVideoElement(remoteVideoContainer, remoteStream);
          peer.on('close', () => {
            remoteVideoContainer.removeChild(videoElement);
          });
        });
      }

      // connects to a peer and handles media streams
      async function connectToPeer(peerId, localStream) {
        console.log('connecting to peer', peerId);
        const { peer } = await signalClient.connect(peerId, currentRoom); // connect to the peer
        console.log('connected to peer', peerId);
        onPeer(peer, localStream);
      }

      function joinRoom(roomId, localStream) {
        console.log('join', roomId);

        // disconnect from all peers in old room
        if (currentRoom) {
          if (currentRoom !== roomId) {
            signalClient.peers().forEach(peer => {
              peer.destroy();
            });
          } else {
            return;
          }
        }

        console.log('requesting to join', roomId);
        signalClient.discover(roomId);

        // get the peers in this room
        function onRoomPeers(discoveryData) {
          console.log('onRoomPeers', discoveryData);
          if (discoveryData.roomResponse == roomId) {
            console.log(discoveryData);
            signalClient.removeListener('discover', onRoomPeers);
            // don't connect to own peer
            discoveryData.peers.forEach(peerId => connectToPeer(peerId, localStream)); // connect to all peers in new room
          }
        }

        signalClient.addListener('discover', onRoomPeers);
      }

      navigator.getUserMedia({ audio: true, video: true }, (localStream) => {
        createVideoElement(localVideoContainer, localStream, true); // display local video

        signalClient.on('request', async (request) => {
          const { peer } = await request.accept();
          onPeer(peer, localStream);
        });

        joinRoom(roomId, localStream);
      }, () => alert('No webcam access!'));
    }
    catch (error) {
      console.error('start error', error);
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
