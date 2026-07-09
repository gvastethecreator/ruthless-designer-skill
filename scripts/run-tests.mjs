#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.argv[2] || "tests");
const files = [];
collect(root, files);

if (!files.length) {
  console.error(`No test files found under ${root}`);
  process.exit(2);
}

let failed = 0;
for (const file of files.sort()) {
  const relative = path.relative(process.cwd(), file);
  console.log(`\n> ${relative}`);
  const result = spawnSync(process.execPath, [file], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) failed += 1;
}

if (failed) {
  console.error(`\n${failed} test file(s) failed`);
  process.exit(1);
}

console.log(`\n${files.length} test file(s) passed`);

function collect(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(absolute, out);
    else if (entry.isFile() && entry.name.endsWith(".test.mjs")) out.push(absolute);
  }
}
