# Product Contexts

Before choosing a direction for any nontrivial interface. Dark shell ≠ command center; number grid ≠ dashboard; browser canvas ≠ studio. Classify from what the user must perceive, decide, do.

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

From source, screenshots, runtime, product copy, fixtures before styling:

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

Classify by dominant loop and cost of missed signal or wrong action — not visual costume. If two classifications create incompatible products, ask one question. Else pick a primary archetype, name secondary regions, proceed.

Finish: `archetype + user mode + primary artifact + pressure + spatial model + proof target`.

## Hybrid Products

Decompose by region and moment; don't average rules:

- Public page with interactive preview: `landing` around a bounded `product` artifact.
- Level editor is a `studio` even if it creates a game; play-test viewport may enter game context.
- Browser game with DOM menus and HUD: `game UI`; route renderer, shader, camera, gameplay-system work to the specialist domain.
- Analytics panel inside a studio: `dashboard region`; must not steal sovereignty from canvas or timeline.
- Command center can contain dashboards; alert lifecycle, freshness, ownership, response path set shell priority.

Write the boundary. Brand rules → persuasion zones; product rules → repeated controls; game rules → live play; operational rules → monitoring and response.

## Creative Studio Or Editor

Video, image, audio, animation, level, document, CAD, shader, workflow, dataset editors.

Direction priorities:

- Canvas, timeline, document, scene, or selected object is sovereign.
- Tools by user intent and affected object, not component implementation.
- Selection, mode, zoom, time, save state, scope continuously legible.
- Edits immediate, reversible, attributable. Undo/redo, autosave, conflicts, destructive actions, export are product structure.
- Compact inspectors; deliberate scroll ownership. A panel is not permission to dump every parameter.
- Artifact generates identity: material, waveform, frames, handles, guides, layers, or direct manipulation can carry the signature move.

Reject:

- KPI cards above the work.
- Dashboard shell with decorative canvas in the center.
- Hidden modes, ambiguous selection scope, unlabeled glyph walls, panels scrolling behind one another.
- Marketing-scale type, cinematic entrance, chrome louder than the artifact.

Prove: blank/new, loaded, selected and multi-selected, unsaved/saving/saved, invalid or conflicting edit, undo/redo, long names, zoom/pan, collapsed panels, export success/failure, supported minimum workspace. Inspect real-size icons and dense rows at DPR 2.

## Dashboard Or Analytics Surface

Answer surface, not a chart-component inventory: scan evidence to understand a question or choose a next action.

Direction priorities:

- State the first decision; rank evidence by effect on it.
- Comparison, change, threshold, freshness, denominator, uncertainty visible.
- Overview for orientation, then stable drill-down or evidence detail.
- Filters, time range, cohort, units, data source attached to what they alter.
- Density serves comparison. Preserve aligned scales, tabular numerals, readable labels, exact-value access.

Reject:

- Equal KPI-card soup, decorative chart variety, miniature graphs with no readable scale, color-only meaning.
- Operational alerts without owner or action.
- Treating zero, missing, stale, suppressed, and uncertain as the same blank state.
- Every metric as a card because the grid component exists.

Prove: typical, zero, missing, stale, partial, uncertain, filtered, long-label, high-volume, narrow. First decision must be possible without reading every panel.

## Command Center Or Operations Console

Detect, triage, own, communicate, or recover from consequential change. Not a dashboard with darker colors.

Direction priorities:

- Separate normal, degraded, incident, acknowledged, assigned, recovering, resolved.
- Freshness, source health, confidence, ownership, severity, scope, next safe action.
- Alert-to-evidence-to-action path stable under update pressure.
- Sustained gaze, shift handoff, keyboard speed, partial subsystem failure, noisy event volume.
- High-salience color, motion, sound only for events that demand response.
- Wallboard observation and operator action as different views when both exist.

Reject:

- Sci-fi glow, radar decoration, fake terminal chrome, pulsing everything, red as ambient brand color.
- Mosaic of equally loud panels.
- Auto-sorting that moves the item under the operator, disappearing acknowledgements, alerts with no owner or recovery path.
- Hiding stale feeds behind a clean aggregate status.

