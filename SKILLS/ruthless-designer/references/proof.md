# Proof And Stop Gates

Use this route before any final claim about visual quality, fidelity, responsiveness, interaction, motion, accessibility, performance, or production readiness.

## Match Evidence To The Claim

Choose the smallest proof that could falsify the claim:

- Visual change: before/after at the same route, viewport, state, theme, content, and auth context.
- Reference-led build: source/reference and result side by side or in directly comparable crops.
- Product surface: desktop plus narrow/mobile, realistic dense content, and one meaningful empty/error/permission/recovery state.
- Brand surface: first viewport, early artifact/proof or deliberately staged reveal, the relevant conversion/entry/wayfinding decision, and mobile first viewport.
- Component/system: default, hover/focus/disabled, long text, narrow container, and one relevant edge state.
- Async/data UI: loading, refresh, empty, error, permission, long content, slow network, and rapid-click states that can really occur.
- Motion/gesture: trigger, pointer-down response, repeated/interrupted trigger, reduced motion, origin, duration/easing, slow drag, fast flick, reversal, and release outside bounds.
- Immersive runtime: visible render, foreground readability, mobile/static fallback, reduced motion, offscreen pause, cleanup path, and console/WebGL state.
- Static-only review: source and detector findings with runtime/visual proof explicitly blocked.
- Context-specific claim: use the [product context](product-contexts.md) card and prove the costly state, input, spatial, and update behavior that distinguishes this archetype from generic web UI.
- Material proposal/review: generate the synchronized dossier from [reporting.md](reporting.md), inspect the HTML itself at desktop and narrow widths, then ingest the Markdown independently and cross-check subjects, geometry, findings, proof states, and asset paths. The dossier packages evidence; it does not upgrade an unproven design claim.

More screenshots are not better when they prove nothing meaningful.

For atlases or repeated media, cover the complete small set or every crop class plus first, last, and edge cells. Record grid, ratio, mapping, crop/focal behavior, and a narrow fixture; fail stretching, bleed, subject loss, wrong mapping, blank tiles, or default-item-only proof.

## Judge Three Independent Claims

Do not collapse quality into one flattering score:

- `production integrity`: the artifact runs, survives required states/viewports, preserves data and contracts, and meets the applicable accessibility, performance, and resilience bar.
- `task effectiveness`: the intended audience can identify what matters, understand the offer or state, and complete the key decision or action without rescue.
- `distinctiveness`: the hierarchy, artifact, behavior, and visual system form a specific point of view instead of competent category paste.

Record `passed | limited | blocked` for each and state the evidence. A surface may be production-ready yet aesthetically timid. A spectacular direction may still be unsafe garbage. Do not let either borrow the other's grade.

Claims of human comprehension need at least one representative non-builder: ask what this is, what matters, and what comes next; record hesitation, errors, and task outcome. One person is only a smoke test. Without it, describe intended hierarchy, not proven comprehension.

## Accept Evidence Before Judging

Reject wrong route/window, mismatched context, blank/loading/blocked output, unreadable detail, cropped content, failed actions, `error` captures, runtime P0/P1, or blocked assessments. Wait for fonts, images, async content, and intended interaction state. A passing assertion cannot overrule failed visual/runtime evidence; repair or rerun it.

A screenshot captured is not a screenshot compared. Record whether evidence was:

- `observed`: the state loaded and was inspected.
- `captured`: an artifact exists.
- `compared`: source/before and result/after were evaluated against defined criteria.
- `passed`: no actionable in-scope blocker/major finding remains.

Do not skip from `captured` to `passed`; name viewport and state in the filename or ledger.

## Compare The Right Surfaces

Inspect:

- Hierarchy: first attention, primary task, CTA, warning dominance, and artifact visibility.
- Typography: family/fallback, weight, scale, line height, wrapping, truncation, and product/brand voice.
- Layout: frame, crop, margins, grid, alignment, spacing rhythm, responsive structure, radius, edge, and elevation.
- Color: palette roles, semantic states, contrast, opacity, and foreground/background balance.
- Assets: subject, crop, sharpness, compression, masking, logo/icon fidelity, and fake-vs-real proof.
- Content: literal labels, actions, claims, sample data, empty/error copy, and prompt leakage.
- Interaction: affordance, focus, pending/disabled, recovery, interruption, and feedback.

