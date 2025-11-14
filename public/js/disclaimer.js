// Ron Penones | November 13th 2025 - Feel free to share and reproduce, the core idea is mine with some assistance of AI. Padayon!
// Nilagyan ko na po ng numbers iyong mga mahalagang part na dapat palitan kung defined ito sa CSS mo.
// Total of 6 or anim iyang puede mo palitan.

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("view-disclaimer-btn"); // 1.

  const modal = document.createElement("div");
  modal.id = "disclaimer-modal"; // 2 tapos tingnan mo rin iyong baba na div classes.
  modal.innerHTML = ` 
    <div class="disclaimer-modal-overlay"></div>
    <div class="disclaimer-modal-content">
      <span class="disclaimer-close-btn">&times;</span>
      <div id="disclaimer-markdown-content" class="disclaimer-markdown-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const overlay = modal.querySelector(".disclaimer-modal-overlay"); // 3.
  const closeBtn = modal.querySelector(".disclaimer-close-btn"); // 4.
  const contentDiv = document.getElementById("markdown-content");

  async function fetchMarkdown() {
    try {
      const res = await fetch("/disclaimer.md"); // 5 pero ito hindi CSS matters dahil kailangan lang nag-e-exist iyong file na ito sa local path.
      const text = await res.text();
      contentDiv.innerHTML = marked.parse(text);
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    } catch (err) {
      contentDiv.innerHTML = "<p>Failed to load disclaimer</p>"; // 6 Kapag halimbawang hindi ma-load thenpalitan mo tong message na ito.
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
