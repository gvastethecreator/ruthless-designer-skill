#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const options = {
  source: path.resolve("SKILLS/ruthless-designer"),
  targets: [],
  write: false,
  replace: false,
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
  else if (arg === "--write") options.write = true;
  else if (arg === "--replace") options.replace = true;
  else if (arg === "--help" || arg === "-h") usage(0);
  else fail(`Unknown option: ${arg}`, true);
}

const source = validateSource(options.source);
if (!options.targets.length) options.targets = defaultTargets();
options.targets = uniquePaths(options.targets);
validateTargetSet(options.targets, source);

// Complete the validation and planning phase before any filesystem mutation.
const plans = options.targets.map((target) => planTarget(target, source));

renderPlan(source, plans);
if (!options.write) {
  console.log("Dry run only. Add --write to apply this junction topology.");
  process.exit(0);
}

for (const plan of plans) applyPlan(plan, source);
console.log("Local skill junction topology synchronized.");

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
  const absolute = path.resolve(requestedPath);
  if (path.basename(absolute).toLowerCase() !== "ruthless-designer") {
    fail(`Source folder must be named ruthless-designer: ${absolute}`);
  }
  const entry = lstatOrNull(absolute);
  if (!entry) fail(`Source skill does not exist: ${absolute}`);
  if (entry.isSymbolicLink()) fail(`Source must be the real canonical directory, not a link: ${absolute}`);
  if (!entry.isDirectory()) fail(`Source must be a directory: ${absolute}`);
  if (!fs.existsSync(path.join(absolute, "SKILL.md"))) fail(`Source skill is missing SKILL.md: ${absolute}`);
  return { requestedPath: absolute, realPath: fs.realpathSync.native(absolute) };
}

function validateTargetSet(targets, source) {
  const requested = targets.map((target) => path.resolve(target));
  const resolved = requested.map((target) => resolvePotentialPath(target));
  for (let left = 0; left < targets.length; left += 1) {
    validateRequestedRelationship(requested[left], source);
    validateResolvedRelationship(resolved[left], source);
    for (let right = left + 1; right < targets.length; right += 1) {
      const sharedResolvedDestination = samePath(resolved[left], resolved[right]);
      const bothAreDirectCanonicalAliases =
        sharedResolvedDestination &&
        isDirectCanonicalAlias(requested[left], resolved[left], source) &&
        isDirectCanonicalAlias(requested[right], resolved[right], source);
      if (
        samePath(requested[left], requested[right]) ||
        isInside(requested[left], requested[right]) ||
        isInside(requested[right], requested[left]) ||
        (sharedResolvedDestination && !bothAreDirectCanonicalAliases) ||
        isInside(resolved[left], resolved[right]) ||
        isInside(resolved[right], resolved[left])
      ) {
        fail(`Targets cannot be nested inside each other: ${requested[left]} ; ${requested[right]}`);
      }
    }
  }
}

function isDirectCanonicalAlias(requestedPath, resolvedPath, source) {
  const entry = lstatOrNull(requestedPath);
  if (!entry?.isSymbolicLink() || !samePath(resolvedPath, source.realPath)) return false;
  const immediateTarget = path.resolve(path.dirname(requestedPath), fs.readlinkSync(requestedPath));
  return samePath(immediateTarget, source.realPath);
}

