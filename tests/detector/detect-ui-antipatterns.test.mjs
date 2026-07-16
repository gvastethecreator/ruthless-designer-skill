import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const detector = path.join(repoRoot, "SKILLS/ruthless-designer/scripts/detect-ui-antipatterns.mjs");
const fixtures = path.join(repoRoot, "tests/detector/fixtures");

function runDetector(args, options = {}) {
  return spawnSync(process.execPath, [detector, ...args], {
    cwd: options.cwd || repoRoot,
    encoding: "utf8",
  });
}

function withTempDir(callback) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "ruthless-detector-"));
  try {
    return callback(directory);
  } finally {
    fs.rmSync(directory, { force: true, recursive: true });
  }
}

function runGit(cwd, args) {
  return spawnSync("git", args, { cwd, encoding: "utf8" });
}

test("--list-rules exposes the executable rule catalog without a scan target", () => {
  const textResult = runDetector(["--list-rules"]);
  const result = runDetector(["--json", "--list-rules"]);

  assert.equal(textResult.status, 0, textResult.stderr);
  assert.match(textResult.stdout, /^UI anti-pattern rules \(\d+\)/);
  assert.match(textResult.stdout, /\[P2\] gradient-text/);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.ok(Array.isArray(payload.rules));
  const ids = payload.rules.map((rule) => rule.id);
  assert.ok(ids.includes("gradient-text"));
  assert.ok(ids.includes("missing-reduced-motion-guard"));
  assert.equal(new Set(ids).size, ids.length);
});

test("--explain returns complete rule metadata and contextual exceptions without a scan target", () => {
  const textResult = runDetector(["--explain", "missing-reduced-transparency-fallback"]);
  const result = runDetector(["--json", "--explain", "missing-reduced-transparency-fallback"]);

  assert.equal(textResult.status, 0, textResult.stderr);
  assert.match(textResult.stdout, /^missing-reduced-transparency-fallback \[P2\]/);
  assert.match(textResult.stdout, /Exceptions:\r?\n-/);
  assert.equal(result.status, 0, result.stderr);
  const rule = JSON.parse(result.stdout);
  assert.deepEqual(Object.keys(rule), [
    "id",
    "category",
    "severity",
    "confidence",
    "applicability",
    "message",
    "exceptions",
  ]);
  assert.equal(rule.id, "missing-reduced-transparency-fallback");
  assert.equal(rule.category, "accessibility");
  assert.equal(rule.severity, "P2");
  assert.equal(rule.confidence, "medium");
  assert.equal(rule.applicability, "contextual");
  assert.ok(Array.isArray(rule.exceptions));
  assert.match(rule.exceptions.join(" "), /documented design system|explicit product intent/i);
  assert.match(rule.exceptions.join(" "), /generated.*vendor.*fixture/i);
  assert.match(rule.exceptions.join(" "), /decorative blur.*functional chrome/i);
});

test("--explain rejects an unknown rule id with an actionable error", () => {
  const result = runDetector(["--explain", "invented-rule"]);

  assert.equal(result.status, 2);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /unknown rule id: invented-rule/i);
  assert.match(result.stderr, /--list-rules/i);
});

test("fails closed when a requested target does not exist", () => {
  const result = runDetector(["--json", "tests/detector/does-not-exist"]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /target does not exist/i);
  assert.equal(result.stdout, "");
});

test("rejects an empty scan unless --allow-empty is explicit", () =>
  withTempDir((directory) => {
    const rejected = runDetector(["--json", directory]);
    assert.equal(rejected.status, 2);
    assert.match(rejected.stderr, /no compatible files/i);

    const allowed = runDetector(["--json", "--allow-empty", directory]);
    assert.equal(allowed.status, 0, allowed.stderr);
    const payload = JSON.parse(allowed.stdout);
    assert.equal(payload.files, 0);
    assert.equal(payload.summary.total, 0);
    assert.equal(payload.options.allowEmpty, true);
  }));

