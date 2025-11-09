async function loadHimawari() {
  const container = document.getElementById("himari-viewer");
  if (!container) return;

  // Setup <img> and timestamp
  container.innerHTML = "";
  const img = document.createElement("img");
  img.id = "himawari-frame";
  container.appendChild(img);

  const timestamp = document.createElement("div");
  timestamp.id = "himawari-timestamp";
  container.appendChild(timestamp);

  const apiUrl = "/api/himawari";

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Failed to fetch Himawari images");
    const images = await res.json();

    if (!images.length) {
      img.alt = "No images available.";
      return;
    }

    let index = 0;
    const total = images.length;

    const updateImage = () => {
      const url = images[index];
      const match = url.match(/(\d{4})\.jpg$/);
      const label = match ? `${match[1].slice(0, 2)}:${match[1].slice(2)} UTC` : "";

      img.style.opacity = 0;
      setTimeout(() => {
        img.src = url;
        timestamp.textContent = label;
        img.style.opacity = 1;
      }, 150);

      index = (index + 1) % total;
    };

    updateImage();
    setInterval(updateImage, 800);
  } catch (err) {
    console.error("Himawari Error:", err);
    container.innerHTML = `<p style="color:red;">Failed to load feed.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadHimawari);

