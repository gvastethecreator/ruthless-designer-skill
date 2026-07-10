#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync, execSync } from "node:child_process";

const VALID_EXT = new Set([
  ".astro",
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".less",
  ".mdx",
  ".mjs",
  ".sass",
  ".scss",
  ".svelte",
  ".ts",
  ".tsx",
  ".vue",
]);

const SKIP_DIRS = new Set([
  ".git",
  ".next",
  ".nuxt",
  ".output",
  ".svelte-kit",
  "__fixtures__",
  "__tests__",
  "build",
  "coverage",
  "dist",
  "fixture",
  "fixtures",
  "generated",
  "node_modules",
  "out",
  "test",
  "tests",
  "vendor",
]);

const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
const PATTERN_RULES = rules().map(normalizeRuleMetadata);
const FILE_RULES = fileRules().map(normalizeRuleMetadata);
const ALL_RULES = [...PATTERN_RULES, ...FILE_RULES];
const RULES_BY_ID = new Map(ALL_RULES.map((rule) => [rule.id, rule]));

if (RULES_BY_ID.size !== ALL_RULES.length) {
  throw new Error("Rule ids must be unique.");
}

const { options, targets } = parseArgs(process.argv.slice(2));

if (options.gpt || options.gemini) {
  console.error("Warning: --gpt and --gemini are deprecated no-ops; findings are provider-neutral.");
}

if (options.listRules) {
  emit(renderRuleList(ALL_RULES, options.format), options.out);
  process.exit(0);
}

if (options.explain !== null) {
  const rule = RULES_BY_ID.get(options.explain);
  if (!rule) {
    console.error(`Unknown rule id: ${options.explain}. Run --list-rules to see available ids.`);
    process.exit(2);
  }
  emit(renderRuleExplanation(rule, options.format), options.out);
  process.exit(0);
}

if (!targets.length && !options.changedOnly) {
  usage();
  process.exit(2);
}

const resolvedTargets = (targets.length ? targets : [process.cwd()]).map((target) => path.resolve(target));

for (const resolvedTarget of resolvedTargets) {
  if (!fs.existsSync(resolvedTarget)) {
    console.error(`Target does not exist: ${resolvedTarget}`);
    process.exit(2);
  }
}

const reportRoot = resolveReportRoot(resolvedTargets);
const allowlist = loadFindingSet(options.allowlist);
const baseline = loadFindingSet(options.baseline);
const changedFiles = options.changedOnly ? new Set(gitChangedFiles(reportRoot)) : null;
const files = [];

for (const target of resolvedTargets) {
  collectFiles(target, files, changedFiles, true);
}

if (!files.length && !options.allowEmpty) {
  console.error("No compatible files found. Pass --allow-empty to accept an empty scan.");
  process.exit(2);
}

const findings = [];
for (const file of [...new Set(files)].sort()) {
  const text = fs.readFileSync(file, "utf8");
  findings.push(...runPatternRules(file, text));
  findings.push(...runFileRules(file, text));
}

const filtered = uniqueFindings(findings)
  .filter((finding) => !options.category || finding.category === options.category || finding.id === options.category)
  .filter((finding) => !findingSetHas(allowlist, finding))
  .filter((finding) => !findingSetHas(baseline, finding));

const payload = {
  scannedAt: new Date().toISOString(),
  cwd: process.cwd(),
  root: reportRoot,
  files: files.length,
  targets,
  options: publicOptions(options),
  findings: filtered,
  summary: summarize(filtered),
};

const rendered = render(payload, options.format);
if (options.out) {
  fs.mkdirSync(path.dirname(path.resolve(options.out)), { recursive: true });
  fs.writeFileSync(options.out, rendered);
} else {
  process.stdout.write(rendered);
}

if (options.failOn && filtered.some((finding) => severityRank[finding.severity] <= severityRank[options.failOn])) {
  process.exitCode = 1;
}

