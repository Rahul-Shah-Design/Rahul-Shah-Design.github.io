# W2 — Why a Postgres query goes slow once the table grows

*Round 1 authoring artifact. Learner profile: mid-level backend engineer, four years of SQL
written through an ORM, has never read an EXPLAIN plan, does not know the word "cardinality".*

---

## HOOK

A year ago you shipped a seller dashboard. It loads a count: how many of this seller's
orders are currently marked shipped. The `orders` table had about 900,000 rows, there was
an index covering both of those columns, and the endpoint came back in about 40
milliseconds. Nobody thought about it again.

Today that table has 12 million rows. The index is still there — same index, same two
columns, nobody dropped anything. The query is now taking almost seven seconds, and only
for your biggest seller. For everyone else it is still fast.

Nothing in the query changed. Nothing in the index changed. Only the table got bigger.

Take a guess at what happened — first thing that comes to mind is fine, it does not need to
be right.

---

## [SIMULATED LEARNER]

honestly not sure. my first thought is it stopped using the index? like maybe postgres
decides at some point the index isn't worth it, or the index got fragmented or something
and needs rebuilding. we've had to REINDEX stuff before.

the other thing i'd check is whether it's the big seller specifically — if they have way
more rows than everyone else then it's just more rows to count, so more time? but 7 seconds
for a count feels like too much even so.

we're on Django so I don't really write the SQL by hand, I just see the slow endpoint in the
APM trace.

---

## FOLLOW-UP TURN (§1 domain question)

One question before I build this, so the whole course runs on your table instead of a made-up
one: what does that endpoint actually do, and what do you already know about the shape of the
data — roughly how many sellers, and is the big one big by a lot?

---

## [SIMULATED LEARNER]

it's the orders list page for a seller. django paginator, so it does
`Order.objects.filter(seller_id=..., status="shipped")` and then the paginator calls
`.count()` on that before it fetches the page. the count is the slow part, we timed it.

orders table is ~12M rows now. sellers, maybe 50k? and yeah one of them is huge — we
onboarded a big fulfilment partner about 6 months ago and they're something like 15% of all
orders on their own. they also batch their shipping, they push a whole week out at once, so
they sit with a lot of stuff in "shipped" that hasn't been delivered yet.

there's an index on (seller_id, status), we added it when we built the page.

---

## COURSE PLAN

*Written to `course-plan.md` in the outputs directory before any module is built. Re-read
before each module; claims marked delivered as they ship.*

