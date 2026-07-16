import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const generatorPath = path.join(
  repoRoot,
  "SKILLS",
  "ruthless-designer",
  "scripts",
  "generate-design-report.mjs",
);
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

function sandbox(name) {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ruthless-report-" + name + "-"));
}

function baseManifest(imageName = "capture.png") {
  return {
    version: 1,
    mode: "redesign",
    title: "Operations command center",
    eyebrow: "DESIGN CASE 017",
    verdict: {
      severity: "P1",
      label: "Hierarchy failure",
      summary: "The alert lane and the ambient metrics currently compete for the same attention.",
    },
    context: {
      archetype: "operator cockpit",
      userMode: "continuous monitoring under pressure",
      primaryArtifact: "incident queue",
      proofTarget: "triage remains legible at 1280x800 and 390x844",
    },
    summary: [
      "The redesign turns a card wall into a decision surface.",
      "Evidence and actions share one scan lane; ambient telemetry moves to a quieter rail.",
    ],
    screenshots: [
      {
        id: "before-default",
        src: imageName,
        alt: "Current command center with several equal-weight panels",
        label: "Before · default",
        state: "default",
        viewport: "1280×800",
        annotations: [
          { x: 12.5, y: 20, width: 30, height: 18, label: "Repeated equal-weight panels erase priority.", tone: "error" },
          { x: 80, y: 12, label: "Alert status is detached from its action.", tone: "proposal" },
        ],
      },
    ],
    findings: [
      {
        id: "flat-priority",
        severity: "P1",
        title: "Every panel shouts at the same volume",
        evidence: "The first viewport contains six panels with equal surface, heading, and spacing treatment.",
        damage: "Operators cannot identify the next decision without reading every region.",
        cause: "The composition is a repeated-card inventory instead of an incident workflow.",
        solution: "Create one incident spine, bind evidence to each decision, and demote ambient metrics to the secondary rail.",
        roast: "This is a monitoring surface organized like a sticker collection.",
        screenshotId: "before-default",
      },
    ],
    directions: [
      {
        name: "Incident spine",
        status: "selected",
        thesis: "One vertical decision sequence owns the first scan.",
        signature: "A live incident rail with evidence stitched directly into each escalation.",
        why: "It matches the operator task and remains stable as incidents change.",
      },
      {
        name: "Telemetry field",
        status: "rejected",
        thesis: "A spatial field makes system topology dominant.",
        why: "Topology is useful, but it delays the immediate triage decision in this surface.",
      },
    ],
    actions: [
      {
        priority: "01",
        title: "Rebuild the first viewport around incident priority",
        detail: "Replace the equal panel matrix with the incident spine and one supporting telemetry rail.",
        proof: "A five-second test identifies the active incident, owner, severity, and next action.",
      },
    ],
    preserve: ["Keep the existing alert vocabulary and keyboard shortcuts."],
    proof: [
      { label: "Default viewport", status: "failed", detail: "Priority is not legible.", artifact: "before-default" },
      { label: "Recovery state", status: "blocked", detail: "No recovery fixture was supplied." },
    ],
    risks: ["The telemetry rail may overflow with long service names."],
    limitations: ["No authenticated production dataset was available."],
    metadata: { generated: "2026-07-16", target: "local fixture" },
  };
}

