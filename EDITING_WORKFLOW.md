# Editing Workflow (Single Source of Truth)

To prevent recurring merge conflicts, this repo now uses **one direction only**:

- `index.html` is the single source of truth for page markup.
- `assets/styles/main.css` is the single source of truth for styles.
- `assets/js/main.js` is the single source of truth for behavior.

Do not re-introduce duplicated section partials or generator scripts unless we also adopt a full build pipeline.
