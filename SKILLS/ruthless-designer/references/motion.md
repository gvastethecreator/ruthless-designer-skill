# Motion As Product Behavior

Use this route when motion materially affects feedback, state, continuity, navigation, direct manipulation, live data, storytelling, canvas/WebGL, a HUD, or an immersive surface. Motion is a system of causes and consequences, not a bag of entrance effects.

## Classify The Event

Every animation must belong to one primary class:

- **feedback**: acknowledges input, success, failure, or progress;
- **state**: exposes a mode, selection, validation, loading, or availability change;
- **spatial**: preserves location, identity, origin, destination, or containment;
- **attention**: directs the eye to a rare consequential change;
- **ambient**: communicates ongoing life, material, or atmosphere without demanding action.

If the class is unclear, remove the animation until its job is clear. Do not use ambient motion to fake product activity. Do not use attention motion on every live metric, notification, badge, and button.

## Write The Motion Map

For nontrivial work, record motion-plan.json before implementation:

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

Several elements may share one causal event. Record them as a sequence, not independent decoration.

Example: a scene-cover transition may close from the selected room, reach a fully covered milestone, commit the state change, then reveal the destination. The cover pieces share one cause and may stagger, pivot, slide, or scale from authored origins. State must change at the observable covered milestone, not after a guessed timeout.

## Give The Product A Motion Grammar

Create a small grammar that survives repeated use:

- a bounded duration palette for instant feedback, small disclosure, ordinary state change, and rare large travel;
- a coherent easing family for entering, exiting, moving between visible positions, and constant loops;
- one default entrance relationship, not one entrance preset copied to every component;
- displacement and overshoot budgets;
- an attention budget: which events may pulse, shake, flash, or cover the scene;
- rules for overlap, stagger, and reduced mode.

Start from project tokens when they exist. Otherwise use these as calibration ranges, then tune in the shipped interaction:

- press feedback: roughly 100–160ms;
- tooltip or small popover: roughly 125–200ms;
- dropdown or select: roughly 150–250ms;
- most repeated UI state changes: under 300ms;
- large spatial surfaces: roughly 200–500ms only when the distance and frequency earn it.

Duration follows perceived distance, visual mass, consequence, and frequency. A large cover may need more time than a checkbox. A command used hundreds of times should not replay a brand moment.

Use directional easing:

- enter or settle: decelerate into the destination;
- exit: accelerate away and usually finish faster or quieter;
- movement between visible positions: smooth acceleration and deceleration;
- constant rotation, progress, or conveyor motion: linear when constant speed is truthful.

Avoid ease-in on UI entry because it delays visible response. Avoid huge spring overshoot as a default. Character belongs to the grammar, not every keyframe.

## Choreograph Cause, Not Layers

Do not require a fixed number of animated layers. Animate the parts needed to explain the event.

Strong choreography:

- establishes one first beat;
- reveals dependencies in causal order;
- shares origins and directions;
- overlaps enough to avoid a queue of unrelated waits;
- keeps stagger bounded;
- gives secondary parts less amplitude or emphasis;
- resolves into a stable state before the user must act.

Nested motion can create authored physicality when parts share a mechanism:

- a panel travels while its handle settles around its hinge;
- a figure moves while eyes, ears, tail, or tool respond at smaller amplitude;
- a cover closes through segments that meet at a shared seam;
- a node moves while its connection line and selected evidence preserve identity.

This is not permission to squash, bounce, rotate, and blur ordinary settings controls. Use deformation, arcs, and counter-motion where the material, character, mechanism, or playable feedback earns them.

## Preserve Spatial Continuity

- Animate from a believable origin. A popover opens from its trigger side; a drawer comes from its edge; a selected object moves from its prior position.
- Preserve logical identity only when the same object actually continues. Duplicate shared-layout IDs make unrelated objects teleport.
- Use FLIP, shared-layout, or view-transition techniques when geometry changes but identity remains.
- Resolve start and end values to interpolable representations. An easing curve cannot hide a discrete jump between incompatible values.
- Keep the destination stable while live content or fonts load.
- Use a cover transition only when it masks a real scene, mode, or world change. A decorative full-screen wipe on every route is a tax.
- Tie state commits to transition events, framework callbacks, or observable milestones. Keep a cancellation path.

Content must remain visible and usable when JavaScript fails. Do not ship primary content at opacity zero or offscreen and hope an entrance script restores it.

## Interruption, Repetition, And Input

Repeated product motion must survive hostile timing:

- pointer-down feedback starts immediately;
- open/close/open retargets from the current rendered value;
- a second click cannot queue duplicate sequences;
- escape, route change, unmount, reduced mode, and backgrounding can cancel safely;
- focus and keyboard paths receive equivalent feedback;
- a hover exit does not force users to replay a long entrance while scanning neighboring controls;
- the hundredth viewing remains tolerable.

Use transitions for interactive states that may reverse. Use keyframes or a timeline for a genuine one-shot sequence. Do not restart a component by changing its key unless remounting is the explicit state contract; it discards focus, local state, and continuity.

Gate hover motion with hover: hover and pointer: fine. On touch, use press feedback and direct manipulation rather than simulated hover.

## Direct Manipulation

For drag, swipe, scrub, pan, resize, rotate, timeline, map, canvas, or HUD gestures:

- preserve the grab offset;
- track one-to-one during direct movement;
- establish drag intent, then capture the pointer;
- keep movement active outside the original hit target;
- preserve or estimate velocity on release;
- decide dismiss or snap from distance plus velocity when appropriate;
- use damping past natural boundaries;
- retarget from the current rendered value during reversal;
- keep keyboard and accessible alternatives for consequential manipulation.

