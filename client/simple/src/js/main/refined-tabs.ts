// SPDX-License-Identifier: AGPL-3.0-or-later

const results = document.querySelector<HTMLElement>("#results.refined-tab");

// Set both dimensions explicitly: flex stretching can override aspect-ratio.
const trackArtObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const track = entry.target.closest<HTMLElement>(".refined-track");
    if (!(track && entry.target.getBoundingClientRect().height)) continue;
    const size = `${Math.ceil(entry.target.getBoundingClientRect().height)}px`;
    if (track.style.getPropertyValue("--track-art-size") !== size) {
      track.style.setProperty("--track-art-size", size);
    }
  }
});
const initializedTracks = new WeakSet<HTMLElement>();
function initializeTracks() {
  for (const track of document.querySelectorAll<HTMLElement>(".category-music .refined-track")) {
    if (initializedTracks.has(track)) continue;
    initializedTracks.add(track);
    const body = track.querySelector<HTMLElement>(".refined-track-body");
    if (body) trackArtObserver.observe(body);
    const details = track.querySelector<HTMLElement>(".refined-track-details");
    const button = track.querySelector<HTMLButtonElement>(".refined-media-button");
    const embed = track.querySelector<HTMLElement>(".refined-embed");
    const media = embed?.querySelector<HTMLIFrameElement | HTMLAudioElement>("iframe, audio");
    if (!(details && button && embed && media?.dataset.src)) continue;
    const buttonHome = button.parentElement;
    const buttonNextSibling = button.nextSibling;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const clearLoadTimeout = () => clearTimeout(timeout);
    const setPlayerVisible = (visible: boolean) => {
      clearLoadTimeout();
      const restoreFocus = document.activeElement === button;
      if (visible) track.insertBefore(button, embed);
      else buttonHome?.insertBefore(button, buttonNextSibling);
      details.hidden = visible;
      embed.hidden = !visible;
      if (restoreFocus) button.focus({ preventScroll: true });
      button.setAttribute("aria-expanded", String(visible));
      const label = button.querySelector("span");
      const text = visible ? button.dataset.btnTextNotCollapsed : button.dataset.btnTextCollapsed;
      if (label && text) label.textContent = text;
      if (visible) {
        // Cross-origin iframe error pages can fire load; the details button remains available.
        timeout = setTimeout(() => setPlayerVisible(false), 15_000);
        media.src = media.dataset.src || "";
      } else {
        if (media instanceof HTMLAudioElement) media.pause();
        media.removeAttribute("src");
        if (media instanceof HTMLAudioElement) media.load();
      }
    };
    media.addEventListener(media instanceof HTMLAudioElement ? "loadedmetadata" : "load", clearLoadTimeout);
    media.addEventListener("error", () => {
      if (!embed.hidden) setPlayerVisible(false);
    });
    media.title = body?.querySelector("h3")?.textContent?.trim() || "";
    button.addEventListener("click", () => setPlayerVisible(embed.hidden === true));
    setPlayerVisible(!embed.classList.contains("refined-youtube-embed"));
  }
}
initializeTracks();
if (results) new MutationObserver(initializeTracks).observe(results, { childList: true, subtree: true });

results?.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const viewButton = event.target.closest<HTMLButtonElement>("[data-video-view]");
  if (viewButton) {
    results.classList.toggle("video-list", viewButton.dataset.videoView === "list");
    for (const button of results.querySelectorAll("[data-video-view]")) {
      button.setAttribute("aria-pressed", String(button === viewButton));
    }
  }
});

// Keep the selected type when infinite scrolling appends another page.
let itType = "all";
function filterITResults() {
  if (!results?.classList.contains("category-it")) return;
  let visible = 0;
  for (const row of results.querySelectorAll<HTMLElement>("[data-it-type]")) {
    row.hidden = itType !== "all" && row.dataset.itType !== itType;
    if (!row.hidden) visible += 1;
  }
  const status = results.querySelector<HTMLElement>(".it-filter-status");
  if (status) status.hidden = visible > 0;
}
results?.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const selected = event.target.closest<HTMLButtonElement>("[data-it-filter]");
  if (!selected) return;
  itType = selected.dataset.itFilter || "all";
  for (const button of results.querySelectorAll("[data-it-filter]")) {
    button.setAttribute("aria-pressed", String(button === selected));
  }
  filterITResults();
});
const itRows = results?.classList.contains("category-it") ? results.querySelector("#urls") : null;
if (itRows) new MutationObserver(filterITResults).observe(itRows, { childList: true });

const preview = document.querySelector<HTMLElement>("#video-preview");
const player = preview?.querySelector<HTMLElement>(".video-preview-player");
const closeButton = preview?.querySelector<HTMLButtonElement>(".video-preview-close");
const mobile = window.matchMedia("(max-width: 767px)");
let activeTrigger: HTMLAnchorElement | null = null;
const inertBackground = new Set<HTMLElement>();

function syncPreviewMode() {
  const modal = preview !== null && !preview.hidden && mobile.matches;
  document.body.classList.toggle("video-preview-open", modal);
  for (const element of inertBackground) element.inert = false;
  inertBackground.clear();
  if (modal) {
    let ancestor: HTMLElement | null = preview;
    while (ancestor?.parentElement) {
      for (const sibling of ancestor.parentElement.children) {
        if (sibling instanceof HTMLElement && sibling !== ancestor && !sibling.inert) {
          sibling.inert = true;
          inertBackground.add(sibling);
        }
      }
      ancestor = ancestor.parentElement;
      if (ancestor === document.body) break;
    }
  }
  preview?.setAttribute("role", modal ? "dialog" : "region");
  if (modal) preview?.setAttribute("aria-modal", "true");
  else preview?.removeAttribute("aria-modal");
}

function closePreview() {
  if (!preview) return;
  player?.replaceChildren();
  preview.hidden = true;
  activeTrigger?.setAttribute("aria-expanded", "false");
  syncPreviewMode();
  activeTrigger?.focus({ preventScroll: true });
  activeTrigger = null;
}

results?.addEventListener("click", (event) => {
  if (!(event.target instanceof Element && preview && player)) return;
  const trigger = event.target.closest<HTMLAnchorElement>(".refined-video-trigger");
  if (!trigger || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const card = trigger.closest(".refined-video");
  const template = card?.querySelector<HTMLTemplateElement>(".refined-video-template");
  const frame = template?.content.querySelector("iframe")?.cloneNode(true) as HTMLIFrameElement | undefined;
  if (!frame?.dataset.src) return;
  event.preventDefault();
  activeTrigger?.setAttribute("aria-expanded", "false");
  activeTrigger = trigger;
  trigger.setAttribute("aria-controls", "video-preview");
  trigger.setAttribute("aria-expanded", "true");
  const title = card?.querySelector("h3")?.textContent?.trim() || "";
  preview.setAttribute("aria-label", title);
  frame.title = title;
  frame.src = frame.dataset.src;
  player.replaceChildren(frame);
  preview.hidden = false;
  syncPreviewMode();
  preview.scrollIntoView({ block: "start", behavior: "instant" });
  closeButton?.focus({ preventScroll: true });
});

closeButton?.addEventListener("click", closePreview);
mobile.addEventListener("change", syncPreviewMode);
document.addEventListener("keydown", (event) => {
  if (!preview || preview.hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closePreview();
  }
  if (event.key === "Tab" && mobile.matches) {
    const focusable = Array.from(preview.querySelectorAll<HTMLElement>("button, iframe, a[href]"));
    const [first] = focusable;
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
});

export {};
