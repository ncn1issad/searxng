const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const searchInput = document.querySelector('#search-input');
const searchForm = document.querySelector('.search-form');
const knowledgeToggle = document.querySelector('.knowledge-toggle');
const knowledgeExtra = document.querySelector('.knowledge-extra');
const toggleFilterPanelBtn = document.querySelector('#toggle-filter-panel');
const advancedFilterPanel = document.querySelector('#advanced-filters');
const citeModal = document.querySelector('#cite-modal');
const closeCiteModalBtn = document.querySelector('#close-cite-modal');
const citationTextBox = document.querySelector('#citation-text-box');
const copyCitationBtn = document.querySelector('#copy-citation-btn');
const copyBtnText = document.querySelector('#copy-btn-text');
const downloadBibLink = document.querySelector('#download-bib-link');
const toast = document.querySelector('#toast');

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

// Knowledge card expandable details
if (knowledgeToggle && knowledgeExtra) {
  knowledgeToggle.addEventListener('click', () => {
    const expanded = knowledgeToggle.getAttribute('aria-expanded') === 'true';
    knowledgeToggle.setAttribute('aria-expanded', String(!expanded));
    knowledgeToggle.querySelector('span').textContent = expanded
      ? 'show research details & taxonomy'
      : 'hide research details & taxonomy';
    knowledgeExtra.hidden = expanded;
  });
}

// Advanced filter panel toggle
if (toggleFilterPanelBtn && advancedFilterPanel) {
  toggleFilterPanelBtn.addEventListener('click', () => {
    const expanded = toggleFilterPanelBtn.getAttribute('aria-expanded') === 'true';
    toggleFilterPanelBtn.setAttribute('aria-expanded', String(!expanded));
    advancedFilterPanel.hidden = expanded;
  });
}

// Dropdowns (Time and Sort)
document.querySelectorAll('.dropdown').forEach((dropdown) => {
  const trigger = dropdown.querySelector('.dropdown-trigger');
  const menu = dropdown.querySelector('.dropdown-menu');
  if (!trigger || !menu) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    // Close any other open dropdowns
    document.querySelectorAll('.dropdown-trigger').forEach((t) => {
      t.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.dropdown-menu').forEach((m) => {
      m.hidden = true;
    });

    if (!isOpen) {
      trigger.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    }
  });

  menu.querySelectorAll('.dropdown-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.querySelectorAll('.dropdown-item').forEach((i) => i.classList.remove('active'));
      item.classList.add('active');
      trigger.querySelector('span:first-child').textContent = item.textContent.toLowerCase();
      trigger.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    });
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown-trigger').forEach((t) => {
    t.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.dropdown-menu').forEach((m) => {
    m.hidden = true;
  });
});

// Filter pills (Open access, PDF only)
document.querySelectorAll('.filter-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    const pressed = pill.getAttribute('aria-pressed') === 'true';
    pill.setAttribute('aria-pressed', String(!pressed));
    showToast(`Filter: ${pill.textContent.trim()} ${!pressed ? 'enabled' : 'disabled'}`);
  });
});

// Abstract toggles
document.querySelectorAll('.abstract-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const box = toggle.closest('.abstract-box');
    const full = box.querySelector('.abstract-full');
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.querySelector('span:first-child').textContent = expanded ? 'expand abstract' : 'collapse abstract';
    full.hidden = expanded;
  });
});

// Copy DOI buttons
document.querySelectorAll('.copy-doi-btn').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const doi = btn.dataset.doi;
    try {
      await navigator.clipboard.writeText(doi);
      showToast(`Copied DOI: ${doi}`);
    } catch {
      showToast(`DOI: ${doi}`);
    }
  });
});

// Save / Bookmark paper buttons
document.querySelectorAll('.save-paper-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('saved');
    const isSaved = btn.classList.contains('saved');
    btn.setAttribute('aria-label', isSaved ? 'Remove from library' : 'Save to library');
    showToast(isSaved ? 'Paper saved to personal library' : 'Paper removed from library');
  });
});

// Toast notification helper
let toastTimeout;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

