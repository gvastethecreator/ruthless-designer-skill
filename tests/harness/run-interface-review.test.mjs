import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const harnessPath = path.join(repoRoot, "SKILLS", "ruthless-designer", "scripts", "run-interface-review.mjs");

function tempDir(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `ruthless-designer-${name}-`));
}

function runHarness(args, options = {}) {
  return spawnSync(process.execPath, [harnessPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...options.env },
  });
}

function readReview(outDir) {
  return JSON.parse(fs.readFileSync(path.join(outDir, "review.json"), "utf8"));
}

function makeFakePlaywright(sandbox) {
  const moduleDir = path.join(sandbox, "fake-playwright");
  fs.mkdirSync(moduleDir, { recursive: true });
  fs.writeFileSync(path.join(moduleDir, "package.json"), JSON.stringify({ main: "index.cjs" }));
  fs.writeFileSync(
    path.join(moduleDir, "index.cjs"),
    String.raw`
const fs = require("node:fs");
const hitSize = Number(process.env.FAKE_HIT_SIZE || 0);
let currentUrl = "about:blank";
const metrics = {
  width: 1280,
  height: 800,
  scrollWidth: 1280,
  scrollHeight: 800,
  horizontalOverflow: false,
  smallHitAreas: hitSize ? [{ name: "control", width: hitSize, height: hitSize }] : [],
  unnamedButtons: 0,
  clippedText: [],
  imageIssues: [],
  contrastIssues: [],
  nativeScrollbarRisks: process.env.FAKE_NATIVE_SCROLLBAR ? [{ node: "div.panel", scrollHeight: 900, clientHeight: 300 }] : [],
  iconAlignmentIssues: process.env.FAKE_ICON_MISALIGNMENT ? [{ control: "button.save", deltaY: 6, iconSize: "20x20" }] : [],
  repeatedSpacingIssues: process.env.FAKE_SPACING_DRIFT ? [{ container: "ul.items", gaps: [8, 15], spread: 7 }] : [],
  gradientSurfaces: process.env.FAKE_GRADIENT ? ["section.hero"] : [],
  animationAudit: { total: 0, running: 0, offscreenRunningCount: 0, offscreenRunning: [] },
  canvasDetails: [],
  longTasks: [],
  layoutShifts: [],
  cls: Number(process.env.FAKE_CLS || 0),
  frameStats: { samples: 10, p95: 16, max: 16 },
};
module.exports = {
  chromium: {
    async launch() {
      if (process.env.FAKE_PLAYWRIGHT_MODE === "launch-error") throw new Error("browser launch failed token=super-secret");
      return {
        async newPage(options) {
          if (process.env.FAKE_PAGE_OPTIONS) fs.writeFileSync(process.env.FAKE_PAGE_OPTIONS, JSON.stringify(options));
          return {
            mouse: { async wheel() {} },
            on() {},
            async addInitScript() {},
            async goto(url) {
              if (process.env.FAKE_PLAYWRIGHT_MODE === "all-fail") throw new Error("navigation failed https://example.test/page?token=secret#private");
              currentUrl = url;
            },
            url() { return process.env.FAKE_URL || currentUrl; },
            locator(selector) {
              return {
                async waitFor() {
                  if (process.env.FAKE_ASSERT_MODE === "fail" || selector === "#missing") throw new Error("observable assertion failed");
                },
                async textContent() { return process.env.FAKE_TEXT || "ready"; },
              };
            },
            async waitForTimeout() {},
            async screenshot({ path }) { fs.mkdirSync(require("node:path").dirname(path), { recursive: true }); fs.writeFileSync(path, "png"); },
            async evaluate() { return metrics; },
            async click(selector) {
              if (selector === "#go-permission") currentUrl = "https://example.test/permission";
            },
            async hover() {},
            async fill() {},
            async press() {},
            async close() {},
          };
        },
        async close() {},
      };
    },
  },
};
`,
  );
  return moduleDir;
}

