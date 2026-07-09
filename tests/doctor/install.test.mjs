#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const installer = path.join(repoRoot, "scripts", "install-local-skill.mjs");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "ruthless-install-test-"));

try {
  const source = path.join(temp, "source", "ruthless-designer");
  const target = path.join(temp, "target", "ruthless-designer");
  fs.mkdirSync(path.join(source, "references"), { recursive: true });
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(source, "SKILL.md"), "source\n");
  fs.writeFileSync(path.join(source, "references", "proof.md"), "proof\n");
  fs.writeFileSync(path.join(target, "SKILL.md"), "old\n");
  fs.writeFileSync(path.join(target, "stale.md"), "stale\n");

  const dryRun = run(["--source", source, "--target", target, "--prune"]);
  assert.equal(dryRun.status, 0, dryRun.stderr);
  assert.equal(fs.readFileSync(path.join(target, "SKILL.md"), "utf8"), "old\n");
  assert.equal(fs.existsSync(path.join(target, "stale.md")), true);

  const write = run(["--source", source, "--target", target, "--write", "--prune"]);
  assert.equal(write.status, 0, write.stderr);
  assert.equal(fs.readFileSync(path.join(target, "SKILL.md"), "utf8"), "source\n");
  assert.equal(fs.readFileSync(path.join(target, "references", "proof.md"), "utf8"), "proof\n");
  assert.equal(fs.existsSync(path.join(target, "stale.md")), false);

  const nestedTarget = path.join(source, "nested", "ruthless-designer");
  const rejected = run(["--source", source, "--target", nestedTarget, "--write"]);
  assert.equal(rejected.status, 2);
  assert.match(rejected.stderr, /cannot be nested inside the source/i);

  const linkedReal = path.join(temp, "linked-real", "ruthless-designer");
  const linkedTarget = path.join(temp, "linked", "ruthless-designer");
  fs.mkdirSync(linkedReal, { recursive: true });
  fs.mkdirSync(path.dirname(linkedTarget), { recursive: true });
  fs.writeFileSync(path.join(linkedReal, "SKILL.md"), "linked-old\n");
  fs.symlinkSync(linkedReal, linkedTarget, process.platform === "win32" ? "junction" : "dir");

  const linkedRejected = run(["--source", source, "--target", linkedTarget, "--write"]);
  assert.equal(linkedRejected.status, 2);
  assert.match(linkedRejected.stderr, /Refusing to write through linked target/i);
  assert.equal(fs.readFileSync(path.join(linkedReal, "SKILL.md"), "utf8"), "linked-old\n");

  const sourceAlias = path.join(temp, "source-alias", "ruthless-designer");
  fs.mkdirSync(path.dirname(sourceAlias), { recursive: true });
  fs.symlinkSync(source, sourceAlias, process.platform === "win32" ? "junction" : "dir");
  const aliasRejected = run(["--source", source, "--target", sourceAlias, "--write", "--allow-linked-target"]);
  assert.equal(aliasRejected.status, 2);
  assert.match(aliasRejected.stderr, /Resolved source and target must be different paths/i);

  const parentReal = path.join(temp, "parent-real");
  const parentLink = path.join(temp, "parent-link");
  const targetUnderLinkedParent = path.join(parentLink, "skills", "ruthless-designer");
  fs.mkdirSync(parentReal, { recursive: true });
  fs.symlinkSync(parentReal, parentLink, process.platform === "win32" ? "junction" : "dir");
  const parentRejected = run(["--source", source, "--target", targetUnderLinkedParent, "--write"]);
  assert.equal(parentRejected.status, 2);
  assert.match(parentRejected.stderr, /Refusing to write through linked target/i);
  assert.equal(fs.existsSync(path.join(parentReal, "skills", "ruthless-designer")), false);

  const nestedLinkTarget = path.join(temp, "nested-link-target", "ruthless-designer");
  const escapedReferences = path.join(temp, "escaped-references");
  fs.mkdirSync(nestedLinkTarget, { recursive: true });
  fs.mkdirSync(escapedReferences, { recursive: true });
  fs.writeFileSync(path.join(nestedLinkTarget, "SKILL.md"), "nested-old\n");
  fs.symlinkSync(
    escapedReferences,
    path.join(nestedLinkTarget, "references"),
    process.platform === "win32" ? "junction" : "dir",
  );
  const nestedLinkRejected = run(["--source", source, "--target", nestedLinkTarget, "--write"]);
  assert.equal(nestedLinkRejected.status, 2);
  assert.match(nestedLinkRejected.stderr, /resolves outside the skill directory/i);
  assert.equal(fs.readFileSync(path.join(nestedLinkTarget, "SKILL.md"), "utf8"), "nested-old\n");
  assert.equal(fs.existsSync(path.join(escapedReferences, "proof.md")), false);

  console.log("install tests passed");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

function run(args) {
  return spawnSync(process.execPath, [installer, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}
