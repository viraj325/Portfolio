# Presence legal redesign — design QA

**Comparison Target**

- Source visual truth: `/tmp/presence-home-final-1440x1000.png` — the active Presence homepage and its established warm-stone, gold, serif-led editorial design language.
- Rendered implementations:
  - `/tmp/presence-privacy-compare-1440x1000.png`
  - `/tmp/presence-terms-final-1440x1000.png`
  - `/tmp/presence-privacy-desktop-dark.png`
  - `/tmp/presence-privacy-mobile-light.png`
- Routes: `http://localhost:4173/`, `http://localhost:4173/privacy/`, and `http://localhost:4173/terms/`.
- Desktop CSS viewport override: `1440 × 1000`; focused browser captures are `1440 × 681` pixels because the Chrome host exposed a 681-pixel visible capture surface. Source and implementation captures use the same width, visible height, browser, and 1× horizontal pixel density.
- Full-page evidence captured at the same 1440-pixel CSS width:
  - Homepage: `/tmp/presence-home-desktop.png`, `1440 × 7870`
  - Privacy: `/tmp/presence-privacy-desktop-light.png`, `1440 × 6039`
  - Terms: `/tmp/presence-terms-desktop-light.png`, `1440 × 7066`
- Mobile CSS viewport override: `390 × 844`; the focused host capture is `390 × 185` pixels at 1× width density. DOM geometry was checked across the full CSS viewport: document width `390`, main and navigation width `360`, no horizontal overflow, single-column contents list, and a `40 × 40` appearance control.
- States compared: desktop light, desktop dark, and mobile light. The legal pages intentionally use a different information architecture from the marketing homepage, so the comparison evaluates shared visual tone and system fidelity rather than one-to-one section placement.

**Findings**

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: passed. The legal pages use the same Iowan/Palatino/Georgia display stack, restrained sans-serif body hierarchy, compact uppercase eyebrows, and optical weight contrast as the active homepage. Long legal copy remains readable with controlled line length and line height.
- Spacing and layout rhythm: passed. The wide editorial hero, ruled section transitions, rounded contents rail, section spacing, and dark footer preserve the homepage rhythm without forcing marketing-page composition onto legal content. Desktop and mobile checks showed no overlap, clipping, or horizontal overflow.
- Colors and visual tokens: passed. The pages reuse the active `--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--gold`, `--amber`, and dark-mode tokens. The light and dark captures retain clear foreground/background separation.
- Image quality and asset fidelity: passed. The existing Presence app icon is reused at native scale; Lucide supplies the visible interface icons. No screenshots, placeholder artwork, CSS drawings, emoji, or handcrafted SVG substitutes were introduced.
- Copy and content: passed. Name, email, and July 26, 2026 are resolved; the contact block has no mailing address; both documents cover users of all ages subject to locally required guardian permission; the terms do not designate a governing jurisdiction; draft and placeholder language is absent.
- Icons and controls: passed. Brand, legal-title, back, and appearance icons use the same icon family and sizing treatment. The appearance control changes its accessible label and visual state correctly.
- Accessibility and responsiveness: passed. Skip links and semantic legal navigation remain present, the mobile back link has an explicit accessible name, the appearance control is uniquely labelled, and the mobile pages do not overflow.

**Focused Region Comparison**

- Header and hero were compared together in one image input using the final homepage and final Privacy captures at the same desktop width. The legal header now matches the homepage’s circular appearance control, quiet border, brand scale, stone background, and restrained gold accent.
- Privacy and Terms above-the-fold captures were compared together in one image input. Title scale, summary width, effective-date pill, icon treatment, divider position, and contents/article split are consistent across both legal routes.
- The dark Privacy capture verifies the same hierarchy and token mapping in the alternate appearance.

**Comparison History**

1. First pass — `[P2]` the legal appearance button rendered as an unstyled square while the homepage used a circular icon button.
   - Fix: added the shared `icon-button` class to both legal appearance controls.
   - Post-fix evidence: `/tmp/presence-privacy-compare-1440x1000.png` and `/tmp/presence-terms-final-1440x1000.png`.
2. First mobile pass — `[P2]` hiding the “Back to Presence” text left the icon-only link without an accessible name.
   - Fix: added `aria-label="Back to Presence"` on both legal back links.
   - Post-fix evidence: final DOM snapshots report the accessible name while the 390-pixel layout remains overflow-free.
3. Content consistency pass — `[P2]` the Terms contents rail still said “Governing law” while the section and requested policy use neutral “Applicable law” language.
   - Fix: renamed the contents entry to “Applicable law” and verified the document states that no specific governing jurisdiction is designated.
   - Post-fix evidence: final Terms DOM audit reports `Applicable law`, all-ages eligibility, and the neutral-jurisdiction language.

**Primary Interactions Tested**

- Light-to-dark and dark-to-light appearance switching.
- Appearance-control accessible label update.
- Legal navigation, contents anchors, and related-page anchors through the project validator.
- Desktop and mobile responsive layout.
- Console errors checked on the rendered Terms route: none.

**Implementation Checklist**

- [x] Match the active Presence design system.
- [x] Resolve legal identity, email, and effective date.
- [x] Remove mailing address, jurisdiction placeholder, age restriction, draft notices, and unresolved link placeholders.
- [x] Verify light, dark, desktop, and mobile states.
- [x] Run validation, production build, and whitespace checks.

**Open Questions**

- None.

**Follow-up Polish**

- No blocking polish remains. A future accessibility pass could increase the shared 40-pixel icon control to a 44-pixel mobile tap target across the homepage and legal pages together.

final result: passed
