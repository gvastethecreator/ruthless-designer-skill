import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..", "..");
const skill = fs.readFileSync(path.join(root, "SKILLS", "ruthless-designer", "SKILL.md"), "utf8");
const contract = fs.readFileSync(path.join(root, "SKILLS", "ruthless-designer", "references", "execution-contract.md"), "utf8");

test("broad redesign isolates surfaces and requires builder-owned activation artifacts", () => {
  assert.match(skill, /references\/execution-contract\.md/);
  assert.match(skill, /Split unrelated surfaces into isolated builders/i);
  assert.match(contract, /Five unrelated interfaces require five isolated builders/i);
  for (const artifact of ["context-card.json", "direction-cards.json", "kill-list.json", "proof/before.png", "proof/after.png", "proof/detail.png", "finish-ledger.json"]) assert.match(contract, new RegExp(escape(artifact)));
  assert.match(contract, /same builder captures[^.]+judges[^.]+corrects[^.]+recaptures/i);
  assert.match(contract, /Native default chrome is a failed finish state/i);
  assert.match(contract, /Do not `STOP`[^.]+required artifact is absent/i);
});

function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
