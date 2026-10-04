# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-file, vanilla JavaScript geography quiz game. The entire application lives in
`atlas-run.html` — no build process, no framework, no npm. Open the file in a browser to run it.

The player picks a region, a game mode, and a round length, then works through countries on an
interactive world map. Misses are re-queued a few slots ahead so they come back around later in
the same round instead of at the very end.

## Architecture

**Everything is in one file:** `atlas-run.html` contains inline CSS, markup, and inline
JavaScript (IIFE inside a single `<script>`). Country geometry lives in a `<script id="md"
type="application/json">` block (`MD`) — pre-projected SVG path data plus bounding boxes and
label centroids per country, so no runtime geo-projection math is needed. That JSON block is one
very long line and dominates the file size; treat it as a data asset, not code to hand-edit.

**No persistence.** Unlike BudgetTracker/GrindLog, this game keeps no `localStorage` state —
every round starts fresh, nothing is saved between visits.

**Flow:** `setup` → `play` → `results`, toggled via `show(id)` which hides/shows the three
`<section>`s.

```
Setup (region + mode + length) → G.start() → G.next() per question → G.answer() → G.finish() → results
```

**Game modes** (`MODES`, configurable per round, or `mixed` picks randomly per question):
- **pick** — a country is highlighted on the map; choose its name from four options.
- **find** — given a name; tap the matching country on the map.
- **type** — a country is highlighted; type its name (fuzzy-matched, see below).

**Map rendering (`MapV`):** D3 (CDN, `d3.min.js` v7) renders `MD`'s pre-computed SVG paths and
handles pan/zoom (`d3.zoom`). `MapV.build(scope)` draws all countries for the chosen region;
countries outside the current scope get an `.out` class (dimmed, non-interactive). Small
countries also get an invisible larger `circle.hit` hit-target so they're tappable at low zoom.
`MapV.fit()` animates the viewport to a bounding box — used both to frame the current question
and, on a miss, to reframe around the correct answer plus whatever the player tapped.

**Phone map height:** below 700px wide the map is `clamp(220px,38vh,420px)`, kept short so the
highlighted country and the "type it" text box both stay visible above the iOS keyboard. A map that
grew to fill the screen was tried and made this worse: the country is framed at the map's centre,
which scrolled off the top when the keyboard opened, and Next ended up below the fold.
**"Type it" keeps the keyboard up for the whole round (`#play.type`):** one `#ti` input is reused
across questions and never disabled or replaced (either would close the iOS keyboard). After an
answer, the Check button turns into Next and Return advances; feedback replaces the prompt in
the top line, which reserves three lines so the card never changes height. Taps on buttons and the
map are intercepted while `#ti` has focus (`keepTyping`: cancel the touchend/mousedown default,
then click the button ourselves). The input is focused synchronously in `G.next()` so the Start or
Next tap itself opens the keyboard. On phones the map is sized so map + card fit in the window
above the keyboard and iOS's form toolbar (which a web page cannot hide): `100dvh − safe-area −
600px`, tuned on a 402×874 iPhone where it gives ~212px and leaves the card ~10pt clear of the toolbar (iOS does not scroll the page when the keyboard opens, so it all has to fit as laid out).

**"Find it" on phones (`#play.find`):** the layout flips so the map and buttons are in thumb reach:
question card on top, then the map, then an `.actions` row holding "I don't know" and Next, which
`G.next()` moves there from the card (and back for other modes or desktop). The play screen fills
the viewport and the map takes what's left, capped at 4:5; spare height goes above the map. The
card's `.status` box reserves room for a three-line feedback message and the hint is hidden on
answer, so nothing moves when you answer. In mixed rounds the map's size changes between
questions, so `MapV.fit()` re-reads it before framing.

**Answer checking:**
- `pick`/`find` compare object identity against the country record.
- `type` runs input through `judge()`: normalizes the string (`norm()` strips accents/diacritics,
  lowercases, expands `St.`→`saint`), checks it against every country's canonical name plus an
  `ALT` alias table (e.g. `"uk"`, `"burma"`, `"drc"`), and allows a small Levenshtein distance
  (`tol()`: 0 for short names, 1–2 for longer ones) so minor typos still pass.

**Scoring:** `G.firstTry` counts questions answered correctly with zero prior misses; that's the
score shown in results (`X/total`). A missed country is re-queued (`queue.splice`) up to twice
before being marked done anyway, and collected in `G.missed` for the "Replay the ones I missed"
button.

**External dependencies (CDN only):**
- D3.js 7.8.5 — SVG map rendering, zoom/pan

## Key Functions / Objects

| Name | Purpose |
|---|---|
| `MD` / `C` | Parsed map data; `C` is the flat array of country records (`{n, r, d, b, c, s, ...}`) |
| `MapV.build(scope)` | Draws the map for a region, filtering/dimming out-of-scope countries |
| `MapV.fit(box, instant)` | Animates/sets the zoom transform to frame a bounding box |
| `MapV.mark(c, cls)` | Applies `target`/`right`/`wrong` styling to a country's path + marker |
| `G.start(scope, mode, len, only)` | Builds the question queue and kicks off a round |
| `G.next()` | Renders the next question for the current mode |
| `G.answer(ok, other, btn, typed, raw)` | Scores an answer, gives feedback, re-queues misses |
| `judge(input, target)` | Fuzzy name-matching for the "type it" mode |
| `norm(s)` | Normalizes a typed string for matching (accents, casing, `St.` expansion) |

## Editing Notes

- Don't hand-edit the `MD` JSON block — it's generated map data (paths, bounding boxes, label
  centroids per country). Adding/renaming a country means regenerating that block, not patching
  the SVG path text by hand.
- Country name aliases for "type it" mode go in the `ALT` table, not into the canonical `n` field.
- The `s` flag (0/1, last key of each country record) draws a dot and a larger tap target. A
  country gets one when its shape is under ~9px across (square root of its area) in its own
  region's view on a phone-sized map (about 360×325px). Re-check that rule after moving a country
  to another region, since a region's zoom changes what reads as small.
- Regions (`REGIONS`) must match the `r` field baked into each country record in `MD`.
- The region chips are multi-select. `cfg.scope` / `G.scope` / `MapV.scope` are arrays of region
  keys, and an empty array means the whole world; always test membership with `inScope(scope, c)`.
  "Whole world" is exclusive: picking it clears the others, and clearing every region falls back to it.
- The Pacific-centred projection (`pd`/`pb`/`pc`) only exists for Oceania, East & Southeast Asia
  and a few neighbours, so `MapV.build` uses it only when every selected country has a `pc`.
  Oceania mixed with any other region falls back to the regular projection.
