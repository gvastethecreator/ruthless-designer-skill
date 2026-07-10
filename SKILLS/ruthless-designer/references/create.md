# Create And Broad Redesign

Use this route for greenfield interfaces and redesigns large enough to change hierarchy, composition, or the visual system. Do not use it to turn a small fix into a vanity rewrite.

## Lock The Brief

Record only facts that change the design:

- Product and audience.
- Surface and primary user task.
- Repeated use or one-time persuasion.
- Static concept, interactive prototype, or production implementation.
- Existing code, system, assets, copy, data, references, and runnable states.
- Accessibility, device, localization, performance, SEO/legal, and framework constraints.

Ask one question only when the missing answer splits the work into incompatible products. Otherwise choose the strongest interpretation, state it, and move.

## Greenfield Order

1. Name the product intent and primary task.
2. Decide what must be loud, quiet, hidden, and delayed.
3. Choose product, brand, or hybrid register.
4. Kill the obvious category default and the fashionable second default.
5. Select a product-specific direction and one signature move.
6. Define information architecture before surface styling.
7. Define layout grid, type roles, spacing rhythm, palette roles, surface model, component vocabulary, states, and motion grammar.
8. Build the core path with realistic content.
9. Prove the result at the target viewports and states.

The first meaningful screen must answer what this is, what matters now, and what the user can do. A layout that merely inventories features has not designed a decision.

## Broad Redesign Order

Audit before replacing:

1. Inspect framework, routes, tokens, primitives, styling method, assets, and current runtime.
2. Identify what the existing interface accidentally prioritizes.
3. Find systemic causes: bad shell, duplicated state model, weak primitive, token drift, repeated card containment, or content architecture failure.
4. Preserve IA, route slugs, navigation labels, copy voice, analytics events, form names/order, legal/consent content, SEO metadata, and accessibility wins unless the brief explicitly changes them.
5. Write a kill list: what must disappear, merge, collapse, move, or lose prominence.
6. Recompose the system, then migrate the highest-value path.

Do not repaint a broken hierarchy. If the main artifact remains visually subordinate after the redesign, you decorated the crime scene.

## Build Reality

- Use the actual framework and existing dependencies where practical.
- Fix shared primitives, state models, tokens, and shells when repeated failures share a cause.
- Intervene at the lowest shared layer that removes every confirmed recurrence; do not rewrite a shell, token set, or state model for one isolated defect.
- Use one-off overrides only for isolated exceptions.
- Prefer real product objects, screenshots, datasets, places, media, outputs, and domain language.
- Use verified assets or generated bitmap assets when imagery carries the promise.
- State an asset gap instead of faking proof with div art, decorative SVG dashboards, fake terminals, invented customers, or imaginary metrics.
- Keep product controls restrained even when the surrounding brand surface is expressive.
- Make responsive behavior structural: collapse, reorder, change navigation, transform tables, or reprioritize. Do not merely stack every card.

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

- First viewport with a specific offer or artifact.
- Early proof or product mechanism.
- Objection/trust moment.
- Conversion decision point.
- Mobile first viewport.

Do not call missing states polish. They are the product under pressure.

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

Each loop must change the artifact, inspect a meaningful state, or produce evidence that changes the next move. Planning, restating requirements, and collecting decorative screenshots do not count.

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
