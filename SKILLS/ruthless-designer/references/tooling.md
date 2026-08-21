# Local Review Tooling

Use only when local frontend files or a runnable URL can support the claim. Tools collect evidence; they lack taste.

## Static Detector

```powershell
node SKILLS/ruthless-designer/scripts/detect-ui-antipatterns.mjs --json --fail-on=P1 --out output/ruthless-designer/<slug>/static-findings.json <file-or-directory>
```

Flags:

- `--list-rules`: print rule catalog; no target required.
- `--explain <rule-id>`: one rule's severity, confidence, applicability, message, contextual exceptions.
- `--format=text|md|json` or `--json`: choose output.
- `--fail-on=P1|P2|P3`: fail when that severity or worse exists.
- `--out <file>`: persist the report.
- `--allowlist <json>`: suppress accepted stable fingerprints.
- `--baseline <json>`: suppress existing findings from an earlier report.
- `--changed-only`: scan staged, unstaged, untracked non-ignored Git files under the target.
- `--category <name>`: filter by category or rule ID.
- `--include-ignored`: include normally skipped directories during traversal.
- `--allow-empty`: accept a scan with zero compatible files.

Missing target or zero compatible files fails closed, exit code `2`. Do not add `--allow-empty` merely to make a gate green; use only when an empty scan is expected; state why.

Traversal skips common tests, fixtures, generated output, vendor dependencies. Explicitly targeted ignored file/directory remains inspectable; `--include-ignored` for broad traversal only when those files are actually in scope.

Supported: JS/TS/JSX/TSX/Vue/Svelte/HTML/CSS plus MJS/CJS/SCSS/Sass/Less.

Lead, not sentence:

- `confidence`: how strongly the syntax supports the rule.
- `applicability`: whether the pattern applies to this surface and register.
- Confirm aesthetic, heuristic findings in context.
- Group repeated findings by primitive, token, component, state model.
- Fingerprints stay stable in baselines; do not key long-lived suppressions to line numbers.

Read the rule's exceptions before sentencing. Documented system intent, generated/vendor/fixture code, layout primitives, pointer-capture infrastructure, decorative blur can make suspicious syntax legitimate. Frequency, distance, register, user task also change damage. Exception is investigation path, not automatic acquittal: confirm rendered behavior or source contract; record why the rule does or does not apply.

Deprecated `--gpt` and `--gemini` flags are accepted only for compatibility; emit no provider-specific findings. Design slop is a pattern, not a model nationality.

## Full Review Harness

```powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/ruthless-designer/<slug> --fail-on=P1 --require-runtime --detail-capture
```

Static-only when no URL exists; state runtime/visual proof blocked:

```powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --out output/ruthless-designer/<slug> --fail-on=P1
```

Do not use static-only output to claim visual quality, responsiveness, interaction correctness.

Gates:

- `--require-runtime`: fail when no runnable URL exists or runtime evidence cannot complete.
- `--fail-on=P1|P2|P3`: gate finding severity.
- `--require-signature --signature-proof <text> --signature-selector <selector>`: named signature claim, successful runtime screenshots, observable visible target. Selector proves presence, not visual excellence.
- `--expect-finding <rule-id>` and `--expect-assessment=blocked|findings|evidence-collected`: smoke-test known fixtures.
- `--viewport <width>x<height>`: specific viewport.
- `--detail-capture`: browser evidence at device scale factor `2` so small alignment, icon, spacing, scrollbar defects stay inspectable.

Nonnumeric assessment:

- `blocked`: required evidence gate failed.
- `findings`: evidence ran; produced static or runtime findings; inspect severity, available context or applicability.
- `evidence-collected`: evidence ran without detector findings; not approval.

Unknown dimensions remain unknown. Production integrity, task effectiveness, distinctiveness stay separate; harness may block or limit production integrity, but does not assess human comprehension or visual distinction. Failed required gate blocks the assessment even when static finding count is zero.

Retired `--fail-verdict`, `--fail-under-score`, `--expect-verdict` flags exit with a migration error. Use explicit evidence gates and severities instead of laundering incomplete coverage into a flattering number.

`--expect-assessment=blocked` may make a known blocked fixture exit successfully while failed gates stay visible in the report. Does not override `--fail`, `--fail-on`, another failed expectation, invalid input.

Captured screenshots prove capture, not visual comparison. Inspect manually or compare against before/reference artifacts before claiming fidelity or improvement.

Does not orchestrate multi-tab conflicts, server-side authorization, replay/idempotency, or every offline/network race. Exercise those contracts in the app's integration or end-to-end runner, then attach commands and artifacts to the evidence ledger.

Writes report.html alongside review.json, README.md. Translates collected evidence into a portable dossier; labels automated findings as leads; preserves human-judgment limits. Corrupt or missing screenshot → visible evidence placeholder, not a disappearing image.

## Standalone Proposal Report

Critique, proposal, redesign: create report-manifest.json using [reporting.md](reporting.md), then run:

~~~powershell
node SKILLS/ruthless-designer/scripts/generate-design-report.mjs --manifest output/ruthless-designer/<slug>/report-manifest.json --out output/ruthless-designer/<slug>/report.html --strict-assets
~~~

Generator:

- validates mode, finding severity, proof states, screenshot IDs, annotation bounds;
- escapes all text instead of accepting arbitrary HTML;
- embeds supported local screenshots for portability;
- rejects missing, corrupt, unsupported, external screenshots in strict mode;
- numbered visual annotations with matching text legend;
- renders without JavaScript or external styles;
- exposes risks, limitations, artifact warnings.

no-embed-images only for controlled local draft; disclose portability loss. Open the final artifact at desktop, narrow, confirm print when handoff needs it, inspect annotations at readable scale.

## Interaction States

Action file when proof depends on after-load behavior:

```json
[
  { "type": "click", "selector": "[data-testid='open-menu']" },
  { "type": "wait", "ms": 250 },
  { "type": "assert-visible", "selector": "[role='menu']" },
  { "type": "press", "selector": "body", "key": "Escape" }
]
```

Run:

```powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --actions actions.json --out output/ruthless-designer/<slug>
```

Several states: prefer named groups:

```powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --action-group default=actions-default.json --action-group error=actions-error.json --out output/ruthless-designer/<slug>
```

Supported types: `click`, `hover`, `type`, `press`, `scroll`, `wait`. Observable assertions: `assert-visible` with `selector`, `assert-text` with `selector` plus `value`, `assert-url` with `value`. Do not assert a generic already-visible element and call it state proof.

Async coverage:

```powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --async-ui --states empty,loading,error,permission,long-content,slow-network,rapid-click --action-group error=actions-error.json --out output/ruthless-designer/<slug>
```

State names are a contract, not navigation magic. Covered only when the same-name action group is non-empty, contains an observable state assertion, runtime assertion succeeds. Empty group or clean page load proves nothing about error, permission, loading, recovery.

## Read The Report Ruthlessly

Inspect report, screenshots, console/network results, state runs, gate failures:

- Static scan ran against intended files.
- Runtime result succeeded when runtime is required.
- Screenshots show intended route, viewport, theme, auth, content, state.
- Signature proof is visible in successful captures.
- Async state names correspond to successful action groups or fixtures.
- Console/network failures and layout/motion signals: investigate, don't copy blindly into the roast.
- Assessment result, claim limits match evidence actually collected.

Persist exact command, output path, viewport/state, claim limit in the evidence ledger.
