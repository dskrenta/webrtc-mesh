'use strict';

export default function api({
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
