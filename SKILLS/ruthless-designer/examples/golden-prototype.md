# Golden Prototype Direction

Use as a compact reference for interactive tools, games, explainers, renderers, and labs.

## Brief

Shader playground for tuning a tiny water effect with presets and export.

## Direction

- Killed default: landing page explaining features before the tool.
- Killed second reflex: neon cyber dashboard with logs louder than the canvas.
- Selected direction: playable surface first with instrument-panel controls.
- Signature move: parameter-to-preview tether. Controls highlight the visible region of the water they affect.
- Composition: playable surface first plus compact instrument panel.
- Dials: variance 5, motion 3, density 6.

## System

- First viewport: canvas/output dominates.
- Control rail: presets, core sliders, randomize, reset, export.
- Inspector: selected parameter help, current value, safe range, performance note.
- Debug: collapsed by default, opens only when runtime errors or user asks.
- States: blank WebGL fallback, reduced-motion still frame, mobile compact controls, export error, long preset names.

## Proof

- Browser screenshot proves canvas is nonblank and controls do not cover the effect.
- Mobile screenshot proves the main tool remains usable without page-length setup text.
- Runtime check names console/WebGL errors, frame pressure, offscreen pause, and reduced-motion behavior.
- Final claim is blocked if canvas proof is absent.
