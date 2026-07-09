# Data And Information Design

Use this route when charts, tables, metrics, uncertainty, or dense evidence carry the decision. A dashboard is not a landfill with axes.

## Start With The Decision

Write: `audience -> question -> comparison -> action -> cost of error`. Choose a display only after this is clear. If the user cannot say what changes after reading it, the visualization is decoration with arithmetic.

Match form to relationship:

- comparison/ranking: aligned bars, dots, or a sorted table;
- change over time: line or interval chart with meaningful cadence;
- distribution: histogram, box/violin plot, or quantiles—not an average hiding a riot;
- relationship: scatterplot with relevant grouping and uncertainty;
- part-to-whole: stacked bars when parts and totals matter; avoid angle puzzles;
- flow or spatial question: flow/map only when topology or location changes the decision.

Use tables for exact lookup, many attributes, mixed units, auditing, and row-level action. Charts reveal pattern; tables surrender the receipt.

## Encode Honestly

Prefer position on a shared scale, then length, before area, angle, volume, or saturation. Keep comparable panels on comparable scales. Bars normally start at zero; a truncated line scale may be valid when disclosed and the variation—not magnitude—is the question. Label log scales and never feed them zero or negative values as if mathematics owed you a favor.

Show denominator, unit, time window, timezone, source, freshness, filters, sample size, and whether values are estimated. Distinguish `zero`, `missing`, `not applicable`, `suppressed`, `stale`, and `not yet reported`; blank is not a data type. Do not connect missing periods with a confident line.

Expose uncertainty with intervals, ranges, bands, scenarios, sample counts, or explicit confidence language. Do not print false precision. Annotate decisions, threshold crossings, regime changes, and anomalies; labeling every point is not annotation, it is panic.

## Make The Decision Reachable

- Put targets, baselines, thresholds, and comparison cohorts beside the measure.
- Use sorting that answers the question; make alternate sort/filter state visible and reversible.
- Align numbers by decimal, use tabular numerals, keep units in headers, and distinguish totals from detail.
- Pin key identity columns in wide tables; preserve row/column context during scroll.
- Put the action near the evidence and explain disabled or unavailable actions.
- Design empty, partial, delayed, revised, and high-volume states.

Color must be redundant with labels, shape, position, stroke, or pattern. Keep contrast legible, tooltips keyboard/touch reachable, and the same facts available without hover. Provide a concise text summary of the conclusion and an accessible table or equivalent for critical values; do not dump every SVG node into an unusable screen-reader swamp.

## Data Gate

Ask a representative reader the intended question using the display. Pass only if they can find the comparison, interpret direction and uncertainty, distinguish missing from zero, and name the next decision without coaching. If the chart looks impressive but produces the wrong answer, it is a polished liar.
