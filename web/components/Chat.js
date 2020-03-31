'use strict';

import start from '../utils/start.js';
import copyToClipboard from '../utils/copyToClipboard.js';

const Chat = {
  render: async () => {
    return /* html */ `
      <div id="goModalContainer" class="goModalContainer" style="display: flex;">
        <div id="goModalBackground" class="goModalBackground"></div>
        <div class="goModal">
          <h2>Welcome to @${Chat.request.id}</h2>
          <button id="goButton" class="copyInvite">Go!</button>
        </div>
      </div>
      <div class="controls">
        <a id="leaveButton" class="control" href="/">
          <span>Leave <br class="leaveBreak"/>Meeting</span>
        </a>
        <button id="muteButton" class="control" value="on">
          <img src="/static/images/mic.png" alt="" class="controlIcon" />
          <span>Mute</span>
        </button>
        <button id="videoButton" class="control" value="on">
          <img src="/static/images/video.png" alt="" class="controlIcon" />
          <span>Stop</span>
        </button>
        <button id="flipButton" class="control flipControl" value="user">
          <img src="/static/images/flip.png" alt="" class="controlIcon" />
          Flip
        </button>
      </div>
      <div class="contentContainer">
        <div id="clientsContainer">
          <div class="mainVideo">
            <video id="mainVideo" autoplay playsinline>
              Your browser does not support the video tag.
            </video>
          </div>
          <div id="videoList" class="videoList">
            <button id="inviteButton" class="inviteButton smallVideo" value="off">
              <img src="/static/images/invite.png" alt="" class="controlIcon" />
              <span>Invite</span>
            </button>
          </div>
        </div>
        <div id="sideMenu" class="sideMenu" style="width: 0;">
          <h1>Hi I'm Menu</h1>
        </div>
      </div>
    `;
  },
  afterRender: async () => {
    const menu = document.getElementById('sideMenu');
    const clients = document.getElementById('clientsContainer');

    // close side menu
    function closeSideMenu() {
      if (menu) {
        menu.style.width = 0;
        clients.style.width = '100vw';
      }
    }

    // open side menu
    function openSideMenu(content) {
      if (menu) {
        clients.style.width = 'calc(100vw - 300px)';
        menu.style.width = '300px';
        menu.innerHTML = `
          <div class="sideMenuHeader">
            <button id="closeSideMenu">
              Close
            </button>
          </div>
        ` + content;

        document.getElementById('closeSideMenu').addEventListener('click', () => {
          closeSideMenu();
        })
      }
    }

    function clearActiveClass() {
      document.querySelectorAll('.smallVideo').forEach((element) => {
        element.classList.remove('smallVideoActive');
      });
    }

    function smallVideoClickHandler(element, srcObject = false) {
      element.addEventListener('click', () => {
        const oldSourceElement = document.getElementById('mainVideo');

        oldSourceElement.srcObject = srcObject ? srcObject : element.srcObject;
        oldSourceElement.play();

        clearActiveClass();
        element.classList.add('smallVideoActive');
      });
    }

    /* participants menu
    
    <!--button id="peopleButton" class="control" value="on">
      <img src="/static/images/group.png" alt="" class="controlIcon" />
      <span>6 People</span>
    </button-->
    
    document.getElementById('peopleButton').addEventListener('click', () => {
      if (menu.style.width === 0 || menu.style.width === '0px') {
        openSideMenu(/*html* /`
          <div class="sideMenuInvite">
            <h2 class="sideMenuTitle">6 People are here</h2>
            <ul class="sideMenuList">
              <li class="sideMenuPerson">Harvey Dent</li>
              <li class="sideMenuPerson">Bruce Wayne</li>
              <li class="sideMenuPerson">Harvey Dent</li>
              <li class="sideMenuPerson">Bruce Wayne</li>
              <li class="sideMenuPerson">Harvey Dent</li>
              <li class="sideMenuPerson">Bruce Wayne</li>
            </ul>
          </div>
        `);
      }
      else {
        closeSideMenu();
      }
    });*/

    // go modal
    const goModal = document.getElementById('goModalContainer');
    document.getElementById('goButton').addEventListener('click', () => {
      goModal.style.display = 'none';
    });
    /*
    document.getElementById('goModalBackground').addEventListener('click', () => {
      goModal.style.display = 'none';
    });
    */

    // invite menu
    document.getElementById('inviteButton').addEventListener('click', () => {
      if (menu.style.width === 0 || menu.style.width === '0px') {
        openSideMenu(/*html*/`
          <div class="sideMenuInvite">
            <h2 class="sideMenuTitle">Invite Your Friends</h2>
            <button id="copyInvite" class="copyInvite">Copy Sharable Link</button>
            <span id="copyMsg"></span>
          </div>
        `);

        document.getElementById('copyInvite').addEventListener('click', () => {
          copyToClipboard({
            window,
            document,
            link: window.location.href,
            callback: () => {
              document.getElementById('copyMsg').innerText = 'Copied to clipboard!';
            }
          });
        });
      }
      else {
        closeSideMenu();
      }
    });

    const roomId = Chat.request.id;

    const {
      toggleFlipVideo,
      toggleMuteVideo,
      toggleMuteAudio
    } = await start({
      localVideoContainer: document.getElementById('videoList'),
      smallVideoClickHandler,
      remoteVideoContainer: document.getElementById('videoList'),
      localVideoElement: document.getElementById('mainVideo'),
      roomId,
    });

    // Toggle camera flip
    document.getElementById('flipButton').addEventListener('click', () => {
      toggleFlipVideo();
    });

    // Toggle mute button
    const muteButton = document.getElementById('muteButton');
    muteButton.addEventListener('click', () => {
      toggleMuteAudio();

      if (muteButton.value === 'on') {
        muteButton.value = 'off';
        muteButton.innerHTML = `
          <img src="/static/images/mutemic.png" alt="" class="controlIcon" />
          <span style="color:var(--second)">Unmute</span>
        `;
      }
      else {
        muteButton.value = 'on';
        muteButton.innerHTML = `
          <img src="/static/images/mic.png" alt="" class="controlIcon" />
          <span>Mute</span>
        `;
      }
    });

    // Toggle video button
    const videoButton = document.getElementById('videoButton');
    videoButton.addEventListener('click', () => {
      toggleMuteVideo();

      if (videoButton.value === 'on') {
        videoButton.value = 'off';
        videoButton.innerHTML = `
          <img src="/static/images/stopvideo.png" alt="" class="controlIcon" />
          <span style="color:var(--second)">Start</span>
        `;
      }
      else {
        videoButton.value = 'on';
        videoButton.innerHTML = `
          <img src="static/images/video.png" alt="" class="controlIcon" />
          <span>Stop</span>
        `;
      }
    });
  }
};

export default Chat;
