# Contributing

Ruthless Designer is an evidence-backed Agent Skills package and UI review harness.

## Before opening a pull request

1. Install the pinned toolchain with `pnpm install --frozen-lockfile`.
2. Run `pnpm run check`.
3. Add or update the nearest detector, harness, validator, or report regression for changed behavior.
4. Keep the router below its validated context budget.
5. Keep public documentation, fixtures, and reports in English unless a localization test explicitly requires another language.

Do not weaken a finding expectation, evidence gate, or security redaction only to make the suite pass.
