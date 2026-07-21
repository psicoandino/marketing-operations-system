/*
 * Smoke test for the generated public microsystem
 * (Landing, Case Study, Pipeline copy, Dashboard copy, CV, shared shell).
 *
 * Test-repair record (failure protocol) — obsolete expectations replaced:
 *   - directory hrefs ("pipeline/") → every internal page link must be an
 *     explicit index.html href that resolves under file://;
 *   - byte-identical public app copies → public copies must be
 *     byte-identical to transform(source), where the exported build
 *     transforms are the only approved public adaptations (shell
 *     navigation, identity integration, public metadata, increment-label
 *     removal, ES|EN toggle-order/default adaptation, CV privacy);
 *   - exactly two total links on the Case Study → exactly two primary
 *     narrative CTAs (Pipeline, Dashboard); shared-shell links are chrome.
 *   - "header is never fixed/sticky" → superseded by the visual-convergence
 *     pass: the header is now sticky (position:sticky;top:0, canonical
 *     default) on screen and un-stuck only in print;
 *   - "Pipeline/Dashboard may keep internal contract/audit filenames in
 *     their disclosure text" → superseded: visitor-facing .md/.csv
 *     filenames are now rewritten to plain named references in the public
 *     copy (build-public.mjs DASHBOARD_LABEL_SCRUB), so the exemption for
 *     those two files is removed from the visible-content scan;
 *   - Pipeline/Dashboard EN-first toggle and English-first default →
 *     superseded: both public copies now render ES | EN and default to
 *     Spanish on first load, matching Landing/Case Study.
 * All unrelated checks (exposure scan, network-free, synthetic
 * disclosure, forbidden claims, source suites still passing) are kept.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

const publicRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = resolve(publicRoot, "..");

let passed = 0;
let failed = 0;
function check(name, cond, detail) {
  if (cond) {
    passed += 1;
    console.log(`  ok  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? " — " + detail : ""}`);
  }
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const read = (rel) => readFileSync(resolve(publicRoot, rel), "utf8");

const build = await import(
  pathToFileURL(resolve(projectRoot, "scripts/build-public.mjs")).href
);

/* == exact generated file set ===================================== */
console.log("\n== exact generated file set ==");
const expectedFiles = [
  "case-study/index.html",
  "cv/index.html",
  "dashboard/index.html",
  "dashboard/input/canal_mapping.csv",
  "dashboard/input/consultas.csv",
  "dashboard/input/matriculas.csv",
  "dashboard/input/programa_mapping.csv",
  "index.html",
  "pipeline/index.html",
  "pipeline/input/fenix.csv",
  "pipeline/input/intranet.csv",
  "pipeline/input/legacy.csv",
  "pipeline/input/webinars.csv",
  "shell/identity/tokens.css",
  "shell/portfolio-i18n.js",
  "shell/portfolio.css",
  "shell/psico-header/psico-header.css",
  "shell/psico-shell.js",
  "shell/public-shell.css",
  "tests/smoke-test.mjs",
];
const actualFiles = walk(publicRoot)
  .map((f) => relative(publicRoot, f))
  .filter((f) => !f.endsWith(".DS_Store"))
  .sort();
check("public/ contains exactly the expected file set",
  JSON.stringify(actualFiles) === JSON.stringify([...expectedFiles].sort()),
  `actual: ${actualFiles.join(", ")}`);
for (const f of expectedFiles) {
  check(`route exists: ${f}`, existsSync(resolve(publicRoot, f)));
}

const surfaceFiles = [
  "index.html",
  "case-study/index.html",
  "pipeline/index.html",
  "dashboard/index.html",
  "cv/index.html",
];
const surfaces = Object.fromEntries(surfaceFiles.map((f) => [f, read(f)]));

