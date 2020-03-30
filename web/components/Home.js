'use strict';

const Home = {
  render: async () => {
    return /*html*/ `
      <div class="home">
        <h1 class="logo">webrtc-mesh</h1>
        <p class="tagline">Video Conferencing Made Easy.</p>
        <h5 class="callToAction">Join - or - Create</h5>
        <form
          id="inputForm"
          class="form"
        >
          <input
            id="username"
            placeholder="Username"
            autocomplete="off"
          />
          <input
            id="roomId"
            placeholder="Conference ID"
            autocomplete="off"
          />
          <button
            id="submit"
            type="submit"
          >
            Join
          </button>
        </form>
      </div>
    `;
  },
  afterRender: async () => {
    // HTML elements
    const formElement = document.getElementById('inputForm');
    const usernameInputElement = document.getElementById('username');
    const roomIdInputElement = document.getElementById('roomId');

    // Form on submit listener
    formElement.addEventListener('submit', event => {
      event.preventDefault();

      const username = usernameInputElement.value;
      const roomId = roomIdInputElement.value;

      window.navigate(`#chat/${roomId}-${username}`);
    });
  }
};

export default Home;