Prove: normal baseline, one active incident, alert flood, stale/offline source, partial failure, acknowledged/assigned, recovery, handoff, drill-down, keyboard path, large/narrow displays. Check critical content stays stable while data updates.

## Game UI Or Web HUD

Not generic information work. Classify the moment: live play, pause, inventory, map, dialogue, loadout, matchmaking, tutorial, results, or settings. Classify presentation as diegetic, spatial, meta, or non-diegetic; name the input modality.

Direction priorities:

- Protect gameplay focal area and target glance time. Persistent elements must earn screen occupation.
- Hierarchy from urgency, depletion, threat, objective, team state, player intent — not card size.
- Text and indicators readable over bright, dark, noisy, moving scenes.
- Safe areas, aspect ratios, controller focus, touch reach, input-glyph switching, localization, stream/capture overlays.
- Motion confirms gameplay state and timing. No decorative HUD motion competing with combat or traversal.
- Menus, inventory, settings as distinct modes; live-play HUD rules do not hide required menu structure.

Reject:

- Dashboard cards over gameplay, native web-app sidebars, uncontrolled blur, tiny admin type, scrollbars in live HUD.
- Decorative vector glyphs with no silhouette discipline or icon-family proof.
- HUD tested only on a flat background, title screen, or one calm scene.

Prove: calm and high-noise play, damage/critical, objective update, input switch, pause/menu focus, long localization, common aspect ratios, safe-area pressure, reduced motion, representative gameplay capture. Engine, renderer, camera, or gameplay-system changes: specialist skill; this route stays on web UI integration.

## Interactive Prototype, Lab, Or Simulator

Shader labs, generators, simulations, explainers, audio experiments, technical prototypes.

Direction priorities:

- Real output in the first viewport.
- Tether controls to visible effect; group presets by intent.
- Diagnostics available but subordinate until failure or explicit inspection.
- Reset, reproducibility, export, share, unsupported-capability fallback, performance limits.

Reject landing-page preambles, fake instrument complexity, parameter dumps, logs louder than the experiment.

Prove nonblank output, meaningful parameter change, reset, invalid/extreme values, export failure, unsupported capability, mobile/narrow control access, offscreen behavior, representative performance.

## Transactional App, Admin, Or Workflow Tool

Records through a known process. Prioritize accurate state, stable navigation, clear scope, forms, tables, bulk actions, permissions, pending/retry, recovery. Familiarity and density may beat novelty. Active record and next safe action must be obvious.

Reject brand type in controls, modal-first architecture, bespoke standard inputs, duplicated status, decorative empty states that delay the first task.

Prove empty, loading, error, permission, validation, double-submit, unsaved work, long content, large data, narrow layouts. Preserve URL state when refresh, history, sharing, or support workflows depend on it.

## Landing, Commerce, Or Editorial Surface

Not operating a tool repeatedly.

- Landing: connect offer, audience, proof, objection, action; first viewport specific; prove the next decision.
- Commerce: media, variant, availability, price, delivery, returns, commitment consequence mutually legible.
- Editorial/cultural: pacing and mystery when discovery is the value; still preserve orientation, access, and a direct route for concrete tasks.

Reject dashboard density in persuasion, invented proof, funnels on cultural work, product chrome as brand identity.

Prove first viewport, decisive proof or product detail, commitment state, form/error path, mobile rhythm, media fallback, relevant legal/analytics/SEO preservation.

## Context Mismatch Gate

Fail the direction when any is true:

- Primary artifact or action visually subordinate to borrowed category chrome.
- Scrolling, density, motion, or navigation model belongs to another archetype.
- State and proof plan tests generic breakpoints but misses the product's costly moments.
- Hybrid silently averages incompatible registers instead of assigning rules by region.
- Design could change archetype by replacing nouns and keeping the same composition.

If mismatch repeats after one correction, return to the context card before changing colors, spacing, or effects.
