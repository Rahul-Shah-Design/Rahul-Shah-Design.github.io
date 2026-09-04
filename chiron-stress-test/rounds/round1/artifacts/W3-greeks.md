# W3 — Option greeks: delta and gamma
**Learner:** quantitative epidemiologist. Comfortable with calculus, PDEs and stochastic
processes. No finance vocabulary. Has never bought a stock.

*(Everything below is the literal conversation and the literal artifact contents. Lines in
square brackets are stage directions, not learner-facing text.)*

---

## HOOK

Here is a deal you can make today.

A single share of some company is trading at $100. I sell you a piece of paper. The paper
says: at any point in the next three months you may hand me $100 and I will hand you one
share. You never have to use it. You pay me $6 today for the paper and that is the end of
your obligations.

Now stand on my side of it. I have taken your $6 and I owe you a share if you come asking.
I do not want to just sit and hope, so I go out and buy some shares now to cover myself.
Not one share — some fraction of a share.

What fraction should I hold today, and why would I have to change that fraction tomorrow
even if the only thing that happened overnight was the share price moving? Take a swing at
it — a guess with your reasoning showing is exactly what I want here, and it does not need
to be right.

---

## [SIMULATED LEARNER]

Okay, I have no vocabulary for this at all, so this is going to be crude.

At the three-month mark the paper is worth (price − 100) if the price is above 100 and
nothing if it is below, so as a function of the price it is that kinked ramp — flat, then
slope 1. Fine.

For the fraction: my instinct is that you should hold the probability that the thing ends
up above 100. If the price ends above 100 you owe a whole share, if below you owe nothing,
so hold the expected number of shares you'll owe. We're sitting at exactly 100 now, so
that's about a half? Slightly more than half maybe, if these things drift up.

And it changes tomorrow because that probability changes. If the price runs to 130 it's
nearly certain you'll owe the share, so you'd need to hold nearly a whole one. So the
fraction is some increasing S-shaped function of the price, and you're re-evaluating it
every day. I assume the real answer is a derivative of something with respect to the price
but I don't know what the something is.

---

## [§1 FOLLOW-UP TURN]

What are you going to use this on?

---

## [SIMULATED LEARNER]

Nothing at work, strictly. A collaborator from my old modelling group left for a systematic
trading shop and I have been trying to read her notes and half her messages. She writes
things like "we're short gamma into the print" and I have no entry point.

My background is compartmental models and their diffusion approximations, so Itô, Feynman–Kac
and Fokker–Planck are all familiar furniture — I've spent years on second-order operators.
Finance vocabulary is genuinely zero. I have never bought a stock.

---

## COURSE PLAN

*[Written to `course-plan.md` before anything is built. Re-read before each module; claims
marked as delivered.]*

---

### Learner profile

Quantitative epidemiologist. Calculus, PDEs, stochastic processes, Itô, Feynman–Kac,
quadratic variation — all secure. Zero finance vocabulary; has never held a share. Reason
for learning: reading a colleague's notes from a systematic trading desk; the phrase she is
trying to decode is **"we're short gamma into the print."**

Diagnostic read of the hook attempt (silent, never narrated to her): she produced the payoff
shape unprompted and correctly, she reached for an expectation, and she landed on
*hold the probability of finishing above $100*. That is the single most productive wrong
answer available here — it is off by exactly the difference between N(d₁) and N(d₂), and it
means Module 1 has a specific error to correct rather than a blank to fill. She also said "a
derivative of something with respect to the price" without knowing of what: the whole course
is the answer to that sentence.

Register: talk to her in the language of derivatives, expectations, second-order terms and
quadratic variation from the first minute. Do not slow down the mathematics. Slow down the
**finance nouns** — every one of them gets defined in the sentence it appears in, because
she has none of them. The failure mode with this learner is not "too hard", it is "used the
word *strike* or *short* as though it were plain English."

Build everything on one contract, unchanged for three modules: **one call option, S = $100,
strike $100, three months, σ = 30%, r = 0, priced at $5.98.** Same numbers every module, so
new claims land on furniture she already recognises. Set r = 0 and say so, out loud, once:
it makes the Black–Scholes identity θ = −½σ²S²Γ exact and un-cluttered, and interest rates
are not in this course.

---

### The throughline

*Asked as the hook:* **What fraction of a share do you hold against the paper you sold, and
why does that fraction have to change when the price moves?*

A full answer contains these claims, and the course is done when all of them are delivered:

1. The paper is a **call option**; its value before expiry is a smooth function V(S,t), not
   the kinked payoff, because remaining uncertainty smooths the kink. *(M1)*
2. The fraction to hold is **∂V/∂S = delta**, because that is what cancels the first-order
   term of the position's value. *(M1)*
3. Delta is **not** the probability of finishing above the strike. N(d₁) = 0.5299 vs
   N(d₂) = 0.4701 on this contract. *(M1)*
4. The fraction must change because V is **curved in S**: ∂²V/∂S² = **gamma** ≠ 0. *(M2)*
5. The curvature is worth money on every move: ΔΠ ≈ ½Γ(ΔS)², same sign whichever way the
   price goes. *(M2)*
6. That term does not vanish under faster rebalancing, because Σ(ΔS)² → ∫σ²S²dt, not 0. *(M2)*
7. You are charged for it daily: **theta**, and at r = 0, θ = −½σ²S²Γ exactly — the
   Black–Scholes PDE read as a sentence about a hedged book. *(M2)*
8. In discrete time the exact cancellation becomes noise whose spread scales like 1/√N. *(M2)*
9. Sign conventions: **long gamma** pays rent for curvature, **short gamma** collects rent
   and pays for movement. Her colleague is short. *(M3)*
10. Gamma concentrates at the strike and explodes into expiry — which is what "into the
    print" is about. *(M3)*
11. Rehedging costs money, so hedge frequency is a real optimisation, not a limit. *(M3)*
12. The option's quoted price *is* a volatility forecast; delta-hedged P&L is a bet on
    realized versus implied variance. *(M3)*

This cannot be settled in a paragraph: claim 2 needs claim 1, claim 6 needs her stochastic
calculus pointed at claim 5, and claims 9–12 are meaningless without 4–8. And it stays inside
the mechanism she asked about — it never wanders into pricing models, exotic payoffs, or
"how options are used in portfolios."

---

### Modules

**Module 1 — The Fraction You Hold** *(delivers claims 1, 2, 3)*

Arc: the kink → the smoothing → the tangent → the fraction is not a probability.

