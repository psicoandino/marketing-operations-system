/*
 * Deterministic public build for the ANFP portfolio.
 *
 * Rebuilds public/ from canonical sources only:
 *   - public-source/            authored Landing, Case Study, shared shell,
 *                               vendored canonical Psicoandino shell files
 *                               (verbatim copies of
 *                               000_psicoandino/shell/{identity,motif,psico-header})
 *                               and the public smoke test;
 *   - vertical-slice/           canonical Pipeline app (never modified);
 *   - dashboard/                canonical Dashboard app (never modified);
 *   - private-source/cv_ricardo.html  private canonical CV (never copied as-is).
 *
 * Public copies of the apps receive exactly three kinds of approved
 * adaptation: shared shell navigation/identity injection, public metadata
 * (title), and removal of visitor-facing internal increment labels. The
 * transforms are exported so the public smoke test can verify that each
 * public copy is byte-identical to transform(source).
 *
 * The canonical Psicoandino header ships as ES modules; browsers refuse
 * module imports under file://, so the build concatenates the vendored
 * modules (unmodified sources, import/export statements stripped) into one
 * classic script, public/shell/psico-shell.js.
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(projectRoot, "public-source");
const canonicalShell = resolve(sourceRoot, "shell", "canonical");

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function replaceCount(html, from, to, expected, label) {
  const found = html.split(from).length - 1;
  if (found !== expected) {
    throw new Error(
      `transform anchor "${label}": expected ${expected} occurrence(s), found ${found}`,
    );
  }
  return html.split(from).join(to);
}

const NAV_ORDER = ["home", "case-study", "pipeline", "dashboard", "cv"];

const FALLBACK_LABELS = {
  es: {
    home: "Inicio",
    "case-study": "Caso",
    pipeline: "Pipeline",
    dashboard: "Dashboard",
    cv: "CV",
  },
  en: {
    home: "Home",
    "case-study": "Case Study",
    pipeline: "Pipeline",
    dashboard: "Dashboard",
    cv: "CV",
  },
};

export function headerBlock({ current, root, langKey, langDefault, fallbackLang }) {
  const labels = FALLBACK_LABELS[fallbackLang];
  const hrefs = {
    home: `${root}index.html`,
    "case-study": `${root}case-study/index.html`,
    pipeline: `${root}pipeline/index.html`,
    dashboard: `${root}dashboard/index.html`,
    cv: `${root}cv/index.html`,
  };
  const links = NAV_ORDER.map((id) =>
    `<a href="${hrefs[id]}"${id === current ? ' aria-current="page"' : ""}>${labels[id]}</a>`,
  ).join("");

  return [
    `<psico-header data-shell-current="${current}" data-shell-root="${root}" ` +
      `data-shell-lang-key="${langKey}" data-shell-lang-default="${langDefault}">`,
    `  <header class="psico-header-fallback"><a class="psico-header-fallback__brand" ` +
      `href="${root}index.html">PSICOANDINO</a>` +
      `<nav aria-label="Primary navigation">${links}</nav></header>`,
    `</psico-header>`,
  ].join("\n");
}

function shellHeadLinks(root) {
  return (
    `<link rel="stylesheet" href="${root}shell/psico-header/psico-header.css">\n` +
    `<link rel="stylesheet" href="${root}shell/public-shell.css">\n`
  );
}

function shellScriptTag(root) {
  return `<script src="${root}shell/psico-shell.js" defer></script>\n`;
}

function injectShell(html, options) {
  let out = html;
  out = replaceCount(
    out,
    `<html lang="${options.pageLang}">`,
    `<html lang="${options.pageLang}" data-motif-owner="header">`,
    1,
    "html tag",
  );
  out = replaceCount(out, "</head>", `${shellHeadLinks(options.root)}</head>`, 1, "head end");
  out = replaceCount(
    out,
    "<body>",
    `<body${options.bodyClass ? ` class="${options.bodyClass}"` : ""}>\n\n${headerBlock(options)}\n`,
    1,
    "body start",
  );
  out = replaceCount(out, "</body>", `${shellScriptTag(options.root)}</body>`, 1, "body end");
  return out;
}

/* ------------------------------------------------------------------ */
/* App transforms (the only approved public adaptations)               */
/* ------------------------------------------------------------------ */

