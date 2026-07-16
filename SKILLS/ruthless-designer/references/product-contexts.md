# Product Contexts

Use this before choosing a direction for any nontrivial interface. A dark shell is not automatically a command center, a grid of numbers is not automatically a dashboard, and a canvas inside a browser is not automatically a studio. Classify the work from what the user must perceive, decide, and do.

## Contents

- [Context Card](#context-card)
- [Hybrid Products](#hybrid-products)
- [Creative Studio Or Editor](#creative-studio-or-editor)
- [Dashboard Or Analytics Surface](#dashboard-or-analytics-surface)
- [Command Center Or Operations Console](#command-center-or-operations-console)
- [Game UI Or Web HUD](#game-ui-or-web-hud)
- [Interactive Prototype, Lab, Or Simulator](#interactive-prototype-lab-or-simulator)
- [Transactional App, Admin, Or Workflow Tool](#transactional-app-admin-or-workflow-tool)
- [Landing, Commerce, Or Editorial Surface](#landing-commerce-or-editorial-surface)
- [Context Mismatch Gate](#context-mismatch-gate)

## Context Card

Complete this from source, screenshots, runtime behavior, product copy, and available fixtures before styling:

```text
archetype: one primary product context
user mode: observe | decide | act | create | monitor | respond | explore | choose
primary artifact: the object that deserves sovereignty
frequency: once | occasional | repeated | continuous
pressure: time, consequence, expertise, environment
input: pointer | keyboard | touch | controller | mixed
spatial model: document | workspace | viewport overlay | multi-panel shell | full-screen scene
state pressure: the failures, transitions, and content extremes that change the design
proof target: representative state + viewport + interaction + detail evidence
```

Do not classify by visual costume. Classify by the user's dominant loop and the cost of a missed signal or wrong action. If two plausible classifications would create incompatible products, ask one question. Otherwise select a primary archetype, name secondary regions, and proceed.

Finish with: `archetype + user mode + primary artifact + pressure + spatial model + proof target`.

## Hybrid Products

Decompose hybrids by region and moment instead of averaging their rules:

- A public page with an interactive product preview is `landing` around a bounded `product` artifact.
- A level editor is a `studio`, even though it creates a game. Its play-test viewport may temporarily enter a game context.
- A browser game with DOM menus and HUD is `game UI`; route renderer, shader, camera, and gameplay-system work to the specialist domain.
- An analytics panel inside a studio is a `dashboard region`; it must not steal sovereignty from the canvas or timeline.
- A command center can contain dashboards, but its alert lifecycle, freshness, ownership, and response path set the shell priority.

Write the boundary explicitly. Brand rules belong to persuasion zones; product rules belong to repeated controls; game rules belong to live play; operational rules belong to monitoring and response.

## Creative Studio Or Editor

The user creates or transforms an artifact over time. Examples: video, image, audio, animation, level, document, CAD, shader, workflow, or dataset editors.

Direction priorities:

- Make the canvas, timeline, document, scene, or selected object sovereign.
- Organize tools by user intent and affected object, not by component implementation.
- Keep selection, mode, zoom, time, save state, and scope continuously legible.
- Make edits immediate, reversible, and attributable. Undo/redo, autosave, conflicts, destructive actions, and export are product structure.
- Use compact inspectors and panels with deliberate scroll ownership. A panel is not permission to dump every parameter at once.
- Let the artifact generate identity: material, waveform, frames, handles, guides, layers, or direct manipulation can carry the signature move.

Reject:

- KPI cards above the work.
- A dashboard shell with a decorative canvas in the center.
- Hidden modes, ambiguous selection scope, tiny unlabeled glyph walls, and panels that scroll behind one another.
- Marketing-scale typography, cinematic entrance choreography, or chrome louder than the artifact.

Prove: blank/new, loaded, selected and multi-selected, unsaved/saving/saved, invalid or conflicting edit, undo/redo, long names, zoom/pan, collapsed panels, export success/failure, and the supported minimum workspace. Inspect real-size icons and dense rows at DPR 2.

## Dashboard Or Analytics Surface

The user scans evidence to understand a question or choose a next action. The dashboard is an answer surface, not a collection of available chart components.

Direction priorities:

- State the first decision and rank evidence by its effect on that decision.
- Make comparison, change, threshold, freshness, denominator, and uncertainty visible.
- Use overview for orientation, then stable drill-down or evidence detail.
- Keep filters, time range, cohort, units, and data source attached to what they alter.
- Let density serve comparison. Preserve aligned scales, tabular numerals, readable labels, and exact-value access.

Reject:

- Equal KPI-card soup, chart variety as decoration, miniature graphs with no readable scale, and color-only meaning.
- Operational alerts without owner or action.
- Treating zero, missing, stale, suppressed, and uncertain as the same blank state.
- Turning every metric into a card because the grid component already exists.

Prove: typical, zero, missing, stale, partial, uncertain, filtered, long-label, high-volume, and narrow states. Verify the first decision can be made without reading every panel.

## Command Center Or Operations Console

The user continuously monitors a system and must detect, triage, own, communicate, or recover from consequential change. This is not a dashboard with darker colors.

Direction priorities:

- Separate normal, degraded, incident, acknowledged, assigned, recovering, and resolved states.
- Expose freshness, source health, confidence, ownership, severity, scope, and next safe action.
- Keep the alert-to-evidence-to-action path stable under update pressure.
- Design for sustained gaze, shift handoff, keyboard speed, partial subsystem failure, and noisy event volume.
- Reserve high-salience color, motion, and sound for events that truly demand response.
- Support wallboard observation and operator action as different views when both exist.

Reject:

- Sci-fi glow, radar decoration, fake terminal chrome, pulsing everything, and red as ambient brand color.
- A mosaic of equally loud panels.
- Auto-sorting that moves the item under the operator, disappearing acknowledgements, and alerts with no owner or recovery path.
- Hiding stale feeds behind a clean aggregate status.

Prove: normal baseline, one active incident, alert flood, stale/offline source, partial failure, acknowledged/assigned states, recovery, handoff, drill-down, keyboard path, and supported large/narrow displays. Measure whether critical content remains stable while data updates.

## Game UI Or Web HUD

The interface supports play, not generic information work. Classify the moment: live play, pause, inventory, map, dialogue, loadout, matchmaking, tutorial, results, or settings. Classify presentation as diegetic, spatial, meta, or non-diegetic and name the input modality.

Direction priorities:

- Protect the gameplay focal area and target glance time. Persistent elements must earn their screen occupation.
- Tie hierarchy to urgency, depletion, threat, objective, team state, and player intent—not to card size.
- Keep text and indicators readable over representative bright, dark, noisy, and moving scenes.
- Respect safe areas, aspect ratios, controller focus, touch reach, input-glyph switching, localization, and stream/capture overlays.
- Let motion confirm gameplay state and timing. Avoid decorative HUD motion that competes with combat or traversal.
- Use menus, inventory, and settings as distinct interaction modes; live-play HUD rules do not justify hiding required menu structure.

Reject:

- Dashboard cards floating over gameplay, native web-app sidebars, uncontrolled blur, tiny admin typography, and scrollbars in live HUD.
- Decorative vector glyphs with no silhouette discipline or icon-family proof.
- Testing the HUD on a flat background, title screen, or one calm scene only.

Prove: calm and high-noise play, damage/critical state, objective update, input switch, pause/menu focus, long localization, common aspect ratios, safe-area pressure, reduced motion, and a representative gameplay capture. For engine, renderer, camera, or gameplay-system changes, use the specialist skill and keep this route on the web UI integration.

## Interactive Prototype, Lab, Or Simulator

The output or playable mechanism is the reason to visit. Examples: shader labs, generators, simulations, explainers, audio experiments, and technical prototypes.

Direction priorities:

- Put the real output in the first viewport.
- Tether controls to their visible effect and group presets by intent.
- Keep diagnostics available but subordinate until failure or explicit inspection.
- Preserve reset, reproducibility, export, share, unsupported-capability fallback, and performance limits.

Reject landing-page preambles, fake instrument complexity, parameter dumps, and logs louder than the experiment.

Prove nonblank output, meaningful parameter change, reset, invalid/extreme values, export failure, unsupported capability, mobile/narrow control access, offscreen behavior, and representative performance.

## Transactional App, Admin, Or Workflow Tool

The user enters, reviews, approves, configures, schedules, or moves records through a known process.

Prioritize accurate state, stable navigation, clear scope, forms, tables, bulk actions, permissions, pending/retry behavior, and recovery. Familiarity and density may beat novelty. Make the active record and next safe action obvious.

Reject brand typography in controls, modal-first architecture, bespoke standard inputs, duplicated status, and decorative empty states that delay the first task.

Prove empty, loading, error, permission, validation, double-submit, unsaved work, long content, large data, and narrow layouts. Preserve URL state when refresh, history, sharing, or support workflows depend on it.

## Landing, Commerce, Or Editorial Surface

The user is choosing, trusting, buying, understanding, or exploring rather than repeatedly operating a tool.

- Landing: connect offer, audience, proof, objection, and action; make the first viewport specific and prove the next decision.
- Commerce: keep media, variant, availability, price, delivery, returns, and commitment consequence mutually legible.
- Editorial/cultural: allow pacing and mystery when discovery is the value, while preserving orientation, access, and a direct route for concrete tasks.

Reject transplanting dashboard density into persuasion, inventing proof, forcing funnels onto cultural work, or using product chrome as brand identity.

Prove first viewport, decisive proof or product detail, commitment state, form/error path, mobile rhythm, media fallback, and relevant legal/analytics/SEO preservation.

## Context Mismatch Gate

Fail the direction when any is true:

- The primary artifact or action is visually subordinate to borrowed category chrome.
- The scrolling, density, motion, or navigation model belongs to another archetype.
- The state and proof plan tests generic breakpoints but misses the product's costly moments.
- A hybrid silently averages incompatible registers instead of assigning rules by region.
- The design could change archetype by replacing nouns and keeping the same composition.

When the mismatch repeats after one correction, return to the context card before changing colors, spacing, or effects.
