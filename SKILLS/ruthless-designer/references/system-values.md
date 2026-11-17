# System Values

Starting numbers for a new or rebuilt visual system, and the thresholds the result must pass. Load when the direction is chosen and you define tokens, or when a critique needs a measured verdict. Existing tokens that work beat these values; record every value you introduce and why.

## Contents

- [Type](#type)
- [Space and density by archetype](#space-and-density-by-archetype)
- [Color roles in OKLCH](#color-roles-in-oklch)
- [Shape, depth, and layers](#shape-depth-and-layers)
- [Motion tokens](#motion-tokens)
- [Acceptance thresholds](#acceptance-thresholds)
- [Traps](#traps)

## Type

| Register | Scale from a 16 px base | Use |
|---|---|---|
| Product | Hand-tuned near 1.125–1.2: 12, 14, 16, 18, 20, 24, 30 | Labels, tables, controls, repeated reading |
| Editorial or brand | 1.25: 16, 20, 25, 31, 39, 49, 61 | Long-form and persuasive pages |
| Display-led brand | 1.333: 16, 21, 28, 38, 50, 67, 90 | Few, large headings; keep controls on the product scale |

- Line height: body 1.5; UI text 14/20 or 16/24; headings 1.1–1.25; display 1.0–1.1.
- Tracking: 0 for body; −0.01 to −0.02em on display sizes of 32 px and up; +0.04 to +0.08em on short all-caps labels only.
- Weights: two or three per family (for example 400, 500, 600). Avoid weights under 400 below 16 px.
- Fluid headings: `clamp(<min>rem, <a>rem + <b>vw, <max>rem)`. Keep a `rem` term: a size in pure `vw` does not grow with browser zoom and fails text resize.
- Numbers that change or align use `font-variant-numeric: tabular-nums`; check the font supports it.

## Space and density by archetype

4 px base unit. Practice values; the content and the costly state decide the final numbers.

| Archetype | Gaps (within / between / section) | Controls and rows | Frame |
|---|---|---|---|
| Operator cockpit, dashboard | 4–8 / 12–16 / 24 | 32 px controls, 32–36 px rows | 16–24 px gutters; panels at least 280–320 px |
| Studio, editor | 4 / 8 / 16 inside panels | 28–32 px tool buttons | Canvas fills the frame; inspector 280–360 px |
| Transactional, admin, settings | 8 / 16 / 32 | 40 px controls, 44–48 px rows | Forms 480–640 px wide; tables full width |
| Brand, landing, editorial | 12–16 / 24–32 / 96–160 | 44–56 px primary CTA | Text 60–75ch; container 1120–1280 px; gutters 24 px phone, 48–80 px desktop |
| Touch-first web app | 8 / 16 / 24 | 44–48 px | 16 px gutters plus `env(safe-area-inset-*)` |

## Color roles in OKLCH

For neutrals, OKLCH `L` is exactly the cube root of relative luminance (`Y = L³`), so contrast can be planned before a checker runs: ratio = `(L₁³ + 0.05) / (L₂³ + 0.05)`.

Starting neutral ramp (chroma 0–0.02, optionally tinted toward the accent hue):

| Role | Light theme `L` | Dark theme `L` | Bound it must respect |
|---|---|---|---|
| Canvas | 0.99 | 0.16–0.18 | Dark canvas not `#000`; `#121212` is `L 0.182` |
| Surface / raised | 0.97 / 1.0 | 0.21 / 0.25 | Raise dark elevation by +0.03–0.05 `L` per level |
| Border | 0.90 | 0.30–0.32 | Control boundaries need 3:1: light `L ≤ 0.66`, dark `L ≥ 0.50` |
| Muted text | 0.50–0.54 | 0.68–0.72 | 4.5:1 on light surface `0.97` needs `L ≤ 0.547`; on dark surface `0.21` needs `L ≥ 0.601` |
| Text | 0.20–0.25 | 0.92–0.95 | Avoid pure white body text on dark canvas |

Decorative borders (dividers, card edges) can be lighter than the 3:1 bound; control boundaries and focus indicators cannot.

Accent and semantic colors:

- One accent hue. Filled accent with white text: `L ≤ 0.568`, chroma 0.12–0.20. Accent text on a light canvas: `L ≤ 0.56`; on a dark canvas: `L ≥ 0.70`.
- Tinted status: background `L ≈ 0.95`, chroma about 0.03, text in the same hue at `L ≤ 0.53`. This is the dark-on-tint pattern; it beats white text on a loud fill for quiet status.
- Hue anchors in OKLCH degrees: red/danger ≈ 25–30, amber/warning ≈ 70–90, green/success ≈ 145–155, blue/info ≈ 240–265. Yellow and amber fills (`L ≈ 0.85`) need dark text at `L ≤ 0.46`.
- Dark theme: lower chroma of large fills by about a quarter; raise accent text `L`.
- Saturated colors drift up to about ±0.045 from the neutral formula (OKLCH reads saturated blues, reds, and magentas lighter than their luminance). Keep a 0.05 margin on dark backgrounds and check the rendered pair. Values outside the sRGB gamut are mapped by the browser and shift; check the gamut of high-chroma tokens.

## Shape, depth, and layers

- Radius family: pick one of sharp (0–4 px), soft (6–8 px), or round (12–16 px, pills for pill-shaped controls). Controls take the small step, containers the next step up. Nested surfaces: `outer = inner + padding`, then correct optically.
- One elevation model per surface. Shadow start for light themes: contact `0 1px 2px rgb(0 0 0 / 0.06)` plus ambient `0 4px 12px rgb(0 0 0 / 0.08)`; overlays `0 12px 32px rgb(0 0 0 / 0.16)`. Dark themes show elevation with lighter surfaces and a 1 px border, because shadows barely read on dark canvases.
- Layers: a named z-index scale (base, sticky, dropdown, overlay, modal, toast, tooltip). Unnamed numbers like `9999` are the defect.

## Motion tokens

| Token | Duration | Easing | Use |
|---|---|---|---|
| Press | 100–160 ms | ease-out | Pressed and toggled states |
| Small surface | 125–200 ms | `cubic-bezier(0.2, 0, 0, 1)` | Tooltip, popover, menu |
| Panel | 200–300 ms | `cubic-bezier(0.2, 0, 0, 1)` | Drawer, dialog, accordion |
| Spatial | 300–500 ms | ease-in-out or a critically damped spring | Shared-element or page-level travel, only when distance justifies it |
| Exit | About 75% of the matching entrance | ease-in | Leaving elements never block the next input |

- Animate `transform` and `opacity`; layout properties only with measured cost.
- Stagger 30–80 ms per item, and only where staged attention helps; never in dense lists or tables.
- Under `prefers-reduced-motion: reduce`, remove travel, scale, and parallax; keep fades and state changes. Durations above 300 ms, bounce, and overshoot are review prompts, not automatic failures.

## Acceptance thresholds

WCAG 2.2 and Core Web Vitals values checked at w3.org and web.dev on 2026-11-17. `standard` rows fail a claim; `practice` rows need product context.

| Check | Pass | Label |
|---|---|---|
| Text contrast | 4.5:1; large text (24 px, or 18.5 px bold) 3:1; no rounding | standard, 1.4.3 AA |
| Component, state, and focus contrast | 3:1 against adjacent colors; disabled exempt | standard, 1.4.11 AA |
| Target size | 24×24 CSS px or the 24 px spacing circle; 44×44 for touch, frequent, destructive, or edge controls | standard 2.5.8 AA; 44 px is AAA and practice |
| Reflow | No two-direction scroll at 320 CSS px wide; tables, maps, and toolbars exempt | standard, 1.4.10 AA |
| Text spacing | Line height 1.5, paragraph 2em, letter 0.12em, word 0.16em lose nothing | standard, 1.4.12 AA |
| Focus not obscured | Sticky or overlay content never hides the focused control entirely | standard, 2.4.11 AA |
| Motion safety | Auto-moving content over 5 s can pause; at most 3 flashes per second | standard, 2.2.2 and 2.3.1 A |
| Layout shift, latency, loading | CLS ≤ 0.1, INP ≤ 200 ms, LCP ≤ 2.5 s at p75 | Core Web Vitals "good" |
| Mobile inputs | 16 px or larger text in inputs, selects, and textareas | practice: iOS Safari zooms on focus below 16 px |

The review harness reports `contrastIssues`, `smallHitAreas` (24 px boundary), `horizontalOverflow`, `clippedText`, and `cls`; [tooling](tooling.md) has the commands. Contrast over images, gradients, and translucency needs pixel sampling by hand.

## Traps

- `100vh` on phones includes the area behind the browser toolbar; use `100dvh` or `100svh`.
- Fixed bottom bars need `viewport-fit=cover` and `padding-bottom: env(safe-area-inset-bottom)`.
- Flex children that must truncate need `min-width: 0`; grid tracks need `minmax(0, 1fr)`.
- `:hover` sticks after a tap; scope hover styles to `@media (hover: hover)`.
- A sticky header hides anchor targets and focused fields; set `scroll-margin-top` or `scroll-padding-top`.
- Dark mode made with `filter: invert()` breaks media, shadows, and contrast.
- Webfonts with `font-display: swap` and no metric-matched fallback (`size-adjust`, `ascent-override`, `descent-override`) shift text on load.
