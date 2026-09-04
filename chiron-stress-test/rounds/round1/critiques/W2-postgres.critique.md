# Critique: W2-postgres.md

## Top finding

The course is built almost entirely out of fabricated measurements of the learner's production
database, and it labels them as real. The learner supplied four facts: ~12M rows, ~50k sellers,
one seller at "something like 15%", and an index on `(seller_id, status)`. Everything else that
does the teaching is invented and then asserted as measured — the seven-value `most_common_freqs`
list ("Here is what is in it for your table: ... `{0.67,0.11,0.075,0.06,0.05,0.026,0.009}`"),
the histogram whose caption claims "the dates above are the real quantiles of your order volume
over those 24 months", the cost table introduced as "computed from Postgres's own cost formulas
with the default cost settings, on your table's real geometry — 12,000,000 rows, 352,942 heap
pages, and a 401 MB index", the 30% shipped share, and the runtimes "6.8 seconds where 2.1 was on
offer". The boundary turn goes further and claims an action that never happened: "I ran `ANALYZE
orders` on a copy of your production table before building module 2. The statistics are current."
Checklist item 24 gives exactly two legal options — real computed output, or a labelled schematic
— and says invented figure data is worse than no figure. None of these are labelled schematics;
they are labelled the opposite. The cost is not aesthetic. The entire diagnostic payload of the
course is "compute the estimate by hand and compare it to reality," and every number the learner
practises on is a number that will not be there when they open `psql`. A learner who follows
section 2.1's instruction ("Open `psql` against a replica and run this") gets a different
`n_distinct`, different frequencies, and no 162,000 crossing point, with no way to tell whether
the method is wrong or the fiction was.

## Ranked findings

1. **The module commits the exact error the course exists to correct** — items #16, #22, #32,
   and module 1's canonical floor. The learner's boundary answer contained one explicit
   confusion: "I was reading the cost=0.56..378868.01 and I assumed that was ms at first". The
   boundary turn corrects it emphatically — "**Cost is not milliseconds.** ... Cost 378,868
   versus cost 533,212 tells you exactly one thing: **Postgres will choose the first one.** It
   does not tell you the first one is 40% faster." Two sections later, section 2.5 converts cost
   straight into seconds with no stated basis: "pays 1,243,414 in cost units where 532,942 was
   available. On your hardware that is 6.8 seconds where 2.1 was on offer." The two ratios do not
   even agree — 1,243,414/532,942 is 2.33, 6.8/2.1 is 3.24 — and nothing explains the gap. The
   plan schedules "cost is a unit, not a time" as an interleaved item in module 3, so the course
   will shortly grade the learner on a rule its own prose just broke. This is worse than an
   unaddressed misconception: it is the tutor modelling the misconception after correcting it.

