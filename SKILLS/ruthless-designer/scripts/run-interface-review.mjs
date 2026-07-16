#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { designReportManifestFromReview, writeDesignReport } from "./generate-design-report.mjs";

const require = createRequire(import.meta.url);
const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
const assessmentDimensions = ["accessibility", "performance", "themingDesignSystem", "responsiveContent", "antiSlop"];
const root = findRepoRoot();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const detectorPath = process.env.RUTHLESS_DESIGNER_DETECTOR_PATH
  ? path.resolve(process.env.RUTHLESS_DESIGNER_DETECTOR_PATH)
  : path.join(scriptDir, "detect-ui-antipatterns.mjs");
const options = parseArgs(process.argv.slice(2));

if (!options.path && !options.url) {
  usage();
  process.exit(2);
}

const slug = options.slug || slugify(options.url ? redactUrl(options.url) : options.path || "review");
const outDir = path.resolve(options.out || path.join(root, "output", "ruthless-designer", slug));
const screenshotsDir = path.join(outDir, "screenshots");
const resolvedTargetPath = options.path ? path.resolve(options.path) : null;
let invalidInputExitCode = null;
fs.mkdirSync(screenshotsDir, { recursive: true });

const review = {
  reviewedAt: new Date().toISOString(),
  cwd: process.cwd(),
  target: {
    path: resolvedTargetPath,
    pathInput: options.path || null,
    url: options.url ? redactUrl(options.url) : null,
  },
  ledger: {
    context: {
      register: options.register || "unknown",
      surface: options.surface || "unknown",
      viewports: options.viewports,
      states: options.states.length ? options.states : ["default"],
      waitUntil: options.waitUntil,
      settleMs: options.settleMs,
      deviceScaleFactor: options.deviceScaleFactor,
      clsThreshold: options.clsThreshold,
      signatureProof: options.signatureProof || null,
    },
    evidence: [],
    changeAmbition: options.ambition || "unknown",
    blockers: [],
  },
  static: null,
  runtime: null,
  findings: [],
  assessment: null,
  gates: [],
  expectations: [],
};

if (resolvedTargetPath && !fs.existsSync(resolvedTargetPath)) {
  invalidInputExitCode = 2;
  review.ledger.blockers.push({
    gate: "static-detector",
    reason: `Target does not exist: ${resolvedTargetPath}`,
  });
}

if (options.requireRuntime && !options.url) {
  review.ledger.blockers.push({
    gate: "runtime-visual",
    reason: "--require-runtime was set, but no --url was provided.",
  });
}
if (options.signatureProof) {
  review.ledger.evidence.push({
    type: "signature-claim",
    status: "claimed",
    detail: options.signatureProof,
  });
}

if (resolvedTargetPath && invalidInputExitCode === null) runStaticReview(review);
if (options.url) review.runtime = await runRuntimeReview(review);

review.findings = collectFindings(review);
review.gates = evaluateGates(review);
review.assessment = assessReview(review);
review.expectations = evaluateExpectations(review, options);

const jsonPath = path.join(outDir, "review.json");
const markdownPath = path.join(outDir, "README.md");
const htmlPath = path.join(outDir, "report.html");
const reportReview = redactReportValue(review);
fs.writeFileSync(jsonPath, `${JSON.stringify(reportReview, null, 2)}\n`);
fs.writeFileSync(markdownPath, renderMarkdown(reportReview, jsonPath));
const designReport = writeDesignReport({
  manifest: designReportManifestFromReview(reportReview, { baseDir: root }),
  outPath: htmlPath,
  baseDir: root,
  embedImages: true,
  strictAssets: false,
});

const summary = {
  outDir: path.relative(root, outDir),
  htmlReport: path.relative(root, designReport.outPath),
  findings: reportReview.findings.length,
  bySeverity: summarizeSeverity(reportReview.findings),
  assessment: reportReview.assessment,
  gates: reportReview.gates,
  blockers: reportReview.ledger.blockers,
  expectations: reportReview.expectations,
};
console.log(JSON.stringify(summary, null, 2));

if (options.failOn && review.findings.some((finding) => severityRank[finding.severity] <= severityRank[options.failOn])) {
  process.exitCode = 1;
}
if (options.fail && review.gates.some((gate) => gate.status === "fail")) {
  process.exitCode = 1;
}
if (review.expectations.some((expectation) => expectation.status === "fail")) {
  process.exitCode = 1;
}
if (review.assessment.result === "blocked" && options.expectAssessment !== "blocked") process.exitCode = 1;
if (invalidInputExitCode !== null) process.exitCode = invalidInputExitCode;

function runStaticReview(targetReview) {
  const staticPath = path.join(outDir, "static-findings.json");
  fs.rmSync(staticPath, { force: true });
  const args = [detectorPath, "--json", "--out", staticPath, resolvedTargetPath];
  let result;
  try {
    result = spawnSync(process.execPath, args, {
      cwd: root,
      encoding: "utf8",
    });
  } catch (error) {
    targetReview.ledger.blockers.push({
      gate: "static-detector",
      reason: `Detector could not start: ${redactText(error.message)}`,
    });
    return;
  }
  if (result.error || result.status !== 0) {
    targetReview.ledger.blockers.push({
      gate: "static-detector",
      reason: redactText(result.error?.message || result.stderr || result.stdout || `detector exited ${result.status}`),
    });
    return;
  }
  try {
    targetReview.static = redactReportValue(JSON.parse(fs.readFileSync(staticPath, "utf8")));
    fs.writeFileSync(staticPath, `${JSON.stringify(targetReview.static, null, 2)}\n`);
  } catch (error) {
    targetReview.ledger.blockers.push({
      gate: "static-detector",
      reason: `Detector output could not be read: ${redactText(error.message)}`,
    });
    return;
  }
  if (!Number.isFinite(targetReview.static.files) || targetReview.static.files <= 0) {
    targetReview.ledger.blockers.push({
      gate: "static-detector",
      reason: "Detector observed zero compatible files.",
    });
    return;
  }
  if (!Array.isArray(targetReview.static.findings)) {
    targetReview.ledger.blockers.push({
      gate: "static-detector",
      reason: "Detector output is invalid: findings must be an array.",
    });
    targetReview.static = null;
    return;
  }
  targetReview.ledger.evidence.push({
    type: "static-detector",
    observation: "observed",
    capture: "not-applicable",
    comparison: "not-applicable",
    path: path.relative(root, staticPath),
    files: targetReview.static.files,
    findings: targetReview.static.findings.length,
  });
}

