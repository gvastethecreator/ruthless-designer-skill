# Production Hardening

Load only when implementing a product surface or making a `production-ready` claim. Conditional on the product's real failure modes — not ceremony on a static concept.

## Preserve User Agency

Keep browser zoom enabled. Test primary path at 200% and text-only zoom where platform supports it; reflow controls instead of clipping, hiding, or freezing the viewport. Never use `user-scalable=no` to disguise layout that cannot survive enlargement.

Modals and drawers: focus a meaningful initial target, trap while modal, close on the documented escape path, return focus to the opener. Nonmodal/informational popovers: move focus only when users must work inside; otherwise keep it on the trigger. Never trap a nonmodal surface. If return target disappears, choose nearest logical destination. Do not dump focus onto `body` and call the keyboard journey complete.

## Make Writes Truthful

Server validation and authorization are final. Client validation may explain earlier; it must not invent acceptance. Map field errors to controls; form-level recovery message for non-field failures; preserve input; focus first actionable error only after submission.

Identity, credentials, recovery, permissions, billing, or destructive settings follow the application's threat model — successful form submit is not security. CSRF defense for cookie-backed writes; step-up or reauthentication; session rotation/invalidation; audit trail. Test unauthorized, expired-session, replay, and cross-origin paths the architecture can actually receive.

Optimistic updates only when reversible and temporary state is unmistakable: keep previous value, expose pending without blocking unrelated work, reconcile with returned server record, roll back on rejection. Explain failure; provide retry or repair. Never leave an optimistic lie on screen because the toast timed out.

Abort obsolete reads when route, query, or component ownership changes. Ignore late responses with request IDs, sequence numbers, versions, or cancellation signals; arrival order is not truth. Concurrent writes: server versions, ETags, mutation IDs, or equivalent conflict contract. Stable idempotency key across retries when repeating a side effect could duplicate it. Surface conflicts with user work preserved — never silently last-write-wins.

Same record in multiple tabs: define synchronization. `BroadcastChannel`, storage events, server subscriptions, or refresh-on-focus as the product warrants. Announce remote changes; merge only when semantics are safe; conscious resolution when not. Test tab A editing while tab B saves, logs out, deletes, or changes permissions.

## Survive Real Devices And Media

Primary controls outside unsafe viewport edges with `env(safe-area-inset-*)`. `touch-action` preserves intended pan, pinch, and gesture ownership; do not disable browser behavior globally to rescue one drag target. Contain scroll only where a nested surface truly owns it with `overscroll-behavior`; then check keyboard, trackpad, touch, pull-to-refresh consequences. A drawer that traps the page but leaks momentum behind itself is unfinished.

Reserve media dimensions to prevent layout shift. Prioritize the actual above-the-fold hero or decision-critical image with the platform's fetch/preload mechanism; lazy-load offscreen media; do not preload a gallery. Responsive sources, meaningful crops, decoding behavior, alt text, visible failure fallback. Measure the shipped format and route, not the pristine source file.

## Localize Without Hydration Theater

Dates, time zones, numbers, currency, units, plural rules, lists: `Intl` or the framework's locale layer. Store machine values separately from display strings. Authority and precedence among route, profile, cookie, request headers, and device time zone; persist a user change so the next server render and hydration agree. Test expansion, RTL when supported, non-Latin input, calendar/time-zone boundaries, and a locale whose punctuation differs. `translate="no"` only for identifiers, code, product names, or user data that must remain literal.

Server and client output must be deterministic. Pass locale, time zone, random seeds, IDs, and initial data explicitly so hydration does not repair a different first render. Controlled or uncontrolled inputs chosen intentionally; do not switch modes after mount. If client-only data must differ, render a stable placeholder and replace it without losing focus or meaning.

## Degrade On Purpose

Gate browser APIs, storage, observers, codecs, WebGL, clipboard, share, and experimental CSS behind feature detection and failure handling. Smallest honest fallback: static image for a failed canvas, ordinary upload for missing drag-and-drop, copyable text for failed clipboard, polling for unavailable live updates, or a clear unsupported-state route when the core task cannot continue.

Test fallbacks by forcing the capability off, not by reading the branch. Production claim passes only when every applicable failure mode from the read has evidence. At minimum: primary success path, highest-risk rejection or recovery, relevant focus/viewport/capability behavior. Applicable but unexercised risk → blocked; do not manufacture exclusions for concurrency, localization, media, or unused APIs.