test("scans common frontend extension variants", () =>
  withTempDir((directory) => {
    for (const extension of [".mjs", ".cjs", ".scss", ".sass", ".less"]) {
      fs.writeFileSync(path.join(directory, `component${extension}`), '<img src="/avatar.png">\n');
    }

    const result = runDetector(["--json", directory]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.files, 5);
    assert.equal(payload.findings.filter((finding) => finding.id === "missing-img-alt").length, 5);
  }));

test("skips test, fixture, generated, and vendor directories during normal traversal", () =>
  withTempDir((directory) => {
    fs.mkdirSync(path.join(directory, "src"));
    fs.writeFileSync(path.join(directory, "src/app.tsx"), '<img src="/real.png">\n');
    for (const ignored of ["tests", "fixtures", "generated", "vendor"]) {
      fs.mkdirSync(path.join(directory, ignored));
      fs.writeFileSync(path.join(directory, ignored, "noise.tsx"), '<img src="/noise.png">\n');
    }

    const result = runDetector(["--json", directory]);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.files, 1);
    assert.equal(payload.findings.filter((finding) => finding.id === "missing-img-alt").length, 1);

    const explicit = runDetector(["--json", path.join(directory, "fixtures")]);
    assert.equal(explicit.status, 0, explicit.stderr);
    assert.equal(JSON.parse(explicit.stdout).files, 1);
  }));

test("can include normally ignored directories explicitly", () =>
  withTempDir((directory) => {
    fs.mkdirSync(path.join(directory, "src"));
    fs.mkdirSync(path.join(directory, "tests"));
    fs.writeFileSync(path.join(directory, "src/app.tsx"), "export default null;\n");
    fs.writeFileSync(path.join(directory, "tests/app.test.tsx"), '<img src="/fixture.png">\n');

    const result = runDetector(["--json", "--include-ignored", directory]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).files, 2);
  }));

test("fixture paths remain directly scannable", () => {
  const result = runDetector(["--json", path.join(fixtures, "spatial-motion.scss")]);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(JSON.parse(result.stdout).findings.some((finding) => finding.id === "missing-reduced-motion-guard"));
});

test("does not demand reduced-motion handling for color-only transitions", () => {
  const result = runDetector(["--json", path.join(fixtures, "color-transition.css")]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  const ids = payload.findings.map((finding) => finding.id);
  assert.ok(!ids.includes("missing-reduced-motion-guard"));
  assert.equal(payload.summary.total, 0);
});

test("--changed-only scans staged, unstaged, and untracked files", (context) => {
  if (spawnSync("git", ["--version"], { encoding: "utf8" }).status !== 0) {
    context.skip("git is unavailable");
    return;
  }

  withTempDir((directory) => {
    assert.equal(runGit(directory, ["init", "--quiet"]).status, 0);
    assert.equal(runGit(directory, ["config", "user.email", "detector@example.test"]).status, 0);
    assert.equal(runGit(directory, ["config", "user.name", "Detector Test"]).status, 0);
    fs.writeFileSync(path.join(directory, "tracked.tsx"), "export const tracked = true;\n");
    fs.writeFileSync(path.join(directory, "staged.tsx"), "export const staged = true;\n");
    fs.mkdirSync(path.join(directory, "apps", "web"), { recursive: true });
    fs.writeFileSync(path.join(directory, "apps", "web", "nested.tsx"), "export const nested = true;\n");
    fs.writeFileSync(path.join(directory, ".gitignore"), "ignored.tsx\n");
    assert.equal(runGit(directory, ["add", "."]).status, 0);
    assert.equal(runGit(directory, ["commit", "--quiet", "-m", "baseline"]).status, 0);

    fs.writeFileSync(path.join(directory, "tracked.tsx"), '<img src="/unstaged.png">\n');
    fs.writeFileSync(path.join(directory, "staged.tsx"), '<img src="/staged.png">\n');
    assert.equal(runGit(directory, ["add", "staged.tsx"]).status, 0);
    fs.writeFileSync(path.join(directory, "untracked.tsx"), '<img src="/untracked.png">\n');
    fs.writeFileSync(path.join(directory, "apps", "web", "nested.tsx"), '<img src="/nested.png">\n');
    fs.writeFileSync(path.join(directory, "ignored.tsx"), '<img src="/ignored.png">\n');

    const result = runDetector(["--json", "--changed-only"], { cwd: directory });
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.files, 4);
    assert.deepEqual(
      payload.findings
        .filter((finding) => finding.id === "missing-img-alt")
        .map((finding) => finding.file)
        .sort(),
      ["apps/web/nested.tsx", "staged.tsx", "tracked.tsx", "untracked.tsx"],
    );

    const nestedResult = runDetector(["--json", "--changed-only"], { cwd: path.join(directory, "apps", "web") });
    assert.equal(nestedResult.status, 0, nestedResult.stderr);
    const nestedPayload = JSON.parse(nestedResult.stdout);
    assert.equal(nestedPayload.files, 1);
    assert.deepEqual(
      nestedPayload.findings.filter((finding) => finding.id === "missing-img-alt").map((finding) => finding.file),
      ["apps/web/nested.tsx"],
    );
  });
});

