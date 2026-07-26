(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-nav]");
  const productTabs = [...document.querySelectorAll("[data-product-tab]")];
  const productPanels = [...document.querySelectorAll("[data-product-panel]")];

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  const toggleMenu = () => {
    if (!menuToggle || !navigation) return;
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
    navigation.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);
  };

  menuToggle?.addEventListener("click", toggleMenu);

  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMenu();
  });

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const selectProduct = (productName, moveFocus = false) => {
    productTabs.forEach((tab) => {
      const isSelected = tab.dataset.productTab === productName;
      tab.classList.toggle("is-active", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      if (isSelected && moveFocus) tab.focus();
    });

    productPanels.forEach((panel) => {
      const isSelected = panel.dataset.productPanel === productName;
      panel.hidden = !isSelected;
      panel.classList.toggle("is-active", isSelected);
    });
  };

  productTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectProduct(tab.dataset.productTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % productTabs.length;
      if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + productTabs.length) % productTabs.length;
      }
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = productTabs.length - 1;

      selectProduct(productTabs[nextIndex].dataset.productTab, true);
    });
  });

  const revealItems = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  revealItems.forEach((item) => {
    const delay = Number(item.dataset.delay || 0);
    item.style.setProperty("--delay", `${delay}ms`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const yearTarget = document.querySelector("[data-year]");
  if (yearTarget) yearTarget.textContent = String(new Date().getFullYear());
})();
