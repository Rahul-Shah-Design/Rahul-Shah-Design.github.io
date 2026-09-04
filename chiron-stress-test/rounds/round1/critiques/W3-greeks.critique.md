# Critique: W3 — Option greeks: delta and gamma

## Top finding
Two of the three modules were never written. Module 1 — the module that carries the entire
finance vocabulary this learner does not have — is a stage direction: *"[Artifact delivered:
**Module 1 — The Fraction You Hold**. Four sections, two gate items, five end-of-module
items, and the handoff block carrying the boundary question from the plan.]"* That is a
description of content, not content. Module 3 is worse: it never appears at all, the file
ending at Module 2's handoff with only the plan's bullet *"- Close in chat: she answers the
throughline."* So the canonical floor rows assigned to M1 — *"call option; strike; expiry;
premium; payoff = max(S−K, 0)"*, *"at / in / out of the money"*, *"N(d₁) vs N(d₂)"* — and all
four M3 rows are asserted as delivered without a sentence of delivered prose behind them.
This matters most for exactly the item you would want audited here: the plan states *"every
one of them gets defined in the sentence it appears in, because she has none of them,"* and
then the module where the definitions were supposed to happen is a bracket. Module 2 then
opens by using **call option**, **delta** and **strike** with one-clause glosses attached
retroactively, which is the artifact quietly admitting the definitions were never made. One
composed module out of three, with the vocabulary module missing, is a course the learner
cannot actually take.

## Ranked findings

1. **Item 5's numbers are false for the contract it states** — checklist #24 (invented data),
   #27 (per-option explanations), #29. The interleaved MCQ that carries the course's single
   most important discrimination reads: *"A different paper on the same share: same three
   months, but it lets its holder buy at $115 rather than $100. Its hedge fraction is 0.288
   and the chance the share finishes above $115 is 0.239."* For a $115 strike on this contract
   (S=100, σ=30%, T=0.25, r=0) the true figures are N(d₁)=0.196 and N(d₂)=0.157. 0.288/0.239
   are the **$110** strike's numbers — and the plan says so: *"reformulated at a *different
   strike* — $110 instead of $100 ... (delta 0.288, probability 0.239)."* Somebody moved the
   strike to $115 in the module and did not recompute. The error propagates into two graded
   explanations, including *"its hedge fraction is 0.288 against the 0.530 you have been
   holding all module."* Every other number in this artifact I spot-checked reproduces
   exactly (V=$5.98, Γ=0.026523, θ=−$0.0474/day, the $90/$110 P&L rows, the 5-day path, the
   1/√N band); this one does not, so a learner who trusts the rest — correctly — will trust
   this and carry away a wrong number for the one contract the course varies.

2. **Volatility, the parameter the whole module resolves to, is never defined** — #7, #9.
   It arrives as a bare symbol in the setup paragraph: *"three months to run, σ = 30%, and no
   interest rates anywhere (r = 0, stated once so the algebra stays clean)."* No definition,
   no units, no sentence. The English word first appears three sections later, already
   assumed: *"times the volatility the option was priced with."* The nearest thing to a
   definition is a dial label in §2.5 — *"*Realized volatility* — 20%, 25%, 30%, 35%, 40%,
   meaning how much the share actually moves"* — which does not tell her 30% of what, over
   what horizon, or in what norm. The only place it is pinned is an aside: *"It is 100 × 0.30
   × √(1/252) — the share price, times the volatility the option was priced with, times the
   square root of one day."* She has to reverse-engineer "annualised standard deviation of
   returns" from a √ scaling. This is precisely the failure the plan predicted for itself and
   then committed: to an author, "volatility" feels like plain English. And it is load-bearing
   — the module's closing claim is *"You are being paid for the share moving less than 30%,"*
   a sentence she cannot check the meaning of.

