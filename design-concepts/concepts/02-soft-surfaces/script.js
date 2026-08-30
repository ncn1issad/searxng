const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#search-input");
const clearButton = document.querySelector(".clear-button");

let savedTheme;

try {
  savedTheme = localStorage.getItem("searxng-concept-theme");
} catch {
  savedTheme = null;
}
const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "latte" : "mocha";

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute(
    "aria-label",
    theme === "mocha" ? "Switch to light theme" : "Switch to dark theme"
  );
}

applyTheme(savedTheme || preferredTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "mocha" ? "latte" : "mocha";
  applyTheme(nextTheme);
  try {
    localStorage.setItem("searxng-concept-theme", nextTheme);
  } catch {
    // Theme still works when the prototype is opened from a restricted file URL.
  }
});

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
});
