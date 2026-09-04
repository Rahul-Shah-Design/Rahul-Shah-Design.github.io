# Round 1 — diagnosis

## Scores across the batch (critic-assigned, 1–5)

| Axis | W1 sourdough | W2 postgres | W3 greeks | mean |
|---|---|---|---|---|
| Hook discipline | 5 | 4 | 3 | 4.0 |
| Plan as contract | 3 | 3 | 2 | 2.7 |
| Jargon & concrete-before-abstract | 5 | 3 | 2 | 3.3 |
| Analogy discipline | 4 | 3 | 4 | 3.7 |
| Checks (gradability, per-option, mix, lag) | 3 | 3 | 3 | 3.0 |
| **Interleaving** | **2** | **2** | **2** | **2.0** |
| Instruments | 3 | 2 | 4 | 3.0 |
| Handoff & boundary adaptation | 3 | 3 | 3 | 3.0 |
| Prose is real composed content | 5 | 3 | 2 | 3.3 |

Interleaving is the lowest mean and the only axis all three critics scored identically,
at the bottom. It is unanimous, not an artifact of one hard pair.

## The single failure

**Interleaving is self-certified. The skill asks for reformulated callbacks and supplies
no test that separates a reformulation from a reissue — so every author changed the
wrapper, wrote "reformulated" in the plan, and shipped the earlier item unchanged.**

The mechanism is identical in all three, and in all three the plan contains a written
claim of compliance that is false:

- **W1.** Module 2 item 4 is Module 1's numeric item: "same jar, same 480 g, same
  doubling, same answer." The plan asserts otherwise — *"Both reformulated: M1 delivered
  them as prose about flour and gluten; they come back as a sequence to order and as a
  kitchen scale reading"* — and the critic notes the plan's own Module 1 section shows
  they came as a sequence to order and a kitchen scale reading the first time too.
- **W2.** The order-these-steps callback gets a new stem (a join, a `GROUP BY`, a date
  range) and six identical cards: *"Neither the join nor the range condition is
  load-bearing for a single card. The discrimination is identical to module 1's and so is
  the answer; only the decoration above it changed."*
- **W3.** Item 6 is Module 1's drag-to-label: *"Same format, same three prices, same three
  numbers, same task."* The plan again narrates a reformulation that did not happen —
  *"reformulated as a matching item rather than the numeric it was in M1"* — when in M1 it
  was already a matching item.

Two critics independently named the self-certification as the core of it:

> "Stating the ratio is not meeting it." — W3
> "The arithmetic is honoured; the discrimination the rule protects is not." — W1

## Why this is the highest-leverage fix

The skill already knows how to make a rule stick: it supplies falsifiable tests elsewhere,
and those axes scored better. The check-placement rule has one — *"could the artifact tell
a right answer from a wrong one on its own?"* The instrument rule has one — *"name the
control, the variable it changes, and what visibly changes. If you can't name all three,
it is a diagram."* Interleaving has an illustrative example but no criterion an author can
fail, so compliance collapses into asserting compliance.

Interleaving is also the rule the skill stakes the most on: it calls it "the whole reason
to build a course in modules rather than one artifact." It is currently the weakest thing
in the course.

## Rejected alternatives

- *Fabricated data asserted as measured* (W2's top finding) — severe, but W2-specific.
  W1's and W3's figures were computed and spot-checked clean by their critics.
- *Modules 1 and 3 delivered as stage directions* — an artifact of the harness scoping
  output to one module, not a skill defect.
- *Checks answered by the prose directly above them* — real, appears in W1 and W2, but the
  skill already states the lag rule plainly (#28) and the misses are local rather than
  systematic.
