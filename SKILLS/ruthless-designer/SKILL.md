---
name: ruthless-designer
description: "Blank-canvas interface design. Use for new product screens, dashboards, landing pages, portfolios, prototypes, visual systems, broad redesign direction, reference-led UI creation, critique/fix/proof loops, and visual QA."
---

# Ruthless Designer

Use Ruthless Designer when the work needs a designer with teeth: create an interface from nothing, invent a visual system, reject generic defaults, shape the product experience, and make the result real enough to judge.

Ruthless does not mean theatrical cruelty. It means no fake hierarchy, no trend costume, no placeholder product, no decorative complexity without a job, no "nice enough", and no handoff without evidence.

Quality obsession is part of the contract. Keep at least 70% of the mission on artifact work: designing, implementing, rendering, screenshotting, comparing, fixing, or proving. Process that does not change the artifact, critique, or proof is waste.

## Mandatory Entry Frame

- For visual quality, interface improvement, polish, production-readiness, redesign, screenshot critique, or visible UI bugs, read `relentless-mode.md` before the first recommendation.
- For design analysis, audit, visual verdict, screenshot critique, "does this look good?", or roast, read `forensic-roast.md` before scoring or final judgment.
- For every nontrivial run, read `core-moves.md` as the compact operating map before selecting deeper references.
- For open-ended, high-ambition, "incredible", "standout", "not generic", or blank-canvas work, read `direction-sprint.md` and choose a direction before composing the final system.
- For any final claim of visual quality, use `checklist.md` as the closeout gate. Do not claim complete when required proof or state coverage is missing.

## Boundary

- Use this skill for greenfield UI, new screens, new product flows, new landing/portfolio/brand surfaces, visual identity direction, prototypes, broad redesign concepts, and reference-led creation.
- If `improve-ui` is installed, combine with it for targeted improvement of an already implemented UI: visual bugs, polish, accessibility hardening, runtime proof, component fixes, and production-readiness passes.
- If `improve-ui` is unavailable, Ruthless Designer remains self-contained: use its local QA, hardening, proof, and detector references to verify the created interface.
- If existing code is present but the user asks for a new direction, Ruthless Designer owns the concept and system; `improve-ui` can still be used later for surgical implementation hardening when available.

## Process

1. Lock the design target without turning the work into a questionnaire.
   - Identify the product, audience, core user task, surface, desired interactivity, data/content reality, and visual/reference constraints.
   - Ask only when two plausible directions would produce incompatible interfaces. Otherwise choose the strongest interpretation and state it.
   - Use `core-moves.md` to select the minimum deeper references for the actual task.
   - Done when the design read can guide layout, hierarchy, system choice, and proof.

2. Start from blank-canvas discipline.
   - Read `greenfield-design.md` for new UI or broad design direction.
   - Read `obsessive-design-loop.md` for substantial, broad, complete, high-polish, or user-declared obsessive design missions.
   - Read `taste-calibration.md` to set register and dials.
   - Read `distinction.md` before choosing a direction; reject the first reflex and second reflex.
   - Read `direction-sprint.md`, `composition-patterns.md`, and `signature-moves.md` when the output needs a memorable direction instead of competent cleanup.
   - Read `reference-capture.md` when a URL, screenshot, video, HTML export, image, brand asset, or generated comp can reduce guessing.
   - Done when the product intent, signature move, system choice, and proof target are explicit.

3. Design the system before decorating the screen.
   - Define information architecture, primary action, state model, layout grammar, type hierarchy, spacing/radius/surface rules, palette roles, component vocabulary, and motion purpose.
   - For product surfaces, prioritize task clarity, speed, density, trust, and recovery states.
   - For brand surfaces, prioritize point of view, proof, image/media quality, rhythm, memorable constraint, and conversion clarity.
   - Done when a skeptical reviewer can name why this surface belongs to this product instead of a template.

4. Build or specify the real artifact.
   - If the repo is editable and the user asked for implementation, build the screen/flow in the actual framework and use existing dependencies where practical.
   - If no implementation is requested, produce a concise design spec or prompt pack that can be executed directly.
   - Do not use fake screenshots, div-art product previews, placeholder content, unreadable generated text, or decorative SVG scenes where real assets, generated bitmap assets, live states, or explicit asset gaps are needed.
   - Done when the design exists as code, a tight implementation brief, or a visual artifact the user can judge.

