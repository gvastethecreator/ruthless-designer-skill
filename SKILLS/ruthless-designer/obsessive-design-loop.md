# Obsessive Design Loop

Use this for substantial greenfield UI, broad redesign direction, explicit completeness/polish, user-declared obsession, or any design mission where meaningful weaknesses remain and the user did not set a time, budget, or loop count.

Obsession is measured in the artifact. A design loop counts only when it changes the design, inspects the rendered result, or produces proof that changes the next design move.

## Artifact Ratio

At least 70% of actions must directly change or inspect the artifact:

- edit the UI, spec, prompt pack, component, layout, asset, state, or copy
- render, screenshot, compare, run, test, or inspect the actual result
- fix a finding from visual QA, critique, responsive proof, or state coverage

The remaining 30% can be reference reading, planning, notes, or routing. If the run starts becoming mostly process, stop and touch the design.

## Obsessive Backlog

Before looping on a broad design, seed a backlog from the real artifact or intended artifact:

```text
id:
severity: blocker | major | minor
lens:
evidence:
user impact:
proposed fix:
proof needed:
status: open | fixed | scoped-out
```

Use these lenses:

- first impression: what this is, what to do, whether it looks like a template
- hierarchy: loud, quiet, hidden, delayed, competing
- product specificity: artifact, data, workflow, object, audience, proof
- state coverage: happy, empty, loading, error, permission/recovery, overflow
- responsive fit: desktop, narrow, touch, text wrapping
- visual system: type, spacing, color roles, surface model, radius, icon grammar
- interaction: affordance, feedback, focus, motion purpose, interruption
- asset truth: real/generative/source asset quality, crop, edge, subject, alt
- conversion/trust for brand surfaces: offer, proof, objection, CTA path

For substantial missions with no explicit limit, target 30 concrete weaknesses or risks when the surface is large enough. Use fewer only when the artifact is honestly small or the user limited scope.

## Valid Loop

Each counted loop must include:

```text
Loop N:
Source item:
Before evidence:
Action:
After evidence:
Verdict: substantially better | mixed | flat | worse
Remaining concern:
Next action:
```

A loop does not count if it only adds process, repeats the requirement, says "looks good", changes docs for a UI deliverable, or creates proof that does not test a real risk.

## Material Mix

By Loop 30, at least 60% of counted loops must materially change the design or implementation:

- hierarchy
- information architecture
- layout
- visual system
- state model
- copy
- interaction
- accessibility
- responsiveness
- performance
- asset quality
- proof tooling

Proof-only loops can close real risks, but they cannot dominate.

## Evidence Gates

Before a broad design is a win, pass these gates:

- Side-by-side: compare final against baseline, competent default, reference, or horizon. A reviewer must name the improvement without your explanation.
- First impression: desktop and mobile screenshots answer what this is, what to do, and why it is not a default template.
- States: happy, empty, loading, error, permission/recovery, overflow, and narrow layout were seen or intentionally scoped.
- Source/reference: facts, assets, visual references, and design-system choices that shaped the result are named.
- Visual QA: source truth and rendered result were compared when a source exists.
- No self-certification: every claim points to screenshot, command output, diff, source artifact, or explicit blocker.

## Direction Reset

Two consecutive `flat` or `worse` verdicts mean the direction failed.

Do this instead of polishing:

1. Admit the direction failed in one sentence.
2. Write the kill list: what must be deleted, not adjusted.
3. Pick a new positive target with one concrete signature move.
4. Rebuild from that direction.
5. Re-enter the loop with fresh evidence.

## Stop Rule

Stop only when:

- every blocker and major finding is fixed or scoped out with a reason
- proof covers the main path and one meaningful edge/recovery path
- side-by-side evidence beats the baseline or the final status honestly says it did not
- the persistence target is satisfied or an evidence-backed no-padding/blocker verdict explains why fewer loops are honest
- Loop 30, if reached, has a `continue`, `ask`, or `stop` verdict

Loop count is not quality. The design's margin over baseline is quality.
