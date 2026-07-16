#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] || "evals");
const errors = [];

const triggers = load("trigger-cases.json");
const behavior = load("behavior-cases.json");

validateUniqueIds([...triggers, ...behavior]);

for (const test of triggers) {
  requireString(test, "id", "trigger");
  requireString(test, "prompt", test.id || "trigger");
  if (!new Set(["trigger", "do-not-trigger"]).has(test.expected)) {
    errors.push(`${test.id || "trigger"}: expected must be trigger or do-not-trigger`);
  }
}

const triggerCounts = countBy(triggers, "expected");
if (!triggerCounts.trigger || !triggerCounts["do-not-trigger"]) {
  errors.push("trigger-cases.json must contain positive and negative cases");
}

for (const id of ["trigger-creative-studio", "trigger-command-center", "trigger-web-game-hud"]) {
  if (!triggers.some((test) => test.id === id && test.expected === "trigger")) {
    errors.push(`trigger-cases.json must cover ${id} as a trigger`);
  }
}

for (const test of behavior) {
  requireString(test, "id", "behavior");
  requireString(test, "mode", test.id || "behavior");
  requireString(test, "prompt", test.id || "behavior");
  requireStringArray(test, "must");
  requireStringArray(test, "must_not");
  if (!String(test.prompt || "").includes("$ruthless-designer")) {
    errors.push(`${test.id || "behavior"}: prompt must invoke $ruthless-designer explicitly`);
  }
}

for (const id of [
  "behavior-context-creative-studio",
  "behavior-context-command-center",
  "behavior-context-web-game-hud",
  "behavior-context-hybrid-boundaries",
]) {
  if (!behavior.some((test) => test.id === id)) errors.push(`behavior-cases.json must cover ${id}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Evaluation specs are valid: ${triggers.length} trigger cases, ${behavior.length} behavior cases`);

function load(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    errors.push(`Missing ${absolute}`);
    return [];
  }
  try {
    const value = JSON.parse(fs.readFileSync(absolute, "utf8"));
    if (!Array.isArray(value)) {
      errors.push(`${file} must contain a JSON array`);
      return [];
    }
    return value;
  } catch (error) {
    errors.push(`${file} is invalid JSON: ${error.message}`);
    return [];
  }
}

function requireString(value, key, label) {
  if (typeof value?.[key] !== "string" || !value[key].trim()) errors.push(`${label}: ${key} must be a non-empty string`);
}

function requireStringArray(value, key) {
  if (!Array.isArray(value?.[key]) || !value[key].length || value[key].some((item) => typeof item !== "string" || !item.trim())) {
    errors.push(`${value?.id || "behavior"}: ${key} must be a non-empty string array`);
  }
}

function validateUniqueIds(values) {
  const seen = new Set();
  for (const value of values) {
    if (!value?.id) continue;
    if (seen.has(value.id)) errors.push(`Duplicate evaluation id: ${value.id}`);
    seen.add(value.id);
  }
}

function countBy(values, key) {
  return values.reduce((out, value) => {
    out[value[key]] = (out[value[key]] || 0) + 1;
    return out;
  }, {});
}
