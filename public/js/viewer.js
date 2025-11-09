const viewer = document.getElementById("himawari-img");
const timestamp = document.getElementById("timestamp");
let images = [];
let index = 0;

async function fetchImages() {
  try {
    const res = await fetch("/api/himawari");
    images = await res.json();
    console.log("Loaded images:", images.length);
    playAnimation();
  } catch (err) {
    console.error("Error fetching Himawari data:", err);
  }
}

function playAnimation() {
  if (!images.length) return;
  setInterval(() => {
    viewer.src = images[index];
    const name = images[index].split("_").pop().replace(".jpg", "");
    timestamp.textContent = `Frame time: ${name.slice(0, 2)}:${name.slice(2)} UTC`;
    index = (index + 1) % images.length;
  }, 1000); // 1s per frame
}

fetchImages();

