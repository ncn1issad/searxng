const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('.search-form');
const overviewToggle = document.querySelector('.overview-toggle');
const overviewSpecs = document.querySelector('.it-overview-specs');
const overviewLinks = document.querySelector('.it-overview-links');

// 1. Theme Management (Mocha <-> Latte)
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

// 2. Keyboard shortcuts
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

// 3. Subcategory Filter Pills (all it, repos, packages, code, qa, wikis)
const subcatPills = document.querySelectorAll('.subcat-pill');
const resultItems = document.querySelectorAll('.it-result');
const reposPack = document.querySelector('.repos-pack');
const packagesPack = document.querySelector('.packages-pack');

subcatPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    subcatPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');

    const filter = pill.dataset.filter;

    resultItems.forEach((item) => {
      const itemType = item.dataset.type;
      if (filter === 'all' || itemType === filter) {
        item.classList.remove('is-hidden');
      } else {
        item.classList.add('is-hidden');
      }
    });

    if (reposPack) {
      reposPack.style.display = (filter === 'all' || filter === 'repos') ? '' : 'none';
    }
    if (packagesPack) {
      packagesPack.style.display = (filter === 'all' || filter === 'packages') ? '' : 'none';
    }
  });
});

// 4. One-Click Copy functionality for commands and code
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const textToCopy = btn.dataset.copy;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Copied!</span>
      `;
      btn.style.borderColor = 'var(--green)';
      btn.style.color = 'var(--green)';

      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 1800);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  });
});

// 5. Install Tabs in Developer Overview
const installTabs = document.querySelectorAll('.install-tab');
const installCmd = document.querySelector('.install-cmd');
const overviewCopyBtn = document.querySelector('.install-strip .copy-btn');

installTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    installTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    const cmd = tab.dataset.cmd;
    if (installCmd && cmd) {
      installCmd.textContent = cmd;
    }
    if (overviewCopyBtn && cmd) {
      overviewCopyBtn.dataset.copy = cmd;
    }
  });
});

// 6. Overview expand / collapse
if (overviewToggle && overviewSpecs) {
  overviewToggle.addEventListener('click', () => {
    const isExpanded = overviewToggle.getAttribute('aria-expanded') === 'true';
    overviewToggle.setAttribute('aria-expanded', String(!isExpanded));
    overviewToggle.querySelector('span').textContent = isExpanded ? 'show details' : 'hide details';
    overviewSpecs.style.display = isExpanded ? 'none' : 'flex';
    if (overviewLinks) {
      overviewLinks.style.display = isExpanded ? 'none' : 'flex';
    }
  });
}

// 7. Code snippet expand toggles
document.querySelectorAll('.code-expand-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const isExpanded = btn.dataset.expanded === 'true';
    btn.dataset.expanded = String(!isExpanded);
    btn.textContent = isExpanded ? 'Show 16 more lines ⌄' : 'Collapse snippet ⌃';
  });
});
