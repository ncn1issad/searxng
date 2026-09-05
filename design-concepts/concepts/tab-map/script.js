const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('.search-form');
const sidebar = document.querySelector('#places-panel');
const sidebarToggle = document.querySelector('#sidebar-toggle');
const mapLayout = document.querySelector('#map-app');
const mapCanvas = document.querySelector('#map-canvas-container');
const worldLayer = document.querySelector('#map-world-layer');
const popover = document.querySelector('#map-popover');
const popoverClose = document.querySelector('#popover-close');
const popoverFocusCard = document.querySelector('#popover-focus-card');
const mobileToggle = document.querySelector('#mobile-view-toggle');
const searchAreaBtn = document.querySelector('#search-area-btn');
const zoomInBtn = document.querySelector('#zoom-in');
const zoomOutBtn = document.querySelector('#zoom-out');
const recenterBtn = document.querySelector('#recenter-btn');
const scaleLabel = document.querySelector('#scale-label');

const placeCards = Array.from(document.querySelectorAll('.place-card'));
const mapPins = Array.from(document.querySelectorAll('.map-pin'));
const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
const regionChips = Array.from(document.querySelectorAll('.region-chip'));
const layerBtns = Array.from(document.querySelectorAll('.layer-btn'));

// Theme handling
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

// Search shortcuts
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
    if (popover && !popover.classList.contains('hidden')) {
      hidePopover();
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

// Sidebar collapse toggle
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expand results pane' : 'Collapse results pane');
  });
}

// Map Transformation state (Pan & Zoom)
let scale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

function updateTransform(smooth = true) {
  if (smooth) {
    worldLayer.classList.remove('dragging');
  } else {
    worldLayer.classList.add('dragging');
  }
  worldLayer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  
  // Update scale bar label
  if (scaleLabel) {
    const km = Math.round(500 / scale);
    scaleLabel.textContent = `${km} km`;
  }
}

// Pan & Zoom gestures on map
mapCanvas.addEventListener('mousedown', (e) => {
  if (e.target.closest('.map-pin') || e.target.closest('.map-popover')) return;
  isDragging = true;
  startX = e.clientX - translateX;
  startY = e.clientY - translateY;
  mapCanvas.classList.add('grabbing');
  worldLayer.classList.add('dragging');
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  translateX = e.clientX - startX;
  translateY = e.clientY - startY;
  updateTransform(false);
});

window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  mapCanvas.classList.remove('grabbing');
  worldLayer.classList.remove('dragging');
});

mapCanvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
  const newScale = Math.min(Math.max(scale * zoomFactor, 0.9), 4.5);
  scale = newScale;
  updateTransform(true);
}, { passive: false });

// Zoom buttons
if (zoomInBtn) {
  zoomInBtn.addEventListener('click', () => {
    scale = Math.min(scale * 1.3, 4.5);
    updateTransform(true);
  });
}

if (zoomOutBtn) {
  zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(scale / 1.3, 0.9);
    updateTransform(true);
  });
}

if (recenterBtn) {
  recenterBtn.addEventListener('click', () => {
    resetToRegion('world');
  });
}

// Region Presets
const regions = {
  world: { scale: 1, x: 0, y: 0 },
  africa: { scale: 2.3, x: -280, y: -180 },
  asia: { scale: 2.5, x: -440, y: -100 },
  americas: { scale: 2.3, x: 80, y: -30 }
};

function resetToRegion(regionKey) {
  const target = regions[regionKey] || regions.world;
  scale = target.scale;
  translateX = target.x;
  translateY = target.y;
  updateTransform(true);

  regionChips.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === regionKey);
  });
}

regionChips.forEach(btn => {
  btn.addEventListener('click', () => {
    resetToRegion(btn.dataset.region);
  });
});

// Popover Logic
function showPopoverForPlace(placeCard) {
  if (!popover || !placeCard) return;
  const id = placeCard.dataset.id;
  const title = placeCard.querySelector('.place-title').textContent.trim();
  const address = placeCard.querySelector('.place-address').textContent.trim();
  const type = placeCard.querySelector('.place-type-badge').textContent.trim();
  const rating = placeCard.querySelector('.place-rating').textContent.trim();
  const reviews = placeCard.querySelector('.place-review-count').textContent.trim();
  const status = placeCard.querySelector('.place-status').textContent.trim();
  const dirLink = placeCard.querySelector('.action-btn.primary').getAttribute('href');

  popover.querySelector('.popover-badge').textContent = `#${id} · ${type}`;
  popover.querySelector('.popover-title').textContent = title;
  popover.querySelector('.popover-subtitle').textContent = address;
  popover.querySelector('.popover-meta .rating').textContent = `${rating} ${reviews}`;
  popover.querySelector('.popover-meta .status-open').textContent = status;
  popover.querySelector('.popover-btn.primary').setAttribute('href', dirLink);
  popover.classList.remove('hidden');
}

