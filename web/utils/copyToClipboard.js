'use strict';

export default function copyToClipboard({
  window,
  document,
  link = '',
  callback = () => {}
}) {
  try {
    const input = document.createElement("textarea");
    input.innerText = link;
    document.body.appendChild(input);

    input.focus();
    input.select();

    const range = document.createRange();
    range.selectNodeContents(input);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    input.setSelectionRange(0, 999);
    document.execCommand('copy');

    input.remove();

    callback();
  }
  catch (e) {
    console.log(e)
  }
};
