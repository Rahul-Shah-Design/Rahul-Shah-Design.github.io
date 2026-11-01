---
name: tailor-portfolio
description: Tailor Rahul's UX portfolio (and resume) to a specific job posting. Use when he says "tailor my portfolio for this job", "personalize my portfolio for this link", "/tailor-portfolio" followed by a URL or pasted posting, or hands over a job description and asks to adapt his site, case studies, intro, or resume to it.
---

# Tailor portfolio to a job posting

Rahul is a product/UX designer: about 5 years of K–12 edtech at Encoura on Encourage, a college
and career readiness app; B.S. Human-Centered Computing, RIT; M.S. Learning Design & Technology,
UMGC. His strengths are accessibility (WCAG 2.1 AA), user research, AI prototyping and
instructional design. Your job: take one job posting and produce an employer page in this repo
that speaks directly to it, **without inventing anything**.

In this repo a tailored portfolio is a folder at the root (`/<company>`, e.g. `collegeboard/`)
holding its own `index.html`, its own copies of every asset, and its own `resume.docx/.pdf/.png`.
The root `index.html` is never edited for a tailoring job. Read `CLAUDE.md` first: its
"Employer-Specific Portfolio Pages", "Chiron Session Replay", "Résumés", "Analytics" and
"Accessibility Conventions" sections are binding. `references/facts.md` (next to this file) is
the inventory of facts you may use and the corrections Rahul has already made; read it before
writing any copy.

## 1. Get the posting

- If given a URL, fetch it. Extract: company, title, team/product, level, must-haves,
  nice-to-haves, the problems the team is solving, the users (students, educators, families…),
  what the posting asks a portfolio to show, and language it repeats (e.g. "mastery", "equity",
  "0→1", "design systems").
- If the page won't load (Greenhouse/Lever/Workday often block fetches), ask him to paste the
  text. **Never guess the posting.**
- Also look at the company's own site for: brand colours and type, the product's real users,
  and a logo you could use in the "Prepared for" lockup.
- Show a short **"What they're hiring for"** summary (5–8 bullets) before editing anything.

## 2. Read his material

- The pages: root `index.html` (general version) and the existing employer folders. Each
  employer row in `CLAUDE.md` says what that page was angled at and what Rahul changed after
  review; those notes are his feedback, reuse them.
- The résumés: every folder's `resume.docx` is the source (never edit the PDF). The text can be
  dumped from `word/document.xml`.
- Build the inventory from `references/facts.md` plus the pages: case study → users, methods,
  outcomes, numbers. Only use facts that exist there.

## 3. Map fit, and pick the base

Make a table: **posting requirement → his best evidence (case / slide / résumé line) → strong /
partial / gap.** Call gaps out honestly and say how to handle each: reframe real work, leave it
for a cover letter, or ask him. Never fill a gap with copy.

Then propose (and let him confirm) three choices, since they decide everything after:

1. **Base page to fork.** Pick the existing page whose angle is closest, not always the root:
   - research / onboarding / platform roles → `collegeboard/` or `codepath/`
   - AI-building / educators-as-makers → `playlab/`
   - student-facing learning product → `dreambox/`
   - communications / staff workflows → `parentsquare/`
   - general K–12 → root `index.html` or `modern-classroom-project/`
2. **Style.** Portfolio's own graph-paper style with a "Prepared for" lockup (the default; Rahul
   chose it for College Board), or restyled in the employer's brand (Wayfinder, Playlab,
   DreamBox, ParentSquare). A branded page needs a Chiron replay brand bridge (see `CLAUDE.md`).
3. **Résumé base.** Rahul prefers the lightly tailored Wayfinder copy (used as is for
   ParentSquare and College Board) over heavily rewritten ones. Default to copying
   `parentsquare/resume.docx` and changing only the link; tailor further only if he asks.

## 4. Make the tailored version

Work on the session's designated branch (or `tailor/<company>-<role-slug>` if none is set).
The new folder is what keeps the main portfolio untouched; nothing outside it changes except
`CLAUDE.md`.

1. **Scaffold the folder.** Kebab-case slug named for the employer (`collegeboard`, not
   `college-board-onboard-senior`). Copy the base page's `index.html` and **every asset it
   references** into the new folder (check with a grep for `src=`/`href=`/asset arrays, including
   the `chiron-replay-*.webp` images, GIF posters and `lottie_svg.min.js`). Set the `<title>`
   to `Rahul Shah — for <Company>`. Keep the GoatCounter tag and its comment line.
