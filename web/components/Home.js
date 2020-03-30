'use strict';

const Home = {
  render: async () => {
    return /*html*/ `
      <div class="home">
        <h1 class="logo">webrtc-mesh</h1>
        <p class="tagline">Video conferencing made easy.</p>
        <h5 class="callToAction">Join or create</h5>
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
            Join
          </button>
        </form>
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