async function runRuntimeReview(targetReview) {
  const playwright = loadPlaywright();
  if (!playwright) {
    const reason = "Playwright not found. Install Playwright in the target project, set PLAYWRIGHT_PATH, or use temp runtime at %TEMP%/ruthless-designer-playwright.";
    targetReview.ledger.blockers.push({
      gate: "runtime-visual",
      reason,
    });
    return persistRuntimeReview(targetReview, [], [], new Error(reason));
  }

  let actionGroups;
  try {
    actionGroups = loadActionGroups(options);
  } catch (error) {
    targetReview.ledger.blockers.push({
      gate: "runtime-visual",
      reason: `Runtime actions could not be loaded: ${redactText(error.message)}`,
    });
    return persistRuntimeReview(targetReview, [], [], error);
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
  } catch (error) {
    targetReview.ledger.blockers.push({
      gate: "runtime-visual",
      reason: `Browser launch failed: ${redactText(error.message)}`,
    });
    return persistRuntimeReview(targetReview, actionGroups, [], error);
  }

  const results = [];
  let runtimeError = null;
  try {
    for (const viewport of options.viewports) {
      for (const actionGroup of actionGroups) {
        results.push(await inspectViewport(browser, viewport, actionGroup));
      }
    }
  } catch (error) {
    runtimeError = error;
    targetReview.ledger.blockers.push({
      gate: "runtime-visual",
      reason: `Runtime review aborted: ${redactText(error.message)}`,
    });
  } finally {
    await browser.close().catch((error) => {
      targetReview.ledger.blockers.push({
        gate: "runtime-visual",
        reason: `Browser close failed: ${redactText(error.message)}`,
      });
    });
  }

  return persistRuntimeReview(targetReview, actionGroups, results, runtimeError);
}

function persistRuntimeReview(targetReview, actionGroups, results, error = null) {
  const runtimePath = path.join(outDir, "runtime-findings.json");
  const runtime = {
    url: redactUrl(options.url),
    actionGroups: actionGroups.map((group) => ({
      name: group.name,
      source: group.source,
      actions: group.actions.map((action) => sanitizeAction(action)),
    })),
    results,
    evidence: runtimeEvidenceForResults(results),
    error: error ? redactText(error.message) : null,
  };
  fs.writeFileSync(runtimePath, `${JSON.stringify(redactReportValue(runtime), null, 2)}\n`);
  targetReview.ledger.evidence.push({
    type: "runtime-visual",
    observation: runtime.evidence.observation,
    capture: runtime.evidence.capture,
    comparison: runtime.evidence.comparison,
    path: path.relative(root, runtimePath),
    screenshots: runtime.evidence.screenshots,
  });
  return runtime;
}

function runtimeEvidenceForResults(results) {
  const successful = results.filter((result) => result.ok);
  const captured = successful.filter((result) => result.screenshot);
  const allObserved = results.length > 0 && successful.length === results.length;
  const allCaptured = allObserved && captured.length === results.length;
  return {
    observation: allObserved ? "observed" : successful.length ? "partial" : results.length ? "failed" : "not-observed",
    capture: allCaptured ? "captured" : captured.length ? "partial" : "not-captured",
    comparison: "not-compared",
    successfulRuns: successful.length,
    totalRuns: results.length,
    screenshots: captured.map((result) => result.screenshot),
  };
}

