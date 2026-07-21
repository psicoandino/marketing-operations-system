// Smoke test for the public shell (Landing, Case Study, Pipeline copy, Dashboard copy).
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const publicRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectRoot = resolve(publicRoot, "..");

let passed = 0;
let failed = 0;
function check(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  ok  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? " — " + detail : ""}`);
  }
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// == required public files ==
console.log("\n== required public files ==");
const requiredFiles = [
  "index.html",
  "case-study/index.html",
  "pipeline/index.html",
  "dashboard/index.html",
];
for (const f of requiredFiles) {
  check(`file exists: ${f}`, existsSync(resolve(publicRoot, f)));
}

const landingHtml = readFileSync(resolve(publicRoot, "index.html"), "utf8");
const caseStudyHtml = readFileSync(resolve(publicRoot, "case-study/index.html"), "utf8");

// == Landing links resolve ==
console.log("\n== Landing links resolve ==");
const landingHrefs = [...landingHtml.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
check("Landing links to case-study/", landingHrefs.some((h) => h === "case-study/"));
check("Landing links to pipeline/", landingHrefs.some((h) => h === "pipeline/"));
check("Landing links to dashboard/", landingHrefs.some((h) => h === "dashboard/"));
for (const h of landingHrefs) {
  const target = resolve(publicRoot, h, h.endsWith("/") ? "index.html" : "");
  check(`Landing href resolves: ${h}`, existsSync(target.endsWith("index.html") ? target : target));
}

// == Case Study links resolve ==
console.log("\n== Case Study links resolve ==");
const caseStudyHrefs = [...caseStudyHtml.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
check("Case Study links to Pipeline View", caseStudyHrefs.some((h) => h === "../pipeline/"));
check("Case Study links to Dashboard View", caseStudyHrefs.some((h) => h === "../dashboard/"));
check("Case Study links back to Landing", caseStudyHrefs.some((h) => h === "../"));
check("Case Study has exactly two CTA links (pipeline + dashboard)",
  caseStudyHrefs.filter((h) => h === "../pipeline/" || h === "../dashboard/").length === 2);
for (const h of caseStudyHrefs) {
  const base = resolve(publicRoot, "case-study");
  const target = resolve(base, h);
  const resolved = existsSync(target) ? target : existsSync(resolve(target, "index.html")) ? resolve(target, "index.html") : null;
  check(`Case Study href resolves: ${h}`, resolved !== null);
}

// == Pipeline and Dashboard copies exist ==
console.log("\n== Pipeline and Dashboard copies exist ==");
check("public/pipeline/index.html exists", existsSync(resolve(publicRoot, "pipeline/index.html")));
check("public/dashboard/index.html exists", existsSync(resolve(publicRoot, "dashboard/index.html")));
check("public/pipeline/index.html identical to source",
  readFileSync(resolve(publicRoot, "pipeline/index.html"), "utf8") ===
  readFileSync(resolve(projectRoot, "vertical-slice/index.html"), "utf8"));
check("public/dashboard/index.html identical to source",
  readFileSync(resolve(publicRoot, "dashboard/index.html"), "utf8") ===
  readFileSync(resolve(projectRoot, "dashboard/index.html"), "utf8"));

// == no internal artifact exposed outside public/tests/ ==
console.log("\n== no internal artifact exposed outside public/tests/ ==");
const forbiddenNamePatterns = [
  /CONTRACT/i,
  /AUDIT/i,
  /^CASE-01\.md$/i,
  /^readme\.md$/i,
  /smoke-test\.mjs$/i,
  /notebook_resp/i,
  /canonical-information-model/i,
  /dashboard-audit/i,
];
const allPublicFiles = walk(publicRoot);
for (const f of allPublicFiles) {
  const rel = relative(publicRoot, f);
  const base = rel.split("/").pop();
  const isInTestsDir = rel.startsWith("tests/");
  const matches = forbiddenNamePatterns.some((p) => p.test(base));
  check(`not exposed outside public/tests/: ${rel}`, !matches || isInTestsDir,
    `matched forbidden pattern and is outside public/tests/`);
}

// == both copied app smoke tests still pass unchanged ==
console.log("\n== both copied app smoke tests still pass unchanged ==");
function runsClean(scriptRelPath) {
  try {
    execFileSync("node", [resolve(projectRoot, scriptRelPath)], { cwd: projectRoot, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
check("vertical-slice/tests/smoke-test.mjs passes", runsClean("vertical-slice/tests/smoke-test.mjs"));
check("dashboard/tests/smoke-test.mjs passes", runsClean("dashboard/tests/smoke-test.mjs"));

// == no external dependencies or network requests introduced ==
console.log("\n== no external dependencies or network requests introduced ==");
const publicHtmlFiles = allPublicFiles.filter((f) => f.endsWith(".html"));
for (const f of publicHtmlFiles) {
  const rel = relative(publicRoot, f);
  const html = readFileSync(f, "utf8");
  check(`${rel}: no <script src`, !/<script[^>]+src=/i.test(html));
  check(`${rel}: no <link tag`, !/<link\s/i.test(html));
  check(`${rel}: no fetch(`, !/\bfetch\(/.test(html));
  check(`${rel}: no XMLHttpRequest`, !/XMLHttpRequest/.test(html));
  check(`${rel}: no WebSocket`, !/WebSocket/.test(html));
  check(`${rel}: no http:// URL`, !/http:\/\//.test(html));
  check(`${rel}: no https:// URL`, !/https:\/\//.test(html));
}
check("no package.json anywhere in public/", !existsSync(resolve(publicRoot, "package.json")) &&
  allPublicFiles.every((f) => !f.endsWith("package.json")));
check("no node_modules anywhere in public/", allPublicFiles.every((f) => !f.includes("node_modules")));

// == all internal links are relative and valid ==
console.log("\n== all internal links are relative and valid ==");
for (const f of publicHtmlFiles) {
  const rel = relative(publicRoot, f);
  const html = readFileSync(f, "utf8");
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const h of hrefs) {
    const isRelative = !/^https?:\/\//.test(h) && !h.startsWith("/") && !h.startsWith("//");
    check(`${rel}: href is relative: ${h}`, isRelative);
  }
}

// == synthetic-data disclosure ==
console.log("\n== synthetic-data disclosure ==");
check("Landing or Case Study discloses synthetic data",
  /synthetic/i.test(landingHtml) || /synthetic/i.test(caseStudyHtml));
check("Case Study discloses synthetic data", /synthetic/i.test(caseStudyHtml));

// == forbidden claims absent ==
console.log("\n== forbidden claims absent ==");
const shellText = landingHtml + " " + caseStudyHtml;
check("no real-time reporting claim", !/real-time reporting/i.test(shellText));
check("no percentage-reduction / uplift claim", !/%\s*(reduction|increase|uplift)/i.test(shellText));
check("no claim of permanent Random Forest production use",
  !/random forest.{0,40}(permanent|production)/i.test(shellText));
check("no specific model accuracy figure", !/\baccuracy of \d/i.test(shellText));
check("no revenue impact claim", !/revenue (impact|increase|growth)/i.test(shellText));
check("no internal contract/audit filename mentioned",
  !/CONTRACT\.md|AUDIT\.md|dashboard-audit|canonical-information-model|notebook_resp/i.test(shellText));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