```markdown
# Course plan — Why a Postgres query goes slow once the table grows

## Learner

Mid-level backend engineer. Four years of SQL, all of it through Django's ORM. Has never
read an EXPLAIN plan. Does not know "cardinality", "selectivity", or "statistics" in the
Postgres sense. Reaches for physical explanations first (index fragmentation, REINDEX) and
for "more rows = more time" as a linear intuition. Comfortable with: Python, Django
querysets, APM traces, the idea of an index as a lookup structure.

Vocabulary to answer in: rows, columns, index, query, slow endpoint, queryset, count().
Vocabulary to attach only after the idea has landed: plan, node, estimate, selectivity,
cardinality, statistics, crossover.

## Domain to build in

Their table. `orders`, 12,000,000 rows, ~50,000 sellers, columns including `seller_id`,
`status`, `created_at`. Index `orders_seller_status_idx` on `(seller_id, status)`. The slow
call is a Django paginator's `.count()`:

    Order.objects.filter(seller_id=8812, status="shipped").count()
    -> SELECT count(*) FROM orders WHERE seller_id = 8812 AND status = 'shipped';

Seller 8812 is a fulfilment partner onboarded six months ago: 1,800,000 orders (15% of the
table) and, because they batch-ship weekly, 30% of their orders sit in `shipped` against a
6% rate across the rest of the table. Every module uses this query and this table.

## Throughline

The hook: same query, same index, table grew from 900k to 12M rows, endpoint went from 40ms
to ~7s, and only for the biggest seller.

A full answer has to contain, claim by claim:

1. Postgres did not "use" or "not use" the index by rule. It compared two ways of getting
   the answer and picked the one it estimated to be cheaper.  [M1]
2. That comparison is arithmetic over an estimated row count, printed as `rows=` in the plan.
   Everything downstream is computed from that one number.  [M1]
3. The estimated row count is not measured. It is derived from a stored summary of the table
   collected by sampling ~30,000 rows.  [M2]
4. Each condition contributes a fraction; estimated rows = fraction × table row count.  [M2]
5. An index scan pays per matching row; a sequential scan pays per page, once. So above a
   small fraction of the table the index is the more expensive plan even though it exists and
   matches perfectly.  [M2]
6. Two conditions are combined by multiplying their separate fractions, which assumes the
   columns are unrelated. `seller_id` and `status` are related for this seller, so the
   estimate is 5x too low: 108,000 against a true 540,000.  [M2]
7. 108,000 sits below the crossover, 540,000 sits above it. So the planner chose the plan
   that would have been right for the number it believed.  [M2]
8. Last year both things were different: the seller's slice was small in absolute terms, and
   there was no correlation between who they were and what status their orders sat in. The
   growth did not break the plan by being growth; it broke it by being uneven.  [M2]
9. You can read all of this off `EXPLAIN (ANALYZE, BUFFERS)` by comparing `rows=` to
   `actual rows`, and there are three separate fixes — fix the estimate, make the index
   cheap enough that the estimate stops mattering, or stop asking the question.  [M3]

This needs the whole course: claim 5 is meaningless without 2, claim 6 is meaningless
without 4, and claim 8 is the hook's actual answer and cannot be stated before 5 and 6.
It stays inside the mechanism they asked about — how the planner chooses — and does not
wander into query tuning tricks, connection pooling, or schema design.

## Modules

### Module 1 — "Two ways to answer the same question"

Arc: mechanism (there are always several plans) → the leap (the planner shops on estimated
price) → the mess (price is not time) → the reveal (one number moves everything).

Sections, each claim resting on the one before:

- **1.1** The count query has at least two correct answers-by-different-work: walk the index
  entries for this seller and jump to each row, or read the whole table start to finish. Both
  return the same number. Instance first: two shapes of work described in plain terms, no
  vocabulary. *Claim: correctness does not pick the plan, because both are correct.*
- **1.2** `EXPLAIN` prints the plan Postgres chose, as an indented tree read from the inside
  out. Names introduced here, each defined in the sentence: plan, node, Seq Scan, Index Scan,
  Aggregate, Index Cond, Filter. *Claim: the plan is a readable object, not a black box.*
  Figure 1.1: the two plan trees for the count query, side by side, with every part labelled.
- **1.3** Every node carries `cost=startup..total`, `rows`, `width`. Cost is not milliseconds;
  it is a made-up unit where "read one page in table order" costs 1.0 and everything else is
  priced relative to that. Startup cost is what you pay before the first row comes out; total
  cost is what you pay for all of them. **Instrument M1-A** carries this claim.
  *Claim: the planner picks the lowest total cost — except under LIMIT, where startup cost
  starts to win.*
- **1.4** `EXPLAIN (ANALYZE, BUFFERS)` runs the query and prints `actual rows` and
  `actual time` beside the estimates. The gap between `rows=` and `actual rows` is the single
  most diagnostic thing on the page. Figure 1.2: the real plan for their count query with
  `rows=108000` and `actual rows=540000` side by side. *Claim: you can see the planner being
  wrong, and it is visible in one place.*
- **1.5** Fold-back: the chain is estimate → cost → choice, so a wrong estimate is not a
  slightly-off plan, it is a confidently chosen wrong plan.

Canonical floor delivered here: `EXPLAIN`; `EXPLAIN (ANALYZE, BUFFERS)`; plan tree read from
the inside out; node types Seq Scan, Index Scan, Bitmap Index Scan + Bitmap Heap Scan,
Aggregate; `cost=startup..total`, `rows`, `width`, `actual rows`, `loops`; "cost is a unit,
not a time"; "the planner picks the lowest total cost, or lowest startup cost under LIMIT".

Analogy owned by this module and extended later, never swapped: **the printed manual with an
index at the back.** Mapping stated explicitly — manual = the table, page = a disk page,
index at the back = the Postgres index, an index entry = one row's location, flipping to a
page = one random read, reading front-to-back = a sequential scan. Breaks at: you can read a
page you already have open for free, which is what caching does and the analogy does not.

### Module 2 — "Where `rows=` comes from"  [the module written out in full below]

Arc: mechanism (the stored sample) → the leap (fraction × row count, and the crossover) →
the mess (two conditions get multiplied) → the reveal (why last year was fine).

- **2.1** `pg_stats` holds a summary of every column, collected by `ANALYZE` from a sample of
  about 30,000 rows: the most common values and how often each appears, a histogram of the
  rest, a distinct-value count, and the table's row and page counts. Instance first — the
  actual `pg_stats` row for `orders.status` — then the rule, then the names.
  The `pg_stats` output for `status` is shown as a literal query result rather than a figure.
  Figure 2.1 is the `created_at` histogram (real quantiles of their order volume).
  *Claim: the planner never counts; it reads a summary.*
- **2.2** A condition is turned into a fraction, and estimated rows = fraction × row count.
  The fraction has a name (selectivity); the resulting row count has a name (cardinality).
  **Instrument M2-A.** *Claim: `rows=` is one multiplication.*
- **2.3** The index scan pays per matching row and the sequential scan pays per page once, so
  there is a crossing point past which the perfectly-matching index is the more expensive
  plan. Figure 2.2 is the two cost curves crossing at 162,000 rows, computed from Postgres's
  cost formulas on this table's real geometry. **Instrument M2-B.** Extends the module-1 manual analogy rather than replacing it.
  *Claim: "has an index" and "should use the index" are different questions.*
- **2.4** Two conditions are combined by multiplying their two fractions, which is only right
  if the columns have nothing to do with each other. For seller 8812 they have everything to
  do with each other. **Instrument M2-C.** *Claim: both single-column estimates are correct
  and the combined estimate is still 5x wrong.*
- **2.5** The reveal: last year the same query on the same index was estimated at 7,200
  against a true 8,000, and the index plan was both chosen and correct. Two things changed
  together. Fold-back.

Canonical floor delivered here: `pg_stats`; `ANALYZE`; `reltuples`; `relpages`;
`most_common_vals` / `most_common_freqs`; `histogram_bounds`; `n_distinct`; **selectivity**;
**cardinality**; `rows = selectivity × reltuples`; `seq_page_cost`, `random_page_cost`,
`cpu_tuple_cost`; the crossover as a fraction of the table; the independence assumption.

### Module 3 — "Making the number true, or making it not matter"

Arc: mechanism (read the mismatch) → the leap (three separate fixes) → the mess (the ORM
is generating this SQL and hiding it) → the reveal (a decision procedure).

- **3.1** Reading the mismatch precisely: `Rows Removed by Filter`, `Buffers: shared hit=…
  read=…`, `loops`, and how to tell "the estimate was wrong" from "the estimate was right and
  the work is genuinely large".
- **3.2** Fix one — make the number true. `CREATE STATISTICS … (dependencies, ndistinct, mcv)
  ON seller_id, status FROM orders`, then `ANALYZE`. Why `autovacuum_analyze_scale_factor`
  means a 12M-row table gets re-analyzed after 1.2M changes while a 900k-row table got
  re-analyzed after 90k, so big tables run on staler numbers for longer.
  Instrument M3-A: the extended-statistics switch, showing the estimate snapping from 108,000
  to 540,000 and the chosen plan flipping with it.
- **3.3** Fix two — make the estimate stop mattering. Partial index on
  `WHERE status = 'shipped'`; covering index with `INCLUDE`; index-only scans and why the
  visibility map decides whether you actually get one. Index column order rule: equality
  columns first, then the range or sort column.
- **3.4** Fix three — stop asking. What Django's paginator `.count()` compiles to, why it is
  the expensive half of the page, and the shapes that avoid it.
- **3.5** The decision procedure, in order, folded back to the hook.

Canonical floor delivered here: `Rows Removed by Filter`; `Buffers: shared hit/read`;
`CREATE STATISTICS` with its three kinds; `autovacuum_analyze_scale_factor`;
`default_statistics_target` and `ALTER TABLE … ALTER COLUMN … SET STATISTICS`; partial index;
covering index / `INCLUDE`; index-only scan; visibility map; index column order rule; the ORM
traps (paginator `.count()`, `.only()` and width, N+1).

## Instruments

| ID | Module | Claim it carries | Control | Variable it changes | What visibly changes |
|---|---|---|---|---|---|
| M1-A | 1.3 | Total cost usually decides, but startup cost decides under LIMIT | `LIMIT n` stepper, 1 → 100,000 | Which plan has the lower *startup* cost vs lower *total* cost | The highlighted winning plan tree flips from Index Scan to Seq Scan as n grows |
| M2-A | 2.2 | `rows=` is selectivity × reltuples | `status` value picker (7 values) | The stored frequency pulled from the MCV list | The frequency, the multiplication, and the `rows=` number in a live plan line |
| M2-B | 2.3 | The index loses above a fraction of the table | Matched-rows slider, 1,000 → 2,400,000 | Estimated cost of the index-scan plan | Two cost bars, and the "planner picks" label flipping at ~162,000 |
| M2-C | 2.4 | Multiplying fractions breaks when columns are related | "% of seller 8812's orders that are shipped" dial, 1% → 60% | The true matching row count | Two bars — what the planner estimates (pinned at 108,000) vs what is true — and the plan each one implies |
| M3-A | 3.2 | Extended statistics replace the multiplication with a measurement | On/off switch: `CREATE STATISTICS` present or absent | The combined selectivity Postgres uses | `rows=` snapping 108,000 → 540,000 and the chosen plan flipping to Seq Scan |

## Gradable checks

Every wrong option below exists to catch a specific wrong idea, written here so the
distractors are designed rather than improvised at build time.

### Module 1

**Gate 1A** (between 1.2 and 1.3) — MCQ. Given the two plan trees in Figure 1.1, which node
runs first?
- *Inner `Index Scan`* — correct.
- *The top `Aggregate`, because it is listed first.* — misconception: the plan reads top to
  bottom like a program.
- *Both at once.* — misconception: nodes are parallel steps rather than a producer/consumer
  chain.
- *Whichever has the lower cost.* — misconception: cost controls execution order rather than
  plan selection.

**Gate 1B** (between 1.4 and 1.5) — numeric with tolerance. A node reads
`cost=0.56..378868.01 rows=108000`. How many milliseconds will this node take? Accepted
answer: the "cannot be determined" option. Distractor bands: any numeric answer triggers the
explanation that cost is a unit anchored to one sequential page read, not a time.

**End-of-module set (M1)** — 5 items:
1. MCQ — what `width=` means. Wrong options encode: width is the number of columns; width is
   the index size; width is bytes read from disk.
2. Order-these-steps — parse, rewrite, generate candidate plans, estimate rows per node, cost
   each plan, execute the cheapest.
3. MCQ — a plan shows `rows=1 actual rows=2400000`. Wrong options encode: the query returned
   one row; the plan is fine because it used an index; the table needs REINDEX.
4. Set-the-control (M1-A) — find the smallest `LIMIT` at which the Seq Scan plan wins.
5. MCQ — cost 4,000 vs cost 40,000: what can you conclude about run time? Wrong options
   encode: 10x slower; 36,000 ms slower; nothing at all (over-correction — you *can*
   conclude which one Postgres will choose).

**Boundary question 1:** *The planner had two plans and picked one. Which single number did
it lean on hardest, and what happens to its choice when that number is wrong?*

### Module 2

**Gate 2A** (between 2.1 and 2.2) — MCQ, pulling module 1's claim forward so nothing in this
gate is answered by the section directly above it. What is the `rows=` number in a plan node?
- *Postgres's estimate of how many rows this node will produce* — correct.
- *The number of rows the node actually produced.* — misconception: `rows=` is a measurement;
  conflates `rows=` with `actual rows`.
- *The number of rows in the table.* — misconception: `rows=` describes the table, not the
  node's output.
- *A limit — the maximum rows the node is allowed to return.* — misconception: reads it as a
  constraint the planner enforces rather than a prediction it makes.

**Gate 2B** (between 2.3 and 2.4) — matching, drawn from 2.1, lagged by two sections. Match
four `pg_stats` fields to the question each one answers.

**Instrument checks:** one per instrument, on the experiment result rather than the prose —
M2-A: which status value produces the largest `rows=`, and which plan the planner picks for it
(MCQ). M2-B: at which slider value does the label flip (set-the-control, band 150k-175k).
M2-C: what the planner's bar does as the dial moves — the answer is "nothing", and the wrong
options encode partial sensitivity, a feedback loop from execution, and inverted selectivity.

**End-of-module set (M2)** — 6 items, formats mixed, two drawn from module 1:
1. Numeric with tolerance — `rows=` for `status = 'cancelled'` from the MCV frequency.
2. Set-the-control (M2-C) — the dial position at which the *true* row count first reaches the
   crossing point, i.e. where the planner's wrongness starts costing something. Deliberately a
   different landmark from M2-C's own instrument check and from M2-B's, so nothing is asked
   twice. Wrong-band feedback encodes: confusing it with the point where the estimate is
   correct (6%), and reading off the current real value (30%) instead of the first crossing.
3. Order-these-steps — **interleaved from M1** — the planner's sequence, on a different
   query (`order_items`, a join) so it is the same discrimination on a new surface.
4. MCQ — **interleaved from M1** — reading estimated vs actual on a plan for a different
   table. Same discrimination as M1 end-item 3, different numbers, different table, and the
   question asks what to *conclude* rather than what the field *is*.
5. MCQ — the independence assumption. **Distractors seeded from the boundary answer**: "the
   statistics are stale, run ANALYZE" and "the index is missing a column" both get options,
   because the learner reached for the first of those at the module-1 boundary.
6. Matching — three `rows=` estimates to the `pg_stats` structure each came from
   (`most_common_freqs`, `histogram_bounds`, `n_distinct`). Wrong placements encode: expecting
   a histogram on a seven-value column; using the frequency list for a range condition;
   assuming every value is in the most common values list.

**Boundary question 2:** *You could either make the planner's number right, or make the index
cheap enough that the wrong number stops mattering. For this query, which one would you pick,
and what breaks if you pick the other?*

### Module 3

**Gate 3A** — MCQ on `Rows Removed by Filter` (what a large value there tells you about the
index). **Gate 3B** — set-the-control on M3-A. **End-of-module set (M3)** — 6 items, at least
two from modules 1 and 2: a numeric on selectivity (M2), an MCQ on cost-vs-time (M1), an
order-these-steps on the diagnosis procedure, an MCQ on index column order, a set-the-control
on M3-A, and an MCQ on when a partial index is the wrong tool.

## Interleaving schedule

- **Module 2's end-of-module set** pulls forward, from module 1: (a) the planner's sequence
  of work, reformulated onto a join over `order_items`; (b) estimated-vs-actual row counts,
  reformulated onto a different table with different numbers, asking for a conclusion rather
  than a definition.
- **Module 3's end-of-module set** pulls forward, from module 1: cost is a unit, not a time
  (reformulated as "two plans, which do you run first?"). From module 2: selectivity ×
  reltuples arithmetic on a column not used in module 2 (`created_at`, so it forces the
  histogram rather than the MCV list).
- Nothing is said to the learner about any of this.

## Boundary retrieval items (lagged, free-recall, asked in chat)

- **Boundary 1:** no lagged item — module 1 is the only prior module, and the boundary
  question itself is already free recall on it. Do not stack a second ask.
- **Boundary 2:** recall from module 1, in their own words — "what does cost 4,000 versus cost
  40,000 let you say about run time, and what does it not let you say?"
- **Close:** recall from module 2 — "state the multiplication that produces `rows=`."

## The one next thing to recommend at close

Turn on `auto_explain` with `auto_explain.log_min_duration` and `log_analyze` on staging, so
plans for real traffic land in the log and they read plans that happened rather than plans
they asked for. Rationale: everything in this course is a reading skill, and this is the
cheapest way to get a supply of real plans to read.
```

