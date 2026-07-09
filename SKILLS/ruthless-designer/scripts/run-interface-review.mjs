#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const severityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
const verdictRank = { critical: 0, poor: 1, acceptable: 2, good: 3, excellent: 4 };
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
  score: null,
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
review.score = scoreReview(review);
review.expectations = evaluateExpectations(review, options);

const jsonPath = path.join(outDir, "review.json");
const markdownPath = path.join(outDir, "README.md");
const reportReview = redactReportValue(review);
fs.writeFileSync(jsonPath, `${JSON.stringify(reportReview, null, 2)}\n`);
fs.writeFileSync(markdownPath, renderMarkdown(reportReview, jsonPath));

const summary = {
  outDir: path.relative(root, outDir),
  findings: reportReview.findings.length,
  bySeverity: summarizeSeverity(reportReview.findings),
  score: reportReview.score,
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
if (options.failVerdict && !verdictAtLeast(review.score.verdict, options.failVerdict)) {
  process.exitCode = 1;
}
if (
  options.failUnderScore !== null &&
  (review.score.total === null || review.score.coverage < 1 || review.score.total < options.failUnderScore)
) {
  process.exitCode = 1;
}
if (review.expectations.some((expectation) => expectation.status === "fail")) {
  process.exitCode = 1;
}
if (review.score.verdict === "blocked") process.exitCode = 1;
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
  const page = await browser.newPage({ viewport });
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

function scoreReview(targetReview) {
  const dimensions = {
    accessibility: null,
    performance: null,
    themingDesignSystem: null,
    responsiveContent: null,
    antiSlop: null,
  };
  const dimensionEvidence = Object.fromEntries(Object.keys(dimensions).map((key) => [key, []]));

  const observe = (dimension, score, evidence) => {
    dimensions[dimension] = dimensions[dimension] === null ? score : Math.min(dimensions[dimension], score);
    if (!dimensionEvidence[dimension].includes(evidence)) dimensionEvidence[dimension].push(evidence);
  };

  if ((targetReview.static?.files || 0) > 0) {
    observe("themingDesignSystem", 3, "static design-system checks observed");
    observe("antiSlop", 3, "static anti-pattern checks observed");
  }

  const successfulRuntime = (targetReview.runtime?.results || []).filter((result) => result.ok);
  if (successfulRuntime.length) {
    observe("accessibility", 3, "runtime DOM checks observed");
    observe("performance", 3, "runtime performance checks observed");
    observe("responsiveContent", 3, "runtime viewport checks observed");
  }

  for (const finding of targetReview.findings) {
    const cap = finding.severity === "P0" ? 0 : finding.severity === "P1" ? 1 : finding.severity === "P2" ? 2 : 3;
    const evidence = `finding:${finding.id}`;
    if (finding.category === "accessibility") observe("accessibility", cap, evidence);
    if (finding.category === "performance" || finding.category === "runtime" || finding.category === "motion") observe("performance", cap, evidence);
    if (finding.category === "design-system" || finding.category === "quality") observe("themingDesignSystem", cap, evidence);
    if (finding.category === "resilience") observe("responsiveContent", cap, evidence);
    if (finding.category === "slop") observe("antiSlop", cap, evidence);
  }

  const failedRequiredGates = (targetReview.gates || []).filter((gate) => gate.status === "fail" && gate.required !== false);
  const knownScores = Object.values(dimensions).filter((value) => value !== null);
  const total = knownScores.length ? knownScores.reduce((sum, value) => sum + value, 0) : null;
  const coverage = knownScores.length / Object.keys(dimensions).length;
  const average = knownScores.length ? total / knownScores.length : null;
  let baseVerdict = average === null ? "blocked" : average >= 3.6 ? "excellent" : average >= 2.8 ? "good" : average >= 2 ? "acceptable" : average >= 1.2 ? "poor" : "critical";
  if (targetReview.findings.some((finding) => finding.severity === "P0")) baseVerdict = "critical";
  else if (targetReview.findings.some((finding) => finding.severity === "P1") && verdictAtLeast(baseVerdict, "good")) baseVerdict = "poor";
  if (coverage < 1 && verdictAtLeast(baseVerdict, "good")) baseVerdict = "acceptable";
  const runtimeEvidence = runtimeEvidenceSummary(targetReview);
  if (runtimeEvidence.observation !== "observed" && verdictAtLeast(baseVerdict, "good")) baseVerdict = "acceptable";
  if (runtimeEvidence.comparison !== "compared" && verdictAtLeast(baseVerdict, "good")) baseVerdict = "acceptable";
  const excellentEligible =
    !isAmbitiousReview(targetReview) ||
    (dimensions.antiSlop === 4 &&
      Boolean(targetReview.ledger.context.signatureProof) &&
      runtimeEvidence.observation === "observed" &&
      runtimeEvidence.capture === "captured" &&
      runtimeEvidence.comparison === "compared");
  return {
    dimensions,
    dimensionEvidence,
    total,
    maxTotal: knownScores.length * 4,
    coverage,
    average,
    verdict: failedRequiredGates.length ? "blocked" : baseVerdict === "excellent" && !excellentEligible ? "good" : baseVerdict,
    blockedGates: failedRequiredGates.map((gate) => gate.gate),
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

function isAmbitiousReview(targetReview) {
  const value = [
    targetReview.ledger.context.register,
    targetReview.ledger.context.surface,
    targetReview.ledger.changeAmbition,
    targetReview.ledger.context.signatureProof,
  ]
    .filter(Boolean)
    .join(" ");
  return options.requireSignature || /\b(?:brand|portfolio|prototype|greenfield|redesign|standout|incredible|premium|not-generic|not generic|landing|hero)\b/i.test(value);
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
  if (targetOptions.expectVerdict) {
    const found = targetReview.score.verdict === targetOptions.expectVerdict;
    expectations.push({
      expectation: `verdict:${targetOptions.expectVerdict}`,
      status: found ? "pass" : "fail",
      detail: `actual ${targetReview.score.verdict}`,
    });
  }
  return expectations;
}

function verdictAtLeast(actual, minimum) {
  if (actual === "blocked") return false;
  return verdictRank[actual] >= verdictRank[minimum];
}

function renderMarkdown(targetReview, jsonPath) {
  const screenshotPaths = (targetReview.runtime?.results || []).map((result) => result.screenshot).filter(Boolean);
  const dimensionScore = (value) => (value === null ? "unknown" : String(value));
  const scoreTotal = targetReview.score.total === null ? "unknown" : `${targetReview.score.total}/${targetReview.score.maxTotal}`;
  const lines = [
    "# Interface Review",
    "",
    `Generated: ${targetReview.reviewedAt}`,
    `Target path: ${targetReview.target.path || "n/a"}`,
    `Target URL: ${targetReview.target.url || "n/a"}`,
    `Review JSON: ${path.relative(root, jsonPath)}`,
    "",
    `Score: accessibility/performance/theming/responsive/anti-slop = ${dimensionScore(targetReview.score.dimensions.accessibility)}/${dimensionScore(targetReview.score.dimensions.performance)}/${dimensionScore(targetReview.score.dimensions.themingDesignSystem)}/${dimensionScore(targetReview.score.dimensions.responsiveContent)}/${dimensionScore(targetReview.score.dimensions.antiSlop)}, observed total ${scoreTotal}, coverage ${Math.round(targetReview.score.coverage * 100)}%`,
    `Verdict: ${targetReview.score.verdict}`,
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
    "- For design analysis, screenshot critique, UI audit, or roast, complete `SKILLS/ruthless-designer/references/critique.md` before writing the final verdict.",
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
    failVerdict: null,
    failUnderScore: null,
    fail: false,
    timeout: 15000,
    waitUntil: "domcontentloaded",
    settleMs: 500,
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
    expectVerdict: null,
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
    else if (name === "--fail-verdict") options.failVerdict = normalizeVerdict(nextValue());
    else if (name === "--fail-under-score") options.failUnderScore = Number(nextValue());
    else if (arg === "--fail") options.fail = true;
    else if (name === "--timeout") options.timeout = Number(nextValue());
    else if (name === "--wait-until") options.waitUntil = normalizeWaitUntil(nextValue());
    else if (name === "--settle-ms") options.settleMs = Number(nextValue());
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
    else if (name === "--expect-verdict") options.expectVerdict = normalizeExpectedVerdict(nextValue());
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
  if (options.failUnderScore !== null && (!Number.isFinite(options.failUnderScore) || options.failUnderScore < 0 || options.failUnderScore > 20)) {
    console.error(`Invalid --fail-under-score ${options.failUnderScore}; expected a number from 0 to 20`);
    process.exit(2);
  }
  if (!Number.isFinite(options.settleMs) || options.settleMs < 0) {
    console.error(`Invalid --settle-ms ${options.settleMs}; expected a non-negative number`);
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

function normalizeVerdict(value) {
  const verdict = String(value || "").toLowerCase();
  if (!Object.hasOwn(verdictRank, verdict)) {
    console.error(`Invalid verdict ${value}; expected critical, poor, acceptable, good, or excellent`);
    process.exit(2);
  }
  return verdict;
}

function normalizeExpectedVerdict(value) {
  const verdict = String(value || "").toLowerCase();
  if (verdict !== "blocked" && !Object.hasOwn(verdictRank, verdict)) {
    console.error(`Invalid expected verdict ${value}; expected blocked, critical, poor, acceptable, good, or excellent`);
    process.exit(2);
  }
  return verdict;
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
  console.error("Usage: node run-interface-review.mjs --path <file-or-dir> [--url <local-url>] [--out <dir>] [--actions actions.json] [--action-group name=actions.json] [--viewport 1280x800] [--cls-threshold 0.1|--strict-cls] [--fail-on=P1|P2|P3] [--fail-verdict=good] [--fail-under-score=N] [--require-runtime] [--require-signature] [--signature-proof text --signature-selector selector] [--expect-finding rule-id] [--fail]");
}
