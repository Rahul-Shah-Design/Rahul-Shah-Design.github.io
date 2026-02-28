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

## GitHub Pages

This site is served via GitHub Pages from the `main` branch root. The portfolio is live at:
`https://rahul-shah-design.github.io`

When working on a new project, develop on a `claude/...` branch and merge to `main` to deploy.