/* == explicit index.html links resolve under file:// =============== */
console.log("\n== explicit index.html links resolve under file:// ==");
for (const [file, html] of Object.entries(surfaces)) {
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  check(`${file}: has at least one link`, refs.length > 0);
  for (const ref of refs) {
    if (/^https?:\/\//.test(ref)) continue; // externals audited separately
    const isRelative = !ref.startsWith("/") && !ref.startsWith("//") && !ref.includes(":");
    check(`${file}: ref is relative: ${ref}`, isRelative);
    const explicit = /\.(html|css|js|csv)$/.test(ref);
    check(`${file}: ref is an explicit file (no directory href): ${ref}`, explicit);
    const target = resolve(dirname(resolve(publicRoot, file)), ref);
    check(`${file}: ref resolves on disk: ${ref}`, existsSync(target));
  }
  const pageLinks = [...html.matchAll(/href="([^"]+\.html)"/g)].map((m) => m[1]);
  check(`${file}: every page link ends in index.html`,
    pageLinks.length > 0 && pageLinks.every((h) => h.endsWith("index.html")));
}
check("psico-header.css @import of identity tokens resolves",
  read("shell/psico-header/psico-header.css").includes("../identity/tokens.css") &&
  existsSync(resolve(publicRoot, "shell/identity/tokens.css")));

/* == shared identity header on all five surfaces =================== */
console.log("\n== shared identity header on all five surfaces ==");
const expectedCurrent = {
  "index.html": "home",
  "case-study/index.html": "case-study",
  "pipeline/index.html": "pipeline",
  "dashboard/index.html": "dashboard",
  "cv/index.html": "cv",
};
for (const [file, html] of Object.entries(surfaces)) {
  check(`${file}: has <psico-header> with route id "${expectedCurrent[file]}"`,
    html.includes(`<psico-header data-shell-current="${expectedCurrent[file]}"`));
  check(`${file}: has no-JS fallback header`, html.includes("psico-header-fallback"));
  check(`${file}: fallback nav exposes a CV link`,
    /<a href="[^"]*cv\/index\.html"[^>]*>CV<\/a>/.test(html));
  check(`${file}: loads the classic shell bundle`,
    /<script src="[^"]*shell\/psico-shell\.js" defer><\/script>/.test(html));
  check(`${file}: html opts into header motif ownership`,
    html.includes('data-motif-owner="header"'));
}
const headerCss = read("shell/psico-header/psico-header.css");
const shellCss = read("shell/public-shell.css");
const printBlocks = [...shellCss.matchAll(/@media print\{([^}]*\{[^}]*\}[^}]*)\}/g)]
  .map((m) => m[1]);
const shellCssOutsidePrint = printBlocks.reduce(
  (css, block) => css.replace(block, ""), shellCss,
);
check("canonical header CSS declares sticky positioning (position:sticky;top:0)",
  /psico-header\{[^}]*position:sticky;top:0/.test(headerCss));
check("canonical header CSS sets a solid Hueso background (no bleed-through)",
  /\.psico-header\{[^}]*background:rgba\(245,243,236,/.test(headerCss));
check("public shell does not force the header out of sticky positioning on screen",
  !/psico-header\{[^}]*position:static/.test(shellCssOutsidePrint));
check("public shell un-sticks/hides the header in print",
  printBlocks.some((b) => /psico-header\{[^}]*(display:none|position:static)/.test(b)));
const bundle = read("shell/psico-shell.js");
check("shell bundle is a classic script (no module syntax left)",
  !/^\s*import\s/m.test(bundle) && !/^\s*export\s/m.test(bundle));
check("shell bundle defines the canonical psico-header element",
  bundle.includes('customElements.define("psico-header", PsicoHeader)'));
check("shell bundle carries the canonical living-motif engine",
  bundle.includes("LivingMotifEngine") && bundle.includes("MOTIF_GLYPHS"));

/* == Landing & Case Study: EN|ES parity, Spanish default =========== */
console.log("\n== Landing & Case Study i18n ==");
const engine = read("shell/portfolio-i18n.js");
check("shared engine: Spanish is the deterministic default",
  engine.includes('DEFAULT_LANG = "es"'));
check("shared engine: persists via localStorage",
  engine.includes("localStorage.getItem") && engine.includes("localStorage.setItem"));
check("shared engine: uses its own key, distinct from both apps",
  engine.includes('LANG_KEY = "portfolio_lang"') &&
  !engine.includes("anfp_pipeline_lang") && !engine.includes("dashboard_lang"));

for (const file of ["index.html", "case-study/index.html"]) {
  const html = surfaces[file];
  check(`${file}: static document language is Spanish`, html.includes('<html lang="es"'));
  check(`${file}: has EN and ES buttons`,
    html.includes('data-lang="en"') && html.includes('data-lang="es"'));
  check(`${file}: toggle order is ES then EN`,
    html.indexOf('data-lang="es"') < html.indexOf('data-lang="en"'));
  check(`${file}: uses the shared engine (no duplicated i18n logic)`,
    /<script src="[^"]*shell\/portfolio-i18n\.js" defer><\/script>/.test(html) &&
    !html.includes("localStorage"));

  const dictMatch = html.match(/window\.PORTFOLIO_I18N = ([\s\S]*?);\s*<\/script>/);
  check(`${file}: embeds a translation dictionary`, Boolean(dictMatch));
  if (!dictMatch) continue;
  let dict = null;
  try {
    dict = vm.runInNewContext(`(${dictMatch[1]})`);
  } catch (error) { /* fall through */ }
  check(`${file}: dictionary evaluates`, dict !== null);
  if (!dict) continue;
  check(`${file}: dictionary has es and en`, Boolean(dict.es) && Boolean(dict.en));
  const esKeys = Object.keys(dict.es).sort();
  const enKeys = Object.keys(dict.en).sort();
  check(`${file}: full key parity between es and en`,
    JSON.stringify(esKeys) === JSON.stringify(enKeys));
  check(`${file}: no empty es value`, esKeys.every((k) => dict.es[k].trim().length > 0));
  check(`${file}: no empty en value`, enKeys.every((k) => dict.en[k].trim().length > 0));
  const proseKeys = esKeys.filter((k) => dict.es[k].length > 40);
  check(`${file}: prose values genuinely translated (es differs from en)`,
    proseKeys.length > 0 && proseKeys.every((k) => dict.es[k] !== dict.en[k]));
  check(`${file}: static markup carries the Spanish title`,
    html.includes(`>${dict.es.title}</h1>`));
}

