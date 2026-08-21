# Create And Broad Redesign

Use for greenfield interfaces and redesigns large enough to change hierarchy, composition, or the visual system. Do not turn a small fix into a vanity rewrite.

## Lock The Brief

Record only facts that change the design:

- Product archetype, audience, user mode, bounded hybrid regions.
- Primary artifact, task, frequency, pressure, input, spatial model.
- Repeated use or one-time persuasion.
- Static concept, interactive prototype, or production implementation.
- Existing code, system, assets, copy, data, references, runnable states.
- Accessibility, device, localization, performance, SEO/legal, framework constraints.

Ask one question only when the missing answer splits the work into incompatible products. Otherwise pick the strongest interpretation, state it, and move.

## Greenfield Order

1. Complete context card; name product intent, primary task, and costly states.
2. Decide what must be loud, quiet, hidden, and delayed.
3. Choose product, brand, or hybrid register.
4. Kill obvious category default and fashionable second default.
5. Select context-specific composition, direction, and one signature move.
6. Define information architecture before surface styling.
7. Define layout grid, alignment anchors, relationship-based spacing, density, palette/type/surface roles, component ecology, states, and motion grammar.
8. Build core path with realistic content.
9. Prove result at target viewports and states.

The first meaningful screen must answer what this is, what matters now, and what the user can do next.

## Broad Redesign Order

Audit before replacing:

1. Inspect framework, routes, tokens, primitives, styling method, assets, and current runtime.
2. Identify what existing interface accidentally prioritizes.
3. Find systemic causes: bad shell, duplicated state model, weak primitive, token drift, repeated card containment, or content architecture failure.
4. Preserve IA, route slugs, navigation labels, copy voice, analytics events, form names/order, legal/consent content, SEO metadata, and accessibility wins unless brief explicitly changes them.
5. Write kill list: what must disappear, merge, collapse, move, or lose prominence.
6. Recompose system, then migrate highest-value path.

Do not repaint a broken hierarchy. If the main artifact stays visually subordinate, you decorated the crime scene.

## Build Reality

- Use actual framework and existing dependencies where practical.
- Fix shared primitives, state models, tokens, and shells when repeated failures share cause.
- Intervene at lowest shared layer that removes every confirmed recurrence; do not rewrite shell, token set, or state model for one isolated defect.
- One-off overrides only for isolated exceptions.
- Prefer real product objects, screenshots, datasets, places, media, outputs, and domain language.
- Use verified assets or generated bitmap assets when imagery carries promise.
- State asset gap instead of faking proof with div art, decorative SVG dashboards, fake terminals, invented customers, or imaginary metrics.
- Keep product controls restrained even when surrounding brand surface is expressive.
- Make responsive behavior structural: collapse, reorder, change navigation, transform tables, or reprioritize. Do not merely stack every card.
- For dense or spatial work, persist geometry ledger from [geometry-and-rhythm.md](geometry-and-rhythm.md); for material motion, persist event map from [motion.md](motion.md).
- For onboarding, settings, search, permissions, or interruption-heavy flows, load [human-interface-craft.md](human-interface-craft.md). Keep interaction grammar familiar. Put signature in artifact, not in restyled standard controls.
- Run causality and cheap-generation gate in [authorship-and-specificity.md](authorship-and-specificity.md) before calling direction distinctive.

## State Contract

For product surfaces, design the states that can actually occur:

- Populated default.
- Empty or first-run.
- Initial loading and refresh/pending.
- Error with recovery.
- Permission denied or unavailable.
- Long text, long identifiers, large data, and overflow.
- Narrow viewport, touch, keyboard, and zoom where relevant.

For brand surfaces, design:

- First viewport with specific offer or artifact.
- Early proof or product mechanism.
- Objection/trust moment.
- Conversion decision point.
- Mobile first viewport.

Missing states are the product under pressure, not polish.

For a command center, also prove live update, freshness, ownership, alert priority, and recovery without geometry drift. For a studio, prove selection change, direct manipulation, undo/recovery, and inspector stability. For a HUD, prove the busiest play state, safe areas, glance legibility, input mode, and an aspect-ratio change.

## Artifact Loop

Keep a short backlog ordered by user damage:

```text
finding:
evidence:
damage:
cause:
fix:
proof:
status:
```

Each loop must change the artifact, inspect a meaningful state, or produce evidence that changes the next move. Planning and decorative screenshots do not count.

After each pass, judge `substantially better`, `mixed`, `flat`, or `worse`. Two consecutive valid comparisons that remain `flat` or `worse` and expose the same intact root cause force a direction reset. Missing content, incomplete implementation, or invalid captures require better evidence, not a theatrical redesign:

```text
failed because:
kill:
keep:
new direction:
new signature move:
proof target:
```

Stop when every in-scope blocker and major finding is fixed or explicitly scoped, the main path and a meaningful edge/recovery state are proven, and the final artifact visibly beats its baseline or competent default.

When the deliverable is a proposal or review rather than direct implementation, persist the manifest and standalone HTML dossier defined in [reporting.md](reporting.md). The report must contain the context, observed evidence, selected direction or exact redesign, preservation contract, proof targets, and visible limitations.
