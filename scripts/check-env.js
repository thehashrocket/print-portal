#!/usr/bin/env node
// Validates that .env.example includes all variables defined in src/env.js.
// Run with: pnpm check:env

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const envJs = readFileSync(resolve(root, "src/env.js"), "utf8");
const envExample = readFileSync(resolve(root, ".env.example"), "utf8");

// Extract vars from runtimeEnv section (authoritative list of all required vars)
const runtimeVarPattern = /^\s+([A-Z][A-Z0-9_]+): process\.env\./gm;
const envJsVars = new Set();
let match;
while ((match = runtimeVarPattern.exec(envJs)) !== null) {
  envJsVars.add(match[1]);
}

// Extract vars from .env.example (active and commented-out entries)
const exampleVars = new Set();
const activePattern = /^([A-Z][A-Z0-9_]+)=/gm;
const commentedPattern = /^#\s*([A-Z][A-Z0-9_]+)=/gm;
while ((match = activePattern.exec(envExample)) !== null) exampleVars.add(match[1]);
while ((match = commentedPattern.exec(envExample)) !== null) exampleVars.add(match[1]);

// These have schema defaults and are optional — exclude from missing check
const optionalVars = new Set(["NODE_ENV", "HONEYBADGER_ENV"]);

const missing = [...envJsVars].filter((v) => !optionalVars.has(v) && !exampleVars.has(v));
const stale = [...exampleVars].filter((v) => !envJsVars.has(v) && !optionalVars.has(v));

let exitCode = 0;

if (missing.length > 0) {
  console.error("Missing from .env.example (defined in src/env.js):");
  missing.forEach((v) => console.error(`  - ${v}`));
  exitCode = 1;
}

if (stale.length > 0) {
  console.warn("Stale entries in .env.example (not in src/env.js):");
  stale.forEach((v) => console.warn(`  - ${v}`));
  exitCode = 1;
}

if (exitCode === 0) {
  console.log(".env.example is in sync with src/env.js ✓");
}

process.exit(exitCode);
