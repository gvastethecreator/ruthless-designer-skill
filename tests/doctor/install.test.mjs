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
  const source = createSkill(path.join(temp, "source", "ruthless-designer"), "source\n");
  const target = path.join(temp, "target", "ruthless-designer");

  const dryRun = run(["--source", source, "--target", target]);
  assert.equal(dryRun.status, 0, dryRun.stderr);
  assert.match(dryRun.stdout, /create junction|create directory symlink/i);
  assert.equal(fs.existsSync(target), false, "dry-run must not create a target");

  const write = run(["--source", source, "--target", target, "--write"]);
  assert.equal(write.status, 0, write.stderr);
  assert.equal(normalize(fs.realpathSync.native(target)), normalize(fs.realpathSync.native(source)));
  assert.equal(fs.lstatSync(target).isSymbolicLink(), true);

  const idempotent = run(["--source", source, "--target", target, "--write"]);
  assert.equal(idempotent.status, 0, idempotent.stderr);
  assert.match(idempotent.stdout, /already linked/i);
  assert.equal(normalize(fs.realpathSync.native(target)), normalize(fs.realpathSync.native(source)));

  const sourceParentAlias = path.join(temp, "source-parent-alias");
  fs.symlinkSync(path.dirname(source), sourceParentAlias, process.platform === "win32" ? "junction" : "dir");
  const indirectTarget = path.join(sourceParentAlias, "ruthless-designer");
  const indirectRejected = run(["--source", source, "--target", indirectTarget, "--replace", "--write"]);
  assert.equal(indirectRejected.status, 2);
  assert.match(indirectRejected.stderr, /target itself is not a direct link/i);
  assert.equal(fs.existsSync(path.join(source, "SKILL.md")), true, "indirect target rejection must preserve source");

  const chainedTarget = path.join(temp, "chained-link", "ruthless-designer");
  linkDirectory(indirectTarget, chainedTarget);
  const chainedRejected = run(["--source", source, "--target", chainedTarget, "--write"]);
  assert.equal(chainedRejected.status, 2);
  assert.match(chainedRejected.stderr, /reaches canonical through another path.*--replace/i);
  const chainedReplaced = run(["--source", source, "--target", chainedTarget, "--replace", "--write"]);
  assert.equal(chainedReplaced.status, 0, chainedReplaced.stderr);
  assert.equal(normalize(fs.readlinkSync(chainedTarget)), normalize(fs.realpathSync.native(source)));

  const copiedTarget = path.join(temp, "copy", "ruthless-designer");
  createSkill(copiedTarget, "old copy\n");
  fs.writeFileSync(path.join(copiedTarget, "stale.md"), "do not silently delete\n");
  const copyRejected = run(["--source", source, "--target", copiedTarget, "--write"]);
  assert.equal(copyRejected.status, 2);
  assert.match(copyRejected.stderr, /exists as a real directory.*--replace/i);
  assert.equal(fs.readFileSync(path.join(copiedTarget, "stale.md"), "utf8"), "do not silently delete\n");

  const replacementDryRun = run(["--source", source, "--target", copiedTarget, "--replace"]);
  assert.equal(replacementDryRun.status, 0, replacementDryRun.stderr);
  assert.match(replacementDryRun.stdout, /replace real directory/i);
  assert.equal(fs.lstatSync(copiedTarget).isSymbolicLink(), false);

  const copyCreationFailure = run(["--source", source, "--target", copiedTarget, "--replace", "--write"], {
    NODE_ENV: "test",
    RUTHLESS_DESIGNER_TEST_FAIL_LINK_CREATION: "1",
  });
  assert.equal(copyCreationFailure.status, 2);
  assert.match(copyCreationFailure.stderr, /injected link creation failure/i);
  assert.equal(fs.lstatSync(copiedTarget).isSymbolicLink(), false, "failed replacement must restore the original directory");
  assert.equal(fs.readFileSync(path.join(copiedTarget, "stale.md"), "utf8"), "do not silently delete\n");
  assert.deepEqual(backupEntries(copiedTarget), [], "normal rollback must not leave a backup behind");

  const copyReplaced = run(["--source", source, "--target", copiedTarget, "--replace", "--write"]);
  assert.equal(copyReplaced.status, 0, copyReplaced.stderr);
  assert.equal(fs.lstatSync(copiedTarget).isSymbolicLink(), true);
  assert.equal(normalize(fs.realpathSync.native(copiedTarget)), normalize(fs.realpathSync.native(source)));
  assert.equal(fs.existsSync(path.join(source, "stale.md")), false, "replacement must not touch the source");
  assert.deepEqual(backupEntries(copiedTarget), [], "successful replacement must remove its backup");

  const productionGuardTarget = createSkill(path.join(temp, "production-guard", "ruthless-designer"), "guarded\n");
  const productionGuard = run(["--source", source, "--target", productionGuardTarget, "--replace", "--write"], {
    NODE_ENV: "production",
    RUTHLESS_DESIGNER_TEST_FAIL_LINK_CREATION: "1",
  });
  assert.equal(productionGuard.status, 0, productionGuard.stderr);
  assert.equal(normalize(fs.realpathSync.native(productionGuardTarget)), normalize(fs.realpathSync.native(source)));

  const noFollowTarget = createSkill(path.join(temp, "no-follow", "ruthless-designer"), "cycle\n");
  const cycleLink = path.join(noFollowTarget, "references", "cycle");
  linkDirectory(noFollowTarget, cycleLink);
  const noFollowDryRun = run(["--source", source, "--target", noFollowTarget, "--replace"]);
  assert.equal(noFollowDryRun.status, 0, noFollowDryRun.stderr);
  assert.match(noFollowDryRun.stdout, /replace real directory/i);
  fs.unlinkSync(cycleLink);

  const changedAfterPlanTarget = createSkill(path.join(temp, "changed-after-plan", "ruthless-designer"), "planned\n");
  const changedAfterPlan = run(["--source", source, "--target", changedAfterPlanTarget, "--replace", "--write"], {
    NODE_ENV: "test",
    RUTHLESS_DESIGNER_TEST_MUTATE_TARGET_AFTER_PLAN: "1",
  });
  assert.equal(changedAfterPlan.status, 2);
  assert.match(changedAfterPlan.stderr, /target changed after validation/i);
  assert.equal(fs.lstatSync(changedAfterPlanTarget).isSymbolicLink(), false);
  assert.equal(fs.readFileSync(path.join(changedAfterPlanTarget, "SKILL.md"), "utf8"), "mutated\n");
  assert.deepEqual(backupEntries(changedAfterPlanTarget), [], "pre-mutation abort must not stage a backup");

  const changedBeforeCleanupTarget = createSkill(
    path.join(temp, "changed-before-cleanup", "ruthless-designer"),
    "cleanup\n",
  );
  const changedBeforeCleanup = run(
    ["--source", source, "--target", changedBeforeCleanupTarget, "--replace", "--write"],
    {
      NODE_ENV: "test",
      RUTHLESS_DESIGNER_TEST_MUTATE_BACKUP_BEFORE_CLEANUP: "1",
    },
  );
  assert.equal(changedBeforeCleanup.status, 2);
  assert.match(changedBeforeCleanup.stderr, /backup changed before cleanup/i);
  assert.match(changedBeforeCleanup.stderr, /backup preserved at:/i);
  assert.equal(normalize(fs.realpathSync.native(changedBeforeCleanupTarget)), normalize(fs.realpathSync.native(source)));
  const preservedBackups = backupEntries(changedBeforeCleanupTarget);
  assert.equal(preservedBackups.length, 1, "changed backup must be preserved for manual recovery");
  const preservedBackup = path.join(path.dirname(changedBeforeCleanupTarget), preservedBackups[0]);
  assert.equal(fs.readFileSync(path.join(preservedBackup, "SKILL.md"), "utf8"), "cleanup\n");
  assert.equal(
    fs.readFileSync(path.join(preservedBackup, ".ruthless-designer-test-before-cleanup"), "utf8"),
    "changed before cleanup\n",
  );

  const wrongSource = createSkill(path.join(temp, "wrong-source", "ruthless-designer"), "wrong\n");
  const wrongTarget = path.join(temp, "wrong-link", "ruthless-designer");
  linkDirectory(wrongSource, wrongTarget);
  const wrongRejected = run(["--source", source, "--target", wrongTarget, "--write"]);
  assert.equal(wrongRejected.status, 2);
  assert.match(wrongRejected.stderr, /points somewhere else.*--replace/i);
  assert.equal(normalize(fs.realpathSync.native(wrongTarget)), normalize(fs.realpathSync.native(wrongSource)));

  const linkCreationFailure = run(["--source", source, "--target", wrongTarget, "--replace", "--write"], {
    NODE_ENV: "test",
    RUTHLESS_DESIGNER_TEST_FAIL_LINK_CREATION: "1",
  });
  assert.equal(linkCreationFailure.status, 2);
  assert.match(linkCreationFailure.stderr, /injected link creation failure/i);
  assert.equal(fs.lstatSync(wrongTarget).isSymbolicLink(), true, "failed replacement must restore the original link");
  assert.equal(normalize(fs.realpathSync.native(wrongTarget)), normalize(fs.realpathSync.native(wrongSource)));
  assert.deepEqual(backupEntries(wrongTarget), [], "link rollback must not leave a backup behind");

  const wrongReplaced = run(["--source", source, "--target", wrongTarget, "--replace", "--write"]);
  assert.equal(wrongReplaced.status, 0, wrongReplaced.stderr);
  assert.equal(normalize(fs.realpathSync.native(wrongTarget)), normalize(fs.realpathSync.native(source)));
  assert.equal(fs.readFileSync(path.join(wrongSource, "SKILL.md"), "utf8"), "wrong\n");
  assert.deepEqual(backupEntries(wrongTarget), [], "successful link replacement must remove its backup");

  const repeatedA = path.join(temp, "repeated-a", "ruthless-designer");
  const repeatedB = path.join(temp, "repeated-b", "ruthless-designer");
  const repeated = run([
    "--source",
    source,
    "--target",
    repeatedA,
    "--target",
    repeatedB,
    "--write",
  ]);
  assert.equal(repeated.status, 0, repeated.stderr);
  assert.equal(normalize(fs.realpathSync.native(repeatedA)), normalize(fs.realpathSync.native(source)));
  assert.equal(normalize(fs.realpathSync.native(repeatedB)), normalize(fs.realpathSync.native(source)));

  const atomicMissing = path.join(temp, "atomic-missing", "ruthless-designer");
  const atomicCopy = createSkill(path.join(temp, "atomic-copy", "ruthless-designer"), "copy\n");
  const atomicRejected = run([
    "--source",
    source,
    "--target",
    atomicMissing,
    "--target",
    atomicCopy,
    "--write",
  ]);
  assert.equal(atomicRejected.status, 2);
  assert.equal(fs.existsSync(atomicMissing), false, "all targets must validate before any mutation");

  const sameRejected = run(["--source", source, "--target", source, "--replace", "--write"]);
  assert.equal(sameRejected.status, 2);
  assert.match(sameRejected.stderr, /source and target must be different/i);

  const nestedTarget = path.join(source, "nested", "ruthless-designer");
  const nestedRejected = run(["--source", source, "--target", nestedTarget, "--write"]);
  assert.equal(nestedRejected.status, 2);
  assert.match(nestedRejected.stderr, /target cannot be nested inside the source/i);

  const outerTarget = path.join(temp, "outer", "ruthless-designer");
  const nestedSource = createSkill(path.join(outerTarget, "canonical", "ruthless-designer"), "nested source\n");
  const sourceNestedRejected = run(["--source", nestedSource, "--target", outerTarget, "--replace", "--write"]);
  assert.equal(sourceNestedRejected.status, 2);
  assert.match(sourceNestedRejected.stderr, /source cannot be nested inside the target/i);
  assert.equal(fs.existsSync(path.join(nestedSource, "SKILL.md")), true);

  const targetParent = path.join(temp, "target-set", "ruthless-designer");
  const targetChild = path.join(targetParent, "mirror", "ruthless-designer");
  const targetSetRejected = run([
    "--source",
    source,
    "--target",
    targetParent,
    "--target",
    targetChild,
    "--write",
  ]);
  assert.equal(targetSetRejected.status, 2);
  assert.match(targetSetRejected.stderr, /targets cannot be nested inside each other/i);
  assert.equal(fs.existsSync(targetParent), false, "nested target set must fail before creating its first link");

  const isolatedHome = path.join(temp, "home");
  const isolatedCodexHome = path.join(temp, "codex-home");
  fs.mkdirSync(isolatedHome, { recursive: true });
  const defaults = run(["--source", source, "--write"], {
    HOME: isolatedHome,
    USERPROFILE: isolatedHome,
    CODEX_HOME: isolatedCodexHome,
  });
  assert.equal(defaults.status, 0, defaults.stderr);
  const agentsDefault = path.join(isolatedHome, ".agents", "skills", "ruthless-designer");
  const homeCodexDefault = path.join(isolatedHome, ".codex", "skills", "ruthless-designer");
  const codexDefault = path.join(isolatedCodexHome, "skills", "ruthless-designer");
  assert.equal(normalize(fs.realpathSync.native(agentsDefault)), normalize(fs.realpathSync.native(source)));
  assert.equal(normalize(fs.realpathSync.native(homeCodexDefault)), normalize(fs.realpathSync.native(source)));
  assert.equal(normalize(fs.realpathSync.native(codexDefault)), normalize(fs.realpathSync.native(source)));

  const defaultsIdempotent = run(["--source", source, "--write"], {
    HOME: isolatedHome,
    USERPROFILE: isolatedHome,
    CODEX_HOME: isolatedCodexHome,
  });
  assert.equal(defaultsIdempotent.status, 0, defaultsIdempotent.stderr);
  assert.equal(
    [...defaultsIdempotent.stdout.matchAll(/already linked to canonical source/gi)].length,
    3,
    defaultsIdempotent.stdout,
  );

  console.log("install tests passed");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

function createSkill(root, skillContents) {
  fs.mkdirSync(path.join(root, "references"), { recursive: true });
  fs.writeFileSync(path.join(root, "SKILL.md"), skillContents);
  fs.writeFileSync(path.join(root, "references", "proof.md"), "proof\n");
  return root;
}

function linkDirectory(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.symlinkSync(source, target, process.platform === "win32" ? "junction" : "dir");
}

function normalize(value) {
  return path.resolve(value).replaceAll("\\", "/").toLowerCase();
}

function backupEntries(target) {
  const prefix = `.${path.basename(target)}.backup-`;
  return fs.readdirSync(path.dirname(target)).filter((entry) => entry.startsWith(prefix));
}

function run(args, env = {}) {
  return spawnSync(process.execPath, [installer, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}
