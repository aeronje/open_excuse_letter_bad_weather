const iframe = document.getElementById('proxied');
const wrap = document.getElementById('wrap');
const MODE = "scale"; // "scale" or "native"

window.addEventListener('message', (ev) => {
  if (!ev.data || ev.data.type !== 'proxied-size') return;
  const { width, height } = ev.data;

  if (MODE === "native") {
    iframe.style.height = Math.max(300, height) + 'px';
    iframe.style.transform = '';
  } else {
    const containerW = wrap.clientWidth;
    const scale = Math.min(1, containerW / width);
    iframe.style.transform = `scale(${scale})`;
    iframe.style.height = (height * scale) + 'px';
  }
}, false);

// request size from iframe after load
iframe.addEventListener('load', () => {
  try { iframe.contentWindow.postMessage({ type: 'request-size' }, '*'); } catch(e) {}
  setTimeout(() => { try { iframe.contentWindow.postMessage({ type: 'request-size' }, '*'); } catch(e) {} }, 800);
});

// re-fit on window resize
let to;
window.addEventListener('resize', () => {
  clearTimeout(to);
  to = setTimeout(() => {
    try { iframe.contentWindow.postMessage({ type: 'request-size' }, '*'); } catch(e) {}
  }, 200);
});
