# Composition Patterns

Use this after the context card and before detailed styling. These patterns were recovered from earlier versions of the skill because they encode useful structural decisions. Treat them as hypotheses with contraindications, never templates.

## Product And Operational Patterns

### Operator Cockpit

Use for studios, consoles, command centers, and repeated workflows when one current object or situation must dominate.

- Center: current artifact, incident, queue, scene, map, or decision.
- Edge: navigation and mode.
- Context rail: inspector, evidence, ownership, history, or safe actions.
- Secondary rail: logs, timeline, activity, or diagnostics.

Avoid when the product is primarily reading or persuasion. For a command center, add freshness and incident lifecycle; for a studio, add selection, undo, and artifact state. The shell shape alone does not settle the context.

### Decision List Plus Evidence Pane

Use when users compare records, candidates, issues, orders, assets, or alerts.

- Keep scan density and selection stable in the list.
- Explain the selected item in the evidence pane.
- Put the meaningful action beside evidence instead of shouting it on every row.
- Encode risk, confidence, freshness, or consequence in a consistent row grammar.

Avoid when every item requires full-bleed media, when evidence is too sparse, or when selection context would disappear on narrow screens.

### Workflow Strip

Use for pipelines, onboarding, review queues, build systems, and status-heavy flows.

- Each stage exposes count, owner, risk, next action, and recovery.
- The current stage must be useful, not merely highlighted.
- Preserve nonlinear branches instead of lying with a decorative stepper.

Avoid when work is exploratory, highly concurrent, or has no meaningful stage boundaries.

### Inspector Workbench

Use for editors, design tools, media tools, devtools, creative apps, and configuration surfaces.

- The canvas, preview, document, timeline, or selected object owns visual weight.
- Group controls by object and intent.
- Make advanced controls discoverable without presenting a parameter landfill.
- Bind changes to visible handles, annotations, regions, or immediate feedback when possible.

Avoid when there is no central object to inspect or a short form would complete the task faster.

### Incident Spine

Use for command centers where detection, evidence, ownership, action, and recovery must remain connected.

- Stable spine: event summary, freshness, scope, owner, acknowledged state, evidence, action, recovery.
- Surrounding feeds support the spine; they do not compete with it.
- Preserve temporal order and handoff notes.

Avoid for passive analytics. A dashboard question does not need an incident lifecycle costume.

## Dashboard And Information Patterns

### Question-Led Overview

Use when several measures answer one operational or strategic question.

- Lead with the decision or threshold.
- Group supporting measures by consequence, not chart type.
- Keep comparison scales, time windows, and freshness aligned.
- Provide a stable route into exact evidence.

Avoid generic KPI mosaics or one-card-per-query layouts.

### Comparison Canvas

Use for old/new, current/target, manual/automated, cohort/cohort, plan/plan, or risk/reward.

- Share a consistent frame and align meaningful differences.
- Explain consequence, not feature inventory.
- Keep the comparison readable without forcing memory across distant sections.

Avoid false symmetry, incomparable scales, or comparisons whose caveats cannot fit beside the evidence.

## Brand And Persuasion Patterns

### Artifact Stage

Use when a real product, output, object, place, image, material, or interaction should carry the first impression.

- Make the artifact the hero, not decoration behind a text card.
- Frame or overlay copy without hiding inspection.
- Let the next section reveal proof or mechanism.

Avoid when no credible asset exists. State the asset gap instead of forging a fake product preview.

### Proof Wall

Use for high-trust offers when distinct evidence objects can carry the story.

- Move from claim to mechanism to inspectable evidence to action.
- Give each section one real proof job: case, metric, workflow, comparison, output, source, or testimony.
- Make proof more specific than the claim.

Avoid when proof is weak, invented, duplicated, or irrelevant to the buyer's objection.

### Editorial Path

Use for portfolios, launches, archives, cultural surfaces, and story-led products.

- Vary pacing across full-bleed artifact, tight proof, process, fragment, annotation, index, and return path.
- Let type and image sequence structure discovery.
- Preserve orientation, direct access, and reduced-motion alternatives.

Avoid for high-frequency workflows or when editorial costume is compensating for thin content.

## Hybrid Patterns

### Product-Led Landing

Use when the product mechanism is the best proof.

- Brand register introduces value and audience.
- Product register takes over inside previews, controls, pricing, forms, and docs handoff.
- Use a real state, honest generated bitmap, or named asset gap.

Avoid fake dashboards, fake terminals, and controls that look interactive but are not.

### Onboarding As Empty State

Use when the product starts without data.

- Teach the first meaningful setup action.
- Label sample content honestly.
- Treat permissions, import, progress, success, and recovery as product states.

Avoid decorative welcome screens that postpone useful work.

### Docs With Product Gravity

Use for APIs, SDKs, integrations, plugins, and technical tools.

- Expose quickstart, examples, reference, troubleshooting, and copyable/runnable artifacts as task paths.
- Shift from persuasion language to task language quickly.

Avoid code rain, generic developer cosplay, or fake terminals.

## Interactive And Game Patterns

### Playable Surface First

Use for browser games, simulations, generators, shaders, and interactive explainers.

- The usable surface occupies the first viewport.
- Controls stay compact and adjacent to their effect.
- Status and debug information remain subordinate until relevant.

For a game, protect gameplay focus and safe areas. For a lab, preserve reset, reproducibility, and fallback. Avoid landing-page preambles before the actual experience.

### Instrument Panel

Use when a small set of high-leverage controls continuously shapes an output.

- Keep essential controls reachable.
- Express presets as intent, not raw parameter dumps.
- Let diagnostics explain behavior without dominating the output.
- Borrow physical cues only when they improve mapping or feedback.

Avoid when a short form plus result would do the job. A cockpit built for three inputs is cosplay with knobs.

### HUD Perimeter

Use during live play when information must remain glanceable without occupying the focal area.

- Assign persistent status to stable safe-area zones.
- Bring temporary objectives, warnings, and feedback inward only for their useful duration.
- Match salience to urgency and verify against moving scene contrast.

Avoid treating the perimeter as storage. If every corner is full, the HUD has become an attic.

## Selection Gate

Choose a pattern only when it:

- serves the first decision or action;
- gives the primary artifact sovereignty;
- has a home for secondary information and failure states;
- survives the real scroll, viewport, and input model;
- creates a useful place for the signature move;
- remains recognizably correct when decorative styling is removed.

If the pattern fails two of these, return to the context card instead of decorating the skeleton.
