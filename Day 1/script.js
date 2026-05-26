// ============================================
//  script.js — Taskr interactivity
// ============================================

// ── Mobile menu toggle ──────────────────────
const menuBtn   = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const iconOpen  = document.getElementById("icon-open");
const iconClose = document.getElementById("icon-close");

menuBtn.addEventListener("click", () => {
  const isOpen = !mobileMenu.classList.contains("hidden");

  mobileMenu.classList.toggle("hidden");
  iconOpen.classList.toggle("hidden", !isOpen);
  iconClose.classList.toggle("hidden", isOpen);
});

function closeMobileMenu() {
  mobileMenu.classList.add("hidden");
  iconOpen.classList.remove("hidden");
  iconClose.classList.add("hidden");
}

// ── Waitlist form ───────────────────────────
const form       = document.getElementById("waitlist-form");
const emailInput = document.getElementById("email-input");
const successMsg = document.getElementById("success-msg");
const errorMsg   = document.getElementById("error-msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Reset state
  successMsg.classList.add("hidden");
  errorMsg.classList.add("hidden");

  const email = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValid) {
    errorMsg.classList.remove("hidden");
    return;
  }

  // Simulate successful submission
  form.classList.add("hidden");
  successMsg.classList.remove("hidden");
});