// Shared ES | EN toggle-order and Spanish-default adaptation for the two
// apps (Pipeline, Dashboard). Each keeps its own independent i18n state
// and localStorage key; only the DOM order of the two buttons and the
// deterministic first-load default are adapted for the public copy, so
// the shell-wide invariant (ES | EN order, Spanish default) holds without
// touching either app's own language keys or dictionaries.
const LANG_TOGGLE_SCRUB = [
  [
    '    <div class="lang-switch" role="group" aria-label="Language / Idioma">\n' +
      '      <button class="lang-btn" id="langEn" data-lang="en">EN</button>\n' +
      '      <button class="lang-btn" id="langEs" data-lang="es">ES</button>\n' +
      "    </div>",
    '    <div class="lang-switch" role="group" aria-label="Language / Idioma">\n' +
      '      <button class="lang-btn" id="langEs" data-lang="es">ES</button>\n' +
      '      <button class="lang-btn" id="langEn" data-lang="en">EN</button>\n' +
      "    </div>",
    1,
    "lang toggle order",
  ],
  [
    'return stored === "es" ? "es" : "en"; // English is the deterministic default',
    'return stored === "en" ? "en" : "es"; // Spanish is the deterministic default',
    1,
    "lang deterministic default",
  ],
];

function applyLangToggleScrub(html) {
  let out = html;
  for (const [from, to, expected, label] of LANG_TOGGLE_SCRUB) {
    out = replaceCount(out, from, to, expected, label);
  }
  return out;
}

export function transformPipelineHtml(sourceHtml) {
  return injectShell(applyLangToggleScrub(sourceHtml), {
    current: "pipeline",
    root: "../",
    langKey: "anfp_pipeline_lang",
    langDefault: "es",
    fallbackLang: "en",
    pageLang: "en",
  });
}

// Visitor-facing internal increment labels removed from the public copy
// only; the source app keeps them. Each replacement is count-checked so
// source drift breaks the build loudly instead of silently.
const DASHBOARD_LABEL_SCRUB = [
  ["<title>Marketing Operations Dashboard — Increment 5</title>",
    "<title>Marketing Operations Dashboard</title>", 1, "title label"],
  ["Marketing Operations System · Dashboard View · Increment 5",
    "Marketing Operations System · Dashboard View", 2, "en kicker label"],
  ["Sistema de Operaciones de Marketing · Vista de Dashboard · Incremento 5",
    "Sistema de Operaciones de Marketing · Vista de Dashboard", 1, "es kicker label"],
  ["This increment implements", "It implements", 2, "en subtitle label"],
  ["Este incremento implementa", "Implementa", 1, "es subtitle label"],
  ["Increment 5 of the Dashboard View", "Dashboard View", 2, "en badge label"],
  ["Incremento 5 de la Vista de Dashboard", "Vista de Dashboard", 1, "es badge label"],
  ["and later increments)", "and later views)", 1, "data-model comment"],
  ["Unchanged from Increment 1:", "Unchanged from the initial Lifecycle view:", 1,
    "lifecycle comment"],
  ["// Increment 2:", "// Trend view:", 1, "trend comment"],
  ["// Increment 3:", "// Origin view:", 1, "origin comment"],
  ["Increment 1's core", "the initial core", 1, "origin core comment"],
  ["// Increment 4:", "// Program Interest view:", 1, "program comment"],
  // Visitor-facing internal document citations (.md / .csv paths) rewritten
  // to plain named references. The substantive disclosure they support —
  // that reconciliation and grouping rules are documented and verifiable —
  // is unchanged; only the internal filename/path is no longer shown to a
  // hiring visitor. These constants are templated into every note that
  // cites them, so rewriting the single declaration is sufficient.
  ['const CODE_AUDIT = "<code>dashboard-audit.md</code>";',
    'const CODE_AUDIT = "<em>Dashboard Audit Notes</em>";', 1, "audit reference"],
  ['const CODE_CONTRACT = "<code>DASHBOARD_BUILD_CONTRACT.md</code>";',
    'const CODE_CONTRACT = "<em>Dashboard Build Contract</em>";', 1, "contract reference"],
  ['const CODE_CANAL_CSV = "<code>input/canal_mapping.csv</code>";',
    'const CODE_CANAL_CSV = "<em>Canal Mapping Reference</em>";', 1, "canal csv reference"],
  ['const CODE_PROGRAMA_CSV = "<code>input/programa_mapping.csv</code>";',
    'const CODE_PROGRAMA_CSV = "<em>Program Mapping Reference</em>";', 1, "programa csv reference"],
  // Static footer credit line naming three internal contract documents by
  // filename; the footer's own summary sentence (footerText) already
  // discloses that this is a reconstructed reference implementation.
  ['<span id="footerText"></span> <code>SYSTEM_CONTRACT_PROPOSAL.md</code>, ' +
    '<code>DASHBOARD_CONTRACT_PROPOSAL.md</code>, <code>DASHBOARD_BUILD_CONTRACT.md</code>.',
    '<span id="footerText"></span>', 1, "footer contract file list"],
];