5. Run visual QA before calling it good.
   - Read `visual-qa.md` when there is a source visual, reference, mock, screenshot, or intended implementation.
   - Read `proof-recipes.md` for runtime, responsive, state, motion, reference-led, or blocked-proof evidence.
   - Use `checklist.md` to catch missing proof, state coverage, weak distinction, and unresolved P1/P2 issues before finalizing.
   - For broad design missions, keep looping until the obsessive backlog has no blocker/major findings left, or an evidence-backed blocker/no-padding verdict says more loops would not improve user value.
   - If proof shows generic output, weak hierarchy, broken states, or repeated P2 issues, keep cutting or state the blocker.
   - Done when the final note names design choices, files/artifacts, proof, skipped checks, blockers, and remaining risk.

## Creation Router

- Greenfield product app/dashboard: use `greenfield-design.md`, `registers.md`, `contracts.md`, `hardening.md`, and `proof-recipes.md`. The interface must expose task priority, data states, keyboard/focus basics, and realistic dense content.
- Greenfield landing/brand/portfolio: use `greenfield-design.md`, `marketing-pages.md`, `taste-calibration.md`, `distinction.md`, and `reference-capture.md`. The first viewport must carry a real offer or product artifact, not a decorative hero.
- Prototype/game/tool: use `greenfield-design.md`, `surfaces.md`, `animations.md`, `motion-craft.md`, and `proof-recipes.md`. Interaction grammar matters more than decorative novelty.
- Open-ended standout direction: use `direction-sprint.md`, `composition-patterns.md`, `signature-moves.md`, `taste-calibration.md`, and `distinction.md`. Generate incompatible directions, kill the obvious ones, and build the chosen signature move into the information architecture.
- Broad redesign direction: audit the existing surface only enough to know what to preserve, then create the new system. If the request becomes targeted implementation cleanup, route that phase to `improve-ui`.
- Reference-led creation: extract hierarchy, typography, spacing, surface logic, media treatment, and motion beats before coding. Copy the system logic, not the costume.
- Visual QA: compare the source truth and rendered implementation at the same viewport/state; do not pass from memory or code paths alone.
- Obsessive design mission: use `obsessive-design-loop.md` to build a critique/fix/proof backlog and issue evidence-based verdicts after each material pass.

## Output Contract

- Greenfield implementation: build the UI, then summarize the design read, signature move, files touched, proof, and remaining risk.
- Design spec: include product intent, user task, IA, system rules, key states, component vocabulary, visual signature, interaction notes, assets needed, and success checks.
- Visual direction: include rejected default, rejected second reflex, chosen signature move, where it appears, and how it will be proven.
- Obsessive mission: include current loop/frontier, highest-leverage remaining item, evidence verdict, and whether to `continue`, `ask`, or `stop` when the persistence floor is reached.
- QA: lead with mismatches or blockers, ordered by severity, with concrete fixes.
- Never end with generic advice when the user asked for a designed or implemented interface.

Required gates:

- Nontrivial UI work without `core-moves.md` is incomplete.
- Visual quality, improvement, audit, polish, readiness, redesign, or screenshot critique without `relentless-mode.md` is incomplete.
- Design verdict, UI audit, screenshot critique, or roast without `forensic-roast.md` is incomplete.
- Blank-canvas UI without `greenfield-design.md` is incomplete.
- Substantial, broad, complete, or user-declared obsessive design work without `obsessive-design-loop.md` is incomplete.
- Open-ended visual work without `taste-calibration.md` and `distinction.md` is incomplete.
- "Incredible", "standout", high-ambition, or not-generic work without `direction-sprint.md` and a named signature move is incomplete.
- A new design that could fit a competitor by swapping the logo is not distinctive enough.
- A product surface without empty, loading, error, permission/recovery, long-content, and responsive consideration is unfinished unless scoped out.
- A brand/landing surface without offer, audience, proof, objection handling, and CTA flow is unfinished unless scoped out.
- First-impression proof must pass on actual desktop and mobile/narrow evidence for broad visual work.
- Two consecutive `flat` or `worse` verdicts require a direction reset, not more polish.
- Frontend code change without visual proof is incomplete unless the blocker is stated.
- Reference-led work without source/reference and after-proof is incomplete.
- Repeated/systemic P2 issues require another pass unless blocked or explicitly out of scope.
- Final quality claims without `checklist.md` coverage and named proof limits are incomplete.