/* == Case Study: exactly two primary narrative CTAs ================ */
console.log("\n== Case Study narrative CTAs ==");
const caseHtml = surfaces["case-study/index.html"];
const ctas = [...caseHtml.matchAll(/class="portfolio-cta" href="([^"]+)"/g)].map((m) => m[1]);
check("exactly two primary narrative CTAs", ctas.length === 2);
check("CTA 1 → Pipeline View", ctas[0] === "../pipeline/index.html");
check("CTA 2 → Dashboard View", ctas[1] === "../dashboard/index.html");

/* == app copies: approved adaptations only ========================= */
console.log("\n== app copies: approved adaptations only ==");
const pipelineSource = readFileSync(resolve(projectRoot, "vertical-slice/index.html"), "utf8");
const dashboardSource = readFileSync(resolve(projectRoot, "dashboard/index.html"), "utf8");
const cvSource = readFileSync(resolve(projectRoot, "private-source/cv_ricardo.html"), "utf8");
check("public pipeline == transform(source), byte-identical",
  build.transformPipelineHtml(pipelineSource) === surfaces["pipeline/index.html"]);
check("public dashboard == transform(source), byte-identical",
  build.transformDashboardHtml(dashboardSource) === surfaces["dashboard/index.html"]);
check("public cv == transform(private source), byte-identical",
  build.transformCvHtml(cvSource) === surfaces["cv/index.html"]);
for (const app of ["pipeline", "dashboard"]) {
  const sourceDir = app === "pipeline" ? "vertical-slice" : "dashboard";
  const names = readdirSync(resolve(publicRoot, app, "input")).sort();
  const sourceNames = readdirSync(resolve(projectRoot, sourceDir, "input"))
    .filter((n) => n.endsWith(".csv")).sort();
  check(`${app}/input has the same csv set as ${sourceDir}/input`,
    JSON.stringify(names) === JSON.stringify(sourceNames));
  for (const name of names) {
    check(`${app}/input/${name} identical to source`,
      readFileSync(resolve(publicRoot, app, "input", name), "utf8") ===
      readFileSync(resolve(projectRoot, sourceDir, "input", name), "utf8"));
  }
}
check("source pipeline app carries no public shell markup",
  !pipelineSource.includes("psico-header") && !pipelineSource.includes("psico-shell"));
check("source dashboard app carries no public shell markup",
  !dashboardSource.includes("psico-header") && !dashboardSource.includes("psico-shell"));
check("apps keep their own language keys (no conflicting shared control)",
  surfaces["pipeline/index.html"].includes('data-shell-lang-key="anfp_pipeline_lang"') &&
  surfaces["dashboard/index.html"].includes('data-shell-lang-key="dashboard_lang"'));

