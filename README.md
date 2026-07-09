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
- Keeps critique brutal without letting jokes replace evidence.
- Preserves mechanisms that already work and limits the first cuts to the root causes that actually exist.
- Separates `observed`, `captured`, `compared`, `passed`, and `blocked` evidence.
- Judges production integrity, task effectiveness, and distinctiveness independently.
- Treats static detector output as a lead, never a visual verdict.

## Install

With the Skills CLI:

```bash
npx skills add gvastethecreator/ruthless-designer-skill
```

Manual install on macOS/Linux:

```bash
target="${CODEX_HOME:-$HOME/.codex}/skills/ruthless-designer"
mkdir -p "$target"
cp -R ./SKILLS/ruthless-designer/. "$target/"
```

Manual install on PowerShell:

```powershell
$skillsRoot = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills" } else { Join-Path $env:USERPROFILE ".codex\skills" }
$target = Join-Path $skillsRoot "ruthless-designer"
New-Item -ItemType Directory -Force $target | Out-Null
Copy-Item -Recurse -Force .\SKILLS\ruthless-designer\* $target
```

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

Partial evidence leaves dimensions `unknown`. `--fail-under-score` fails when coverage is incomplete, and source plus screenshots cannot earn a high verdict while comparison remains `not-compared`.

Runtime screenshots and logs can contain private product data. The harness removes URL credentials, query strings, fragments, bearer tokens, and common secret assignments from its reports, but review artifacts before sharing them.

## Check The Active Installation

Codex may be loading a copied or junctioned skill that has drifted from this repository. Diagnose it with:

```bash
npm run doctor
```

Use `--check` when drift should fail CI or a local gate:

```bash
node scripts/doctor-skill.mjs --check
```

Preview a local installation sync:

```bash
npm run install:local
```

Write and prune stale files only after inspecting the dry run:

```bash
node scripts/install-local-skill.mjs --write --prune
```

The installer resolves linked parents as well as the final target and refuses to write through a symlink/junction unless `--allow-linked-target` is supplied explicitly. It also rejects nested links that would let a copied file escape the skill directory. Those guards exist because silently dirtying another source repository is not installation; it is vandalism with a copy command.

## Project Structure

- [`SKILL.md`](./SKILLS/ruthless-designer/SKILL.md): compact trigger, voice, state machine, and route selector.
- [`references/`](./SKILLS/ruthless-designer/references): creation, direction, product, brand, data/information, visual craft, critique, motion, proof, tooling, and contrasting examples.
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