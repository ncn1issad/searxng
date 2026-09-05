const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('.search-form');
const filterPills = document.querySelectorAll('.filter-pill');
const verifiedToggle = document.querySelector('.toggle-verified-btn');
const sortSelect = document.querySelector('#sort-select');
const fileCards = document.querySelectorAll('.file-result-card');
const toastNotice = document.querySelector('#toast-notice');
const toastMessage = document.querySelector('#toast-message');

let toastTimeout;
function showToast(message) {
  if (!toastNotice) return;
  if (toastMessage) toastMessage.textContent = message;
  toastNotice.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastNotice.classList.remove('show');
  }, 2400);
}

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
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  setTheme('latte');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'mocha' ? 'latte' : 'mocha');
  });
}
// Copy magnet link / checksum handlers
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const copyText = btn.getAttribute('data-copy');
    const label = btn.getAttribute('data-copy-label') || 'Text';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(copyText);
      }
      showToast(`${label} copied to clipboard`);
    } catch {
      showToast(`${label} copied`);
    }
  });
});

// Category pills filter
filterPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    filterPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    const filterType = pill.getAttribute('data-filter');

    fileCards.forEach((card) => {
      const cardType = card.getAttribute('data-type');
      if (filterType === 'all' || cardType === filterType) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Verified-only toggle
if (verifiedToggle) {
  verifiedToggle.addEventListener('click', () => {
    const isPressed = verifiedToggle.getAttribute('aria-pressed') === 'true';
    const nextState = !isPressed;
    verifiedToggle.setAttribute('aria-pressed', String(nextState));

    fileCards.forEach((card) => {
      const isVerified = card.getAttribute('data-verified') === 'true';
      if (nextState && !isVerified) {
        card.style.display = 'none';
      } else {
        const activePill = document.querySelector('.filter-pill.active');
        const activeFilter = activePill ? activePill.getAttribute('data-filter') : 'all';
        const cardType = card.getAttribute('data-type');
        if (activeFilter === 'all' || cardType === activeFilter) {
          card.style.display = '';
        }
      }
    });

    showToast(nextState ? 'Showing verified swarms and hashes only' : 'Showing all file sources');
  });
}

// Sort dropdown simulation
if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    const sortVal = sortSelect.value;
    showToast(`Sorted by: ${sortSelect.options[sortSelect.selectedIndex].text}`);
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== searchInput) {
    event.preventDefault();
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  if (event.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.blur();
  }

  if (event.altKey && event.key.toLowerCase() === 't') {
    event.preventDefault();
    if (themeToggle) themeToggle.click();
  }
});

if (searchForm) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (searchInput) searchInput.blur();
  });
}
