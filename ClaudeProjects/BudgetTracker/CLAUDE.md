# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-file, vanilla JavaScript budget tracking SPA. The entire application lives in `budget-tracker.html` — no build process, no framework, no npm. Open the file in a browser to run it.

## Architecture

**Everything is in one file:** `budget-tracker.html` contains inline CSS (inside `<style>`), all markup, and inline JavaScript (inside `<script>`). There is no bundler, transpiler, or build step.

**State management:** A single global object `S` holds all application state. Every user action updates `S`, calls `persist()` to write to `localStorage` (key: `'bgt3'`), then calls the appropriate `render*()` function to update the DOM imperatively.

```
User Input → update S → persist() → render*()
```

**Views** are hidden/shown via toggling `.active` class:
- **Dashboard** — YTD stats and Chart.js bar/line chart
- **Budget Calculator** — Paycheck calculator with 2024 federal tax brackets
- **Month View** — Per-month transaction tables (expenses/incomes)
- **Settings** — Budget targets and paycheck defaults

**Key state shape:**
```javascript
S = {
  settings: { needsBudget, wantsBudget, savingsBudget, paycheckAmount, paycheckCount, startingSavings },
  months: { '[YEAR]-[MONTH]': { expenses: [{id, date, amount, desc, cat}], incomes: [{id, date, amount, desc}] } },
  calc: { salary, payfreq, k401pct, hsa, health, dental, vision, gtl, fedOverride, fedManual, stateDollar, localDollar, roth, otherPost, spNeeds, spWants, spSave, _monthlyNet }
}
```

**Budget categories:** Three buckets — Needs (blue `#4a90e2`), Wants (red `#e05c5c`), Savings (gold `#f0b429`). Expenses are tagged with `cat: 'needs'|'wants'|'savings'`.

**External dependencies (CDN only):**
- Chart.js 4.4.1 — dashboard dual-axis chart
- Google Fonts — DM Serif Display (headings), DM Sans (body)

## Key Functions

| Function | Purpose |
|---|---|
| `recalc()` | Recomputes all paycheck calculator fields live |
| `calcFed(taxableAnnual)` | 2024 federal tax bracket calculation |
| `recalcSplit()` | Updates Needs/Wants/Savings dollar amounts from percentages |
| `applyToTracker()` | Writes calculator output to `S.settings` |
| `renderDashboard()` | Renders YTD stat cards and chart |
| `renderChart()` | Builds/rebuilds the Chart.js instance |
| `renderMonth()` | Renders the selected month's transaction tables |
| `calcMonthTotals(y, m)` | Aggregates spending by category for a month |
| `switchView(id, el)` | Shows a view section, hides others |
| `persist()` | Serializes `S` to `localStorage['bgt3']` |
| `hydrate()` | Deserializes `S` from `localStorage['bgt3']` on load |

## CSS Conventions

All colors and fonts use CSS variables defined in `:root`. Dark theme throughout. Do not hardcode color hex values in new CSS — use the existing variables:

```css
--bg, --surface, --surface2, --border, --text, --muted
--needs, --wants, --savings, --accent, --green
--font-display, --font-body
```
