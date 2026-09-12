// SPDX-License-Identifier: AGPL-3.0-or-later

const results = document.querySelector<HTMLElement>("#results.refined-tab");
results?.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const viewButton = event.target.closest<HTMLButtonElement>("[data-video-view]");
  if (viewButton) {
    results.classList.toggle("video-list", viewButton.dataset.videoView === "list");
    for (const button of results.querySelectorAll("[data-video-view]")) {
      button.setAttribute("aria-pressed", String(button === viewButton));
    }
  }
  const mediaButton = event.target.closest<HTMLButtonElement>(".refined-media-button");
  if (mediaButton) {
    mediaButton.setAttribute("aria-expanded", String(mediaButton.getAttribute("aria-expanded") !== "true"));
  }
});

export {};
