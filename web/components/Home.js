'use strict';

const Home = {
  render: async () => {
    return /*html*/ `
      <div class="home">
        <div class="textContain">
          <h1 class="logo">WebRTC-Mesh</h1>
          <p class="tagline">Video conferencing made easy.</p>
          <h5 class="callToAction">Join or create a room</h5>
          <form
            id="inputForm"
            class="form"
          >
            <input
              id="roomId"
              placeholder="Conference ID"
              autocomplete="off"
            />
            <button
              id="submit"
              type="submit"
            >
              Go!
            </button>
          </form>
        </div>
        <img
          src="/images/videocall.svg"
          class="landingImage"
          alt=""
        />
        <!--div class="footer">
          &copy; 2020 webrtc-mesh
          &nbsp;&bull;&nbsp;
          <a href="#terms" target="_blank">Terms</a>
          &nbsp;&bull;&nbsp;
          <a href="#privacy" target="_blank">Privacy</a>
        </div-->
      </div>
    `;
  },
  afterRender: async () => {
    // HTML elements
    const formElement = document.getElementById('inputForm');
    const roomIdInputElement = document.getElementById('roomId');

    // Form on submit listener
    formElement.addEventListener('submit', event => {
      event.preventDefault();

      const roomId = roomIdInputElement.value;

      window.navigate(`#chat/${roomId}`);
    });
  }
};

export default Home;
