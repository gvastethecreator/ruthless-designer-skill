# Motion And Immersive Behavior

Use this route only when motion materially affects the design: transitions, gestures, shared layout, scroll storytelling, canvas/WebGL, or animation review.

## Give Motion A Job

Name one purpose before implementation:

- Preserve spatial continuity.
- Indicate state.
- Explain a relationship.
- Acknowledge input or completion.
- Soften an otherwise broken-looking change.

Delete motion whose only defense is "it looks cool" in repeated product UI. Reserve expressive choreography for rare brand, onboarding, feedback, or playable moments.

Gate by frequency:

- Keyboard shortcuts, command palettes, repeated navigation, and actions used constantly: instant or nearly instant; no travel.
- Hover and repeated controls: color, opacity, or tiny movement only when feedback needs it.
- Menus, popovers, drawers, modals, toasts, and occasional panels: bounded spatial motion is valid.
- Rare success, onboarding, editorial, or brand moments: allow delight without blocking interaction.

## Timing And Easing

Use project tokens when they exist. Otherwise start here and tune against the rendered interaction:

- Press feedback: `100-160ms`.
- Tooltip/small popover: `125-200ms`.
- Dropdown/select: `150-250ms`.
- Most UI state changes: under `300ms`.
- Large spatial surfaces: `200-500ms` only when distance earns it.

Use strong ease-out for enter/open/close, strong ease-in-out for movement between visible positions, subtle project easing for color/hover, and linear only for constant loops. Avoid `ease-in` on UI entry: it makes the interface respond late.

Make exits quieter and usually faster than enters.

## Physicality And Interruption

- Start feedback on pointer-down or `:active`, not after async work finishes.
- Use transitions for interactions that can reverse; use keyframes for genuine one-shot sequences.
- Animate from a believable origin. Popovers and tooltips open from the trigger side; drawers come from their edge; centered modals may scale from center.
- Avoid `scale(0)`. Start around `0.9-0.97` plus opacity when scale is justified.
- Preserve object identity with shared element/layout transitions only when the same logical object moves between states.
- Keep shared IDs unique and avoid adding a motion dependency when CSS or an existing primitive already solves the job.
- Gate hover-only motion with `(hover: hover) and (pointer: fine)`.
- Keep content visible without JavaScript; enhancement may reveal, but failure must not erase the page.

## Gestures

Make direct manipulation feel direct:

- Respond on pointer-down.
- Preserve the grab offset; never teleport the object under the pointer.
- Track 1:1 during drag.
- Capture the pointer after drag intent so movement continues outside bounds.
- Preserve or estimate velocity on release.
- Decide dismiss/snap from distance plus velocity when appropriate.
- Use damping/rubber-banding past natural boundaries.
- Retarget from the current on-screen value during reversal.
- Test slow drag, fast flick, mid-motion reversal, release outside bounds, and touch hardware when possible.

A swipe that loses the pointer or changes speed at release is not fluid. It is a bug with choreography.

## Performance

- Animate exact properties; never reach for `transition: all` when the changing set is known.
- Prefer `transform` and `opacity`; use small `filter`, `clip-path`, or masks only after inspection.
- Keep layout-property animation low-frequency and deliberate when resizing is the visible object.
- Update the moving element directly during drag; avoid driving a large subtree through inherited CSS variables.
- Add `will-change` only for exact compositor-friendly properties after observed or credible first-frame stutter. Remove temporary hints after the interaction.
- Pause offscreen and hidden animations, marquees, canvas, WebGL, particles, and physics.
- Dispose requestAnimationFrame loops, observers, listeners, renderers, worlds, geometries, materials, textures, and timers on unmount/route change.
- Cap device pixel ratio, particle count, object count, shadow quality, and texture resolution.

Blur and translucent material need a structural job. Avoid large blur in repeated content and provide a solid or higher-contrast fallback when the material carries text or navigation.

## Accessibility

Provide `prefers-reduced-motion` behavior that preserves state clarity without travel, blur, or scale-heavy effects. Do not merely slow everything down.

Provide static/mobile fallbacks for immersive effects. Keep focus, text, and CTAs readable above animated layers. Do not turn a hero into a GPU benchmark users must survive before learning the offer.

## Review

Inspect source and runtime. Slow uncertain motion `2x-5x` or use browser animation tooling. Test rapid open/close/open, repeated triggers, reduced motion, hover gating, origin, timing, frame pressure, console errors, and offscreen behavior.

Use findings that name:

```text
Before: exact behavior or source.
Damage: frequency, delay, disorientation, jank, or accessibility cost.
After: concrete replacement or deletion.
Proof: slowed capture, browser state, runtime metrics, or explicit blocker.
```

Block approval for unjustified high-frequency travel, `scale(0)` or `ease-in` openings that visibly teleport or delay response, missing reduced-motion on significant movement, broken gesture capture/continuity, or easy compositor fixes left undone. The syntax is a lead; the rendered behavior commits the crime.