export function transformDashboardHtml(sourceHtml) {
  let out = applyLangToggleScrub(sourceHtml);
  for (const [from, to, expected, label] of DASHBOARD_LABEL_SCRUB) {
    out = replaceCount(out, from, to, expected, label);
  }
  return injectShell(out, {
    current: "dashboard",
    root: "../",
    langKey: "dashboard_lang",
    langDefault: "es",
    fallbackLang: "en",
    pageLang: "en",
  });
}

// CV_PRIVACY_MODE=B: keep the public professional email, remove the phone
// number from the generated public CV only. private-source/cv_ricardo.html
// itself is never modified; this rewrites a copy of its string content.
function applyCvPrivacyMode(html) {
  return replaceCount(
    html,
    "Santiago, Chile · rmorenoga@fen.uchile.cl · +56 9 3454 5677<br>",
    "Santiago, Chile · rmorenoga@fen.uchile.cl<br>",
    1,
    "cv privacy mode B: remove phone",
  );
}

export function transformCvHtml(sourceHtml) {
  let out = applyCvPrivacyMode(sourceHtml);
  out = replaceCount(
    out,
    '<html lang="es">',
    '<html lang="es" data-motif-owner="header">',
    1,
    "cv html tag",
  );
  out = replaceCount(out, "</head>", `${shellHeadLinks("../")}</head>`, 1, "cv head end");
  out = replaceCount(
    out,
    "<body>",
    `<body class="cv-public">\n\n${headerBlock({
      current: "cv",
      root: "../",
      langKey: "portfolio_lang",
      langDefault: "es",
      fallbackLang: "es",
    })}\n`,
    1,
    "cv body start",
  );
  out = replaceCount(out, "</body>", `${shellScriptTag("../")}</body>`, 1, "cv body end");
  return out;
}

/* ------------------------------------------------------------------ */
/* Header bundle (canonical ES modules → one classic script)           */
/* ------------------------------------------------------------------ */

// Dependency order of the canonical modules; sources are vendored
// verbatim from 000_psicoandino/shell/ into public-source/shell/canonical/.
const BUNDLE_MODULES = [
  "identity/motif-glyphs.js",
  "identity/motif-geometry.js",
  "identity/motif-config.js",
  "motif/motif-clock.js",
  "motif/motif-engine.js",
  "motif/renderers/renderer-core.js",
  "motif/renderers/header-renderer.js",
  "psico-header/psico-header.js",
];

function stripModuleSyntax(source) {
  return source
    .replace(/^import[^;]*;[ \t]*\r?\n/gm, "")
    .replace(/^export\s+/gm, "");
}

