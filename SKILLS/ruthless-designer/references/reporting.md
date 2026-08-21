# Design Dossiers: Markdown + HTML

Material critique, screenshot review, design proposal, redesign proposal. One decision artifact, two synchronized views: ingestion-first Markdown for fast correction; standalone HTML for visual inspection. Both contain evidence, diagnosis, proposed moves, preservation contract, proof targets.

Skip for implementation note, routine status update, or code-only work with no visual proposal. Generate when the user must evaluate, approve, compare, hand off, continue the design later.

## Required Artifacts

- report-manifest.json: structured, reviewable source;
- report.md: deterministic, ingestion-first report with explicit evidence geometry;
- report-assets/: lossless local evidence referenced by report.md;
- report.html: standalone visual dossier with full-image overlays and annotation zooms.

Manifest is source of truth. Generate both views in one command; never hand-edit one report into a different conclusion.

Bundled generator:

~~~powershell
node SKILLS/ruthless-designer/scripts/generate-design-report.mjs --manifest output/ruthless-designer/<slug>/report-manifest.json --out output/ruthless-designer/<slug>/report.html --strict-assets
~~~

Derives `report.md` from `report.html`. `--markdown-out <path.md>` only when the caller needs another stable path.

Harness emits `report.md`, `report-assets/`, `report.html` beside `review.json` and compact `README.md`:

~~~powershell
node SKILLS/ruthless-designer/scripts/run-interface-review.mjs --path <frontend-path> --url <local-url> --out output/ruthless-designer/<slug> --detail-capture
~~~

Strict assets for final dossier. Draft mode may show an explicit evidence placeholder and warning when a capture is missing or corrupt. Never let a broken image icon masquerade as evidence.

Local PNG, JPEG, GIF, WebP, AVIF embed in HTML by default; copy byte-for-byte into `report-assets/` for Markdown. Markdown never receives a data URI. External image URLs fail in strict mode (non-portable); draft mode renders a sanitized evidence placeholder in both reports and never fetches them. no-embed-images affects HTML draft only; Markdown still gets local sidecar evidence. Disclose when HTML will break after moving away from linked files.

## Choose The Report Mode

- **critique**: dominant failure, severity-ranked causes, exact fixes, do-not-break contract, cuts, proof limits.
- **proposal**: context and decision, incompatible directions, select one, what it kills, assets/states/proof needed.
- **redesign**: before evidence, systemic diagnosis, selected direction, replacement system, migration moves, preservation contract, before/after proof plan.

Visual layout may stay forensic dossier; information order changes by mode. Do not invent three decorative templates.

## Manifest Contract

Version 1:

~~~json
{
  "version": 1,
  "language": "es-AR",
  "mode": "redesign",
  "title": "Operations command center",
  "eyebrow": "DESIGN CASE 017",
  "verdict": {
    "severity": "P1",
    "label": "Hierarchy failure",
    "summary": "The alert lane and ambient telemetry compete for the same attention."
  },
  "context": {
    "archetype": "operator cockpit",
    "userMode": "continuous monitoring under pressure",
    "primaryArtifact": "incident queue",
    "proofTarget": "triage at desktop and narrow viewport"
  },
  "summary": [
    "The redesign turns a card wall into a decision surface."
  ],
  "screenshots": [],
  "findings": [],
  "directions": [],
  "actions": [],
  "preserve": [],
  "proof": [],
  "risks": [],
  "limitations": [],
  "metadata": {
    "generated": "2026-07-16",
    "target": "local route"
  }
}
~~~

Text fields accept plain text, line breaks, not trusted HTML. Generator escapes titles, findings, labels, metadata, all other user-controlled content.

Language: BCP 47-style tag. English, Spanish have built-in report chrome; Spanish regional tags use Spanish labels. Other language: labels object overrides report chrome; values stay plain text. Dossier follows user's language.

### Verdict severities

blocker, P1, P2, P3, or info. Severity is dominant evidenced risk, not effort.

### Screenshots

~~~json
{
  "id": "before-default",
  "src": "screenshots/before-default.png",
  "alt": "Current command center with equal-weight panels",
  "label": "Before · default",
  "stage": "before",
  "caption": "Same authenticated fixture used for the redesign.",
  "state": "default",
  "viewport": "1280×800",
  "annotations": [
    {
      "x": 12.5,
      "y": 20,
      "width": 30,
      "height": 18,
      "subject": "Equal-weight incident cards",
      "label": "Repeated panels erase operational priority.",
      "tone": "error"
    },
    {
      "x": 80,
      "y": 12,
      "subject": "Detached action status",
      "label": "The visible status is separated from the action it governs.",
      "tone": "warning"
    }
  ]
}
~~~

Coordinates are percentages from the screenshot's top-left. Point: x, y. Box: width and height. Values 0–100; boxes stay inside the screenshot.

`stage` required: `before`, `reference`, `proposal`, `after`, or `detail`. Tones: error, warning, proposal, note. Proposal tone invalid on before/reference: annotate only what is visibly present; put the proposed move in directions/actions or on a proposal/after image.