2. **"Prepared for" lockup.** Use the company's logo captured from its own site header
   (recoloured to the page ink if needed, saved as `<company>-logo.png/webp`), or set the name
   as a text wordmark. Never draw or approximate a logo.
3. **Hero.** Rewrite the headline and the 1–2 sentence intro to mirror the role's focus, in his
   voice: plain, warm, specific. **Don't echo the posting's wording back** (College Board's
   headline was reverted to a plain K–12 line for this reason). Keep the intro short. Keep
   `data-flatten` on any heading/paragraph with inline styling.
4. **Case order.** Put the 2–3 most relevant cases first; drop or move down the rest (cut
   whole sections rather than gutting them).
5. **Case framing.** Adjust the one-sentence case intros and the slide narration to foreground
   what this team cares about (e.g. College Board: onboarding narrated research first). **Keep
   the original case titles and lengths** unless he asks; add a small angle, don't rewrite.
   Keep every fact and number exactly as written (see `references/facts.md`).
6. **The closing section** ("What I'd bring…", "How I work") can be rewritten for the role,
   from facts only.
7. **Chiron replay.** Keep it. Copy changes to the shared replay must go to all pages (see
   `CLAUDE.md`), so don't edit its copy for one employer; a branded page gets only a brand
   bridge.
8. **Résumé.** Copy the base `resume.docx` into the folder. In `word/document.xml` change the
   header link run to `rahulshah.design/<slug>`, and in `word/_rels/document.xml.rels` change the
   hyperlink `Target` to `https://rahulshah.design/<slug>`. Header stays centred. Any reordering
   of bullets or summary uses the same facts only. Then build:
   ```
   apt-get install -y --no-install-recommends libreoffice-writer poppler-utils
   python3 tools/build-resume.py <slug>
   ```
   It refuses a résumé that's over one page, whose link doesn't match the folder, or whose
   header is off centre. Fit by tightening spacing or copy, never by shrinking type.
9. **Open questions go on the page, visibly.** Anything you need Rahul to confirm (a number, a
   claim, a placeholder image) gets a `.todo` flag (see `dreambox/`) rather than a guess. List
   them in the hand-back; all must be cleared before the page is shared.
10. **Cover note** (150–200 words, "Why <Company>") only if he asks.
11. **Document it.** Add a row to the employer table in `CLAUDE.md` (what it was built for,
    base page, style, order, and anything he decided), add the folder to the repo tree, add the
    résumé to the Résumés section, and add the page to the Chiron replay's page list.

### Copy rules (from his past reviews)

- No em dashes in body copy or narration. Plain sentences, no buzzword stacking.
- Users are **students and educators** (counselors, teachers). He hasn't designed for parents or
  families; don't claim it, even for a family-facing company.
- Tech: say "React and React Native", not native iOS/Android.
- Chiron finds where you're stuck, builds a lesson around it and adapts the next one. It does
  **not** gate progression on mastery.
- Don't make claims about the employer's own product (e.g. their accessibility record).
- No multilingual / translation / RTL work to cite; don't imply it.
- Mentoring = the RIT UX club.

### Check before handing back

- Preview: `python3 tools/build-artifact.py --page <slug>` and publish the result as an Artifact
  for fast review (the deployed page needs the merge).
- Screenshot with Playwright at 1440, 1024 and 390 wide. Every Chiron replay slide fits its
  540px window without scrolling at 1440 and 1024. No horizontal scroll on phones.
- Accessibility intact: one `h1`, case titles `h2`, `aria-labelledby` on sections, alt text on
  every new image, 4.5:1 text contrast (3:1 UI), skip link first, GIFs have posters.
- `grep` the folder for the base page's company name, slug and logo so nothing from the old
  employer leaks through (titles, alt text, `aria-label`s, résumé link, lockup).

## 5. Hand back

- A concise change summary, section by section: what changed and why.
- The fit table's gaps, every `.todo` flag, and any claim he should double-check.
- The Artifact link and screenshots.
- Ask whether to commit, keep it on the branch, or merge to `main` to deploy at
  `rahulshah.design/<slug>`. **Don't commit, push or merge without his OK.**

## Rules

- Never invent experience, metrics, tools, clients, titles or quotes. If something would help
  but isn't in his material, ask him.
- Keep accessibility intact in anything you edit.
- Never edit the root `index.html` or another employer's folder for a tailoring job.
- Don't commit or push without asking.
