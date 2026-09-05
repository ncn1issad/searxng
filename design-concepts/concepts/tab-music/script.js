const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('.search-form');
const knowledgeToggle = document.querySelector('.knowledge-toggle');
const knowledgeExtra = document.querySelector('.knowledge-extra');
const lyricsToggleBtn = document.querySelector('.lyrics-toggle-btn');
const lyricsDrawer = document.querySelector('.lyrics-drawer');

// Theme management
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

// Artist info details toggle
if (knowledgeToggle && knowledgeExtra) {
  knowledgeToggle.addEventListener('click', () => {
    const expanded = knowledgeToggle.getAttribute('aria-expanded') === 'true';
    knowledgeToggle.setAttribute('aria-expanded', String(!expanded));
    const label = knowledgeToggle.querySelector('span');
    if (label) {
      label.textContent = expanded ? 'show artist details' : 'hide artist details';
    }
    knowledgeExtra.hidden = expanded;
  });
}

// Genius lyrics drawer toggle
if (lyricsToggleBtn && lyricsDrawer) {
  lyricsToggleBtn.addEventListener('click', () => {
    const expanded = lyricsToggleBtn.getAttribute('aria-expanded') === 'true';
    lyricsToggleBtn.setAttribute('aria-expanded', String(!expanded));
    const label = lyricsToggleBtn.querySelector('span');
    if (label) {
      label.textContent = expanded ? 'show full lyrics' : 'hide lyrics';
    }
    lyricsDrawer.hidden = expanded;
  });
}

// Lyrics jump buttons from tracks
document.querySelectorAll('.js-lyrics-jump').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const lyricsSection = document.querySelector('#lyrics-section');
    if (lyricsSection) {
      lyricsSection.scrollIntoView({ behavior: 'smooth' });
      if (lyricsDrawer && lyricsDrawer.hidden && lyricsToggleBtn) {
        lyricsToggleBtn.click();
      }
    }
  });
});

// Audio preview simulation & Sticky Player Bar
const stickyPlayer = document.querySelector('.sticky-player-bar');
const playerThumb = document.querySelector('.js-player-thumb');
const playerTitle = document.querySelector('.js-player-title');
const playerArtist = document.querySelector('.js-player-artist');
const playerCurrentTime = document.querySelector('.js-player-current-time');
const playerTotalTime = document.querySelector('.js-player-total-time');
const playerProgressFill = document.querySelector('.js-player-progress-fill');
const playerProgressBar = document.querySelector('.js-player-progress');
const playerToggleBtn = document.querySelector('.js-player-toggle');
const playerPrevBtn = document.querySelector('.js-player-prev');
const playerNextBtn = document.querySelector('.js-player-next');
const playerSourceBadge = document.querySelector('.js-player-source');
const playerCloseBtn = document.querySelector('.js-player-close');

const trackRows = Array.from(document.querySelectorAll('.track-row'));
let currentTrackIndex = 0;
let isPlaying = false;
let currentSeconds = 42;
let totalSeconds = 248;
let playbackInterval = null;

function parseSeconds(timeStr) {
  if (!timeStr) return 180;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 180;
}

function formatSeconds(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function loadTrack(index, autoPlay = true) {
  if (index < 0) index = trackRows.length - 1;
  if (index >= trackRows.length) index = 0;
  currentTrackIndex = index;

  trackRows.forEach((row, idx) => {
    row.classList.toggle('is-playing', idx === index && isPlaying);
  });

  const row = trackRows[index];
  if (!row) return;

  const title = row.dataset.title || 'Track';
  const artist = row.dataset.artist || 'Artist';
  const duration = row.dataset.duration || '3:30';
  const cover = row.dataset.cover || '';
  const source = row.dataset.source || 'Preview';

  playerTitle.textContent = title;
  playerArtist.textContent = artist;
  playerTotalTime.textContent = duration;
  playerThumb.src = cover;
  playerSourceBadge.textContent = source;

  totalSeconds = parseSeconds(duration);
  currentSeconds = 0;
  updateProgressUI();

  stickyPlayer.classList.remove('is-hidden');

  if (autoPlay) {
    startPlayback();
  }
}

function updateProgressUI() {
  playerCurrentTime.textContent = formatSeconds(currentSeconds);
  const percent = Math.min(100, Math.max(0, (currentSeconds / totalSeconds) * 100));
  playerProgressFill.style.width = `${percent}%`;
  playerProgressBar.setAttribute('aria-valuenow', Math.round(percent));
}

function startPlayback() {
  isPlaying = true;
  stickyPlayer.classList.add('playing');
  trackRows.forEach((row, idx) => {
    row.classList.toggle('is-playing', idx === currentTrackIndex);
  });

  clearInterval(playbackInterval);
  playbackInterval = setInterval(() => {
    currentSeconds += 1;
    if (currentSeconds >= totalSeconds) {
      loadTrack(currentTrackIndex + 1, true);
    } else {
      updateProgressUI();
    }
  }, 1000);
}

function pausePlayback() {
  isPlaying = false;
  stickyPlayer.classList.remove('playing');
  trackRows.forEach((row) => row.classList.remove('is-playing'));
  clearInterval(playbackInterval);
}

function togglePlayback() {
  if (isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

// Track row click events
trackRows.forEach((row, index) => {
  const playBtn = row.querySelector('.track-play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentTrackIndex === index && isPlaying) {
        pausePlayback();
      } else {
        loadTrack(index, true);
      }
    });
  }
});

// Hero play button
const heroPlayBtn = document.querySelector('.js-play-hero');
if (heroPlayBtn) {
  heroPlayBtn.addEventListener('click', () => {
    if (isPlaying && currentTrackIndex === 0) {
      pausePlayback();
    } else {
      loadTrack(0, true);
    }
  });
}

// External track play button (Bandcamp)
const externalPlayBtn = document.querySelector('.js-play-external');
if (externalPlayBtn) {
  externalPlayBtn.addEventListener('click', () => {
    playerTitle.textContent = externalPlayBtn.dataset.title;
    playerArtist.textContent = externalPlayBtn.dataset.artist;
    playerTotalTime.textContent = externalPlayBtn.dataset.duration;
    playerThumb.src = externalPlayBtn.dataset.cover;
    playerSourceBadge.textContent = externalPlayBtn.dataset.source;
    totalSeconds = parseSeconds(externalPlayBtn.dataset.duration);
    currentSeconds = 764; // 12:44
    updateProgressUI();
    stickyPlayer.classList.remove('is-hidden');
    togglePlayback();
  });
}

// Player bar buttons
playerToggleBtn.addEventListener('click', togglePlayback);
playerPrevBtn.addEventListener('click', () => loadTrack(currentTrackIndex - 1, true));
playerNextBtn.addEventListener('click', () => loadTrack(currentTrackIndex + 1, true));

playerCloseBtn.addEventListener('click', () => {
  pausePlayback();
  stickyPlayer.classList.add('is-hidden');
});

// Progress scrubbing
playerProgressBar.addEventListener('click', (e) => {
  const rect = playerProgressBar.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  currentSeconds = Math.floor(ratio * totalSeconds);
  updateProgressUI();
});

// Keyboard shortcuts
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

  if (event.code === 'Space' && document.activeElement !== searchInput && !['INPUT', 'BUTTON', 'A'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    togglePlayback();
  }
});

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  searchInput.blur();
});
