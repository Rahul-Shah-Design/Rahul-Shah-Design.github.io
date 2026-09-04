# Where this stress test stands

**Round 1 complete. Edit 1 applied but NOT yet verified.**

## What has happened

| Round | Working pairs | Diagnosed failure | Edit | Verified? |
|---|---|---|---|---|
| 1 | W1 sourdough, W2 postgres, W3 greeks | Interleaving is self-certified — no test separates a reformulation from a reissue | `SKILL.md` §3, 5 lines added after the reformulation paragraph | **No — held-out pairs not yet run** |

## The open obligation

Edit 1 is in `SKILL.md` on the strength of the round-1 working set only. It has **not**
been checked against the held-out pairs. Round 2 must begin by running H1 and H2 against
the edited skill and comparing them to nothing — there is no pre-edit held-out baseline,
because round 1 spent its budget on the working set.

**So round 2 starts with a baseline run of H1 and H2 on the *pre-edit* skill**
(`git show 66d4e54:chiron-stress-test/SKILL.md`, or any commit before the edit), so
that later rounds have something to regress against. Do that before, or in parallel with,
the round-2 working set.

## Rules carried forward (from the original brief)

- Held-out pairs H1 and H2 are **fixed** and never used to decide an edit.
- Working pairs rotate each round; 3 per round.
- Score over the batch, never a single course.
- One surgical edit per round, shown as a diff and approved before it is applied.
- Keep an edit only if the held-out pairs do not regress; otherwise revert the commit.
- If two rounds in a row fail to improve the held-out pairs, stop and report the failure
  as structural rather than prose-fixable.
- Cap: 4 rounds.

## How to re-run

Authoring agents: one per pair, concurrent, each given `AUTHOR-PROMPT.md` plus its pair,
writing to `rounds/roundN/artifacts/`.
Critic agents: fresh context, given only the artifact and `CRITIC-CHECKLIST.md` — never
`SKILL.md` — writing to `rounds/roundN/critiques/`.

## Round 1 artifacts worth reusing

`rounds/round1/DIAGNOSIS.md` holds the score table and the evidence for edit 1. The three
critiques are the richest source of candidate failures for later rounds; the ones I
explicitly set aside were:

- fabricated learner data asserted as measured (W2 only — W1 and W3 computed clean)
- checks answered by the prose printed directly above them (W1 and W2)
- per-option explanations that terminate in a catch-all "any other answer" branch (all three)
- undefined terms that feel like plain English to the author — *volatility*, *short*,
  *premium*, *quantile*, *heap* (W2 and W3)
