# Proof And Stop Gates

Visual quality, fidelity, responsiveness, interaction, motion, accessibility, performance, production readiness.

## Match Evidence To The Claim

- Visual change: before/after same route, viewport, state, theme, content, auth context.
- Reference-led build: source/reference and result side by side or in directly comparable crops.
- Product surface: desktop plus narrow/mobile, realistic dense content, one meaningful empty/error/permission/recovery state.
- Brand surface: first viewport, early artifact/proof or deliberately staged reveal, relevant conversion/entry/wayfinding decision, mobile first viewport.
- Component/system: default, hover/focus/disabled, long text, narrow container, one relevant edge state.
- Async/data UI: loading, refresh, empty, error, permission, long content, slow network, rapid-click states that can really occur.
- Motion/gesture: trigger, pointer-down response, repeated/interrupted trigger, reduced motion, origin, duration/easing, slow drag, fast flick, reversal, release outside bounds.
- Immersive runtime: visible render, foreground readability, mobile/static fallback, reduced motion, offscreen pause, cleanup path, console/WebGL state.
- Static-only review: source and detector findings with runtime/visual proof explicitly blocked.
- Context-specific: [product context](product-contexts.md) card; prove the costly state, input, spatial, update behavior that distinguishes this archetype from generic web UI.
- Material proposal/review: dossier from [reporting.md](reporting.md); inspect HTML at desktop and narrow; ingest Markdown independently; cross-check subjects, geometry, findings, proof states, asset paths. Dossier packages evidence; does not upgrade an unproven design claim.

More screenshots are not better when they prove nothing.

Atlases or repeated media: complete small set, or every crop class plus first, last, edge cells. Record grid, ratio, mapping, crop/focal behavior, narrow fixture; fail stretching, bleed, subject loss, wrong mapping, blank tiles, default-item-only proof.

## Judge Three Independent Claims

- `production integrity`: artifact runs, survives required states/viewports, preserves data and contracts, meets applicable accessibility, performance, resilience bar.
- `task effectiveness`: intended audience can identify what matters, understand the offer or state, complete the key decision or action without rescue.
- `distinctiveness`: hierarchy, artifact, behavior, visual system form a specific point of view instead of competent category paste.

Record `passed | limited | blocked` per claim, with evidence. Production-ready can be aesthetically timid; a spectacular direction can be unsafe garbage. Neither borrows the other's grade.

Human-comprehension claims need one non-builder: ask what this is, what matters, what comes next; record hesitation, errors, task outcome. One person is a smoke test. Without it, describe intended hierarchy, not proven comprehension.

## Accept Evidence Before Judging

Reject wrong route/window, mismatched context, blank/loading/blocked output, unreadable detail, cropped content, failed actions, `error` captures, runtime P0/P1, blocked assessments. Wait for fonts, images, async content, intended interaction state. Passing assertion cannot overrule failed visual/runtime evidence; repair or rerun it.

Captured ≠ compared:

- `observed`: state loaded and inspected.
- `captured`: an artifact exists.
- `compared`: source/before and result/after evaluated against defined criteria.
- `passed`: no actionable in-scope blocker/major finding remains.

Do not skip from `captured` to `passed`; name viewport and state in the filename or ledger.

## Compare The Right Surfaces

- Hierarchy: first attention, primary task, CTA, warning dominance, artifact visibility.
- Typography: family/fallback, weight, scale, line height, wrapping, truncation, product/brand voice.
- Layout: frame, crop, margins, grid, alignment, spacing rhythm, responsive structure, radius, edge, elevation.
- Color: palette roles, semantic states, contrast, opacity, foreground/background balance.
- Assets: subject, crop, sharpness, compression, masking, logo/icon fidelity, fake-vs-real proof.
- Content: literal labels, actions, claims, sample data, empty/error copy, prompt leakage.
- Interaction: affordance, focus, pending/disabled, recovery, interruption, feedback.

Focused crops or component inspection when a full-page image makes relevant detail unreadable.

Complete the ledger. DPR `2+` for controls, icons, alignment, rows, scrollbars; low-resolution evidence cannot prove unresolved detail.

Repeated geometry: attach the anchor map, gap or baseline deltas, focused crop from [geometry-and-rhythm.md](geometry-and-rhythm.md). Material motion: event map plus interruption, repeated-use, reduced-mode evidence from [motion.md](motion.md). “Feels smoother” and “spacing improved” are not falsifiable claims.

## Evidence Ledger

```text
claim:
command or method:
artifact/path:
route + viewport + state:
finding support:
result: observed | captured | compared | passed | blocked
claim limit:
```

Every final claim points to a screenshot, comparison, source line, test, command output, runtime metric, or explicit blocker.

## Severity And Verdict

- `P0`: blocks core use, data safety, readable access.
- `P1`: major mismatch, broken hierarchy/core responsive path, missing critical asset/state, strong usability/accessibility regression.
- `P2`: systemic generic pattern, visible drift, inconsistent state, fixable resilience gap.
- `P3`: bounded refinement with low user impact.

Tag each finding with the claim it threatens. `passed` only when required evidence ran and no unresolved issue material to that claim remains. P0/P1 blocks the affected claim. Bounded P2 may remain when risk is explicit and accepted. Generic/under-ambitious P2 can fail `distinctiveness` without blocking `production integrity` or the literal `production-ready` claim. Never launder a task, accessibility, state, trust failure as mere taste.

`blocked` when required evidence is unavailable or failed. `limited` when evidence exists but cannot support the full claim.

Unobserved dimension → `unknown` or `blocked`. Absence of findings is not evidence of excellence.

## Continue, Reset, Stop

- Continue when proof exposes a major issue: fix the highest user-damage cause; rerun the same evidence.
- Reset when two valid comparisons stay `flat` or `worse` because the same root cause survived; kill the failed structure and choose a new direction. Repair incomplete content, fixtures, proof before blaming the direction.
- Stop when the requested bar is met, relevant states/viewports pass, remaining issues are unrelated or explicitly scoped.

Do not stop because the first patch compiled, or loop to satisfy ceremony after meaningful risk is closed.

## Blocked Language

- `Runtime proof blocked: no runnable URL was available; source/static inspection only.`
- `Visual proof blocked: browser capture could not run; layout and fit remain unverified.`
- `State proof scoped: loading and error were inspected; permission and slow-network require missing fixtures.`
- `Performance claim limited: broad work was removed in source, but no before/after runtime trace exists.`
- `Gesture proof limited: pointer capture and velocity logic exist in source, but no touch or slowed runtime capture was available.`

Never upgrade these statements to `verified`, `complete`, `excellent`, or `production-ready`.

## Final Gate

- Production integrity: pass? Required state or runtime remains?
- Task effectiveness: human comprehension/task smoke test?
- Distinctiveness: grounded category default or competent baseline, not a stereotype for easy victory?
- What visibly improved?
- Which killed default stayed dead?
- Signature move survive desktop and narrow/mobile?
- Main path, one meaningful edge/recovery state pass?
- Context-specific costly moment pass, every bounded hybrid region keep its own interaction rules?
- Finish ledger: alignment, spacing rhythm, overflow/scrollbars, gradients, icons/vector craft, capture legibility?
- Evidence for each claim?
- What remains unverified?

If those answers are vague, the work is not ready. Interface may be finished; evidence is not.