/* == Pipeline & Dashboard: ES | EN order, Spanish default, shared tokens */
console.log("\n== Pipeline & Dashboard language-control invariants ==");
for (const file of ["pipeline/index.html", "dashboard/index.html"]) {
  const html = surfaces[file];
  check(`${file}: has EN and ES buttons`,
    html.includes('data-lang="en"') && html.includes('data-lang="es"'));
  check(`${file}: toggle order is ES then EN`,
    html.indexOf('data-lang="es"') < html.indexOf('data-lang="en"'));
  check(`${file}: Spanish is the deterministic first-load default`,
    /return stored === "en" \? "en" : "es";/.test(html));
  check(`${file}: no leftover English-first default logic`,
    !/return stored === "es" \? "es" : "en";/.test(html));
  check(`${file}: shared shell mirrors the same Spanish default`,
    html.includes('data-shell-lang-default="es"'));
}
check("shared shell CSS defines one .lang-btn treatment applied to all four bilingual surfaces",
  /body:not\(\.cv-public\) \.lang-btn\{/.test(shellCss) &&
  /body:not\(\.cv-public\) \.lang-btn\.active,\s*\nbody:not\(\.cv-public\) \.lang-btn\[aria-pressed="true"\]\{/.test(shellCss));

/* == CV privacy (CV_PRIVACY_MODE=B) ================================ */
console.log("\n== CV privacy ==");
const cvHtml = surfaces["cv/index.html"];
check("CV keeps the public professional email",
  cvHtml.includes("rmorenoga@fen.uchile.cl"));
check("CV mode B: phone number is removed from the public copy",
  !/\+56 ?9/.test(cvHtml) && !/tel:/.test(cvHtml));
check("CV mode B: no dangling separator or broken contact row",
  !/·\s*<br>/.test(cvHtml) && !/·\s*·/.test(cvHtml) &&
  /Santiago, Chile · rmorenoga@fen\.uchile\.cl<br>/.test(cvHtml));
check("CV keeps LinkedIn and GitHub profile links",
  /https:\/\/linkedin\.com\/in\/psicoandino/.test(cvHtml) &&
  /https:\/\/github\.com\/psicoandino/.test(cvHtml));
check("CV print sizing rule is preserved (@page size:letter)",
  cvHtml.includes("@page{") && cvHtml.includes("size:letter"));

/* == shared typography & focus-visible tokens ====================== */
console.log("\n== shared typography & focus-visible tokens ==");
check("shared shell defines the H1/H2/H3 typography tokens",
  shellCss.includes("--portfolio-h1-family") &&
  shellCss.includes("--portfolio-h1-size") &&
  shellCss.includes("--portfolio-h1-line-height"));
check("shared shell applies those tokens to the four app/narrative surfaces, not the CV",
  /body:not\(\.cv-public\) h1\{/.test(shellCss) &&
  /body:not\(\.cv-public\) h2\{/.test(shellCss));
check("shared shell defines a global :focus-visible treatment",
  /a:focus-visible,\s*\nbutton:focus-visible,\s*\nselect:focus-visible,\s*\ninput:focus-visible/.test(shellCss));
check("narrative prose width is close to 68ch (Landing/Case Study)",
  read("shell/portfolio.css").includes("max-width:68ch"));
check("Pipeline/Dashboard data tables keep their own wider containers (not forced to 68ch)",
  surfaces["pipeline/index.html"].includes("max-width:1180px") &&
  surfaces["dashboard/index.html"].includes("max-width:1180px"));

/* == source app suites still pass unchanged ======================== */
console.log("\n== source app suites still pass unchanged ==");
function runsClean(scriptRelPath) {
  try {
    execFileSync("node", [resolve(projectRoot, scriptRelPath)], {
      cwd: projectRoot,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}
check("vertical-slice/tests/smoke-test.mjs passes", runsClean("vertical-slice/tests/smoke-test.mjs"));
check("dashboard/tests/smoke-test.mjs passes", runsClean("dashboard/tests/smoke-test.mjs"));

/* == no internal label, artifact, or private source exposed ======== */
console.log("\n== no internal label, artifact, or private source exposed ==");
const nonTestFiles = actualFiles.filter((f) => !f.startsWith("tests/"));
// Obsolete expectation replaced: previously Pipeline and Dashboard were
// exempted wholesale from the contract/audit filename scan, because their
// disclosure text cited internal document names by design. This pass
// rewrites those citations to plain named references (build-public.mjs
// DASHBOARD_LABEL_SCRUB) in the public copy only, so the exemption no
// longer applies to visitor-facing (rendered) content. What each canonical
// source app still keeps in its own JS *comments* (never rendered, and
// off-limits to edit per "do not modify canonical source applications")
// is excluded here by stripping <script> blocks before scanning.
function stripScripts(html) {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");
}
const narrativeAndShellFiles = nonTestFiles.filter((f) => !f.endsWith(".csv"));
for (const f of nonTestFiles) {
  const content = readFileSync(resolve(publicRoot, f), "utf8");
  check(`${f}: no internal increment label`, !/increment[o]?\s*[0-9]/i.test(content));
  check(`${f}: no private-source reference`, !content.includes("private-source"));
  check(`${f}: no local absolute path`, !/\/Users\//.test(content) && !/[A-Z]:\\/.test(content));
}
for (const f of narrativeAndShellFiles) {
  const rendered = stripScripts(readFileSync(resolve(publicRoot, f), "utf8"));
  check(`${f}: no visitor-facing internal contract/audit/evidence filename`,
    !/CONTRACT\.md|AUDIT\.md|dashboard-audit|canonical-information-model|notebook_resp|01_evidence/i.test(rendered));
  check(`${f}: no visitor-facing .md filename`, !/[\w-]+\.md\b/i.test(rendered));
  check(`${f}: no visitor-facing .csv path`, !/[\w./-]+\.csv\b/i.test(rendered));
}
check("dashboard's templated document-reference constants carry no .md/.csv filename",
  !/const CODE_(AUDIT|CONTRACT|CANAL_CSV|PROGRAMA_CSV)\s*=\s*"[^"]*\.(md|csv)[^"]*"/
    .test(surfaces["dashboard/index.html"]));
const forbiddenNames = [
  /CONTRACT/i, /AUDIT/i, /^CASE-01\.md$/i, /^readme\.md$/i,
  /notebook_resp/i, /canonical-information-model/i, /dashboard-audit/i,
];
for (const f of nonTestFiles) {
  const base = f.split("/").pop();
  check(`no internal artifact shipped: ${f}`, !forbiddenNames.some((p) => p.test(base)));
}
check("CV route is reachable from every surface header",
  surfaceFiles.every((f) => surfaces[f].includes("cv/index.html")));

/* == no external dependencies or network access ==================== */
console.log("\n== no external dependencies or network access ==");
for (const f of nonTestFiles) {
  const content = readFileSync(resolve(publicRoot, f), "utf8");
  const externals = [...content.matchAll(/https?:\/\/[^\s"'<)]+/g)].map((m) => m[0]);
  if (f === "cv/index.html") {
    const anchorHrefs = [...content.matchAll(/<a href="(https:\/\/[^"]+)"/g)].map((m) => m[1]);
    check(`${f}: external URLs are outbound profile anchors only`,
      externals.length === anchorHrefs.length &&
      anchorHrefs.every((h) => /^https:\/\/(www\.)?(linkedin|github)\.com\//.test(h)));
  } else {
    check(`${f}: no external URL`, externals.length === 0);
  }
  check(`${f}: no fetch(`, !/\bfetch\(/.test(content));
  check(`${f}: no XMLHttpRequest`, !content.includes("XMLHttpRequest"));
  check(`${f}: no WebSocket`, !content.includes("WebSocket"));
  check(`${f}: no dynamic import(`, !/\bimport\(/.test(content));
}
check("no package.json anywhere in public/", nonTestFiles.every((f) => !f.endsWith("package.json")));
check("no node_modules anywhere in public/", actualFiles.every((f) => !f.includes("node_modules")));

/* == synthetic-data disclosure stays visible ======================= */
console.log("\n== synthetic-data disclosure stays visible ==");
check("pipeline copy keeps its synthetic disclosure",
  /All data on this page is synthetic/.test(surfaces["pipeline/index.html"]));
check("dashboard copy keeps its synthetic disclosure",
  /All data on this page is synthetic/.test(surfaces["dashboard/index.html"]));
check("Landing discloses synthetic data in both languages",
  surfaces["index.html"].includes("datos sintéticos") &&
  surfaces["index.html"].includes("synthetic data"));
check("Case Study discloses synthetic data in both languages",
  caseHtml.includes("datos sintéticos") && caseHtml.includes("synthetic data"));

/* == forbidden claims absent from the narrative surfaces =========== */
console.log("\n== forbidden claims absent ==");
const narrative = surfaces["index.html"] + " " + caseHtml;
check("no real-time claim (en/es)", !/real-?time/i.test(narrative) && !/tiempo real/i.test(narrative));
check("no percentage figure at all", !/\d+\s*%/.test(narrative) && !/%\s*\d/.test(narrative));
check("no model accuracy figure", !/\b(accuracy|precisión)\b/i.test(narrative));
check("no revenue impact claim", !/revenue|ingresos/i.test(narrative));
check("no invented uplift/reduction claim",
  !/(reduction|uplift|reducción|aumento) (of|de)\s*\d/i.test(narrative));

/* == deterministic rebuild ========================================= */
console.log("\n== deterministic rebuild ==");
const scratch = mkdtempSync(join(tmpdir(), "anfp-public-"));
try {
  build.buildPublic(scratch);
  const freshHash = build.hashTree(scratch);
  const currentHash = build.hashTree(publicRoot);
  check("fresh build reproduces the shipped public/ tree exactly",
    freshHash === currentHash, `fresh ${freshHash} vs public ${currentHash}`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
