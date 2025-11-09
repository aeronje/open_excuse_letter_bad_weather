const iframe = document.getElementById("proxied");
const wrap = document.getElementById("wrap");
const MODE = "scale"; // "scale" or "native"

// handle resize messages from proxied page
window.addEventListener("message", (ev) => {
  if (!ev.data || ev.data.type !== "proxied-size") return;

  const { width, height } = ev.data;
  if (!width || !height) return;

  if (MODE === "native") {
    iframe.style.height = Math.max(300, height) + "px";
    iframe.style.transform = "";
    iframe.style.transformOrigin = "";
  } else {
    const containerW = wrap.clientWidth;
    const scale = Math.min(1, containerW / width);

    iframe.style.transform = `scale(${scale})`;
    iframe.style.transformOrigin = "top center";
    iframe.style.height = `${height * scale}px`;
  }
}, false);

// request size after iframe load (twice for good measure)
iframe.addEventListener("load", () => {
  const msg = { type: "request-size" };
  try { iframe.contentWindow.postMessage(msg, "*"); } catch (e) {}
  setTimeout(() => { try { iframe.contentWindow.postMessage(msg, "*"); } catch (e) {} }, 1000);
});

// refit on window resize with debounce
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    try { iframe.contentWindow.postMessage({ type: "request-size" }, "*"); } catch (e) {}
  }, 250);
});