- §1.1 At the end, the paper is a kinked ramp. Concrete: payoff at $92, $100, $107, $130.
- §1.2 Before the end it is smooth. The same paper, three months out, is worth $5.98 with
  the price sitting exactly at $100 — where the payoff says zero. Uncertainty rounds the
  kink. Instrument: the value curve vs the payoff curve as time-to-expiry shrinks.
- §1.3 The fraction that cancels the first-order move is the slope of that curve: ∂V/∂S,
  called delta, 0.5299 here. Instrument: the tangent bench.
- §1.4 Delta is not the chance of finishing above $100 — that number is 0.4701 on the same
  contract. Where each comes from, and why they are close but never equal.
- Closing line folds back: *the fraction is a slope, and slopes of curved things do not
  stay put.*

**Module 2 — Why the Fraction Won't Sit Still** *(delivers claims 4, 5, 6, 7, 8)*

Arc: the hedge is only a tangent → the curvature has a size and a shape → the money in the
second-order term is real → you pay rent for it every day → in discrete time the rent and
the takings stop cancelling exactly.

- §2.1 A hedged position is not a flat position. *Instrument: the curvature bench.*
- §2.2 The curvature has a size: Γ = ∂δ/∂S = ∂²V/∂S², where it lives and how it sharpens.
- §2.3 Why the second-order term survives the continuous limit. Real five-day path.
- §2.4 The rent: theta, and θ = −½σ²S²Γ. Breakeven move = one standard deviation.
  *Instrument: the overnight bench.*
- §2.5 You cannot rebalance continuously. *Instrument: the rehedge dial.* 1/√N.
- Closing line folds back.

**Module 3 — Running the Book** *(delivers claims 9, 10, 11, 12)*

Arc: whose side you are on → where gamma concentrates → what rebalancing costs → what the
price was really quoting all along.

- §3.1 Long gamma and short gamma, defined on her colleague's sentence.
- §3.2 Gamma at the strike into expiry: 0.0265 at three months, 0.149 at two days, 0.517 at
  four hours. Hedging becomes violent; the strike behaves like an attractor.
- §3.3 Every rehedge pays a spread. *Instrument: the cost dial* — hedge-error spread
  5.2/√N against N × cost, and the minimum in between.
- §3.4 The quoted price is a volatility forecast. Delta-hedged P&L = ½∫S²Γ(σ_realized² −
  σ_implied²)dt. "Into the print" resolved in full.
- Close in chat: she answers the throughline.

---

### Canonical floor

She must leave able to produce these, unprompted:

| Item | Module |
|---|---|
| call option; strike; expiry; premium; payoff = max(S−K, 0) | M1 |
| at / in / out of the money | M1 |
| delta = ∂V/∂S; delta-hedge; delta of the hedged book = 0 | M1 |
| N(d₁) vs N(d₂) and why delta ≠ P(finish above strike) | M1 |
| gamma = ∂δ/∂S = ∂²V/∂S² | M2 |
| ΔΠ ≈ ½Γ(ΔS)² | M2 |
| theta; θ = −½σ²S²Γ at r = 0; the Black–Scholes PDE as the balance sheet of a hedged book | M2 |
| breakeven move = σS√Δt | M2 |
| hedge-error spread ∝ 1/√N | M2 |
| long gamma / short gamma | M3 |
| implied volatility vs realized volatility | M3 |
| delta-hedged P&L = ½∫S²Γ(σ_r² − σ_i²)dt | M3 |

---

### Gradable checks (all of them, with the misconception each wrong option encodes)

**Module 1 — gate after §1.2** (tests §1.1). *The paper expires with the share at $96. What
is it worth?* MCQ. (a) $0 — **correct**. (b) $4 — encodes "the payoff is symmetric, distance
from the strike is what matters." (c) $5.98 — encodes "the price you paid is what it is
worth." (d) −$4 — encodes "the holder is obliged to trade, and takes the loss."

**Module 1 — gate after §1.3** (tests §1.2). *Three months out, price at $100, the payoff
formula says the paper is worth $0. It trades at $5.98. Which statement explains that?*
MCQ. (a) The remaining three months of uncertainty give it value; the kinked payoff only
applies at the end — **correct**. (b) It is overpriced by $5.98 — encodes "payoff = value at
all times." (c) The extra $5.98 is the interest on $100 — encodes "everything above payoff
is a rates effect" (and r = 0 here). (d) The price includes a fee for the paperwork —
encodes "the premium is a transaction charge."

**Module 1 — end-of-module set (5 items).**
1. *Numeric, tolerance ±0.02.* Delta at S = $100 is 0.5299. You have sold 20 of these papers.
   How many shares do you hold? **10.60.**
2. *MCQ.* Delta is 0.5299 and the chance of finishing above $100 is 0.4701. Which is which,
   and why are they different? (a) The 0.5299 is the slope of value against price; the 0.4701
   is a probability; they differ because the slope weights by how much you'd owe, not just
   whether — **correct**. (b) They are the same number, computed two ways, and the gap is
   rounding — encodes the hook misconception directly. (c) 0.4701 is the slope, 0.5299 is the
   probability — encodes the swap. (d) The gap is the fee the seller charges — encodes
   "the difference must be somebody's profit."
3. *Drag-to-label.* Three prices ($80, $100, $130), three deltas (0.079, 0.530, 0.966).
   Matching, per-slot feedback naming the shape of the S-curve.
4. *Set-the-control.* Tangent bench: move the price until the hedge fraction first exceeds
   0.90. **~$120** (0.9016). Wrong region feedback: below $110 you are still under 0.77; the
   fraction climbs slowly because the curve is still curving.
5. *MCQ.* You hold delta shares against the paper you sold. The price moves by one cent.
   What happens to the pair? (a) Nothing, to first order — **correct**. (b) It gains a cent —
   encodes "you are long shares, so you gain." (c) It loses 0.53 cents — encodes "the hedge
   is partial, so the loss is partial." (d) Cannot say without the probability — encodes
   probability-first thinking.

**Module 2 — gate after §2.2** (tests §2.1; lagged one section). Full text in the module below.
**Module 2 — gate after §2.4** (tests §2.3; lagged one section). Full text in the module below.
**Module 2 — end-of-module set (6 items).** Full text in the module below. Items 5 and 6 pull
Module 1 forward.

**Module 3 — gate after §3.2** (tests §3.1). *Your desk owns a large number of these papers
and hedges them. Realized movement over the next week is enormous. Do you gain or lose?*
MCQ. (a) Gain — you are long gamma and movement is what pays you — **correct**. (b) Lose —
big moves are risk and risk is bad — encodes "volatility is always the enemy." (c) Neither,
you are hedged — encodes the Module 2 error that a hedged book is flat. (d) Depends whether
the move is up or down — encodes directionality.