async function inspectViewport(browser, viewport, actionGroup) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: options.deviceScaleFactor });
  const consoleErrors = [];
  const requestFailures = [];
  const badResponses = [];
  const assertions = [];
  let signatureAssertion = null;
  let transferredBytes = 0;

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    const url = request.url();
    const failureText = request.failure()?.errorText ?? "";
    if (!/favicon\.ico$/.test(url)) requestFailures.push(`${url} ${failureText}`.trim());
  });
  page.on("response", async (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
    const length = Number(response.headers()["content-length"]);
    if (Number.isFinite(length)) transferredBytes += length;
  });

  await page.addInitScript(() => {
    window.__uiAudit = { longTasks: [], layoutShifts: [], frames: [] };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__uiAudit.longTasks.push({ duration: entry.duration, name: entry.name, startTime: entry.startTime });
        }
      }).observe({ type: "longtask", buffered: true });
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__uiAudit.layoutShifts.push({
            value: entry.value,
            hadRecentInput: entry.hadRecentInput,
            startTime: entry.startTime,
          });
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}
    let last = performance.now();
    const tick = (now) => {
      window.__uiAudit.frames.push(now - last);
      last = now;
      if (window.__uiAudit.frames.length < 240) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  try {
    await page.goto(options.url, { waitUntil: options.waitUntil, timeout: options.timeout });
    await page.waitForTimeout(options.settleMs);
    for (const action of actionGroup.actions) {
      const assertion = await applyAction(page, action);
      if (assertion) assertions.push(assertion);
    }
    if (options.signatureSelector) {
      signatureAssertion = await applyObservableAssertion(page, {
        type: "assert-visible",
        selector: options.signatureSelector,
        timeout: options.timeout,
      });
    }
    await page.waitForTimeout(options.settleMs);

    const suffix = `${safeFilePart(actionGroup.name)}-${viewport.width}x${viewport.height}`;
    const screenshotPath = path.join(screenshotsDir, `${suffix}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const metrics = await page.evaluate(() => {
      const visible = (node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return rect.width > 1 && rect.height > 1 && style.display !== "none" && style.visibility !== "hidden";
      };
      const interactive = [...document.querySelectorAll("button, a, input, select, textarea, [role='button'], [tabindex]:not([tabindex='-1'])")].filter(visible);
      const smallHitAreas = interactive
        .map((node) => {
          const rect = node.getBoundingClientRect();
          const name = node.getAttribute("aria-label") || node.textContent?.trim() || node.getAttribute("title") || node.getAttribute("name") || node.id || node.tagName.toLowerCase();
          const width = Math.round(rect.width);
          const height = Math.round(rect.height);
          return {
            name: String(name).slice(0, 80),
            width,
            height,
            assessment: width < 24 || height < 24 ? "minimum-size-review" : "comfort-target-advisory",
          };
        })
        .filter((item) => item.width < 40 || item.height < 40)
        .slice(0, 12);
      const unnamedButtons = [...document.querySelectorAll("button")]
        .filter(visible)
        .filter((button) => {
          const name = button.getAttribute("aria-label") || button.getAttribute("aria-labelledby") || button.getAttribute("title") || button.textContent?.trim();
          return !name;
        })
        .length;
      const clippedText = [...document.querySelectorAll("body *")]
        .filter(visible)
        .filter((node) => {
          const style = getComputedStyle(node);
          if (style.overflowX === "visible" && style.textOverflow !== "ellipsis") return false;
          return node.scrollWidth > node.clientWidth + 1 && node.textContent?.trim();
        })
        .slice(0, 12)
        .map((node) => ({
          tag: node.tagName.toLowerCase(),
          text: node.textContent.trim().slice(0, 100),
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
        }));
      const imageIssues = [...document.images]
        .filter(visible)
        .map((img) => {
          const rect = img.getBoundingClientRect();
          return {
            src: img.currentSrc || img.src,
            alt: img.getAttribute("alt"),
            widthAttr: img.getAttribute("width"),
            heightAttr: img.getAttribute("height"),
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            renderedWidth: Math.round(rect.width),
            renderedHeight: Math.round(rect.height),
            loading: img.getAttribute("loading"),
          };
        })
        .filter((img) => !img.widthAttr || !img.heightAttr || img.alt === null || img.naturalWidth === 0)
        .slice(0, 12);
      const labelFor = (node) => {
        const id = node.id ? `#${node.id}` : "";
        const classes = typeof node.className === "string" ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((name) => `.${name}`).join("") : "";
        return `${node.tagName.toLowerCase()}${id}${classes}`.slice(0, 120);
      };
      const styleRules = [];
      const collectRules = (rules) => {
        for (const rule of rules || []) {
          if (rule.cssRules) collectRules(rule.cssRules);
          else if (rule.selectorText && rule.style) styleRules.push(rule);
        }
      };
      for (const sheet of document.styleSheets) {
        try { collectRules(sheet.cssRules); } catch {}
      }
      const matchesScrollbarRule = (node) => styleRules.some((rule) => String(rule.selectorText).split(",").some((selector) => {
        const base = selector.split("::")[0].trim();
        const mentionsScrollbar = /::-(?:webkit-)?scrollbar/i.test(selector) || rule.style.getPropertyValue("scrollbar-width") || rule.style.getPropertyValue("scrollbar-color");
        if (!mentionsScrollbar) return false;
        try { return !base || base === "*" || node.matches(base); } catch { return false; }
      }));
      const scrollCandidates = [...new Set([document.scrollingElement, ...document.querySelectorAll("body *")].filter(Boolean))];
      const nativeScrollbarRisks = scrollCandidates
        .filter((node) => {
          const style = getComputedStyle(node);
          const rootScrollable = node === document.scrollingElement && (document.documentElement.scrollHeight > window.innerHeight + 1 || document.documentElement.scrollWidth > window.innerWidth + 1);
          const y = node.scrollHeight > node.clientHeight + 1 && ["auto", "scroll"].includes(style.overflowY);
          const x = node.scrollWidth > node.clientWidth + 1 && ["auto", "scroll"].includes(style.overflowX);
          return visible(node) && (rootScrollable || y || x);
        })
        .filter((node) => {
          const style = getComputedStyle(node);
          const standardCustom = (style.scrollbarWidth && style.scrollbarWidth !== "auto") || (style.scrollbarColor && style.scrollbarColor !== "auto");
          return !standardCustom && !matchesScrollbarRule(node);
        })
        .slice(0, 12)
        .map((node) => ({
          node: labelFor(node),
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
          scrollHeight: node.scrollHeight,
          clientHeight: node.clientHeight,
        }));
      const textRect = (node) => {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const rects = [];
        while (walker.nextNode()) {
          const textNode = walker.currentNode;
          if (!textNode.textContent.trim() || textNode.parentElement?.closest("svg")) continue;
          const range = document.createRange();
          range.selectNodeContents(textNode);
          for (const rect of range.getClientRects()) if (rect.width > 0 && rect.height > 0) rects.push(rect);
        }
        if (!rects.length) return null;
        return {
          top: Math.min(...rects.map((rect) => rect.top)),
          bottom: Math.max(...rects.map((rect) => rect.bottom)),
        };
      };
      const iconAlignmentIssues = [...document.querySelectorAll("button, a, [role='button'], [role='menuitem']")]
        .filter(visible)
        .map((control) => {
          const icon = control.querySelector("svg, [data-icon], img.icon");
          const text = textRect(control);
          if (!icon || !text || !visible(icon)) return null;
          const iconBox = icon.getBoundingClientRect();
          if (iconBox.width > 64 || iconBox.height > 64) return null;
          const delta = Math.abs((iconBox.top + iconBox.bottom) / 2 - (text.top + text.bottom) / 2);
          return delta > 4 ? { control: labelFor(control), deltaY: Number(delta.toFixed(2)), iconSize: `${Math.round(iconBox.width)}x${Math.round(iconBox.height)}` } : null;
        })
        .filter(Boolean)
        .slice(0, 12);
      const repeatedSpacingIssues = [...document.querySelectorAll("ul, ol, [role='list'], [data-ui-list]")]
        .filter(visible)
        .map((container) => {
          const items = [...container.children].filter(visible);
          if (items.length < 3) return null;
          const boxes = items.map((item) => item.getBoundingClientRect()).sort((a, b) => a.top - b.top);
          if (boxes.some((box, index) => index > 0 && box.top < boxes[index - 1].bottom - 1)) return null;
          const gaps = boxes.slice(1).map((box, index) => Number((box.top - boxes[index].bottom).toFixed(2)));
          const spread = Math.max(...gaps) - Math.min(...gaps);
          return spread > 3 ? { container: labelFor(container), gaps, spread: Number(spread.toFixed(2)) } : null;
        })
        .filter(Boolean)
        .slice(0, 12);
      const gradientSurfaces = [...document.querySelectorAll("body *")]
        .filter(visible)
        .filter((node) => {
          const style = getComputedStyle(node);
          return /gradient\(/i.test(style.backgroundImage) || style.backgroundClip === "text" || style.webkitBackgroundClip === "text";
        })
        .slice(0, 20)
        .map((node) => labelFor(node));
      const parseColor = (value) => {
        const match = String(value).match(/rgba?\(([^)]+)\)/);
        if (!match) return null;
        const parts = match[1].split(",").map((part) => Number(part.trim()));
        if (parts.length < 3 || parts.some((part, index) => index < 3 && !Number.isFinite(part))) return null;
        return { r: parts[0], g: parts[1], b: parts[2], a: Number.isFinite(parts[3]) ? parts[3] : 1 };
      };
      const blend = (fg, bg) => ({
        r: fg.r * fg.a + bg.r * (1 - fg.a),
        g: fg.g * fg.a + bg.g * (1 - fg.a),
        b: fg.b * fg.a + bg.b * (1 - fg.a),
        a: 1,
      });
      const channel = (value) => {
        const v = value / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (color) => 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
      const contrast = (a, b) => {
        const l1 = luminance(a);
        const l2 = luminance(b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      const backgroundFor = (node) => {
        let current = node;
        let bg = { r: 255, g: 255, b: 255, a: 1 };
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          const color = parseColor(getComputedStyle(current).backgroundColor);
          if (color && color.a > 0) {
            bg = color.a >= 1 ? color : blend(color, bg);
            if (bg.a >= 1) break;
          }
          current = current.parentElement;
        }
        return bg;
      };
      const contrastIssues = [...document.querySelectorAll("body *")]
        .filter(visible)
        .filter((node) => {
          if (["script", "style", "svg", "path"].includes(node.tagName.toLowerCase())) return false;
          const text = node.textContent?.trim();
          if (!text || text.length < 2) return false;
          return ![...node.children].some((child) => child.textContent?.trim());
        })
        .map((node) => {
          const style = getComputedStyle(node);
          const fg = parseColor(style.color);
          if (!fg) return null;
          const ratio = contrast(fg.a >= 1 ? fg : blend(fg, backgroundFor(node)), backgroundFor(node));
          const fontSize = Number.parseFloat(style.fontSize || "16");
          const fontWeight = Number.parseInt(style.fontWeight || "400", 10);
          const largeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
          const threshold = largeText ? 3 : 4.5;
          if (ratio >= threshold) return null;
          return {
            tag: node.tagName.toLowerCase(),
            text: text.slice(0, 100),
            ratio: Number(ratio.toFixed(2)),
            threshold,
            color: style.color,
            background: getComputedStyle(node).backgroundColor,
          };
        })
        .filter(Boolean)
        .slice(0, 12);
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const isInViewport = (node) => {
        if (!node || typeof node.getBoundingClientRect !== "function") return true;
        const rect = node.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < viewportHeight && rect.right > 0 && rect.left < viewportWidth;
      };
      const animations = document.getAnimations ? document.getAnimations().map((animation) => {
        const target = animation.effect && animation.effect.target ? animation.effect.target : null;
        const rect = target && target.getBoundingClientRect ? target.getBoundingClientRect() : null;
        return {
          name: animation.animationName || "",
          playState: animation.playState,
          visible: target ? isInViewport(target) : true,
          tag: target && target.tagName ? target.tagName.toLowerCase() : "",
          classes: target && target.className ? String(target.className).slice(0, 140) : "",
          top: rect ? Math.round(rect.top) : null,
          bottom: rect ? Math.round(rect.bottom) : null,
        };
      }) : [];
      const runningAnimations = animations.filter((animation) => animation.playState === "running");
      const offscreenRunningAnimations = runningAnimations.filter((animation) => !animation.visible);
      const canvasDetails = [...document.querySelectorAll("canvas")].map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return {
          classes: String(canvas.className || "").slice(0, 140),
          width: canvas.width || 0,
          height: canvas.height || 0,
          renderedWidth: Math.round(rect.width),
          renderedHeight: Math.round(rect.height),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          visible: isInViewport(canvas),
          animationActive: canvas.dataset.animationActive || canvas.dataset.active || canvas.dataset.running || "",
        };
      });
      const frames = window.__uiAudit?.frames || [];
      const sorted = [...frames].sort((a, b) => a - b);
      const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;
      const max = sorted.length ? sorted[sorted.length - 1] : 0;
      const layoutShifts = (window.__uiAudit?.layoutShifts || []).filter((entry) => !entry.hadRecentInput);
      const cls = layoutShifts.reduce((sum, entry) => sum + entry.value, 0);
      return {
        title: document.title,
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        smallHitAreas,
        unnamedButtons,
        clippedText,
        imageIssues,
        nativeScrollbarRisks,
        iconAlignmentIssues,
        repeatedSpacingIssues,
        gradientSurfaces,
        contrastIssues,
        animationAudit: {
          total: animations.length,
          running: runningAnimations.length,
          offscreenRunningCount: offscreenRunningAnimations.length,
          offscreenRunning: offscreenRunningAnimations.slice(0, 12),
        },
        canvasDetails: canvasDetails.slice(0, 20),
        longTasks: window.__uiAudit?.longTasks || [],
        layoutShifts,
        cls,
        frameStats: {
          samples: frames.length,
          p95: Number(p95.toFixed(2)),
          max: Number(max.toFixed(2)),
        },
      };
    });

    return {
      viewport,
      state: actionGroup.name,
      screenshot: path.relative(root, screenshotPath),
      ok: true,
      transferredBytes,
      consoleErrors,
      requestFailures,
      badResponses,
      assertions,
      signatureAssertion,
      metrics,
      findings: runtimeFindings(viewport, actionGroup.name, metrics, consoleErrors, requestFailures, badResponses),
    };
  } catch (error) {
    const suffix = `${safeFilePart(actionGroup.name)}-${viewport.width}x${viewport.height}-error`;
    const screenshotPath = path.join(screenshotsDir, `${suffix}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    return {
      viewport,
      state: actionGroup.name,
      screenshot: fs.existsSync(screenshotPath) ? path.relative(root, screenshotPath) : null,
      ok: false,
      transferredBytes,
      consoleErrors,
      requestFailures,
      badResponses,
      assertions,
      signatureAssertion,
      metrics: null,
      findings: [
        {
          id: "runtime-audit-error",
          category: "runtime",
          severity: "P1",
          message: `Runtime audit failed: ${error.message}`,
          file: options.url,
          line: 0,
          snippet: error.message,
        },
      ],
    };
  } finally {
    await page.close();
  }
}

function runtimeFindings(viewport, state, metrics, consoleErrors, requestFailures, badResponses) {
  const file = `${options.url} @ ${state} ${viewport.width}x${viewport.height}`;
  const findings = [];
  const push = (id, severity, category, message, snippet) => {
    findings.push({ id, severity, category, message, file, line: 0, snippet: String(snippet).slice(0, 180) });
  };

  if (consoleErrors.length) push("console-errors", "P1", "runtime", "Console errors appeared in audited state.", consoleErrors[0]);
  if (requestFailures.length) push("request-failures", "P1", "runtime", "Network requests failed in audited state.", requestFailures[0]);
  if (badResponses.length) push("bad-http-responses", "P1", "runtime", "HTTP error responses appeared in audited state.", badResponses[0]);
  if (metrics.horizontalOverflow) push("horizontal-overflow", "P1", "resilience", "Viewport has horizontal overflow.", `scrollWidth ${metrics.scrollWidth} > innerWidth ${metrics.width}`);
  if (metrics.unnamedButtons) push("unnamed-buttons", "P1", "accessibility", "Visible buttons without accessible names.", `${metrics.unnamedButtons} unnamed button(s)`);
  const minimumSizeReview = metrics.smallHitAreas.find((item) => item.width < 24 || item.height < 24);
  if (minimumSizeReview) {
    push(
      "small-hit-area",
      "P2",
      "accessibility",
      "A visible control has a measured box below 24px; review target spacing and applicable WCAG exceptions before calling it a failure.",
      JSON.stringify(minimumSizeReview),
    );
  } else if (metrics.smallHitAreas.length) {
    push(
      "small-hit-area-advisory",
      "P3",
      "accessibility",
      "Some controls are below the internal 40px comfort target. This is an ergonomic advisory, not a uniform WCAG failure.",
      JSON.stringify(metrics.smallHitAreas[0]),
    );
  }
  if (metrics.clippedText.length) push("clipped-text", "P2", "resilience", "Text appears clipped or horizontally overflowing.", JSON.stringify(metrics.clippedText[0]));
  if (metrics.nativeScrollbarRisks?.length) push("native-scrollbar-runtime", "P2", "quality", "A rendered scroll region still relies on an uncustomized native scrollbar; style it minimally without hiding or breaking the affordance.", JSON.stringify(metrics.nativeScrollbarRisks[0]));
  if (metrics.iconAlignmentIssues?.length) push("icon-text-misalignment", "P2", "quality", "A rendered control icon is vertically misaligned with its text; confirm the crop and repair the shared control/icon primitive.", JSON.stringify(metrics.iconAlignmentIssues[0]));
  if (metrics.repeatedSpacingIssues?.length) push("inconsistent-repeated-spacing", "P2", "quality", "A repeated rendered list has materially inconsistent sibling gaps; confirm intentional grouping or repair the spacing source.", JSON.stringify(metrics.repeatedSpacingIssues[0]));
  if (metrics.gradientSurfaces?.length) push("gradient-finish-review", "P3", "quality", "Rendered gradients are present. Inspect their role, stops, contrast, banding, clipping, and fallback; their presence alone is not a failure.", JSON.stringify(metrics.gradientSurfaces.slice(0, 3)));
  if (metrics.imageIssues.length) push("runtime-image-issues", "P2", "performance", "Visible images have missing alt/dimensions or broken natural size.", JSON.stringify(metrics.imageIssues[0]));
  if (metrics.contrastIssues?.length) push("low-contrast-text", "P1", "accessibility", "Visible text appears below WCAG contrast threshold.", JSON.stringify(metrics.contrastIssues[0]));
  if (metrics.animationAudit?.offscreenRunningCount) push("offscreen-running-animation", "P2", "performance", "Animations are running outside the viewport; pause offscreen decorative motion.", JSON.stringify(metrics.animationAudit.offscreenRunning[0]));
  const activeOffscreenCanvas = (metrics.canvasDetails || []).find((canvas) => !canvas.visible && /^(true|1|running|active)$/i.test(String(canvas.animationActive || "")));
  if (activeOffscreenCanvas) push("offscreen-active-canvas", "P2", "performance", "Canvas/WebGL region is marked active outside the viewport; pause or lower work offscreen.", JSON.stringify(activeOffscreenCanvas));
  if (metrics.longTasks.length) push("long-task", "P1", "performance", "Long tasks occurred during audited state.", `${metrics.longTasks.length} long task(s)`);
  if (metrics.frameStats.p95 > 20) push("frame-p95-budget", "P2", "performance", "Frame p95 exceeds 20ms budget.", `${metrics.frameStats.p95}ms`);
  if (metrics.frameStats.max > 50) push("frame-max-budget", "P2", "performance", "Frame max exceeds 50ms budget.", `${metrics.frameStats.max}ms`);
  if (metrics.cls > options.clsThreshold) {
    push(
      "layout-shift",
      "P1",
      "performance",
      `Cumulative layout shift exceeded the configured ${options.clsThreshold} threshold.`,
      `CLS ${metrics.cls.toFixed(4)} > ${options.clsThreshold}`,
    );
  }

  return findings;
}

async function applyAction(page, action) {
  const timeout = action.timeout || 5000;
  if (action.type === "click") await page.click(action.selector, { timeout });
  else if (action.type === "hover") await page.hover(action.selector, { timeout });
  else if (action.type === "type") await page.fill(action.selector, action.value || "", { timeout });
  else if (action.type === "press") await page.press(action.selector || "body", action.key, { timeout });
  else if (action.type === "scroll") await page.mouse.wheel(action.x || 0, action.y || 600);
  else if (action.type === "wait") await page.waitForTimeout(action.ms || 250);
  else if (isObservableAssertion(action)) return applyObservableAssertion(page, action);
  else throw new Error(`Unsupported action type: ${action.type}`);
  return null;
}

function isObservableAssertion(action) {
  return ["assert-visible", "assert-text", "assert-url"].includes(action?.type);
}

function hasObservableStateAssertion(group) {
  let interactionObserved = false;
  for (const action of group.actions || []) {
    if (["click", "type", "press"].includes(action.type)) interactionObserved = true;
    if (["assert-visible", "assert-text"].includes(action.type)) return true;
    if (action.type === "assert-url" && interactionObserved) return true;
  }
  return false;
}

async function applyObservableAssertion(page, action) {
  const timeout = action.timeout || 5000;
  if (action.type === "assert-visible") {
    if (!action.selector) throw new Error("assert-visible requires selector");
    await page.locator(action.selector).waitFor({ state: "visible", timeout });
    return { type: action.type, selector: action.selector, verified: true };
  }
  if (action.type === "assert-text") {
    if (!action.selector || typeof action.value !== "string" || !action.value.length) {
      throw new Error("assert-text requires selector and non-empty value");
    }
    const locator = page.locator(action.selector);
    await locator.waitFor({ state: "visible", timeout });
    const actual = String((await locator.textContent({ timeout })) || "");
    if (!actual.includes(action.value)) throw new Error(`assert-text failed for ${action.selector}`);
    return { type: action.type, selector: action.selector, verified: true };
  }
  if (action.type === "assert-url") {
    if (typeof action.value !== "string" || !action.value.length) throw new Error("assert-url requires non-empty value");
    const actual = page.url();
    if (!actual.includes(action.value)) throw new Error("assert-url failed");
    return { type: action.type, verified: true };
  }
  throw new Error(`Unsupported assertion type: ${action.type}`);
}

function collectFindings(targetReview) {
  const findings = [];
  if (targetReview.static?.findings) findings.push(...targetReview.static.findings);
  for (const result of targetReview.runtime?.results || []) findings.push(...(result.findings || []));
  return findings.sort(
    (a, b) =>
      severityRank[a.severity] - severityRank[b.severity] ||
      String(a.file).localeCompare(String(b.file)) ||
      String(a.id).localeCompare(String(b.id)),
  );
}

function assessReview(targetReview) {
  const observed = new Set();
  if ((targetReview.static?.files || 0) > 0) {
    observed.add("themingDesignSystem");
    observed.add("antiSlop");
  }

  const runtimeEvidence = runtimeEvidenceSummary(targetReview);
  if (runtimeEvidence.successfulRuns > 0) {
    observed.add("accessibility");
    observed.add("performance");
    observed.add("responsiveContent");
  }

  for (const finding of targetReview.findings) {
    if (finding.category === "accessibility") observed.add("accessibility");
    if (finding.category === "performance" || finding.category === "runtime" || finding.category === "motion") observed.add("performance");
    if (finding.category === "design-system" || finding.category === "quality") observed.add("themingDesignSystem");
    if (finding.category === "resilience") observed.add("responsiveContent");
    if (finding.category === "slop") observed.add("antiSlop");
  }

  const observedDimensions = assessmentDimensions.filter((dimension) => observed.has(dimension));
  const failedRequiredGates = targetReview.gates.filter((gate) => gate.status === "fail" && gate.required !== false);
  const highestSeverity = targetReview.findings.length ? targetReview.findings[0].severity : null;
  const integrityBlocked = failedRequiredGates.length > 0 || highestSeverity === "P0" || highestSeverity === "P1";
  return {
    result: failedRequiredGates.length ? "blocked" : targetReview.findings.length ? "findings" : "evidence-collected",
    highestSeverity,
    observedDimensions,
    unknownDimensions: assessmentDimensions.filter((dimension) => !observed.has(dimension)),
    evidence: {
      static: {
        observation: options.path ? ((targetReview.static?.files || 0) > 0 ? "observed" : "blocked") : "not-requested",
        files: Number(targetReview.static?.files || 0),
      },
      runtime: {
        observation: runtimeEvidence.observation,
        capture: runtimeEvidence.capture,
        comparison: runtimeEvidence.comparison,
        successfulRuns: runtimeEvidence.successfulRuns,
        failedRuns: runtimeEvidence.totalRuns - runtimeEvidence.successfulRuns,
      },
    },
    claims: {
      productionIntegrity: integrityBlocked ? "blocked" : "limited",
      taskEffectiveness: "not-assessed",
      distinctiveness: "not-assessed",
    },
  };
}

function evaluateGates(targetReview) {
  const gates = [];
  const p1 = targetReview.findings.filter((finding) => finding.severity === "P1");
  gates.push({
    gate: "p1-unresolved",
    required: false,
    status: p1.length ? "fail" : "pass",
    detail: p1.length ? `${p1.length} P1 finding(s)` : "no P1 findings",
  });
  const staticFiles = Number(targetReview.static?.files || 0);
  const staticBlocker = targetReview.ledger.blockers.find((blocker) => blocker.gate === "static-detector");
  gates.push({
    gate: "static-detector",
    required: Boolean(options.path),
    status: options.path ? (targetReview.static && staticFiles > 0 ? "pass" : "fail") : "skip",
    detail: options.path
      ? targetReview.static && staticFiles > 0
        ? `detector observed ${staticFiles} compatible file(s)`
        : targetReview.static
          ? "detector observed zero compatible files"
          : `detector blocked${staticBlocker?.reason ? `: ${singleLine(staticBlocker.reason)}` : ""}`
      : "no local path",
  });
  gates.push({
    gate: "runtime-visual",
    required: Boolean(options.url || options.requireRuntime),
    status: options.url || options.requireRuntime
      ? runtimeEvidenceSummary(targetReview).observation === "observed" && runtimeEvidenceSummary(targetReview).capture === "captured"
        ? "pass"
        : "fail"
      : "skip",
    detail: options.url
      ? runtimeEvidenceSummary(targetReview).observation === "observed" && runtimeEvidenceSummary(targetReview).capture === "captured"
        ? `runtime observed and screenshots captured; visual comparison ${runtimeEvidenceSummary(targetReview).comparison}`
        : `runtime evidence incomplete: observation=${runtimeEvidenceSummary(targetReview).observation}, capture=${runtimeEvidenceSummary(targetReview).capture}, comparison=${runtimeEvidenceSummary(targetReview).comparison}`
      : options.requireRuntime
        ? "runtime required but no URL provided"
        : "no URL",
  });
  if (options.requireSignature || options.signatureProof || options.signatureSelector) {
    const runtimeEvidence = runtimeEvidenceSummary(targetReview);
    const runtimeResults = targetReview.runtime?.results || [];
    const verifiedSignatureAssertions = runtimeResults.filter(
      (result) => result.ok && result.signatureAssertion?.verified === true,
    );
    const signatureObserved =
      Boolean(options.signatureProof) &&
      Boolean(options.signatureSelector) &&
      runtimeResults.length > 0 &&
      verifiedSignatureAssertions.length === runtimeResults.length &&
      runtimeEvidence.observation === "observed" &&
      runtimeEvidence.capture === "captured";
    targetReview.ledger.evidence.push({
      type: "signature-proof",
      observation: signatureObserved ? "verified" : runtimeEvidence.capture === "captured" ? "captured-unverified" : "unverified",
      capture: runtimeEvidence.capture,
      comparison: runtimeEvidence.comparison,
      selector: options.signatureSelector || null,
    });
    gates.push({
      gate: "signature-proof",
      required: true,
      status: signatureObserved ? "pass" : "fail",
      detail: signatureObserved
        ? `${options.signatureProof}; selector observed in ${verifiedSignatureAssertions.length} successful captured run(s)`
        : options.signatureProof
          ? runtimeEvidence.capture === "captured"
            ? "signature claim was captured but remains unverified; provide --signature-selector with an observable target"
            : "signature claim supplied, but successful runtime screenshot evidence is missing"
          : "signature proof required but missing",
    });
  }
  if (options.asyncUi) {
    const expected = ["empty", "loading", "error", "permission", "long-content", "slow-network", "rapid-click"];
    const declaredStates = new Set(options.states);
    const actionGroups = targetReview.runtime?.actionGroups || [];
    const runtimeGroups = new Set(actionGroups.map((group) => group.name));
    const assertedGroups = new Set(
      actionGroups.filter((group) => hasObservableStateAssertion(group)).map((group) => group.name),
    );
    const verifiedStates = new Set(
      (targetReview.runtime?.results || [])
        .filter((result) => result.ok && result.assertions?.some((assertion) => assertion.verified === true))
        .map((result) => result.state),
    );
    const missingDeclarations = expected.filter((state) => !declaredStates.has(state));
    const missingActionGroups = expected.filter((state) => !runtimeGroups.has(state));
    const missingAssertions = expected.filter((state) => !assertedGroups.has(state));
    const missingRuntimeEvidence = expected.filter((state) => !verifiedStates.has(state));
    const complete = !missingDeclarations.length && !missingActionGroups.length && !missingAssertions.length && !missingRuntimeEvidence.length;
    const gaps = [];
    if (missingDeclarations.length) gaps.push(`not declared: ${missingDeclarations.join(", ")}`);
    if (missingActionGroups.length) gaps.push(`missing action groups: ${missingActionGroups.join(", ")}`);
    if (missingAssertions.length) gaps.push(`missing observable assertions: ${missingAssertions.join(", ")}`);
    if (missingRuntimeEvidence.length) gaps.push(`no verified runtime assertion: ${missingRuntimeEvidence.join(", ")}`);
    gates.push({
      gate: "async-state-coverage",
      required: true,
      status: complete ? "pass" : "fail",
      detail: complete ? "all async states declared and verified by observable runtime assertions" : gaps.join("; "),
    });
  }
  return gates;
}

function runtimeEvidenceSummary(targetReview) {
  if (targetReview.runtime?.evidence) return targetReview.runtime.evidence;
  return runtimeEvidenceForResults(targetReview.runtime?.results || []);
}

function evaluateExpectations(targetReview, targetOptions) {
  const expectations = [];
  for (const id of targetOptions.expectFindings) {
    const found = targetReview.findings.some((finding) => finding.id === id);
    expectations.push({
      expectation: `finding:${id}`,
      status: found ? "pass" : "fail",
      detail: found ? "finding present" : "finding missing",
    });
  }
  if (targetOptions.expectAssessment) {
    const found = targetReview.assessment.result === targetOptions.expectAssessment;
    expectations.push({
      expectation: `assessment:${targetOptions.expectAssessment}`,
      status: found ? "pass" : "fail",
      detail: `actual ${targetReview.assessment.result}`,
    });
  }
  return expectations;
}

function renderMarkdown(targetReview, jsonPath) {
  const screenshotPaths = (targetReview.runtime?.results || []).map((result) => result.screenshot).filter(Boolean);
  const lines = [
    "# Interface Review",
    "",
    `Generated: ${targetReview.reviewedAt}`,
    `Target path: ${targetReview.target.path || "n/a"}`,
    `Target URL: ${targetReview.target.url || "n/a"}`,
    `Review JSON: ${path.relative(root, jsonPath)}`,
    "",
    `Assessment: ${targetReview.assessment.result}`,
    `Highest severity: ${targetReview.assessment.highestSeverity || "none"}`,
    `Observed dimensions: ${targetReview.assessment.observedDimensions.join(", ") || "none"}`,
    `Unknown dimensions: ${targetReview.assessment.unknownDimensions.join(", ") || "none"}`,
    `Claims: production integrity=${targetReview.assessment.claims.productionIntegrity}; task effectiveness=${targetReview.assessment.claims.taskEffectiveness}; distinctiveness=${targetReview.assessment.claims.distinctiveness}`,
    "",
    "Ledger:",
    `- register: ${targetReview.ledger.context.register}`,
    `- surface: ${targetReview.ledger.context.surface}`,
    `- ambition: ${targetReview.ledger.changeAmbition}`,
    `- evidence: ${targetReview.ledger.evidence.map((item) => item.path || item.type).join(", ") || "none"}`,
    `- blockers: ${targetReview.ledger.blockers.map((item) => `${item.gate}: ${item.reason}`).join("; ") || "none"}`,
    "",
    "Gates:",
    ...targetReview.gates.map((gate) => `- ${gate.gate}: ${gate.status} - ${gate.detail}`),
    "",
    "Expectations:",
    ...(targetReview.expectations.length
      ? targetReview.expectations.map((expectation) => `- ${expectation.expectation}: ${expectation.status} - ${expectation.detail}`)
      : ["- none"]),
    "",
    "Relentless improvement gate:",
    "- Treat this report as red until P1 and repeated/systemic P2 issues in scope are fixed, blocked, or explicitly deferred.",
    "- If the user asked to improve the interface and source files are editable, convert the top in-scope finding into a patch and rerun evidence before finalizing.",
    "- Do not use detector-only output as visual judgment; inspect the rendered state or name runtime proof as blocked.",
    "",
    "Forensic design pass:",
    "- This harness is an evidence pack, not the final design critique.",
    "- For design analysis, screenshot critique, UI audit, or roast, complete `SKILLS/ruthless-designer/references/critique.md` before writing the final assessment.",
    `- Cross-reference: screenshots=${screenshotPaths.length ? screenshotPaths.join(", ") : "none"}; source=${targetReview.target.path || "none"}; blockers=${targetReview.ledger.blockers.length ? "see ledger" : "none"}`,
    "- Required read: product intent, main user task, intended hierarchy, accidental priority, visual problem, source/code cause, concrete fix, first five cuts.",
    "",
    "Findings:",
  ];

  if (!targetReview.findings.length) {
    lines.push("- no findings");
  } else {
    for (const finding of targetReview.findings.slice(0, 40)) {
      lines.push(`- [${finding.severity}] ${finding.id} ${finding.file}:${finding.line} - ${finding.message}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function loadPlaywright() {
  const candidates = [
    path.join(root, "node_modules", "playwright"),
    path.join(process.cwd(), "node_modules", "playwright"),
    process.env.PLAYWRIGHT_PATH,
    process.env.PLAYWRIGHT_NODE_MODULES ? path.join(process.env.PLAYWRIGHT_NODE_MODULES, "playwright") : null,
    path.join(os.tmpdir(), "ruthless-designer-playwright", "node_modules", "playwright"),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    try {
      return require(candidate);
    } catch {}
  }
  return null;
}

function loadActions(file) {
  if (!file) return [];
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return Array.isArray(data) ? data : data.actions || [];
}

function loadActionGroups(targetOptions) {
  const groups = [];
  if (targetOptions.actions) {
    groups.push({
      name: "default",
      source: targetOptions.actions,
      actions: loadActions(targetOptions.actions),
    });
  }
  for (const spec of targetOptions.actionGroups) {
    const [name, file] = parseNamedFile(spec, "--action-group");
    groups.push({
      name,
      source: file,
      actions: loadActions(file),
    });
  }
  return groups.length ? groups : [{ name: "default", source: null, actions: [] }];
}

function parseNamedFile(value, optionName) {
  const input = String(value || "");
  const index = input.indexOf("=");
  if (index <= 0 || index === input.length - 1) {
    console.error(`Invalid ${optionName} ${value}; expected name=actions.json`);
    process.exit(2);
  }
  return [input.slice(0, index), input.slice(index + 1)];
}

function sanitizeAction(action) {
  return {
    type: action.type,
    selector: action.selector,
    expected: isObservableAssertion(action) && action.value !== undefined ? "[provided]" : undefined,
    key: action.key,
    ms: action.ms,
    x: action.x,
    y: action.y,
  };
}

function parseArgs(args) {
  const options = {
    path: null,
    url: null,
    out: null,
    slug: null,
    actions: null,
    actionGroups: [],
    failOn: null,
    fail: false,
    timeout: 15000,
    waitUntil: "domcontentloaded",
    settleMs: 500,
    deviceScaleFactor: 1,
    clsThreshold: 0.1,
    strictCls: false,
    register: null,
    surface: null,
    ambition: null,
    requireRuntime: false,
    requireSignature: false,
    signatureProof: null,
    signatureSelector: null,
    expectFindings: [],
    expectAssessment: null,
    asyncUi: false,
    states: [],
    viewports: [],
    customViewports: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const [name, inlineValue] = arg.split("=", 2);
    const nextValue = () => inlineValue ?? args[++i];

    if (name === "--path") options.path = nextValue();
    else if (name === "--url") options.url = nextValue();
    else if (name === "--out") options.out = nextValue();
    else if (name === "--slug") options.slug = nextValue();
    else if (name === "--actions") options.actions = nextValue();
    else if (name === "--action-group") options.actionGroups.push(nextValue());
    else if (name === "--fail-on") options.failOn = normalizeSeverity(nextValue());
    else if (name === "--fail-verdict") {
      console.error("--fail-verdict was removed. Use --fail-on for finding severity, --require-runtime for evidence gates, or --expect-assessment for an expected review result.");
      process.exit(2);
    }
    else if (name === "--fail-under-score") {
      console.error("--fail-under-score was removed. Use --fail-on for finding severity, --require-runtime for evidence gates, or --expect-assessment for an expected review result.");
      process.exit(2);
    }
    else if (arg === "--fail") options.fail = true;
    else if (name === "--timeout") options.timeout = Number(nextValue());
    else if (name === "--wait-until") options.waitUntil = normalizeWaitUntil(nextValue());
    else if (name === "--settle-ms") options.settleMs = Number(nextValue());
    else if (arg === "--detail-capture") options.deviceScaleFactor = 2;
    else if (name === "--cls-threshold") options.clsThreshold = Number(nextValue());
    else if (arg === "--strict-cls") options.strictCls = true;
    else if (name === "--register") options.register = nextValue();
    else if (name === "--surface") options.surface = nextValue();
    else if (name === "--ambition") options.ambition = nextValue();
    else if (arg === "--require-runtime") options.requireRuntime = true;
    else if (arg === "--require-signature") options.requireSignature = true;
    else if (name === "--signature-proof") options.signatureProof = nextValue();
    else if (name === "--signature-selector") options.signatureSelector = nextValue();
    else if (name === "--expect-finding") options.expectFindings.push(nextValue());
    else if (name === "--expect-verdict") {
      console.error("--expect-verdict was removed. Use --fail-on for finding severity, --require-runtime for evidence gates, or --expect-assessment for an expected review result.");
      process.exit(2);
    }
    else if (name === "--expect-assessment") options.expectAssessment = normalizeExpectedAssessment(nextValue());
    else if (arg === "--async-ui") options.asyncUi = true;
    else if (name === "--states") options.states = nextValue().split(",").map((state) => state.trim()).filter(Boolean);
    else if (name === "--viewport") {
      if (!options.customViewports) {
        options.viewports = [];
        options.customViewports = true;
      }
      options.viewports.push(parseViewport(nextValue()));
    }
    else if (arg.startsWith("--")) {
      console.error(`Unknown option: ${arg}`);
      process.exit(2);
    } else if (!options.path) {
      options.path = arg;
    }
  }

  if (!options.viewports.length) {
    options.viewports = [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
    ];
  }
  if (!Number.isFinite(options.settleMs) || options.settleMs < 0) {
    console.error(`Invalid --settle-ms ${options.settleMs}; expected a non-negative number`);
    process.exit(2);
  }
  if (!Number.isFinite(options.deviceScaleFactor) || options.deviceScaleFactor < 1 || options.deviceScaleFactor > 4) {
    console.error(`Invalid device scale factor ${options.deviceScaleFactor}; expected a number from 1 to 4`);
    process.exit(2);
  }
  if (!Number.isFinite(options.clsThreshold) || options.clsThreshold < 0 || options.clsThreshold > 1) {
    console.error(`Invalid --cls-threshold ${options.clsThreshold}; expected a number from 0 to 1`);
    process.exit(2);
  }
  if (options.strictCls) options.clsThreshold = 0;

  delete options.customViewports;
  delete options.strictCls;
  return options;
}

function parseViewport(value) {
  const match = String(value).match(/^(\d+)x(\d+)$/);
  if (!match) {
    console.error(`Invalid --viewport ${value}; expected WIDTHxHEIGHT`);
    process.exit(2);
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

function normalizeSeverity(value) {
  const severity = String(value || "").toUpperCase();
  if (!Object.hasOwn(severityRank, severity)) {
    console.error(`Invalid --fail-on ${value}; expected P0, P1, P2, or P3`);
    process.exit(2);
  }
  return severity;
}

function normalizeExpectedAssessment(value) {
  const assessment = String(value || "").toLowerCase();
  if (!["blocked", "findings", "evidence-collected"].includes(assessment)) {
    console.error(`Invalid --expect-assessment ${value}; expected blocked, findings, or evidence-collected`);
    process.exit(2);
  }
  return assessment;
}

function normalizeWaitUntil(value) {
  const waitUntil = String(value || "");
  if (!["domcontentloaded", "load", "networkidle", "commit"].includes(waitUntil)) {
    console.error(`Invalid --wait-until ${value}; expected domcontentloaded, load, networkidle, or commit`);
    process.exit(2);
  }
  return waitUntil;
}

function summarizeSeverity(findings) {
  return findings.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] || 0) + 1;
    return acc;
  }, {});
}

