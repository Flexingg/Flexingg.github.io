import { initCadViewer } from "./cad-viewer.js";
import { initBeamCalculator } from "./beam-calculator.js";
import { initThermalCalculator } from "./thermal-calculator.js";

document.addEventListener("DOMContentLoaded", () => {
  initCadViewer();
  initBeamCalculator();
  initThermalCalculator();

  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // Handle tool tab selection if tabs are used
  const tabButtons = document.querySelectorAll(".tool-tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".tool-section").forEach((sec) => {
        if (sec.id === targetId) {
          sec.classList.remove("tool-hidden");
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          sec.classList.add("tool-hidden");
        }
      });
    });
  });

  // Check URL hash on load (e.g. #cad, #thermal, #calculator)
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const matchedBtn = document.querySelector(`.tool-tab-btn[data-target="${hash}"]`);
    if (matchedBtn) {
      matchedBtn.click();
    }
  }
});
