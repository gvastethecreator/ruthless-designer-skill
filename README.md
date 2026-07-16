# Ruthless Designer

![Ruthless Designer banner](./assets/readme-banner-v5.png)

> A Codex skill with teeth: distinctive interface creation, broad redesign, aggressive evidence-backed critique, and visual proof that refuses to certify vibes.

[![License: MIT](https://shieldcn.dev/badge/license-MIT-yellow.svg?variant=secondary&size=xs)](./LICENSE)
[![Status](https://shieldcn.dev/badge/status-preview-red.svg?variant=secondary&size=xs)](#status)

Ruthless Designer is hostile to mediocre artifacts and loyal to the user. It kills generic defaults, finds the structural cause behind weak hierarchy, builds the better interface when implementation is requested, and refuses to call unobserved work excellent.

Its aggression has a contract: attack the interface, never its author. Every major blow must earn itself through evidence, user damage, structural cause, an exact fix, and a better design move.

## Use It For

- Greenfield product screens, dashboards, editors, tools, landing pages, portfolios, and interactive prototypes.
- Broad redesigns that change hierarchy, composition, or the visual system.
- Reference-led UI creation from screenshots, URLs, videos, brand assets, or existing products.
- Decision-heavy dashboards, tables, charts, uncertainty, and dense information design.
- Deep screenshot/code autopsies, aggressive design critique, and visual QA.
- Critique/fix/proof loops where the rendered artifact—not the first patch—decides when work stops.

Do not use it for isolated component fixes, small visual bugs, accessibility/performance-only repairs, or code-only review without a broad design mandate. A surgical task does not need a designer kicking down every wall in the building.

## What It Does Differently

- Runs one state machine: `CLASSIFY -> READ -> CHOOSE -> BUILD -> PROVE -> CONTINUE | RESET | STOP`.
- Loads only the reference route needed for the current surface.
- Rejects the obvious category default and the fashionable second reflex.
- Requires one useful, product-specific signature move instead of decorative novelty.
- Calibrates expression, density, motion, familiarity, confidence, and emotional tone from the audience and task instead of equating product with beige restraint.
- Makes product state, real content, verified assets, and responsive pressure part of the design.
- Hardens production claims against stale writes, cross-tab conflicts, hydration drift, lost focus, hostile viewports, failed media, and missing browser capabilities.
- Keeps critique brutal without letting jokes replace evidence.
- Preserves mechanisms that already work and limits the first cuts to the root causes that actually exist.
- Separates `observed`, `captured`, `compared`, `passed`, and `blocked` evidence.
- Judges production integrity, task effectiveness, and distinctiveness independently.
- Treats static detector output as a lead, never a visual verdict.
- Models motion as feedback, state, spatial continuity, attention, or ambient behavior with interruption, repeated-use, reduced-mode, and cleanup proof.
- Makes alignment anchors, relationship-based spacing, repeated-series parity, safe areas, and scroll ownership measurable finish gates.
- Rejects cheap generation through product causality, real content, component ecology, and non-website surface contracts rather than a fashion blacklist.
- Produces synchronized ingestion-first Markdown and standalone HTML design dossiers with lossless evidence, exact annotation zooms, normalized geometry, exact fixes, preservation decisions, and proof limits.

## Install

With the Skills CLI:

```bash
npx skills add gvastethecreator/ruthless-designer-skill
```

Portable copy install on macOS/Linux:

```bash
target="${CODEX_HOME:-$HOME/.codex}/skills/ruthless-designer"
mkdir -p "$target"
cp -R ./SKILLS/ruthless-designer/. "$target/"
```

Portable copy install on PowerShell:

```powershell
$skillsRoot = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills" } else { Join-Path $env:USERPROFILE ".codex\skills" }
$target = Join-Path $skillsRoot "ruthless-designer"
New-Item -ItemType Directory -Force $target | Out-Null
Copy-Item -Recurse -Force .\SKILLS\ruthless-designer\* $target
```

Those copy commands are for consumers without the canonical checkout. On the maintainer machine, `D:\DEV\ruthless-designer\SKILLS\ruthless-designer` is the only editable skill directory. `agents-matrix`, `.agents`, and `.codex` must be direct junctions to it; never edit or synchronize a second physical copy.

## Usage

```text
Use $ruthless-designer to create and implement a scheduling dashboard whose current conflicts dominate the interface.
```

```text
Use $ruthless-designer to reimagine this editor. Keep routes and shortcuts, but kill the shell that buries the canvas under diagnostics.
```

```text
Use $ruthless-designer to roast this screenshot and implementation. Give me the real design crime, source cause, up to five cuts without filler, what must not break, and the better redesign.
```

The skill answers in the user's language. It does not use praise sandwiches, corporate filler, or generic advice such as "improve hierarchy" without naming what must dominate and what must die.

## Validate The Package

Run the complete local gate:

```bash
npm run check
```

That command validates the skill and metadata, validates the evaluation specifications, runs detector/harness/installer regression tests, and exercises the deliberately bad smoke fixture.

Individual commands:

```bash
npm run validate
npm run evals
npm test
npm run smoke
```

## Static Detector

```bash
node SKILLS/ruthless-designer/scripts/detect-ui-antipatterns.mjs --json --fail-on=P1 ./src
```

The detector fails closed for missing targets and zero compatible files. Use `--allow-empty` only when an empty scan is genuinely expected. Findings include confidence and applicability; aesthetic regex signals still require human confirmation.

Common options:

- `--list-rules`: inspect the executable rule catalog without scanning a target.
- `--explain <rule-id>`: inspect a rule's severity, confidence, applicability, and contextual exceptions.
- `--changed-only`: staged, unstaged, and untracked non-ignored files.
- `--include-ignored`: include normally skipped test/fixture/generated/vendor directories.
- `--allowlist` / `--baseline`: suppress stable finding fingerprints.
- `--category`: filter by rule or category.
- `--fail-on=P1|P2|P3`: choose the severity gate.

## Runtime Evidence Harness

Static plus runnable UI:

```bash
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path ./src --url http://localhost:5173 --require-runtime --out ./output/ruthless-designer/app-shell
```

Strict layout-shift regression:

```bash
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path ./src --url http://localhost:5173 --strict-cls --out ./output/ruthless-designer/app-shell
```

The harness records source findings, successful/failed runtime observations, screenshots, console/network signals, viewport state, evidence coverage, and blocked gates. A screenshot is reported as captured and `not-compared`; the tool does not pretend capture alone proves visual quality.

Runtime action files support `assert-visible`, `assert-text`, and `assert-url`. Async state coverage passes only when every declared state has a non-empty named action group and a successful observable assertion; listing state names is not evidence. A signature claim also needs an observable target:

```bash
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --url http://localhost:5173 --require-signature --signature-proof "conflict rail is present" --signature-selector "[data-signature='conflict-rail']" --out ./output/ruthless-designer/signature
```

The report uses a nonnumeric `assessment`: `blocked` when a required evidence gate fails, `findings` when the package contains static or runtime findings, and `evidence-collected` when evidence was gathered without findings. It also records the highest severity, observed and unknown dimensions, and deliberately limited claims for production integrity, task effectiveness, and distinctiveness. `evidence-collected` is not a quality verdict; source plus screenshots still cannot prove that users understand the work or that the design is distinctive.

Gate automation with `--fail-on`, `--require-runtime`, `--require-signature`, and fixture-only `--expect-assessment`. The old `--fail-under-score`, `--fail-verdict`, and `--expect-verdict` flags are rejected because their numeric/verdict model claimed precision the harness did not possess.

Runtime screenshots and logs can contain private product data. The harness removes URL credentials, query strings, fragments, bearer tokens, and common secret assignments from its reports, but review artifacts before sharing them.

## Standalone Design Dossiers

Material critiques, screenshot reviews, design proposals, and redesign proposals can be delivered as synchronized evidence dossiers. Write the structured manifest, then generate strict ingestion-first Markdown plus standalone HTML:

~~~bash
node SKILLS/ruthless-designer/scripts/generate-design-report.mjs --manifest ./output/ruthless-designer/app-shell/report-manifest.json --out ./output/ruthless-designer/app-shell/report.html --strict-assets
~~~

The generator always writes `report.md` beside `report.html` (or accepts `--markdown-out <path.md>`), copies local evidence losslessly into `report-assets/`, and keeps both views on the same normalized manifest. It validates annotation geometry and cross-references, requires every marker to name its literal visible subject, rejects proposal callouts on before/reference evidence, and renders exact context-padded annotation zooms when dimensions are available. It also escapes hostile text, embeds supported local images in HTML, fails strict mode on missing/corrupt/external assets, remains readable without JavaScript, and prints cleanly. Draft mode exposes missing or remote evidence in both reports as a sanitized visible warning instead of silently omitting or fetching it.

The runtime harness also writes `report.md`, `report-assets/`, and `report.html` automatically beside `review.json` and the compact `README.md` index. That automated dossier remains an evidence pack: it does not turn detector output or a captured screenshot into a human design verdict.

## Check The Active Installation

Codex may be loading a copied or misdirected skill. Diagnose the required junction topology with:

```bash
npm run doctor
```

Use `--check` when any missing, copied, or misdirected target should fail:

```bash
node scripts/doctor-skill.mjs --check
```

Preview direct junctions for both `.agents` and `.codex`:

```bash
npm run install:local
```

Create missing junctions after inspecting the dry run:

```bash
node scripts/install-local-skill.mjs --write
```

Replacing a real directory or a junction to the wrong source requires explicit authority:

```bash
node scripts/install-local-skill.mjs --write --replace
```

The installer validates every destination before mutating any of them, rejects nested/same-source paths, and creates direct directory junctions on Windows. The doctor reports healthy only when every required destination resolves to the canonical skill; byte-identical copies still fail because copies can drift.

## Project Structure

- [`SKILL.md`](./SKILLS/ruthless-designer/SKILL.md): compact trigger, voice, state machine, and route selector.
- [`references/`](./SKILLS/ruthless-designer/references): creation, direction, product, production hardening, brand, data/information, visual craft, critique, motion implementation, proof, tooling, and contrasting examples.
- [`scripts/`](./SKILLS/ruthless-designer/scripts): dependency-free static detector and runtime evidence harness.
- [`tests/`](./tests): positive, negative, adversarial, validator, doctor, and installer regression tests.
- [`evals/`](./evals): trigger and behavioral contracts for clean-context forward testing.

## Status

Preview public skill project.

- Skill package, metadata, links, context budgets, and evaluation specs are validated locally.
- Static detector and harness adversarial suites run without external dependencies.
- Runtime browser evidence requires Playwright in the target project or a configured Playwright path.
- The harness captures evidence but deliberately does not claim visual comparison without an actual before/reference review.
- Behavioral eval cases are versioned; fresh-context forward tests remain the quality gate for future releases.

## Attribution And License

Released under the [MIT License](./LICENSE).
