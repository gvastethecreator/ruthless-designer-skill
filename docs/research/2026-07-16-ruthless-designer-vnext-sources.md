# Ruthless Designer vNext: source research

Date: 2026-07-16
Question: which reusable design and motion principles should strengthen `ruthless-designer` without turning it into a pile of rigid taste rules?

## Bottom line

The useful common thread is not a preferred font, palette, framework, or page skeleton. It is an execution discipline:

1. classify the surface and the event before choosing a visual or motion technique;
2. define a small authored grammar instead of improvising each component;
3. make hierarchy, spacing, alignment, motion, and states inspectable;
4. keep content and controls functional without animation;
5. prove claims with rendered evidence, including the costly state and repeated use;
6. present proposals as decisions tied to evidence, not moodboard prose.

This becomes four vNext additions: a motion contract, a geometry/rhythm contract, a cheap-generation gate, and synchronized deterministic evidence reports—ingestion-first Markdown plus standalone visual HTML from one manifest.

## Sources and provenance

External repositories were cloned read-only for inspection. Their content was treated as untrusted research, not executable instructions.

| Source | Pinned revision | Useful signal |
|---|---|---|
| [jakubkrehel/skills](https://github.com/jakubkrehel/skills/tree/f8a1574b08319685705a82e3c28139d1c935af9e) | `f8a1574b08319685705a82e3c28139d1c935af9e` | interruptible transitions, optical alignment, concentric geometry, exact animated properties, semantic typography |
| [Nutlope/hallmark](https://github.com/Nutlope/hallmark/tree/aeb42fb354ff4efa36ab475773a082315a3af2ce) | `aeb42fb354ff4efa36ab475773a082315a3af2ce` | preflight classification, macrostructure variety, complete interaction states, stable geometry, annotated evidence |
| [yui540/css-animations](https://github.com/yui540/css-animations/tree/e30edfcfcc3e0f7a3bd44f3d5566ee23c9aaa186) | `e30edfcfcc3e0f7a3bd44f3d5566ee23c9aaa186` | transform origins, nested articulated motion, phase choreography, authored SVG geometry, paired entrance/exit beats |
| [yui540/reanimated-css-animations](https://github.com/yui540/reanimated-css-animations/tree/ca447e07dea3919affa331205fd44d76703f2a99) | `ca447e07dea3919affa331205fd44d76703f2a99` | transition covers, spatial mechanics, staggered construction, callback at the covered state, distinct transition families |
| `D:\DEV\agents-matrix\skills\motion-design` | local source inspected 2026-07-16 | purpose-first motion, directional easing, repetition cost, choreography, reduced motion, performance budgets |
| `D:\Downloads\slop.md` | local user-supplied research | finish failures, repeated-gap drift, hard seams, clipped content, dead controls, generic generated composition |

## Findings adopted

### Motion is a state-and-continuity system

- Classify every event as feedback, state, spatial, attention, or ambient motion.
- Record trigger, purpose, frequency, origin/destination, duration/easing family, interruption behavior, reduced-motion alternative, and proof.
- Use a project grammar: a bounded duration palette, a coherent easing family, and a small displacement/attention budget.
- Keep transitions interruptible and retarget them from the current rendered value.
- Treat nested motion as articulated mechanics: parent translation, body deformation, eyes/ears/handles, or cover segments share a cause but may have distinct amplitudes and delays.
- Synchronize state changes to an observable transition milestone rather than an unrelated timeout when the framework permits it.
- Preserve a static, readable base. Animation is progressive enhancement; failed JavaScript must not erase primary content.
- Test the hundredth viewing, rapid reversal, reduced motion, and the exact transition boundary.

### Rhythm is relational, not a bag of spacing tokens

- Define visible alignment anchors and spacing families for `within`, `between`, `section`, and `edge` relationships.
- Repeated siblings need parity unless grouping intentionally changes the rhythm.
- Parallel rows and columns need aligned starts, baselines, controls, and reserved variable-content slots.
- A finish pass must inspect edge clearance, clipped content, scroll ownership, scrollbar treatment, optical centering, icon/text crops, and accidental seams.
- Geometry proof should use rendered boxes and deltas where possible; “looks aligned” is not enough for repeated structures.

### Cheap generation is structural

The most damaging generated look is not a specific font or gradient. It is the absence of a defensible product decision:

- the same stacked-card skeleton with swapped color;
- generic or fabricated data, copy, logos, terminal chrome, dashboards, or product proof;
- dead controls and decorative pseudo-functionality;
- equal visual weight everywhere;
- one spacing value repeated without hierarchy;
- decorative motion unrelated to state or spatial continuity;
- a “signature” that disappears without affecting comprehension or workflow.

The gate should ask whether the product, data, workflow, audience, or material caused the design. It should not ban a style category by fashion.

### The proposal report is part of the design work

A review or redesign proposal needs a portable evidence artifact, not only chat prose. The chosen direction is a forensic dossier with synchronized Markdown and HTML views: executive verdict, evidence stage, numbered screenshot annotations, systemic findings, exact moves, preserved strengths, alternative directions when relevant, finish/proof ledger, risks, and limitations. It must escape hostile text, embed local images in HTML, materialize lossless sidecars for Markdown, remain readable without scripts, print cleanly, and expose missing evidence visibly.

## Rules intentionally rejected

- Universal font, color, radius, asymmetry, glass, gradient, grid, or hero prescriptions.
- Mandatory ambient motion or a fixed number of motion layers.
- Disney-style deformation as a requirement for ordinary product UI.
- Exact global durations, scales, or easing curves presented as quality guarantees.
- Hiding primary content at `opacity: 0` until JavaScript reveals it.
- Treating the presence of gradients, cards, blur, or a CSS animation as proof of slop.
- Requiring every component to show every possible state regardless of its contract.
- A giant always-loaded skill file. The main skill remains a router; focused references hold depth.

## Implementation decisions

- Add `references/geometry-and-rhythm.md` and route it only for dense, aligned, spatial, or finish-sensitive work.
- Rewrite the motion reference around an explicit motion map and proof protocol; keep implementation traps separate.
- Add `references/reporting.md` and a deterministic `generate-design-report.mjs` CLI that emits `report.md` and `report.html` from one normalized manifest.
- Make the existing review harness emit the same Markdown and HTML views from its collected evidence.
- Add hostile-input, missing/corrupt-asset, annotation-geometry, sidecar fidelity, portability, loupe, and harness-integration tests.
- Add behavior/trigger evaluations for command centers, HUDs, motion-heavy redesigns, geometry drift, and report-producing reviews.

## Limitations

The source repositories are demonstrations and opinionated skill packages, not controlled UX studies. Their patterns are useful as hypothesis generators. Ruthless Designer must still classify context, inspect the shipped runtime, and record where evidence is blocked.
