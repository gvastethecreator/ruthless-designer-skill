# Human Interface Craft

Creates or redesigns flows that interrupt, ask for trust, teach, search, confirm, or must survive large text. Every rule is `practice`. Do not costume a web product as iOS.

Transferable tests from Apple's [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) and [Principles of great design (WWDC26)](https://developer.apple.com/videos/play/wwdc2026/250/). No copied HIG text, SF metrics, system colors, or material specs. Apple-feel motion and materials: use the platform skill.

## Anti-Costume

Familiarity is interaction grammar; distinction is artifact, composition, voice, and data. Restyled checkbox is not a signature move. Kill it.

Do not default to SF Pro, SF Symbols, a five-item tab bar, Liquid Glass, or iOS Settings chrome. If a competitor could ship the shell after a logo swap, still generic — pretty glass included.

Tests do not override product type, icons, density, or component library.

## Principle Tests

Run in CHOOSE before decorating. Failed test changes the direction card, not the palette.

| Test | Direction fails when | Better move |
|---|---|---|
| Purpose | First screen inventories features, not one job | Cut until task, object, or decision owns the viewport |
| Agency | Onboarding, paywall, or setup is the only door; mistakes have no undo | Open the product. Add undo. Confirm only irreversible |
| Responsibility | Permissions or personal data demanded at launch, or generated output can cause unreviewed harm | Ask inside the feature. Keep denied states usable. Gate high-risk AI |
| Familiarity | Standard controls reinvented so the surface looks authored | Keep expected behavior and placement. Put authorship in the artifact |
| Flexibility | Layout assumes default type, one pointer, one locale | Reflow at large text. Support real inputs |
| Simplicity | Chrome hidden to look minimal, or a decision lacks its deciding fact | Reveal next action. Add missing context |
| Craft | Signature is a catalog of materials and motion | Finish alignment, states, feedback first |
| Delight | Confetti, bounce, or a mascot is the personality | Name target emotion. Earn it through the path |

## Chrome Versus Content

Two jobs, not one frosted surface.

- Chrome (nav, toolbars, persistent controls): functional layer, quieter than current object, no brand show. Content holds artifact, media, proof, expression; brand color belongs here and in actions that need it.
- Translucent chrome only when the same spatial object stays visible behind it and type stays legible; honor reduced transparency with a solid fallback. Do not spread glass recipes across cards, tables, marketing modules, or empty states.

## Interaction Grammar

When work includes apps, settings, onboarding, search, or interruption:

- Least modal pattern that still protects the task: inline → popover/menu → sheet/drawer → modal → alert. Alerts for critical decisions only — never validation, emptiness, or upsell.
- Destructive copy names object, consequence, reversibility. Recoverable: undo. If not, confirm.
- Search as a primary way in: one obvious home, real recents, no-results with reset.
- Known duration: determinate progress. Unknown: local spinner. Do not block the product to look busy. Onboarding skippable; teach with first real action. Do not replay. Postpone setup not required to start.

Signature move must survive with ordinary product controls. If removing custom chrome removes the idea, there was no idea.

## Large Text And Display Settings

Composition constraint, not an accessibility footnote.

- Build roles that reflow. Stack icon-plus-label rows and drop optional columns before truncating names, errors, or primary actions. Prove largest supported text size or 200% zoom on first meaningful screen.
- If direction claims light, dark, or high-contrast modes, design a variant for each. Do not choose a material by the tint it casts.

## Permissions And First Trust

No permission wall at open unless the feature is the product.

- Ask when the user starts the camera, location, notifications, or clipboard feature. Purpose copy: one active sentence — what and why. Reject "for a better experience."
- Required pre-prompt: one Continue control that opens the real prompt. No fake Allow, no hostage Skip. Denied state: name the blocked action and recovery; rest of the product stays usable.

## Inclusion

- Address `you` when voice allows. Do not narrate "the user." Omit gender unless the product needs it; when it does, give inclusive choices.
- People-first language for disability. No disability-as-insult metaphors. Kill culture-specific jokes, idioms, and security questions that assume a shared childhood.
- When people are shown, show a range. Occupational and family stereotypes are costume. Non-color cue for status; color meaning is not universal.

Load [language-and-authorship.md](language-and-authorship.md) for writing patterns; [product-surfaces.md](product-surfaces.md) for forms, semantics, production states.

## Proof

Creation or redesign on this route must exercise the costly state:

- first-run skipped, absent on a later launch;
- permission denied;
- large text or 200% zoom on the primary screen;
- destructive confirm, and undo if undo is promised;
- search no-results;
- reduced transparency on any frosted chrome.

Unexercised patterns stay `unknown`. Not a standard or license to clone Apple chrome.

## Sources

Linked as `practice`, not copied. Last verified 2026-08-12: [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines), [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion), [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy), [Materials](https://developer.apple.com/design/human-interface-guidelines/materials), [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding), [Searching](https://developer.apple.com/design/human-interface-guidelines/searching), [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators), and [Principles of great design (WWDC26)](https://developer.apple.com/videos/play/wwdc2026/250/).

Apple materials not bundled or relicensed. Concepts transformed into agent tests; no HIG prose, tables, or visual specs copied.
