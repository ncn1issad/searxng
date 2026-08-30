(() => {
  const root = document.documentElement;
  const toggle = document.querySelector(".theme-toggle");
  const icon = toggle.querySelector("span");
  const storedTheme = localStorage.getItem("searxng-concept-gallery-theme");
  const preferredTheme = matchMedia("(prefers-color-scheme: light)").matches ? "latte" : "mocha";

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    const isMocha = theme === "mocha";
    icon.textContent = isMocha ? "Latte" : "Mocha";
    toggle.setAttribute("aria-label", `Switch to ${isMocha ? "light" : "dark"} theme`);
  };

  applyTheme(storedTheme || preferredTheme);

  toggle.addEventListener("click", () => {
    const theme = root.dataset.theme === "mocha" ? "latte" : "mocha";
    localStorage.setItem("searxng-concept-gallery-theme", theme);
    applyTheme(theme);
  });
})();
