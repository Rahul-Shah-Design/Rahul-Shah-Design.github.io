# GrindLog — Project Summary

Single-file PWA (`index.html` + `sw.js`) for daily fitness tracking. Dark theme, lime-green accent (`#c8f542`), DM Mono and Syne fonts. Deployed on GitHub Pages at `claude-projects/grindlog/` subdirectory. Data stored in localStorage under key `grindlog_v1`. JSON and CSV export/import supported.

## Current Tracking

- **Fighter Pull-Up Program** — auto-calculates 5 descending sets from current max and program day. Day only advances when all 5 sets are marked done. If sets are incomplete, entry saves but program stays on same day.
- **C25K** — single checkbox, "ran today." No schedule enforcement.
- **Morning stretch** — single checkbox.

## Dot Grid Logic (28 days)

- 🟢 Green = logged and did at least one thing
- 🔴 Red = past day not logged, or logged with zero activity
- ⬜ Grey = future

## Fighter Program Structure

5 active days + 1 rest day per 6-day cycle. Sets descend from `currentMax`. Each active day increments one set by one rep, bottom-up (set 5 first). After day 5, `currentMax` bumps by 1 on the rest day. Program is calendar-agnostic — missed days just pause progress, no skipping.

## Phase 2 Additions Planned

- Lifting template after runs (back, arms, compound legs)
- Circuit machine reference table: machine name, weight, seat position
- Protein tracking toward ~100–115g/day

## Key Decisions Made

- No rest day buttons — just track what was done
- No partial/missed distinction beyond red/green
- No guilt mechanics — streaks reflect activity, not punish rest
- Program day is sequence-based, not calendar-based