Use focused crops or component inspection when a full-page image makes the relevant detail unreadable.

For final claims, complete the ledger. Use DPR `2+` for controls, icons, alignment, rows, or scrollbars; low-resolution evidence cannot prove unresolved detail.

For repeated geometry, attach the anchor map, gap or baseline deltas, and focused crop from [geometry-and-rhythm.md](geometry-and-rhythm.md). For material motion, attach the event map plus interruption, repeated-use, and reduced-mode evidence from [motion.md](motion.md). “Feels smoother” and “spacing improved” are not falsifiable claims.

## Evidence Ledger

Record:

```text
claim:
command or method:
artifact/path:
route + viewport + state:
finding support:
result: observed | captured | compared | passed | blocked
claim limit:
```

Every final claim must point to a screenshot, comparison, source line, test, command output, runtime metric, or explicit blocker.

## Severity And Verdict

- `P0`: blocks core use, data safety, or readable access.
- `P1`: major mismatch, broken hierarchy/core responsive path, missing critical asset/state, or strong usability/accessibility regression.
- `P2`: systemic generic pattern, visible drift, inconsistent state, or fixable resilience gap.
- `P3`: bounded refinement with low user impact.

Tag each finding with the claim it threatens. Use `passed` for a claim only when its required evidence ran and no unresolved issue material to that claim remains. Any P0/P1 blocks the affected claim. A bounded P2 may remain when its risk is explicit and accepted. In particular, a P2 for generic or under-ambitious aesthetics can fail `distinctiveness` without blocking `production integrity` or the literal `production-ready` claim. Never launder a task, accessibility, state, or trust failure as mere taste.

Use `blocked` when required evidence is unavailable or failed. Use `limited` when evidence exists but cannot support the full claim.

Do not assign a high score to an unobserved dimension. Mark it `unknown` or `blocked`. Absence of findings is not evidence of excellence.

## Continue, Reset, Stop

- Continue when proof exposes a major issue. Fix the highest user-damage cause and rerun the same evidence.
- Reset when two valid comparisons remain `flat` or `worse` because the same root cause survived; kill the failed structure and choose a new direction. Repair incomplete content, fixtures, or proof before blaming the direction.
- Stop when the requested bar is met, relevant states/viewports pass, and remaining issues are unrelated or explicitly scoped.

Do not stop because the first patch compiled. Do not keep looping to satisfy ceremony after meaningful risk is closed.

## Blocked Language

Use direct limits:

- `Runtime proof blocked: no runnable URL was available; source/static inspection only.`
- `Visual proof blocked: browser capture could not run; layout and fit remain unverified.`
- `State proof scoped: loading and error were inspected; permission and slow-network require missing fixtures.`
- `Performance claim limited: broad work was removed in source, but no before/after runtime trace exists.`
- `Gesture proof limited: pointer capture and velocity logic exist in source, but no touch or slowed runtime capture was available.`

Never upgrade these statements to `verified`, `complete`, `excellent`, or `production-ready`.

## Final Gate

Before stopping, answer:

- Did production integrity pass, and what required state or runtime remains?
- Did task effectiveness receive a human comprehension/task smoke test?
- Did distinctiveness survive comparison with a grounded category default or competent baseline, rather than a stereotype invented for easy victory?
- What visibly improved?
- Which killed default stayed dead?
- Did the signature move survive desktop and narrow/mobile?
- Did the main path and one meaningful edge/recovery state pass?
- Did the context-specific costly moment pass, and did every bounded hybrid region keep its own interaction rules?
- Did the finish ledger pass alignment, spacing rhythm, overflow/scrollbars, gradients, icons/vector craft, and capture legibility?
- What evidence supports each claim?
- What remains unverified?

If those answers are vague, the work is not ready. The interface may be finished; your evidence is not.
