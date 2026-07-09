#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const options = {
  source: path.resolve("SKILLS/ruthless-designer"),
  target: null,
  write: false,
  prune: false,
  allowLinkedTarget: false,
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  const [name, inlineValue] = arg.split("=", 2);
  const nextValue = () => inlineValue ?? args[++index];
  if (name === "--source") options.source = path.resolve(nextValue());
  else if (name === "--target") options.target = path.resolve(nextValue());
  else if (arg === "--write") options.write = true;
  else if (arg === "--prune") options.prune = true;
  else if (arg === "--allow-linked-target") options.allowLinkedTarget = true;
  else if (arg === "--help" || arg === "-h") usage(0);
  else {
    console.error(`Unknown option: ${arg}`);
    usage(2);
  }
}

options.target ||= path.join(process.env.CODEX_HOME || path.join(os.homedir(), ".codex"), "skills", "ruthless-designer");
validatePaths();

const sourceRealPath = fs.realpathSync.native(options.source);
const targetExists = fs.existsSync(options.target);
const targetRealPath = resolvePotentialPath(options.target);
const linkedTarget = normalize(targetRealPath) !== normalize(options.target);
validateResolvedPaths(sourceRealPath, targetRealPath);

const sourceFiles = listFiles(sourceRealPath);

if (linkedTarget && options.write && !options.allowLinkedTarget) {
  console.error(`Refusing to write through linked target without --allow-linked-target: ${options.target} -> ${targetRealPath}`);
  process.exit(2);
}

const targetFiles = targetExists ? listFiles(targetRealPath) : new Map();
const writes = [];
const deletes = [];

for (const [relative, sourcePath] of sourceFiles) {
  const targetPath = path.join(targetRealPath, relative);
  if (!targetFiles.has(relative) || !sameBytes(sourcePath, targetPath)) writes.push(relative);
}
if (options.prune) {
  for (const relative of targetFiles.keys()) {
    if (!sourceFiles.has(relative)) deletes.push(relative);
  }
}

const writeDestinations = options.write ? new Map(writes.map((relative) => [relative, resolveTargetMember(relative)])) : new Map();
const deleteDestinations = options.write ? new Map(deletes.map((relative) => [relative, resolveTargetMember(relative)])) : new Map();

console.log(`Source: ${options.source}`);
console.log(`Target: ${options.target}`);
if (linkedTarget) console.log(`Target resolves to: ${targetRealPath}`);
console.log(`Mode: ${options.write ? "write" : "dry-run"}`);
console.log(`Writes: ${writes.length}`);
console.log(`Deletes: ${deletes.length}${options.prune ? "" : " (prune disabled)"}`);
for (const relative of writes.slice(0, 20)) console.log(`  write ${relative}`);
for (const relative of deletes.slice(0, 20)) console.log(`  delete ${relative}`);
if (writes.length + deletes.length > 40) console.log(`  ... ${writes.length + deletes.length - 40} more`);

if (!options.write) {
  console.log("Dry run only. Add --write to copy files; add --prune to remove stale files.");
  process.exit(0);
}

fs.mkdirSync(targetRealPath, { recursive: true });
for (const relative of writes) {
  const destination = writeDestinations.get(relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(sourceFiles.get(relative), destination);
}
for (const relative of deletes) fs.rmSync(deleteDestinations.get(relative), { force: true });
removeEmptyDirectories(targetRealPath, targetRealPath);

console.log("Local skill installation synchronized.");

function validatePaths() {
  if (!fs.existsSync(path.join(options.source, "SKILL.md"))) fail(`Source skill is missing SKILL.md: ${options.source}`);
  if (path.basename(options.source) !== "ruthless-designer") fail(`Source folder must be named ruthless-designer: ${options.source}`);
  if (path.basename(options.target) !== "ruthless-designer") fail(`Target folder must be named ruthless-designer: ${options.target}`);
  const source = normalize(options.source);
  const target = normalize(options.target);
  if (source === target) fail("Source and target must be different paths");
  if (target.startsWith(`${source}/`)) fail("Target cannot be nested inside the source skill");
  if (source.startsWith(`${target}/`)) fail("Source cannot be nested inside the target skill");
  if (target === normalize(path.parse(options.target).root)) fail("Target cannot be a filesystem root");
}

function validateResolvedPaths(sourcePath, targetPath) {
  const source = normalize(sourcePath);
  const target = normalize(targetPath);
  if (source === target) fail("Resolved source and target must be different paths");
  if (target.startsWith(`${source}/`)) fail("Resolved target cannot be nested inside the source skill");
  if (source.startsWith(`${target}/`)) fail("Resolved source cannot be nested inside the target skill");
}

function resolvePotentialPath(requestedPath) {
  const missingSegments = [];
  let existing = path.resolve(requestedPath);
  while (!fs.existsSync(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) return path.resolve(requestedPath);
    missingSegments.unshift(path.basename(existing));
    existing = parent;
  }
  return path.join(fs.realpathSync.native(existing), ...missingSegments);
}

function resolveTargetMember(relative) {
  const requested = path.join(targetRealPath, relative);
  const resolved = resolvePotentialPath(requested);
  const relation = path.relative(targetRealPath, resolved);
  if (relation === ".." || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
    fail(`Target member resolves outside the skill directory: ${relative} -> ${resolved}`);
  }
  return resolved;
}

function listFiles(root) {
  const files = new Map();
  if (!fs.existsSync(root)) return files;
  walk(root, root, files);
  return files;
}

function walk(root, current, out) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if ([".git", "node_modules", "output"].includes(entry.name)) continue;
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) walk(root, absolute, out);
    else if (entry.isFile()) out.set(path.relative(root, absolute), absolute);
  }
}

function sameBytes(left, right) {
  if (!fs.existsSync(right)) return false;
  const a = fs.statSync(left);
  const b = fs.statSync(right);
  return a.size === b.size && fs.readFileSync(left).equals(fs.readFileSync(right));
}

function removeEmptyDirectories(root, current) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const absolute = path.join(current, entry.name);
    removeEmptyDirectories(root, absolute);
    if (absolute !== root && fs.readdirSync(absolute).length === 0) fs.rmdirSync(absolute);
  }
}

function normalize(value) {
  return path.resolve(value).replaceAll("\\", "/").toLowerCase();
}

function fail(message) {
  console.error(message);
  process.exit(2);
}

function usage(exitCode) {
  console.error("Usage: node scripts/install-local-skill.mjs [--source path] [--target path] [--write] [--prune] [--allow-linked-target]");
  process.exit(exitCode);
}