function planTarget(requestedPath, source) {
  const absolute = path.resolve(requestedPath);
  validateRequestedRelationship(absolute, source);
  const prospectivePath = resolvePotentialPath(absolute);
  validateResolvedRelationship(prospectivePath, source);

  const entry = lstatOrNull(absolute);
  if (!entry) {
    return {
      requestedPath: absolute,
      action: "create",
      description: linkDescription("create"),
      expected: null,
    };
  }

  const realPath = realpathOrNull(absolute);
  if (realPath && samePath(realPath, source.realPath)) {
    if (!entry.isSymbolicLink()) {
      fail(
        `Target resolves through a linked parent, but the target itself is not a direct link; refusing to mutate canonical source: ${absolute}`,
      );
    }
    const immediateTarget = path.resolve(path.dirname(absolute), fs.readlinkSync(absolute));
    if (!samePath(immediateTarget, source.realPath)) {
      if (!options.replace) {
        fail(`Target reaches canonical through another path; pass --replace to make it direct: ${absolute} -> ${immediateTarget}`);
      }
      return {
        requestedPath: absolute,
        action: "replace-link",
        description: `replace indirect link with ${linkDescription("a direct")}`,
        expected: snapshotEntry(entry, realPath),
      };
    }
    return {
      requestedPath: absolute,
      action: "noop",
      description: "already linked to canonical source",
      expected: snapshotEntry(entry, realPath),
    };
  }

  if (realPath) validateWrongDestination(realPath, source);

  if (entry.isSymbolicLink()) {
    if (!options.replace) {
      fail(`Target points somewhere else; pass --replace to repoint it: ${absolute}${realPath ? ` -> ${realPath}` : " (broken link)"}`);
    }
    return {
      requestedPath: absolute,
      action: "replace-link",
      description: `replace wrong link with ${linkDescription("a")}`,
      expected: snapshotEntry(entry, realPath),
    };
  }

  if (entry.isDirectory()) {
    if (!options.replace) {
      fail(`Target exists as a real directory; pass --replace to replace it: ${absolute}`);
    }
    return {
      requestedPath: absolute,
      action: "replace-directory",
      description: `replace real directory with ${linkDescription("a")}`,
      expected: snapshotEntry(entry, realPath),
    };
  }

  fail(`Target exists but is neither a directory nor a directory link: ${absolute}`);
}

function validateRequestedRelationship(targetPath, source) {
  if (path.basename(targetPath).toLowerCase() !== "ruthless-designer") {
    fail(`Target folder must be named ruthless-designer: ${targetPath}`);
  }
  if (samePath(targetPath, source.requestedPath) || samePath(targetPath, source.realPath)) {
    fail("Source and target must be different paths");
  }
  if (isInside(targetPath, source.requestedPath) || isInside(targetPath, source.realPath)) {
    fail("Target cannot be nested inside the source skill");
  }
  if (isInside(source.requestedPath, targetPath) || isInside(source.realPath, targetPath)) {
    fail("Source cannot be nested inside the target skill");
  }
  if (samePath(targetPath, path.parse(targetPath).root)) fail("Target cannot be a filesystem root");
}

function validateResolvedRelationship(prospectivePath, source) {
  // Equality is allowed here only for an already-correct alias. planTarget verifies
  // that equality by resolving the existing entry before accepting it as a no-op.
  if (samePath(prospectivePath, source.realPath)) return;
  if (isInside(prospectivePath, source.realPath)) fail("Resolved target cannot be nested inside the source skill");
  if (isInside(source.realPath, prospectivePath)) fail("Resolved source cannot be nested inside the target skill");
}

function validateWrongDestination(realPath, source) {
  if (isInside(realPath, source.realPath)) {
    fail(`Refusing to replace a target that resolves inside the source skill: ${realPath}`);
  }
  if (isInside(source.realPath, realPath)) {
    fail(`Refusing to replace a target whose destination contains the source skill: ${realPath}`);
  }
}

function applyPlan(plan, source) {
  if (plan.action === "noop") {
    assertUnchanged(plan);
    return;
  }

  if (plan.action === "create") {
    if (lstatOrNull(plan.requestedPath)) fail(`Target appeared after validation; refusing to replace it: ${plan.requestedPath}`);
  } else {
    assertUnchanged(plan);
    removeValidatedTarget(plan);
  }

  fs.mkdirSync(path.dirname(plan.requestedPath), { recursive: true });
  fs.symlinkSync(source.realPath, plan.requestedPath, process.platform === "win32" ? "junction" : "dir");
  const installedRealPath = fs.realpathSync.native(plan.requestedPath);
  if (!samePath(installedRealPath, source.realPath)) {
    fail(`Created link does not resolve to canonical source: ${plan.requestedPath} -> ${installedRealPath}`);
  }
}

