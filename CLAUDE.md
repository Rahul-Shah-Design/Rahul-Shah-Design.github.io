# CLAUDE.md — Rahul Shah Vibe Coded Portfolio

This repo is a GitHub Pages portfolio of small tools and experiments vibe coded with Claude Code. The root `index.html` is the portfolio landing page that links out to individual projects.

## Repo Structure

```
/
├── index.html                  ← Portfolio landing page (edit this to add new projects)
├── CLAUDE.md                   ← This file
└── ClaudeProjects/
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
3. **Add a card** to `index.html` inside the `<main class="projects">` section. Copy an existing card and update:
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
- These are NOT added as cards to the main portfolio `index.html` — they're for direct-link sharing with a specific employer, not general browsing.
- Single-file HTML convention still applies (inline CSS/JS, no build step).

| Page | Folder | Built for |
|---|---|---|
| Modern Classrooms Project pitch | `modern-classroom-project/` | Application to Modern Classrooms Project |

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

## GitHub Pages

This site is served via GitHub Pages from the `main` branch root. The portfolio is live at:
`https://rahul-shah-design.github.io`

When working on a new project, develop on a `claude/...` branch and merge to `main` to deploy.
