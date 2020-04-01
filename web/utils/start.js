'use strict';

import {
  LOGS
} from './constants.js';
import api from './api.js';

export default async function start({
  smallVideoClickHandler,
  remoteVideoContainer,
  localVideoContainer,
  localVideoElement,
  roomId
}) {
  try {
    // Get ice servers from server
    const iceServers = await api({
      request: 'getIceServers',
      response: 'iceServersResponse'
    });

    // Peer config for simple-peer
    const peerConfig = {
      // Hack to specify correct ice servers
      iceServers: [iceServers[0], iceServers[3]]
    };

    // Signal client
    const signalClient = new SimpleSignalClient(window.socket);

    // Current room
    let currentRoom = null;

    // Creates a video element, sets a mediastream as it's source, and appends it to the DOM
    function createVideoElement(container, mediaStream, muted=false) {
      const videoElement = document.createElement('video');
      videoElement.autoplay = true;
      videoElement.playsinline = true;
      videoElement.srcObject = mediaStream;
      videoElement.muted = muted;
      videoElement.classList.add('smallVideo');
      container.appendChild(videoElement);

      // Enable inline video for mobile ios safari
      enableInlineVideo(videoElement);

      return videoElement;
    }

    // Registers new peer with localStream
    function onPeer(peer, localStream) {
      // Add local stream to peer
      peer.addStream(localStream);

      // On stream
      peer.on('stream', remoteStream => {
        // Create video element and append to remote video container
        const videoElement = createVideoElement(remoteVideoContainer, remoteStream);

        // Register click handler
        smallVideoClickHandler({
          element: videoElement
        });

        // On close
        peer.on('close', () => {
          // Remove video element from remote video container
          remoteVideoContainer.removeChild(videoElement);
        });
      });
    }

    // Connects to a peer and handles media streams
    async function connectToPeer(peerId, localStream) {
      if (LOGS) console.log('connecting to peer', peerId);

      // Connect to the peer
      const { peer } = await signalClient.connect(peerId, currentRoom, peerConfig);

      if (LOGS) console.log('connected to peer', peerId);

      // Register peer
      onPeer(peer, localStream);
    }

    // Join room
    function joinRoom(roomId, localStream) {
      if (LOGS) console.log('join', roomId);

      // Disconnect from all peers in old room
      if (currentRoom) {
        if (currentRoom !== roomId) {
          signalClient.peers().forEach(peer => {
            peer.destroy();
          });
        } else {
          return;
        }
      }

      if (LOGS) console.log('requesting to join', roomId);

      // Discover room
      signalClient.discover(roomId);

      // Get the peers in this room
      function onRoomPeers(discoveryData) {
        if (LOGS) console.log('onRoomPeers', discoveryData);

        // Discovery data is for from correct room
        if (discoveryData.roomResponse == roomId) {
          if (LOGS) console.log(discoveryData);

          // Remove onRoomPeers from discover listener
          signalClient.removeListener('discover', onRoomPeers);

          // Connect to all peers in new room
          discoveryData.peers.forEach(peerId => connectToPeer(peerId, localStream));
        }
      }

      // Register onRoomPeers on discover
      signalClient.addListener('discover', onRoomPeers);
    }

    // Local stream
    let localStream = null;

    // Attempt to getUserMedia
    try {
      localStream = await window.navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true
        },
        video: true
      });
    }
    catch (error) {
      alert('Unable to get webcam: ' + JSON.stringify(error.message));
      console.error('getUserMedia error', error);
    }

    // If local stream is defined
    if (localStream) {
      // Display local video
      const videoElement = createVideoElement(localVideoContainer, localStream, true);

      // Set style to indicate this is local video
      videoElement.classList.add('smallVideoActive');

      // Register click handler
      smallVideoClickHandler({
        element: videoElement,
        stream: localStream,
        mute: true
      });

      // Set local video element to local stream
      localVideoElement.srcObject = localStream;

      // Mute local video
      localVideoElement.muted = true;

      // Play local video element
      localVideoElement.play();

      // Accept request on request and register peer
      signalClient.on('request', async (request) => {
        const { peer } = await request.accept();
        onPeer(peer, localStream);
      });

      // Join room
      joinRoom(roomId, localStream);

      // Destory all peers on before page unload
      window.addEventListener('beforeunload', () => {
        signalClient.peers().forEach(peer => {
          peer.destroy();
        });
      })

      return {
        toggleFlipVideo: async () => {
          try {
            console.log(localStream);

            const isMobile = window.matchMedia('(max-width: 420px)').matches;
            const flipButton = document.getElementById('flipButton');
            if (localStream && isMobile && flipButton) {
              const mode = flipButton.value;
              const newMode = mode === 'user'
                ? 'environment'
                : 'user';

              flipButton.value = newMode;
              localStream = await window.navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: newMode } });

              console.log(localStream);
            }
          }
          catch (error) {
            alert('Unable to flip webcam: ' + JSON.stringify(error));
            console.error('toggleFlipVideo error', error);
          }
        },
        toggleMuteVideo: () => {
          try {
            console.log(localStream, localStream.getVideoTracks())
            if (localStream && localStream.getVideoTracks().length > 0) {
              localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
            }
          }
          catch (error) {
            alert('Unable to stop video');
            console.error('toggleMuteVideo error', error);
          }
        },
        toggleMuteAudio: () => {
          try {
            if (localStream && localStream.getAudioTracks().length > 0) {
              localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
            }
          }
          catch (error) {
            alert('Unable to mute audio');
            console.error('toggleMuteVideo error', error);
          }
        }
      }
    }
    else {
      return null;
    }
  }
  catch (error) {
    console.error('start error', error);
  }
}