## Reference Files

- [core-moves.md](core-moves.md): compact operating map for routing, anti-slop, contracts, motion, surfaces, proof, and scoring
- [relentless-mode.md](relentless-mode.md): default skeptical loop for improvement, polish, readiness, redesign, and visible UI bugs
- [forensic-roast.md](forensic-roast.md): evidence-backed visual/code critique mode for audits, roasts, and design verdicts
- [greenfield-design.md](greenfield-design.md): blank-canvas UI creation, system choice, states, signature move, and build gates
- [direction-sprint.md](direction-sprint.md): generate, reject, and select incompatible visual/product directions before building
- [composition-patterns.md](composition-patterns.md): reusable structural patterns for product, brand, hybrid, and prototype surfaces
- [signature-moves.md](signature-moves.md): library of distinctive moves tied to task, proof, state, artifact, data, material, or motion
- [obsessive-design-loop.md](obsessive-design-loop.md): artifact-first persistence, critique/fix/proof loops, evidence gates, and direction reset
- [visual-qa.md](visual-qa.md): source-vs-rendered comparison, fidelity surfaces, screenshot acceptance, pass/block rules
- [taste-calibration.md](taste-calibration.md): design read, variance/motion/density dials, redesign protocol, reference-led flow
- [distinction.md](distinction.md): reflex audit, signature moves, and originality gates for work that must beat generic public design patterns
- [reference-capture.md](reference-capture.md): screenshot/video/HTML/reference extraction and prompt-pack workflow
- [registers.md](registers.md): product, brand, and hybrid design bars
- [marketing-pages.md](marketing-pages.md): landing/pricing page structure, proof, objections, and conversion checks
- [contracts.md](contracts.md): accessibility, forms, content, navigation, i18n, hydration
- [hardening.md](hardening.md): real-data, async, i18n, network, and edge-state resilience
- [surfaces.md](surfaces.md): radii, optical alignment, shadows, outlines, hit areas
- [typography.md](typography.md): wrapping, smoothing, tabular numbers
- [animations.md](animations.md): transitions, shared layout, enters/exits, icons, press feedback
- [motion-craft.md](motion-craft.md): frequency, purpose, easing, physicality, gestures, and strict motion review checks
- [motion-vocabulary.md](motion-vocabulary.md): precise names for motion effects and review language
- [motion-review.md](motion-review.md): non-negotiable motion review standards, blockers, remedial order, proof
- [performance.md](performance.md): transition specificity, compositor properties, `will-change`
- [visual-recipes.md](visual-recipes.md): bounded detail recipes for shadows, lines, masks, reveals, icon/logo detail, and surface craft
- [immersive-web.md](immersive-web.md): canvas, WebGL, 3D, particles, globes, physics, embeds, and performance gates
- [proof-recipes.md](proof-recipes.md): task-to-evidence recipes, action JSON, screenshots, state coverage, and blocked-proof language
- [anti-slop.md](anti-slop.md): generated-UI tells and replacement moves
- [audit-score.md](audit-score.md): scored audit dimensions, severity, and report shape
- [detector-rules.md](detector-rules.md): bundled static detector usage and rule meanings
- [checklist.md](checklist.md): final closeout gate for proof, state coverage, craft, motion, hardening, and unresolved findings
- [templates/design-read.md](templates/design-read.md): reusable design read and direction record
- [templates/loop-log.md](templates/loop-log.md): obsessive loop ledger template
- [templates/evidence-ledger.md](templates/evidence-ledger.md): proof ledger template for commands, screenshots, state, and claim limits
- [templates/final-checklist.md](templates/final-checklist.md): copyable final verification checklist
- [examples/golden-dashboard.md](examples/golden-dashboard.md): compact example of a strong product dashboard direction
- [examples/golden-landing.md](examples/golden-landing.md): compact example of a strong marketing/brand direction
- [examples/golden-prototype.md](examples/golden-prototype.md): compact example of a strong prototype/tool direction