test("findings expose confidence, applicability, and line-stable fingerprints", () =>
  withTempDir((directory) => {
    const component = path.join(directory, "component.tsx");
    const baseline = path.join(directory, "baseline.json");
    fs.writeFileSync(component, '<img src="/avatar.png">\n');

    const initial = runDetector(["--json", component]);
    assert.equal(initial.status, 0, initial.stderr);
    const initialPayload = JSON.parse(initial.stdout);
    assert.ok(initialPayload.findings.length > 0);
    for (const finding of initialPayload.findings) {
      assert.match(finding.confidence, /^(?:low|medium|high)$/);
      assert.match(finding.applicability, /^(?:direct|contextual)$/);
      assert.equal(typeof finding.fingerprint, "string");
      assert.ok(finding.fingerprint.length > 0);
    }
    fs.writeFileSync(baseline, JSON.stringify(initialPayload));

    fs.writeFileSync(component, '\n\n\n<img src="/avatar.png">\n');
    const filtered = runDetector(["--json", "--baseline", baseline, component]);
    assert.equal(filtered.status, 0, filtered.stderr);
    assert.equal(JSON.parse(filtered.stdout).summary.total, 0);
  }));

test("context-dependent motion heuristics do not escalate themselves to P1", () =>
  withTempDir((directory) => {
    const component = path.join(directory, "motion.css");
    fs.writeFileSync(
      component,
      ".panel { transition: width 180ms ease-in; transform: scale(0); }\n",
);

    const result = runDetector(["--json", component]);
    assert.equal(result.status, 0, result.stderr);
    const findings = JSON.parse(result.stdout).findings;
    for (const id of ["layout-transition", "ease-in-ui-motion", "scale-zero-entry"]) {
      const finding = findings.find((candidate) => candidate.id === id);
      assert.ok(finding, `expected ${id}`);
      assert.equal(finding.severity, "P2");
      assert.equal(finding.applicability, "contextual");
    }
  }));

test("Framer Motion shorthand remains a low-severity profiling lead, not a categorical prescription", () =>
  withTempDir((directory) => {
    const component = path.join(directory, "motion-card.tsx");
    fs.writeFileSync(component, "export const Card = () => <motion.div animate={{ x: 24, scale: 1.05 }} />;\n");

    const scan = runDetector(["--json", component]);
    assert.equal(scan.status, 0, scan.stderr);
    const finding = JSON.parse(scan.stdout).findings.find(
      (candidate) => candidate.id === "framer-motion-shorthand-risk",
    );
    assert.ok(finding);
    assert.equal(finding.severity, "P3");
    assert.equal(finding.confidence, "low");
    assert.equal(finding.applicability, "contextual");
    assert.match(finding.message, /profile.*representative load/i);
    assert.doesNotMatch(finding.message, /use full transform strings/i);

    const explained = runDetector(["--json", "--explain", "framer-motion-shorthand-risk"]);
    assert.equal(explained.status, 0, explained.stderr);
    const exceptions = JSON.parse(explained.stdout).exceptions.join(" ");
    assert.match(exceptions, /framework primitive or library/i);
    assert.match(exceptions, /register.*frequency.*distance/i);
  }));

