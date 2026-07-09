# Greenfield Design

Use this when the user asks for a new interface, new screen, new landing page, new product flow, prototype, visual system, or broad design direction from little or no existing UI.

The job is not to decorate a blank page. The job is to make the product's purpose, task, evidence, and point of view impossible to miss.

## Ruthless Brief

Lock only the context that changes the design:

- Product: what exists, who uses it, and what the screen must help them do.
- Surface: app screen, dashboard, landing page, portfolio, commerce, editor, game/tool, component, or flow.
- Core task: the one action or decision the user must understand first.
- Audience pressure: repeated operator, buyer, developer, designer, recruiter, consumer, player, regulated user, or mixed.
- Interactivity: static mock, clickable prototype, or production implementation.
- Source truth: existing code, design system, brand asset, screenshot, URL, reference, dataset, copy, or explicit absence.
- Constraints: accessibility, density, device targets, localization, performance, SEO/legal, available assets, and framework/dependencies.

Ask one question only when missing context would split the design into incompatible products. Otherwise choose the strongest interpretation and state the assumption.

## Blank-Canvas Order

1. Name the product intent.
2. Name the main user task.
3. Name the hierarchy: what should be loud, quiet, hidden, or delayed.
4. Choose the register: product, brand, or hybrid.
5. Set the dials from `taste-calibration.md`.
6. Reject the first reflex and second reflex from `distinction.md`.
7. For open-ended or high-ambition work, run `direction-sprint.md` before committing to a direction.
8. Choose one signature move from `signature-moves.md` or define a custom one tied to product use, proof, content, data, material, motion, or comparison.
9. Pick a composition pattern from `composition-patterns.md` only when it sharpens the task or proof.
10. Define the system: layout grid, type roles, spacing rhythm, surface model, palette roles, components, states, and motion grammar.
11. Build the core path before edge decoration.
12. For complete or ambitious work, enter the loop in `obsessive-design-loop.md`.
13. Prove the rendered result or clearly mark proof blocked.

## What Makes It Ruthless

- The first viewport or first screen must answer what this is and what matters now.
- The layout must organize a decision, not display a feature inventory.
- Empty, loading, error, permission/recovery, onboarding, and long-content states are design material, not leftovers.
- A page that needs visual assets must use real, generated bitmap, or explicitly missing assets. Do not fake product media with div art.
- A brand surface must have a memorable constraint. "Premium", "modern", and "clean" are not constraints.
- A product surface must earn every expressive move through task clarity, faster comparison, stronger feedback, or better trust.
- A high-ambition surface must name the killed default, selected direction, signature move, and proof target before implementation gets decorative.
- If a design could fit a competitor after swapping the logo, cut again.

## System Choice

Existing product system wins when present. For greenfield:

- Use an official system when the domain clearly demands it: Fluent for Microsoft/enterprise Windows-like work, Carbon for IBM/analytics, Polaris for Shopify admin, Primer for GitHub/dev-community, USWDS/GOV.UK for public-sector, Material for Material-like products.
- Use a custom system when brand, game/tool, portfolio, editorial, or product specificity would be flattened by an official system.
- Do not mix design systems casually.
- Before adding a dependency, inspect the repo. Prefer existing primitives unless a new library materially improves the result.

## Required States

For product surfaces, design at least:

- default populated state
- empty/first-run state
- loading/pending state
- error/recovery state
- permission or unavailable state when relevant
- long-content/real-data stress state
- narrow viewport or mobile state

For brand/landing surfaces, design at least:

- first viewport with real offer/product/category signal
- proof or product artifact section
- objection or trust section
- conversion/CTA decision point
- mobile first viewport

## Anti-Fallback Rules

Reject:

- centered hero plus three generic feature cards as the default structure
- purple-blue gradient, beige premium, glass blur, terminal cosplay, or monochrome editorial as unearned style
- fake dashboards, fake metadata strips, placeholder brands, invented screenshots, and lorem-ish product claims
- icons in rounded tiles repeated above every heading
- scroll choreography that hides content or exists only to look expensive
- huge display copy that wraps into four or more lines on common laptops

Prefer:

- real product artifact, workflow state, dataset, place, material, or output sample
- comparison surfaces that help users judge
- asymmetric section roles instead of repeated card grids
- copy that names the real object, action, audience, and consequence
- one memorable constraint the product can own

## Done

- The design read, dials, rejected defaults, signature move, and system choice are explicit.
- Any open-ended direction sprint has a selected direction and rejected alternatives.
- The main path and relevant states are designed or intentionally scoped.
- The UI has a reason to look this way beyond category fashion.
- Implementation or spec is concrete enough to execute.
- Broad/complete work has an obsessive backlog or an explicit reason it is too small to need one.
- Desktop and mobile/narrow first-impression proof pass, or the blocker is named.
- Visual proof exists, or the blocker is named without pretending the design is verified.