**Module 3 — gate after §3.3** (tests §3.2). *Set-the-control on the cost dial: the hedge
error and the cost line cross at N ≈ …* numeric with tolerance, from the computed cost curve.

**Module 3 — end-of-module set (6 items).** Two from earlier modules per the schedule below;
one numeric on ½∫S²Γ(σ_r²−σ_i²)dt with the quarter's numbers; one order-these-steps on a
day of hedging into a scheduled data release; one set-the-control on implied vs realized;
one MCQ whose distractors are "vega is gamma", "gamma is a probability", "short gamma means
bearish."

---

### Interleaving schedule

- **Module 2's end-of-module set pulls forward from Module 1:** claim 3 (delta ≠ probability)
  reformulated at a *different strike* — $110 instead of $100, so the numbers are new
  (delta 0.288, probability 0.239) and the discrimination is identical; and claim 2 (delta as
  the slope of a curved value function) reformulated as a *matching* item rather than the
  numeric it was in M1. Two of six items — a third of the set.
- **Module 3's end-of-module set pulls forward:** claim 5 (½Γ(ΔS)²) as a sign-and-size
  judgment in a *long* position rather than the short one it was taught in; claim 7 (theta as
  the price of curvature) as "which of these two positions pays rent"; claim 2 (delta) inside
  a multi-contract book. Two to three of six.
- Never flag any of this to her. Do not soften the set, do not apologise for its difficulty.

---

### Instruments

| Instrument | Module | Claim it carries |
|---|---|---|
| Tangent bench — price slider, tangent line rides the value curve, slope read out | M1 | Delta is the slope that cancels the first-order move (claim 2) |
| Curvature bench — price slider, hedged-position P&L rides a parabola | M2 | A hedged book is curved, and the curvature is the same sign both ways (claims 4, 5) |
| Overnight bench — price slider + days-to-expiry dial, zero-crossings read out | M2 | Decay pays for curvature exactly; breakeven = one standard deviation (claim 7) |
| Rehedge dial — hedge-count dial + realized-volatility dial over 2,000 simulated paths | M2 | Frequency kills the variance, not the mean (claims 6, 8) |
| Cost dial — spread-per-trade dial against hedge count | M3 | Hedge frequency is an optimisation (claim 11) |

---

### Boundary questions

- **After M1:** *You are holding 0.53 shares against the paper you sold. Overnight the price
  moves to $106 and you do not touch the hedge. Does the pair make money, lose money, or
  break even — and why?*
- **After M2:** *Your colleague says "we're short gamma into the print" — the print being a
  scheduled data release that usually moves the price hard. In your own words: what is she
  worried about, and what will she have to do that day?*
- **Retrieval to lag into later boundaries:** at the M2 boundary, ask her to reproduce in her
  own words why the hedge fraction is 0.53 and not 0.47 (M1, claim 3). At the M3 boundary,
  ask her to state what theta is in one sentence without using the word gamma (M2, claim 7).

### The one next thing to recommend at close

Vega and the volatility surface — she now knows the option's price is a variance forecast,
and the next honest question is what happens when the market's forecast moves while she holds
the position. One recommendation, not a menu.

---

## MODULE LIST TURN

Three modules. Each one is a claim you'll be able to defend, not a topic:

1. **The fraction you hold is a slope, not a probability** — what that paper is worth before
   it expires, and why its value curve is smooth when the payoff is kinked.
2. **The slope won't sit still, and that costs somebody money every day** — the curvature of
   the value curve, what it is worth on each move, and who pays for it.
3. **Running the position** — where that curvature concentrates, what rebalancing costs, and
   what your colleague means by "short gamma into the print."

All three are the same $100 paper you just tried to hedge, examined harder.

Module 1 is below. The question you need to answer is in the block at the end of it.

*[Artifact delivered: **Module 1 — The Fraction You Hold**. Four sections, two gate items,
five end-of-module items, and the handoff block carrying the boundary question from the plan.]*

---

## [SIMULATED LEARNER]

