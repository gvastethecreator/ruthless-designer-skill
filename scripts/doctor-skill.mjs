#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const options = {
  source: path.resolve("SKILLS/ruthless-designer"),
  targets: [],
  check: false,
  json: false,
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  const [name, inlineValue] = arg.split("=", 2);
  const nextValue = () => inlineValue ?? args[++index];
  if (name === "--source") options.source = path.resolve(nextValue());
  else if (name === "--target") options.targets.push(path.resolve(nextValue()));
  else if (arg === "--check") options.check = true;
  else if (arg === "--json") options.json = true;
  else if (arg === "--help" || arg === "-h") usage(0);
  else {
    console.error(`Unknown option: ${arg}`);
    usage(2);
  }
}

if (!fs.existsSync(path.join(options.source, "SKILL.md"))) {
  console.error(`Source skill is missing SKILL.md: ${options.source}`);
  process.exit(2);
}

if (!options.targets.length) options.targets = defaultTargets();

const source = describePath(options.source);
const sourceManifest = buildManifest(source.realPath);
const targets = options.targets.map((target) => inspectTarget(target, sourceManifest));
const payload = {
  source: {
    requestedPath: source.requestedPath,
    realPath: source.realPath,
    files: sourceManifest.size,
  },
  targets,
  healthy: targets.some((target) => target.status === "identical"),
};

if (options.json) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
} else {
  renderText(payload);
}

if (options.check && !payload.healthy) process.exitCode = 1;

function defaultTargets() {
  const roots = new Set();
  if (process.env.CODEX_HOME) roots.add(path.resolve(process.env.CODEX_HOME));
  roots.add(path.join(os.homedir(), ".codex"));
  roots.add(path.join(os.homedir(), ".agents"));
  return [...roots].map((root) => path.join(root, "skills", "ruthless-designer"));
}

function inspectTarget(requestedPath, sourceManifest) {
  if (!fs.existsSync(requestedPath)) {
    return { requestedPath, realPath: null, status: "missing", files: 0, differences: [] };
  }

  const target = describePath(requestedPath);
  if (!fs.existsSync(path.join(target.realPath, "SKILL.md"))) {
    return {
      requestedPath,
      realPath: target.realPath,
      status: "invalid",
      files: 0,
      differences: ["missing SKILL.md"],
    };
  }

  const targetManifest = buildManifest(target.realPath);
  const differences = compareManifests(sourceManifest, targetManifest);
  return {
    requestedPath,
    realPath: target.realPath,
    status: differences.length ? "drift" : "identical",
    files: targetManifest.size,
    differences,
  };
}

function describePath(requestedPath) {
  const absolute = path.resolve(requestedPath);
  return {
    requestedPath: absolute,
    realPath: fs.realpathSync.native(absolute),
  };
}

function buildManifest(root) {
  const manifest = new Map();
  walk(root, root, manifest);
  return manifest;
}

function walk(root, current, manifest) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if ([".git", "node_modules", "output"].includes(entry.name)) continue;
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) walk(root, absolute, manifest);
    else if (entry.isFile()) {
      const relative = path.relative(root, absolute).replaceAll("\\", "/");
      const hash = crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
      manifest.set(relative, hash);
    }
  }
}

function compareManifests(source, target) {
  const differences = [];
  const files = new Set([...source.keys(), ...target.keys()]);
  for (const file of [...files].sort()) {
    if (!source.has(file)) differences.push(`installed-only: ${file}`);
    else if (!target.has(file)) differences.push(`source-only: ${file}`);
    else if (source.get(file) !== target.get(file)) differences.push(`content-diff: ${file}`);
  }
  return differences;
}

function renderText(payload) {
  console.log(`Source: ${payload.source.requestedPath}`);
  if (payload.source.realPath !== payload.source.requestedPath) console.log(`  real: ${payload.source.realPath}`);
  console.log(`  files: ${payload.source.files}`);
  for (const target of payload.targets) {
    console.log(`Target: ${target.requestedPath}`);
    if (target.realPath && target.realPath !== target.requestedPath) console.log(`  real: ${target.realPath}`);
    console.log(`  status: ${target.status}`);
    console.log(`  files: ${target.files}`);
    for (const difference of target.differences.slice(0, 20)) console.log(`  - ${difference}`);
    if (target.differences.length > 20) console.log(`  - ... ${target.differences.length - 20} more`);
  }
  console.log(`Healthy active copy found: ${payload.healthy ? "yes" : "no"}`);
}

function usage(exitCode) {
  console.error("Usage: node scripts/doctor-skill.mjs [--source path] [--target path] [--check] [--json]");
  process.exit(exitCode);
}
