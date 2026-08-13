# Dependency review — 2026-08-12

- Migrated the dependency-free command surface to pnpm 11.20.0 and generated `pnpm-lock.yaml`.
- No Bun runtime or installed package dependency exists in this repository; no dependency
  changelog applies.
- The skill intentionally uses Node.js built-ins and keeps browser/provider tooling external.
  Future additions must add a manifest, lockfile, and upstream changelog notes together.
