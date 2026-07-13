const config = window.PRESENCE_CONFIG;
const productImages = window.PRESENCE_PRODUCT_IMAGES;

document.querySelectorAll("[data-product-visual]").forEach((slot) => {
  const key = slot.dataset.productVisual;
  const src = productImages[key];
  const ratio = slot.dataset.aspectRatio;
  if (ratio) slot.style.aspectRatio = ratio;

  if (src) {
    const image = document.createElement("img");
    image.src = src;
    image.alt = slot.dataset.alt || "Presence product screenshot";
    image.loading = slot.dataset.priority === "true" ? "eager" : "lazy";
    image.decoding = "async";
    slot.replaceChildren(image);
    slot.classList.add("has-image");
  } else {
    const label = document.createElement("span");
    label.className = "placeholder-label";
    label.textContent = slot.dataset.placeholderLabel || "Product image placeholder";
    const dimensions = document.createElement("small");
    dimensions.textContent = slot.dataset.placeholderRatio || ratio || "";
    slot.replaceChildren(label, dimensions);
  }
});

document.querySelectorAll("[data-config-link]").forEach((link) => {
  const key = link.dataset.configLink;
  link.href = config[key];
  if (key === "appStoreUrl") link.setAttribute("aria-label", `${link.textContent.trim()} — ${config.releaseStatus}`);
});
document.querySelectorAll("[data-contact-form]").forEach((form) => {
  form.action = config.contactFormEndpoint;
});
document.querySelectorAll("[data-compatibility]").forEach((node) => {
  node.textContent = config.compatibility;
});

const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const savedTheme = localStorage.getItem("presence-theme");
if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;

function currentTheme() {
  return root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function updateThemeButton() {
  const dark = currentTheme() === "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} appearance`);
  themeToggle.innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}" aria-hidden="true"></i>`;
  if (window.lucide) window.lucide.createIcons({ nodes: [themeToggle] });
}
document.querySelectorAll('[data-lucide="contactless"]').forEach((icon) => {
  icon.dataset.lucide = "radio";
});

themeToggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("presence-theme", next);
  updateThemeButton();
});
updateThemeButton();
if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });

const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
navToggle.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  navLinks.dataset.open = String(!open);
});
navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navToggle.setAttribute("aria-expanded", "false");
    navLinks.dataset.open = "false";
  }
});

if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}
