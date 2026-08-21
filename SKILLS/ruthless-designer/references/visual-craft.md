# Visual Craft By Problem

Coherent visual system, not an effects shopping list. Diagnose first: weak hierarchy, poor legibility, unstable rhythm, generic identity, broken media, theme drift, optical sloppiness. Smallest system change that kills it.

## Typography

Roles before sizes: display, heading, body, label, data, annotation, code. Families/weights must render in the language and platform; check fallbacks, loading, accents, symbols, CJK/RTL when relevant, bold/italic. Tune measure, line height, tracking, wrapping, numeric alignment by role. Weight, size, space, position in intentional order — not everything loud.

Fix lonely words, accidental rivers, clipped diacritics, fake small caps, synthetic weights, shifting webfonts, display faces leaking into controls. Type that photographs well but reads badly is costume jewelry.

`text-wrap: balance` for short headings only when resulting line lengths strengthen the shape; `pretty` for prose when browser support, layout stability justify it. Inspect fallback wrapping. Neither property rescues weak copy or a wrong-measure container.

## Color And Themes

Roles before values: canvas, surface, text, muted text, edge, accent, focus, selection, semantic states. Hue for identity, emphasis, luminance for hierarchy, saturation sparingly enough that status still means something. Check contrast in component states, not token pairs.

Light, dark, high-contrast: separate perceptual systems. Dark mode is not inverted light mode: elevation, borders, images, shadows, charts, semantic colors need retuning. Test forced colors, reduced transparency when applicable. Never let a decorative palette turn error, success, selection into same neon soup.

Chrome (nav, toolbars, persistent controls) quieter than content it serves. Translucency only when the same spatial object stays visible behind it and type stays legible. Honor reduced transparency with solid fallback. Do not pick material for the color it casts; do not spread system-glass costume across cards, tables, marketing modules.

## Grid, Rhythm, And Optical Fit

Dense, repeated, spatial, command-center, HUD, finish-sensitive work: full measurement, safe-area contract in [geometry-and-rhythm.md](geometry-and-rhythm.md).

Grid from content geometry: reading measure, data columns, media ratio, control density, viewport pressure. Anchors, deliberate breaks. At narrow widths, recompose priority — not an archaeological column of stacked desktop cards.

Small spacing rhythm, then named exceptions for grouping, interruption, emphasis. Repetition makes relationships legible, not mechanically equal. Check vertical cadence across headings, controls, rows, sections, sticky regions.

Correct what mathematics gets visibly wrong: icon baselines, circular overshoot, play-arrow centering, mixed-cap labels, button padding, hairline weight, logo clearspace, media crops. Optical alignment beats a perfect coordinate that looks drunk.

Audit horizontal, vertical anchors: sibling starts, ends, centers, baselines, internal padding, repeated gaps, section breaks at rendered size. Spacing token does not excuse a visible wobble; measure the boxes; correct the shared cause.

Tightly nested rounded surfaces: start with `outer radius ≈ inner radius + intervening padding`, then correct optically; unrelated radii look dented. `scrollbar-gutter: stable` when scrollbar appearance would shift reading measure, aligned columns, or fixed controls. Do not reserve dead space where overlay scrollbars or the composition make it irrelevant.

Every remaining scroll region is a designed component: minimal theme-aware thumb and track, appropriate width, hover/active, cross-browser styling without hiding affordance or breaking forced colors, keyboard, wheel, touch, zoom. Native default chrome inside deliberate interface is unfinished unless platform prevents styling; record that limit.

## Icons And Media

Icon family, viewBox, stroke/fill, cap/join, corner, negative space, optical center, visual weight coherent. Prefer existing icon system or proven library. Custom vector: product-specific, declared grid, inspected at real sizes plus an enlarged crop; improvised one-off SVG paths fail craft gate. Labels for unfamiliar or consequential actions. Reserve dimension before load; crop/focal point by meaning, not container convenience. Check resolution, compression, art direction, captions, alt, masking, theme behavior. No stock media as emotional wallpaper when claim needs product proof.

## Gradients

Gradients are valid when they express light, material, focus, state, atmosphere, brand. Judge rendered field rather than banning a hue pair. Tune stops, origin, interpolation, contrast, banding, clipping, repetition, theme behavior, fallback. Remove only gradients whose sole function is to announce that styling occurred.

Atlases and generated grids: structured data. Define grid, cell ratio, semantic mapping, crop, focal points; avoid arbitrary two-axis `background-size` stretching. Prefer extracted cells or ratio-correct crops. Inspect every cell, smallest extreme viewport; one correct tile proves nothing.

## Craft Gate

Inspect at target size, narrow width, zoom, each supported theme, real long/short content. Blur or squint for hierarchy; crisp crops for finish. Pass only when system solves the named problem, exceptions are intentional. If the defense is a catalog of gradients, shadows, radii, micro-animations, no design decision has occurred. Chrome-versus-content, user-controlled text size, anti-iOS-costume: [human-interface-craft.md](human-interface-craft.md).
