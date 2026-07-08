# Visual QA

Use this before approving a reference-led design, greenfield implementation, redesign direction, or source-to-code build.

The goal is to compare the intended visual truth against the rendered or proposed result. Memory, taste, and code paths alone do not pass.

## Required Evidence

Identify both sides:

- Source truth: Figma frame, image, screenshot, mockup, URL capture, generated comp, brand/reference image, or written design system.
- Implementation/result: local URL, deployed URL, screenshot, component render, generated image, or code-rendered state.

Match the same viewport, state, theme, route, content, auth state, and device density before judging. If they do not match, call that out first and avoid fake precision.

For greenfield work without a single source mock, compare against the accepted design read, reference/horizon, competent default, or baseline. The result still needs a side-by-side or before/after proof target; blank-canvas does not mean proof-free.

## Screenshot Acceptance

Reject evidence when it shows:

- wrong route or wrong window
- loading, blank, blocked, cropped, or half-rendered state
- different viewport or content from the source truth
- unreadable text where typography, spacing, or copy fidelity matters
- source and result viewed separately when side-by-side comparison is needed

Save or name accepted evidence paths when available.

## Compare These Surfaces

Every QA pass must explicitly check:

- Typography: family, fallback, weight, size, line height, wrapping, truncation, optical weight, and whether display/UI text is using the right voice.
- Spacing and layout rhythm: frame, crop, margins, padding, grid, alignment, section gaps, component spacing, radius, shadows, and vertical rhythm.
- Colors and tokens: palette roles, semantic colors, contrast, opacity, gradients, foreground/background balance, and whether tokens map to intent.
- Images and assets: subject correctness, crop, sharpness, compression, masking, transparency edges, icon fidelity, logo/product/media quality, and whether fake code-native art replaced real assets.
- Copy and content: app-specific text, labels, CTAs, proof, product claims, empty/error copy, and whether copy leaks prompt language instead of product language.

When details are too small in a full screenshot, inspect focused regions.

## Severity

- `P0`: blocks core use, breaks the main visual/content state, severe accessibility issue, or impossible task.
- `P1`: major mismatch, broken hierarchy, missing asset, wrong component, or usability regression users will notice.
- `P2`: visible drift, generic fallback, inconsistent state, responsive issue, or fixable polish gap.
- `P3`: small refinement that improves quality but does not block acceptance.

## Ruthless Pass Rules

- Do not pass a result that still looks like a generic template after the distinction pass.
- Do not pass if the main visual asset is fake, missing, cropped badly, or replaced with CSS/div art when the user needs a real product/place/object/state.
- Do not pass if source typography, spacing, or hierarchy was not actually compared.
- Do not pass if the five-second read fails: what this is, what to do, or why it is not a default template.
- Do not pass if mobile or narrow layout breaks the main promise.
- Do not pass from a full-view screenshot alone when important details are unreadable.
- Do not call an implementation "as good as the mock" until required fidelity surfaces are checked and differences are classified as acceptable, expected, or still actionable.

## Output Shape

Use this compact shape:

```markdown
**Findings**
- [P1] Short issue title
  Evidence: source does X, result does Y.
  Impact: why it matters.
  Fix: concrete change.

**Open Questions**
- Intentional deviations, unavailable states, or missing artifacts.

**Pass/Block**
- passed/blocked, with the exact reason.
```

Use `passed` only when no actionable P0/P1/P2 findings remain. Use `blocked` when actionable P0/P1/P2 findings remain, or when required evidence is unavailable.

## Done

- Source truth and result were both inspected.
- Viewport/state mismatch is resolved or named.
- Required fidelity surfaces were checked.
- Findings are fix-oriented and ordered by severity.
- Final result is `passed` or `blocked`, not "looks good".
