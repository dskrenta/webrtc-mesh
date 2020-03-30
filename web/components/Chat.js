'use strict';

import start from '../utils/start.js';
import copyToClipboard from '../utils/copyToClipboard.js';

const Chat = {
  render: async () => {
    return /* html */ `
      <div class="contentContainer">
        <div id="clientsContainer">
          <div class="mainVideo">
            <video id="mainVideo" autoplay controls>
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
      <div class="controls">
        <a id="leaveButton" class="control" href="index.html">
          <span>Leave Meeting</span>
        </a>
        <button id="muteButton" class="control" value="on">
          <img src="/static/images/mic.png" alt="" class="controlIcon" />
          <span>Mute</span>
        </button>
        <button id="videoButton" class="control" value="on">
          <img src="/static/images/video.png" alt="" class="controlIcon" />
          <span>Stop Video</span>
        </button>
        <!--button id="peopleButton" class="control" value="on">
          <img src="/static/images/group.png" alt="" class="controlIcon" />
          <span>6 People</span>
        </button-->
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

        // oldSourceElement.pause();
        oldSourceElement.srcObject = srcObject ? srcObject : element.srcObject;
        oldSourceElement.play();

        clearActiveClass();
        element.classList.add('smallVideoActive');
      });
    }

    /*/ participants menu
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

    // invite menu
    document.getElementById('inviteButton').addEventListener('click', () => {
      if (menu.style.width === 0 || menu.style.width === '0px') {
        openSideMenu(/*html*/`
          <div class="sideMenuInvite">
            <h2 class="sideMenuTitle">Invite Your Friends</h2>
            <button id="copyInvite">Copy Sharable Link</button>
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

    // toggle mute button
    const muteButton = document.getElementById('muteButton')
    muteButton.addEventListener('click', () => {
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

    // toggle video button
    const videoButton = document.getElementById('videoButton')
    videoButton.addEventListener('click', () => {
      if (videoButton.value === 'on') {
        videoButton.value = 'off';
        videoButton.innerHTML = `
          <img src="/static/images/stopvideo.png" alt="" class="controlIcon" />
          <span style="color:var(--second)">Start Video</span>
        `;
      }
      else {
        videoButton.value = 'on';
        videoButton.innerHTML = `
          <img src="static/images/video.png" alt="" class="controlIcon" />
          <span>Stop Video</span>
        `;
      }
    });

    const urlId = Chat.request.id;
    const values = urlId.split('-');

    if (values.length < 2) {
      alert('No username specified.');
    }
    else {
      start({
        localVideoContainer: document.getElementById('videoList'),
        smallVideoClickHandler,
        remoteVideoContainer: document.getElementById('videoList'),
        localVideoElement: document.getElementById('mainVideo'),
        roomId: values[0],
        username: values[1]
      });
    }
  }
};

export default Chat;