Test slow drag, fast flick, mid-motion reversal, release outside bounds, multi-input cancellation, and representative touch hardware when possible.

A gesture that loses the pointer or changes speed at release is not “almost fluid.” It is broken input continuity.

## State Recipes

These are causal recipes, not visual presets.

### Press and activation

Respond immediately with color, surface, tiny displacement, or scale only when it remains legible. Keep the box geometry stable. Async completion gets a separate pending/success/error state.

### Tooltip and repeated disclosure

Delay accidental hover entry, then reduce the delay while users traverse related triggers. Keyboard focus is immediate. Exit is subtle. Content remains dismissible and reachable.

### Menu, popover, drawer, modal

Origin matches the trigger or edge. Focus enters and returns correctly. Backdrop, panel, and content form one sequence. Rapid reversal does not blink, teleport, or leave an invisible blocker.

### Live data update

Preserve row and column geometry. Highlight the changed value briefly only when the user must notice. Do not animate every refresh. Keep freshness and source visible without perpetual pulsing.

### Success, warning, and failure

Silent success is often enough in repeated flows. Use expressive success for rare meaningful completion. Warnings and failures need persistent semantic state and recovery; motion may attract attention once, never become the only signal.

### Scene, room, or mode transition

Use a cover, door, curtain, frame, camera move, or shared object only when it belongs to the spatial model. Define close, covered, commit, reveal, and cleanup phases. Keep each phase interruptible or explicitly input-locked with visible reason. Verify the destination under reduced motion.

## Complex Surfaces

### Command centers

- Keep the operational spine stable while values update.
- Spend attention motion on newly actionable incidents, not ambient telemetry.
- Separate wallboard distance from operator interaction.
- Preserve ownership, freshness, severity, evidence, and recovery during transitions.
- Avoid alarm theater: constant glow, pulse, shake, and ticker motion destroy priority.

### Editors and studios

- Direct manipulation owns the motion language.
- Tether inspectors and controls to the object or region they affect.
- Preserve canvas position, selection, undo/redo, and local state across mode changes.
- Avoid page-level entrances every time an inspector changes.

### HUDs and playable interfaces

- Motion must survive the busiest play state, camera movement, effects, and input latency.
- Use world-space motion for world relationships and screen-space motion for stable status or action feedback.
- Protect reticle, predicted travel, and glance regions.
- Keep status updates readable in peripheral vision without stacking pulses.
- Provide static or reduced alternatives that preserve mechanic clarity.

### Brand and editorial surfaces

- Use one authored sequence, not a reveal on every section.
- Let artifacts, type, and media carry the argument before parallax.
- Scroll-linked motion needs a static reading order, bounded work, and small-screen fallback.
- The first viewport cannot depend on a long animation before explaining the offer.

## Performance

- Animate exact properties; never use transition: all when the changing set is known.
- Prefer transform and opacity. Use filter, clip-path, masks, or layout properties only when the visible mechanism earns the cost and runtime evidence supports it.
- Avoid driving a large subtree through inherited CSS variables during direct manipulation.
- Add will-change only for observed or credible first-frame stutter, name exact properties, and remove temporary hints.
- Cap simultaneously animated elements, expensive layers, blur area, shadow area, device pixel ratio, particles, physics bodies, and canvas objects.
- Pause hidden and offscreen loops, marquees, video, canvas, WebGL, particles, and physics.
- Dispose animation frames, timers, observers, listeners, worklets, renderers, worlds, geometries, materials, and textures on unmount or route change.
- Profile production builds on a representative lower-end target when motion is continuous, gesture-heavy, canvas/WebGL, or visibly suspect.

Development stutter and a flagship laptop's smoothness are both unreliable witnesses.

## Reduced Motion And Transparency

Reduced motion preserves state clarity while removing spatial travel, parallax, repeated loops, large scale, and spring-heavy effects. It does not merely slow the same sequence.

Define alternatives per event:

- feedback: instant color, outline, icon, or text change;
- spatial transition: crossfade or immediate state with maintained focus;
- live update: persistent semantic highlight without movement;
- scene transition: brief cover/fade or direct cut;
- ambient loop: static composition;
- gesture: direct movement during input, minimal or no inertial flourish after release.

Provide solid or higher-contrast material when reduced transparency or contrast needs it. Keep focus, text, controls, and status above animated layers.

## Motion Proof

Inspect source and runtime. Use slowed capture or browser animation tooling when the origin, overlap, or settle is hard to judge.

Required proof for material motion:

- default trigger and completion;
- rapid open/close/open or repeated activation;
- interruption and cancellation;
- reduced motion;
- keyboard and touch/hover gating when applicable;
- hidden/offscreen behavior;
- the complex surface's costly moment;
- production frame/long-task evidence when cost is plausible;
- cleanup after route change or unmount.

Record:

~~~text
Before: exact rendered behavior or source.
Damage: frequency, delay, disorientation, jank, or accessibility cost.
After: concrete replacement or deletion.
Proof: route + viewport + state + slowed capture, runtime metric, source, or blocker.
~~~

Block approval for unjustified high-frequency travel, primary content hidden behind animation startup, scale-zero or delayed entries that visibly teleport, missing reduced behavior on significant movement, broken gesture capture, queued transitions, offscreen loops, timer-synchronized state that drifts from the rendered transition, or easy compositor fixes left undone.

Syntax is a lead. The rendered behavior commits the crime.