function findRepoRoot() {
  let current = process.cwd();
  while (current && current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, ".git"))) return current;
    current = path.dirname(current);
  }
  return process.cwd();
}

function slugify(value) {
  return String(value)
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "review";
}

function safeFilePart(value) {
  return String(value || "default")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "default";
}

function singleLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function redactUrl(value) {
  if (!value) return value;
  try {
    const parsed = new URL(String(value));
    parsed.username = "";
    parsed.password = "";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, parsed.pathname === "/" ? "/" : "");
  } catch {
    return String(value).replace(/[?#].*$/, "");
  }
}

function redactText(value) {
  return String(value || "")
    .replace(/https?:\/\/[^\s"'<>]+/gi, (url) => redactUrl(url))
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/\b(token|api[_-]?key|authorization|password|secret)\b(\s*[:=]\s*)[^\s,;]+/gi, "$1$2[REDACTED]");
}

function redactReportValue(value) {
  if (typeof value === "string") return redactText(value);
  if (Array.isArray(value)) return value.map((item) => redactReportValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactReportValue(item)]));
  }
  return value;
}

function usage() {
  console.error("Usage: node run-interface-review.mjs --path <file-or-dir> [--url <local-url>] [--out <dir>] [--actions actions.json] [--action-group name=actions.json] [--viewport 1280x800] [--detail-capture] [--cls-threshold 0.1|--strict-cls] [--fail-on=P1|P2|P3] [--require-runtime] [--require-signature] [--signature-proof text --signature-selector selector] [--expect-finding rule-id] [--expect-assessment=blocked|findings|evidence-collected] [--fail]");
}