3. **"Short" is used as plain English, the exact word the plan names as the failure mode** —
   #7. The plan: *"The failure mode with this learner is not \"too hard\", it is \"used the
   word *strike* or *short* as though it were plain English.\""* The gate stem: *"You are
   short one of these papers and holding 0.5299 shares against it."* No definition, in the
   sentence or anywhere in the module. Same for **premium** (*"on a position whose entire
   premium was $5.98"*), **exercised** (*"At $115 the paper is very likely to be
   exercised"*), and the 252 in √(1/252) — a person who has never bought a stock does not
   know markets close on weekends, and the artifact never says. Each is one clause of repair
   and each was skipped, in an artifact whose stated register was "slow down the finance
   nouns."

4. **The second interleaved item is M1's item copied, not reformulated** — #29 (named failure
   mode: repeated, not reformulated). Plan, Module 1 set, item 3: *"*Drag-to-label.* Three
   prices ($80, $100, $130), three deltas (0.079, 0.530, 0.966)."* Module 2, end-of-module
   Item 6: *"Situations: share at $80 · share at $100 · share at $130. Fractions: 0.079 ·
   0.530 · 0.966."* Same format, same three prices, same three numbers, same task. The plan
   even tells itself a story about why this is a reformulation — *"claim 2 ... reformulated as
   a *matching* item rather than the numeric it was in M1"* — but in M1 it was already a
   matching item; the numeric was a different item. So the genuine interleaving rate is one
   item in six, below the one-third floor, and the learner gets a recognition re-run where a
   retrieval was owed.

5. **Nothing in the module checks theta or the identity the module was built around** — #17,
   #26. §2.4 calls it *"the identity worth carrying out of this module"* and the canonical
   floor demands she leave able to produce *"theta; θ = −½σ²S²Γ at r = 0"* and *"breakeven
   move = σS√Δt"*. The six end-of-module items test: symmetric residual (1), ½Γ(ΔS)² (2), the
   rehedge dial (3), gamma ranking (4), delta-vs-probability (5), delta matching (6). Not one
   mentions decay, break-even, or θ. The overnight bench — the instrument carrying claim 7 —
   is the only instrument with no gradable check attached anywhere, which is the instrument
   order in #30 broken on the module's centrepiece. Meanwhile items 1 and 2 and the §2.2 gate
   all test the same discrimination (the residual is quadratic and direction-free), so the set
   over-samples the easy claim and skips the hard one.

6. **Module 3's checks are placeholders, one of them literally an ellipsis** — #18 ("every
   gradable check written in the plan, with the misconception each wrong option encodes").
   *"**Module 3 — gate after §3.3** (tests §3.2). *Set-the-control on the cost dial: the hedge
   error and the cost line cross at N ≈ …* numeric with tolerance, from the computed cost
   curve."* The answer is three dots. The end-of-module set is a shopping list: *"one numeric
   on ½∫S²Γ(σ_r²−σ_i²)dt with the quarter's numbers; one order-these-steps on a day of hedging
   into a scheduled data release; one set-the-control on implied vs realized; one MCQ whose
   distractors are \"vega is gamma\", \"gamma is a probability\", \"short gamma means
   bearish.\""* No stems, no correct answers, and for five of the six items no misconceptions
   at all. Contrast Module 1's checks, which are written in full — so the contract was
   understood and then abandoned at the module that was never going to be built.

7. **The boundary turn teaches §2.3 before the learner reads §2.3** — #5, #32, and the named
   failure mode "summarizing the module in the delivery message." The chat reply delivers
   claim 6 complete: *"Σ (ΔS)² → ∫ σ²S² dt ... Rebalancing more often does not kill that
   term. Nothing kills that term."* §2.3 then runs the same argument again at three times the
   length. It also defines theta in chat — *"It has a name, **theta** — the rate at which the
   value changes as time passes with everything else held still"* — and §2.4 introduces it
   again as if new, in almost the same words: *"The rate at which an option's value changes as
   time passes with everything else held still is called **theta**."* The adaptation the
   boundary was for is real and good; but spending the module's two headline claims in the
   handoff turn leaves §2.3 and §2.4 as re-runs.

