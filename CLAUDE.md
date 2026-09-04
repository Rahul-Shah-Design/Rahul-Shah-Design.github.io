# CLAUDE.md — Rahul Shah Vibe Coded Portfolio

This repo is a GitHub Pages site with two halves: a **design portfolio** at the root, and a
collection of small tools and experiments vibe coded with Claude Code under `ClaudeProjects/`.

The root `index.html` is the design portfolio — case studies, craft polaroids, résumé. The
vibe-coded projects have their own index at `ClaudeProjects/index.html`, which is deliberately
**not linked from anywhere**; it is reachable only by typing the URL.

## Repo Structure

```
/
├── index.html                  ← Design portfolio (the page people are sent to)
├── assets/                     ← Images, résumé and Lottie bundle for the root page
├── CLAUDE.md                   ← This file
├── tools/build-artifact.py     ← Builds a CSP-safe Artifact preview of any page
├── modern-classroom-project/   ← Employer-tailored variant of the root page
└── ClaudeProjects/
    ├── index.html              ← Unlinked card grid of the vibe-coded projects
    ├── BudgetTracker/
    │   ├── budget-tracker.html
    │   └── CLAUDE.md
    └── User State Map/
        ├── state-map.html
        └── process-states.py
```

## How to Add a New Project

1. **Create a folder** inside `ClaudeProjects/` named after the project (PascalCase, no spaces preferred).
2. **Build the project** inside that folder. Single-file HTML apps are the default — no build step, no npm, just a `.html` file that opens in the browser.
3. **Add a card** to `ClaudeProjects/index.html` inside the `<main class="projects">` section — *not*
   to the root `index.html`, which is the design portfolio. `href`s there are relative to
   `ClaudeProjects/`, so a card points at `BudgetTracker/budget-tracker.html`, not
   `ClaudeProjects/BudgetTracker/...`. Copy an existing card and update:
   - `href` — path to the project's HTML file
   - `--card-accent` — a hex color for the top border hover accent
   - `card-icon` — an emoji that fits the project
   - `card-title` — short project name
   - `card-tag` — one-word category label (e.g. Finance, Visualization, Tool, Game)
   - `card-desc` — 1–2 sentence description of what it does
4. **Add a `CLAUDE.md`** inside the project folder documenting its architecture (see the BudgetTracker one as a reference).

## Project Conventions

- **Single-file HTML** is the default. Put CSS in `<style>` and JS in `<script>` in the same `.html` file.
- **No build tools.** No npm, no bundler, no framework. Vanilla JS only unless there is a strong reason to use a CDN library.
- **CDN libraries** are fine (Chart.js, D3, Leaflet, etc.) — load them from a CDN in `<script src>`.
- **Dark theme** with CSS variables is preferred to match the portfolio aesthetic, but light-themed projects are fine too.
- **localStorage** for persistence where needed — keep the key namespaced to the project (e.g. `'bgt3'` for budget tracker).
- **Mobile-friendly** — use `<meta name="viewport">` and make layouts responsive.

## Existing Projects

| Project | Folder | Description |
|---|---|---|
| Budget Tracker | `ClaudeProjects/BudgetTracker/` | Single-file budgeting SPA with paycheck calculator and YTD dashboard |
| User State Map | `ClaudeProjects/User State Map/` | Interactive US map of college destination flows by state |

## Employer-Specific Portfolio Pages

Some pages are tailored portfolios built for a specific job application, not general vibe-coded projects. These live at the **repo root** (not under `ClaudeProjects/`) so the URL is short and memorable, e.g. `rahul-shah-design.github.io/modern-classroom-project`.

- **Folder name** = URL slug, kebab-case, named after the employer/role (e.g. `modern-classroom-project/`).
- **`index.html`** inside that folder is the page — GitHub Pages serves folder/`index.html` at `/folder-name`.
- These are for direct-link sharing with a specific employer, not general browsing, so nothing links to them.
- Single-file HTML convention still applies (inline CSS/JS, no build step).

| Page | Folder | Built for |
|---|---|---|
| Modern Classrooms Project pitch | `modern-classroom-project/` | Application to Modern Classrooms Project |

