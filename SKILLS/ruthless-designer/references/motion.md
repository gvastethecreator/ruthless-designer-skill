# Motion As Product Behavior

Motion that materially affects feedback, state, continuity, navigation, direct manipulation, live data, storytelling, canvas/WebGL, a HUD, or immersive surface. Causes and consequences, not bag of entrance effects.

## Classify The Event

- **feedback**: acknowledges input, success, failure, or progress;
- **state**: exposes a mode, selection, validation, loading, or availability change;
- **spatial**: preserves location, identity, origin, destination, or containment;
- **attention**: directs the eye to a rare consequential change;
- **ambient**: ongoing life, material, or atmosphere without demanding action.

If class is unclear, remove animation until its job is clear; do not use ambient motion to fake product activity or attention motion on every live metric, notification, badge, and button.

## Write The Motion Map

Nontrivial work: record motion-plan.json before implementation:

~~~text
event:
trigger:
class + purpose:
frequency:
origin -> destination:
affected elements:
duration family:
easing family:
sequence or overlap:
interrupt / reverse / retarget:
reduced-motion alternative:
performance risk:
proof:
~~~

Several elements can share one causal event; record as a sequence, not independent decoration.

Example: scene-cover closes from selected room, reaches a fully covered milestone, commits state change, then reveals destination. Cover pieces share one cause and can stagger, pivot, slide, or scale from authored origins; state must change at the observable covered milestone, not after a guessed timeout.

## Give The Product A Motion Grammar

- duration palette, survives repeated use: instant feedback, small disclosure, ordinary state change, rare large travel; easing family: enter, exit, move between visible positions, constant loops;
- one default entrance relationship, not one entrance preset copied onto every component; displacement and overshoot budgets;
- attention budget: which events can pulse, shake, flash, or cover the scene; rules for overlap, stagger, reduced mode.

Start from project tokens when they exist; otherwise these calibration ranges; tune in the shipped interaction. Duration follows perceived distance, visual mass, consequence, frequency:

- press feedback: about 100–160ms; tooltip or small popover: about 125–200ms; dropdown or select: about 150–250ms;
- most repeated UI state changes: under 300ms; large spatial surfaces: about 200–500ms only when distance and frequency earn it.

Large cover can need more time than a checkbox; a command used hundreds of times must not replay brand moment.

- enter or settle: decelerate into destination; exit: accelerate away; usually finish faster or quieter;
- movement between visible positions: smooth acceleration and deceleration; constant rotation, progress, or conveyor: linear when constant speed is truthful.

Avoid ease-in on UI entry — it delays visible response — and huge spring overshoot as a default. Character belongs to the grammar, not every keyframe.

## Choreograph Cause, Not Layers

Animate parts needed to explain the event — no fixed layer count.

- one first beat; dependencies in causal order; shared origins and directions;
- overlap enough to avoid queue of unrelated waits; bounded stagger;
- secondary parts: less amplitude or emphasis; stable state before user must act.

Nested motion creates authored physicality when parts share a mechanism:

- panel travels; handle settles around hinge. Figure moves; eyes, ears, tail, or tool respond at smaller amplitude.
- Cover closes through segments that meet at shared seam. Node moves; connection line and selected evidence preserve identity.

Not permission to squash, bounce, rotate, or blur ordinary settings controls. Use deformation, arcs, counter-motion where material, character, mechanism, or playable feedback earns them.

## Preserve Spatial Continuity

- Believable origin: popover from trigger side; drawer from its edge; selected object from prior position. Logical identity only when same object continues. Duplicate shared-layout IDs make unrelated objects teleport.
- FLIP, shared-layout, or view-transition when geometry changes but identity remains. Start/end values must be interpolable; easing cannot hide discrete jumps between incompatible values.
- Destination stable while live content or fonts load. Cover transition only to mask real scene, mode, or world change; decorative full-screen wipe on every route is a tax.
- State commits: transition events, framework callbacks, or observable milestones. Keep cancellation path.

Content must stay visible and usable when JavaScript fails. Do not ship primary content at opacity zero or offscreen hoping a script restores it.

## Interruption, Repetition, And Input

Survive hostile timing:

- pointer-down feedback starts immediately; open/close/open retargets from current rendered value;
- second click cannot queue duplicate sequences; escape, route change, unmount, reduced mode, backgrounding can cancel safely;
- focus and keyboard paths receive equivalent feedback; hover exit does not force long entrance replay while scanning neighboring controls;
- hundredth viewing remains tolerable.

Transitions for interactive states that can reverse; keyframes or a timeline for genuine one-shot sequence. Do not restart a component by changing its key unless remounting is explicit state contract — discards focus, local state, continuity.

Gate hover motion with hover: hover and pointer: fine. On touch, press feedback and direct manipulation rather than simulated hover.

## Direct Manipulation

For drag, swipe, scrub, pan, resize, rotate, timeline, map, canvas, or HUD gestures:

- preserve grab offset; track one-to-one during direct movement; establish drag intent, then capture pointer;
- keep movement active outside original hit target; preserve or estimate velocity on release;
- dismiss or snap from distance plus velocity when appropriate; damping past natural boundaries;
- retarget from current rendered value during reversal; keyboard and accessible alternatives for consequential manipulation.

