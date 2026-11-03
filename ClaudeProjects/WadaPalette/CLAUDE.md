# Wada Palette

Single-file app (`wada-palette.html`) for exploring Sanzo Wada's *A Dictionary of Color
Combinations* and turning its palettes into outfits.

## Data
- `DATA.colors`: the book's 159 colors, each `{n: name, h: hex, l: [L,a,b], g: group 0–5}`.
- `DATA.combos`: the 348 numbered combinations, `{comboNumber: [colorIndex, ...]}`.
- Source: mattdesl/dictionary-of-colour-combinations (MIT). Skin tones: Monk Skin Tone Scale
  (CC BY 4.0). Credits are in the page footer; keep them.

## Views (hash routed)
- `#combos`: full-height color bands for the current combo. Tap a band to lock it; "Shades"
  opens a sheet of the nearest colors by CIELAB ΔE to swap in or soft-lock several (a slot is a
  `Set`; size >1 means "any one of these"). Shuffle picks another combo that fits every slot,
  the size filter (Any/2/3/4), skin and outfit mode. Locked colors keep their position.
- `#wardrobe`: pieces you own by type (Top, Bottom, Shoes, Outerwear, Accessory), each with a
  main color plus nearby shades that also count. "Look out for" lists colors from saved
  outfits you don't own yet. Skin tone picker maps Monk tones to dictionary stand-ins.
- `#saved`: saved outfits with a role and note per color.

Outfit mode (`cover()`) assigns every color in a combo one role: skin, each needed type, other
owned types, and one free color unless Strict is on.

## Persistence
localStorage, every key prefixed `wada-` (`wada-outfits`, `wada-pieces`, `wada-skin`,
`wada-skintones`, `wada-skinon`, `wada-size`, `wada-outfit`, `wada-needs`, `wada-strict`).
"Start over" clears all `wada-` keys.