// Paper citation database for modal
const citations = {
  plotnik2006: {
    title: 'Self-recognition in an Asian elephant',
    authors: 'Plotnik, J. M., de Waal, F. B. M., & Reiss, D.',
    year: '2006',
    journal: 'Proceedings of the National Academy of Sciences',
    volume: '103',
    issue: '45',
    pages: '17053-17057',
    doi: '10.1073/pnas.0608062103',
    apa: 'Plotnik, J. M., de Waal, F. B. M., & Reiss, D. (2006). Self-recognition in an Asian elephant. Proceedings of the National Academy of Sciences, 103(45), 17053–17057. https://doi.org/10.1073/pnas.0608062103',
    chicago: 'Plotnik, Joshua M., Frans B. M. de Waal, and Diana Reiss. 2006. "Self-recognition in an Asian Elephant." Proceedings of the National Academy of Sciences 103 (45): 17053–17057. https://doi.org/10.1073/pnas.0608062103.',
    bibtex: `@article{plotnik2006self,
  title={Self-recognition in an Asian elephant},
  author={Plotnik, Joshua M and de Waal, Frans BM and Reiss, Diana},
  journal={Proceedings of the National Academy of Sciences},
  volume={103},
  number={45},
  pages={17053--17057},
  year={2006},
  publisher={National Acad Sciences},
  doi={10.1073/pnas.0608062103}
}`
  },
  oconnell2021: {
    title: 'African elephants detect seismic ground waves generated by infrasonic vocalizations',
    apa: "O'Connell-Rodwell, C. E., Pettigrew, J. D., Hart, T. C., & Wittemyer, G. (2021). African elephants detect seismic ground waves generated by infrasonic vocalizations. The Journal of the Acoustical Society of America, 150(3), 1845–1858. https://doi.org/10.1121/10.0006240",
    chicago: 'O\'Connell-Rodwell, Caitlin E., John D. Pettigrew, Timothy C. Hart, and George Wittemyer. 2021. "African Elephants Detect Seismic Ground Waves Generated by Infrasonic Vocalizations." The Journal of the Acoustical Society of America 150 (3): 1845–1858.',
    bibtex: `@article{oconnell2021african,
  title={African elephants detect seismic ground waves generated by infrasonic vocalizations},
  author={O'Connell-Rodwell, Caitlin E and Pettigrew, John D and Hart, Timothy C and Wittemyer, George},
  journal={The Journal of the Acoustical Society of America},
  volume={150},
  number={3},
  pages={1845--1858},
  year={2021},
  publisher={Acoustical Society of America},
  doi={10.1121/10.0006240}
}`
  },
  pardo2023: {
    title: 'African elephants address one another with individually specific name-like vocal labels',
    apa: 'Pardo, M. A., Poole, D., Granli, P., Poole, J. H., & Wittemyer, G. (2023). African elephants address one another with individually specific name-like vocal labels. arXiv preprint arXiv:2310.04521.',
    chicago: 'Pardo, Michael A., David Poole, Petter Granli, Joyce H. Poole, and George Wittemyer. 2023. "African Elephants Address One Another with Individually Specific Name-like Vocal Labels." arXiv preprint arXiv:2310.04521.',
    bibtex: `@article{pardo2023african,
  title={African elephants address one another with individually specific name-like vocal labels},
  author={Pardo, Michael A and Poole, David and Granli, Petter and Poole, Joyce H and Wittemyer, George},
  journal={arXiv preprint arXiv:2310.04521},
  year={2023},
  doi={10.48550/arXiv.2310.04521}
}`
  },
  abegglen2022: {
    title: 'Genomic mechanisms of cancer resistance and longevity in the elephant lineage',
    apa: 'Abegglen, L. M., Caulin, A. F., Chan, A., Lee, K. B., & Schiffman, J. D. (2022). Genomic mechanisms of cancer resistance and longevity in the elephant lineage. Nature Communications, 13, 3981. https://doi.org/10.1038/s41467-022-31742-1',
    chicago: 'Abegglen, Lisa M., Anthony F. Caulin, Amy Chan, Kathryn B. Lee, and Joshua D. Schiffman. 2022. "Genomic Mechanisms of Cancer Resistance and Longevity in the Elephant Lineage." Nature Communications 13: 3981.',
    bibtex: `@article{abegglen2022genomic,
  title={Genomic mechanisms of cancer resistance and longevity in the elephant lineage},
  author={Abegglen, Lisa M and Caulin, Anthony F and Chan, Amy and Lee, Kathryn B and Schiffman, Joshua D},
  journal={Nature Communications},
  volume={13},
  pages={3981},
  year={2022},
  publisher={Nature Publishing Group},
  doi={10.1038/s41467-022-31742-1}
}`
  },
  douglashamilton2020: {
    title: 'Continental-scale fragmentation of African elephant corridors mapped by satellite telemetry',
    apa: 'Douglas-Hamilton, I., Walli, W., Rasmussen, H., & Wittemyer, G. (2020). Continental-scale fragmentation of African elephant corridors mapped by satellite telemetry. Current Biology, 30(18), 3624–3632. https://doi.org/10.1016/j.cub.2020.07.036',
    chicago: 'Douglas-Hamilton, Iain, Walli Walli, Henrik Rasmussen, and George Wittemyer. 2020. "Continental-scale Fragmentation of African Elephant Corridors Mapped by Satellite Telemetry." Current Biology 30 (18): 3624–3632.',
    bibtex: `@article{douglashamilton2020continental,
  title={Continental-scale fragmentation of African elephant corridors mapped by satellite telemetry},
  author={Douglas-Hamilton, Iain and Walli, Walli and Rasmussen, Henrik and Wittemyer, George},
  journal={Current Biology},
  volume={30},
  number={18},
  pages={3624--3632},
  year={2020},
  publisher={Elsevier},
  doi={10.1016/j.cub.2020.07.036}
}`
  },
  bates2021: {
    title: 'The cognitive ethology of the Proboscidea: A systematic review of memory, sociality, and tool use in elephants',
    apa: 'Bates, L. A., & Byrne, R. W. (2021). The cognitive ethology of the Proboscidea: A systematic review of memory, sociality, and tool use in elephants. Mammal Review, 51(2), 142–159. https://doi.org/10.1111/mam.12229',
    chicago: 'Bates, Lucy A., and Richard W. Byrne. 2021. "The Cognitive Ethology of the Proboscidea: A Systematic Review of Memory, Sociality, and Tool Use in Elephants." Mammal Review 51 (2): 142–159.',
    bibtex: `@article{bates2021cognitive,
  title={The cognitive ethology of the Proboscidea: A systematic review of memory, sociality, and tool use in elephants},
  author={Bates, Lucy A and Byrne, Richard W},
  journal={Mammal Review},
  volume={51},
  number={2},
  pages={142--159},
  year={2021},
  publisher={Wiley Online Library},
  doi={10.1111/mam.12229}
}`
  }
};