export function buildShellBundle() {
  const parts = BUNDLE_MODULES.map((relPath) => {
    const source = readFileSync(resolve(canonicalShell, relPath), "utf8");
    return `/* ==== canonical: shell/${relPath} ==== */\n${stripModuleSyntax(source)}`;
  });
  const publicShell = readFileSync(resolve(sourceRoot, "shell", "public-shell.js"), "utf8");
  parts.push(`/* ==== authored: public-source/shell/public-shell.js ==== */\n${publicShell}`);

  return (
    "/* Generated by scripts/build-public.mjs — do not edit.\n" +
    " * Canonical Psicoandino shell modules concatenated into one classic\n" +
    " * script so the header works under file:// (module imports are\n" +
    " * blocked there). Module sources are unmodified apart from removing\n" +
    " * import/export statements. */\n" +
    "(() => {\n\"use strict\";\n\n" +
    parts.join("\n") +
    "\n})();\n"
  );
}

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */

function writeOut(outDir, relPath, content) {
  const target = resolve(outDir, relPath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function copyOut(outDir, relPath, sourcePath) {
  writeOut(outDir, relPath, readFileSync(sourcePath));
}

function copyCsvInputs(outDir, appDir, publicApp) {
  const inputDir = resolve(projectRoot, appDir, "input");
  for (const name of readdirSync(inputDir).sort()) {
    if (!name.endsWith(".csv")) continue;
    copyOut(outDir, join(publicApp, "input", name), resolve(inputDir, name));
  }
}

export function buildPublic(outDir = resolve(projectRoot, "public")) {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  // Shared shell.
  copyOut(outDir, "shell/identity/tokens.css",
    resolve(canonicalShell, "identity/tokens.css"));
  copyOut(outDir, "shell/psico-header/psico-header.css",
    resolve(canonicalShell, "psico-header/psico-header.css"));
  copyOut(outDir, "shell/public-shell.css", resolve(sourceRoot, "shell/public-shell.css"));
  copyOut(outDir, "shell/portfolio.css", resolve(sourceRoot, "shell/portfolio.css"));
  copyOut(outDir, "shell/portfolio-i18n.js", resolve(sourceRoot, "shell/portfolio-i18n.js"));
  writeOut(outDir, "shell/psico-shell.js", buildShellBundle());

  // Landing and Case Study (authored).
  copyOut(outDir, "index.html", resolve(sourceRoot, "index.html"));
  copyOut(outDir, "case-study/index.html", resolve(sourceRoot, "case-study/index.html"));

  // Pipeline app (canonical logic and data unchanged; shell + metadata only).
  writeOut(outDir, "pipeline/index.html",
    transformPipelineHtml(readFileSync(resolve(projectRoot, "vertical-slice/index.html"), "utf8")));
  copyCsvInputs(outDir, "vertical-slice", "pipeline");

  // Dashboard app.
  writeOut(outDir, "dashboard/index.html",
    transformDashboardHtml(readFileSync(resolve(projectRoot, "dashboard/index.html"), "utf8")));
  copyCsvInputs(outDir, "dashboard", "dashboard");

  // CV: generated from the private canonical source; the private-source
  // directory itself is never copied.
  writeOut(outDir, "cv/index.html",
    transformCvHtml(readFileSync(resolve(projectRoot, "private-source/cv_ricardo.html"), "utf8")));

  // Public smoke test.
  copyOut(outDir, "tests/smoke-test.mjs", resolve(sourceRoot, "tests/smoke-test.mjs"));

  return outDir;
}

/* ------------------------------------------------------------------ */
/* Deterministic tree hash                                             */
/* ------------------------------------------------------------------ */

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    if (entry === ".DS_Store") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

export function hashTree(dir) {
  const hash = createHash("sha256");
  for (const file of walk(dir)) {
    hash.update(relative(dir, file));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const outDir = buildPublic();
  const files = walk(outDir);
  console.log(`built ${relative(projectRoot, outDir)}/ — ${files.length} files`);
  console.log(`tree sha256: ${hashTree(outDir)}`);
}
