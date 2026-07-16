#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const validator = path.join(repoRoot, "scripts", "validate-skill.mjs");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "ruthless-validator-test-"));

try {
  const valid = makeSkill("valid");
  assert.equal(run(valid).status, 0, run(valid).stderr);

  const missingMetadata = makeSkill("missing-metadata");
  fs.rmSync(path.join(missingMetadata, "agents", "openai.yaml"));
  assertFailure(run(missingMetadata), /Missing agents\/openai\.yaml/);

  const unlinked = makeSkill("unlinked");
  fs.writeFileSync(path.join(unlinked, "references", "hidden.md"), "# Hidden\n");
  assertFailure(run(unlinked), /Reference is not linked directly from SKILL\.md: references\/hidden\.md/);

  const badPrompt = makeSkill("bad-prompt");
  fs.writeFileSync(
    path.join(badPrompt, "agents", "openai.yaml"),
    'interface:\n  display_name: "Ruthless Designer"\n  short_description: "Brutal evidence-backed interface design"\n  default_prompt: "Design this interface."\n',
  );
  assertFailure(run(badPrompt), /default_prompt must mention \$ruthless-designer/);

  const oversizedReference = makeSkill("oversized-reference");
  fs.writeFileSync(path.join(oversizedReference, "references", "proof.md"), `# Proof\n\n${"word ".repeat(2501)}`);
  assertFailure(run(oversizedReference), /Reference file is too large for progressive disclosure.*split it by decision context/s);

  console.log("validator tests passed");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

function makeSkill(name) {
  const dir = path.join(temp, name, "ruthless-designer");
  fs.mkdirSync(path.join(dir, "references"), { recursive: true });
  fs.mkdirSync(path.join(dir, "agents"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "SKILL.md"),
    '---\nname: ruthless-designer\ndescription: "Create ruthless interfaces. Use for broad design work."\n---\n\n# Ruthless Designer\n\nRead [proof](references/proof.md).\n',
  );
  fs.writeFileSync(path.join(dir, "references", "proof.md"), "# Proof\n");
  fs.writeFileSync(
    path.join(dir, "agents", "openai.yaml"),
    'interface:\n  display_name: "Ruthless Designer"\n  short_description: "Brutal evidence-backed interface design"\n  default_prompt: "Use $ruthless-designer to redesign this interface."\n',
  );
  return dir;
}

function run(skill) {
  return spawnSync(process.execPath, [validator, skill], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function assertFailure(result, pattern) {
  assert.equal(result.status, 1, result.stdout || result.stderr);
  assert.match(`${result.stdout}\n${result.stderr}`, pattern);
}