`subject` is required: the literal element or region inside the marker (`Panel LIVE ALERTS`, `Row 04 · payment-core`, `Recovery button`). `label`: visible condition and why it matters. Numbered overlays render both in the matching legend. When image dimensions are available, each legend entry renders an automatic context-padded evidence zoom from the same coordinates and image source. Markdown records the same subject, tone, claim, normalized geometry.

### Annotation calibration

Do not estimate percentages from memory or a thumbnail. For each marker:

1. inspect the source image at native resolution; record pixel width and height;
2. identify the exact pixel rectangle or point containing the named subject;
3. convert with `x% = leftPx / imageWidth × 100`, `y% = topPx / imageHeight × 100`, and the equivalent formula for width/height;
4. generate the dossier; inspect full rendered screenshot, every automatic evidence zoom at readable scale;
5. read each legend item, trace its number back to the full image, cross-check matching Markdown geometry; fail if any view points to a different subject or the description claims anything not visible inside or immediately adjacent to it.

One marker, one literal subject. Split broad claims across focused crops or multiple markers. Box spanning unrelated panels is decorative geometry, not evidence.

### Findings

~~~json
{
  "id": "flat-priority",
  "severity": "P1",
  "title": "Every panel shouts at the same volume",
  "evidence": "Six first-viewport panels share surface, heading, and spacing treatment.",
  "damage": "Operators must read every region before identifying the next decision.",
  "cause": "The composition inventories widgets instead of modeling incident flow.",
  "solution": "Build one incident spine and move ambient metrics to a quiet rail.",
  "roast": "The command center is organized like a sticker collection.",
  "screenshotId": "before-default"
}
~~~

Major finding: evidence, damage, cause, exact solution. Roast optional; must be earned. screenshotId must reference a supplied screenshot.

### Directions

~~~json
{
  "name": "Incident spine",
  "status": "selected",
  "thesis": "One vertical decision sequence owns the first scan.",
  "signature": "Evidence is stitched directly into each escalation.",
  "why": "It matches the operator task and survives live updates."
}
~~~

Status: selected, rejected, explored. Directions must be incompatible at information architecture, composition, interaction. Palette-only variations are not directions.

### Actions

~~~json
{
  "priority": "01",
  "title": "Rebuild the first viewport around incident priority",
  "detail": "Replace the equal panel matrix with an incident spine and one telemetry rail.",
  "proof": "A five-second test identifies incident, owner, severity, and next action."
}
~~~

Order moves by user damage. Do not pad to fixed number.

### Proof ledger

~~~json
{
  "label": "Recovery state",
  "status": "blocked",
  "detail": "No recovery fixture was supplied.",
  "artifact": "actions-recovery.json"
}
~~~

passed, failed, blocked, n/a, unknown. Artifact may name a capture, command, route, state, source line, test. Do not mark captured as passed unless inspected or compared.

## Screenshot Discipline

Record:

- route or source;
- viewport, device scale when relevant;
- state, interaction setup;
- theme, auth, content fixture when they affect the result;
- whether it is before, reference, proposal, after, or detail;
- limitations such as compression, missing font, synthetic data, blocked state.

Same route, viewport, state, theme, content, auth context for before/after. DPR 2 or focused crops for icons, spacing, control alignment, scrollbars, annotation detail.

Annotate only findings visible in the capture. Do not box a region, then make a source-only claim. Link source evidence in the finding or proof ledger.

Avoid callout collisions:

- prefer a box for a region, a point for a precise control;
- keep markers away from the screenshot edge;
- split an overloaded screenshot into focused evidence;
- short labels in the legend, not paragraphs over the image;
- do not cover the exact defect with the marker.

## Content Order

Order:

1. Verdict or selected direction?
2. Product and user contract that caused that judgment?
3. Evidence actually observed?
4. Systemic causes?
5. Exact replacement moves?
6. What must not be broken?
7. Proof that would make the new claim pass?
8. What remains risky, missing, synthetic, or blocked?

Markdown is ingestion and correction handoff. HTML is visual inspection handoff. Neither is decoration around a chat response; neither may contradict the other. Keep chat closeout short; link both artifacts.

## Report Quality Gate

- validate the manifest with the generator;
- run strict asset mode;
- open report.html locally with network disabled, or confirm no external dependencies;
- ingest report.md independently; must contain every section, finding, decision, proof state, limitation, warning, annotation subject, tone, geometry;
- report.md uses only relative `report-assets/` paths, no data URI, every referenced asset exists;
- inspect desktop and narrow widths;
- check images, annotations, evidence zooms, legend links, anchors, overflow, focus, print;
- each numbered marker and evidence zoom contain the exact `subject` named in the legend; `label` describes visible evidence, not a future solution;
- compare report.md, report.html section counts, ids, statuses, conclusions; any drift is a failed generation;
- hostile text is escaped; no absolute secret-bearing URL or query string leaked;
- missing evidence is visible rather than silently omitted;
- every major proposal is tied to evidence, a product cause, an explicit hypothesis;
- proof ledger limits the final claim.

Fail when pretty but generic; annotations or zooms target the wrong subject; screenshots are thumbnails; Markdown cannot be ingested without HTML; views drift; missing image disappears without warning; source paths or secrets leak; a proposal lacks a real product cause; dossier is presented as proof the design works.