function rules() {
  return [
    {
      id: "gradient-text",
      category: "slop",
      severity: "P2",
      message: "Gradient text is usually decorative; use solid text color unless the brand system requires it.",
      patterns: [
        /\bbg-clip-text\b[\s\S]{0,180}\bbg-gradient-to-/gi,
        /background-clip\s*:\s*text[\s\S]{0,180}(?:linear|radial)-gradient/gi,
      ],
    },
    {
      id: "side-stripe-border",
      category: "slop",
      severity: "P2",
      message: "Thick one-sided accent borders read as generated UI. Prefer full borders, tints, icons, or simpler structure.",
      patterns: [
        /border-(?:left|right)(?:-width)?\s*:\s*(?:[2-9]|\d{2,})px/gi,
        /\bborder-[lr]-(?:2|4|8|\[(?:[2-9]|\d{2,})px\])/gi,
      ],
    },
    {
      id: "purple-blue-gradient",
      category: "slop",
      severity: "P2",
      message: "Purple/blue/cyan gradients are a common generated palette reflex. Pick a palette from the brand or scene.",
      patterns: [
        /\bfrom-(?:purple|violet|indigo)-\d+\b[\s\S]{0,160}\bto-(?:blue|cyan|sky|pink|fuchsia|purple|violet|indigo)-\d+\b/gi,
        /linear-gradient\([^;\n]*(?:purple|violet|indigo)[^;\n]*(?:blue|cyan|pink|fuchsia)/gi,
      ],
    },
    {
      id: "cream-surface",
      category: "slop",
      severity: "P2",
      message: "Cream/beige/paper surfaces are a common safe default. Confirm the palette is intentional.",
      patterns: [
        /--(?:paper|cream|sand|bone|flour|linen|parchment|wheat|biscuit|ivory)\b/gi,
        /\b(?:bg|background(?:-color)?)\s*[:=][^;\n]*(?:cream|sand|beige|linen|ivory|parchment)/gi,
        /oklch\(\s*(?:0\.(?:8[4-9]|9\d)|(?:8[4-9]|9\d)%)[,\s]+0\.0[0-6][,\s]+(?:[4-9]\d|100)/gi,
      ],
    },
    {
      id: "nested-card-copy",
      category: "slop",
      severity: "P3",
      message: "Likely card nesting. Verify whether hierarchy can be flattened with spacing, dividers, or typography.",
      patterns: [
        /class(?:Name)?=["'][^"']*(?:card|panel|surface)[^"']*["'][\s\S]{0,900}class(?:Name)?=["'][^"']*(?:card|panel|surface)[^"']*["']/gi,
      ],
    },
    {
      id: "icon-tile-stack",
      category: "slop",
      severity: "P2",
      message: "Rounded icon tile above heading is a generated feature-card template. Use a more specific layout.",
      patterns: [
        /(?:rounded-(?:xl|2xl|3xl)|border-radius\s*:\s*(?:1[2-9]|[2-9]\d)px)[\s\S]{0,260}(?:<svg|\bIcon\b)[\s\S]{0,360}<h[1-4]\b/gi,
      ],
    },
    {
      id: "oversized-radius",
      category: "slop",
      severity: "P2",
      message: "Very large radii on cards/panels/inputs often look soft and generic. Keep big radii for pills only.",
      patterns: [
        /border-radius\s*:\s*(?:3[2-9]|[4-9]\d)px/gi,
        /\brounded-\[(?:3[2-9]|[4-9]\d)px\]|\brounded-3xl\b|\brounded-\[2rem\]/gi,
      ],
    },
    {
      id: "wide-shadow-border",
      category: "slop",
      severity: "P3",
      message: "Hairline border plus wide shadow is a common generated-card recipe. Prefer one elevation model.",
      patterns: [
        /border\s*:\s*1px[^;\n]*;[\s\S]{0,220}box-shadow\s*:[^;\n]*(?:1[6-9]|[2-9]\d)px/gi,
        /box-shadow\s*:[^;\n]*(?:1[6-9]|[2-9]\d)px[^;\n]*;[\s\S]{0,220}border\s*:\s*1px/gi,
      ],
    },
    {
      id: "repeating-stripes",
      category: "slop",
      severity: "P3",
      message: "Repeating stripe gradients are usually decorative filler. Use a real texture or simplify.",
      patterns: [/repeating-linear-gradient\(/gi],
    },
    {
      id: "glass-default",
      category: "slop",
      severity: "P2",
      message: "Glass blur should be rare and purposeful, not the default surface treatment.",
      patterns: [/\bbackdrop-blur\b|backdrop-filter\s*:\s*blur\(/gi],
    },
    {
      id: "heavy-blur-effect",
      category: "performance",
      severity: "P2",
      message: "20px+ blur is expensive and should be a functional material/crossfade choice with runtime proof.",
      patterns: [
        /(?:filter|backdrop-filter|backdropFilter)\s*:?\s*["']?[^;"'\n]*blur\(\s*(?:2\d|[3-9]\d|\d{3,})px\s*\)/gi,
        /\b(?:blur|backdrop-blur)-\[(?:2\d|[3-9]\d|\d{3,})px\]/gi,
      ],
    },
    {
      id: "hero-eyebrow",
      category: "slop",
      severity: "P3",
      message: "Tiny uppercase/tracked eyebrow labels above heroes or every section can read as scaffolded.",
      patterns: [
        /(?:uppercase|text-transform\s*:\s*uppercase)[\s\S]{0,160}(?:tracking-(?:wide|wider|widest)|letter-spacing\s*:\s*(?:[2-9]px|0\.[1-9]em))/gi,
      ],
    },
    {
      id: "bounce-easing",
      category: "slop",
      severity: "P2",
      message: "Bounce, wobble, elastic, or strong overshoot easing should be rare and context-specific.",
      patterns: [
        /\banimate-bounce\b|\b(?:bounce|elastic|wobble|jiggle)\b/gi,
        /cubic-bezier\(\s*[-\d.]+\s*,\s*(?:-\d|1\.[1-9]|[2-9])[^)]*\)/gi,
      ],
    },
    {
      id: "marketing-buzzword",
      category: "slop",
      severity: "P3",
      message: "Generic marketing copy weakens trust. Replace with the literal product action or outcome.",
      patterns: [/\b(?:streamline|empower|supercharge|world-class|enterprise-grade|next-generation|cutting-edge|seamless|revolutionary)\b/gi],
    },
    {
      id: "scaffold-label",
      category: "slop",
      severity: "P3",
      message: "Section/step labels used as visible scaffolding usually read as generated structure. Let the actual content label the sequence.",
      patterns: [/\b(?:SECTION|QUESTION|STAGE|PHASE|STEP|PASS)\s*(?:0?\d+|[IVX]+)\b/gi],
    },
    {
      id: "generic-placeholder-data",
      category: "slop",
      severity: "P2",
      message: "Default names, companies, or lorem ipsum make the interface feel fake. Use domain-specific draft content or real fixtures.",
      patterns: [/\b(?:John Doe|Jane Doe|Jane Smith|Acme Corp|Lorem ipsum|Foo Bar|Example Inc\.?|Nexus Platform|SmartFlow)\b/gi],
    },
    {
      id: "fake-product-preview",
      category: "slop",
      severity: "P2",
      message: "Div-based mock browser/dashboard/terminal previews are weak evidence. Use a real screenshot, live component state, generated bitmap, or no preview.",
      patterns: [
        /\b(?:fake|mock|placeholder)[-_ ]*(?:dashboard|terminal|browser|screenshot|preview)\b/gi,
        /class(?:Name)?=["'][^"']*(?:browser|terminal|dashboard|screenshot|preview)[^"']*["'][\s\S]{0,900}class(?:Name)?=["'][^"']*(?:skeleton|line|bar|dot|row)[^"']*["']/gi,
      ],
    },
    {
      id: "fake-version-metadata",
      category: "slop",
      severity: "P3",
      message: "Decorative version, branch, sync, or build metadata adds fake specificity. Keep only operational metadata users need.",
      patterns: [
        /\b(?:last\s+sync|synced|branch|commit|build|main)\b[\s\S]{0,80}\b(?:v?\d+\.\d+(?:\.\d+)?(?:[-.][\w.]+)?|[0-9a-f]{7,})\b/gi,
      ],
    },
    {
      id: "transition-all",
      category: "performance",
      severity: "P2",
      message: "Broad transitions hide bugs and animate unintended properties. Name exact properties.",
      patterns: [/\btransition-all\b|transition\s*:\s*all\b/gi],
    },
    {
      id: "layout-transition",
      category: "performance",
      severity: "P2",
      message: "Layout-property transitions can cause jank. Prefer transform/opacity or a deliberate layout technique.",
      patterns: [
        /transition(?:-property)?\s*:\s*[^;\n]*(?:width|height|padding|margin|top|left|right|bottom)/gi,
        /\btransition-\[(?:width|height|padding|margin|top|left|right|bottom)[^\]]*\]/gi,
      ],
    },
    {
      id: "ease-in-ui-motion",
      category: "motion",
      severity: "P2",
      message: "ease-in on UI entry/opening feels delayed. Prefer ease-out or a strong custom curve.",
      patterns: [
        /(?:transition(?:-timing-function)?|animation(?:-timing-function)?)\s*:[^;\n]*(?<![\w-])ease-in(?!-out|\w)/gi,
        /\bease-in(?!-out)\b/gi,
      ],
    },
    {
      id: "scale-zero-entry",
      category: "motion",
      severity: "P2",
      message: "scale(0) makes elements appear from nowhere. Start around scale(0.9-0.97) plus opacity.",
      patterns: [
        /scale(?:3d|X|Y)?\(\s*0(?:\.0+)?(?:\s|,|\))/gi,
        /\bscale-0\b|\bscale-\[0(?:\.0+)?\]/gi,
      ],
    },
    {
      id: "center-origin-anchored-motion",
      category: "motion",
      severity: "P2",
      message: "Anchored popovers, dropdowns, menus, and tooltips should scale from the trigger, not center.",
      patterns: [
        /(?:popover|dropdown|tooltip|menu)[\s\S]{0,260}(?:transform-origin|transformOrigin)\s*:?\s*["']?center/gi,
        /(?:transform-origin|transformOrigin)\s*:?\s*["']?center[\s\S]{0,260}(?:popover|dropdown|tooltip|menu)/gi,
      ],
    },
    {
      id: "keyframes-dynamic-ui",
      category: "motion",
      severity: "P2",
      message: "Keyframes restart from zero. Rapidly triggered UI such as toasts, toggles, menus, and drawers should usually retarget through transitions or springs.",
      patterns: [
        /@keyframes[\s\S]{0,1200}(?:toast|toggle|switch|drawer|popover|dropdown|menu)/gi,
        /(?:toast|toggle|switch|drawer|popover|dropdown|menu)[\s\S]{0,1200}@keyframes/gi,
      ],
    },
    {
      id: "long-ui-duration",
      category: "motion",
      severity: "P2",
      message: "UI motion over 300ms needs a spatial, deliberate-action, or rare-feedback reason.",
      patterns: [
        /(?:transition-duration|animation-duration)\s*:\s*(?:3[1-9]\d|[4-9]\d{2,}|\d{4,})ms/gi,
        /\bduration-(?:3[1-9]\d|[4-9]\d{2,}|\d{4,})\b/gi,
      ],
    },
    {
      id: "framer-motion-shorthand-risk",
      category: "motion",
      severity: "P3",
      confidence: "low",
      applicability: "contextual",
      message: "Framer Motion x/y/scale shorthand is only a performance lead. Profile the interaction under representative load before changing it; shorthand alone is not a defect.",
      patterns: [
        /<motion\.[\w.]+[\s\S]{0,500}(?:animate|initial|exit)=\{\{[\s\S]{0,220}\b(?:x|y|scale)\s*:/gi,
      ],
    },
    {
      id: "parent-css-var-transform-risk",
      category: "motion",
      severity: "P2",
      message: "Driving many child transforms through parent CSS variables can cause style recalculation. Prefer direct transform writes on the moving element.",
      patterns: [
        /(?:document\.documentElement|document\.body|parentElement|container|root)\.style\.setProperty\(\s*["']--(?:(?:x|y|translate|transform|drag|swipe|motion|offset)(?:[-_][\w-]+)?|[\w-]+[-_](?:x|y|translate|transform|drag|swipe|motion|offset)(?:[-_][\w-]+)?)/gi,
      ],
    },
    {
      id: "layout-read-write-risk",
      category: "performance",
      severity: "P2",
      message: "Layout reads near DOM writes can force sync layout. Batch reads before writes or move work out of hot handlers.",
      patterns: [
        /(?:getBoundingClientRect|offset(?:Height|Width|Top|Left)|scroll(?:Top|Left|Height|Width)|client(?:Height|Width))[\s\S]{0,360}(?:style\.|classList\.|set[A-Z]\w*\(|setState\()/gi,
        /(?:style\.|classList\.|set[A-Z]\w*\(|setState\()[\s\S]{0,360}(?:getBoundingClientRect|offset(?:Height|Width|Top|Left)|scroll(?:Top|Left|Height|Width)|client(?:Height|Width))/gi,
      ],
    },
    {
      id: "will-change-broad",
      category: "performance",
      severity: "P2",
      message: "will-change must name sparse exact properties. Broad or layout-heavy hints cost memory and can hurt performance.",
      patterns: [
        /will-change\s*:\s*(?:all|auto|width|height|top|left|right|bottom|padding|margin)/gi,
        /\bwill-change-\[(?:all|auto|width|height|top|left|right|bottom|padding|margin)[^\]]*\]/gi,
      ],
    },
    {
      id: "expensive-effect-list-risk",
      category: "performance",
      severity: "P3",
      message: "Filters, backdrop blur, and large shadows inside repeated rows/cards can become expensive. Verify runtime cost.",
      patterns: [
        /(?:map\(|v-for|each\s*\(|For\s+each)[\s\S]{0,900}(?:backdrop-filter|backdrop-blur|filter\s*:|drop-shadow|box-shadow\s*:[^;\n]*(?:2[4-9]|[3-9]\d)px)/gi,
      ],
    },
    {
      id: "missing-img-alt",
      category: "accessibility",
      severity: "P1",
      message: "Meaningful images need alt text; decorative images need empty alt.",
      patterns: [/<img\b(?![^>]*\balt=)[^>]*>/gi],
    },
    {
      id: "missing-img-dimensions",
      category: "performance",
      severity: "P2",
      message: "Images without width/height or intrinsic sizing can cause layout shift. Reserve space or use framework image primitives.",
      patterns: [/<img\b(?![^>]*\bwidth=)(?![^>]*\bheight=)[^>]*\bsrc=/gi],
    },
    {
      id: "empty-img-src",
      category: "quality",
      severity: "P1",
      message: "Empty or placeholder image sources ship broken visuals. Use real assets or remove the tag.",
      patterns: [/<img\b[^>]*\bsrc=["'](?:|#|placeholder|TODO|\/?placeholder[^"']*)["'][^>]*>/gi],
    },
    {
      id: "button-name-risk",
      category: "accessibility",
      severity: "P1",
      message: "Icon-only or empty buttons need accessible names through visible text, aria-label, aria-labelledby, or title.",
      patterns: [
        /<button\b(?![^>]*(?:aria-label|aria-labelledby|title)=)[^>]*>\s*(?:<svg[\s\S]*?<\/svg>|<Icon\b[\s\S]*?\/?>|{?\s*}?)\s*<\/button>/gi,
      ],
    },
    {
      id: "interactive-div",
      category: "accessibility",
      severity: "P1",
      message: "Clickable div/span needs semantic button/link or full keyboard role handling.",
      patterns: [
        /<(?:div|span)\b(?=[^>]*\bon(?:Click|PointerDown|MouseDown|KeyDown)=)(?![^>]*\brole=)[^>]*>/g,
      ],
    },
    {
      id: "nowrap-risk",
      category: "resilience",
      severity: "P2",
      message: "No-wrap text can overflow. Confirm truncation, wrapping, or scroll affordance exists.",
      patterns: [/\bwhitespace-nowrap\b|white-space\s*:\s*nowrap/gi],
    },
    {
      id: "fixed-width-mobile-risk",
      category: "resilience",
      severity: "P2",
      message: "Large fixed widths can break small viewports. Use responsive constraints or overflow affordances.",
      patterns: [
        /\bwidth\s*:\s*(?:[4-9]\d{2,}|\d{4,})px/gi,
        /\b(?:w|min-w|max-w)-\[(?:[4-9]\d{2,}|\d{4,})px\]/gi,
      ],
    },
    {
      id: "tiny-text",
      category: "quality",
      severity: "P2",
      message: "Body text below 12px is hard to read. Reserve tiny text for nonessential metadata.",
      patterns: [/font-size\s*:\s*(?:[0-9]|1[01])px|\btext-\[(?:[0-9]|1[01])px\]/gi],
    },
    {
      id: "all-caps-body",
      category: "quality",
      severity: "P3",
      message: "All-caps text is only for short labels. Verify it is not used on body copy.",
      patterns: [/text-transform\s*:\s*uppercase|\buppercase\b/gi],
    },
    {
      id: "z-index-overlay-risk",
      category: "quality",
      severity: "P3",
      message: "Very high z-index values can signal overlay wars. Check stacking context and focus/fixed layers.",
      patterns: [/z-index\s*:\s*(?:[1-9]\d{3,}|999)|\bz-\[(?:[1-9]\d{3,}|999)\]/gi],
    },
    {
      id: "hardcoded-color-drift",
      category: "design-system",
      severity: "P3",
      message: "Repeated literal colors can drift from tokens. Prefer semantic tokens when a design system exists.",
      patterns: [/(?:color|background|border(?:-color)?)\s*:\s*#[0-9a-f]{3,8}\b/gi],
    },
  ];
}

function fileRules() {
  return [
    {
      id: "missing-reduced-motion-guard",
      category: "accessibility",
      severity: "P2",
      message: "Motion-heavy files need a reduced-motion path or a documented reason it is not required.",
    },
    {
      id: "missing-reduced-transparency-fallback",
      category: "accessibility",
      severity: "P2",
      message: "Blurred/translucent chrome needs a solid or higher-contrast fallback when it carries structure or text.",
    },
    {
      id: "will-change-mass-layering",
      category: "performance",
      severity: "P2",
      message: "Many will-change hints in one file can create excessive layers. Keep hints sparse and justified.",
    },
    {
      id: "ungated-hover-motion",
      category: "motion",
      severity: "P2",
      message: "Hover motion should be gated to hover-capable fine pointers so touch users do not get hidden or accidental affordances.",
    },
    {
      id: "gesture-missing-pointer-capture",
      category: "motion",
      severity: "P3",
      message: "Pointer-driven drag/swipe code should usually capture the pointer after drag intent so motion survives leaving bounds.",
    },
  ];
}

function normalizeRuleMetadata(rule) {
  const normalized = {
    ...rule,
    confidence: rule.confidence || defaultConfidence(rule),
    applicability: rule.applicability || defaultApplicability(rule),
  };
  return Object.freeze({
    ...normalized,
    exceptions: Object.freeze([...defaultExceptions(normalized), ...(rule.exceptions || [])]),
  });
}

function defaultExceptions(rule) {
  const exceptions = [
    "Generated, vendor, fixture, and test files are skipped during directory scans unless they are explicitly targeted or --include-ignored is used.",
  ];

  if (rule.applicability === "contextual") {
    exceptions.push(
      "A documented design system or explicit product intent may justify the pattern only when evidence shows the user-facing risk is controlled.",
    );
  }

  if (
    [
      "layout-transition",
      "keyframes-dynamic-ui",
      "framer-motion-shorthand-risk",
      "gesture-missing-pointer-capture",
    ].includes(rule.id)
  ) {
    exceptions.push(
      "A framework primitive or library may manage layout animation or pointer capture internally; verify its contract before escalating.",
    );
  }

  if (["glass-default", "heavy-blur-effect", "missing-reduced-transparency-fallback"].includes(rule.id)) {
    exceptions.push(
      "Decorative blur that carries no structure or text differs from functional chrome; confirm the surface role before escalating.",
    );
  }

  if (rule.category === "motion") {
    exceptions.push(
      "Judge interaction register, trigger frequency, travel distance, repetition, and measured runtime load in context.",
    );
  }

  return exceptions;
}

function fileRule(id) {
  const rule = RULES_BY_ID.get(id);
  if (!rule) throw new Error(`Missing file rule metadata: ${id}`);
  return rule;
}

function runPatternRules(file, text) {
  const out = [];
  for (const rule of PATTERN_RULES) {
    for (const pattern of rule.patterns) {
      pattern.lastIndex = 0;
      let count = 0;
      let match;
      while ((match = pattern.exec(text)) && count < 8) {
        out.push(toFinding(rule, file, text, match.index, match[0]));
        count += 1;
        if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
      }
    }
  }
  return out;
}

function runFileRules(file, text) {
  const out = [];
  const significantMotionIndex = firstMatchIndex(text, [
    /@keyframes\b/i,
    /animation(?:-name|-duration|-timing-function)?\s*:/i,
    /\banimate-(?!none\b)[\w-]+\b/i,
    /\btransition-all\b/i,
    /\btransition-(?:transform|opacity)\b/i,
    /\btransition-\[[^\]]*(?:transform|translate|scale|rotate|opacity|filter|clip-path|width|height|padding|margin|top|left|right|bottom)[^\]]*\]/i,
    /transition(?:-property)?\s*:[^;\n]*(?:transform|translate|scale|rotate|opacity|filter|clip-path|width|height|padding|margin|top|left|right|bottom)/i,
    /scroll-behavior\s*:\s*smooth/i,
  ]);
  const hasMotion = significantMotionIndex >= 0;
  const hasReducedMotion = /prefers-reduced-motion/.test(text);
  if (hasMotion && !hasReducedMotion) {
    out.push(
      toFinding(
        fileRule("missing-reduced-motion-guard"),
        file,
        text,
        significantMotionIndex,
        "motion without prefers-reduced-motion",
      ),
    );
  }

  const hasTranslucentMaterial = /\bbackdrop-blur\b|backdrop-filter\s*:\s*blur\(|backdropFilter\s*:?\s*["']?[^;"'\n]*blur\(/i.test(text);
  const hasTransparencyFallback = /prefers-reduced-transparency|prefers-contrast|forced-colors/i.test(text);
  if (hasTranslucentMaterial && !hasTransparencyFallback) {
    out.push(
      toFinding(
        fileRule("missing-reduced-transparency-fallback"),
        file,
        text,
        Math.max(0, text.search(/\bbackdrop-blur\b|backdrop-filter\s*:\s*blur\(|backdropFilter\s*:?\s*["']?[^;"'\n]*blur\(/i)),
        "translucent material without prefers-reduced-transparency, prefers-contrast, or forced-colors fallback",
      ),
    );
  }

  const willChangeMatches = [...text.matchAll(/will-change\s*:|will-change-\[/gi)];
  if (willChangeMatches.length >= 5) {
    out.push(
      toFinding(
        fileRule("will-change-mass-layering"),
        file,
        text,
        willChangeMatches[0].index ?? 0,
        `${willChangeMatches.length} will-change hints`,
      ),
    );
  }

  const hasHoverMotion = /(?::hover|hover:)[\s\S]{0,220}(?:transform|scale|translate|rotate|animation|transition)/i.test(text);
  const hasHoverGate = /@media\s*\(\s*hover\s*:\s*hover\s*\)\s*and\s*\(\s*pointer\s*:\s*fine\s*\)/i.test(text);
  if (hasHoverMotion && !hasHoverGate) {
    out.push(
      toFinding(
        fileRule("ungated-hover-motion"),
        file,
        text,
        Math.max(0, text.search(/(?::hover|hover:)[\s\S]{0,220}(?:transform|scale|translate|rotate|animation|transition)/i)),
        "hover motion without @media (hover: hover) and (pointer: fine)",
      ),
    );
  }

  const hasPointerGesture =
    /\bonPointer(?:Down|Move|Up|Cancel)\b|addEventListener\(\s*["']pointer(?:down|move|up|cancel)["']|PointerEvent/i.test(text) &&
    /\b(?:client[XY]|page[XY]|screen[XY]|movement[XY]|translate[XY]?|transform|drag|swipe|velocity)\b/i.test(text);
  if (hasPointerGesture && !/setPointerCapture\b/i.test(text)) {
    out.push(
      toFinding(
        fileRule("gesture-missing-pointer-capture"),
        file,
        text,
        Math.max(0, text.search(/\bonPointer(?:Down|Move|Up|Cancel)\b|addEventListener\(\s*["']pointer(?:down|move|up|cancel)["']|PointerEvent/i)),
        "pointer gesture without setPointerCapture",
      ),
    );
  }

  return out;
}

function firstMatchIndex(text, patterns) {
  let first = -1;
  for (const pattern of patterns) {
    const index = text.search(pattern);
    if (index >= 0 && (first < 0 || index < first)) first = index;
  }
  return first;
}

function uniqueFindings(value) {
  const seen = new Set();
  const out = [];
  for (const finding of value) {
    const key = `${finding.id}|${finding.file}|${finding.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(finding);
  }
  return out;
}

function toFinding(rule, file, text, index, snippet) {
  const finding = {
    id: rule.id,
    category: rule.category,
    severity: rule.severity,
    confidence: rule.confidence || defaultConfidence(rule),
    applicability: rule.applicability || defaultApplicability(rule),
    message: rule.message,
    file: path.relative(reportRoot, file).replaceAll("\\", "/"),
    line: lineForIndex(text, index),
    snippet: cleanSnippet(snippet),
  };
  return { ...finding, fingerprint: fingerprint(finding) };
}

function defaultConfidence(rule) {
  if (["slop", "design-system"].includes(rule.category)) return "low";
  if (["missing-img-alt", "empty-img-src", "interactive-div"].includes(rule.id)) return "high";
  return "medium";
}

function defaultApplicability(rule) {
  if (["missing-img-alt", "empty-img-src", "interactive-div", "transition-all", "will-change-broad"].includes(rule.id)) {
    return "direct";
  }
  return "contextual";
}

function parseArgs(args) {
  const options = {
    format: "text",
    gpt: false,
    gemini: false,
    failOn: null,
    out: null,
    allowlist: null,
    baseline: null,
    changedOnly: false,
    category: null,
    allowEmpty: false,
    includeIgnored: false,
    listRules: false,
    explain: null,
  };
  const targets = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const [name, inlineValue] = arg.split("=", 2);
    const nextValue = () => inlineValue ?? args[++i];

    if (arg === "--json") options.format = "json";
    else if (arg === "--gpt") options.gpt = true;
    else if (arg === "--gemini") options.gemini = true;
    else if (arg === "--changed-only") options.changedOnly = true;
    else if (arg === "--allow-empty") options.allowEmpty = true;
    else if (arg === "--include-ignored") options.includeIgnored = true;
    else if (arg === "--list-rules") options.listRules = true;
    else if (name === "--explain") options.explain = nextValue();
    else if (name === "--format") options.format = normalizeFormat(nextValue());
    else if (name === "--fail-on") options.failOn = normalizeSeverity(nextValue());
    else if (name === "--out") options.out = nextValue();
    else if (name === "--allowlist") options.allowlist = nextValue();
    else if (name === "--baseline") options.baseline = nextValue();
    else if (name === "--category") options.category = nextValue();
    else if (arg.startsWith("--")) {
      console.error(`Unknown option: ${arg}`);
      process.exit(2);
    } else {
      targets.push(arg);
    }
  }

  return { options, targets };
}

function normalizeFormat(value) {
  if (!["json", "md", "markdown", "text"].includes(value)) {
    console.error(`Invalid --format ${value}`);
    process.exit(2);
  }
  return value === "markdown" ? "md" : value;
}

function normalizeSeverity(value) {
  const severity = String(value || "").toUpperCase();
  if (!Object.hasOwn(severityRank, severity)) {
    console.error(`Invalid --fail-on ${value}; expected P0, P1, P2, or P3`);
    process.exit(2);
  }
  return severity;
}

function collectFiles(target, out, changedFiles, isExplicitTarget = false) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    const name = path.basename(target).toLowerCase();
    if (!isExplicitTarget && !options.includeIgnored && SKIP_DIRS.has(name)) return;
    for (const entry of fs.readdirSync(target)) collectFiles(path.join(target, entry), out, changedFiles, false);
    return;
  }
  if (!stat.isFile()) return;
  if (!VALID_EXT.has(path.extname(target).toLowerCase())) return;

  if (changedFiles && !changedFiles.has(normalizeFsPath(target))) return;
  out.push(target);
}

function gitChangedFiles(startPath = process.cwd()) {
  const changed = new Set();
  let gitRoot;
  try {
    const cwd = fs.statSync(startPath).isDirectory() ? startPath : path.dirname(startPath);
    gitRoot = execFileSync("git", ["-C", cwd, "rev-parse", "--show-toplevel"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return [];
  }
  for (const command of [
    "git diff --name-only --diff-filter=ACMRTUXB -z HEAD",
    "git ls-files --others --exclude-standard -z",
  ]) {
    try {
      const output = execSync(command, {
        cwd: gitRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      for (const file of output.split("\0")) {
        const normalized = file.trim() ? normalizeFsPath(path.resolve(gitRoot, file.trim())) : "";
        if (normalized) changed.add(normalized);
      }
    } catch {
      // A repository without HEAD can still contribute untracked files.
    }
  }
  return [...changed];
}

function resolveReportRoot(scanTargets) {
  const gitRoots = new Set();
  for (const target of scanTargets) {
    const start = fs.statSync(target).isDirectory() ? target : path.dirname(target);
    try {
      const root = execFileSync("git", ["-C", start, "rev-parse", "--show-toplevel"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (root) gitRoots.add(normalizeFsPath(root));
    } catch {
      // Non-Git scans use their stable target ancestor instead.
    }
  }
  if (gitRoots.size === 1) return [...gitRoots][0];

  const anchors = scanTargets.map((target) => (fs.statSync(target).isDirectory() ? target : path.dirname(target)));
  return commonAncestor(anchors);
}

function commonAncestor(paths) {
  if (!paths.length) return process.cwd();
  let candidate = path.resolve(paths[0]);
  for (const current of paths.slice(1)) {
    const absolute = path.resolve(current);
    while (!isInsideOrSame(candidate, absolute)) {
      const parent = path.dirname(candidate);
      if (parent === candidate) return path.parse(candidate).root;
      candidate = parent;
    }
  }
  return candidate;
}

function isInsideOrSame(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function loadFindingSet(file) {
  const set = new Set();
  if (!file) return set;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const findings = Array.isArray(data) ? data : data.findings || [];
  for (const item of findings) {
    if (typeof item === "string") {
      set.add(item);
    } else {
      if (typeof item.fingerprint === "string") set.add(item.fingerprint);
      set.add(fingerprint(item));
      set.add(legacyFingerprint(item));
    }
  }
  return set;
}

function fingerprint(finding) {
  return [
    finding.id,
    normalizePath(finding.file || ""),
    normalizeFingerprintSnippet(finding.snippet || ""),
  ].join("|");
}

function legacyFingerprint(finding) {
  return [
    finding.id,
    normalizePath(finding.file || ""),
    finding.line || "",
    cleanSnippet(finding.snippet || ""),
  ].join("|");
}

function findingSetHas(set, finding) {
  return set.has(fingerprint(finding)) || set.has(legacyFingerprint(finding));
}

function normalizeFingerprintSnippet(value) {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*([:;,{}()[\]=<>])\s*/g, "$1")
    .trim()
    .slice(0, 180);
}

function normalizePath(value) {
  return String(value).replaceAll("\\", "/");
}

function normalizeFsPath(value) {
  const normalized = path.resolve(String(value)).replaceAll("\\", "/");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function lineForIndex(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function cleanSnippet(value) {
  return String(value).replace(/\s+/g, " ").trim().slice(0, 180);
}

function summarize(findings) {
  const bySeverity = {};
  const byCategory = {};
  for (const finding of findings) {
    bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1;
    byCategory[finding.category] = (byCategory[finding.category] || 0) + 1;
  }
  return {
    total: findings.length,
    bySeverity,
    byCategory,
  };
}

function render(payload, format) {
  if (format === "json") return `${JSON.stringify(payload, null, 2)}\n`;
  if (format === "md") return renderMarkdown(payload);
  return renderText(payload);
}

function renderRuleList(ruleCatalog, format) {
  const publicRules = ruleCatalog.map(publicRuleMetadata);
  if (format === "json") return `${JSON.stringify({ rules: publicRules }, null, 2)}\n`;

  const lines = [`UI anti-pattern rules (${publicRules.length})`];
  for (const rule of publicRules) {
    lines.push(
      `[${rule.severity}] ${rule.id} (${rule.category}; ${rule.confidence} confidence; ${rule.applicability}) - ${rule.message}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

function renderRuleExplanation(rule, format) {
  const metadata = publicRuleMetadata(rule);
  if (format === "json") return `${JSON.stringify(metadata, null, 2)}\n`;

  const lines = [
    `${metadata.id} [${metadata.severity}]`,
    `Category: ${metadata.category}`,
    `Confidence: ${metadata.confidence}`,
    `Applicability: ${metadata.applicability}`,
    `Message: ${metadata.message}`,
    "Exceptions:",
    ...metadata.exceptions.map((exception) => `- ${exception}`),
  ];
  return `${lines.join("\n")}\n`;
}

function publicRuleMetadata(rule) {
  return {
    id: rule.id,
    category: rule.category,
    severity: rule.severity,
    confidence: rule.confidence,
    applicability: rule.applicability,
    message: rule.message,
    exceptions: rule.exceptions,
  };
}

function emit(rendered, outputPath) {
  if (outputPath) {
    fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
    fs.writeFileSync(outputPath, rendered);
    return;
  }
  fs.writeSync(process.stdout.fd, rendered);
}

function renderText(payload) {
  if (!payload.findings.length) return `Scanned ${payload.files} file(s). No findings.\n`;
  const lines = [`Scanned ${payload.files} file(s). ${payload.findings.length} finding(s).`];
  for (const finding of payload.findings) {
    lines.push(`[${finding.severity}] ${finding.id} ${finding.file}:${finding.line} - ${finding.message}`);
    lines.push(`  ${finding.snippet}`);
  }
  return `${lines.join("\n")}\n`;
}

function renderMarkdown(payload) {
  const lines = [
    "# UI Anti-Pattern Scan",
    "",
    `Scanned: ${payload.files} file(s)`,
    `Findings: ${payload.findings.length}`,
    "",
  ];
  if (payload.findings.length) {
    lines.push("Findings:");
    for (const finding of payload.findings) {
      lines.push(`- [${finding.severity}] ${finding.id} ${finding.file}:${finding.line} - ${finding.message}`);
    }
  } else {
    lines.push("No findings.");
  }
  return `${lines.join("\n")}\n`;
}

function publicOptions(value) {
  return {
    format: value.format,
    gpt: value.gpt,
    gemini: value.gemini,
    failOn: value.failOn,
    changedOnly: value.changedOnly,
    allowEmpty: value.allowEmpty,
    includeIgnored: value.includeIgnored,
    category: value.category,
    allowlist: Boolean(value.allowlist),
    baseline: Boolean(value.baseline),
  };
}

function usage() {
  console.error("Usage: node detect-ui-antipatterns.mjs [--list-rules | --explain rule-id | <file-or-directory>...] [--json|--format=text|md|json] [--fail-on=P1|P2|P3] [--out file] [--allowlist file] [--baseline file] [--changed-only] [--allow-empty] [--include-ignored] [--category name] [--gpt] [--gemini]");
}
