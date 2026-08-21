# Geometry, Rhythm, And Density

Dense tools, command centers, HUDs, repeated rows, split panes, inspectors, data fields — surfaces where alignment and spacing determine comprehension. Finish pass when “something feels off” but cause is geometric.

## Start With Relationships

Do not start with a spacing scale. Name relationships to explain:

- **within**: icon to label, label to value, title to helper, field to error;
- **between**: sibling controls, repeated rows, related cards, evidence and action;
- **section**: one task group to another;
- **edge**: content to shell, viewport, safe area, crop, or scroll boundary;
- **interruption**: break for a new phase, warning, decision, or narrative beat.

Tokens may supply values; the relationship owns the value. One gap everywhere is hierarchy removal, not consistency.

For broad work, record a geometry ledger before styling:

~~~text
frame and safe area:
primary alignment anchors:
secondary anchors:
within / between / section / edge rhythm:
repeated series:
parallel regions:
scroll owners:
variable-content reservations:
intentional breaks:
proof route + viewport + state:
~~~

Persist as geometry-ledger.json when several builders, surfaces, or proof states are involved.

## Build An Alignment Map

- shell edges and main content frame; first text baselines; row starts and ends;
- numeric or temporal columns; control centers;
- canvas, evidence, or selected-object edge; alert, status, and action lanes;
- HUD safe-area and reticle or world-space anchors.

Align same-scan items. Break alignment only for a semantic change. Random offset is not dynamism.

Parallel rows/columns:

- matching starts, ends, centers, baselines; equal control and row heights where contracts are equal;
- icon crop and text optical center; reserved space for optional badges, errors, counts, avatars, actions;
- equal content clearance at the container edge; stable geometry across loading, selection, error, long content.

No hover or validation border if it changes box size. Reserve geometry, or use outline, inset shadow, or an existing border slot.

## Make Rhythm Legible

Ratio is contextual; ordering is not:

~~~text
within < between < section
~~~

Edge clearance: tighter in a cockpit, larger on a rare decision screen. Dense ≠ cramped; spacious ≠ objects floating with no relationship.

Repeated siblings need parity unless a subgroup changes cadence. Visible series:

1. capture bounding boxes;
2. list adjacent gaps;
3. explain every material delta;
4. trace unexplained drift to margin collapse, line height, variable content, absolute positioning, grid tracks, or nested padding;
5. repair the shared primitive, not each symptom.

Runtime harness flags list-gap spread above three rendered pixels as a review lead, not a universal design law; confirm grouping, wrapping, or optical correction earned the difference.

Avoid stacking sibling margins from multiple owners. One layout owner with gap when uniform; explicit section margins when the relationship changes. Named exceptions, not magic numbers, until the screenshot stops complaining.

## Clear The Cut

Inspect:

- clipped text, focus rings, shadows, badges, tooltips, selected outlines; media focal points and masks;
- sticky headers meeting scrolling content; bottom rows behind toolbars, browser chrome, or safe areas;
- full-bleed surfaces meeting the viewport; hard seams between adjacent colors, gradients, images, canvas, native controls;
- horizontal overflow and nested scroll traps; final visible item in every scroll region.

Deliberate crop: authored focal point plus enough context; accidental crop looks like missing padding.

Use scrollbar-gutter where scrollbar appearance would shift aligned content. Style scrollbars minimally when the platform allows; preserve wheel, keyboard, touch, zoom, forced-color, discoverability. Hiding the scrollbar does not solve scroll ownership.

## Density By Product Job

Not card count: decision-relevant information scannable without losing structure.

### Command centers

- Separate urgent decisions, active ownership, freshness, evidence, ambient telemetry; keep the incident or operational spine stable while live values update.
- Saturation, motion, large type: scarce alarm resources.
- Reserve variable-width timestamps, service names, counts so updates do not shove actions sideways.
- Wallboard: distance and shared awareness. Operator: selection, detail, keyboard traversal, recovery. Do not average them.

### Editors and studios

- Artifact or canvas owns the frame; align inspectors to the object or region they change.
- Toolbars stable across selection changes; reserve optional tool groups.
- Irreversible or global actions outside the high-frequency local-control rhythm.
- Zoom, pan, timeline, property density: support direct manipulation, not dashboard chrome around it.

### HUDs and playable interfaces

- Start from the play field, not a web-page shell. Define safe areas, world-space vs screen-space anchors, occlusion budgets, input modality, glance distance.
- Tether health, ammo, cooldown, target, objective, or threat signals to the decision they influence.
- Preserve center and predicted travel/aim regions unless the mechanic requires occupation. Test motion, contrast, scale against the busiest game state, not a clean menu background.
- Recompose for aspect ratio and touch; do not stack desktop widgets into the play field.

### Data and decision surfaces

- Align values by meaning: decimal, time, status, owner, comparison baseline. Headers and row actions stable with long content.
- Whitespace and rules to expose groups, not a card around every metric. Connect selected evidence to the action it enables.

## Optical Correction

Math alignment is baseline, not verdict:

- circles and curved glyphs may need overshoot; play arrows and asymmetrical icons need visual centering;
- mixed-case labels have different apparent centers than all-caps; one-pixel hairlines change weight against dark and light fields;
- icons with loose viewBoxes drift despite equal CSS boxes; media subjects need focal alignment, not box centering.

Apply optical corrections at the icon, type, or primitive layer and document why. Do not hide a broken source asset with one-off transforms across dozens of controls.

## Responsive Recomposition

At every target width, decide:

- which region stays dominant; what collapses, becomes a drawer, changes order, summarizes, or disappears;
- who owns vertical and horizontal scroll; whether dense tables become comparison, list, or detail flows;
- how fixed/sticky regions avoid covering the last item; how safe areas and touch targets change; which alignment anchors survive.

Never prove responsiveness with an empty state alone. Long labels, dense data, error text, selected actions, and open overlays expose real geometry.

## Geometry Proof

### Structure pass

- main artifact dominance; frame and anchor map; region proportions; scan order;
- density gradient; scroll ownership; responsive recomposition.

### Finish pass

- sibling gaps and section cadence; parallel baselines and control centers; internal padding;
- clipped edges and final scroll item; icon/text optical fit; variable-content stability;
- scrollbar, seam, and safe-area treatment.

Full-frame evidence for structure; DPR 2 or focused crops for finish. Record measured deltas when the issue repeats. Pass only when every material exception is intentional or explicitly blocked.

## Failure Patterns

- One spacing token at every level. Repeated gaps that drift without grouping. Parallel columns with different starting lines.
- Equal card surfaces masking unequal priority. Optional metadata that changes action alignment.
- Nested scroll regions with no clear owner. Sticky control covering the final row.
- “Centered” icons that look visibly drunk. Large empty areas from a missing content/state contract.
- Crops and seams defended as “editorial” after they fail at another viewport.

Do not end with “improve spacing.” Name the relationship, current measured behavior, shared cause, replacement rule, and proof state.
