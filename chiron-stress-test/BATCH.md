# Stress-test batch

Held-out pairs (FIXED across all rounds; never used to decide an edit — regression check only):

- **H1 — easy topic, true novice.** *How a bill becomes a law in the US Congress.*
  Learner: 16-year-old high-school student, no civics background, has a class
  discussion next week and finds the news confusing.
- **H2 — hard topic, strong adjacent expertise.** *Kalman filters.*
  Learner: embedded-systems hobbyist building a quadcopter. Fluent in C, matrix
  algebra and PID control loops; has never touched probability-based estimation
  and does not know what a covariance is.

Working pairs rotate each round (3 per round).

## Round 1 working set
- **W1 — easy topic, novice, practical.** *Why a sourdough starter rises, and why it dies.*
  Learner: home cook, no science background past high school, has killed two starters
  and wants the third to live.
- **W2 — medium-hard, adjacent expertise.** *Why a Postgres query goes slow once the
  table grows (planner, statistics, index choice).*
  Learner: mid-level backend engineer, four years of SQL through an ORM, has never
  read an EXPLAIN plan and does not know the word "cardinality".
- **W3 — hard topic, deep adjacent math, zero domain vocabulary.* *Option greeks:
  delta and gamma.*
  Learner: quantitative epidemiologist. Comfortable with calculus, PDEs and
  stochastic processes; knows nothing about finance and has never bought a stock.
