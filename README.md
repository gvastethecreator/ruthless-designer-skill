# Ruthless Designer

![Ruthless Designer banner](./assets/readme-banner-v5.png)

> A Codex skill for blank-canvas UI creation with teeth: complete product screens, dashboards, landing pages, prototypes, visual systems, obsessive critique/fix/proof loops, and visual QA.

[![License: MIT](https://shieldcn.dev/badge/license-MIT-yellow.svg?variant=secondary&size=xs)](./LICENSE)
[![Status](https://shieldcn.dev/badge/status-preview-red.svg?variant=secondary&size=xs)](#status)

Ruthless Designer is for moments where "make it nice" is not enough. It creates or reimagines interfaces from first principles, rejects generic defaults, defines a visual system, builds the artifact when code is available, and keeps cutting until the design survives evidence.

Use it for:

- greenfield app screens, dashboards, tools, prototypes, and product flows
- new landing pages, portfolios, launch pages, and visual systems
- broad redesign direction when the old surface is not worth polishing
- reference-led UI creation from screenshots, URLs, videos, images, or brand assets
- obsessive visual QA before a design or implementation is called good

It is intentionally severe. A result that could fit a competitor after swapping the logo fails. A design without state coverage fails. A claim without screenshot, diff, command output, source artifact, or explicit blocker fails.

## What Makes It Different

- `greenfield-design.md` forces a real product read before layout.
- `obsessive-design-loop.md` brings artifact-first persistence: critique/fix/proof loops, side-by-side evidence, first-impression gates, state coverage, direction resets, and a Loop 30 continue/ask/stop verdict for broad missions.
- `visual-qa.md` compares source truth against rendered result instead of blessing vibes.
- `direction-sprint.md`, `composition-patterns.md`, and `signature-moves.md` turn "make it incredible" into a concrete direction-selection workflow.
- The bundled review harness and detector create local evidence packs for static and runtime UI review, with expectation gates for smoke tests and stricter quality thresholds.

## Install

Install with the Skills CLI:

```powershell
npx skills add gvastethecreator/ruthless-designer-skill
```

Or copy the skill folder into your Codex skills directory:

```powershell
Copy-Item -Recurse .\SKILLS\ruthless-designer "$env:USERPROFILE\.codex\skills\ruthless-designer"
```

If `CODEX_HOME` is set, install there instead:

```powershell
Copy-Item -Recurse .\SKILLS\ruthless-designer "$env:CODEX_HOME\skills\ruthless-designer"
```

## Usage

Invoke it by name or ask for work that clearly matches it:

```text
Use ruthless-designer to create a complete dashboard for a studio booking tool.
```

```text
Design a landing page from scratch. Be ruthless: no generic SaaS hero, include states and proof.
```

```text
Create a new visual direction for this product from the screenshots and implement the first screen.
```

For targeted cleanup of existing implemented UI, use a focused improvement skill when available. Ruthless Designer can still inspect existing surfaces, but its strongest mode is invention and broad reimagination.

This skill is self-contained. When `improve-ui` is also installed, use Improve UI after the direction is chosen for targeted implementation hardening, visual bug fixes, accessibility polish, and production-readiness passes.

## Useful Commands

Validate the skill package:

```powershell
npm run validate
```

Run the static smoke review against the intentionally bad fixture:

```powershell
npm run smoke
```

The smoke test now expects specific high-severity findings from the bad fixture. It fails if the detector stops catching those patterns or if the verdict drifts above/below the expected poor fixture verdict.

Run both:

```powershell
npm run check
```

Run the harness against a target project:

```powershell
node .\SKILLS\ruthless-designer\scripts\run-interface-review.mjs --path <frontend-path> --out .scratch\ruthless-designer\<slug> --fail-on=P2
```

Add a local URL when the UI is runnable:

```powershell
node .\SKILLS\ruthless-designer\scripts\run-interface-review.mjs --path <frontend-path> --url http://localhost:5173 --out .scratch\ruthless-designer\<slug> --fail-on=P1
```

Require runtime proof and signature-move evidence for high-ambition work:

```powershell
node .\SKILLS\ruthless-designer\scripts\run-interface-review.mjs --path <frontend-path> --url http://localhost:5173 --require-runtime --require-signature --signature-proof "artifact-first hero visible in desktop and mobile screenshots" --fail-verdict=good --out .scratch\ruthless-designer\<slug>
```

Capture multiple interaction states in one run:

```powershell
node .\SKILLS\ruthless-designer\scripts\run-interface-review.mjs --path <frontend-path> --url http://localhost:5173 --action-group default=actions-default.json --action-group menu=actions-menu.json --out .scratch\ruthless-designer\<slug>
```

## Project Structure

- [`SKILLS/ruthless-designer/SKILL.md`](./SKILLS/ruthless-designer/SKILL.md): trigger contract and router.
- [`greenfield-design.md`](./SKILLS/ruthless-designer/greenfield-design.md): blank-canvas design process.
- [`direction-sprint.md`](./SKILLS/ruthless-designer/direction-sprint.md): incompatible direction generation and selection.
- [`composition-patterns.md`](./SKILLS/ruthless-designer/composition-patterns.md): structural patterns for product, brand, hybrid, and prototype surfaces.
- [`signature-moves.md`](./SKILLS/ruthless-designer/signature-moves.md): library of distinctive moves tied to task, proof, state, and artifact.
- [`obsessive-design-loop.md`](./SKILLS/ruthless-designer/obsessive-design-loop.md): persistence and evidence gates.
- [`visual-qa.md`](./SKILLS/ruthless-designer/visual-qa.md): source-vs-rendered comparison.
- [`templates/`](./SKILLS/ruthless-designer/templates): design-read, loop, evidence, and final-checklist ledgers.
- [`examples/`](./SKILLS/ruthless-designer/examples): compact golden direction references.
- [`scripts/`](./SKILLS/ruthless-designer/scripts): static detector and review harness.
- [`fixtures/`](./SKILLS/ruthless-designer/fixtures): intentionally bad UI fixture for smoke tests.

## Status

Preview public skill project.

- The skill validates without external dependencies.
- Static review smoke runs with Node.js only.
- Runtime browser proof requires Playwright in the target project or an available Playwright path.

## License

MIT.
