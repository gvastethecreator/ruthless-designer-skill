# Composition Patterns

Use this after the design read and before detailed styling. Composition is the skeleton of the argument or workflow. Pick a pattern because it clarifies a task, proof, comparison, artifact, or story.

Do not copy these as templates. Use them as structural moves.

## Product Patterns

### Operator Cockpit

Use for dashboards, tools, studios, consoles, and repeated workflows.

- Center: current work object, queue, editor, canvas, map, or decision.
- Left or top: navigation and mode.
- Right: contextual details, alerts, history, or inspector.
- Bottom or secondary rail: logs, timeline, activity, or batch actions.
- Signature opportunity: make the current task physically dominate the shell.

Avoid when the product is mostly persuasion or reading.

### Decision Table Plus Evidence Pane

Use when users compare records, candidates, orders, issues, leads, investments, or assets.

- Table/list carries scan density.
- Evidence pane explains the selected item.
- Primary action lives in the evidence pane, not repeated loudly on every row.
- Filters and saved views stay close to the list.
- Signature opportunity: encode risk, freshness, or confidence as a readable row grammar.

Avoid when every item needs a unique media-led treatment.

### Workflow Strip

Use for multi-step flows, pipelines, onboarding, review queues, build systems, or status-heavy apps.

- Horizontal or vertical strip names stages.
- Each stage has count, owner, risk, and next action.
- The current stage is useful, not just highlighted.
- Failure/recovery state is first-class.
- Signature opportunity: show progress as work state, not decorative stepper dots.

Avoid when the process is nonlinear or exploratory.

### Inspector Workbench

Use for editors, design tools, media tools, devtools, creative apps, and configuration surfaces.

- Main canvas or preview owns visual weight.
- Inspector groups controls by object, not component implementation.
- Advanced controls collapse behind clear labels.
- Changes have immediate, reversible feedback.
- Signature opportunity: bind controls to visible handles, overlays, or annotated regions.

Avoid when there is no central object to inspect.

## Brand And Marketing Patterns

### Artifact Stage

Use when a real product, object, place, image, output, dashboard, garment, food, venue, or generated asset should carry the first impression.

- Hero is the artifact, not a text card plus decoration.
- Copy overlays or frames the artifact without hiding inspection.
- Next section peeks into proof or mechanism.
- Signature opportunity: crop, frame, material edge, or interaction model comes from the artifact.

Avoid when no credible asset exists and the asset gap cannot be stated.

### Proof Wall

Use for B2B, tools, agencies, dev products, and high-trust offers.

- One proof object per section: metric, case, screenshot, quote, workflow, comparison, or sample output.
- Avoid equal feature cards.
- The page rhythm moves from claim to evidence to action.
- Signature opportunity: make proof visually denser and more specific than the claims.

Avoid when proof is weak or invented.

### Comparison Canvas

Use when the offer is best understood against old/new, manual/automated, current/target, risk/reward, or plan/plan.

- Two or more states share a consistent frame.
- Differences are aligned and visually comparable.
- Copy explains consequence, not feature inventory.
- Signature opportunity: create one comparison surface users can read without scrolling.

Avoid when the comparison is false or too abstract.

### Editorial Path

Use for portfolios, essays, launches, studios, and story-led products.

- Sequence has varied pacing: full-bleed, tight proof, quote, process, artifact, CTA.
- Type voice is a structural decision, not just a font swap.
- Images or code/work samples carry proof.
- Signature opportunity: one recurring editorial device, such as margin notes, folios, annotated crops, or index cards.

Avoid for high-frequency product workflows.

## Hybrid Patterns

### Product-Led Landing

Use for SaaS, devtools, AI tools, creator tools, marketplaces, and apps where the product UI is the proof.

- Brand register introduces value.
- Product register takes over controls, previews, pricing, forms, and docs handoff.
- First viewport shows either a real product artifact or a clear product mechanism.
- Signature opportunity: turn a real workflow state into the hero.

Avoid fake dashboards. If the screenshot is unavailable, state the asset gap and use a generated bitmap or live component state only when honest.

### Onboarding As Empty State

Use when a product starts with no data.

- Empty state teaches the first meaningful setup action.
- Sample content is clearly sample content.
- Permissions, import, and first-run success are designed as states, not popups.
- Signature opportunity: make the first data object feel like the product coming alive.

Avoid decorative welcome screens that delay the first task.

### Docs With Product Gravity

Use for developer tools, APIs, integrations, plugins, SDKs, and technical products.

- Quickstart, examples, reference, and troubleshooting are visible as task paths.
- Code and UI examples use real names and realistic states.
- Marketing language gives way to task language fast.
- Signature opportunity: one runnable or copyable artifact anchors the page.

Avoid decorative code rain, fake terminals, and generic developer cosplay.

## Prototype And Tool Patterns

### Playable Surface First

Use for games, interactive explainers, generators, simulators, shaders, and creative prototypes.

- The first viewport is the actual interactive surface.
- Controls are compact and adjacent to their effect.
- Status and debug information are subordinate until needed.
- Signature opportunity: interaction grammar carries the visual identity.

Avoid landing-page preambles before the usable thing.

### Instrument Panel

Use for technical prototypes, audio/video tools, renderers, game editors, labs, and experiments.

- A small set of high-leverage controls is always reachable.
- Metrics and diagnostics are legible but not visually louder than the output.
- Presets expose intent, not just parameter dumps.
- Signature opportunity: physical instrument cues without fake skeuomorphic clutter.

Avoid when a simple form is enough.

## Selection Checklist

- Pattern serves the user's first decision or action.
- Main artifact/proof/task is visually dominant.
- Secondary information has a clear place to live.
- Empty/loading/error/permission/overflow states can inhabit the same structure.
- Mobile/narrow layout has a real structural plan, not only stacked cards.
- The selected pattern gives the signature move somewhere useful to appear.

See [signature-moves.md](signature-moves.md) and [greenfield-design.md](greenfield-design.md).
