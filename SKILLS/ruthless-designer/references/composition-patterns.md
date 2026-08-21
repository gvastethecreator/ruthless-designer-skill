# Composition Patterns

Use after the context card and before detailed styling. Recovered from earlier skill versions because they encode useful structural decisions. Hypotheses with contraindications, never templates.

## Product And Operational Patterns

### Operator Cockpit

Studios, consoles, command centers, repeated workflows: one current object or situation must dominate.

- Center: current artifact, incident, queue, scene, map, or decision.
- Edge: navigation and mode.
- Context rail: inspector, evidence, ownership, history, or safe actions.
- Secondary rail: logs, timeline, activity, or diagnostics.

Avoid for primarily reading or persuasion. Command center: add freshness and incident lifecycle. Studio: add selection, undo, and artifact state. Shell shape alone does not settle context.

### Decision List Plus Evidence Pane

Users compare records, candidates, issues, orders, assets, or alerts.

- Keep scan density and selection stable in list.
- Explain selected item in evidence pane.
- Put meaningful action beside evidence instead of shouting it on every row.
- Encode risk, confidence, freshness, or consequence in consistent row grammar.

Avoid when every item needs full-bleed media, evidence is too sparse, or selection context would vanish on narrow screens.

### Workflow Strip

Pipelines, onboarding, review queues, build systems, status-heavy flows.

- Each stage exposes count, owner, risk, next action, and recovery.
- Current stage must be useful, not merely highlighted.
- Preserve nonlinear branches; do not lie with decorative stepper.

Avoid when work is exploratory, highly concurrent, or has no meaningful stage boundaries.

### Inspector Workbench

Editors, design tools, media tools, devtools, creative apps, configuration surfaces.

- Canvas, preview, document, timeline, or selected object owns visual weight.
- Group controls by object and intent.
- Make advanced controls discoverable without parameter landfill.
- Bind changes to visible handles, annotations, regions, or immediate feedback when possible.

Avoid when there is no central object to inspect or a short form would finish the task faster.

### Incident Spine

Command centers where detection, evidence, ownership, action, and recovery must stay connected.

- Stable spine: event summary, freshness, scope, owner, acknowledged state, evidence, action, recovery.
- Surrounding feeds support spine; they do not compete with it.
- Preserve temporal order and handoff notes.

Avoid for passive analytics. A dashboard question does not need incident-lifecycle costume.

## Dashboard And Information Patterns

### Question-Led Overview

Several measures answer one operational or strategic question.

- Lead with decision or threshold.
- Group supporting measures by consequence, not chart type.
- Keep comparison scales, time windows, and freshness aligned.
- Provide stable route into exact evidence.

Avoid generic KPI mosaics or one-card-per-query layouts.

### Comparison Canvas

Old/new, current/target, manual/automated, cohort/cohort, plan/plan, or risk/reward.

- Share consistent frame and align meaningful differences.
- Explain consequence, not feature inventory.
- Keep comparison readable without forcing memory across distant sections.

Avoid false symmetry, incomparable scales, or comparisons whose caveats cannot fit beside the evidence.

## Brand And Persuasion Patterns

### Artifact Stage

A real product, output, object, place, image, material, or interaction should carry the first impression.

- Artifact is hero, not decoration behind text card.
- Frame or overlay copy without hiding inspection.
- Next section reveals proof or mechanism.

Avoid when no credible asset exists. State the gap; do not forge a fake product preview.

### Proof Wall

High-trust offers when distinct evidence objects can carry the story.

- Claim -> mechanism -> inspectable evidence -> action.
- Each section one real proof job: case, metric, workflow, comparison, output, source, or testimony.
- Proof more specific than claim.

Avoid when proof is weak, invented, duplicated, or irrelevant to the buyer's objection.

### Editorial Path

Portfolios, launches, archives, cultural surfaces, story-led products.

- Vary pacing across full-bleed artifact, tight proof, process, fragment, annotation, index, and return path.
- Type and image sequence structure discovery.
- Preserve orientation, direct access, and reduced-motion alternatives.

Avoid for high-frequency workflows or when editorial costume is compensating for thin content.

## Hybrid Patterns

### Product-Led Landing

The product mechanism is the best proof.

- Brand register introduces value and audience.
- Product register takes over inside previews, controls, pricing, forms, and docs handoff.
- Use real state, honest generated bitmap, or named asset gap.

Avoid fake dashboards, fake terminals, and controls that look interactive but are not.

### Onboarding As Empty State

The product starts without data.

- Teach first meaningful setup action.
- Label sample content honestly.
- Treat permissions, import, progress, success, and recovery as product states.

Avoid decorative welcome screens that postpone useful work.

### Docs With Product Gravity

APIs, SDKs, integrations, plugins, technical tools.

- Expose quickstart, examples, reference, troubleshooting, and copyable/runnable artifacts as task paths.
- Shift from persuasion language to task language quickly.

Avoid code rain, generic developer cosplay, or fake terminals.

## Interactive And Game Patterns

### Playable Surface First

Browser games, simulations, generators, shaders, interactive explainers.

- Usable surface occupies first viewport.
- Controls stay compact and adjacent to their effect.
- Status and debug remain subordinate until relevant.

Game: protect gameplay focus and safe areas. Lab: preserve reset, reproducibility, and fallback. Avoid landing-page preambles before the actual experience.

### Instrument Panel

A small set of high-leverage controls continuously shapes an output.

- Essential controls reachable.
- Presets as intent, not raw parameter dumps.
- Diagnostics explain behavior without dominating output.
- Borrow physical cues only when they improve mapping or feedback.

Avoid when a short form plus result would do the job. A cockpit built for three inputs is cosplay with knobs.

### HUD Perimeter

Live play when information must stay glanceable without occupying the focal area.

- Persistent status in stable safe-area zones.
- Temporary objectives, warnings, and feedback move inward only for their useful duration.
- Match salience to urgency; verify against moving scene contrast.

Avoid treating the perimeter as storage. If every corner is full, the HUD has become an attic.

## Selection Gate

Choose a pattern only when it:

- serves first decision or action;
- gives primary artifact sovereignty;
- has home for secondary information and failure states;
- survives real scroll, viewport, and input model;
- creates useful place for signature move;
- remains recognizably correct when decorative styling is removed.

If the pattern fails two of these, return to the context card instead of decorating the skeleton.
