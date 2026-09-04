# Accessibility audit — WCAG 2.1 AA

Scope: `index.html` (portfolio), `modern-classroom-project/index.html` (employer variant),
`ClaudeProjects/index.html` (project index). The apps under `ClaudeProjects/*/` were not
audited. Audited 2026-09-04 with axe-core 4.10 (0 violations after fixes on all three pages),
a Playwright keyboard/screen-reader-semantics test, and a manual review.

## Fixed in this pass

| # | Criterion | Issue | Fix |
|---|---|---|---|
| 1 | 2.4.1 Bypass Blocks | No skip link; no `<main>` landmark; top bar was a `div` | Skip link, `<header>`, `<main>`, `<nav>` in footer, labelled sections |
| 2 | 1.3.1 Info and Relationships | "What I'm known for" and "Résumé" were `h3` under `h2` siblings; hero tags were spans | Promoted to `h2`; tags are a `<ul>` |
| 3 | 4.1.3 Status Messages | "Slide X of N" and the commentary bubble updated silently | Both are `aria-live="polite" aria-atomic="true"`; shared `#sr-status` region for tool/animation messages |
| 4 | 4.1.2 Name, Role, Value | Slideshows had no region/carousel semantics; arrows gave no end-of-strip state | `role="region" aria-roledescription="carousel"` with labels; `aria-disabled` on arrows at each end; Left/Right arrow keys |
| 5 | 4.1.2 / 2.1.1 | Enlargeable images were `<img role="button" tabindex="0">` with an `aria-label` that never updated after slide 1 | Real `<button class="zoom-btn">` wrapper; label refreshed on every slide |
| 6 | 2.1.1 / 2.1.2 / 2.4.3 | Lightbox zoom was click-only; Tab could leave the open dialog | "Zoom in / Zoom out" button; rest of page set `inert`; Tab trapped; focus restored on close; dialog named after the image |
| 7 | 2.2.2 Pause, Stop, Hide | Two looping GIFs (nav-bar micro-interaction, onboarding animation) with no way to stop them | "Pause animation" button on each; first-frame poster stills; starts paused under `prefers-reduced-motion` |
| 8 | 2.3.3 (AAA, honoured anyway) | Lottie scribble animated regardless of motion preference | Jumps to end state under reduced motion |
| 9 | 1.4.3 Contrast (Minimum) | `--ink-faint` (#8792A8) was 3.0:1 for 11–14px captions, eyebrows, footer note; projects index `--muted` was 3.3–3.9:1 | `#66718A` (4.7:1+) and `#8b92a3` (5.0:1+) |
| 10 | 1.4.11 Non-text Contrast | Doodle toolbar pressed state relied on a 1.15:1 tint | Pressed border uses `--pen` (6.5:1) |
| 11 | 1.4.1 Use of Color | Links in running text on the projects index were colour-only | Underlined; footer link restored to a visible link |
| 12 | 4.1.2 | Toolbar buttons named only by `title`; `role="toolbar"` without arrow-key movement | `aria-label` on each; Arrow/Home/End move focus; help text via `aria-describedby`; tool changes and "Drawing cleared" announced |
| 13 | 1.1.1 Non-text Content | Avatar in the speech bubble read as "Rahul Shah" with no context; arrow glyphs and emoji read aloud | Bubble wrapped in a group labelled "Rahul's commentary"; decorative glyphs `aria-hidden` |
| 14 | 3.2.5 / G201 | New-tab links gave no warning | Visually hidden "(opens in new tab)" |
| 15 | 2.4.7 Focus Visible | Focus ring on enlargeable images was clipped by `overflow:hidden` | Inset ring; explicit focus styles on project cards |
| 16 | — | Sticky top bar could cover a focused element after Tab | `scroll-padding-top` |

## Open items that need you

1. **Alt text for the slides is yours to sign off.** Every slide has a description, but they
   were written from the screenshots, not the source. Read them in `slideshows[...].alts` in
   both `index.html` files and correct anything that misstates what the screen shows.
2. **Résumé PDF metadata.** Both PDFs are tagged and have real text, but the document title is
   the Google Docs filename (`Rahul_Resume.docx` / `MCP_Resume.docx`). In Google Docs set
   File → Details / the document name to "Rahul Shah — Résumé" and re-export, then drop the
   PDF into both `assets/` and `modern-classroom-project/`. Also confirm in Acrobat's
   accessibility checker that the reading order and heading tags survived export.
3. **Flash check on the GIFs (2.3.1).** Neither GIF looks like it flashes more than three
   times a second, but only a tool like PEAT or a frame-by-frame look can confirm it. If you
   ever swap in a new GIF, re-check.
4. **Screen-reader pass on real hardware.** The semantics are verified in the DOM; the actual
   spoken experience should be checked with VoiceOver on Safari and NVDA on Chrome. Listen
   for: the carousel region name on entry, "Slide 2 of 4" followed by the commentary after
   Next, and the dialog name when enlarging an image.
5. **Text spacing (1.4.12) and 200% zoom (1.4.4).** Reflow at 320px passes with no horizontal
   scroll. Do a quick pass with a text-spacing bookmarklet and at 200% browser zoom on a
   real device to confirm the sticky notes and speech bubble do not clip.
6. **"View on GitHub" links to your profile**, not the Chiron repo. Not an accessibility
   issue, but a screen-reader user hears "View on GitHub" and lands somewhere unexpected.

## Out of scope this pass

- `ClaudeProjects/BudgetTracker`, `ClaudeProjects/GrindLog`, `ClaudeProjects/User State Map`.
  These are full apps with forms, modals and charts and each deserves its own audit.
- The freehand doodle feature cannot be made keyboard-operable; WCAG 2.1.1 exempts
  path-dependent input, and the site does not depend on it.