Test slow drag, fast flick, mid-motion reversal, release outside bounds, multi-input cancellation, and representative touch hardware when possible.

Gesture that loses the pointer or changes speed at release is broken input continuity, not “almost fluid”.

## State Recipes

Not visual presets.

### Press and activation

Immediate color, surface, tiny displacement, or scale if still legible. Box geometry stable. Async: separate pending/success/error.

### Tooltip and repeated disclosure

Delay accidental hover, then reduce delay while traversing related triggers. Keyboard focus immediate; exit subtle; content dismissible and reachable.

### Menu, popover, drawer, modal

Origin matches trigger or edge. Focus enters and returns correctly. Backdrop, panel, content: one sequence. Rapid reversal does not blink, teleport, or leave invisible blocker.

### Live data update

Preserve row and column geometry. Highlight changed values briefly only when user must notice. Do not animate every refresh. Freshness and source visible without perpetual pulsing.

### Success, warning, and failure

Silent success often enough in repeated flows; expressive success for rare meaningful completion. Warnings and failures need persistent semantic state and recovery; motion can attract attention once, never the only signal.

### Scene, room, or mode transition

Cover, door, curtain, frame, camera move, or shared object only when belonging to the spatial model. Define close, covered, commit, reveal, cleanup. Each phase interruptible or explicitly input-locked with visible reason. Check destination under reduced motion.

## Complex Surfaces

### Command centers

- Operational spine stable while values update. Attention motion on newly actionable incidents, not ambient telemetry.
- Separate wallboard distance from operator interaction. Preserve ownership, freshness, severity, evidence, recovery during transitions.
- Avoid alarm theater: constant glow, pulse, shake, ticker motion destroy priority.

### Editors and studios

- Direct manipulation owns the motion language. Tether inspectors and controls to object or region they affect.
- Preserve canvas position, selection, undo/redo, local state across mode changes. Avoid page-level entrances every time inspector changes.

### HUDs and playable interfaces

- Survive busiest play state, camera movement, effects, input latency. World-space motion for world relationships; screen-space for stable status or action feedback.
- Protect reticle, predicted travel, glance regions. Status updates readable in peripheral vision without stacking pulses.
- Static or reduced alternatives preserve mechanic clarity.

### Brand and editorial surfaces

- One authored sequence, not a reveal on every section. Artifacts, type, media carry the argument before parallax.
- Scroll-linked motion: static reading order, bounded work, small-screen fallback. First viewport cannot depend on long animation before explaining offer.

## Performance

- Animate exact properties; never use transition: all when changing set is known. Prefer transform and opacity. Filter, clip-path, masks, or layout properties only when visible mechanism earns the cost and runtime evidence supports it.
- Avoid driving large subtrees through inherited CSS variables during direct manipulation. will-change only for observed or credible first-frame stutter; name exact properties; remove temporary hints.
- Cap simultaneous animated elements, expensive layers, blur area, shadow area, device pixel ratio, particles, physics bodies, canvas objects. Pause hidden and offscreen loops, marquees, video, canvas, WebGL, particles, physics.
- Dispose animation frames, timers, observers, listeners, worklets, renderers, worlds, geometries, materials, textures on unmount or route change. Profile production builds on representative lower-end target when motion is continuous, gesture-heavy, canvas/WebGL, or visibly suspect.

Dev-mode stutter and flagship-laptop smoothness are unreliable witnesses.

## Reduced Motion And Transparency

Reduced motion preserves state clarity while removing spatial travel, parallax, repeated loops, large scale, and spring-heavy effects — not merely a slower sequence.

- feedback: instant color, outline, icon, or text change; spatial transition: crossfade or immediate state with maintained focus;
- live update: persistent semantic highlight without movement; scene transition: brief cover/fade or direct cut;
- ambient loop: static composition; gesture: direct movement during input, minimal or no inertial flourish after release.

Solid or higher-contrast material when reduced transparency or contrast needs it. Keep focus, text, controls, status above animated layers.

## Motion Proof

Inspect source and runtime; slowed capture or browser animation tooling when origin, overlap, or settle is hard to judge.

Required proof:

- default trigger and completion; rapid open/close/open or repeated activation; interruption and cancellation;
- reduced motion; keyboard and touch/hover gating when applicable; hidden/offscreen behavior;
- complex surface's costly moment; production frame/long-task evidence when cost is plausible; cleanup after route change or unmount.

Record:

~~~text
Before: exact rendered behavior or source.
Damage: frequency, delay, disorientation, jank, or accessibility cost.
After: concrete replacement or deletion.
Proof: route + viewport + state + slowed capture, runtime metric, source, or blocker.
~~~

Block approval for: unjustified high-frequency travel; primary content hidden behind animation startup; scale-zero or delayed entries that visibly teleport; missing reduced behavior on significant movement; broken gesture capture; queued transitions; offscreen loops; timer-synchronized state that drifts from the rendered transition; easy compositor fixes left undone.

Syntax is a lead; rendered behavior commits the crime.