function writeCase(dir, manifest, imageBytes = tinyPng) {
  const manifestPath = path.join(dir, "report.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  if (imageBytes) fs.writeFileSync(path.join(dir, "capture.png"), imageBytes);
  return manifestPath;
}

function runGenerator(args) {
  return spawnSync(process.execPath, [generatorPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

test("generates a standalone annotated dossier and escapes hostile text", () => {
  const dir = sandbox("standalone");
  const manifest = baseManifest();
  manifest.title = "Ops <script>alert(1)</script>";
  manifest.findings[0].evidence = "<img src=x onerror=alert(1)> evidence";
  const manifestPath = writeCase(dir, manifest);
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath, "--strict-assets"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  assert.equal(summary.embeddedImages, 1);
  assert.equal(summary.missingImages, 0);
  assert.match(html, /data:image\/png;base64,/);
  assert.match(html, /left:12\.5%;top:20%;width:30%;height:18%/);
  assert.match(html, /Evidence wall/);
  assert.match(html, /Proof ledger/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt; evidence/);
  assert.match(html, /@media print/);
  assert.doesNotMatch(html, /<script(?:\s|>)/i);
  assert.doesNotMatch(html, /<link[^>]+stylesheet/i);
});

test("renders a visible evidence placeholder when an image is missing", () => {
  const dir = sandbox("missing");
  const manifestPath = writeCase(dir, baseManifest("missing.png"), null);
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  assert.equal(summary.missingImages, 1);
  assert.match(summary.warnings[0], /missing/i);
  assert.match(html, /Evidence unavailable/);
  assert.match(html, /Artifact warnings/);
});

test("never fetches remote screenshots or serializes their query strings", () => {
  const dir = sandbox("remote");
  const source = "https://private.example.test/captures/ops.png?token=do-not-serialize";
  const manifestPath = writeCase(dir, baseManifest(source), null);
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  assert.equal(summary.missingImages, 1);
  assert.match(html, /Evidence unavailable/);
  assert.match(html, /private\.example\.test\/ops\.png/);
  assert.doesNotMatch(html, /https:\/\/private\.example\.test/);
  assert.doesNotMatch(html, /do-not-serialize/);
});

test("renders built-in Spanish report chrome when the manifest language is Spanish", () => {
  const dir = sandbox("spanish");
  const manifest = baseManifest();
  manifest.language = "es-AR";
  const manifestPath = writeCase(dir, manifest);
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath, "--strict-assets"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  assert.match(html, /<html lang="es-AR">/);
  assert.match(html, /Muro de evidencia/);
  assert.match(html, /Hallazgos que obligan a actuar/);
  assert.match(html, /Registro de pruebas/);
  assert.match(html, /Arquetipo/);
  assert.match(html, /Modo de usuario/);
  assert.match(html, /seleccionada/);
  assert.match(html, /falló/);
  assert.doesNotMatch(html, />Archetype</);
  assert.doesNotMatch(html, />selected</);
  assert.match(html, /Autónomo · imprimible · sin recursos externos/);
});

test("strict asset mode rejects missing and corrupt screenshots", () => {
  const missingDir = sandbox("strict-missing");
  const missingManifest = writeCase(missingDir, baseManifest("missing.png"), null);
  const missingOut = path.join(missingDir, "report.html");
  const missingResult = runGenerator(["--manifest", missingManifest, "--out", missingOut, "--strict-assets"]);

  assert.equal(missingResult.status, 2, missingResult.stderr || missingResult.stdout);
  assert.match(missingResult.stderr, /asset is missing/i);
  assert.equal(fs.existsSync(missingOut), false);

  const corruptDir = sandbox("strict-corrupt");
  const corruptManifest = writeCase(corruptDir, baseManifest(), Buffer.from("not an image"));
  const corruptResult = runGenerator([
    "--manifest",
    corruptManifest,
    "--out",
    path.join(corruptDir, "report.html"),
    "--strict-assets",
  ]);

  assert.equal(corruptResult.status, 2, corruptResult.stderr || corruptResult.stdout);
  assert.match(corruptResult.stderr, /corrupt or unsupported/i);
});

test("strict asset mode validates embedded image bytes and declared MIME type", () => {
  const dir = sandbox("strict-data-uri");
  const manifest = baseManifest();
  manifest.screenshots[0].src = "data:image/png;base64," + Buffer.from("not an image").toString("base64");
  const manifestPath = writeCase(dir, manifest, null);

  const result = runGenerator([
    "--manifest",
    manifestPath,
    "--out",
    path.join(dir, "report.html"),
    "--strict-assets",
  ]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /data is corrupt|MIME type is incorrect/i);
});

test("rejects annotation geometry outside normalized screenshot bounds", () => {
  const dir = sandbox("annotation-bounds");
  const manifest = baseManifest();
  manifest.screenshots[0].annotations[0] = {
    x: 80,
    y: 20,
    width: 30,
    height: 20,
    label: "This box exceeds the right edge.",
  };
  const manifestPath = writeCase(dir, manifest);

  const result = runGenerator(["--manifest", manifestPath, "--out", path.join(dir, "report.html")]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /exceeds screenshot bounds/i);
});

test("rejects findings linked to an unknown screenshot", () => {
  const dir = sandbox("unknown-link");
  const manifest = baseManifest();
  manifest.findings[0].screenshotId = "not-present";
  const manifestPath = writeCase(dir, manifest);

  const result = runGenerator(["--manifest", manifestPath, "--out", path.join(dir, "report.html")]);

  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /unknown screenshotId/i);
});

test("linked-image mode discloses that the report is not portable", () => {
  const dir = sandbox("linked");
  const manifestPath = writeCase(dir, baseManifest());
  const outPath = path.join(dir, "report.html");

  const result = runGenerator(["--manifest", manifestPath, "--out", outPath, "--no-embed-images"]);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const summary = JSON.parse(result.stdout);
  const html = fs.readFileSync(outPath, "utf8");
  assert.equal(summary.embeddedImages, 0);
  assert.match(summary.warnings[0], /linked instead of embedded/i);
  assert.match(html, /capture\.png/);
  assert.doesNotMatch(html, /data:image\/png;base64,/);
});
