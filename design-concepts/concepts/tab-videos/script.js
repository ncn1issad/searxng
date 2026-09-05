const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('.search-form');
const filterDrawerBtn = document.querySelector('#toggle-filter-drawer');
const filterDrawer = document.querySelector('#filter-drawer');
const viewButtons = document.querySelectorAll('.view-btn');
const resultsContainer = document.querySelector('#video-results-container');
const loadMoreBtn = document.querySelector('#load-more-btn');

// Video modal elements
const videoModal = document.querySelector('#video-modal');
const modalIframe = document.querySelector('#modal-iframe');
const modalTitle = document.querySelector('#modal-video-title');
const modalChannelName = document.querySelector('#modal-channel-name');
const modalChannelIcon = document.querySelector('#modal-channel-icon');
const modalPlatform = document.querySelector('#modal-platform');
const modalStats = document.querySelector('#modal-stats');
const modalSourceLink = document.querySelector('#modal-source-link');
const modalCloseBtn = document.querySelector('#modal-close-btn');
const modalCopyBtn = document.querySelector('#modal-copy-btn');

// Theme management - matches concept 05
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

// View switch (Grid vs. List)
function setView(view) {
  resultsContainer.dataset.view = view;
  viewButtons.forEach(btn => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
  localStorage.setItem('searxng-video-view', view);
}

const savedView = localStorage.getItem('searxng-video-view');
if (savedView === 'grid' || savedView === 'list') {
  setView(savedView);
}

viewButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setView(btn.dataset.view);
  });
});

// Toggle Filter Drawer
if (filterDrawerBtn && filterDrawer) {
  filterDrawerBtn.addEventListener('click', () => {
    const isExpanded = filterDrawerBtn.getAttribute('aria-expanded') === 'true';
    filterDrawerBtn.setAttribute('aria-expanded', String(!isExpanded));
    filterDrawer.hidden = isExpanded;
  });
}

// Dropdown filters handling
document.querySelectorAll('.dropdown-filter').forEach(container => {
  const btn = container.querySelector('.filter-dropdown-btn');
  const menu = container.querySelector('.filter-menu');
  const valDisplay = container.querySelector('.filter-val');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close any other open dropdowns
    document.querySelectorAll('.filter-dropdown-btn').forEach(b => {
      if (b !== btn) {
        b.setAttribute('aria-expanded', 'false');
        if (b.nextElementSibling) b.nextElementSibling.hidden = true;
      }
    });

    btn.setAttribute('aria-expanded', String(!isOpen));
    menu.hidden = isOpen;
  });

  menu.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.querySelectorAll('li').forEach(li => {
        li.setAttribute('aria-selected', 'false');
      });
      item.setAttribute('aria-selected', 'true');
      valDisplay.textContent = item.dataset.value;
      btn.setAttribute('aria-expanded', 'false');
      menu.hidden = true;

      filterVideos();
    });
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.filter-dropdown-btn').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    if (btn.nextElementSibling) btn.nextElementSibling.hidden = true;
  });
});

// Drawer chips handling
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const group = chip.dataset.filterGroup;
    document.querySelectorAll(`.chip[data-filter-group="${group}"]`).forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    // Sync with dropdown if corresponding one exists
    const matchingDropdown = document.querySelector(`.dropdown-filter[data-filter="${group}"]`);
    if (matchingDropdown) {
      const valDisplay = matchingDropdown.querySelector('.filter-val');
      valDisplay.textContent = chip.dataset.val;
      const targetOption = matchingDropdown.querySelector(`li[data-value="${chip.dataset.val}"]`);
      if (targetOption) {
        matchingDropdown.querySelectorAll('li').forEach(li => li.setAttribute('aria-selected', 'false'));
        targetOption.setAttribute('aria-selected', 'true');
      }
    }

    filterVideos();
  });
});

function filterVideos() {
  const durationVal = document.querySelector('.dropdown-filter[data-filter="duration"] .filter-val')?.textContent.trim();
  const qualityVal = document.querySelector('.dropdown-filter[data-filter="quality"] .filter-val')?.textContent.trim();
  const sourceVal = document.querySelector('.dropdown-filter[data-filter="source"] .filter-val')?.textContent.trim();

  document.querySelectorAll('.video-card').forEach(card => {
    let match = true;
    if (durationVal && durationVal !== 'any' && card.dataset.duration !== durationVal) {
      match = false;
    }
    if (qualityVal && qualityVal !== 'all' && qualityVal !== 'any' && card.dataset.quality !== qualityVal) {
      match = false;
    }
    if (sourceVal && sourceVal !== 'all' && sourceVal !== 'any' && card.dataset.source !== sourceVal) {
      match = false;
    }
    card.style.display = match ? '' : 'none';
  });
}

// Modal video player
function openVideoModal(trigger) {
  const videoId = trigger.dataset.videoId || '5Mn9UkKwQZI';
  const title = trigger.dataset.title || 'Elephant documentary';
  const channel = trigger.dataset.channel || 'Channel';
  const platform = trigger.dataset.platform || 'YouTube';
  const views = trigger.dataset.views || '';
  const date = trigger.dataset.date || '';

  modalTitle.textContent = title;
  modalChannelName.textContent = channel;
  modalChannelIcon.textContent = channel.charAt(0).toUpperCase();
  modalPlatform.textContent = platform;
  modalStats.textContent = views ? `${views} · ${date}` : date;

  const url = platform.toLowerCase().includes('vimeo')
    ? `https://player.vimeo.com/video/${videoId}`
    : `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  modalIframe.src = url;
  modalSourceLink.href = platform.toLowerCase().includes('vimeo')
    ? `https://vimeo.com/${videoId}`
    : `https://www.youtube.com/watch?v=5Mn9UkKwQZI`;

  if (typeof videoModal.showModal === 'function') {
    videoModal.showModal();
  } else {
    videoModal.setAttribute('open', '');
  }
}

function closeVideoModal() {
  modalIframe.src = 'about:blank';
  if (typeof videoModal.close === 'function') {
    videoModal.close();
  } else {
    videoModal.removeAttribute('open');
  }
}

document.querySelectorAll('.play-trigger').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    openVideoModal(trigger);
  });
});

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeVideoModal);
}

if (videoModal) {
  videoModal.addEventListener('click', (event) => {
    const rect = videoModal.getBoundingClientRect();
    const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height
      && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
    if (!isInDialog) {
      closeVideoModal();
    }
  });

  videoModal.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeVideoModal();
  });
}

if (modalCopyBtn) {
  modalCopyBtn.addEventListener('click', () => {
    const targetUrl = modalSourceLink.href;
    navigator.clipboard.writeText(targetUrl).then(() => {
      const originalText = modalCopyBtn.textContent;
      modalCopyBtn.textContent = 'Copied!';
      setTimeout(() => {
        modalCopyBtn.textContent = originalText;
      }, 1800);
    });
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== searchInput && (!videoModal || !videoModal.open)) {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }

  if (event.key === 'Escape') {
    if (videoModal && videoModal.open) {
      closeVideoModal();
    } else if (document.activeElement === searchInput) {
      searchInput.blur();
    }
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

// Load more button demo
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => {
    loadMoreBtn.textContent = 'Loading more videos...';
    setTimeout(() => {
      loadMoreBtn.textContent = 'End of results';
      loadMoreBtn.disabled = true;
      loadMoreBtn.style.opacity = '0.6';
    }, 600);
  });
}
