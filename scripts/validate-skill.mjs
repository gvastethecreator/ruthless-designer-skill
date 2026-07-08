#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const skillDir = path.resolve(process.argv[2] || "SKILLS/ruthless-designer");
const skillPath = path.join(skillDir, "SKILL.md");

const errors = [];

if (!fs.existsSync(skillPath)) {
  errors.push(`Missing SKILL.md at ${skillPath}`);
} else {
  const text = fs.readFileSync(skillPath, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    errors.push("SKILL.md must start with YAML frontmatter delimited by ---");
  } else {
    const frontmatter = parseFrontmatter(match[1]);
    const folderName = path.basename(skillDir);
    if (!frontmatter.name) errors.push("Frontmatter missing required name");
    if (!frontmatter.description) errors.push("Frontmatter missing required description");
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

  for (const link of markdownLinks(text)) {
    if (!link.endsWith(".md")) continue;
    const target = path.resolve(skillDir, link);
    if (!target.startsWith(skillDir)) {
      errors.push(`Reference escapes skill folder: ${link}`);
    } else if (!fs.existsSync(target)) {
      errors.push(`Missing referenced file: ${link}`);
    }
  }
}

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
