# Authoring-subagent prompt template (used every round)

Read `chiron-stress-test/SKILL.md` in full. It is a Claude skill for building courses.
Behave exactly as if that skill had just fired on the request below. Follow it literally
— every numbered section, every rule.

TOPIC + LEARNER: <pair>

You must play both sides, because there is no live learner. When the skill calls for a
learner turn, write a short, realistic, in-character reply for the learner profile above
— thin, hedged, using only the vocabulary that profile would actually have. Do not write
an ideal learner; write a plausible one. Mark those turns clearly as `[SIMULATED LEARNER]`.

Produce, in one file, in this order:

1. `## HOOK` — the literal opening turn, exactly as the learner would receive it.
2. `[SIMULATED LEARNER]` — their first attempt.
3. (any §1 follow-up turn the skill permits, plus the simulated reply)
4. `## COURSE PLAN` — the full contents of the plan file the skill says to write.
5. `## MODULE LIST TURN` — the literal message showing the module list.
6. `[SIMULATED LEARNER]` — their answer to module 1's boundary question, written to
   contain a realistic partial misunderstanding.
7. `## BOUNDARY TURN` — the literal chat turn responding to it.
8. `## MODULE 2` — one full module's content, complete.

CRITICAL — how MODULE 2 must be written:

- **Markdown / plain text prose only. No HTML, no JSX, no React, no CSS, no `<div>`.**
  Write the actual composed prose a learner would read, in full. Not an outline, not a
  description of what the module would contain, not placeholders.
- Every section written out: its claim, its explanation, the what-to-notice line.
- Every figure described in words — say what it plots, what the axes are, what the shape
  is, and where the numbers came from.
- Every interactive check written out as text, in this form:
    - what the check asks
    - the format it would use
    - each option, and for the wrong ones, the misconception that option targets
    - the correct answer
    - the per-option explanation text the learner would see
- Every instrument written out as: the control's name, the variable it changes, what
  visibly changes, plus the guided-experiment steps in full.
- The handoff block written out in full.

The content is what is under test, not the container. A rendered widget or any markup is
a failure of this task. Write the words.

Write the whole thing to the output path you are given. Do not summarise it back; reply
with only the file path and a one-line note.