function hidePopover() {
  if (popover) {
    popover.classList.add('hidden');
  }
}

if (popoverClose) {
  popoverClose.addEventListener('click', hidePopover);
}

if (popoverFocusCard) {
  popoverFocusCard.addEventListener('click', () => {
    const activeCard = document.querySelector('.place-card.active');
    if (activeCard) {
      if (mapLayout && mapLayout.classList.contains('mobile-map-active')) {
        toggleMobileView(false);
      }
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      activeCard.focus();
    }
  });
}

// Active Place Synchronization
let currentActiveId = '1';

function setActivePlace(id, centerOnMap = false) {
  currentActiveId = String(id);

  // Update card styles
  let targetCard = null;
  placeCards.forEach(card => {
    const matches = card.dataset.id === currentActiveId;
    card.classList.toggle('active', matches);
    if (matches) targetCard = card;
  });

  // Update pin styles
  let targetPin = null;
  mapPins.forEach(pin => {
    const matches = pin.dataset.id === currentActiveId;
    pin.classList.toggle('active', matches);
    if (matches) targetPin = pin;
  });

  // Center map on pin if requested
  if (centerOnMap && targetPin) {
    const transformStr = targetPin.getAttribute('transform') || '';
    const match = transformStr.match(/translate\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
    if (match) {
      const pinX = parseFloat(match[1]);
      const pinY = parseFloat(match[2]);
      scale = Math.max(scale, 2.0);
      translateX = (500 - pinX) * scale;
      translateY = (280 - pinY) * scale;
      updateTransform(true);
    }
  }

  // Show popover
  if (targetCard) {
    showPopoverForPlace(targetCard);
  }
}

// Card click & keyboard selection
placeCards.forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.action-btn') || e.target.closest('a')) return;
    setActivePlace(card.dataset.id, true);
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        e.preventDefault();
        setActivePlace(card.dataset.id, true);
      }
    }
  });
});

// Pin clicks
mapPins.forEach(pin => {
  pin.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = pin.dataset.id;
    setActivePlace(id, false);
    
    // Scroll list to card
    const targetCard = placeCards.find(c => c.dataset.id === id);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
});

// Toggle details drawer on cards
document.querySelectorAll('.toggle-details-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.place-card');
    const details = card.querySelector('.place-expanded-details');
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!isExpanded));
    details.hidden = isExpanded;
  });
});

// Copy coordinates
document.querySelectorAll('.copy-coord-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const coords = btn.dataset.coords;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(coords);
      }
      const originalText = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg> Copied!`;
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = originalText;
      }, 1600);
    } catch {
      // Fallback
    }
  });
});

// Filter Chips
filterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;

    placeCards.forEach(card => {
      let matches = false;
      if (filter === 'all') matches = true;
      else if (filter === 'sanctuary' && card.dataset.category === 'sanctuary') matches = true;
      else if (filter === 'park' && card.dataset.category === 'park') matches = true;
      else if (filter === 'open' && card.dataset.open === 'true') matches = true;
      else if (filter === 'top-rated' && parseFloat(card.dataset.rating) >= 4.8) matches = true;

      card.style.display = matches ? 'grid' : 'none';

      // Match corresponding pin
      const pin = mapPins.find(p => p.dataset.id === card.dataset.id);
      if (pin) {
        pin.style.display = matches ? 'block' : 'none';
      }
    });
  });
});

// Layer Switcher
layerBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    layerBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.layer;
    if (mode === 'vector') {
      root.removeAttribute('data-layer-mode');
    } else {
      root.setAttribute('data-layer-mode', mode);
    }
  });
});

// Search this area simulated action
if (searchAreaBtn) {
  searchAreaBtn.addEventListener('click', () => {
    searchAreaBtn.classList.add('spinning');
    searchAreaBtn.querySelector('span').textContent = 'Searching area...';
    setTimeout(() => {
      searchAreaBtn.classList.remove('spinning');
      searchAreaBtn.querySelector('span').textContent = 'Area up to date';
      setTimeout(() => {
        searchAreaBtn.querySelector('span').textContent = 'Search this area';
      }, 1500);
    }, 650);
  });
}

// Mobile view toggle
function toggleMobileView(toActive) {
  if (!mapLayout || !mobileToggle) return;
  const isMapActive = toActive !== undefined ? toActive : !mapLayout.classList.contains('mobile-map-active');
  mapLayout.classList.toggle('mobile-map-active', isMapActive);
  const toggleText = mobileToggle.querySelector('.toggle-text');
  if (toggleText) {
    toggleText.textContent = isMapActive ? 'Show list' : 'Show map';
  }
}

if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    toggleMobileView();
  });
}

// Initial state setup
setActivePlace('1', false);