test("a missing target writes a blocked review and exits as invalid input", () => {
  const sandbox = tempDir("missing-target");
  const missing = path.join(sandbox, "does-not-exist");
  const outDir = path.join(sandbox, "review");

  const result = runHarness(["--path", missing, "--out", outDir]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.target.path, path.resolve(missing));
  assert.equal(review.gates.find((gate) => gate.gate === "static-detector")?.status, "fail");
  assert.equal(Object.hasOwn(review, "score"), false);
  assert.deepEqual(review.assessment, {
    result: "blocked",
    highestSeverity: null,
    observedDimensions: [],
    unknownDimensions: ["accessibility", "performance", "themingDesignSystem", "responsiveContent", "antiSlop"],
    evidence: {
      static: { observation: "blocked", files: 0 },
      runtime: {
        observation: "not-observed",
        capture: "not-captured",
        comparison: "not-compared",
        successfulRuns: 0,
        failedRuns: 0,
      },
    },
    claims: {
      productionIntegrity: "blocked",
      taskEffectiveness: "not-assessed",
      distinctiveness: "not-assessed",
    },
  });
  assert.match(review.ledger.blockers[0]?.reason || "", /does not exist/i);
});

test("a detector scan with zero compatible files cannot certify the target", () => {
  const sandbox = tempDir("empty-target");
  const target = path.join(sandbox, "empty");
  const outDir = path.join(sandbox, "review");
  fs.mkdirSync(target);

  const result = runHarness(["--path", target, "--out", outDir]);

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const review = readReview(outDir);
  const gate = review.gates.find((item) => item.gate === "static-detector");
  assert.equal(gate?.status, "fail");
  assert.match(gate?.detail || "", /zero|no compatible files/i);
  assert.equal(review.assessment.result, "blocked");
  assert.equal(review.assessment.highestSeverity, null);
  assert.deepEqual(review.assessment.observedDimensions, []);
  assert.equal(review.assessment.evidence.static.observation, "blocked");
  assert.equal(review.assessment.claims.productionIntegrity, "blocked");
});

test("a blocked detector is reported as blocked evidence", () => {
  const sandbox = tempDir("blocked-detector");
  const target = path.join(sandbox, "component.tsx");
  const outDir = path.join(sandbox, "review");
  fs.writeFileSync(target, "export const Component = () => <main />;\n");

  const result = runHarness(["--path", target, "--out", outDir], {
    env: { RUTHLESS_DESIGNER_DETECTOR_PATH: path.join(sandbox, "missing-detector.mjs") },
  });

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.gates.find((gate) => gate.gate === "static-detector")?.status, "fail");
  assert.equal(Object.hasOwn(review, "score"), false);
  assert.equal(review.assessment.result, "blocked");
  assert.equal(review.assessment.evidence.static.observation, "blocked");
  assert.equal(review.assessment.claims.productionIntegrity, "blocked");
  assert.match(review.ledger.blockers[0]?.reason || "", /cannot find module|detector exited/i);
});

test("an unresolved P1 reports findings and blocks the production-integrity claim", () => {
  const sandbox = tempDir("p1-assessment");
  const target = path.join(repoRoot, "SKILLS", "ruthless-designer", "fixtures", "deep-review-bad.tsx");
  const outDir = path.join(sandbox, "review");

  const result = runHarness(["--path", target, "--out", outDir]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.gates.find((gate) => gate.gate === "p1-unresolved")?.status, "fail");
  assert.equal(review.assessment.result, "findings");
  assert.equal(review.assessment.highestSeverity, "P1");
  assert.equal(review.assessment.claims.productionIntegrity, "blocked");
  assert.equal(review.assessment.claims.taskEffectiveness, "not-assessed");
  assert.equal(review.assessment.claims.distinctiveness, "not-assessed");
  assert.equal(Object.hasOwn(review, "score"), false);
});

