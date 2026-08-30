const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('.search-form');

function setTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === 'mocha';
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  localStorage.setItem('searxng-concept-theme', theme);
}

const savedTheme = localStorage.getItem('searxng-concept-theme');
if (savedTheme === 'latte' || savedTheme === 'mocha') {
  setTheme(savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  setTheme('latte');
}

themeToggle.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'mocha' ? 'latte' : 'mocha');
});

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }

  if (event.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.blur();
  }

  if (event.altKey && event.key.toLowerCase() === 't') {
    event.preventDefault();
    themeToggle.click();
  }
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchInput.blur();
});
