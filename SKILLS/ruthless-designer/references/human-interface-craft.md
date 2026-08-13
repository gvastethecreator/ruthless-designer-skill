# Human Interface Craft

Use this route when the work creates or redesigns flows that interrupt, ask for trust, teach, search, confirm, or must survive large text. Every rule here is `practice`. Do not use it to costume a web product as iOS.

The conceptual sources are Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) and [Principles of great design (WWDC26)](https://developer.apple.com/videos/play/wwdc2026/250/). This file restates transferable tests in original prose. It copies no HIG text, SF metrics, system colors, or material specs. If the brief wants Apple-feel motion and materials, use the platform skill.

## Anti-Costume

Familiarity is interaction grammar. Distinction is the artifact, composition, voice, and data. A restyled checkbox is not a signature move. Kill it.

Do not default to SF Pro, SF Symbols, a five-item tab bar, Liquid Glass, or iOS Settings chrome. If a competitor could ship the shell after a logo swap, the direction is still generic. Pretty glass does not change that.

These tests do not override the product's type, icons, density, or component library.

## Principle Tests

Run the tests in CHOOSE before decorating. A failed test changes the direction card, not the palette.

| Test | Direction fails when | Better move |
|---|---|---|
| Purpose | The first screen inventories features instead of serving one job | Cut until the current task, object, or decision owns the viewport |
| Agency | Onboarding, paywall, or setup is the only door, and mistakes have no undo | Open the product. Add undo. Confirm only the irreversible |
| Responsibility | Permissions or personal data are demanded at launch, or generated output can cause unreviewed harm | Ask inside the feature. Keep denied states usable. Gate high-risk AI |
| Familiarity | Standard controls are reinvented so the surface looks authored | Keep expected behavior and placement. Put authorship in the artifact |
| Flexibility | The layout assumes default type, one pointer, and one locale | Reflow at large text. Support the real inputs |
| Simplicity | Chrome was hidden to look minimal, or a decision lacks its deciding fact | Reveal the next action. Add the missing context |
| Craft | The signature is a catalog of materials and motion | Finish alignment, states, and feedback first |
| Delight | Confetti, bounce, or a mascot is the personality | Name the target emotion. Earn it through the path |

## Chrome Versus Content

Design two jobs, not one frosted surface.

- Chrome (nav, toolbars, persistent controls) is a functional layer. It stays quieter than the current object and does not carry the brand show.
- Content holds the artifact, media, proof, and expression. Brand color belongs here and in the actions that need it.
- Use translucent chrome only when the same spatial object stays visible behind it and type stays legible. Honor reduced transparency with a solid fallback.
- Do not spread glass recipes across cards, tables, marketing modules, or empty states.

## Interaction Grammar

When the work includes apps, settings, onboarding, search, or interruption:

- Pick the least modal pattern that still protects the task: inline → popover/menu → sheet/drawer → modal → alert.
- Reserve alerts for critical decisions. Never for validation, emptiness, or upsell.
- Destructive copy names the object, the consequence, and the reversibility. If the mistake is recoverable, give undo. If not, confirm.
- If search is a primary way in, give it one obvious home, real recents, and a no-results state with reset.
- If duration is known, show determinate progress. If not, use a local spinner. Do not block the whole product to look busy.
- Make onboarding skippable and teach with the first real action. Do not replay it. Postpone setup that is not required to start.

The signature move must survive with ordinary product controls. If removing the custom chrome removes the idea, there was no idea.

## Large Text And Display Settings

Large text is a composition constraint, not an accessibility footnote.

- Build roles that reflow. Stack icon-plus-label rows and drop optional columns before truncating names, errors, or primary actions.
- Prove the largest supported text size or 200% zoom on the first meaningful screen.
- If the direction claims light, dark, or high-contrast modes, design a variant for each. Do not choose a material by the tint it casts.

## Permissions And First Trust

Do not open the product with a permission wall unless the feature is the product.

- Ask when the user starts the camera, location, notifications, or clipboard feature.
- Write the purpose copy as one active sentence: what and why. Reject "for a better experience."
- If a pre-prompt is required, give it one Continue control that opens the real prompt. No fake Allow, no hostage Skip.
- Design the denied state: name the blocked action and the recovery. The rest of the product stays usable.

## Inclusion

- UI copy addresses `you` when the voice allows it. Do not narrate "the user."
- Omit gender unless the product needs it. When it does, give inclusive choices.
- Use people-first language for disability. No disability-as-insult metaphors.
- Kill culture-specific jokes, idioms, and security questions that assume a shared childhood.
- When people are shown, show a range. Occupational and family stereotypes are costume.
- Keep a non-color cue for status. Color meaning is not universal.

Load [language-and-authorship.md](language-and-authorship.md) for writing patterns. Load [product-surfaces.md](product-surfaces.md) for forms, semantics, and production states.

## Proof

A creation or redesign claim that uses this route must exercise the costly state:

- first-run skipped, and absent on a later launch;
- permission denied;
- large text or 200% zoom on the primary screen;
- destructive confirm, and undo if undo is promised;
- search no-results;
- reduced transparency on any frosted chrome.

Unexercised patterns stay `unknown`. This file is not a standard and not a license to clone Apple chrome.

## Sources

Linked as `practice`, not copied. Last verified 2026-08-12: [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines), [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion), [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy), [Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding), [Searching](https://developer.apple.com/design/human-interface-guidelines/searching), [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators), and [Principles of great design (WWDC26)](https://developer.apple.com/videos/play/wwdc2026/250/).

Apple materials are not bundled or relicensed. Concepts were transformed into agent tests. No HIG prose, tables, or visual specs were copied.