2. **Two of the three modules, and every instrument, exist only as specification** — items #15,
   #22, #30. Module 1 is delivered as `> *[Module 1 artifact delivered here — not reproduced in
   this file...]*`, module 3 as five plan bullets. The file discloses this as the authoring
   scope, but the consequence stands: every rule-22 callback ("Module 1 ended on a chain"), the
   whole M1 canonical floor, the M1 gate items and the M1 end-of-module set are claims about
   prose that does not exist and cannot be audited — which is half the interleaving contract.
   Inside module 2 the instruments are likewise descriptions of artefacts rather than the
   artefacts: "**Control:** a picker with the seven values of `status` on it". The guided
   experiments and checks around them are genuinely composed; the thing they are attached to is
   a spec sheet.

3. **The reveal is given away three times before the section that reveals it** — items #5, #22.
   Section 2.4 is the module's designated payoff, and its arc promises "the reveal". By the time
   the learner arrives, they have already been told the answer in the boundary turn ("The
   estimate for `seller_id = 8812` on its own is accurate... Put the two conditions in the same
   WHERE clause and the estimate is off by five times. Every input is right and the output is
   wrong"), again in Check 2A's option-D feedback ("This node returned 540,000 rows when it ran,
   five times its own prediction"), and again in 2.2's closing line ("in section 2.4 you are
   going to compute one and get a number that is badly wrong"). So 2.4's "Both inputs were right.
   The output is five times too small" is the fourth telling. The section that was supposed to
   land the mechanism has been reduced to confirming a fact already held.

4. **Two of three instrument checks ask for a number printed in bold directly above them** —
   items #28, #30. M2-C's check asks "what happens to the left bar — the planner's estimate?"
   The paragraph immediately preceding it reads "**What to notice:** the left bar never moves.
   That is the entire mechanism." M2-B's check asks "At roughly how many matched rows does that
   happen?" — after the prose has said "The two lines cross at 162,000 matched rows", after a
   table row bolding "**162,000** ... **the crossing point**", and after "**What to notice:** the
   crossing point is at 162,000 rows, which is **1.35% of your table**." Rule 28 bars an item
   directly beneath the text that answers it; these are beneath the *sentence* that answers them.
   The learner can clear both without touching the control, so the instrument is never actually
   used — it is decoration attached to a recall question.

5. **Module 3's checks are titles with no options and no misconceptions** — item #18. The plan
   is required to write every gradable check with the misconception each wrong option encodes.
   Module 3's entire assessment is one sentence: "**End-of-module set (M3)** — 6 items, at least
   two from modules 1 and 2: a numeric on selectivity (M2), an MCQ on cost-vs-time (M1), an
   order-these-steps on the diagnosis procedure, an MCQ on index column order, a set-the-control
   on M3-A, and an MCQ on when a partial index is the wrong tool." Gate 3A is "MCQ on `Rows
   Removed by Filter`"; Gate 2B is "matching, drawn from 2.1, lagged by two sections" with no
   distractors either. These are topics, not designed items — the exact "improvised at build
   time" outcome the plan's own preamble says it exists to prevent.

6. **The matching items leave half their wrong placements with no explanation at all** — item
   #27. Item 6 has three conditions and three sources: six wrong placements are possible, and
   feedback exists for three of them plus a catch-all ("Any condition → `reltuples`: ..."). A
   learner who drags `created_at >= '2026-07-19'` onto `n_distinct`, or `status = 'shipped'` onto
   `n_distinct`, or `seller_id = 41207` onto `histogram_bounds`, gets nothing. Check 2B is worse
   arithmetically: four fields, four slots, twelve wrong placements, four of them written. Since
   Check 2B is a gate that "All four must be placed correctly to pass", the learner can be held
   at a locked door by a mistake the artifact has no words for.

7. **The interleaved order-these-steps is reskinned, not reformulated** — item #29. The plan is
   candid about it: "the planner's sequence, on a different query (`order_items`, a join) so it
   is the same discrimination on a new surface." But the new surface is entirely in the stem. The
   six cards the learner orders — parse, read summaries, estimate rows, price plans, pick
   cheapest, execute — say nothing about a join, nothing about `created_at`, nothing about
   `GROUP BY`. Neither the join nor the range condition is load-bearing for a single card. The
   discrimination is identical to module 1's and so is the answer; only the decoration above it
   changed. Rule 29 asks for a different surface *for the discrimination*, not a different
   query pasted over the same one.

8. **The boundary adaptation is pre-scripted** — item #32. The COURSE PLAN is presented as
   "*Written to `course-plan.md` in the outputs directory before any module is built*", yet it
   already contains: "**Distractors seeded from the boundary answer**: 'the statistics are stale,
   run ANALYZE' and 'the index is missing a column' both get options, because the learner reached
   for the first of those at the module-1 boundary." The boundary had not happened when the plan
   was written; the simulated learner's answer appears later in the file. So the misconception
   the adaptation "responds to" was chosen before the learner offered it, and the boundary
   changed nothing that was not already on the page. That is the page break rule 32 names, dressed
   as adaptation.

9. **An analogy whose source is an experience the learner never reported** — item #8. "You have
   done this exact thing. When you needed to know how big a JSON response was going to get, you
   did not serialise all 12 million records and measure; you measured a hundred of them and
   multiplied." The learner said they use Django and read APM traces. Nothing in either turn
   mentions sizing a JSON response by sampling. Rule 8 requires the source to be something *this
   learner has actually experienced*; here a memory is asserted on their behalf, and if they have
   not had it, the sentence teaches by making them doubt their own recollection rather than by
   mapping a structure they hold.

10. **The follow-up turn asks three things at once, and the boundary turn reassures** — item #11's
    single-ask discipline and item #10. The domain turn is "what does that endpoint actually do,
    and what do you already know about the shape of the data — roughly how many sellers, and is
    the big one big by a lot?" That is three asks; the named failure mode "two asks in one
    message" is cleared by one. Separately, "Your guess — stale statistics, hasn't run ANALYZE
    since the big seller ramped up — is the right first instinct and it's the one most people
    reach for" praises the instinct and softens the correction with reassurance, where rule 10
    asks for structural normalisation and feedback on the work only.

11. **Terms that felt like plain language to the author** — item #7. "the dates above are the real
    quantiles of your order volume" introduces *quantile* and never defines it, in a module whose
    whole subject is a histogram — the one place the word has to be nailed down. "352,942 heap
    pages" introduces *heap* with no definition after fourteen paragraphs of plain "pages".
    "Autovacuum runs it for you in the background" names a subsystem and moves on. Check 2A's
    feedback sends the learner to "`pg_class.reltuples`" one section before `reltuples` is
    introduced. Each is small; the pattern is exactly the failure rule 7 predicts.

## Hollow compliance

- **A "where it breaks" clause that does not name a break.** Rule 8 requires saying where the
  analogy stops holding. The sampling analogy's clause says the opposite — that the image holds
  in a second place: "It breaks in the same place your estimate broke: sampling tells you
  reliably how big the *common* case is, and tells you very little about how many *different*
  shapes exist." That is a shared property, not a limit. The learner is never told where the
  JSON-sizing picture will mislead them.

- **"What to notice" lines that leave nothing to notice.** M2-C's reads "the left bar never
  moves. That is the entire mechanism." It is not an observation prompt; it is the answer to the
  question printed underneath it. The notice line and the check cancel each other out.

- **Interleaving at exactly the floor, counted generously.** Rule 29 asks for at least a third
  from earlier modules; the set delivers 2 of 6, and one of the two (finding 7) is a reskin. The
  effective callback content is one item in six.

- **A canonical floor that module 2 contradicts.** Module 1's floor claims to deliver "node types
  Seq Scan, Index Scan, Bitmap Index Scan + Bitmap Heap Scan". Module 2 then introduces one of
  them from scratch, as new material: "There is a third option Postgres reaches for in the middle
  of that range, and you will see it in plans: a **Bitmap Heap Scan**, which collects all the
  matching row locations..." Either the floor is wrong about what module 1 delivered, or module 2
  is re-teaching a term the learner already owns; the floor is not being checked against the prose.

- **A gate item that depends on a section not yet delivered.** The M2-A instrument check's correct
  answer is "`delivered`, and it chooses a Seq Scan", while the distractor feedback admits "An
  index that matches perfectly can still lose. Section 2.3 is entirely about why." The item is
  survivable only by reading the plan line off the widget; the mechanism it grades is explicitly
  withheld until the next section.

- **A fold-back delivered twice in near-identical words.** Section 2.5 closes on "**The
  fold-back:** `rows=` is one multiplication over a sampled summary..."; the handoff block then
  opens with "**What this module showed:** `rows=` is one multiplication — a fraction from a
  sampled summary, times the table's row count...". Rule 31's one-sentence fold-back is present,
  but it is a restatement of a fold-back the learner read ninety seconds earlier.

- **Cost numbers presented as derivable that are not derivable.** Section 2.3 promises "Every
  number below is computed from Postgres's own cost formulas with the default cost settings" and
  supplies exactly three constants: `seq_page_cost` 1.0, `random_page_cost` 4.0, `cpu_tuple_cost`
  0.01. Applying them gives a sequential-scan cost of 352,942 + 0.01 × 12,000,000 = 472,942. The
  table prints 532,942 in every row. The missing 60,000 comes from a fourth constant the module
  never mentions. A learner who takes the invitation to check the arithmetic — which is the skill
  this course is selling — finds a discrepancy the text has no account of.

## Scores (1-5, 5 = fully honours the contract)
- Hook discipline: 4
- Plan as contract (order from zero, canonical floor, misconceptions written, interleave schedule): 3
- Jargon & concrete-before-abstract: 3
- Analogy discipline: 3
- Checks: gradability, per-option explanations, format mix, lag: 3
- Interleaving (reformulated, unannounced, >= one third): 2
- Instruments (control/variable/visible change, claim-instrument-experiment-check order): 2
- Handoff & boundary adaptation: 3
- Prose is real composed content, not outline or markup: 3

## One sentence

This course needs to stop inventing the learner's data and calling it measured — every figure,
frequency and runtime should either come from something the learner actually ran or be labelled a
schematic, and the checks should ask for numbers the prose has not already printed in bold.
