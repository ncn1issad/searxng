(function () {
  'use strict';

  const root = document.documentElement;
  const stageContainer = document.querySelector('.stage-container');
  const searchInput = document.querySelector('#search-input');
  const themeSelect = document.querySelector('#theme-select');
  const viewportButtons = document.querySelectorAll('[data-viewport]');
  const scenarioButtons = document.querySelectorAll('[data-scenario]');
  const queryChips = document.querySelectorAll('[data-query]');
  const answerCards = document.querySelectorAll('.answer-card');
  const searchResultContext = document.querySelector('.web-result-context');

  // Theme Handling
  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (themeSelect) themeSelect.value = theme;
    localStorage.setItem('searxng-answers-concept-theme', theme);
  }

  const savedTheme = localStorage.getItem('searxng-answers-concept-theme') || 'mocha';
  applyTheme(savedTheme);

  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      applyTheme(e.target.value);
    });
  }

  // Viewport Switcher
  viewportButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      viewportButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.viewport;
      if (mode === 'mobile') {
        stageContainer.classList.add('mode-mobile');
      } else {
        stageContainer.classList.remove('mode-mobile');
      }
    });
  });

  // Scenario Switcher
  function setScenario(scenario, queryText) {
    scenarioButtons.forEach((btn) => {
      if (btn.dataset.scenario === scenario) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    queryChips.forEach((chip) => {
      if (chip.dataset.scenario === scenario) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    if (queryText && searchInput) {
      searchInput.value = queryText;
    }

    answerCards.forEach((card) => {
      const cardType = card.dataset.cardType;
      if (scenario === 'all' || cardType === scenario) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    // Update the reference search result title & snippet based on scenario
    if (searchResultContext) {
      const titleEl = searchResultContext.querySelector('h3 a');
      const snippetEl = searchResultContext.querySelector('p');
      const urlTextEl = searchResultContext.querySelector('.url-header span');

      if (scenario === 'weather') {
        titleEl.textContent = 'Bucharest 10-Day Weather Forecast - AccuWeather';
        snippetEl.textContent = 'Get the local and 10-day weather forecast for Bucharest, Romania including highs, precipitation radar, and air quality metrics.';
        urlTextEl.textContent = 'accuweather.com › ro › bucharest › weather';
      } else if (scenario === 'translation') {
        titleEl.textContent = 'Elephant in Romanian - English-Romanian Dictionary';
        snippetEl.textContent = 'Translation of elephant in Romanian: elefant (substantiv masculin). Includes declensions, example phrases, and synonyms.';
        urlTextEl.textContent = 'dexonline.ro › definitie › elefant';
      } else if (scenario === 'units') {
        titleEl.textContent = 'Kilometers to Miles Conversion Calculator';
        snippetEl.textContent = 'Convert km to mi easily. 1 kilometer is equal to 0.62137119 miles. Formula: miles = km * 0.621371.';
        urlTextEl.textContent = 'calculator.net › conversion › km-to-miles';
      } else {
        titleEl.textContent = 'General Search Results Overview';
        snippetEl.textContent = 'Standard SearXNG organic web results display directly beneath instant answers with clean Catppuccin typography.';
        urlTextEl.textContent = 'searxng.org › docs › instant-answers';
      }
    }
  }

  scenarioButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const scenario = btn.dataset.scenario;
      let queryText = 'elephants';
      if (scenario === 'weather') queryText = 'weather bucharest';
      if (scenario === 'translation') queryText = 'translate elephant to romanian';
      if (scenario === 'units') queryText = '42 km to miles';
      if (scenario === 'all') queryText = 'searxng instant answers';
      setScenario(scenario, queryText);
    });
  });

  queryChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const scenario = chip.dataset.scenario;
      const query = chip.dataset.query;
      setScenario(scenario, query);
    });
  });

  // Copy to Clipboard Buttons
  document.querySelectorAll('[data-copy-text]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.dataset.copyText;
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const originalHtml = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = `<svg viewBox="0 0 24 24" style="width:13px;height:13px"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.classList.remove('copied');
        }, 1500);
      });
    });
  });

  // Keyboard shortcut: '/' focuses search input
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });
})();
