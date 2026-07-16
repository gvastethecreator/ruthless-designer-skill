# Visual Craft By Problem

Use this route when the result needs a coherent visual system, not an effects shopping list. Diagnose the problem first: weak hierarchy, poor legibility, unstable rhythm, generic identity, broken media, theme drift, or optical sloppiness. Choose the smallest system change that kills it.

## Typography

Define roles before sizes: display, heading, body, label, data, annotation, code. Choose families and weights that render in the actual language and platform; verify fallbacks, loading, accents, symbols, CJK/RTL when relevant, and bold/italic availability. Tune measure, line height, tracking, wrapping, and numeric alignment by role. Use weight, size, space, and position in an intentional order instead of making everything loud.

Fix lonely words, accidental rivers, clipped diacritics, fake small caps, synthetic weights, shifting webfonts, and display faces leaking into controls. Type that photographs well but reads badly is costume jewelry.

Use `text-wrap: balance` for short headings only when the resulting line lengths strengthen the shape; use `pretty` for prose when browser support and layout stability justify it. Inspect fallback wrapping. Neither property rescues weak copy or a container with the wrong measure.

## Color And Themes

Name roles before values: canvas, surface, text, muted text, edge, accent, focus, selection, and semantic states. Use hue for identity and emphasis, luminance for hierarchy, and saturation sparingly enough that status still means something. Check contrast in actual component states, not just token pairs.

Build light, dark, and high-contrast themes as separate perceptual systems. Dark mode is not inverted light mode: elevation, borders, images, shadows, charts, and semantic colors need retuning. Test forced colors and reduced transparency when applicable. Never let a decorative palette turn error, success, and selection into the same neon soup.

## Grid, Rhythm, And Optical Fit

For dense, repeated, spatial, command-center, HUD, or finish-sensitive work, use the full measurement and safe-area contract in [geometry-and-rhythm.md](geometry-and-rhythm.md).

Derive the grid from content geometry: reading measure, data columns, media ratio, control density, and viewport pressure. Establish anchors and deliberate breaks. At narrow widths, recompose priority; do not stack the desktop until it becomes an archaeological column of cards.

Use a small spacing rhythm, then allow named exceptions for grouping, interruption, or emphasis. Repetition should make relationships legible, not mechanically equal. Check vertical cadence across headings, controls, rows, sections, and sticky regions.

Correct what mathematics gets visibly wrong: icon baselines, circular overshoot, play-arrow centering, mixed-cap labels, button padding, hairline weight, logo clearspace, and media crops. Optical alignment beats a perfect coordinate that looks drunk.

Audit horizontal and vertical anchors explicitly. Compare sibling starts, ends, centers, baselines, internal padding, repeated gaps, and section breaks at rendered size. A spacing token does not excuse a visible wobble; measure the boxes and correct the shared cause.

For tightly nested rounded surfaces, start with `outer radius ≈ inner radius + intervening padding`, then correct optically; unrelated radii make the layers look dented. Use `scrollbar-gutter: stable` when scrollbar appearance would shift reading measure, aligned columns, or fixed controls. Do not reserve dead space where overlay scrollbars or the composition make it irrelevant.

Treat every remaining scroll region as a designed component. Use a minimal theme-aware custom thumb and track, appropriate width, hover/active states, and cross-browser styling without hiding the affordance or breaking forced colors, keyboard, wheel, touch, or zoom. Native default chrome inside a deliberate interface is unfinished unless the platform prevents styling; record that limit.

## Icons And Media

Keep icon family, viewBox, stroke/fill, cap/join, corner, negative space, optical center, and visual weight coherent. Prefer the existing icon system or a proven library. A custom vector must be product-specific, designed on a declared grid, and inspected at real sizes plus an enlarged crop; improvised one-off SVG paths fail the craft gate. Use labels for unfamiliar or consequential actions. Reserve dimension before media loads; choose crop and focal point by meaning, not container convenience. Verify resolution, compression, art direction, captions, alt text, masking, and behavior across themes. Do not use stock media as emotional wallpaper when the claim needs product proof.

## Gradients

Use gradients freely when they express light, material, focus, state, atmosphere, or brand. Judge the rendered field rather than banning a hue pair. Tune stops, origin, interpolation, contrast, banding, clipping, repetition, theme behavior, and fallback. Remove only the gradients whose sole function is to announce that styling occurred.

Treat atlases and generated grids as structured data. Define grid, cell ratio, semantic mapping, crop, and focal points; avoid arbitrary two-axis `background-size` stretching. Prefer extracted cells or ratio-correct crops. Inspect every cell and the smallest extreme viewport; one correct tile proves nothing.

## Craft Gate

Inspect at target size, narrow width, zoom, each supported theme, and with real long/short content. Blur or squint to test hierarchy; inspect crisp crops to test finish. Pass only when the system solves the named problem and exceptions are intentional. If the defense is a catalog of gradients, shadows, radii, and micro-animations, no design decision has occurred.
