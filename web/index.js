(() => {
  'use strict';

  async function main() {
    try {
      const formElement = document.getElementById('inputForm');
      const usernameInputElement = document.getElementById('username');
      const roomIdInputElement = document.getElementById('roomId');

      formElement.addEventListener('submit', event => {
        event.preventDefault();

        const username = usernameInputElement.value;
        const roomId= roomIdInputElement.value;

        console.log(username, roomId);
      });
    }
    catch (error) {
      console.error('main error', error);
    }
  }

  main();
})();
