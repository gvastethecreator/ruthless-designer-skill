#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const skillDir = path.resolve(process.argv[2] || "SKILLS/ruthless-designer");
const skillPath = path.join(skillDir, "SKILL.md");
const referencesDir = path.join(skillDir, "references");
const agentMetadataPath = path.join(skillDir, "agents", "openai.yaml");

const errors = [];

if (!fs.existsSync(skillPath)) {
  errors.push(`Missing SKILL.md at ${skillPath}`);
} else {
  const text = fs.readFileSync(skillPath, "utf8");
  const skillWords = wordCount(text);
  const skillLines = text.split(/\r?\n/).length;
  if (skillWords > 1350) errors.push(`SKILL.md is too large for the routing layer: ${skillWords} words (max 1350)`);
  if (skillLines > 200) errors.push(`SKILL.md is too long: ${skillLines} lines (max 200)`);
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    errors.push("SKILL.md must start with YAML frontmatter delimited by ---");
  } else {
    const frontmatter = parseFrontmatter(match[1]);
    const folderName = path.basename(skillDir);
    if (!frontmatter.name) errors.push("Frontmatter missing required name");
    if (!frontmatter.description) errors.push("Frontmatter missing required description");
    if (!/^description:\s*"[^"]+"\s*$/m.test(match[1])) {
      errors.push("Frontmatter description must be a quoted string");
    }
    if (frontmatter.name && frontmatter.name !== folderName) {
      errors.push(`Frontmatter name (${frontmatter.name}) must match folder (${folderName})`);
    }
    if (frontmatter.name && !/^[a-z0-9-]+$/.test(frontmatter.name)) {
      errors.push("Frontmatter name must use lowercase letters, digits, and hyphens only");
    }
    for (const key of Object.keys(frontmatter)) {
      if (!["name", "description"].includes(key)) {
        errors.push(`Unexpected frontmatter key: ${key}`);
      }
    }
  }

  const directSkillLinks = new Set();
  for (const link of markdownLinks(text)) {
    if (!link.endsWith(".md")) continue;
    directSkillLinks.add(normalizeRelative(link));
  }
  for (const file of fs.readdirSync(skillDir)) {
    if (!file.endsWith(".md") || file === "SKILL.md") continue;
    if (!directSkillLinks.has(file)) {
      errors.push(`Top-level reference file is not linked from SKILL.md: ${file}`);
    }
  }

  if (!fs.existsSync(referencesDir)) {
    errors.push("Missing references directory");
  } else {
    for (const entry of fs.readdirSync(referencesDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        errors.push(`Nested reference directories are not allowed: references/${entry.name}`);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      const relative = `references/${entry.name}`;
      if (!directSkillLinks.has(relative)) errors.push(`Reference is not linked directly from SKILL.md: ${relative}`);
    }
  }
}

if (fs.existsSync(skillDir)) {
  checkMarkdownLinks(skillDir, errors);
  const markdown = markdownFiles(skillDir);
  for (const file of markdown) {
    if (path.resolve(file) === path.resolve(skillPath)) continue;
    const words = wordCount(fs.readFileSync(file, "utf8"));
    if (words > 2500) {
      errors.push(
        `Reference file is too large for progressive disclosure: ${path.relative(skillDir, file)} ` +
          `has ${words} words (max 2500); split it by decision context`,
      );
    }
  }
}

checkAgentMetadata(agentMetadataPath, errors);

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Skill package is valid: ${path.relative(process.cwd(), skillDir)}`);

function parseFrontmatter(source) {
  const result = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    result[key] = rawValue.replace(/^"|"$/g, "").trim();
  }
  return result;
}

function checkAgentMetadata(file, outErrors) {
  if (!fs.existsSync(file)) {
    outErrors.push("Missing agents/openai.yaml");
    return;
  }

  const text = fs.readFileSync(file, "utf8");
  if (!/^interface:\s*$/m.test(text)) outErrors.push("agents/openai.yaml missing interface block");
  const fields = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s{2}([a-z_]+):\s*"([^"]*)"\s*$/);
    if (match) fields[match[1]] = match[2];
    else if (/^\s{2}[a-z_]+:/.test(line)) outErrors.push(`agents/openai.yaml string values must be quoted: ${line.trim()}`);
  }

  for (const key of ["display_name", "short_description", "default_prompt"]) {
    if (!fields[key]) outErrors.push(`agents/openai.yaml missing interface.${key}`);
  }
  for (const key of Object.keys(fields)) {
    if (!["display_name", "short_description", "default_prompt"].includes(key)) {
      outErrors.push(`Unexpected agents/openai.yaml interface field: ${key}`);
    }
  }
  if (fields.short_description && (fields.short_description.length < 25 || fields.short_description.length > 64)) {
    outErrors.push(`interface.short_description must be 25-64 characters (got ${fields.short_description.length})`);
  }
  if (fields.default_prompt && !fields.default_prompt.includes("$ruthless-designer")) {
    outErrors.push("interface.default_prompt must mention $ruthless-designer");
  }
}

function markdownLinks(source) {
  const links = [];
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(source))) {
    const link = match[1].split("#")[0];
    if (!link || /^https?:\/\//.test(link)) continue;
    links.push(link);
  }
  return links;
}

function checkMarkdownLinks(rootDir, outErrors) {
  for (const file of markdownFiles(rootDir)) {
    const text = fs.readFileSync(file, "utf8");
    for (const link of markdownLinks(text)) {
      if (!link.endsWith(".md")) continue;
      const target = path.resolve(path.dirname(file), link);
      const relLink = path.relative(rootDir, target);
      const from = path.relative(rootDir, file);
      if (!isInside(rootDir, target)) {
        outErrors.push(`Reference escapes skill folder: ${from} -> ${link}`);
      } else if (!fs.existsSync(target)) {
        outErrors.push(`Missing referenced file: ${from} -> ${relLink}`);
      }
    }
  }
}

function markdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      files.push(...markdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

function isInside(rootDir, target) {
  const relative = path.relative(rootDir, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function normalizeRelative(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function wordCount(value) {
  return (String(value).match(/\b[\p{L}\p{N}_-]+\b/gu) || []).length;
}
