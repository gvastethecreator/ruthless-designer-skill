# Production Hardening

Load this route only when implementing a product surface or making a `production-ready` claim. Treat every item as conditional on the product's real failure modes. Do not drag this checklist into a static concept and pretend ceremony is reliability.

## Preserve User Agency

Keep browser zoom enabled. Test the primary path at 200% and text-only zoom where the platform supports it; reflow controls instead of clipping, hiding, or freezing the viewport. Never use `user-scalable=no` to disguise a layout that cannot survive enlargement.

For modal dialogs and drawers, move focus to a meaningful initial target, trap it while the surface is modal, close on the documented escape path, and return focus to the control that opened it. For nonmodal or informational popovers, move focus only when the interaction pattern requires users to work inside them; otherwise preserve focus on the trigger. Never trap a nonmodal surface. If the return target disappears, choose the nearest logical destination. Do not dump focus onto `body` and call the keyboard journey complete.

## Make Writes Truthful

Treat server validation and authorization as final. Client validation may explain earlier; it must not invent acceptance. Map field errors to their controls, keep a form-level recovery message for non-field failures, preserve the user's input, and focus the first actionable error only after submission.

When settings affect identity, credentials, recovery, permissions, billing, or destructive state, follow the application's threat model instead of treating a successful form submit as security. Apply the relevant CSRF defense for cookie-backed writes, step-up or reauthentication, session rotation/invalidation, and audit trail. Test unauthorized, expired-session, replay, and cross-origin paths that the architecture can actually receive.

Use optimistic updates only when the action is reversible and the temporary state is unmistakable. Keep the previous value, expose pending state without blocking unrelated work, reconcile with the returned server record, and roll back on rejection. Explain what failed and provide a retry or repair path. Never leave an optimistic lie on screen because the toast timed out.

Abort obsolete reads when route, query, or component ownership changes. Ignore late responses with request IDs, sequence numbers, versions, or cancellation signals; arrival order is not truth. For concurrent writes, use server versions, ETags, mutation IDs, or an equivalent conflict contract. Reuse a stable idempotency key across retries when repeating a side effect could duplicate it. Surface conflicts with the user's work preserved instead of silently letting last-write-wins eat it.

If the same record can be open in multiple tabs, define synchronization deliberately. Use `BroadcastChannel`, storage events, server subscriptions, or refresh-on-focus as the product warrants. Announce remote changes, merge only when semantics are safe, and require a conscious resolution when they are not. Test tab A editing while tab B saves, logs out, deletes, or changes permissions.

## Survive Real Devices And Media

Keep primary controls outside unsafe viewport edges with `env(safe-area-inset-*)`. Use `touch-action` to preserve intended pan, pinch, and gesture ownership; do not disable browser behavior globally to rescue one drag target. Contain scroll only where a nested surface truly owns it with `overscroll-behavior`, then verify keyboard, trackpad, touch, and pull-to-refresh consequences. A drawer that traps the page but leaks momentum behind itself is unfinished.

Reserve media dimensions to prevent layout shift. Prioritize the actual above-the-fold hero or decision-critical image with the platform's fetch/preload mechanism; lazy-load offscreen media and do not preload a gallery. Supply responsive sources, meaningful crops, decoding behavior, alt text, and a visible failure fallback. Measure the shipped format and route, not the pristine source file.

## Localize Without Hydration Theater

Format dates, time zones, numbers, currency, units, plural rules, and lists with `Intl` or the framework's locale layer. Store machine values separately from display strings. Define the authority and precedence among route, profile, cookie, request headers, and device time zone; persist a user change so the next server render and hydration agree. Test expansion, RTL when supported, non-Latin input, calendar/time-zone boundaries, and a locale whose punctuation differs. Use `translate="no"` only for identifiers, code, product names, or user data that must remain literal.

Make server and client output deterministic. Pass locale, time zone, random seeds, IDs, and initial data explicitly so hydration does not repair a different first render. Choose controlled or uncontrolled inputs intentionally; do not switch modes after mount. If client-only data must differ, render a stable placeholder and replace it without losing focus or meaning.

## Degrade On Purpose

Detect capabilities before using them. Gate browser APIs, storage, observers, codecs, WebGL, clipboard, share, and experimental CSS behind feature detection and failure handling. Provide the smallest honest fallback: static image for a failed canvas, ordinary upload for missing drag-and-drop, copyable text for failed clipboard, polling for unavailable live updates, or a clear unsupported-state route when the core task truly cannot continue.

Test fallbacks by forcing the capability off, not by reading the branch and feeling reassured. A production claim passes only when every applicable failure mode identified during the read has evidence. At minimum prove the primary success path, the highest-risk rejection or recovery path, and the relevant focus, viewport, and capability behavior. Mark an applicable but unexercised risk as blocked; do not manufacture exclusions for concurrency, localization, media, or APIs the surface does not use.
