const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('.search-form');

// Theme Switcher
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

// Spotlight Expandable Details
const spotlightToggle = document.querySelector('.spotlight-toggle');
const spotlightCollapsible = document.querySelector('.spotlight-collapsible');

if (spotlightToggle && spotlightCollapsible) {
  spotlightToggle.addEventListener('click', () => {
    const isExpanded = spotlightToggle.getAttribute('aria-expanded') === 'true';
    spotlightToggle.setAttribute('aria-expanded', String(!isExpanded));
    spotlightCollapsible.hidden = isExpanded;
    const labelSpan = spotlightToggle.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent = isExpanded ? 'show details' : 'hide details';
    }
  });
}

// Thread Expand/Collapse
const threadToggleBtn = document.querySelector('.thread-toggle-btn');
const threadExtended = document.querySelector('.thread-extended');

if (threadToggleBtn && threadExtended) {
  threadToggleBtn.addEventListener('click', () => {
    const isExpanded = threadToggleBtn.getAttribute('aria-expanded') === 'true';
    threadToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    threadExtended.hidden = isExpanded;
    const textSpan = threadToggleBtn.querySelector('.toggle-text');
    if (textSpan) {
      textSpan.textContent = isExpanded ? 'show full thread (2 more posts)' : 'hide additional posts';
    }
  });
}

// Dropdown Filters
const dropdownWrappers = document.querySelectorAll('.dropdown-wrapper');
dropdownWrappers.forEach((wrapper) => {
  const button = wrapper.querySelector('.filter-pill');
  const menu = wrapper.querySelector('.dropdown-menu');
  if (!button || !menu) return;

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    
    // Close other dropdowns
    dropdownWrappers.forEach((other) => {
      const otherBtn = other.querySelector('.filter-pill');
      const otherMenu = other.querySelector('.dropdown-menu');
      if (otherBtn && otherMenu) {
        otherBtn.setAttribute('aria-expanded', 'false');
        otherMenu.hidden = true;
      }
    });

    button.setAttribute('aria-expanded', String(!isOpen));
    menu.hidden = isOpen;
  });

  menu.querySelectorAll('.dropdown-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.querySelectorAll('.dropdown-item').forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      const pillValue = button.querySelector('.pill-value');
      if (pillValue) {
        pillValue.textContent = item.textContent.trim();
      }

      button.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    });
  });
});

document.addEventListener('click', () => {
  dropdownWrappers.forEach((wrapper) => {
    const button = wrapper.querySelector('.filter-pill');
    const menu = wrapper.querySelector('.dropdown-menu');
    if (button && menu) {
      button.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }
  });
});

// Interactive Engagement Actions (Like, Boost, Bookmark)
function parseCount(text) {
  const clean = text.trim().toLowerCase();
  if (clean.endsWith('k')) {
    return Math.round(parseFloat(clean) * 1000);
  }
  return parseInt(clean.replace(/,/g, ''), 10) || 0;
}

function formatCount(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return String(num);
}

document.querySelectorAll('.engagement-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    const countSpan = pill.querySelector('.metric-count');
    if (!countSpan) return;

    const isActive = pill.classList.toggle('active');
    let current = parseCount(countSpan.textContent);
    current += isActive ? 1 : -1;
    countSpan.textContent = formatCount(current);
  });
});

// Forum Upvote / Downvote
document.querySelectorAll('.vote-widget').forEach((widget) => {
  const upBtn = widget.querySelector('.vote-up');
  const downBtn = widget.querySelector('.vote-down');
  const scoreSpan = widget.querySelector('.vote-score');
  if (!upBtn || !downBtn || !scoreSpan) return;

  const baseScore = parseCount(scoreSpan.textContent);

  function updateScore(voteState) {
    let score = baseScore;
    if (voteState === 1) score += 1;
    if (voteState === -1) score -= 1;
    scoreSpan.textContent = formatCount(score);

    scoreSpan.classList.toggle('voted-up', voteState === 1);
    scoreSpan.classList.toggle('voted-down', voteState === -1);
    upBtn.classList.toggle('active', voteState === 1);
    downBtn.classList.toggle('active', voteState === -1);
  }

  let currentVote = 0; // 0: none, 1: up, -1: down

  upBtn.addEventListener('click', () => {
    currentVote = currentVote === 1 ? 0 : 1;
    updateScore(currentVote);
  });

  downBtn.addEventListener('click', () => {
    currentVote = currentVote === -1 ? 0 : -1;
    updateScore(currentVote);
  });
});
