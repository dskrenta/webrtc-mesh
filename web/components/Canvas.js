'use strict';

const Canvas = {
  render: async () => {
    return /* html */ `
      <video controls muted playsinline autoplay loop width="500" id="video1">
        <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4">

        Sorry, your browser doesn't support embedded videos.
      </video>
      <br />
      <video controls muted playsinline autoplay loop width="500" id="video2">
        <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4">

        Sorry, your browser doesn't support embedded videos.
      </video>
      <br />
      <video controls muted playsinline autoplay loop width="500" id="video3">
        <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" type="video/mp4">

        Sorry, your browser doesn't support embedded videos.
      </video>
      <!--<canvas id="canvas" style="border-style: solid;"></canvas>
      <video id="video" controls></video>-->
    `;
  },
  afterRender: async () => {
    try {
      enableInlineVideo(document.getElementById('video1'));
      enableInlineVideo(document.getElementById('video2'));
      enableInlineVideo(document.getElementById('video3'));
      /*
      const FPS = 30;
      const canvasElement = document.getElementById('canvas');
      const ctx = canvasElement.getContext('2d');
      const videoElement = document.getElementById('video');

      const localStream = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      videoElement.srcObject = localStream;
      videoElement.play();

      setInterval(() => {
        canvasElement.width = videoElement.clientWidth;
        canvasElement.height = videoElement.clientHeight;
        ctx.drawImage(videoElement, 0, 0, videoElement.clientWidth, videoElement.clientHeight);

      }, 1000 / FPS);
      */
    }
    catch (error) {
      console.error('Canvas afterRender error', error);
    }
  }
};

export default Canvas;
