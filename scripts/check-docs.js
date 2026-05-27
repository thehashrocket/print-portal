#!/usr/bin/env node
// Validates documentation accuracy against source of truth:
// 1. Prisma model/enum counts in docs/ARCHITECTURE.md match prisma/schema.prisma
// 2. tRPC router count in docs/ARCHITECTURE.md matches src/server/api/root.ts
// 3. All relative markdown links in docs/ and root-level .md files resolve
//
// Run with: pnpm check:docs

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, dirname, join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

let exitCode = 0;

function fail(/** @type {string} */ msg) {
  console.error(msg);
  exitCode = 1;
}

// --- Count actual values from source ---

const schema = readFileSync(resolve(root, "prisma/schema.prisma"), "utf8");
const actualModels = (schema.match(/^model /gm) ?? []).length;
const actualEnums = (schema.match(/^enum /gm) ?? []).length;

const rootTs = readFileSync(resolve(root, "src/server/api/root.ts"), "utf8");
// Match lines like "  addresses: addressRouter," inside the appRouter object
const actualRouters = (rootTs.match(/^\s+\w+:\s+\w+Router[,\s]/gm) ?? []).length;

// --- Verify count claims in docs/ARCHITECTURE.md ---

const archPath = resolve(root, "docs/ARCHITECTURE.md");
const arch = readFileSync(archPath, "utf8");

// "N models" or "N Prisma models" (all variants in the file)
const modelMatches = [...arch.matchAll(/(\d+)\s+(?:Prisma\s+)?models?(?:\s|,)/gi)];
if (modelMatches.length === 0) {
  fail(`docs/ARCHITECTURE.md: no model count claim found`);
} else {
  for (const m of modelMatches) {
    const claimed = parseInt(m[1], 10);
    if (claimed !== actualModels) {
      fail(
        `docs/ARCHITECTURE.md: claims "${m[0].trim()}" but actual model count is ${actualModels} (schema.prisma)`
      );
    }
  }
}

// "N enums" variants
const enumMatches = [...arch.matchAll(/(\d+)\s+enums?(?:\s|,|\))/gi)];
if (enumMatches.length === 0) {
  fail(`docs/ARCHITECTURE.md: no enum count claim found`);
} else {
  for (const m of enumMatches) {
    const claimed = parseInt(m[1], 10);
    if (claimed !== actualEnums) {
      fail(
        `docs/ARCHITECTURE.md: claims "${m[0].trim()}" but actual enum count is ${actualEnums} (schema.prisma)`
      );
    }
  }
}

// "tRPC Routers (N)" heading
const routerMatches = [...arch.matchAll(/tRPC\s+Routers?\s+\((\d+)\)/gi)];
if (routerMatches.length === 0) {
  fail(`docs/ARCHITECTURE.md: no tRPC router count claim found`);
} else {
  for (const m of routerMatches) {
    const claimed = parseInt(m[1], 10);
    if (claimed !== actualRouters) {
      fail(
        `docs/ARCHITECTURE.md: claims "${m[0]}" but actual router count is ${actualRouters} (root.ts)`
      );
    }
  }
}

// --- Resolve relative markdown links ---

function collectMdFiles(/** @type {string} */ dir, /** @type {string[]} */ files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // Skip node_modules, .git, generated output, and design assets
      if (
        entry === "node_modules" ||
        entry === ".git" ||
        entry === "generated" ||
        entry === "design_handoff_print_portal" ||
        entry === ".next"
      )
        continue;
      collectMdFiles(full, files);
    } else if (extname(entry) === ".md") {
      files.push(full);
    }
  }
  return files;
}

// Only validate links in project docs, not vendored/generated content
const docDirs = [resolve(root, "docs"), root];
const mdFiles = [];
for (const entry of readdirSync(root)) {
  const full = join(root, entry);
  if (extname(entry) === ".md") mdFiles.push(full);
}
collectMdFiles(resolve(root, "docs"), mdFiles);

// Skip files outside the project (e.g. design_handoff, gait_context historical artifact)
const skipFiles = new Set([
  resolve(root, "gait_context.md"),
  resolve(root, "AGENTS.md"),
]);

const linkPattern = /\[(?:[^\]]*)\]\(([^)]+)\)/g;

for (const file of mdFiles) {
  if (skipFiles.has(file)) continue;

  const content = readFileSync(file, "utf8");
  const fileDir = dirname(file);

  for (const m of content.matchAll(linkPattern)) {
    const href = m[1];
    // Skip external URLs, same-page anchors, and mailto
    if (href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:"))
      continue;

    // Strip fragment (anchor within a file)
    const withoutAnchor = href.split("#")[0];
    if (!withoutAnchor) continue; // pure anchor like "./foo.md#section" after split gives ""

    const resolved = resolve(fileDir, withoutAnchor);
    if (!existsSync(resolved)) {
      fail(`Broken link in ${file.replace(root + "/", "")}: [${m[1]}] → ${resolved.replace(root + "/", "")}`);
    }
  }
}

// --- Summary ---

if (exitCode === 0) {
  console.log(
    `docs checks passed ✓ (${actualModels} models, ${actualEnums} enums, ${actualRouters} routers, ${mdFiles.length - skipFiles.size} md files checked)`
  );
} else {
  console.error("\ndocs checks failed — fix the issues above and re-run pnpm check:docs");
}

process.exit(exitCode);