test("scroll regions and hand-drawn interactive SVGs produce contextual finish leads", () =>
  withTempDir((directory) => {
    const unfinished = path.join(directory, "unfinished.tsx");
    const treated = path.join(directory, "treated.css");
    const gutterOnly = path.join(directory, "gutter-only.css");
    fs.writeFileSync(
      unfinished,
      'export const Panel = () => <div className="overflow-y-auto"><button aria-label="Close"><svg viewBox="0 0 24 24"><path d="M4 4l16 16" /></svg></button></div>;\n',
    );
    fs.writeFileSync(
      treated,
      '.panel { overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--thumb) transparent; }\n.panel::-webkit-scrollbar { width: 8px; }\n',
    );
    fs.writeFileSync(gutterOnly, ".panel { overflow-y: auto; scrollbar-gutter: stable; }\n");

    const unfinishedResult = runDetector(["--json", unfinished]);
    const treatedResult = runDetector(["--json", treated]);
    const gutterOnlyResult = runDetector(["--json", gutterOnly]);
    assert.equal(unfinishedResult.status, 0, unfinishedResult.stderr);
    assert.equal(treatedResult.status, 0, treatedResult.stderr);
    assert.equal(gutterOnlyResult.status, 0, gutterOnlyResult.stderr);
    const unfinishedFindings = JSON.parse(unfinishedResult.stdout).findings;
    assert.ok(unfinishedFindings.some((finding) => finding.id === "native-scrollbar-risk"));
    assert.ok(unfinishedFindings.some((finding) => finding.id === "improvised-inline-svg-icon"));
    assert.equal(JSON.parse(treatedResult.stdout).findings.some((finding) => finding.id === "native-scrollbar-risk"), false);
    assert.equal(JSON.parse(gutterOnlyResult.stdout).findings.some((finding) => finding.id === "native-scrollbar-risk"), true);
  }));

test("finding paths and fingerprints stay stable across working directories", () =>
  withTempDir((temp) => {
    const repo = path.join(temp, "repo");
    const nested = path.join(repo, "nested");
    const source = path.join(repo, "src", "bad.tsx");
    fs.mkdirSync(nested, { recursive: true });
    fs.mkdirSync(path.dirname(source), { recursive: true });
    fs.writeFileSync(source, "export const Bad = () => <div onClick={() => {}}>click</div>;\n");
    const initialized = runGit(repo, ["init"]);
    assert.equal(initialized.status, 0, initialized.stderr);

    const fromRoot = runDetector(["--json", source], { cwd: repo });
    const fromNested = runDetector(["--json", source], { cwd: nested });
    assert.equal(fromRoot.status, 0, fromRoot.stderr);
    assert.equal(fromNested.status, 0, fromNested.stderr);

    const rootFinding = JSON.parse(fromRoot.stdout).findings.find((finding) => finding.id === "interactive-div");
    const nestedFinding = JSON.parse(fromNested.stdout).findings.find((finding) => finding.id === "interactive-div");
    assert.ok(rootFinding);
    assert.ok(nestedFinding);
    assert.equal(rootFinding.file, "src/bad.tsx");
    assert.equal(nestedFinding.file, rootFinding.file);
    assert.equal(nestedFinding.fingerprint, rootFinding.fingerprint);
  }));

test("legacy provider flags are accepted as deprecated no-ops", () =>
  withTempDir((directory) => {
    const component = path.join(directory, "card.css");
    fs.writeFileSync(
      component,
      ".card { border: 1px solid #ddd; box-shadow: 0 20px 50px #0003; }\n.photo:hover { transform: scale(1.05); }\n",
    );

    const plain = runDetector(["--json", component]);
    const flagged = runDetector(["--json", "--gpt", "--gemini", component]);
    assert.equal(plain.status, 0, plain.stderr);
    assert.equal(flagged.status, 0, flagged.stderr);
    assert.match(flagged.stderr, /deprecated/i);
    assert.deepEqual(
      JSON.parse(flagged.stdout).findings.map((finding) => finding.id).sort(),
      JSON.parse(plain.stdout).findings.map((finding) => finding.id).sort(),
    );
    assert.ok(JSON.parse(flagged.stdout).findings.every((finding) => !("provider" in finding)));
  }));