8. **The boundary turn buries its ask mid-message and then keeps talking** — #11's principle
   (the ask is the last thing read), named failure mode "two asks in one message." It says
   *"One thing to say back to me in your own words before you read on, two sentences at most:
   **why is the fraction you hold 0.5299 and not 0.4701?**"* — and then continues for three
   more paragraphs, teaches theta, prints a plan-update block, and ends *"Module 2 is below."*
   She cannot answer "before you read on" when the reading is in the same message and the
   module is attached to it. The retrieval prompt the plan set up is functionally cancelled.

9. **The hook asks two questions** — #11 ("ending in **one** question ... no second
   question"). *"What fraction should I hold today, and why would I have to change that
   fraction tomorrow even if the only thing that happened overnight was the share price
   moving?"* Two asks joined by "and", and the second one gives away that the fraction must
   change — which is claim 4, the whole of Module 2, handed over before she has guessed. The
   scenario itself is excellent and genuinely seeds the course; the ask should have stopped
   after the first clause.

10. **One unmapped analogy** — #8. *"If you have ever watched a diffusion approximation
    degenerate as its time horizon collapses, you have seen this shape before; it is the same
    shape for the same reason."* No part-by-part map, no statement of what corresponds to
    what, no break point, and the paragraph survives deleting it intact — the contract's own
    test for cutting an image. It is a gesture at shared background rather than an
    explanation. (The §2.3 smooth-trajectory comparison is the opposite and is the best
    writing in the artifact — mapped, and broken explicitly at *"Where the comparison to the
    smooth trajectory breaks: only in the scaling of one increment."* The rule is clearly
    understood, which makes the lapse a choice.)

## Hollow compliance

- **"Two of six items — a third of the set."** The interleaving schedule states its own
  compliance arithmetic, and the arithmetic is true only if a verbatim copy of an M1 item
  counts as a callback. Stating the ratio is not meeting it.

- **Per-option explanations that end in a catch-all.** #27 asks why *that* answer is wrong.
  The ordering item has 23 wrong orders and names three, then: *"Explanation shown on any
  other order: Two rules settle all four: gamma peaks at the strike, and at the strike it
  grows as expiry approaches. Figure 2.2 has all four numbers."* Same shape in Item 6
  (*"Explanation shown on any other pairing"*) and Item 2 (*"Explanation shown on any other
  entry"*). A learner who gets it wrong in an unanticipated way is handed the rule restated
  and a pointer to a table — the diagnosis the format was chosen for is not delivered.

- **The plan's jargon paragraph.** *"Slow down the **finance nouns** — every one of them gets
  defined in the sentence it appears in, because she has none of them."* Written as a
  contract with itself, then not honoured for volatility, short, premium, exercised or 252.
  A stated intention is being scored as if it were execution.

- **A distractor recycled as a fresh one.** M1 plan item 2 has *"(d) The gap is the fee the
  seller charges"*; M2 Item 5 has *"(b) The gap is the seller's profit margin built into the
  price."* Same misconception, same slot, in the item that was supposed to be the
  reformulation.

## Scores (1-5, 5 = fully honours the contract)
- Hook discipline: 3
- Plan as contract (order from zero, canonical floor, misconceptions written, interleave schedule): 2
- Jargon & concrete-before-abstract: 2
- Analogy discipline: 4
- Checks: gradability, per-option explanations, format mix, lag: 3
- Interleaving (reformulated, unannounced, >= one third): 2
- Instruments (control/variable/visible change, claim-instrument-experiment-check order): 4
- Handoff & boundary adaptation: 3
- Prose is real composed content, not outline or markup: 2

## One sentence
Write Modules 1 and 3 — the vocabulary module above all — and then go back through the one
module that does exist and define volatility, short, premium and 252 in the sentences that
introduce them, fix Item 5's strike, and put a check on theta.
