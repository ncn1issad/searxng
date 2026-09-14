// SPDX-License-Identifier: AGPL-3.0-or-later

// Render desktop single-select menus as HTML listboxes so the OS theme cannot
// override their colors. Keep the original select for forms and no-JS use.
let dismissPopup: (() => void) | undefined;

const openPopup = (select: HTMLSelectElement): void => {
  dismissPopup?.();
  const popup = select.cloneNode(true) as HTMLSelectElement;
  popup.removeAttribute("id");
  popup.removeAttribute("name");
  popup.removeAttribute("required");
  popup.removeAttribute("autofocus");
  popup.className = "theme-select-popup";
  popup.size = Math.max(2, Math.min(10, select.options.length));
  popup.selectedIndex = select.selectedIndex;
  popup.setAttribute("popover", "auto");
  if (!(popup.hasAttribute("aria-label") || popup.hasAttribute("aria-labelledby"))) {
    popup.setAttribute("aria-label", select.labels?.[0]?.textContent?.trim() || select.name);
  }
  document.body.append(popup);
  popup.showPopover();

  const bounds = select.getBoundingClientRect();
  const height = Math.min(popup.offsetHeight, window.innerHeight - 16);
  const width = Math.min(Math.max(bounds.width, popup.scrollWidth), window.innerWidth - 16);
  popup.style.width = `${width}px`;
  popup.style.maxHeight = `${height}px`;
  popup.style.left = `${Math.max(8, Math.min(bounds.left, window.innerWidth - width - 8))}px`;
  popup.style.top = `${Math.max(8, bounds.bottom + height <= window.innerHeight - 8 ? bounds.bottom : bounds.top - height)}px`;

  const events = new AbortController();
  const close = (restoreFocus = false): void => {
    events.abort();
    popup.remove();
    dismissPopup = undefined;
    if (restoreFocus) select.focus();
  };
  dismissPopup = close;
  const commit = (): void => {
    const changed = select.selectedIndex !== popup.selectedIndex;
    select.selectedIndex = popup.selectedIndex;
    close(true);
    if (changed) {
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };
  popup.addEventListener(
    "click",
    (event) => {
      if (event.target instanceof HTMLOptionElement && !event.target.disabled) commit();
    },
    { signal: events.signal }
  );
  popup.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        commit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      } else if (event.key === "Tab") {
        event.preventDefault();
        commit();
        const controls = Array.from(
          document.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, [tabindex]")
        ).filter(
          (element) => element.tabIndex >= 0 && !element.matches(":disabled") && element.getClientRects().length > 0
        );
        controls.sort((a, b) => (a.tabIndex || Number.POSITIVE_INFINITY) - (b.tabIndex || Number.POSITIVE_INFINITY));
        controls[controls.indexOf(select) + (event.shiftKey ? -1 : 1)]?.focus();
      }
    },
    { signal: events.signal }
  );
  popup.addEventListener(
    "toggle",
    () => {
      if (!popup.matches(":popover-open")) close();
    },
    { signal: events.signal }
  );
  window.addEventListener("resize", () => close(), { signal: events.signal });
  document.addEventListener(
    "scroll",
    (event) => {
      if (event.target !== popup) close();
    },
    { capture: true, signal: events.signal }
  );
  popup.focus({ preventScroll: true });
};

const menuSelect = (target: EventTarget | null): HTMLSelectElement | undefined => {
  if (target instanceof HTMLSelectElement && !target.multiple && target.size <= 1 && !target.disabled) return target;
  return undefined;
};

if ("showPopover" in HTMLElement.prototype) {
  document.addEventListener("mousedown", (event) => {
    const select = menuSelect(event.target);
    if (!select || event.button !== 0) return;
    event.preventDefault();
  });
  document.addEventListener("click", (event) => {
    const select = menuSelect(event.target);
    if (!select) return;
    event.preventDefault();
    openPopup(select);
  });
  document.addEventListener("keydown", (event) => {
    const select = menuSelect(event.target);
    if (!(select && ["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key))) return;
    event.preventDefault();
    openPopup(select);
  });
}

export {};
