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
  const source = path.join(temp, "source", "ruthless-designer");
  const target = path.join(temp, "target", "ruthless-designer");
  fs.mkdirSync(path.join(source, "references"), { recursive: true });
  fs.writeFileSync(path.join(source, "SKILL.md"), "---\nname: ruthless-designer\ndescription: test\n---\n");
  fs.writeFileSync(path.join(source, "references", "proof.md"), "proof\n");
  fs.cpSync(source, target, { recursive: true });

  const identical = run(["--source", source, "--target", target, "--check", "--json"]);
  assert.equal(identical.status, 0, identical.stderr);
  const identicalPayload = JSON.parse(identical.stdout);
  assert.equal(identicalPayload.healthy, true);
  assert.equal(identicalPayload.targets[0].status, "identical");

  fs.writeFileSync(path.join(target, "references", "proof.md"), "drift\n");
  const drift = run(["--source", source, "--target", target, "--check", "--json"]);
  assert.equal(drift.status, 1, drift.stderr);
  const driftPayload = JSON.parse(drift.stdout);
  assert.equal(driftPayload.healthy, false);
  assert.equal(driftPayload.targets[0].status, "drift");
  assert.match(driftPayload.targets[0].differences.join("\n"), /content-diff: references\/proof\.md/);

  console.log("doctor tests passed");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

function run(args) {
  return spawnSync(process.execPath, [doctor, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}