*(answering Module 1's boundary question)*

Right — so V is smooth in S and the hedge kills the first-order term by construction. To
first order it should break even. What's left is the second-order piece, roughly
½ V_SS (ΔS)², and with ΔS = 6 that is not nothing.

Sign: I sold the paper, so I'm on the wrong side of that term, and V is convex in S — so I
lose. I'll say I lose a small amount, order of a tenth of a dollar or so.

But here's what bothers me. That residual only exists because I used the slope evaluated at
$100 across a move that went all the way to $106. It's a discretisation error, no? If I
rebalanced continuously — take the limit as the rebalancing interval goes to zero — the
slope is always current, ΔS is always infinitesimal, and the error term should die. So the
loss isn't really structural, it's just me being lazy about rebalancing.

Also, small thing: don't I lose a bit just from a day passing, independent of the price?

---

## BOUNDARY TURN

You got the structure right and the sign right, and both for the right reasons — first-order
term cancelled by construction, what remains is ½V_SS(ΔS)², you are short a convex thing so
the term goes against you. The size needs one correction. Your ½V_SS(ΔS)², with V_SS = 0.0265
on this contract and ΔS = 6, gives −$0.48, and a full revaluation of the position overnight gives −$0.41 once the
day's decay is credited back. Tenths of a dollar was the right unit; it is four of them, not
one, and the approximation overstates it because delta was drifting upward the whole way.

The part that isn't right is the last step, and it is the most interesting thing in this
course, so I want to be precise about where it goes wrong.

You reasoned: error per step is O((ΔS)²), so shrink the step and the error dies. That
reasoning is correct for a smooth path. Take an ODE trajectory and a first-order scheme: the
increment over a step of length dt is O(dt), the squared increment is O(dt²), you take 1/dt
steps, and the accumulated second-order term is O(dt) → 0. The residual really does vanish.

The share price is not a smooth path. Its increment over dt is O(√dt), not O(dt). So the
squared increment is O(dt), you take 1/dt of them, and the sum converges to something
finite — it's the quadratic variation, and you know exactly what it is:

Σ (ΔS)² → ∫ σ²S² dt

Rebalancing more often does not kill that term. Nothing kills that term. It is the same fact
that puts the ½σ²S²∂²/∂S² into Itô's lemma rather than letting it drop out, and it is the
only reason any of this is interesting: the second-order term is a first-order effect in
time. Your instinct that a diffusion is not a differentiable path is the whole mechanism —
you just hadn't pointed it at the money yet.

One thing to say back to me in your own words before you read on, two sentences at most:
**why is the fraction you hold 0.5299 and not 0.4701?** Not the formulas — the reason those
are different numbers at all.

On the day passing: yes, and it is not a side effect. That paper is worth $5.98 today and it
would be worth $5.93 tomorrow if the price never moved. You are short it, so that $0.047 is
yours. It has a name, **theta** — the rate at which the value changes as time passes with
everything else held still — and the reason I am not treating it as a footnote is that the
$0.047 is not an arbitrary number. It is exactly the size of the curvature term you just
computed, at the move size the market thinks is typical. Module 2 turns that "exactly" into
an identity you will recognise on sight.

*[Plan file updated: M2 §2.3 rebuilt around the smooth-path/diffusion contrast rather than
opening on Itô as given — her error is a correct ODE argument applied to a non-differentiable
path, so the section now runs that argument through and breaks it at the exact step. Gate
item after §2.4 rewritten so its lead distractor is "the residual vanishes in the continuous
limit." Theta moved earlier inside §2.4 since she has now asked for it.]*

Module 2 is below; its question is in the block at the end, for after you've read it.

---

## MODULE 2

*[Artifact contents, in full.]*

---

# Module 2 — Why the Fraction Won't Sit Still

In Module 1 you established that the paper you sold — the **call option**, the right to buy
one share at $100 — is worth $5.98 today, that its value V(S) is a smooth curved function of
the share price, and that the fraction of a share you hold against it is the slope of that
curve: **delta**, 0.5299 on this contract.

This module is about the fact that the curve is curved.

That sounds like a footnote on Module 1. It is not. The curvature is where the entire
economics of this position lives: it is what you get paid for, what you get charged for, why
the $5.98 was $5.98 and not some other number, and why anybody bothers to say "gamma" out
loud. Five sections: first that a hedged position still moves, then how much curvature there
is and where it sits, then why that curvature does not go away when you rebalance faster,
then who pays for it and how much, then what happens when you can only rebalance sixty-three
times instead of infinitely often.

Same contract throughout: one call option, share at $100, strike $100 — the **strike** being
the fixed $100 price the paper lets its holder pay — three months to run, σ = 30%, and no
interest rates anywhere (r = 0, stated once so the algebra stays clean). You sold it for
$5.98 and you are holding 0.5299 shares against it.

---

## §2.1 — A hedged position is not a flat position

You sold the paper and bought 0.5299 shares. The price moves to $101. You lose $0.0132.

The price moves to $99 instead. You lose $0.0132 again.

Same loss, both directions. That is the whole section, and it should look wrong to you the
first time — you built that hedge specifically so that price moves would not matter, and
here they matter, symmetrically, with no reference to which way the price went.

Here is where the money goes. Your position is two things: a share holding worth 0.5299 × S,
which is a straight line in S, and the paper you owe, worth −V(S), which is a curve. You
chose 0.5299 so the line has exactly the same slope as the curve at S = $100. Matching slopes
means the two cancel for infinitesimal moves. It does not mean they cancel for real ones,
because a straight line and a curve that touch at a point separate everywhere else, and they
separate on the same side in both directions.

The gap between a curve and its tangent has one sign. That is convexity, and you are on the
wrong side of it because you sold the curve and kept the line.

### Instrument: the curvature bench

- **Control:** one slider, *tomorrow's share price*, from $85 to $115, in cents. Time is
  frozen — nothing but the price changes.
- **Variable it changes:** the share price S′ at which the whole position is revalued.
- **What visibly changes:** the upper panel shows the value curve −V(S) with the straight
  hedge line tangent to it at $100; a vertical marker slides to S′ and the vertical gap
  between line and curve fills in. The lower panel is that gap plotted on its own — a
  downward-opening parabola with its peak at zero, at $100 — with a dot riding it and a
  dollar readout: **position P&L**, meaning profit and loss, the money the pair has made or
  lost since you set it up.

**Guided experiment.**

1. Set the slider to $101. Read the P&L: **−$0.013**. Now drag to $99. Read it again:
   **−$0.013**. Same number. The sign of the move did not survive.
2. Drag to $105. P&L: **−$0.32**. The move got five times bigger and the loss got about
   twenty-five times bigger, not five.
3. Drag slowly from $100 outward in either direction and watch the upper panel. The tangent
   line stays where it was; it is the curve that pulls away from it.

**What to notice:** the loss depends on the *square* of the move. Five times the move,
twenty-five times the loss. That squaring is the signature of a second-order term, and it is
the only term left standing once the hedge has removed the first-order one.

**FIGURE 2.1 — Hedged P&L against tomorrow's price.**
Horizontal axis: the share price tomorrow, $90 to $110. Vertical axis: the P&L of the whole
position (short one paper, long 0.5299 shares) in dollars, from −$1.40 to +$0.05. The shape
is a downward-opening parabola touching zero at exactly $100 and falling away on both sides,
slightly steeper to the left than the right. Computed from the Black–Scholes value of this
contract at each price with time held fixed at three months; the "½Γ(ΔS)²" column is the
parabola that the next section will name.

| Price tomorrow | Move | Exact P&L | −½Γ(ΔS)² |
|---|---|---|---|
| $90 | −$10.00 | −$1.342 | −$1.326 |
| $94 | −$6.00 | −$0.485 | −$0.477 |
| $98 | −$2.00 | −$0.054 | −$0.053 |
| $99 | −$1.00 | −$0.013 | −$0.013 |
| $100 | $0.00 | $0.000 | $0.000 |
| $101 | +$1.00 | −$0.013 | −$0.013 |
| $102 | +$2.00 | −$0.052 | −$0.053 |
| $106 | +$6.00 | −$0.458 | −$0.477 |
| $110 | +$10.00 | −$1.223 | −$1.326 |

The two right-hand columns agree to a cent out to about a $4 move and drift apart past that,
which is exactly what a second-order approximation to a smooth function is supposed to do.

---

## §2.2 — The curvature has a size, and it moves around

Take your hedge fraction at three prices, all on the same paper, all three months out:

| Share price | Fraction of a share you must hold |
|---|---|
| $95 | 0.395 |
| $100 | 0.530 |
| $105 | 0.656 |

Between $95 and $100 the fraction climbed 0.135. Between $100 and $105 it climbed 0.126.
Roughly a quarter of a share per $10 of price, but not exactly — the rate itself is drifting.

That rate is what you want. It is how fast your required hedge changes per dollar of price
move: ∂δ/∂S. And since δ was itself ∂V/∂S, this is the second derivative of the option's
value with respect to the share price, ∂²V/∂S². Its name is **gamma**, and on this contract
at $100 it is **0.0265** — meaning each $1 the share moves changes the fraction you should be
holding by about 0.0265 of a share.

Check it against the numbers above: from $100 to $106, gamma predicts the fraction rises by
0.0265 × 6 = 0.159. The true fraction at $106 is 0.679, a rise of 0.149. Close, and low by
the amount you would expect from a quantity that is itself changing over the interval.

Two things about where gamma lives, and they are the two facts that make the next module
possible.

**FIGURE 2.2 — Gamma against share price, at three times to expiry.**
Horizontal axis: share price, $85 to $115. Vertical axis: gamma, per dollar, on a scale to
0.16. Three curves, all humps centred on the $100 strike. The three-month curve is a broad
low mound peaking at 0.0265 and still worth 0.019 out at $85. The one-month curve is taller
and narrower, peaking at 0.046. The two-day curve is a spike: 0.149 at the strike, 0.026 by
$105, and indistinguishable from zero at $90. Computed from the Black–Scholes gamma formula
for this contract at each price and maturity.

| Share price | 3 months | 1 month | 2 days |
|---|---|---|---|
| $85 | 0.0188 | 0.0101 | 0.0000 |
| $90 | 0.0243 | 0.0257 | 0.0001 |
| $95 | 0.0270 | 0.0417 | 0.0256 |
| $100 | 0.0265 | 0.0460 | 0.1493 |
| $105 | 0.0234 | 0.0365 | 0.0262 |
| $110 | 0.0188 | 0.0218 | 0.0002 |
| $115 | 0.0139 | 0.0102 | 0.0000 |

**What to notice:** gamma is a hump centred on the strike, and as expiry approaches the hump
gets taller and narrower without changing what it is doing. The total curvature has to
concentrate somewhere, and it concentrates on the strike, because that is where the smooth
value curve is turning into the kinked payoff. If you have ever watched a diffusion
approximation degenerate as its time horizon collapses, you have seen this shape before; it
is the same shape for the same reason.

---

### Gate — answer this to continue

**What it asks.** You are short one of these papers and holding 0.5299 shares against it.
Overnight the price moves — you don't know which way, only that it moved about a dollar and
you did not touch the hedge. What happened to your position?

**Format.** Multiple choice, single selection, four options. The next section stays hidden
until an option is chosen; the explanation appears in the space already reserved beneath the
options, and nothing on the page moves.

- **(a) It lost about a cent, whichever way the price went.** ✅ **Correct.**
  *Explanation shown:* Right, and the "whichever way" is the load-bearing part. The hedge
  matched the slope of the value curve, so the direction of the move cancels; what is left is
  the gap between the curve and its tangent, which sits on the same side for a move up and a
  move down. About a cent is the right size: −$0.013 either way.
- **(b) It gained about a cent if the price rose, lost about a cent if it fell.**
  *Targets:* the belief that the leftover exposure is directional — that hedging shrinks the
  directional bet rather than removing it, leaving a smaller version of "long shares".
  *Explanation shown:* That would be true if you were under-hedged — holding shares with no
  offsetting slope. You are not: the 0.5299 was chosen to cancel the first-order term in both
  directions at once. Check it on the curvature bench — $99 and $101 both read −$0.013. The
  residual has no direction in it.
- **(c) It broke even. That is what the hedge is for.**
  *Targets:* first-order thinking — the assumption that cancelling the linear term cancels
  everything, i.e. treating a curve as its tangent.
  *Explanation shown:* The hedge cancels the first-order term exactly, and that is what it
  was for. But V is curved in S, so the first-order term is not the whole change: a straight
  line and a curve that touch at $100 separate everywhere else. That gap is what §2.1 put a
  dollar figure on.
- **(d) It depends on whether the share is expected to drift up or down.**
  *Targets:* importing a directional forecast into a position whose direction has been
  removed — the reflex that any position on a share must be a view on the share.
  *Explanation shown:* Drift would matter if any first-order exposure to S remained. None
  does — that is what the 0.5299 bought. The leftover term depends on the size of the move
  squared, and a squared quantity has forgotten the direction the drift was pointing.

---

## §2.3 — Why that leftover does not go away when you rebalance faster

Here is the objection worth taking seriously, and it is the correct instinct in the wrong
setting.

The loss in §2.1 exists because you used the slope evaluated at $100 across a move that ended
somewhere else. So rebalance more often: every hour, every minute. Then the slope is nearly
always current, each ΔS is tiny, each squared term is tinier, and the residual should die.

Run that argument in the world where it works. Take a smooth trajectory — an epidemic curve
from a deterministic model, say, integrated with a first-order scheme. Over a step of length
dt the state moves by O(dt). The squared move is O(dt²). You take 1/dt steps. Total
second-order contribution: 1/dt × O(dt²) = O(dt) → 0. The residual vanishes. Your argument is
exactly right and the conclusion is exactly right.

Now run it on a share price. Over a step dt the price moves by O(√dt), not O(dt) — that is
what it means for the path to be a diffusion rather than a differentiable curve. So the
squared move is O(dt). You take 1/dt of them. Total second-order contribution: 1/dt × O(dt) =
O(1). It does not vanish. It converges:

**Σ (ΔS)² → ∫ σ²S² dt**

That is the quadratic variation of the path, and it is finite and positive no matter how
finely you chop the interval. You have met this object before; it is the same fact that keeps
the ½σ²S²∂²/∂S² term in Itô's lemma instead of letting it drop out with the other
second-order dust. What is new here is only that the term has a dollar sign in front of it.

Where the comparison to the smooth trajectory breaks: only in the scaling of one increment.
Everything else about the argument — the per-step error, the count of steps, the sum —
carries over unchanged. It is one exponent, √dt against dt, and it is the difference between
a hedging error you can engineer away and a structural cash flow you cannot.

So the leftover from §2.1 is not a mistake. It is a quantity, it accrues on every move you
make, and over a day it comes to:

**change in your position's value ≈ −½ Γ (ΔS)²**

with the minus sign because you sold the curve. Whoever bought the paper from you has the
same term with a plus.

**FIGURE 2.3 — Five real days of the position.**
A simulated price path for this contract (σ = 30%, five trading days, drawn once and kept),
with the position rebalanced back to the correct fraction at the end of each day. Horizontal
axis: day, 1 to 5. Two bars per day: the gamma term −½Γ(ΔS)², always ≤ 0, and — introduced in
the next section — the day's decay, always the same small positive amount. The line running
across them is the running total, which ends slightly negative.

| Day | Price at close | Move | Gamma that morning | −½Γ(ΔS)² | Day's decay | Net that day | Running total |
|---|---|---|---|---|---|---|---|
| 1 | $100.93 | +$0.93 | 0.0265 | −$0.012 | +$0.047 | +$0.036 | +$0.036 |
| 2 | $97.56 | −$3.37 | 0.0263 | −$0.149 | +$0.048 | −$0.105 | −$0.069 |
| 3 | $96.12 | −$1.44 | 0.0276 | −$0.029 | +$0.047 | +$0.017 | −$0.052 |
| 4 | $96.24 | +$0.12 | 0.0278 | −$0.000 | +$0.046 | +$0.046 | −$0.006 |
| 5 | $98.94 | +$2.70 | 0.0280 | −$0.102 | +$0.046 | −$0.053 | −$0.059 |

The "net that day" column is the exact revaluation of the position, not the approximation —
computed properly at each day's price and remaining maturity. The approximation
−½Γ(ΔS)² + decay reproduces it to within a third of a cent on every one of the five days.

**What to notice:** the gamma column is negative on all five days, including day 4 when the
price barely moved and it rounds to zero. It is never positive. Direction never enters. The
only thing that decides how much you lose is how far the price went, squared.

---

## §2.4 — The rent: theta, and what it is exactly equal to

Notice what has been sitting in that table without an explanation: every single day you
collect $0.047, whatever the price does.

That is the paper getting cheaper as time runs out. This contract is worth $5.98 with three
months left. With one day less and the price unchanged it is worth $5.93. You sold it, so
that $0.047 is money you keep. The rate at which an option's value changes as time passes
with everything else held still is called **theta**, and yours is +$0.047 per day because you
are on the selling side of it.

Now put the two together. Every day you collect $0.047 of decay and pay ½ × 0.0265 × (ΔS)²
for the move. The day is profitable when

½ × 0.0265 × (ΔS)² < 0.047, that is |ΔS| < $1.89

and unprofitable outside that. Look at the five-day table: days 1, 3 and 4 moved less than
$1.89 and made money; days 2 and 5 moved more and lost.

Where did $1.89 come from? It is 100 × 0.30 × √(1/252) — the share price, times the
volatility the option was priced with, times the square root of one day. It is the standard
deviation of a one-day move. The break-even move is exactly the typical move.

That is not a coincidence, and this is the identity worth carrying out of this module. Set
the two terms equal and read what it says about theta:

**θ = −½ σ² S² Γ**

Check it: −½ × 0.09 × 10,000 × 0.0265 = −$11.93 per year, and −11.93 / 252 = −$0.0474 per
day. That is the decay in the table, to four decimal places, not by approximation but as an
identity.

You have seen this equation. Put the position's value Π in place of the pieces and it reads
∂Π/∂t + ½σ²S²∂²Π/∂S² = 0, which is the Black–Scholes equation with the rate terms switched
off. It is usually presented as a pricing equation, derived and then solved. Read as a
sentence about the position you are actually holding, it says something much plainer: **the
rent you collect for holding the curvature is exactly what the curvature is expected to cost
you.** The price of $5.98 is precisely the price at which that trade is fair.

### Instrument: the overnight bench

- **Controls:** two. A slider for *tomorrow's price*, $94 to $106. A dial for *days left*,
  with stops at 63 (three months), 21 (one month), 5 (one week) and 3.
- **Variables they change:** the size of the overnight move ΔS, and the remaining time τ —
  which sets both gamma and the daily decay.
- **What visibly changes:** the P&L curve from §2.1 lifts off the axis by the day's decay, so
  it now pokes above zero in the middle and crosses zero twice. Two readouts under the chart
  give the crossing points — the moves at which the day is exactly break-even — and two more
  give this setting's gamma and daily decay. Turning the days dial visibly steepens the
  parabola and raises the hump.

**Guided experiment.**

1. Leave the dial at 63 days. Slide the price to $100 — the position is up **+$0.048**, on a
   day when nothing happened. Slide to $104: **−$0.16**. Read the crossings: **$98.13** and
   **$101.90**.
2. Turn the dial to 5 days. Watch the parabola get dramatically steeper — gamma has gone from
   0.0265 to 0.0944 — and the flat-price profit jump to **+$0.178**. Now read the crossings
   again: **$98.16** and **$101.87**.
3. Turn it to 3 days: **$98.19** and **$101.84**.

**What to notice:** everything about the curve changed and the crossing points did not. Three
months out or three days out, this position breaks even on a $1.89 move, because the same
identity θ = −½σ²S²Γ is holding at every maturity. The risk got much bigger; the fairness
did not change.

---

### Gate — answer this to continue

**What it asks.** You rebalance this position back to its correct hedge every day, and over
the quarter the gamma term costs you real money. A colleague suggests automating it: rebalance
every minute instead, then every second. What happens to the total gamma cost over the
quarter?

**Format.** Multiple choice, single selection, four options, next section gated on an answer.
Feedback appears in the reserved block beneath the options; the page does not move.

- **(a) It stays essentially the same, because the squared moves add up to the same total
  however finely you chop the interval.** ✅ **Correct.**
  *Explanation shown:* Yes. Each step's squared move shrinks in proportion to the step, and
  you take proportionally more steps, so the sum converges to ∫σ²S²dt rather than to zero.
  That is the quadratic variation of the path, and it is the reason this cost is a cash flow
  and not an engineering error.
- **(b) It goes to zero in the limit — the whole thing is a discretisation error.**
  *Targets:* the smooth-path argument applied to a diffusion: per-step error O(dt²) times 1/dt
  steps → 0. Correct reasoning, wrong exponent on the increment.
  *Explanation shown:* That argument is exactly right for a differentiable path, where the
  increment over dt is O(dt) and the squared increment is O(dt²). A share price moves O(√dt)
  per step, so its squared increment is O(dt), and 1/dt of those sum to something finite. One
  exponent is the entire difference, and it is the same exponent that keeps the second
  derivative in Itô's lemma.
- **(c) It halves each time you double the frequency, since each move is half as big.**
  *Targets:* linear scaling of the increment with the step — treating ΔS as proportional to
  dt rather than √dt.
  *Explanation shown:* Doubling the frequency does not halve the move; it divides the move by
  √2, so the squared move halves — and then you have twice as many of them. The two effects
  cancel and the total is unchanged. If moves really did scale linearly with time, the price
  path would be differentiable and this course would be about arithmetic instead.
- **(d) It grows without limit, since you are paying the gamma term more often.**
  *Targets:* counting the events without scaling their size — the mirror of (c).
  *Explanation shown:* You do pay it more often, but each payment is smaller in exactly
  offsetting proportion. The count goes up like 1/dt and each squared move goes down like dt.
  What grows without limit under more frequent rebalancing is the number of trades, and
  Module 3 is about what those cost.

---

## §2.5 — Sixty-three days, not infinitely many

The identity in §2.4 is exact in continuous time. You do not live there. Suppose you rebalance
this position once a day for the quarter — sixty-three times — and the share really does move
with 30% volatility, exactly what the $5.98 price assumed.

Sell at $5.98, hedge daily, run to expiry, pay out whatever the paper is worth at the end.
Over 2,000 simulated paths the average result is **−$0.01**. The identity holds on average:
you collected the rent, you paid for the moves, they cancelled.

The spread does not cancel. On the same 2,000 paths the middle 90% of outcomes runs from
**−$1.10 to +$1.05**, on a position whose entire premium was $5.98. Hedging daily rather than
continuously does not change what you make on average. It changes how far any single quarter
lands from that average.

### Instrument: the rehedge dial

- **Controls:** two dials. *Rebalances over the quarter* — 1, 3, 7, 21, 63, 252. *Realized
  volatility* — 20%, 25%, 30%, 35%, 40%, meaning how much the share actually moves, as
  against the 30% the $5.98 price was based on.
- **Variables they change:** how often the hedge is reset to the current delta, and the σ used
  to generate the price paths.
- **What visibly changes:** a histogram of the final P&L across 2,000 simulated paths, with a
  marker at the mean and a shaded 5th-to-95th-percentile band; numeric readouts of both. The
  histogram visibly narrows as the rebalance dial turns up, and slides bodily left or right as
  the volatility dial turns.

**Guided experiment.**

1. Volatility at 30%. Set rebalances to 1 — you hedge once, at the start, and never again.
   The band runs **−$9.31 to +$5.53**. Now turn it to 63: **−$1.10 to +$1.05**. Watch the mean
   readout while you do it: it sits near zero the whole way.
2. Keep turning to 252. The band is **−$0.55 to +$0.53** — halved again for four times the
   rebalancing. Spread scales like 1/√N, so buying half the spread costs four times the work.
3. Now set rebalances back to 63 and turn the volatility dial to 20%. The whole histogram
   slides right: mean **+$1.98**. Turn it to 40%: mean **−$2.00**.

**FIGURE 2.5 — What each dial does.**
Two panels. Left: spread of quarter-end P&L against number of rebalances, log axis on both,
close to a straight line of slope −½. Right: mean quarter-end P&L against realized
volatility, a straight line crossing zero at 30% with slope about −$0.20 per volatility
point. Both computed from 2,000 simulated paths per setting on this contract.

| Rebalances | Mean | 5th–95th percentile |
|---|---|---|
| 1 | −$0.10 | −$9.31 to +$5.53 |
| 3 | −$0.01 | −$4.64 to +$4.11 |
| 7 | −$0.02 | −$3.24 to +$3.00 |
| 21 | −$0.02 | −$1.91 to +$1.81 |
| 63 | +$0.01 | −$1.10 to +$1.05 |
| 252 | −$0.00 | −$0.55 to +$0.53 |

| Realized volatility | Mean (hedging daily) |
|---|---|
| 20% | +$1.98 |
| 25% | +$0.99 |
| 30% | −$0.01 |
| 35% | −$1.01 |
| 40% | −$2.00 |

**What to notice:** the two dials do different jobs and neither substitutes for the other.
Rebalancing more often shrinks the *spread* and leaves the *mean* alone. Realized volatility
moves the *mean* and rebalancing cannot touch it. You are not being paid for hedging
diligently. You are being paid for the share moving less than 30%, and hedging diligently only
determines how reliably you collect it.

---

## Where this leaves you

The fraction of a share you hold is the slope of a curved function, so it cannot stay put; the
curvature has a size called gamma; every move charges you ½Γ(ΔS)² and every day pays you
θ = −½σ²S²Γ, which is the same number at the typical move — and the whole quarter comes down
to whether the share moved more or less than the price you sold at assumed.

---

## End-of-module checks

Six items. Answer them in any order; the closing block appears when all six are answered.

---

**Item 1.** *Format: multiple choice, four options.*

**What it asks.** You are holding the correct hedge against a paper you sold. The share
gaps — it moves $8 overnight in one jump. Which is true of your P&L?

- **(a) You lose, and you would have lost the same amount had it gapped $8 the other way.**
  ✅ **Correct.**
  *Explanation:* The residual after hedging depends on (ΔS)², which is $64 either way. The
  hedge removed the term that knew about direction; the term that survives does not.
- **(b) You lose if it gaps up, gain if it gaps down.**
  *Targets:* the belief that being short the paper is a bearish position even after hedging.
  *Explanation:* Before you hedged, that was true — you owed a payoff that grows as the share
  rises. Buying 0.53 shares removed exactly that. What is left is symmetric in the move, so
  the down-gap is a loss too, of the same size.
- **(c) You break even; that is the point of a hedge.**
  *Targets:* first-order thinking — the tangent mistaken for the curve.
  *Explanation:* The hedge cancels the first-order term only. Over an $8 move the curve has
  pulled well away from its tangent: about −$0.85 by ½Γ(ΔS)² and −$0.80 on a full
  revaluation, and no amount of choosing a better single fraction fixes it, because no straight line follows a curve for $8.
- **(d) You lose roughly eight times what a $1 move would have cost.**
  *Targets:* linear scaling of the residual — carrying the first-order intuition into the
  second-order term.
  *Explanation:* Sixty-four times, not eight. The residual goes with the square of the move,
  which is why a quiet week of $1 moves is cheap and one $8 day is not. A $1 move costs
  $0.013; an $8 move costs about $0.80.

---

**Item 2.** *Format: numeric entry, tolerance ±$0.05.*

**What it asks.** Gamma on this contract is 0.0265. You are short one paper, hedged. The
share moves $5 with no time passing. How much do you lose, in dollars?

**Correct answer: $0.33** (accepted range $0.28–$0.38; exact revaluation gives $0.32).

*Explanation shown on a correct entry:* ½ × 0.0265 × 25 = $0.33, against $0.32 from a full
revaluation. The approximation is good here because gamma has barely changed over a $5 move.

*Explanation shown on an entry near $0.13:* That is Γ × ΔS — the change in your hedge
fraction, 0.13 of a share, not a dollar amount. The money is ½Γ(ΔS)²; the half and the square
are both doing work.

*Explanation shown on an entry near $0.07:* That looks like ½ × 0.0265 × 5 — the square is
missing. A $5 move costs twenty-five times a $1 move, not five times.

*Explanation shown on any other entry:* The formula is ½Γ(ΔS)²: half, times gamma of 0.0265,
times the move squared, 25. That is $0.33, and the sign is against you because you sold the
curve.

---

**Item 3.** *Format: set-the-control. The rehedge dial from §2.5, with the volatility dial
fixed at 30%.*

**What it asks.** Turn the rebalance dial until the 5th-to-95th-percentile band first fits
inside ±$1.20. Leave it at that setting.

**Correct answer: 63.**

*Explanation shown at 63:* At 63 the band is −$1.10 to +$1.05; at 21 it is −$1.91 to +$1.81.
Note what the mean readout did while you turned it: essentially nothing. Frequency buys
certainty, not profit.

*Explanation shown at 21 or lower:* Still outside — the band at 21 is nearly ±$1.90. Keep
turning. The spread falls like 1/√N, so it takes a tripling to bring ±1.9 down to ±1.1.

*Explanation shown at 252:* That fits, but it is not the first setting that does — 63 already
brings the band inside ±$1.20, at a quarter of the trading. Turn back and check.

---

**Item 4.** *Format: order these, drag into rank.*

**What it asks.** Rank these four positions by gamma, largest first. All are the same paper
struck at $100, held one at a time.

- Share at $100, two days to expiry
- Share at $100, one month to expiry
- Share at $100, three months to expiry
- Share at $115, three months to expiry

**Correct order:** two days ($100) 0.149 → one month ($100) 0.046 → three months ($100)
0.0265 → three months ($115) 0.0139.

*Explanation shown on the correct order:* Both effects are visible in one ranking. Holding the
price at the strike, gamma grows as expiry approaches — the value curve is turning into a
kink. Holding time fixed, gamma falls as the price walks away from the strike — at $115 the
curve is nearly straight.

*Explanation shown when the two-day item is ranked last:* Time to expiry works the opposite
way for gamma than it does for the option's price. The paper is worth less with two days left
than with three months, but its curvature at the strike is more than five times greater — all
of the bending has to happen in the little time remaining.

*Explanation shown when $115 is ranked above $100 at three months:* At $115 the paper is very
likely to be exercised, so its value is nearly a straight line in the share price — hedge
fraction 0.84 and creeping. Nearly straight means little curvature: 0.0139 against 0.0265 at
the strike.

*Explanation shown on any other order:* Two rules settle all four: gamma peaks at the strike,
and at the strike it grows as expiry approaches. Figure 2.2 has all four numbers.

---

**Item 5.** *Format: multiple choice, four options.*

**What it asks.** A different paper on the same share: same three months, but it lets its
holder buy at $115 rather than $100. Its hedge fraction is 0.288 and the chance the share
finishes above $115 is 0.239. Why is the first number the larger of the two?

- **(a) Because the hedge fraction weights outcomes by how much you would owe, not merely by
  whether you would owe anything — and the cases where you owe a lot are the cases where the
  share has risen.** ✅ **Correct.**
  *Explanation:* That is the distinction. The probability counts a finish at $115.01 the same
  as a finish at $180. The hedge fraction is a derivative of value, and value cares how far
  above the strike you land, so the far-above outcomes pull it up. The two numbers are close
  because they are asking similar questions, and they are never equal because they are not the
  same question.
- **(b) The gap is the seller's profit margin built into the price.**
  *Targets:* reading any discrepancy between two numbers as somebody's fee.
  *Explanation:* No fee is in either number. Both come from the same pricing formula with the
  same inputs; one is the slope of the value curve, the other is a probability, and they
  differ because a slope and a probability are different objects. Set the volatility to zero
  and they would coincide.
- **(c) Because the share is expected to drift upward over three months.**
  *Targets:* attributing the N(d₁)/N(d₂) gap to drift.
  *Explanation:* There is no drift in these numbers — this course has set interest rates to
  zero and the pricing does not use a forecast of the share's direction. The gap survives with
  no drift at all. It comes from weighting by size of payoff, not from any expected rise.
- **(d) Because with a $115 strike you need more shares than with a $100 strike.**
  *Targets:* the direction of the strike effect.
  *Explanation:* The opposite: a higher strike makes the paper less likely to matter, and its
  hedge fraction is 0.288 against the 0.530 you have been holding all module. The question is
  not why 0.288 is big, but why it exceeds the 0.239 chance of finishing above $115.

---

**Item 6.** *Format: drag-to-label, three items into three slots.*

**What it asks.** Match each situation to the fraction of a share you would hold against one
paper struck at $100 with three months to run.

Situations: share at $80 · share at $100 · share at $130.
Fractions: 0.079 · 0.530 · 0.966.

**Correct pairing:** $80 → 0.079; $100 → 0.530; $130 → 0.966.

*Explanation shown on the correct pairing:* The fraction runs from nearly nothing to nearly a
whole share, and the interesting part is the middle. At $130 you are holding almost a full
share because you will almost certainly owe one; at $80 almost none; at $100 you hold half a
share against an outcome that has not been decided.

*Explanation shown when $80 and $130 are swapped:* Check the direction: the paper you sold
costs you money when the share rises, so the higher the share, the more of it you must hold.
At $80 the paper is nearly worthless and needs almost no cover.

*Explanation shown when $130 is matched to 0.530:* 0.530 is the fraction at $100, where the
outcome is genuinely undecided. At $130 the paper is nearly certain to be used, its value
curve is nearly a straight line of slope 1, and the fraction that matches that slope is nearly
1 — 0.966 here, not quite 1 because three months is still enough time for $30 to evaporate.

*Explanation shown on any other pairing:* The fraction is the slope of the value curve, and
that curve is flat at low prices, steepest in the middle, and nearly a 45-degree line at high
prices. Slopes: 0.079, 0.530, 0.966.

---

## ▸ Before Module 3

**What this module argued, in one sentence.** The fraction you hold is the slope of a curved
value function, so every price move leaves you with ½Γ(ΔS)² — a cost when you are short it,
paid for by a daily rent θ = −½σ²S²Γ that is exactly fair at the typical move and exactly
unfair at any other.

**What Module 3 does.** It takes this position out of the laboratory: where the curvature
concentrates as expiry approaches, what it costs to rebalance in a real market, and why the
$5.98 was a forecast of volatility all along — which is what makes your colleague's sentence
readable.

**Head back to the chat and answer this before Module 3:**

> Your colleague says *"we're short gamma into the print"* — the print being a scheduled data
> release that usually moves the share price hard. In your own words: what is she worried
> about, and what will she have to do on the day?

*(No box here — type it in the chat, where somebody can read what you actually wrote.)*