function assertUnchanged(plan) {
  const current = lstatOrNull(plan.requestedPath);
  if (!current) fail(`Target disappeared after validation: ${plan.requestedPath}`);
  const snapshot = snapshotEntry(current, realpathOrNull(plan.requestedPath));
  if (
    snapshot.symbolicLink !== plan.expected.symbolicLink ||
    snapshot.directory !== plan.expected.directory ||
    snapshot.realPath !== plan.expected.realPath ||
    snapshot.device !== plan.expected.device ||
    snapshot.inode !== plan.expected.inode
  ) {
    fail(`Target changed after validation; refusing to mutate it: ${plan.requestedPath}`);
  }
}

function removeValidatedTarget(plan) {
  if (plan.action === "replace-link") {
    fs.unlinkSync(plan.requestedPath);
    return;
  }
  if (plan.action === "replace-directory") {
    fs.rmSync(plan.requestedPath, { recursive: true, force: false });
    return;
  }
  fail(`Internal error: unexpected replacement action ${plan.action}`);
}

function snapshotEntry(entry, realPath) {
  return {
    symbolicLink: entry.isSymbolicLink(),
    directory: entry.isDirectory(),
    realPath: realPath ? normalize(realPath) : null,
    device: entry.dev,
    inode: entry.ino,
  };
}

function resolvePotentialPath(requestedPath) {
  const missingSegments = [];
  let existing = path.resolve(requestedPath);
  while (!lstatOrNull(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) return path.resolve(requestedPath);
    missingSegments.unshift(path.basename(existing));
    existing = parent;
  }
  const realExisting = realpathOrNull(existing);
  if (!realExisting) return path.join(existing, ...missingSegments);
  return path.join(realExisting, ...missingSegments);
}

function uniquePaths(values) {
  const seen = new Set();
  const unique = [];
  for (const value of values) {
    const absolute = path.resolve(value);
    const key = normalize(absolute);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(absolute);
    }
  }
  return unique;
}

function linkDescription(article) {
  const type = process.platform === "win32" ? "junction" : "directory symlink";
  return article === "create" ? `create ${type}` : `${article} ${type}`;
}

function renderPlan(source, plans) {
  console.log(`Source: ${source.requestedPath}`);
  if (!samePath(source.requestedPath, source.realPath)) console.log(`Source resolves to: ${source.realPath}`);
  console.log(`Mode: ${options.write ? "write" : "dry-run"}`);
  for (const plan of plans) {
    console.log(`Target: ${plan.requestedPath}`);
    console.log(`  action: ${plan.description}`);
  }
}

function lstatOrNull(value) {
  try {
    return fs.lstatSync(value);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function realpathOrNull(value) {
  try {
    return fs.realpathSync.native(value);
  } catch (error) {
    if (["ENOENT", "EINVAL"].includes(error.code)) return null;
    throw error;
  }
}

function isInside(child, parent) {
  const relative = path.relative(normalizedAbsolute(parent), normalizedAbsolute(child));
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function samePath(left, right) {
  return normalize(left) === normalize(right);
}

function normalizedAbsolute(value) {
  return process.platform === "win32" ? path.resolve(value).toLowerCase() : path.resolve(value);
}

function normalize(value) {
  return path.resolve(value).replaceAll("\\", "/").toLowerCase();
}

function fail(message, showUsage = false) {
  console.error(message);
  if (showUsage) {
    console.error("Usage: node scripts/install-local-skill.mjs [--source path] [--target path] [--write] [--replace]");
  }
  process.exit(2);
}

function usage(exitCode) {
  const stream = exitCode === 0 ? process.stdout : process.stderr;
  stream.write("Usage: node scripts/install-local-skill.mjs [--source path] [--target path] [--write] [--replace]\n");
  process.exit(exitCode);
}