The root `index.html` and `modern-classroom-project/index.html` share a design: the root page is the
general-audience version, the employer page is that same page with a "Prepared for" logo lockup and
copy angled at one role. They are **separate files with separate asset copies** — the root page reads
from `assets/`, the employer page from its own folder — so retargeting copy for one employer can never
silently rewrite the page everyone else sees. The cost is that a swapped image (a new résumé, a new
screenshot) has to be dropped in both places; check the other folder whenever you replace an asset.

## Previewing a Page as a Claude Artifact

Design iteration happens in a Claude Artifact, which previews far faster than
waiting on a Pages deploy. An Artifact renders under a CSP that blocks **every**
external host, so it cannot use relative image paths or the Google Fonts `<link>`
that the deployed page relies on.

**Never hand-maintain a second copy for this.** That copy drifts, and the drift is
invisible until it is published — a swapped asset breaks only in the Artifact, and
missing `@font-face` rules silently fall back to Georgia, so design decisions get
made against type the live page never uses. Both happened before this was automated.

Generate it instead:

```
python3 tools/build-artifact.py                    # -> build/<page>.artifact.html
python3 tools/build-artifact.py --page some-dir --out /tmp/x.html
python3 tools/build-artifact.py --page . --out build/portfolio.artifact.html   # the root page
```

The script treats `<page>/index.html` as the single source of truth and inlines
every font, image, script and PDF as a `data:` URI, then **verifies** the result —
it refuses to write a file that still holds an external URL, an un-inlined local
asset (in markup *or* in a JS array), or leftover `<html>`/`<body>` scaffolding.

Consequences for page code:

- Write the page for **deployment**: relative paths, normal `<link>` to Google Fonts.
- Any logic that inspects an asset URL must accept both forms, since the build
  turns `"x.gif"` into `"data:image/gif;base64,…"`. Match on
  `/(?:\.gif$|^data:image\/gif)/i`, not on the extension alone.
- `build/` and `.artifact-cache/` are gitignored. Fonts are cached on first run so
  later builds need no network; the build is byte-for-byte reproducible.

## Accessibility Conventions (root page and employer pages)

The portfolio pages were audited against WCAG 2.1 AA in September 2026; `ACCESSIBILITY.md`
holds the audit record and the open items. Keep these conventions when editing them:

- **Landmarks and headings.** `<header>` (top bar), one `<main id="main">`, `<footer>`. Every
  `<section>` gets `aria-labelledby` pointing at its heading. Case-study titles are `h2`;
  do not skip heading levels.
- **Skip link** is the first tab stop and targets `#main`. Keep it first in `<body>`.
- **Anything that updates in place is a live region.** The "Slide X of N" caption and the
  commentary bubble carry `aria-live="polite" aria-atomic="true"`. Short status messages
  (tool changes, animation pause/play) go through `announce()`, which writes to the hidden
  `#sr-status` region. Only write text that actually changed, or it gets re-announced.
- **Slideshows** are `role="region" aria-roledescription="carousel"` with an `aria-label`.
  Prev/Next use `aria-disabled` at the ends (never `disabled`, which would drop focus).
  Left/Right arrow keys navigate anywhere inside the region.
- **Enlargeable images** are `<img>` inside a real `<button class="zoom-btn">`; the button's
  `aria-label` is updated in `render()` alongside the alt. The lightbox is `role="dialog"
  aria-modal="true"`, makes the rest of the page `inert`, traps Tab, and returns focus on close.
- **Animated GIFs need a still.** Every GIF has a first-frame poster (`*-poster.webp`, made by
  drawing the GIF onto a canvas) and a "Pause animation" button. One page-wide preference
  drives all of them and starts paused under `prefers-reduced-motion`. The Lottie scribble
  jumps to its end state under reduced motion instead of drawing in.
- **Contrast.** Text needs 4.5:1; UI state indicators need 3:1. `--ink-faint` is the
  lightest text colour allowed on paper or the grid. The doodle toolbar's pressed state is
  carried by the `--pen` border, not the tint.
- **Links that open a new tab** carry a visually hidden " (opens in new tab)" span. Arrow
  glyphs that decorate a link are `aria-hidden`.
- The freehand drawing feature is pointer-only by nature (the WCAG 2.1.1 path-dependent
  exception); the toolbar itself is fully keyboard operable and announces tool changes.

## GitHub Pages

This site is served via GitHub Pages from the `main` branch root. The portfolio is live at:
`https://rahul-shah-design.github.io`

When working on a new project, develop on a `claude/...` branch and merge to `main` to deploy.
