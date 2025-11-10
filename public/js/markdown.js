// Ron Penones | November 10th 2025 - Feel free to share and reproduce, the core idea is mine with some assistance of AI. Padayon!
// Etong script na ito subtly kalokohan lang pero may impact lalo na pag ang amo mo tanga.
// Markdown viewer for excuse letter kasi nga diba bad weather excuse letter yan.
// Ang purpose nito eh maglapat siya ng button na pag-click mo eh may lalabas na excuse letter in markdown format sa pop-up dialog.

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("view-excuse-btn");

  const modal = document.createElement("div");
  modal.id = "excuse-modal";
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <span class="close-btn">&times;</span>
      <div id="markdown-content" class="markdown-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const overlay = modal.querySelector(".modal-overlay");
  const closeBtn = modal.querySelector(".close-btn");
  const contentDiv = document.getElementById("markdown-content");

  async function fetchMarkdown() {
    try {
      const res = await fetch("/excuse_letter.md");
      const text = await res.text();
      contentDiv.innerHTML = marked.parse(text);
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    } catch (err) {
      contentDiv.innerHTML = "<p>Failed to load excuse letter</p>";
      modal.style.display = "block";
    }
  }

  btn.addEventListener("click", fetchMarkdown);
  overlay.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

