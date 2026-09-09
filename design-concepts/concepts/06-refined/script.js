const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector(".search-form");
const knowledgeToggle = document.querySelector(".knowledge-toggle");
const knowledgeExtra = document.querySelector(".knowledge-extra");

function setTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === "mocha";
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }
  localStorage.setItem("searxng-concept-theme", theme);
}

const savedTheme = localStorage.getItem("searxng-concept-theme");
if (savedTheme === "latte" || savedTheme === "mocha") {
  setTheme(savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
  setTheme("latte");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(root.dataset.theme === "mocha" ? "latte" : "mocha");
  });
}

if (knowledgeToggle && knowledgeExtra) {
  knowledgeToggle.addEventListener("click", () => {
    const expanded = knowledgeToggle.getAttribute("aria-expanded") === "true";
    knowledgeToggle.setAttribute("aria-expanded", String(!expanded));
    const label = knowledgeToggle.querySelector("span");
    if (label) label.textContent = expanded ? "show details" : "hide details";
    knowledgeExtra.hidden = expanded;
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== searchInput) {
    event.preventDefault();
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  if (event.key === "Escape" && document.activeElement === searchInput) {
    searchInput.blur();
  }

  if (event.altKey && event.key.toLowerCase() === "t" && themeToggle) {
    event.preventDefault();
    themeToggle.click();
  }
});

if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (searchInput) searchInput.blur();
  });
}

/* Ensure active category tab is scrolled into view on mobile */
const activeNav = document.querySelector(".category-nav .active");
if (activeNav) {
  try {
    activeNav.scrollIntoView({ inline: "nearest", block: "nearest" });
  } catch (err) {}
}

/* Generic dropdown toggles for filter menus */
document.querySelectorAll(".dropdown-wrapper").forEach(wrapper => {
  const btn = wrapper.querySelector("[aria-haspopup]");
  const menu = wrapper.querySelector("[hidden]") || wrapper.querySelector(".dropdown-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = btn.getAttribute("aria-expanded") === "true";
    // Close other dropdowns
    document.querySelectorAll(".dropdown-wrapper").forEach(w => {
      if (w !== wrapper) {
        const b = w.querySelector("[aria-haspopup]");
        const m = w.querySelector(".dropdown-menu, [role=\"listbox\"]");
        if (b) b.setAttribute("aria-expanded", "false");
        if (m) m.hidden = true;
      }
    });
    btn.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
  });

  menu.addEventListener("click", (e) => {
    const item = e.target.closest("button, li");
    if (!item) return;
    menu.querySelectorAll(".active, [aria-selected=\"true\"]").forEach(el => {
      el.classList.remove("active");
      if (el.setAttribute) el.setAttribute("aria-selected", "false");
    });
    item.classList.add("active");
    if (item.setAttribute) item.setAttribute("aria-selected", "true");
    const valEl = btn.querySelector(".pill-value, .filter-val, .value-text");
    if (valEl) valEl.textContent = item.textContent.trim();
    btn.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  });

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      btn.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }
  });
});

/* Collapsible sections */
document.querySelectorAll("[data-collapse-toggle]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.collapseToggle);
    if (!target) return;
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    target.hidden = expanded;
    const label = btn.querySelector("span") || btn;
    const collapsedText = btn.dataset.collapsedText || "show details";
    const expandedText = btn.dataset.expandedText || "hide details";
    if (btn.dataset.collapsedText || btn.dataset.expandedText) {
      label.textContent = expanded ? collapsedText : expandedText;
    } else if (label.textContent.includes("details")) {
      label.textContent = expanded ? "show details" : "hide details";
    }
  });
});

/* Copy button helper */
document.querySelectorAll("[data-copy-text]").forEach(btn => {
  btn.addEventListener("click", () => {
    const text = btn.dataset.copyText;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = "copied";
      setTimeout(() => { btn.textContent = orig; }, 1400);
    });
  });
});

/* Citation modal handling */
const citeModal = document.querySelector("#cite-modal");
if (citeModal) {
  const modalText = citeModal.querySelector("#cite-text");
  const tabs = citeModal.querySelectorAll(".modal-tab");
  const copyBtn = citeModal.querySelector("#cite-copy-btn");
  let currentCitations = {};

  document.querySelectorAll("[data-cite-btn]").forEach(btn => {
    btn.addEventListener("click", () => {
      try {
        currentCitations = JSON.parse(btn.dataset.citations || "{}");
      } catch (e) {
        currentCitations = {};
      }
      const activeTab = citeModal.querySelector(".modal-tab.active");
      const format = activeTab ? activeTab.dataset.format : "apa";
      if (modalText) {
        modalText.textContent = currentCitations[format] || btn.dataset.citeFallback || "";
      }
      citeModal.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const format = tab.dataset.format;
      if (modalText && currentCitations[format]) {
        modalText.textContent = currentCitations[format];
      }
    });
  });

  if (copyBtn && modalText) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(modalText.textContent.trim()).then(() => {
        const orig = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(() => { copyBtn.textContent = orig; }, 1600);
      });
    });
  }

  citeModal.querySelectorAll("[data-modal-close]").forEach(closeBtn => {
    closeBtn.addEventListener("click", () => {
      citeModal.hidden = true;
      document.body.style.overflow = "";
    });
  });

  citeModal.addEventListener("click", (e) => {
    if (e.target === citeModal) {
      citeModal.hidden = true;
      document.body.style.overflow = "";
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !citeModal.hidden) {
      citeModal.hidden = true;
      document.body.style.overflow = "";
    }
  });
}

/* Music inline playback preview toggle */
document.querySelectorAll("[data-preview-toggle]").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.previewToggle;
    const playerRow = document.getElementById(targetId);
    if (!playerRow) return;
    const isOpen = btn.getAttribute("aria-expanded") === "true";

    document.querySelectorAll("[data-preview-toggle]").forEach(otherBtn => {
      if (otherBtn !== btn) {
        otherBtn.setAttribute("aria-expanded", "false");
        const otherId = otherBtn.dataset.previewToggle;
        const otherRow = document.getElementById(otherId);
        if (otherRow) otherRow.hidden = true;
        const span = otherBtn.querySelector("span");
        if (span) span.textContent = "preview";
      }
    });

    btn.setAttribute("aria-expanded", String(!isOpen));
    playerRow.hidden = isOpen;
    const span = btn.querySelector("span");
    if (span) span.textContent = isOpen ? "preview" : "close";
  });
});
