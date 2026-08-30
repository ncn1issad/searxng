const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const clearButton = document.querySelector("#clear-button");

function readStoredTheme() {
  try {
    return localStorage.getItem("searxng-concept-theme");
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem("searxng-concept-theme", theme);
  } catch {
    // Theme switching still works when storage is blocked.
  }
}

const storedTheme = readStoredTheme();
const initialTheme = storedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "latte" : "mocha");

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute("aria-label", theme === "mocha" ? "Switch to light theme" : "Switch to dark theme");
  storeTheme(theme);
}

function syncClearButton() {
  clearButton.hidden = searchInput.value.length === 0;
}

applyTheme(initialTheme);
syncClearButton();

themeToggle.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "mocha" ? "latte" : "mocha");
});

searchInput.addEventListener("input", syncClearButton);

clearButton.addEventListener("click", () => {
  searchInput.value = "";
  syncClearButton();
  searchInput.focus();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput.value.trim();
  if (!query) {
    searchInput.focus();
    return;
  }
  document.title = `${query} — SearXNG`;
  searchInput.blur();
});
