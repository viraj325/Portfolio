# Presence marketing site

A dependency-free, responsive marketing site grounded in the native Presence app's warm stone, gold, olive, amber, and clay visual language.

The active homepage is a screenshot-free editorial redesign. The previous screenshot-slot layout remains available at `/index-old.html` with its original CSS and JavaScript preserved.

## Run locally

```sh
npm run dev
```

Open `http://localhost:4173/` after running the command inside this directory.

## Validate and build

```sh
npm run check
npm run build
```

The production-ready static output is written to `dist/`.

## Legal drafts

Privacy Policy and Terms & Conditions are available at `/privacy/` and `/terms/`. Complete every value in `PRESENCE_LEGAL_CONFIG` inside `config.js` before publication. Validation and builds intentionally print a warning while legal placeholders remain unresolved. These drafts require review by the developer and a qualified attorney before release.

## Contact form

The homepage contact form posts to FormSubmit and delivers submissions to `viraj13_2000@yahoo.com`. Submit the form once after deployment, then approve FormSubmit's one-time activation email in that inbox. Until activation is confirmed, normal visitor submissions will not be forwarded.

## Configure links

Update `config.js` when App Store, privacy, support, or contact destinations are available. Placeholder destinations are intentionally used until real URLs are known.

## Legacy product images

The active redesign does not use screenshots or product-image placeholders. The image configuration below is retained only for `/index-old.html`.

- `heroIPhone`: iPhone portrait, 9:19.5
- `heroIPad`: iPad landscape, 4:3
- `meScreen`, `fitnessScreen`, `workScreen`, `travelScreen`, `mindScreen`: feature screenshots, 16:10
- `iPhoneNavigation`: iPhone portrait, 9:19.5
- `iPadNavigation`: iPad landscape, 4:3
- `widgets`: widget collection, 16:10
- `openGraph`: reserved for a future real social-sharing image; it is not emitted while null
