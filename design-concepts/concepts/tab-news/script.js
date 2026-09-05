const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('.search-form');

// Theme management matching 05-ddg-results
function setTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === 'mocha';
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  localStorage.setItem('searxng-concept-theme', theme);
}

const savedTheme = localStorage.getItem('searxng-concept-theme');
if (savedTheme === 'latte' || savedTheme === 'mocha') {
  setTheme(savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  setTheme('latte');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'mocha' ? 'latte' : 'mocha');
  });
}

// Global keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }

  if (event.key === 'Escape') {
    if (document.activeElement === searchInput) {
      searchInput.blur();
    }
    closeAllDropdowns();
  }

  if (event.altKey && event.key.toLowerCase() === 't') {
    event.preventDefault();
    if (themeToggle) {
      themeToggle.click();
    }
  }
});

if (searchForm) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    searchInput.blur();
  });
}

// Interactive filter dropdowns
const dropdownWrappers = document.querySelectorAll('.dropdown-wrapper');

function closeAllDropdowns() {
  dropdownWrappers.forEach((wrapper) => {
    const trigger = wrapper.querySelector('.dropdown-trigger');
    const menu = wrapper.querySelector('.dropdown-menu');
    if (trigger && menu) {
      trigger.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }
  });
}

dropdownWrappers.forEach((wrapper) => {
  const trigger = wrapper.querySelector('.dropdown-trigger');
  const menu = wrapper.querySelector('.dropdown-menu');
  const valueDisplay = trigger ? trigger.querySelector('.value-text') : null;

  if (!trigger || !menu) return;

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    closeAllDropdowns();
    if (!isExpanded) {
      trigger.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    }
  });

  menu.querySelectorAll('li button').forEach((optionBtn) => {
    optionBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const optionLi = optionBtn.closest('li');

      menu.querySelectorAll('li').forEach((li) => {
        li.classList.remove('selected');
        li.setAttribute('aria-selected', 'false');
      });

      optionLi.classList.add('selected');
      optionLi.setAttribute('aria-selected', 'true');

      if (valueDisplay) {
        valueDisplay.textContent = optionBtn.textContent.trim();
      }

      closeAllDropdowns();
    });
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.dropdown-wrapper')) {
    closeAllDropdowns();
  }
});

// Interactive topic chips
const topicChips = document.querySelectorAll('.topic-chip');
topicChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    topicChips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
  });
});
