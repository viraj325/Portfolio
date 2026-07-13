const legalConfig = window.PRESENCE_LEGAL_CONFIG;

document.querySelectorAll("[data-legal]").forEach((node) => {
  const value = legalConfig[node.dataset.legal];
  if (value) node.textContent = value;
});

document.querySelectorAll("[data-legal-email]").forEach((link) => {
  const unresolved = legalConfig.contactEmail.startsWith("[");
  link.textContent = legalConfig.contactEmail;
  link.href = unresolved ? "#legal-contact-placeholder" : `mailto:${legalConfig.contactEmail}`;
});

const unresolvedLegalValues = Object.entries(legalConfig)
  .filter(([, value]) => /^\[.+\]$/.test(value))
  .map(([key, value]) => `${key}: ${value}`);

if (unresolvedLegalValues.length) {
  console.warn(`Presence legal drafts contain unresolved configuration:\n${unresolvedLegalValues.join("\n")}`);
  document.querySelectorAll("[data-legal-warning]").forEach((node) => {
    node.hidden = false;
  });
}

const savedTheme = localStorage.getItem("presence-theme");
if (savedTheme === "light" || savedTheme === "dark") document.documentElement.dataset.theme = savedTheme;
const themeButton = document.querySelector("[data-theme-toggle]");
function activeTheme() {
  return document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function renderThemeButton() {
  const dark = activeTheme() === "dark";
  themeButton.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} appearance`);
  themeButton.innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}" aria-hidden="true"></i>`;
  if (window.lucide) window.lucide.createIcons({ nodes: [themeButton] });
}
themeButton?.addEventListener("click", () => {
  const next = activeTheme() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("presence-theme", next);
  renderThemeButton();
});
renderThemeButton();
if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