test("a clean static scan is observed evidence, not visual certification", () => {
  const sandbox = tempDir("static-only");
  const target = path.join(sandbox, "component.tsx");
  const outDir = path.join(sandbox, "review");
  fs.writeFileSync(target, "export const Component = () => <main><h1>Account</h1></main>;\n");

  const result = runHarness(["--path", target, "--out", outDir]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.gates.find((gate) => gate.gate === "static-detector")?.status, "pass");
  assert.equal(review.assessment.result, "evidence-collected");
  assert.deepEqual(review.assessment.observedDimensions, ["themingDesignSystem", "antiSlop"]);
  assert.deepEqual(review.assessment.unknownDimensions, ["accessibility", "performance", "responsiveContent"]);
  assert.deepEqual(review.assessment.evidence.static, { observation: "observed", files: 1 });
  assert.equal(review.assessment.claims.productionIntegrity, "limited");
  assert.equal(review.assessment.claims.taskEffectiveness, "not-assessed");
  assert.equal(review.assessment.claims.distinctiveness, "not-assessed");
  assert.equal(review.runtime, null);
  const summary = JSON.parse(result.stdout);
  const markdown = fs.readFileSync(path.join(outDir, "README.md"), "utf8");
  const dossier = fs.readFileSync(path.join(outDir, "report.md"), "utf8");
  const html = fs.readFileSync(path.join(outDir, "report.html"), "utf8");
  assert.equal(Object.hasOwn(summary, "score"), false);
  assert.match(summary.htmlReport, /report\.html$/);
  assert.match(summary.markdownReport, /report\.md$/);
  assert.doesNotMatch(result.stdout, /\b(?:score|good|excellent)\b/i);
  assert.doesNotMatch(markdown, /\b(?:score|good|excellent)\b/i);
  assert.match(dossier, /^# Interface evidence review$/m);
  assert.match(dossier, /^## Proof ledger$/m);
  assert.match(html, /Interface evidence review/);
  assert.match(html, /Proof ledger/);
  assert.doesNotMatch(html, /<script(?:\s|>)/i);
});

test("fail-under-score is rejected with assessment-era replacements", () => {
  const sandbox = tempDir("legacy-fail-under");
  const target = path.join(sandbox, "component.tsx");
  const outDir = path.join(sandbox, "review");
  fs.writeFileSync(target, "export const Component = () => <main><h1>Account</h1></main>;\n");

  const result = runHarness(["--path", target, "--out", outDir, "--fail-under-score", "1"]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /--fail-under-score.*removed/i);
  assert.match(result.stderr, /--fail-on/);
  assert.match(result.stderr, /--require-runtime/);
  assert.match(result.stderr, /--expect-assessment/);
});

test("fail-verdict is rejected with assessment-era replacements", () => {
  const sandbox = tempDir("legacy-fail-verdict");
  const target = path.join(sandbox, "component.tsx");
  fs.writeFileSync(target, "export const Component = () => <main><h1>Account</h1></main>;\n");

  const result = runHarness(["--path", target, "--fail-verdict", "good"]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /--fail-verdict.*removed/i);
  assert.match(result.stderr, /--fail-on/);
  assert.match(result.stderr, /--require-runtime/);
  assert.match(result.stderr, /--expect-assessment/);
});

test("expect-verdict is rejected in favor of expect-assessment", () => {
  const sandbox = tempDir("legacy-expect-verdict");
  const target = path.join(sandbox, "component.tsx");
  fs.writeFileSync(target, "export const Component = () => <main><h1>Account</h1></main>;\n");

  const result = runHarness(["--path", target, "--expect-verdict", "acceptable"]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /--expect-verdict.*removed/i);
  assert.match(result.stderr, /--fail-on/);
  assert.match(result.stderr, /--require-runtime/);
  assert.match(result.stderr, /--expect-assessment/);
});

test("expect-assessment records a passing evidence-collected expectation", () => {
  const sandbox = tempDir("expect-assessment");
  const target = path.join(sandbox, "component.tsx");
  const outDir = path.join(sandbox, "review");
  fs.writeFileSync(target, "export const Component = () => <main><h1>Account</h1></main>;\n");

  const result = runHarness(["--path", target, "--out", outDir, "--expect-assessment", "evidence-collected"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.deepEqual(review.expectations.find((item) => item.expectation === "assessment:evidence-collected"), {
    expectation: "assessment:evidence-collected",
    status: "pass",
    detail: "actual evidence-collected",
  });
});

test("expect-assessment can smoke-test a known blocked package without hiding its failed gate", () => {
  const sandbox = tempDir("expect-assessment-blocked");
  const target = path.join(sandbox, "component.tsx");
  const outDir = path.join(sandbox, "review");
  fs.writeFileSync(target, "export const Component = () => <main><h1>Account</h1></main>;\n");

  const result = runHarness([
    "--path",
    target,
    "--out",
    outDir,
    "--require-runtime",
    "--expect-assessment",
    "blocked",
  ]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.assessment.result, "blocked");
  assert.equal(review.gates.find((gate) => gate.gate === "runtime-visual")?.status, "fail");
  assert.deepEqual(review.expectations.find((item) => item.expectation === "assessment:blocked"), {
    expectation: "assessment:blocked",
    status: "pass",
    detail: "actual blocked",
  });

  const strictResult = runHarness([
    "--path",
    target,
    "--out",
    path.join(sandbox, "strict-review"),
    "--require-runtime",
    "--expect-assessment",
    "blocked",
    "--fail",
  ]);
  assert.equal(strictResult.status, 1, strictResult.stderr || strictResult.stdout);
});

test("expect-assessment mismatch records a failure and exits one", () => {
  const sandbox = tempDir("expect-assessment-mismatch");
  const target = path.join(sandbox, "component.tsx");
  const outDir = path.join(sandbox, "review");
  fs.writeFileSync(target, "export const Component = () => <main><h1>Account</h1></main>;\n");

  const result = runHarness(["--path", target, "--out", outDir, "--expect-assessment", "findings"]);

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.deepEqual(review.expectations.find((item) => item.expectation === "assessment:findings"), {
    expectation: "assessment:findings",
    status: "fail",
    detail: "actual evidence-collected",
  });
});

test("expect-assessment rejects unknown results as invalid input", () => {
  const sandbox = tempDir("expect-assessment-invalid");
  const target = path.join(sandbox, "component.tsx");
  fs.writeFileSync(target, "export const Component = () => <main><h1>Account</h1></main>;\n");

  const result = runHarness(["--path", target, "--expect-assessment", "excellent"]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /blocked, findings, or evidence-collected/i);
});

test("clean static and runtime evidence remains limited rather than auto-certified", () => {
  const sandbox = tempDir("captured-not-compared");
  const target = path.join(sandbox, "component.tsx");
  const outDir = path.join(sandbox, "review");
  const fakePlaywright = makeFakePlaywright(sandbox);
  fs.writeFileSync(target, "export const Component = () => <main><h1>Account</h1></main>;\n");

  const result = runHarness(
    ["--path", target, "--url", "https://example.test", "--out", outDir, "--viewport", "320x480"],
    { env: { PLAYWRIGHT_PATH: fakePlaywright } },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.assessment.result, "evidence-collected");
  assert.deepEqual(review.assessment.observedDimensions, [
    "accessibility",
    "performance",
    "themingDesignSystem",
    "responsiveContent",
    "antiSlop",
  ]);
  assert.deepEqual(review.assessment.unknownDimensions, []);
  assert.equal(review.runtime.evidence.comparison, "not-compared");
  assert.equal(review.assessment.evidence.runtime.comparison, "not-compared");
  assert.equal(review.assessment.claims.productionIntegrity, "limited");
  assert.equal(review.assessment.claims.taskEffectiveness, "not-assessed");
  assert.equal(review.assessment.claims.distinctiveness, "not-assessed");
});

test("textual signature proof fails when every runtime observation failed", () => {
  const sandbox = tempDir("signature-failed-runtime");
  const outDir = path.join(sandbox, "review");
  const fakePlaywright = makeFakePlaywright(sandbox);

  const result = runHarness(
    [
      "--url",
      "https://example.test/page?token=secret#private",
      "--out",
      outDir,
      "--require-signature",
      "--signature-proof",
      "signature is visible",
      "--viewport",
      "320x480",
    ],
    { env: { PLAYWRIGHT_PATH: fakePlaywright, FAKE_PLAYWRIGHT_MODE: "all-fail" } },
  );

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.gates.find((gate) => gate.gate === "runtime-visual")?.status, "fail");
  assert.equal(review.gates.find((gate) => gate.gate === "signature-proof")?.status, "fail");
  assert.equal(review.assessment.result, "blocked");
  assert.equal(review.assessment.highestSeverity, "P1");
  assert.equal(review.assessment.claims.productionIntegrity, "blocked");
  assert.equal(review.assessment.evidence.runtime.failedRuns, 1);
  assert.equal(review.runtime.evidence.observation, "failed");
  assert.equal(review.runtime.evidence.capture, "not-captured");
  assert.equal(review.runtime.evidence.comparison, "not-compared");
  assert.equal(review.target.url, "https://example.test/page");
  assert.doesNotMatch(JSON.stringify(review), /super-secret|token=secret|#private/);
});

test("textual signature proof plus a screenshot remains captured but unverified", () => {
  const sandbox = tempDir("signature-captured-unverified");
  const outDir = path.join(sandbox, "review");
  const fakePlaywright = makeFakePlaywright(sandbox);

  const result = runHarness(
    [
      "--url",
      "https://example.test",
      "--out",
      outDir,
      "--require-signature",
      "--signature-proof",
      "the diagonal status rail is visible",
      "--viewport",
      "320x480",
    ],
    { env: { PLAYWRIGHT_PATH: fakePlaywright } },
  );

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.gates.find((gate) => gate.gate === "runtime-visual")?.status, "pass");
  const signatureGate = review.gates.find((gate) => gate.gate === "signature-proof");
  assert.equal(signatureGate?.status, "fail");
  assert.match(signatureGate?.detail || "", /captured but remains unverified/i);
  assert.equal(review.ledger.evidence.find((item) => item.type === "signature-proof")?.observation, "captured-unverified");
});

test("signature proof passes only with a successful observable signature assertion", () => {
  const sandbox = tempDir("signature-verified");
  const outDir = path.join(sandbox, "review");
  const fakePlaywright = makeFakePlaywright(sandbox);

  const result = runHarness(
    [
      "--url",
      "https://example.test",
      "--out",
      outDir,
      "--require-signature",
      "--signature-proof",
      "the diagonal status rail is visible",
      "--signature-selector",
      "#signature-rail",
      "--viewport",
      "320x480",
    ],
    { env: { PLAYWRIGHT_PATH: fakePlaywright } },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.gates.find((gate) => gate.gate === "signature-proof")?.status, "pass");
  assert.equal(review.runtime.results[0].signatureAssertion?.verified, true);
  assert.equal(review.ledger.evidence.find((item) => item.type === "signature-proof")?.observation, "verified");
});

test("listing async states without successful action groups does not count as coverage", () => {
  const sandbox = tempDir("async-names-only");
  const outDir = path.join(sandbox, "review");
  const fakePlaywright = makeFakePlaywright(sandbox);
  const states = "empty,loading,error,permission,long-content,slow-network,rapid-click";

  const result = runHarness(
    ["--url", "https://example.test", "--out", outDir, "--async-ui", "--states", states, "--viewport", "320x480"],
    { env: { PLAYWRIGHT_PATH: fakePlaywright } },
  );

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const review = readReview(outDir);
  const gate = review.gates.find((item) => item.gate === "async-state-coverage");
  assert.equal(gate?.status, "fail");
  assert.match(gate?.detail || "", /action group|runtime/i);
  assert.equal(review.assessment.result, "blocked");
  assert.equal(review.assessment.highestSeverity, null);
  assert.equal(review.assessment.claims.productionIntegrity, "blocked");
});

test("async coverage rejects named action groups with no observable assertion", () => {
  const sandbox = tempDir("async-action-groups");
  const outDir = path.join(sandbox, "review");
  const fakePlaywright = makeFakePlaywright(sandbox);
  const states = ["empty", "loading", "error", "permission", "long-content", "slow-network", "rapid-click"];
  const args = ["--url", "https://example.test", "--out", outDir, "--async-ui", "--states", states.join(","), "--viewport", "320x480"];
  for (const state of states) {
    const actionsPath = path.join(sandbox, `${state}.json`);
    fs.writeFileSync(actionsPath, JSON.stringify({ actions: [] }));
    args.push("--action-group", `${state}=${actionsPath}`);
  }

  const result = runHarness(args, { env: { PLAYWRIGHT_PATH: fakePlaywright } });

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const review = readReview(outDir);
  const gate = review.gates.find((item) => item.gate === "async-state-coverage");
  assert.equal(gate?.status, "fail");
  assert.match(gate?.detail || "", /missing observable assertions/i);
  assert.equal(review.runtime.evidence.successfulRuns, states.length);
  assert.equal(review.runtime.evidence.comparison, "not-compared");
});

test("async coverage passes only when every state has a verified observable assertion", () => {
  const sandbox = tempDir("async-verified-action-groups");
  const outDir = path.join(sandbox, "review");
  const fakePlaywright = makeFakePlaywright(sandbox);
  const states = ["empty", "loading", "error", "permission", "long-content", "slow-network", "rapid-click"];
  const args = ["--url", "https://example.test", "--out", outDir, "--async-ui", "--states", states.join(","), "--viewport", "320x480"];
  for (const state of states) {
    const actionsPath = path.join(sandbox, `${state}.json`);
    const assertion =
      state === "loading"
        ? { type: "assert-text", selector: "#state-loading", value: "ready" }
        : state === "permission"
          ? [{ type: "click", selector: "#go-permission" }, { type: "assert-url", value: "/permission" }]
          : { type: "assert-visible", selector: `#state-${state}` };
    fs.writeFileSync(actionsPath, JSON.stringify({ actions: Array.isArray(assertion) ? assertion : [assertion] }));
    args.push("--action-group", `${state}=${actionsPath}`);
  }

  const result = runHarness(args, { env: { PLAYWRIGHT_PATH: fakePlaywright } });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.gates.find((item) => item.gate === "async-state-coverage")?.status, "pass");
  assert.equal(review.runtime.results.every((item) => item.assertions.some((assertion) => assertion.verified)), true);
});

test("async coverage fails when a declared state's observable assertion fails", () => {
  const sandbox = tempDir("async-failed-assertion");
  const outDir = path.join(sandbox, "review");
  const fakePlaywright = makeFakePlaywright(sandbox);
  const states = ["empty", "loading", "error", "permission", "long-content", "slow-network", "rapid-click"];
  const args = ["--url", "https://example.test", "--out", outDir, "--async-ui", "--states", states.join(","), "--viewport", "320x480"];
  for (const state of states) {
    const actionsPath = path.join(sandbox, `${state}.json`);
    const selector = state === "error" ? "#missing" : `#state-${state}`;
    fs.writeFileSync(actionsPath, JSON.stringify({ actions: [{ type: "assert-visible", selector }] }));
    args.push("--action-group", `${state}=${actionsPath}`);
  }

  const result = runHarness(args, { env: { PLAYWRIGHT_PATH: fakePlaywright } });

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const review = readReview(outDir);
  const gate = review.gates.find((item) => item.gate === "async-state-coverage");
  assert.equal(gate?.status, "fail");
  assert.match(gate?.detail || "", /no verified runtime assertion: error/i);
});

test("a browser launch failure still writes a redacted blocked review", () => {
  const sandbox = tempDir("browser-launch-error");
  const outDir = path.join(sandbox, "review");
  const fakePlaywright = makeFakePlaywright(sandbox);

  const result = runHarness(["--url", "https://example.test/private?api_key=visible#fragment", "--out", outDir], {
    env: { PLAYWRIGHT_PATH: fakePlaywright, FAKE_PLAYWRIGHT_MODE: "launch-error" },
  });

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const review = readReview(outDir);
  assert.equal(review.assessment.result, "blocked");
  assert.equal(review.assessment.highestSeverity, null);
  assert.equal(review.assessment.claims.productionIntegrity, "blocked");
  assert.equal(review.gates.find((item) => item.gate === "runtime-visual")?.status, "fail");
  assert.match(review.ledger.blockers[0]?.reason || "", /browser launch failed/i);
  assert.doesNotMatch(JSON.stringify(review), /super-secret|api_key=visible|#fragment/);
});

test("CLS uses 0.1 by default and only becomes zero-tolerance when strict mode is explicit", () => {
  const sandbox = tempDir("cls-threshold");
  const fakePlaywright = makeFakePlaywright(sandbox);
  const defaultOut = path.join(sandbox, "default-review");
  const strictOut = path.join(sandbox, "strict-review");
  const env = { PLAYWRIGHT_PATH: fakePlaywright, FAKE_CLS: "0.05" };

  const defaultResult = runHarness(["--url", "https://example.test", "--out", defaultOut, "--viewport", "320x480"], { env });
  const strictResult = runHarness(["--url", "https://example.test", "--out", strictOut, "--viewport", "320x480", "--strict-cls"], { env });

  assert.equal(defaultResult.status, 0, defaultResult.stderr || defaultResult.stdout);
  assert.equal(strictResult.status, 0, strictResult.stderr || strictResult.stdout);
  const defaultReview = readReview(defaultOut);
  const strictReview = readReview(strictOut);
  assert.equal(defaultReview.ledger.context.clsThreshold, 0.1);
  assert.equal(defaultReview.findings.some((finding) => finding.id === "layout-shift"), false);
  assert.equal(strictReview.ledger.context.clsThreshold, 0);
  assert.equal(strictReview.findings.some((finding) => finding.id === "layout-shift"), true);
});

test("hit-area findings separate minimum review from comfort advisory", () => {
  const sandbox = tempDir("hit-area");
  const fakePlaywright = makeFakePlaywright(sandbox);
  const advisoryOut = path.join(sandbox, "advisory-review");
  const minimumOut = path.join(sandbox, "minimum-review");

  runHarness(["--url", "https://example.test", "--out", advisoryOut, "--viewport", "320x480"], {
    env: { PLAYWRIGHT_PATH: fakePlaywright, FAKE_HIT_SIZE: "32" },
  });
  runHarness(["--url", "https://example.test", "--out", minimumOut, "--viewport", "320x480"], {
    env: { PLAYWRIGHT_PATH: fakePlaywright, FAKE_HIT_SIZE: "20" },
  });

  const advisory = readReview(advisoryOut).findings.find((finding) => finding.id === "small-hit-area-advisory");
  const minimum = readReview(minimumOut).findings.find((finding) => finding.id === "small-hit-area");
  assert.equal(advisory?.severity, "P3");
  assert.match(advisory?.message || "", /advisory|not a uniform WCAG failure/i);
  assert.equal(minimum?.severity, "P2");
  assert.match(minimum?.message || "", /exceptions|review/i);
});

test("detail capture requests DPR 2 browser evidence and records it in context", () => {
  const sandbox = tempDir("detail-capture");
  const fakePlaywright = makeFakePlaywright(sandbox);
  const outDir = path.join(sandbox, "review");
  const pageOptions = path.join(sandbox, "page-options.json");

  const result = runHarness(["--url", "https://example.test", "--out", outDir, "--viewport", "320x480", "--detail-capture"], {
    env: { PLAYWRIGHT_PATH: fakePlaywright, FAKE_PAGE_OPTIONS: pageOptions },
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(JSON.parse(fs.readFileSync(pageOptions, "utf8")).deviceScaleFactor, 2);
  assert.equal(readReview(outDir).ledger.context.deviceScaleFactor, 2);
});

test("runtime finish diagnostics expose scrollbar, icon, spacing, and gradient review leads", () => {
  const sandbox = tempDir("finish-diagnostics");
  const fakePlaywright = makeFakePlaywright(sandbox);
  const outDir = path.join(sandbox, "review");

  const result = runHarness(["--url", "https://example.test", "--out", outDir, "--viewport", "320x480"], {
    env: {
      PLAYWRIGHT_PATH: fakePlaywright,
      FAKE_NATIVE_SCROLLBAR: "1",
      FAKE_ICON_MISALIGNMENT: "1",
      FAKE_SPACING_DRIFT: "1",
      FAKE_GRADIENT: "1",
    },
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const ids = readReview(outDir).findings.map((finding) => finding.id);
  for (const id of ["native-scrollbar-runtime", "icon-text-misalignment", "inconsistent-repeated-spacing", "gradient-finish-review"]) {
    assert.ok(ids.includes(id), `expected ${id}`);
  }
});
