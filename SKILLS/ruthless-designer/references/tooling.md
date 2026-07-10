# Local Review Tooling

Use the bundled tools only when local frontend files or a runnable URL can support the claim. They collect evidence; they do not possess taste.

## Static Detector

Run a focused local scan:

```powershell
node SKILLS/ruthless-designer/scripts/detect-ui-antipatterns.mjs --json --fail-on=P1 --out output/ruthless-designer/<slug>/static-findings.json <file-or-directory>
```

Useful flags:

- `--list-rules`: print the executable rule catalog without requiring a target.
- `--explain <rule-id>`: print one rule's severity, confidence, applicability, message, and contextual exceptions.
- `--format=text|md|json` or `--json`: choose output.
- `--fail-on=P1|P2|P3`: fail when that severity or worse exists.
- `--out <file>`: persist the report.
- `--allowlist <json>`: suppress accepted stable fingerprints.
- `--baseline <json>`: suppress existing findings from an earlier report.
- `--changed-only`: scan staged, unstaged, and untracked non-ignored Git files under the target.
- `--category <name>`: filter by category or rule ID.
- `--include-ignored`: include normally skipped directories during traversal.
- `--allow-empty`: explicitly accept a scan with zero compatible files.

By default, a missing target or zero compatible files fails closed with exit code `2`. Do not add `--allow-empty` merely to make a gate green. Use it only when an empty scan is genuinely expected and state why.

Directory traversal skips common tests, fixtures, generated output, and vendor dependencies. An explicitly targeted ignored file/directory remains inspectable; use `--include-ignored` for broad traversal only when those files are actually in scope.

Supported frontend/source styles include common JS/TS/JSX/TSX/Vue/Svelte/HTML/CSS plus MJS/CJS/SCSS/Sass/Less variants.

Treat every finding as a lead:

- Use `confidence` to judge how strongly the syntax supports the rule.
- Use `applicability` to decide whether the pattern applies to this surface and register.
- Confirm aesthetic and heuristic findings in context.
- Group repeated findings by primitive, token, component, or state model.
- Keep fingerprints stable in baselines; do not key long-lived suppressions to line numbers.

Read the rule's exceptions before sentencing the artifact. Documented system intent, generated/vendor/fixture code, layout primitives, pointer-capture infrastructure, and decorative blur can make otherwise suspicious syntax legitimate. Frequency, distance, register, and user task also change the damage. An exception is an investigation path, not an automatic acquittal: confirm the rendered behavior or source contract and record why the rule does or does not apply.

The deprecated `--gpt` and `--gemini` flags are accepted only for compatibility and emit no provider-specific findings. Design slop is a pattern, not a model nationality.

## Full Review Harness

Use the harness for a combined static/runtime evidence package:

```powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/ruthless-designer/<slug> --fail-on=P1 --require-runtime
```

Use static-only mode when no URL exists, then state runtime/visual proof is blocked:

```powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --out output/ruthless-designer/<slug> --fail-on=P1
```

Do not use static-only output to claim visual quality, responsiveness, or interaction correctness.

Useful gates:

- `--require-runtime`: fail when no runnable URL exists or runtime evidence cannot complete.
- `--fail-on=P1|P2|P3`: gate finding severity.
- `--require-signature --signature-proof <text> --signature-selector <selector>`: require a named signature claim, successful runtime screenshots, and an observable visible target. A selector proves presence, not visual excellence.
- `--expect-finding <rule-id>` and `--expect-assessment=blocked|findings|evidence-collected`: smoke-test known fixtures.
- `--viewport <width>x<height>`: target a specific viewport.

The report records a nonnumeric assessment:

- `blocked`: at least one required evidence gate failed.
- `findings`: evidence ran and produced static or runtime findings; inspect severity and the available context or applicability.
- `evidence-collected`: evidence ran without detector findings; this is not approval.

Unknown dimensions remain unknown. The report also keeps production integrity, task effectiveness, and distinctiveness separate; the harness may block or limit production integrity, but it does not automatically assess human comprehension or visual distinction. A failed required gate blocks the assessment even when the static finding count is zero.

The retired `--fail-verdict`, `--fail-under-score`, and `--expect-verdict` flags exit with a migration error. Use explicit evidence gates and severities instead of laundering incomplete coverage into a flattering number.

`--expect-assessment=blocked` may make a known blocked fixture exit successfully while its failed gates remain visible in the report. It does not override `--fail`, `--fail-on`, another failed expectation, or invalid input.

Captured screenshots prove capture, not visual comparison. Inspect them manually or compare them against before/reference artifacts before claiming fidelity or improvement.

This harness does not orchestrate multi-tab conflicts, server-side authorization, replay/idempotency, or every offline/network race. Exercise those contracts in the application's own integration or end-to-end runner, then attach the commands and artifacts to the same evidence ledger.

## Interaction States

Use an action file when proof depends on behavior after page load:

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

For several states, prefer named groups:

```powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --action-group default=actions-default.json --action-group error=actions-error.json --out output/ruthless-designer/<slug>
```

Supported interaction types include `click`, `hover`, `type`, `press`, `scroll`, and `wait`. Observable assertions are `assert-visible` with `selector`, `assert-text` with `selector` plus `value`, and `assert-url` with `value`. Do not assert a generic element that was already visible and call it state proof.

For async coverage:

```powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --async-ui --states empty,loading,error,permission,long-content,slow-network,rapid-click --action-group error=actions-error.json --out output/ruthless-designer/<slug>
```

State names are a contract, not navigation magic. Count a state as covered only when its same-name action group is non-empty, contains an observable state assertion, and the runtime assertion succeeds. An empty group or clean page load proves nothing about error, permission, loading, or recovery.

## Read The Report Ruthlessly

Inspect the report, screenshots, console/network results, state runs, and gate failures. Verify:

- Static scan ran against intended files.
- At least one runtime result succeeded when runtime is required.
- Screenshots show the intended route, viewport, theme, auth, content, and state.
- Signature proof is visible in successful captures.
- Async state names correspond to successful action groups or fixtures.
- Console/network failures and layout/motion signals are investigated rather than blindly copied into the roast.
- The assessment result and claim limits match the evidence actually collected.

Persist the exact command, output path, viewport/state, and claim limit in the evidence ledger.