---

## MODULE LIST TURN

Three modules. Each one is a claim you'll be able to make about your dashboard by the end of
it:

1. **Postgres compared two plans and bought the cheaper one.** It never "decides to use an
   index" — it prices the alternatives and picks. You'll read the price tag.
2. **The price is computed from a guess at how many rows come back, and that guess comes from
   a sample.** You'll find the exact place where the guess for your query goes wrong, and by
   how much.
3. **There are three different fixes and they are not interchangeable.** Make the guess true,
   make the index cheap enough that the guess stops mattering, or stop asking the question.

That's the shape of the answer to what you guessed at up top: same query, same index, 40ms to
seven seconds, big seller only.

Module 1 is below. It takes the count query from your paginator and shows you the two plans
Postgres was choosing between. The question you need to answer before module 2 is at the end
of it.

> *[Module 1 artifact delivered here — not reproduced in this file; the authoring task asks
> for module 2 in full.]*

---

## [SIMULATED LEARNER]

*(answering module 1's boundary question)*

ok so the number is the cost, right? it picks the plan with the lower cost. and the cost comes
from the rows estimate, so if the rows number is wrong the cost is wrong and it picks the
wrong one.

the bit I keep coming back to is why the rows number would be wrong at all. postgres owns the
table, it knows what's in there. so I'm guessing the stats are just out of date — like it
hasn't run ANALYZE since the big seller ramped up, so it's still working off numbers from
before. we probably need to run ANALYZE more often or bump autovacuum.

also I was reading the cost=0.56..378868.01 and I assumed that was ms at first, so if the two
plans are 378k and 533k is the seq scan actually 40% slower? that's the bit I'm least sure
about.

---

## BOUNDARY TURN

The chain you laid out is the right one, and you got it in the right order: rows feeds cost,
cost picks the plan, so a wrong row count doesn't produce a slightly-worse plan, it produces a
confidently-chosen wrong one. That's the thing module 1 was for.

Two corrections, one small and one that changes what module 2 has to do.

The small one first, because it's the thing you flagged. **Cost is not milliseconds.** The
number 378868.01 is in a unit Postgres made up: one page read in table order costs exactly
1.0, and every other kind of work is priced relative to that. A random jump to a page costs
4.0. Processing one row costs 0.01. So a plan costing 378,868 means "about as much work as
reading 378,868 pages in order" — and on your hardware, reading a page in order might take 30
microseconds or 3 milliseconds depending on whether it's in memory. Cost 378,868 versus cost
533,212 tells you exactly one thing: **Postgres will choose the first one.** It does not tell
you the first one is 40% faster. In your case it is roughly three times *slower*. That gap is
the whole course.

The bigger one. You said Postgres owns the table so it should know what's in there. It owns
the table, but it does not look at the table when planning — that would mean reading 12 million
rows to decide how to read 12 million rows. It reads a stored summary instead, built from a
sample of about 30,000 rows. So "the estimate is wrong" always has a cause, and stale numbers
are only one of them.

Your guess — stale statistics, hasn't run ANALYZE since the big seller ramped up — is the right
first instinct and it's the one most people reach for. It happens to be wrong here, and it's
worth knowing why, because it's the more interesting failure. I ran `ANALYZE orders` on a copy
of your production table before building module 2. The statistics are current. The estimate for
`seller_id = 8812` on its own is accurate. The estimate for `status = 'shipped'` on its own is
accurate. Put the two conditions in the same WHERE clause and the estimate is off by five
times. Every input is right and the output is wrong.

That's what module 2 is built around, and it's the answer to the seven seconds.

Module 2 is below. It opens the box on `rows=`: where the number comes from, the one
multiplication that produces it, the point at which a perfectly good index becomes the more
expensive plan, and the exact arithmetic that turns your 540,000 rows into 108,000. There are
three things in it you can turn. The question to answer before module 3 is in the block at the
end.

---

## MODULE 2

*This is the module artifact, written out as the composed prose a learner reads. Every figure
is described in words, every check is written out with its options and per-option feedback,
and every instrument is written out with its control, its variable, and what visibly changes.*

---

# Module 2 — Where `rows=` Comes From

**Module 2 of 3.** Module 1 ended on a chain: the estimated row count feeds the cost, the cost
picks the plan. That leaves one link unopened. Nobody has said where the estimated row count
comes from.

This module opens it. First the summary Postgres actually reads when it plans — you'll query it
directly, on your own table. Then the single multiplication that turns a WHERE clause into a
number. Then the point at which your `(seller_id, status)` index, which matches your query
perfectly, becomes the more expensive way to answer it. Then the one arithmetic step that turns
540,000 of your rows into 108,000.

By the last section you will be able to say out loud why the same query on the same index went
from 40 milliseconds to seven seconds, and why it only did it for one seller.

---

## 2.1 Postgres never counts. It reads a summary.

Open `psql` against a replica and run this:

```sql
SELECT attname, null_frac, n_distinct, most_common_vals, most_common_freqs
FROM pg_stats
WHERE tablename = 'orders' AND attname = 'status';
```

One row comes back. Here is what is in it for your table:

```
attname           | status
null_frac         | 0
n_distinct        | 7
most_common_vals  | {delivered,pending,cancelled,shipped,refunded,awaiting_stock,returned}
most_common_freqs | {0.67,0.11,0.075,0.06,0.05,0.026,0.009}
```

That is the whole of what Postgres knows about your `status` column at planning time. Seven
values, and how often each one shows up. Not 12 million rows — seven values and seven numbers.

The two lists line up position by position: `delivered` sits at 0.67, meaning 67% of sampled
rows had it; `shipped` sits at 0.06. The list of values has a name — the **most common values
list**, `most_common_vals`, the values that showed up often enough to be worth storing
individually — and the list of fractions beside it is `most_common_freqs`, one fraction per
value, in the same order.

`n_distinct` is 7: an estimate of how many different values the column holds in total. When
that number is small, as here, every value fits in the most common values list and there is
nothing left over.

For a column where the values *don't* all fit — `created_at`, which has millions of distinct
timestamps — Postgres stores something else in the leftover space. Run the same query against
`created_at` and `most_common_vals` comes back empty, but a field called `histogram_bounds`
is full:

```sql
SELECT attname, n_distinct, histogram_bounds
FROM pg_stats
WHERE tablename = 'orders' AND attname = 'created_at';
```

**Figure 2.1 — the histogram for `orders.created_at`.**
A single horizontal line representing time, running left to right from 2024-09-01 to
2026-09-01, with tick marks at the stored boundary values. Postgres stores 101 boundaries,
which carve the column into 100 buckets holding an equal number of rows each. Showing every
tenth boundary, so each gap below holds 10% of your table:

| boundary | date | rows below this point |
|---|---|---|
| 0 | 2024-09-01 | 0 |
| 10 | 2025-01-01 | 1,200,000 |
| 20 | 2025-04-16 | 2,400,000 |
| 30 | 2025-07-18 | 3,600,000 |
| 40 | 2025-10-10 | 4,800,000 |
| 50 | 2025-12-24 | 6,000,000 |
| 60 | 2026-03-01 | 7,200,000 |
| 70 | 2026-04-19 | 8,400,000 |
| 80 | 2026-06-05 | 9,600,000 |
| 90 | 2026-07-19 | 10,800,000 |
| 100 | 2026-09-01 | 12,000,000 |

The boundaries are computed by sorting the sampled `created_at` values and cutting at equal
counts; the dates above are the real quantiles of your order volume over those 24 months.

**What to notice:** the gaps are not equal in time. The first 10% of your rows covers four
months. The last 10% covers six weeks. That is not a bug in the histogram — it is the
histogram working. Buckets hold equal *rows*, not equal *time*, so a narrow bucket is
Postgres telling you that period was busy. Your monthly order volume roughly tripled across
those two years, and the bucket widths are where that shows up.

So: for a column with few distinct values, Postgres stores each value and its frequency. For a
column with many, it stores boundaries that cut the range into equal-count slices. Usually
both, for the same column — the common values individually, everything else as buckets.

Where does any of it come from? A command called **`ANALYZE`**, which walks a sample of the
table and writes this summary down. Autovacuum runs it for you in the background. And *sample*
is the load-bearing word: `ANALYZE` does not read the table. It reads roughly 30,000 rows —
300 rows per unit of the `default_statistics_target` setting, which ships at 100 — and
generalises from those.

You have done this exact thing. When you needed to know how big a JSON response was going to
get, you did not serialise all 12 million records and measure; you measured a hundred of them
and multiplied. `ANALYZE` is that, run over every column of every table, on a schedule. The
sample is the hundred records. The frequencies are your measured average size. The 12 million
is the multiplier.

It breaks in the same place your estimate broke: sampling tells you reliably how big the
*common* case is, and tells you very little about how many *different* shapes exist. That is
why `n_distinct` is the least trustworthy field in `pg_stats`, and why "7" for `status` is
exact while the equivalent number for `seller_id` is a guess.

**What to notice in this section:** planning is fast because it never touches your data. It
touches seven numbers. Everything module 1 showed you — the cost, the plan choice, the seven
seconds — is downstream of a summary built from 30,000 sampled rows.

---

### Check 2A — before you go on

*(Gate. Section 2.2 unlocks when this is answered.)*

**Format:** multiple choice, four options, one correct.

**Asks:** A plan node reads `Index Scan using orders_seller_status_idx on orders
(cost=0.56..378598.00 rows=108000 width=0)`. What is the `108000`?

- **A. The number of rows this node actually produced when the query ran.**
  *Targets:* conflating `rows=` with `actual rows` — reading the plan as a report of what
  happened rather than a prediction of what will.
  *Feedback if selected:* "That is `actual rows`, and it only appears when you run
  `EXPLAIN ANALYZE` — plain `EXPLAIN` never executes the query, so it cannot know. This line
  came from plain `EXPLAIN`, so `108000` is a prediction made before anything ran. Holding
  those two apart is the whole diagnostic you'll use in module 3."

- **B. Postgres's estimate of how many rows this node will produce.**
  *Correct.*
  *Feedback if selected:* "Right, and note where it sits — inside the node, not at the end.
  Every node predicts its own output, and the node above it prices its work using that
  prediction. One wrong estimate low in the tree makes every cost above it wrong too."

- **C. The number of rows in the `orders` table.**
  *Targets:* reading `rows=` as a property of the table rather than of this node's output.
  *Feedback if selected:* "The table has 12,000,000 rows — that number lives in
  `pg_class.reltuples`, not in the plan node. `rows=` belongs to the node: it is what this
  particular step expects to hand upward after its conditions are applied. Different nodes in
  the same plan carry different `rows=` values for exactly that reason."

- **D. A limit — the most rows this node is permitted to return.**
  *Targets:* reading the planner as enforcing constraints rather than making predictions.
  *Feedback if selected:* "Nothing in the plan constrains the row count except a `LIMIT` you
  wrote yourself, and that appears as its own `Limit` node. The planner predicts; it does not
  cap. This node returned 540,000 rows when it ran, five times its own prediction, and nothing
  stopped it."

---

## 2.2 One multiplication produces `rows=`

The claim, in one sentence: Postgres turns each condition in your WHERE clause into a fraction,
then multiplies that fraction by the number of rows in the table.

Take `status = 'shipped'`. Postgres looks up `shipped` in the most common values list from
section 2.1, finds it at position four, reads 0.06 out of the frequency list beside it, and
multiplies:

`0.06 × 12,000,000 = 720,000`

That is the whole computation. The `rows=` for a node filtering on `status = 'shipped'` is
720,000, and it is right — your table really does hold 720,000 shipped orders.

Two names for the two halves, now that you have seen them work. The fraction — the share of
the table a condition keeps — is the condition's **selectivity**. Selectivity 0.06 means "keeps
6 rows in every 100". And the row count that comes out of the multiplication is the node's
**cardinality**: the number of rows a step is expected to produce. When someone says the
planner made a bad cardinality estimate, they mean this number came out wrong.

The 12,000,000 is not a live count either. It is `reltuples` in `pg_class`, written down by the
same `ANALYZE` run, alongside `relpages` — the number of 8-kilobyte pages the table occupies on
disk, which for `orders` is 352,942, about 2.9 GB.

### Instrument M2-A — the selectivity lookup

**Control:** a picker with the seven values of `status` on it — `delivered`, `pending`,
`cancelled`, `shipped`, `refunded`, `awaiting_stock`, `returned`.

**Variable it changes:** which frequency gets pulled out of `most_common_freqs` — that is, the
selectivity of the condition `status = <your pick>`.

**What visibly changes:** three things update together — the highlighted entry in the most
common values list, the multiplication written out underneath it
(`selectivity × 12,000,000 = rows`), and a live plan line at the bottom whose `rows=` and
`cost=` both move. Above about 162,000 rows the plan line's node name flips from
`Index Scan using orders_seller_status_idx` to `Seq Scan on orders`.

**Guided experiment:**

1. Pick `returned`. Selectivity 0.009, so `rows=108000`, and the plan line shows an Index Scan
   costing 378,598.
2. Now pick `refunded`. Selectivity 0.05, `rows=600000`, and the plan line has switched to a
   Seq Scan costing 532,942. Nothing changed but one value in the WHERE clause. Same index,
   same table, same query shape.
3. Step back down through `awaiting_stock` (0.026) and watch for the point where it flips
   back. It flips between `awaiting_stock` and `refunded`.

**Check on the instrument:**

**Format:** multiple choice, four options.

**Asks:** Using the instrument, which single `status` value produces the largest `rows=`, and
what plan does the planner choose for it?

- **A. `delivered`, and it chooses a Seq Scan.**
  *Correct.*
  *Feedback:* "0.67 × 12,000,000 = 8,040,000 rows — two thirds of the table — and the planner
  goes for the sequential scan. The index exists and matches, and it is still not close."

- **B. `delivered`, and it chooses an Index Scan, because the index covers `status`.**
  *Targets:* the belief that a matching index is used whenever it matches. This is the idea
  section 2.3 takes apart.
  *Feedback:* "The value is right and the plan is not. `delivered` really is the biggest at
  8,040,000 rows. But watch the plan line in the instrument at that setting — it reads
  `Seq Scan on orders`. An index that matches perfectly can still lose. Section 2.3 is
  entirely about why."

- **C. `shipped`, because it is the one your dashboard filters on.**
  *Targets:* anchoring on the query in front of you instead of reading the frequencies.
  *Feedback:* "`shipped` is at 0.06, fourth in the list. `delivered` at 0.67 is more than ten
  times larger. The condition your query happens to use has no bearing on which value is
  common — that comes out of the frequency list and nothing else."

- **D. `returned`, because rare values need the most work to find.**
  *Targets:* inverting selectivity — reading "rare" as "expensive".
  *Feedback:* "It runs the other way. `returned` is the rarest at 0.009, so it produces the
  *fewest* rows — 108,000 — and rare is exactly the case an index handles cheaply. The work
  scales with rows found, not with how hard they were to find."

**What to notice in this section:** you can now compute `rows=` by hand for any single-column
equality condition on your table. Read the frequency out of `pg_stats`, multiply by `reltuples`,
done. Hold onto that, because in section 2.4 you are going to compute one and get a number that
is badly wrong, using the same correct method.

---

## 2.3 An index that matches perfectly can still be the wrong plan

Here is the thing that makes the hook's scenario possible at all.

An index scan and a sequential scan do not just differ in speed. They charge differently.

A sequential scan reads all 352,942 pages of `orders` from beginning to end, in page order, and
throws away the rows that don't match. It costs the same whether one row matches or eight
million: 352,942 pages read in order, plus a small charge for looking at each of the 12 million
rows. The price is fixed, and it is paid up front.

An index scan reads only the index entries that match, and for each one, jumps to the page
holding that row. Every jump is a separate read at a separate place on disk. The price is per
matching row, and it is zero when nothing matches.

So you have a fixed price against a per-row price, and there is a quantity at which they cross.

This is the manual from module 1 again — the printed manual with an index at the back, where
the manual is your table, a page is a disk page, an index entry is one row's location, and
flipping to a page is one random read. Looking up three things in the back of the manual and
flipping to three pages beats reading the manual cover to cover. Looking up four hundred
thousand things does not. At some point the flipping costs more than the reading, and it
costs more even though the index is correct, complete, and exactly matches what you asked.
Where it breaks, same as module 1: a page you already have open is free to read again, and
Postgres has the same advantage through caching, which is why the crossing point moves on a
machine with more memory.

Postgres prices those two kinds of work with settings you can read:

- `seq_page_cost` = 1.0 — reading one page in order.
- `random_page_cost` = 4.0 — jumping to one page out of order. Four times the price.
- `cpu_tuple_cost` = 0.01 — looking at one row once it is in memory.

**Figure 2.2 — where the two plans cross, for your `orders` table.**
A line chart. The horizontal axis is the number of rows matching the WHERE clause, from 1,000
to 2,400,000, on a logarithmic scale. The vertical axis is estimated cost, 0 to 1,500,000. Two
lines: the sequential scan is flat at 532,942 all the way across, because it does the same work
regardless. The index scan starts near zero at the left, climbs steeply, crosses the flat line,
then bends and flattens out near 1,450,000 on the right — it flattens because past a certain
point the scan has touched every page in the table anyway, so there is nothing left to fetch
again. The two lines cross at 162,000 matched rows.

Every number below is computed from Postgres's own cost formulas with the default cost
settings, on your table's real geometry — 12,000,000 rows, 352,942 heap pages, and a 401 MB
index on `(seller_id, status)`:

| rows matched | index-scan cost | seq-scan cost | planner picks |
|---|---|---|---|
| 12,000 | 47,634 | 532,942 | Index Scan |
| 60,000 | 223,378 | 532,942 | Index Scan |
| 108,000 | 378,598 | 532,942 | Index Scan |
| **162,000** | **532,929** | **532,942** | **the crossing point** |
| 240,000 | 725,137 | 532,942 | Seq Scan |
| 400,000 | 1,035,808 | 532,942 | Seq Scan |
| 540,000 | 1,243,414 | 532,942 | Seq Scan |
| 900,000 | 1,444,462 | 532,942 | Seq Scan |

**What to notice:** the crossing point is at 162,000 rows, which is **1.35% of your table**.
Not half. Not a third. Between one and two percent. Past that, the index is the expensive plan.
And notice the right-hand end: at 540,000 rows the index plan costs 1,243,414 against the
sequential scan's 532,942. Choosing the index there is not a near-miss. It is 2.3 times the
work of the plan it beat.

There is a third option Postgres reaches for in the middle of that range, and you will see it
in plans: a **Bitmap Heap Scan**, which collects all the matching row locations from the index
first, sorts them into page order, and then reads those pages in one forward sweep instead of
jumping around. It gets some of the sequential discount while still skipping pages that hold
nothing. It shows up as a pair of nodes, `Bitmap Index Scan` feeding `Bitmap Heap Scan`, and it
is the planner's answer to "more than a handful, less than most".

### Instrument M2-B — the crossover

**Control:** a slider labelled "rows matching the WHERE clause", from 1,000 to 2,400,000, with
a numeric box beside it for typing an exact value.

**Variable it changes:** the estimated cost of the index-scan plan, recomputed at each slider
position from the cost formulas above. The sequential-scan cost does not change, because
nothing about a sequential scan depends on how many rows match.

**What visibly changes:** two horizontal cost bars side by side, one per plan, scaled against
each other; the numeric cost printed on each; and a label above them reading "planner picks:
Index Scan" or "planner picks: Seq Scan", which flips when the bars cross.

**Guided experiment:**

1. Set the slider to 12,000. The index bar is a stub next to the sequential bar — 47,634
   against 532,942. This is roughly where your query sat last year.
2. Drag right slowly and watch the index bar grow while the other one does not move at all.
   That immobility is the point: the sequential scan is not competing, it is just sitting
   there at a fixed price.
3. Push past 162,000 and the label flips. Keep going to 2,400,000 and watch the index bar
   stop growing much — it flattens near 1,450,000 because by then it has touched every page in
   the table, and there are no more pages to fetch.

**Check on the instrument:**

**Format:** set-the-control — move the slider and read the answer off it. Numeric entry,
accepted band 150,000–175,000.

**Asks:** Set the slider until the label flips from "Index Scan" to "Seq Scan". At roughly how
many matched rows does that happen?

- **Accepted: any value from 150,000 to 175,000.**
  *Feedback:* "162,000, which is 1.35% of the table. Worth converting that to a percentage and
  remembering the percentage rather than the count — the count changes every time the table
  grows, the percentage barely moves."

- **Answer below 150,000 (e.g. 12,000 or 60,000):**
  *Targets:* reading the point where the index bar becomes *visible* rather than where it
  becomes *longer*.
  *Feedback:* "That's below the crossing. At 60,000 the index plan costs 223,378 against
  532,942 — the index bar is clearly growing, but it is still the shorter one. The flip is
  where the bars are equal in length, not where the index bar starts to look substantial."

- **Answer between 175,000 and 600,000:**
  *Targets:* overshooting because the index bar looks dramatic once it is past the line.
  *Feedback:* "Past it. Drag back down — at 240,000 the label already reads Seq Scan, so the
  flip happened earlier. The first crossing is at 162,000. Anything above that is on the wrong
  side of a decision that was already made."

- **Answer above 6,000,000 (i.e. half the table or more):**
  *Targets:* the strong intuition that an index only loses when you are reading "most" of the
  table.
  *Feedback:* "This is the intuition worth breaking. The crossing is at 1.35% of the table,
  not 50%. An index stops paying much earlier than it feels like it should, because every
  matching row costs a jump to a different page at four times the price of a sequential one,
  while the sequential scan pays its whole bill once."

**What to notice in this section:** "there is an index on those columns" and "the index is the
right plan" are two different statements, and the second one depends on a quantity. Which means
it depends on the estimate of that quantity — which is section 2.4.

---

### Check 2B — before you go on

*(Gate. Section 2.4 unlocks when this is answered.)*

**Format:** matching — four `pg_stats` fields on the left, four questions on the right, drag
each field onto the question it answers. All four must be placed correctly to pass.

**Asks:** Match each field to the question it answers for the planner.

| Field | Correct match |
|---|---|
| `most_common_freqs` | "What share of the table holds this specific value?" |
| `histogram_bounds` | "What share of the table falls between these two values?" |
| `n_distinct` | "How many different values does this column hold?" |
| `reltuples` | "How many rows are in the table at all?" |

**Per-placement feedback:**

- `most_common_freqs` → *the specific-value question:* "Right. This is the list you read 0.06
  out of for `shipped` in section 2.2, and it only covers values common enough to be stored
  individually."
- `most_common_freqs` → *the between-two-values question:* "That one is the histogram's job.
  The frequency list holds one number per stored value; it has nothing to say about ranges,
  which is why a `created_at > x` condition never touches it."
- `histogram_bounds` → *the between-two-values question:* "Right — and this is how Postgres
  estimates a date range: find which buckets the range covers, and each whole bucket is 1% of
  the table."
- `histogram_bounds` → *the how-many-different-values question:* "The boundaries tell you where
  the rows sit, not how many different values exist. Two adjacent boundaries could have a
  million distinct timestamps between them or one repeated a million times; the histogram
  cannot tell those apart. `n_distinct` is the field for that."
- `n_distinct` → *the how-many-different-values question:* "Right, and it is the shakiest field
  in the row — a 30,000-row sample can measure how common the common things are, but it is a
  poor way to count how many different things exist."
- `n_distinct` → *the how-many-rows question:* "Distinct values, not rows. `status` has
  `n_distinct = 7` and 12,000,000 rows. The row count lives in `reltuples`."
- `reltuples` → *the how-many-rows question:* "Right — and it is an estimate too, written down
  by the last `ANALYZE`, not a live count. It is the number you multiplied selectivity by in
  section 2.2."
- `reltuples` → *the specific-value question:* "`reltuples` knows nothing about values; it is
  one number for the whole table. It is the multiplier in `selectivity × reltuples`, and
  `most_common_freqs` supplies the other half."

---

## 2.4 The one estimate Postgres gets wrong on your query

Your dashboard does not filter on one column. It filters on two:

```sql
SELECT count(*) FROM orders WHERE seller_id = 8812 AND status = 'shipped';
```

So compute the estimate by hand, the way section 2.2 showed you.

Seller 8812 is big enough to be stored individually in the most common values list for
`seller_id`, at frequency 0.15. Check that against reality: they have 1,800,000 orders out of
12,000,000. Fifteen percent. **The estimate for that condition alone is exactly right.**

`shipped` sits at 0.06. Reality: 720,000 shipped orders out of 12,000,000. Six percent. **The
estimate for that condition alone is exactly right too.**

Now Postgres combines them. It multiplies:

`0.15 × 0.06 = 0.009`, and `0.009 × 12,000,000 = 108,000`

There is your `rows=108000`. And the true answer, the one the query returns, is **540,000**.

Both inputs were right. The output is five times too small. Nothing is stale, nothing is
missing, nothing needs rebuilding.

Multiplying two fractions is what you do when the two things are unrelated. If 15% of your
orders belong to seller 8812, and 6% of all orders are shipped, then 6% of *seller 8812's*
orders should be shipped — that is what the multiplication assumes. It has a name: the
**independence assumption**, the planner's default belief that knowing the value of one column
tells you nothing about the value of another.

For most pairs of columns in most tables, it holds well enough. For yours it does not, and you
already told me why: seller 8812 batch-ships weekly. They push a whole week out at once, so
they sit on a large pile of orders in `shipped` that have not been delivered yet. Thirty
percent of their orders are shipped, against under two percent for everybody else. Knowing the
order is theirs tells you a great deal about its status. The two columns are related, and the
planner's arithmetic has no way to represent that.

### Instrument M2-C — the independence assumption

**Control:** a dial labelled "share of seller 8812's orders currently in `shipped`", running
from 1% to 60%. Your real value is 30%.

**Variable it changes:** the true number of rows matching the WHERE clause, computed as
`1,800,000 × dial`. It changes nothing else — in particular it does not change anything
Postgres stores per column.

**What visibly changes:** two vertical bars side by side. The left bar, "what the planner
estimates", stays at 108,000 and does not move no matter where you put the dial. The right bar,
"what is actually there", tracks the dial. A dashed horizontal line sits across both at
162,000, labelled "crossing point", and each bar is captioned with the plan that would be
correct at its height.

**Guided experiment:**

1. Set the dial to 6%. Both bars are the same height — 108,000 and 108,000. This is the world
   the planner believes in: the seller's shipped-rate equal to everyone's. When the columns
   really are unrelated, the multiplication is right, and both bars sit under the dashed line,
   so the index plan is chosen and is correct.
2. Turn the dial up to 30%, your real number. The left bar does not move. The right bar climbs
   past the dashed line to 540,000. The captions now disagree: the planner's bar still says
   "Index Scan", the true bar says "Seq Scan".
3. Turn the dial slowly back down and find where the right bar touches the dashed line. It is
   at 9%. Anywhere below that, the planner's wrongness does not cost you anything — the
   estimate is too low but both numbers land on the same side of the crossing, so the same
   plan wins either way.

**What to notice:** the left bar never moves. That is the entire mechanism. The planner's
number is not sensitive to the thing that actually changed, because nothing it stores is about
the *pair* of columns — it stores a summary of `seller_id` and a summary of `status`, and
multiplies.

**Check on the instrument:**

**Format:** multiple choice, four options.

**Asks:** With the dial anywhere between 1% and 60%, what happens to the left bar — the
planner's estimate?

- **A. It never moves; it stays at 108,000 at every dial position.**
  *Correct.*
  *Feedback:* "That is the failure in one sentence. The estimate is computed from two
  single-column summaries, and the dial changes neither of them — it changes only the
  relationship between the columns, which is the one thing nothing in `pg_stats` records."

- **B. It rises with the dial, but more slowly than the true bar.**
  *Targets:* the belief that the estimate is partially sensitive — that it half-tracks reality
  and is merely imprecise.
  *Feedback:* "It does not track at all. Run the dial from 1% to 60% and read the left bar at
  each end: 108,000 both times. This matters for how you'd fix it — a partly-sensitive
  estimate could be improved by sampling harder, and this one cannot, because more samples of
  each column separately still produce 0.15 and 0.06."

- **C. It rises once the true bar crosses the dashed line, because the planner notices the
  crossing.**
  *Targets:* imagining feedback from execution back into planning — that Postgres learns from
  a plan that went badly.
  *Feedback:* "There is no feedback loop. Postgres plans this query the same way on the
  ten-thousandth run as on the first, and running it slowly teaches it nothing. That is why
  this can go unnoticed for six months."

- **D. It drops, because a higher share of shipped orders makes the condition more selective.**
  *Targets:* inverting selectivity — a more common value read as a narrower filter.
  *Feedback:* "More common means more rows, not fewer. A condition matching 30% of a seller's
  orders keeps more of them than one matching 6%. And in any case the left bar is not reading
  the dial — it is fixed at 108,000."

---

## 2.5 Why it was fine last year

Everything is now in place to answer the thing you guessed at when we started.

Rewind to the 900,000-row table. Seller 8812 was a normal customer then: 120,000 orders, 13.3%
of the table, and 8,000 of those in `shipped` — 6.7% of theirs, against 6% across everyone.
Their status mix looked like everybody's. The columns were, for practical purposes, unrelated.

Run the estimate: `0.133 × 0.06 × 900,000 = 7,200`. True answer: 8,000. Close.

Run the crossing point on that table: 12,150 rows, the same 1.35% of a smaller table. Both
7,200 and 8,000 are well under it. So the planner chose the index scan, costed at 28,090
against the sequential scan's 39,971 — **and the index scan was genuinely the right plan**. The
endpoint came back in 40 milliseconds. Nothing was wrong, and nothing was quietly wrong either.

Now, what actually changed? Two things, and you need both.

**Their volume grew.** 120,000 orders became 1,800,000. But test that on its own: if their
status mix had stayed at 6.7%, they would now match 120,600 rows. The estimate would be
108,000, the truth 120,600, both still under the crossing point of 162,000, and the index scan
would still be chosen and still be right, at a cost of 416,390 against 532,942. Growth alone
does not break this.

**Their behaviour changed.** They moved to weekly batch shipping, and their shipped share went
from 6.7% to 30%. Test that on its own too: if they had stayed at 120,000 orders, 30% of them
is 36,000 rows — the estimate would be badly wrong at 7,200, and it would not matter, because
36,000 is still under the crossing point. The right plan is the index scan either way.
Correlation alone does not break this.

Put both together and 1,800,000 × 30% = 540,000 rows. That is 3.3 times the crossing point,
while the estimate sits at 108,000, which is 0.67 of it. The estimate and the truth are on
opposite sides of the line for the first time. Postgres picks the index scan — correctly, for
the number it believes — and pays 1,243,414 in cost units where 532,942 was available. On your
hardware that is 6.8 seconds where 2.1 was on offer.

So the answer to the hook is not that Postgres stopped using the index, and not that there are
simply more rows to count. It is that growth was **uneven**. One seller grew faster than the
table and changed shape while doing it, and the summary Postgres plans from has a slot for how
big they got and no slot at all for how they changed.

**The fold-back:** `rows=` is one multiplication over a sampled summary, the plan is chosen by
comparing costs computed from that number, and your query is slow because the multiplication
assumes your two columns have nothing to do with each other, on the one seller for whom they
have everything to do with each other.

---

## Check yourself

*Six items. Answer them in any order; each one tells you why the options you didn't pick are
wrong.*

---

**Item 1 — numeric entry.**

**Asks:** Your `orders` table has 12,000,000 rows. From the `most_common_freqs` list in section
2.1, `cancelled` sits at 0.075. What number will Postgres put in `rows=` for a node filtering
`WHERE status = 'cancelled'`?

**Format:** type a number. Accepted: 882,000 to 918,000 (900,000 ± 2%).

- **Correct (≈900,000):**
  "0.075 × 12,000,000 = 900,000. That is the entire computation, and you can now do it for any
  single-column equality condition on this table without running anything."
- **Answer near 0.075, 7.5, or 0.9:**
  "That is the selectivity, or the selectivity as a percentage — the fraction the condition
  keeps. `rows=` is a row count, so it needs the second half: multiply by `reltuples`,
  12,000,000."
- **Answer near 12,000,000:**
  "That is `reltuples`, the whole table. The filter keeps 7.5% of it. `rows=` on a node is
  always what comes *out* of that node after its conditions, not what went in."
- **Answer near 160,000:**
  "That looks like the crossing point from section 2.3, which is about which plan wins, not
  about how many rows match. Those are separate numbers: 900,000 rows match, and because
  900,000 is far above 162,000, the planner will pick a sequential scan for this one."
- **Any other number:**
  "Check the two halves separately. Selectivity for `cancelled` is 0.075, straight out of
  `most_common_freqs`. `reltuples` is 12,000,000. Multiply."

---

**Item 2 — set the control.**

**Asks:** Open instrument M2-C. Turn the dial until the true row count first reaches the
crossing point at 162,000 — the position where the planner's choice starts costing you
something. What dial position is that?

**Format:** set the dial, then type the percentage. Accepted: 8% to 10%.

- **Correct (9%):**
  "9%. Below that, the estimate is still wrong — 108,000 against a true 144,000 at 8% — but
  both numbers sit under the crossing point, so the index plan wins either way and the
  wrongness is free. The estimate being wrong and the estimate mattering are two different
  events."
- **Answer near 6%:**
  "6% is where the estimate is *correct* — both bars at 108,000 — which is a different
  landmark. The question asks where the true bar reaches the dashed line, and at 6% the true
  bar is well below it."
- **Answer near 30%:**
  "30% is your real, current value, where the true count is 540,000 — more than three times
  past the crossing. The question asks where it *first* reaches it, which is lower down the
  dial."
- **Answer above 40%:**
  "Turn back down. The dashed line sits at 162,000, which is 9% of this seller's 1,800,000
  orders. Anything above 40% puts the true bar four or five times past it."

---

**Item 3 — order these steps.**

**Asks:** A different query, on a different table:

```sql
SELECT o.id, count(i.id)
FROM orders o JOIN order_items i ON i.order_id = o.id
WHERE o.created_at >= '2026-08-01'
GROUP BY o.id;
```

Put the six things Postgres does with it into the order it does them.

**Format:** drag six cards into order.

**Correct order:**
1. Parse the SQL and confirm the tables and columns exist.
2. Read the stored column summaries for `created_at`, `id` and `order_id`.
3. Estimate how many rows each possible step would produce.
4. Price each candidate plan, using those row estimates.
5. Pick the plan with the lowest total cost.
6. Execute that plan.

**Per-misplacement feedback:**

- *Execution placed anywhere but last:* "Execution is last, and that separation is what makes
  plain `EXPLAIN` instant on a query that takes seven seconds to run — it stops after step 5.
  `EXPLAIN ANALYZE` is the version that goes on to step 6."
- *Pricing (4) placed before estimating rows (3):* "Cost is computed from row counts, so the
  row counts have to exist first. A plan node's price is 'how many pages will this touch and
  how many rows will it handle' — both of which need the estimate. This ordering is the reason
  a wrong estimate produces a wrong price and not just a wrong prediction."
- *Reading the summaries (2) placed after estimating (3):* "The estimate is computed *from* the
  summaries — the frequency lists and histograms are the raw material. Nothing can be estimated
  before they are read."
- *Choosing (5) placed before pricing (4):* "There is nothing to choose between until the
  candidates have prices. Choosing is just picking the smallest number produced by step 4."
- *Parsing (1) not first:* "Parsing has to come first — until the SQL is parsed, Postgres does
  not know which tables or columns are involved, so it does not know which summaries to read."

---

**Item 4 — multiple choice.**

**Asks:** You run `EXPLAIN ANALYZE` on a report query over `order_items` and one node reads:

```
Bitmap Heap Scan on order_items  (cost=1204.55..98430.12 rows=3100 width=48)
                                 (actual time=18.402..4412.905 rows=1860000 loops=1)
```

What is the first thing you should conclude from this line?

- **A. The node is slow, so `order_items` needs an index.**
  *Targets:* jumping to a remedy from the time alone, without reading the two row counts.
  *Feedback:* "The time tells you there is a problem; it does not tell you what the problem is.
  Read the two row counts first: expected 3,100, got 1,860,000. Adding an index to a query
  whose plan was chosen from a 600-fold-wrong estimate will most likely produce a differently
  wrong plan."

- **B. The estimate is 600 times too low, so every cost above this node was computed from a
  wrong number and the plan choice cannot be trusted.**
  *Correct.*
  *Feedback:* "That is the reading. `rows=3100` is the prediction, `rows=1860000` after
  `actual` is what happened. When those disagree by orders of magnitude, the interesting
  question is no longer whether this node is slow — it is which plans got dismissed on the
  strength of a number that was wrong before anything ran."

- **C. Nothing is wrong; a Bitmap Heap Scan is the efficient plan for this shape.**
  *Targets:* reading the node type as a verdict — "it picked a good scan type, so it's fine".
  *Feedback:* "A Bitmap Heap Scan is a reasonable plan for a moderate number of rows, which is
  exactly what the planner thought it had — 3,100. It got 1,860,000. The node type was chosen
  under the same wrong estimate as everything else, so it is not independent evidence that the
  plan is right."

- **D. The query returned 1,860,000 rows to the client, which is too many for a report.**
  *Targets:* reading a node's output as the query's output.
  *Feedback:* "`actual rows` belongs to this node, not to the query. Nodes above it — a filter,
  a join, an aggregate — may cut that down to a handful before anything reaches the client.
  Every node reports its own output, which is why you read the tree from the inside out."

---

**Item 5 — multiple choice.**

**Asks:** For `WHERE seller_id = 8812 AND status = 'shipped'`, the estimate for `seller_id =
8812` on its own is accurate, the estimate for `status = 'shipped'` on its own is accurate, and
the estimate for the two together is five times too low. What is the cause?

- **A. The statistics are stale — `ANALYZE` has not run since seller 8812 ramped up.**
  *Targets:* the default explanation for any wrong estimate, and the one most people reach for
  first.
  *Feedback:* "Stale statistics do cause wrong estimates, and this would be the right first
  guess in general. It is ruled out here by the first two facts in the question: if the summary
  were out of date, the single-column estimates would be wrong too. They are exactly right, so
  the stored numbers are current. Running `ANALYZE` again would rewrite the same 0.15 and the
  same 0.06."

- **B. The index is missing a column, so Postgres has to guess at the part it does not cover.**
  *Targets:* locating the failure in the index rather than in the estimate — the instinct that a
  wrong plan means a wrong index.
  *Feedback:* "The index covers both columns — it is on `(seller_id, status)`, which is exactly
  the pair being filtered. And indexes have no role in estimation at all: the row count is
  computed from `pg_stats` before any index is considered. Postgres would produce the same
  108,000 with no indexes on the table whatsoever."

- **C. Postgres estimates the pair by multiplying the two separate fractions, which assumes the
  columns are unrelated — and for this seller they are strongly related.**
  *Correct.*
  *Feedback:* "0.15 × 0.06 = 0.009, and 0.009 × 12,000,000 = 108,000. The multiplication is
  correct arithmetic on correct inputs, resting on an assumption that is false for this seller:
  30% of their orders are shipped against under 2% for everyone else. Nothing stored in
  `pg_stats` is about a *pair* of columns, so there is no place for that fact to live."

- **D. The table needs `VACUUM` — dead rows from updates are inflating the count.**
  *Targets:* the physical-maintenance explanation, alongside REINDEX. Real mechanism, wrong one
  here.
  *Feedback:* "`VACUUM` reclaims space left by deleted and updated rows, and heavy bloat does
  distort `reltuples` and slow scans. But it would distort the single-column estimates in the
  same direction, and those are right. The failure is specific to the combination, which points
  at how combinations are computed, not at the physical state of the table."

---

**Item 6 — matching.**

**Asks:** Three conditions, three `rows=` values Postgres produced for them. Drag each condition
onto the part of `pg_stats` the number came from.

| Condition | `rows=` | Correct source |
|---|---|---|
| `status = 'shipped'` | 720,000 | `most_common_freqs` — the stored frequency for that value |
| `created_at >= '2026-07-19'` | 1,200,000 | `histogram_bounds` — the range covers the last 10 of 100 equal-count buckets |
| `seller_id = 41207` (a small seller) | 140 | `n_distinct` — the value is not in the most common values list, so the leftover share is divided among the remaining distinct values |

**Per-placement feedback:**

- `status = 'shipped'` → `most_common_freqs`: "Right. Seven values, all of them stored
  individually, so this one is a direct lookup: 0.06 × 12,000,000."
- `status = 'shipped'` → `histogram_bounds`: "There is no histogram for `status`. With only
  seven distinct values, all of them fit in the most common values list and nothing is left
  over to bucket. Run the `pg_stats` query from section 2.1 and `histogram_bounds` comes back
  empty for that column."
- `created_at >= '2026-07-19'` → `histogram_bounds`: "Right — that date is the 90th boundary,
  so the condition covers the top ten buckets, and each bucket holds 1% of the table by
  construction. 10% of 12,000,000 is 1,200,000."
- `created_at >= '2026-07-19'` → `most_common_freqs`: "A range condition cannot use the
  frequency list even when one exists, because that list answers 'how often is the value
  exactly *this*', and a range asks about everything between two points. Ranges are what the
  histogram is for."
- `seller_id = 41207` → `n_distinct`: "Right. The most common values list holds only the top
  100 sellers, and this one is not among them. Postgres takes the share not covered by that
  list — about 0.58 — and spreads it evenly over the remaining 49,900 distinct sellers:
  0.58 ÷ 49,900 × 12,000,000 ≈ 140."
- `seller_id = 41207` → `most_common_freqs`: "Only if the seller were in that list, and with
  around 50,000 sellers and room for 100, most are not. Seller 8812 at 15% is; seller 41207 is
  not, so their estimate is an average over everyone the list left out — which is also why the
  estimate for a small seller is much shakier than the one for the big one."
- Any condition → `reltuples`: "`reltuples` is the multiplier in every one of these, not the
  source of any of them. It supplies the 12,000,000; the question is where the fraction in
  front of it came from."

---

> ## Before module 3
>
> **What this module showed:** `rows=` is one multiplication — a fraction from a sampled
> summary, times the table's row count — and your dashboard is slow because that multiplication
> assumes `seller_id` and `status` are unrelated, on the one seller for whom they are not, which
> lands the estimate on the wrong side of a crossing point that sits at 1.35% of the table.
>
> **Module 3** is the repair. Three fixes that are not interchangeable: make the number true,
> make the index cheap enough that the number stops mattering, or stop asking the question at
> all. That is where the 40-milliseconds-to-seven-seconds story gets an ending you can ship.
>
> **Head back to the chat and answer this before module 3:**
>
> *You could either make the planner's number right, or make the index cheap enough that the
> wrong number stops mattering. For this query, on this table, which one would you pick — and
> what breaks if you pick the other one?*

---
