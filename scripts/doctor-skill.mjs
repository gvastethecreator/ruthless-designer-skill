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
  const nextValue = () => {
    const value = inlineValue ?? args[++index];
    if (!value || value.startsWith("--")) fail(`Missing value for ${name}`);
    return value;
  };
  if (name === "--source") options.source = path.resolve(nextValue());
  else if (name === "--target") options.targets.push(path.resolve(nextValue()));
  else if (arg === "--check") options.check = true;
  else if (arg === "--json") options.json = true;
  else if (arg === "--help" || arg === "-h") usage(0);
  else fail(`Unknown option: ${arg}`, true);
}

validateSource(options.source);
if (!options.targets.length) options.targets = defaultTargets();

const source = describeExistingPath(options.source);
const sourceManifest = buildManifest(source.realPath);
const targets = options.targets.map((target) => inspectTarget(target, source, sourceManifest));
const payload = {
  source: {
    requestedPath: source.requestedPath,
    realPath: source.realPath,
    files: sourceManifest.size,
    canonical: true,
  },
  targets,
  healthy: targets.length > 0 && targets.every((target) => target.healthy),
};

if (options.json) process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
else renderText(payload);

if (options.check && !payload.healthy) process.exitCode = 1;

function defaultTargets() {
  const home = os.homedir();
  const targets = [
    path.join(home, ".agents", "skills", "ruthless-designer"),
    path.join(home, ".codex", "skills", "ruthless-designer"),
  ];
  if (process.env.CODEX_HOME) {
    targets.push(path.join(path.resolve(process.env.CODEX_HOME), "skills", "ruthless-designer"));
  }
  return uniquePaths(targets);
}

function validateSource(requestedPath) {
  if (!fs.existsSync(requestedPath)) fail(`Source skill does not exist: ${requestedPath}`);
  const stat = fs.lstatSync(requestedPath);
  if (stat.isSymbolicLink()) fail(`Source must be the real canonical directory, not a link: ${requestedPath}`);
  if (!stat.isDirectory()) fail(`Source must be a directory: ${requestedPath}`);
  if (!fs.existsSync(path.join(requestedPath, "SKILL.md"))) {
    fail(`Source skill is missing SKILL.md: ${requestedPath}`);
  }
}

function inspectTarget(requestedPath, source, sourceManifest) {
  const absolute = path.resolve(requestedPath);
  const entry = lstatOrNull(absolute);
  if (!entry) {
    return targetResult(absolute, null, "missing", false, "target path does not exist");
  }

  const linked = entry.isSymbolicLink();
  let realPath;
  try {
    realPath = fs.realpathSync.native(absolute);
  } catch {
    return targetResult(
      absolute,
      null,
      linked ? "misdirected" : "invalid",
      false,
      linked ? "link destination does not exist" : "target path cannot be resolved",
    );
  }

  if (samePath(realPath, source.realPath)) {
    if (!linked) {
      return {
        ...targetResult(
          absolute,
          realPath,
          "indirect",
          false,
          "target resolves through a linked parent, but the target itself is not a direct link",
        ),
        linkType: "indirect",
        files: sourceManifest.size,
      };
    }
    const immediateTarget = path.resolve(path.dirname(absolute), fs.readlinkSync(absolute));
    if (!samePath(immediateTarget, source.realPath)) {
      return {
        ...targetResult(
          absolute,
          realPath,
          "indirect",
          false,
          `target links through another path instead of pointing directly at canonical: ${immediateTarget}`,
        ),
        linkType: "indirect",
        files: sourceManifest.size,
      };
    }
    return {
      ...targetResult(absolute, realPath, "linked", true, "target resolves to the canonical source"),
      linkType: "direct",
      files: sourceManifest.size,
    };
  }

  const hasSkill = fs.existsSync(path.join(realPath, "SKILL.md"));
  let targetManifest = new Map();
  let differences = [];
  if (hasSkill && fs.statSync(realPath).isDirectory()) {
    targetManifest = buildManifest(realPath);
    differences = compareManifests(sourceManifest, targetManifest);
  } else {
    differences = ["missing SKILL.md"];
  }

  if (linked) {
    return {
      ...targetResult(absolute, realPath, "misdirected", false, "link resolves to a different location"),
      linkType: "direct",
      files: targetManifest.size,
      differences,
    };
  }

  if (!entry.isDirectory()) {
    return {
      ...targetResult(absolute, realPath, "invalid", false, "target is not a directory"),
      files: 0,
      differences,
    };
  }

  return {
    ...targetResult(absolute, realPath, "copy", false, "target is a separate directory, not a link to source"),
    files: targetManifest.size,
    differences,
  };
}

function targetResult(requestedPath, realPath, status, healthy, reason) {
  return {
    requestedPath,
    realPath,
    status,
    healthy,
    reason,
    linkType: "none",
    files: 0,
    differences: [],
  };
}

function describeExistingPath(requestedPath) {
  const absolute = path.resolve(requestedPath);
  return { requestedPath: absolute, realPath: fs.realpathSync.native(absolute) };
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

function lstatOrNull(value) {
  try {
    return fs.lstatSync(value);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function samePath(left, right) {
  return normalize(left) === normalize(right);
}

function uniquePaths(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalize(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalize(value) {
  return path.resolve(value).replaceAll("\\", "/").toLowerCase();
}

function renderText(result) {
  console.log(`Source: ${result.source.requestedPath}`);
  if (!samePath(result.source.realPath, result.source.requestedPath)) console.log(`  real: ${result.source.realPath}`);
  console.log(`  files: ${result.source.files}`);
  for (const target of result.targets) {
    console.log(`Target: ${target.requestedPath}`);
    if (target.realPath && !samePath(target.realPath, target.requestedPath)) console.log(`  real: ${target.realPath}`);
    console.log(`  status: ${target.status}`);
    console.log(`  healthy: ${target.healthy ? "yes" : "no"}`);
    console.log(`  reason: ${target.reason}`);
    console.log(`  files: ${target.files}`);
    for (const difference of target.differences.slice(0, 20)) console.log(`  - ${difference}`);
    if (target.differences.length > 20) console.log(`  - ... ${target.differences.length - 20} more`);
  }
  console.log(`All targets resolve to canonical source: ${result.healthy ? "yes" : "no"}`);
}

function fail(message, showUsage = false) {
  console.error(message);
  if (showUsage) console.error("Usage: node scripts/doctor-skill.mjs [--source path] [--target path] [--check] [--json]");
  process.exit(2);
}

function usage(exitCode) {
  const stream = exitCode === 0 ? process.stdout : process.stderr;
  stream.write("Usage: node scripts/doctor-skill.mjs [--source path] [--target path] [--check] [--json]\n");
  process.exit(exitCode);
}
