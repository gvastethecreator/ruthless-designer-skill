# Product Surfaces

Use this route for apps, dashboards, editors, admin, tools, tables, settings, onboarding, and authenticated workflows. Make the task trustworthy and fast before making it expressive.

## Product Bar

- Give the current task, object, or decision the most visual weight.
- Keep navigation, diagnostics, help, history, and metadata subordinate until needed.
- Use familiar controls when familiarity lowers cognitive cost.
- Allow density when comparison or repeated work requires it.
- Calibrate color, expression, and motion to the task. Keep high-frequency and high-consequence controls quiet enough to read, but let creative, playful, or cultural products carry character through their artifact and interaction when semantics remain unambiguous.
- Use one component and state vocabulary across the surface.

If the main canvas is surrounded by louder status cards, filters, warnings, and chrome, the interface has promoted its anxiety above the user's work.

## Structure

Choose a structure that reflects work:

- Cockpit: current object in the center, mode/navigation at the edge, contextual inspector nearby, diagnostics collapsed or secondary.
- List/table plus evidence pane: dense scanning, stable selection, one clear next action.
- Workflow: stages show current work, count, owner, risk, and recovery—not decorative stepper dots.
- Workbench: preview or canvas owns the shell; controls group by the object they affect.
- Empty-state onboarding: teach the first meaningful action and clearly label sample content.

Keep filters, saved views, bulk actions, selection, and row actions stable during updates. Use progressive disclosure before reaching for a modal.

## Interface Contract

Use native semantics first:

- Use `button` for actions, links for navigation, `label` for controls, and tables for tabular relationships.
- Give icon-only controls an accessible name; hide decorative icons from assistive tech.
- Preserve visible `:focus-visible` states and logical keyboard order.
- Add live regions for important async status, validation, saves, and errors.
- Keep headings hierarchical and add a skip link when repeated chrome precedes main content.

Harden forms:

- Provide visible labels or reliable accessible names.
- Use meaningful `name`, `autocomplete`, `type`, and `inputmode`.
- Do not block paste.
- Keep submission available until the request starts; expose pending state after it starts.
- Render errors near fields, preserve input, and focus the first invalid field after submit.
- Make control plus label one target for checkboxes/radios.
- Warn before losing costly unsaved work.

Use links and URL state for tabs, filters, pagination, search, or expansion when users expect refresh, back/forward, sharing, or support links to preserve state. Keep truly ephemeral UI local.

Use `Intl.DateTimeFormat` and `Intl.NumberFormat`. Keep server/client rendering stable; do not hide hydration mistakes with blanket suppression.

## State And Content Pressure

Inspect every state that can happen:

- Initial loading and loading-more/refresh.
- Empty state with a next action.
- Error with cause, preserved work, and recovery.
- Permission denied or unavailable.
- Offline, timeout, stale data, and partial failure when relevant.
- Rapid repeat action and double-submit pressure.
- No items, one item, typical volume, and costly volume.
- Very short text, 100+ character text, long unbroken IDs/URLs/emails, emoji, translation expansion, CJK, and RTL when relevant.

Use `min-width: 0`, intentional wrapping, truncation with reachable full content, pagination, virtualization, or progressive loading when the data requires it. Do not blanket `overflow-x: hidden` over a broken child.

Keep partial failures local. One dead panel should not take the entire page down.

## Visual System

- Product typography: fixed scale, clear roles, functional labels, readable data. Keep display type out of forms, navigation, tables, and repeated controls.
- Body/prose: usually `65-75ch`; leave logs, code, and tables predictable.
- Dynamic comparison: use tabular numerals where changing digits would shift alignment.
- Palette: define roles before values. Neutrals plus a restrained accent often suit operational work, but they are not the product uniform; an expressive palette is valid when the artifact or audience earns it and semantic states retain exclusive, legible meaning. Define hover, focus, active, disabled, selected, loading, error, warning, success, and info states.
- Radius: maintain a small role-based scale. Pills are pills; structural panels do not need `32px` vanity corners.
- Edges: use borders for inputs, grids, dividers, and focus; use restrained elevation for genuinely raised surfaces. Avoid hairline border plus giant soft shadow.
- Media: reserve dimensions, use meaningful alt text, and give screenshots/images a neutral edge when they bleed into the shell.
- Targets: meet the project's accessibility standard; keep dense controls reachable without overlapping hit areas.

Use translucent/blurred material only for functional floating chrome over content that remains spatially present. Keep text readable and provide a solid or higher-contrast fallback when user/platform settings require it. Ordinary cards wearing glass are not premium; they are indecisive.

## Product Slop To Kill

- Cards inside cards used only to create hierarchy.
- A badge for every thought.
- Repeated status logic rendered in multiple panels.
- Decorative terminal or log styling that overpowers the task.
- Full-saturation accents on inactive states.
- Three competing primary buttons.
- Hover-only affordances on touch-relevant actions.
- Generic placeholder users, companies, metrics, and rows.
- Animated travel on keyboard shortcuts, command palettes, and high-frequency navigation.
- Brand typography or cinematic effects leaking into repeated controls.

Fix the shared primitive, state model, token, or shell when the crime repeats. Do not hand out twenty tiny overrides to the same broken system.

## Pass Gate

Pass only when:

- The first task and next action are obvious.
- Keyboard/focus, labels, and error recovery work.
- Relevant async, permission, content, and data-volume states survive.
- Narrow layout changes structure instead of becoming stacked-card rubble.
- The main artifact dominates diagnostics and chrome.
- The implementation was inspected with realistic content and at least one stressed state.
