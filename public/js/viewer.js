// Ron Penones | November 10th 2025 - Feel free to share and reproduce, the core idea is mine with some assistance of AI. Padayon!
// Mula doon sa himawari.js na nasa /api folder ay kukunin nito ang mga satellite images at ipapakita sa viewer na parang animation.
// Walang masyadong ganap dito kasi taga-render lang ito ng images.

const viewer = document.getElementById("himawari-img");
const timestamp = document.getElementById("timestamp");
let images = [];
let index = 0;

async function fetchImages() {
  try {
    const res = await fetch("/api/himawari"); // Tulad ng sabi ko na kung ano ang captured valid satellite images ay pre-defined sa himawari.js.
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
    timestamp.textContent = `UTC aka 🇬🇧London time: ${name.slice(0, 2)}:${name.slice(2)}`; // Sinadya ko na ilagay iyong London kasi hindi masyado gets ng karamihan ang UTC.
    index = (index + 1) % images.length;
  }, 500); // 1 second talaga to originally pero ginawa kong half second para mas fluid ang animation. Baduy kasi ng pa-utay utay na rendering.
}

fetchImages();