let activeCitationId = 'plotnik2006';
let activeCiteFormat = 'apa';

function updateCitationContent() {
  const data = citations[activeCitationId] || citations.plotnik2006;
  let text = data[activeCiteFormat] || data.apa;
  citationTextBox.textContent = text;
  copyBtnText.textContent = `Copy ${activeCiteFormat.toUpperCase()}`;

  // Update download link
  const bibBlob = new Blob([data.bibtex], { type: 'text/plain' });
  downloadBibLink.href = URL.createObjectURL(bibBlob);
  downloadBibLink.download = `${activeCitationId}.bib`;
}

// Cite button click handlers
document.querySelectorAll('.cite-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const paperId = btn.dataset.paper || 'plotnik2006';
    activeCitationId = paperId;
    updateCitationContent();
    citeModal.hidden = false;
  });
});

// Cite tab switching
document.querySelectorAll('.cite-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cite-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    activeCiteFormat = tab.dataset.tab;
    updateCitationContent();
  });
});

// Close cite modal
if (closeCiteModalBtn) {
  closeCiteModalBtn.addEventListener('click', () => {
    citeModal.hidden = true;
  });
}

if (citeModal) {
  citeModal.addEventListener('click', (e) => {
    if (e.target === citeModal) {
      citeModal.hidden = true;
    }
  });
}

// Copy citation text
if (copyCitationBtn) {
  copyCitationBtn.addEventListener('click', async () => {
    const textToCopy = citationTextBox.textContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      copyBtnText.textContent = 'Copied!';
      setTimeout(() => {
        copyBtnText.textContent = `Copy ${activeCiteFormat.toUpperCase()}`;
      }, 1800);
      showToast('Citation copied to clipboard');
    } catch {
      showToast('Unable to access clipboard');
    }
  });
}

// Global Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== searchInput && !citeModal.hidden) {
    return;
  }

  if (event.key === '/' && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }

  if (event.key === 'Escape') {
    if (!citeModal.hidden) {
      citeModal.hidden = true;
      return;
    }
    if (document.activeElement === searchInput) {
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
