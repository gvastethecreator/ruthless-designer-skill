#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const doctor = path.join(repoRoot, "scripts", "doctor-skill.mjs");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "ruthless-doctor-test-"));

try {
  const source = createSkill(path.join(temp, "source", "ruthless-designer"), "proof\n");

  const copiedTarget = path.join(temp, "copied", "ruthless-designer");
  fs.cpSync(source, copiedTarget, { recursive: true });
  const copied = run(["--source", source, "--target", copiedTarget, "--check", "--json"]);
  assert.equal(copied.status, 1, copied.stderr);
  const copiedPayload = JSON.parse(copied.stdout);
  assert.equal(copiedPayload.healthy, false);
  assert.equal(copiedPayload.targets[0].healthy, false);
  assert.equal(copiedPayload.targets[0].status, "copy");
  assert.deepEqual(copiedPayload.targets[0].differences, []);
  assert.match(copiedPayload.targets[0].reason, /separate directory/i);

  fs.writeFileSync(path.join(copiedTarget, "references", "proof.md"), "drift\n");
  const drift = run(["--source", source, "--target", copiedTarget, "--json"]);
  assert.equal(drift.status, 0, drift.stderr);
  const driftPayload = JSON.parse(drift.stdout);
  assert.equal(driftPayload.targets[0].status, "copy");
  assert.match(driftPayload.targets[0].differences.join("\n"), /content-diff: references\/proof\.md/);

  const linkedTarget = path.join(temp, "linked", "ruthless-designer");
  linkDirectory(source, linkedTarget);
  const linked = run(["--source", source, "--target", linkedTarget, "--check", "--json"]);
  assert.equal(linked.status, 0, linked.stderr);
  const linkedPayload = JSON.parse(linked.stdout);
  assert.equal(linkedPayload.healthy, true);
  assert.equal(linkedPayload.targets[0].healthy, true);
  assert.equal(linkedPayload.targets[0].status, "linked");
  assert.equal(normalize(linkedPayload.targets[0].realPath), normalize(fs.realpathSync.native(source)));

  const sourceParentAlias = path.join(temp, "source-parent-alias");
  fs.symlinkSync(path.dirname(source), sourceParentAlias, process.platform === "win32" ? "junction" : "dir");
  const indirectTarget = path.join(sourceParentAlias, "ruthless-designer");
  const indirect = run(["--source", source, "--target", indirectTarget, "--check", "--json"]);
  assert.equal(indirect.status, 1, indirect.stderr);
  const indirectPayload = JSON.parse(indirect.stdout);
  assert.equal(indirectPayload.targets[0].status, "indirect");
  assert.equal(indirectPayload.targets[0].healthy, false);
  assert.match(indirectPayload.targets[0].reason, /target itself is not a direct link/i);

  const wrongSource = createSkill(path.join(temp, "wrong-source", "ruthless-designer"), "wrong\n");
  const wrongTarget = path.join(temp, "wrong-link", "ruthless-designer");
  linkDirectory(wrongSource, wrongTarget);
  const misdirected = run(["--source", source, "--target", wrongTarget, "--check", "--json"]);
  assert.equal(misdirected.status, 1, misdirected.stderr);
  const misdirectedPayload = JSON.parse(misdirected.stdout);
  assert.equal(misdirectedPayload.targets[0].status, "misdirected");
  assert.equal(misdirectedPayload.targets[0].healthy, false);
  assert.match(misdirectedPayload.targets[0].reason, /different location/i);

  const allTargetsMustBeHealthy = run([
    "--source",
    source,
    "--target",
    linkedTarget,
    "--target",
    copiedTarget,
    "--check",
    "--json",
  ]);
  assert.equal(allTargetsMustBeHealthy.status, 1, allTargetsMustBeHealthy.stderr);
  const allPayload = JSON.parse(allTargetsMustBeHealthy.stdout);
  assert.equal(allPayload.targets.length, 2);
  assert.equal(allPayload.healthy, false);

  const missingTarget = path.join(temp, "missing", "ruthless-designer");
  const missing = run(["--source", source, "--target", missingTarget, "--check", "--json"]);
  assert.equal(missing.status, 1, missing.stderr);
  const missingPayload = JSON.parse(missing.stdout);
  assert.equal(missingPayload.targets[0].status, "missing");
  assert.equal(missingPayload.targets[0].healthy, false);

  const isolatedHome = path.join(temp, "default-home");
  const isolatedCodexHome = path.join(temp, "default-codex-home");
  const defaultTargets = [
    path.join(isolatedHome, ".agents", "skills", "ruthless-designer"),
    path.join(isolatedHome, ".codex", "skills", "ruthless-designer"),
    path.join(isolatedCodexHome, "skills", "ruthless-designer"),
  ];
  for (const defaultTarget of defaultTargets) linkDirectory(source, defaultTarget);
  const defaults = run(["--source", source, "--check", "--json"], {
    HOME: isolatedHome,
    USERPROFILE: isolatedHome,
    CODEX_HOME: isolatedCodexHome,
  });
  assert.equal(defaults.status, 0, defaults.stderr);
  const defaultsPayload = JSON.parse(defaults.stdout);
  assert.equal(defaultsPayload.targets.length, 3);
  assert.equal(defaultsPayload.targets.every((candidate) => candidate.status === "linked"), true);

  console.log("doctor tests passed");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

function createSkill(root, proof) {
  fs.mkdirSync(path.join(root, "references"), { recursive: true });
  fs.writeFileSync(path.join(root, "SKILL.md"), "---\nname: ruthless-designer\ndescription: test\n---\n");
  fs.writeFileSync(path.join(root, "references", "proof.md"), proof);
  return root;
}

function linkDirectory(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.symlinkSync(source, target, process.platform === "win32" ? "junction" : "dir");
}

function normalize(value) {
  return path.resolve(value).replaceAll("\\", "/").toLowerCase();
}

function run(args, env = {}) {
  return spawnSync(process.execPath, [doctor, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}
