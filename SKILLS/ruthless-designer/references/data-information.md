# Data And Information Design

Use when charts, tables, metrics, uncertainty, or dense evidence carry the decision.

## Start With The Decision

Write: `audience -> question -> comparison -> action -> cost of error`. If the user cannot say what changes after reading it, the visualization is decoration.

Match form to relationship:

- comparison/ranking: aligned bars, dots, or sorted table;
- change over time: line or interval chart with meaningful cadence;
- distribution: histogram, box/violin plot, or quantiles—not average hiding riot;
- relationship: scatterplot with relevant grouping and uncertainty;
- part-to-whole: stacked bars when parts and totals matter; avoid angle puzzles;
- flow or spatial question: flow/map only when topology or location changes decision.

Use tables for exact lookup, many attributes, mixed units, auditing, and row-level action.

## Encode Honestly

Prefer position on a shared scale, then length, before area, angle, volume, or saturation. Keep comparable panels on comparable scales. Bars normally start at zero; a truncated line scale may be valid when disclosed and variation—not magnitude—is the question. Label log scales; never feed them zero or negative values.

Show denominator, unit, time window, timezone, source, freshness, filters, sample size, and whether values are estimated. Distinguish `zero`, `missing`, `not applicable`, `suppressed`, `stale`, and `not yet reported`; blank is not a data type. Do not connect missing periods with a confident line.

Expose uncertainty with intervals, ranges, bands, scenarios, sample counts, or explicit confidence language. Do not print false precision. Annotate decisions, threshold crossings, regime changes, and anomalies; labeling every point is panic, not annotation.

## Make The Decision Reachable

- Put targets, baselines, thresholds, and comparison cohorts beside measure.
- Use sorting that answers question; make alternate sort/filter state visible and reversible.
- Align numbers by decimal, use tabular numerals, keep units in headers, and distinguish totals from detail.
- Pin key identity columns in wide tables; preserve row/column context during scroll.
- Put action near evidence and explain disabled or unavailable actions.
- Design empty, partial, delayed, revised, and high-volume states.

Color must be redundant with labels, shape, position, stroke, or pattern. Keep contrast legible, tooltips keyboard/touch reachable, and the same facts available without hover. Provide a concise text summary and an accessible table or equivalent for critical values.

## Data Gate

Ask a representative reader the intended question from the display. Pass only if they can find the comparison, read direction and uncertainty, tell missing from zero, and name the next decision without coaching.
