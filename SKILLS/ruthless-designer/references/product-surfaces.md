# Product Surfaces

Apps, dashboards, editors, admin, tools, tables, settings, onboarding, authenticated workflows. Task trustworthy and fast before expressive.

## Product Bar

- Current task, object, or decision gets the most visual weight.
- Navigation, diagnostics, help, history, metadata stay subordinate until needed.
- Familiar controls when familiarity lowers cognitive cost.
- Density when comparison or repeated work requires it.
- Calibrate color, expression, motion to the task. Quiet high-frequency and high-consequence controls; creative, playful, or cultural products may carry character through artifact and interaction when semantics stay unambiguous.
- One component and state vocabulary across the surface.

If louder status cards, filters, warnings, and chrome surround the main canvas, anxiety has been promoted above the user's work.

## Structure

- Cockpit: current object center; mode/navigation at the edge; contextual inspector nearby; diagnostics collapsed or secondary.
- List/table plus evidence pane: dense scanning, stable selection, one clear next action.
- Workflow: stages show current work, count, owner, risk, recovery — not decorative stepper dots.
- Workbench: preview or canvas owns the shell; controls group by the object they affect.
- Empty-state onboarding: teach the first meaningful action, flow skippable, sample content clearly labeled.

Filters, saved views, bulk actions, selection, row actions stay stable during updates. Progressive disclosure before a modal. Modality ladder, undo, permissions, onboarding, search, large-text contract: [human-interface-craft.md](human-interface-craft.md).

## Interface Contract

- `button` for actions, links for navigation, `label` for controls, tables for tabular relationships.
- Icon-only controls get an accessible name; hide decorative icons from assistive tech.
- Visible `:focus-visible` and logical keyboard order.
- Live regions for important async status, validation, saves, errors.
- Hierarchical headings; skip link when repeated chrome precedes main content.

- Visible labels or reliable accessible names.
- Meaningful `name`, `autocomplete`, `type`, `inputmode`.
- Do not block paste.
- Submission available until the request starts; pending state after it starts.
- Errors near fields, preserve input, focus first invalid field after submit.
- Control plus label one target for checkboxes/radios.
- Warn before losing costly unsaved work.

URL state for tabs, filters, pagination, search, or expansion when refresh, back/forward, sharing, or support must preserve state. Ephemeral UI stays local.

Use `Intl.DateTimeFormat` and `Intl.NumberFormat`. Server/client rendering stable; do not hide hydration mistakes with blanket suppression.

## State And Content Pressure

- Initial loading and loading-more/refresh.
- Empty state with a next action.
- Error with cause, preserved work, recovery.
- Permission denied or unavailable.
- Offline, timeout, stale data, partial failure when relevant.
- Rapid repeat action and double-submit pressure.
- No items, one item, typical volume, costly volume.
- Very short text, 100+ character text, long unbroken IDs/URLs/emails, emoji, translation expansion, CJK, RTL when relevant.

`min-width: 0`, intentional wrapping, truncation with reachable full content, pagination, virtualization, or progressive loading when data requires it. Do not blanket `overflow-x: hidden` over a broken child.

Partial failures stay local. One dead panel must not take the page down.

## Visual System

- Type: fixed scale, clear roles, functional labels, readable data. Display type out of forms, nav, tables, repeated controls. Body usually `65-75ch`; logs, code, tables stay predictable. Tabular numerals where changing digits would shift alignment.
- Palette: roles before values. Neutrals plus restrained accent often suit operational work; expressive palette valid when artifact or audience earns it and semantic states keep exclusive, legible meaning. Define hover, focus, active, disabled, selected, loading, error, warning, success, info.
- Radius: small role-based scale. Pills are pills; structural panels do not need `32px` vanity corners.
- Edges: borders for inputs, grids, dividers, focus; restrained elevation for genuinely raised surfaces. Avoid hairline + giant soft shadow.
- Media: reserve dimensions, meaningful alt, neutral edge on screenshots/images that bleed into the shell.
- Targets: meet the project's accessibility standard; dense controls reachable without overlapping hit areas.

Translucent/blurred material only for functional floating chrome over content that stays spatially present. Text readable; solid or higher-contrast fallback when user/platform settings require it. Ordinary glass cards are not premium; they are indecisive.

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

Fix the shared primitive, state model, token, or shell when the crime repeats — not twenty tiny overrides.

## Pass Gate

- First task and next action are obvious.
- Keyboard/focus, labels, error recovery work.
- Relevant async, permission, content, data-volume states survive.
- Narrow layout changes structure instead of becoming stacked-card rubble.
- Main artifact dominates diagnostics and chrome.
- Implementation inspected with realistic content and at least one stressed state.
