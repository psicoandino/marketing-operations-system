#!/usr/bin/env node
/**
 * Smoke test for the vertical-slice demo.
 *
 * Verifies, mechanically:
 *   1. required files exist;
 *   2. four heterogeneous sources are represented (fixtures + embedded copies);
 *   3. no external runtime dependencies / no network requests are required;
 *   4. the ten pipeline stages exist;
 *   5. deterministic synthetic input counts;
 *   6. invalid records are separated with reasons;
 *   7. duplicates are removed deterministically under the two recovered rules;
 *   8. final CSV export logic exists and produces the expected shape;
 *   9. no obvious credentials or private values appear in the created files.
 *
 * It executes the page's own pipeline core (extracted from index.html) in a
 * Node VM, so the tested logic is the shipped logic — not a re-implementation.
 *
 * Run: node tests/smoke-test.mjs   (no dependencies beyond Node ≥ 16)
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const sliceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const recoveredDir = resolve(sliceRoot, "..", "01_evidence", "recovered");

let passed = 0;
let failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log("  ok  " + name); }
  else { failed++; console.error("FAIL  " + name + (detail ? " — " + detail : "")); }
}
function section(t) { console.log("\n== " + t + " =="); }

// ---------- 1. file inventory ----------
section("file inventory");
const SOURCES = ["fenix", "intranet", "webinars", "legacy"];
const requiredFiles = [
  "index.html",
  "README.md",
  "tests/smoke-test.mjs",
  ...SOURCES.map((s) => `input/${s}.csv`)
];
for (const f of requiredFiles) {
  check(`file exists: ${f}`, existsSync(resolve(sliceRoot, f)));
}
check("sanitized evidence exists",
  existsSync(resolve(recoveredDir, "notebook_resp.SANITIZED.md")));
const recoveredIgnore = resolve(recoveredDir, ".gitignore");
check("recovered/.gitignore excludes PRIVATE artifacts",
  existsSync(recoveredIgnore) && readFileSync(recoveredIgnore, "utf8").includes("*.PRIVATE.*"));
check("no package.json (no runtime dependencies)",
  !existsSync(resolve(sliceRoot, "package.json")));
check("no node_modules", !existsSync(resolve(sliceRoot, "node_modules")));

const html = readFileSync(resolve(sliceRoot, "index.html"), "utf8");
const fixtures = Object.fromEntries(
  SOURCES.map((s) => [s, readFileSync(resolve(sliceRoot, "input", s + ".csv"), "utf8")])
);

// ---------- 2. four sources represented, embedded copies identical ----------
section("sources");
for (const s of SOURCES) {
  const m = html.match(new RegExp(`<script type="text/csv" id="csv-${s}">\\n([\\s\\S]*?)</script>`));
  check(`embedded csv block: ${s}`, !!m);
  if (m) check(`embedded csv identical to input/${s}.csv`, m[1] === fixtures[s],
    "embedded copy has drifted from the fixture");
}

// ---------- 3. no external dependencies / no network ----------
section("self-containment");
const forbidden = [
  ["<script src", /<script[^>]*\ssrc\s*=/i],
  ["<link tag", /<link\b/i],
  ["<img tag", /<img\b/i],
  ["http:// URL", /http:\/\//i],
  ["https:// URL", /https:\/\//i],
  ["fetch(", /\bfetch\s*\(/],
  ["XMLHttpRequest", /XMLHttpRequest/],
  ["WebSocket", /\bWebSocket\b/],
  ["dynamic import(", /\bimport\s*\(/],
  ["CSS @import", /@import\b/],
  ["CSS url(", /\burl\s*\(\s*['"]?http/i]
];
for (const [label, re] of forbidden) {
  check(`index.html contains no ${label}`, !re.test(html));
}

// ---------- 4. pipeline stages (new narrative order) ----------
section("stages");
const stageTitles = [
  "Multiple heterogeneous operational systems", "Different schemas",
  "Why they cannot be joined directly", "Source-specific transformations",
  "Schema mapping", "Incremental processing", "Validation",
  "Contextual deduplication", "Consolidated operational database",
  "Exploration & CSV export"
];
for (const title of stageTitles) {
  check(`stage present: ${title}`, html.includes(title));
}

// ---------- bilingual support ----------
section("i18n");
check("language switch buttons present (EN | ES)",
  html.includes('id="langEn"') && html.includes('id="langEs"'));
check("localStorage persistence wired",
  html.includes("localStorage.setItem(LANG_KEY") && html.includes("localStorage.getItem(LANG_KEY"));
check("English is the deterministic default",
  /stored === "es" \? "es" : "en"/.test(html));

const I18N_START = "/* __I18N_DICT_START__ */";
const I18N_END = "/* __I18N_DICT_END__ */";
const i18nSi = html.indexOf(I18N_START), i18nEi = html.indexOf(I18N_END);
check("i18n dictionary markers present", i18nSi !== -1 && i18nEi !== -1 && i18nEi > i18nSi);
if (i18nSi !== -1 && i18nEi !== -1) {
  let I18N = null;
  try {
    const dictCode = html.slice(i18nSi + I18N_START.length, i18nEi);
    I18N = vm.runInNewContext(dictCode + "\nI18N", {}, { timeout: 5000 });
  } catch (e) {
    check("i18n dictionary evaluates in Node", false, String(e));
  }
  if (I18N) {
    check("i18n dictionary evaluates in Node", true);
    check("dictionary has both en and es", !!I18N.en && !!I18N.es);
    if (I18N.en && I18N.es) {
      const enKeys = Object.keys(I18N.en).sort();
      const esKeys = Object.keys(I18N.es).sort();
      check("en/es dictionaries have identical key sets (single translation dictionary, full parity)",
        JSON.stringify(enKeys) === JSON.stringify(esKeys),
        `en-only: ${enKeys.filter((k) => !esKeys.includes(k)).join(",")} | es-only: ${esKeys.filter((k) => !enKeys.includes(k)).join(",")}`);
      const emptyEn = enKeys.filter((k) => !String(I18N.en[k]).trim());
      const emptyEs = esKeys.filter((k) => !String(I18N.es[k] ?? "").trim());
      check("no empty English values", emptyEn.length === 0, emptyEn.join(","));
      check("no empty Spanish values", emptyEs.length === 0, emptyEs.join(","));
      const identical = enKeys.filter((k) => I18N.en[k] === I18N.es[k] && /[a-zA-Z]{4,}/.test(String(I18N.en[k])));
      check("Spanish values are actually translated (not copies of English) for prose keys",
        identical.filter((k) => !["contactsWord"].includes(k) && String(I18N.en[k]).length > 3 && !/^(Fénix|Webinars|Legacy)/.test(I18N.en[k])).length === 0 ||
        identical.length < enKeys.length * 0.15,
        identical.join(","));
    }
  }
}

// ---------- extract and run the shipped pipeline core ----------
section("pipeline execution (shipped code, run in Node)");
const START = "/* __PIPELINE_CORE_START__ */";
const END = "/* __PIPELINE_CORE_END__ */";
const si = html.indexOf(START), ei = html.indexOf(END);
check("pipeline core markers present", si !== -1 && ei !== -1 && ei > si);
let Core = null;
try {
  const code = html.slice(si + START.length, ei);
  Core = vm.runInNewContext(code + "\nPipelineCore", {}, { timeout: 5000 });
} catch (e) {
  check("pipeline core evaluates in Node", false, String(e));
}
if (Core) {
  check("pipeline core evaluates in Node", true);
  const run = () => Core.runAll(fixtures);
  const R = run();
  const R2 = run();

  // ---------- 5. deterministic input counts ----------
  section("deterministic counts");
  check("fenix input = 12", R.stats.inputs.fenix === 12, `got ${R.stats.inputs.fenix}`);
  check("intranet input = 10", R.stats.inputs.intranet === 10, `got ${R.stats.inputs.intranet}`);
  check("webinars input = 12", R.stats.inputs.webinars === 12, `got ${R.stats.inputs.webinars}`);
  check("legacy input = 10", R.stats.inputs.legacy === 10, `got ${R.stats.inputs.legacy}`);
  check("total consolidated = 44", R.stats.total === 44, `got ${R.stats.total}`);
  check("valid = 40", R.stats.valid === 40, `got ${R.stats.valid}`);
  check("rejected = 4", R.stats.rejected === 4, `got ${R.stats.rejected}`);
  check("duplicates removed = 7", R.stats.removed === 7, `got ${R.stats.removed}`);
  check("removed by identity rule = 5", R.stats.removedByRule.identity === 5,
    `got ${R.stats.removedByRule.identity}`);
  check("removed by email fallback = 2", R.stats.removedByRule.email === 2,
    `got ${R.stats.removedByRule.email}`);
  check("final contacts = 33", R.stats.final === 33, `got ${R.stats.final}`);
  check("arithmetic holds (valid − removed = final)",
    R.stats.valid - R.stats.removed === R.stats.final);

  // ---------- 6. invalid records separated ----------
  section("validation separation");
  const reasons = R.rejected.map((x) => x.reason);
  check("2 rejections for missing email",
    reasons.filter((r) => r === "missing email").length === 2, reasons.join(" | "));
  check("2 rejections for malformed email",
    reasons.filter((r) => r.startsWith("malformed email")).length === 2, reasons.join(" | "));
  check("rejections span all defect sources (fenix, intranet, webinars, legacy)",
    new Set(R.rejected.map((x) => x.record.source)).size === 4);
  check("no rejected record leaks into the final base",
    R.rejected.every((x) => !R.final.includes(x.record)));
  check("every final email is well-formed",
    R.final.every((r) => Core.isValidEmail(r.persona_correo)));

  // ---------- 7. deterministic deduplication ----------
  section("deduplication");
  const byEmail = (email) => R.final.filter((r) => r.persona_correo === email);
  const ricardo = byEmail("ricardo.paredes@example.org");
  check("identity rule: two Fénix registrations with same RUT collapse to one",
    ricardo.length === 1 && ricardo[0].registro_fecha === "2025-03-10",
    JSON.stringify(ricardo.map((r) => r.registro_fecha)));
  const marcela = byEmail("marcela.fuentes@example.com");
  check("identity rule: RUT matches across formats (11.111.111-1 vs 111111111)",
    marcela.length === 1 && marcela[0].persona_rut === "11111111-1" && marcela[0].source === "fenix",
    JSON.stringify(marcela.map((r) => [r.source, r.persona_rut])));
  const jorge = byEmail("jorge.salinas@example.net");
  check("email-link into identity cluster: webinar row absorbed by Fénix RUT record",
    jorge.length === 1 && jorge[0].source === "fenix" && jorge[0].persona_rut === "22222222-2");
  const valentina = byEmail("valentina.herrera@example.net");
  check("survivor can come from legacy (stable id beats source priority)",
    valentina.length === 1 && valentina[0].source === "legacy" && valentina[0].persona_rut === "7654321-6",
    JSON.stringify(valentina.map((r) => r.source)));
  const ana = byEmail("ana.riquelme@example.org");
  check("email fallback: richer webinar record survives over intranet inquiry",
    ana.length === 1 && ana[0].source === "webinars");
  const camila = byEmail("camila.ortega@example.com");
  check("email fallback: intra-source duplicate registration collapses",
    camila.length === 1 && camila[0].registro_fecha === "2025-03-02");
  const pablo = byEmail("pablo.contreras@example.com");
  check("contextual key: same email, two programs → both kept",
    pablo.length === 2 && new Set(pablo.map((r) => r.programa_sigla)).size === 2,
    JSON.stringify(pablo.map((r) => r.programa_sigla)));
  check("no duplicate (email, program) pair survives",
    new Set(R.final.map((r) => r.persona_correo + "|" + r.programa_sigla)).size === R.final.length);
  check("no duplicate (RUT, program) pair survives",
    (() => {
      const withRut = R.final.filter((r) => r.persona_rut);
      return new Set(withRut.map((r) => r.persona_rut + "|" + r.programa_sigla)).size === withRut.length;
    })());
  check("deterministic across runs (identical export)",
    R.exportCsv === R2.exportCsv);
  check("deterministic removed set across runs",
    JSON.stringify(R.removed.map((x) => x.record._rid)) ===
    JSON.stringify(R2.removed.map((x) => x.record._rid)));

  // ---------- normalization spot checks ----------
  section("normalization");
  check("mojibake repaired (JOSÃ‰ → José)",
    byEmail("jose.mardones@example.org")[0]?.persona_nombre === "José");
  check("no mojibake survives into the export", !R.exportCsv.includes("Ã"));
  check("lowercase RUT check digit uppercased (15.151.515-k → 15151515-K)",
    byEmail("daniela.pizarro@example.org")[0]?.persona_rut === "15151515-K");
  check("placeholder dates nulled (0000-00-00, 1900-01-01)",
    byEmail("tomas.arancibia@example.net")[0]?.registro_fecha === "" &&
    byEmail("paula.ibanez@example.net")[0]?.registro_fecha === "");
  check("legacy dd/mm/yyyy converted to ISO",
    byEmail("lorena.campos@example.com")[0]?.registro_fecha === "2023-10-30");
  check("phone noise stripped to digits ((+56) 9-6777-8899)",
    byEmail("hector.vergara@example.org")[0]?.persona_fono === "56967778899");
  check("uppercase email lowered (Fénix)",
    byEmail("mario.reyes@example.com").length === 1);
  check("email whitespace trimmed (intranet)",
    byEmail("monica.tapia@example.net").length === 1);
  check("consent '1' normalized to true",
    byEmail("cristian.donoso@example.net")[0]?.registro_consentimiento === "true");
  check("consent 'No' normalized to false",
    byEmail("javiera.pena@example.org")[0]?.registro_consentimiento === "false");
  check("coalesced Empresa/Institución populated",
    byEmail("camila.ortega@example.com")[0]?.persona_empresa === "Comercial Andina SpA");
  check("program sigla derived from code prefix (DCG25-1 / DCG23-2 → DCG)",
    Core.siglaFromCodigo("DCG25-1") === "DCG" && Core.siglaFromCodigo("DCG23-2") === "DCG");

  // ---------- 8. export logic ----------
  section("export");
  check("page wires a download handler", html.includes("downloadBtn") && html.includes("new Blob"));
  const lines = R.exportCsv.replace(/\n+$/, "").split("\n");
  check("export header = canonical schema", lines[0] === Core.CANONICAL_COLUMNS.join(","));
  check("export has 33 data rows", lines.length === 34, `got ${lines.length - 1}`);
  check("every export row has provenance",
    lines.slice(1).every((l) => /^(fenix|intranet|webinars|legacy),/.test(l)));
}

// ---------- 9. secret / private-value scan ----------
section("secret scan (created files)");
const scanTargets = [
  resolve(sliceRoot, "index.html"),
  resolve(sliceRoot, "README.md"),
  ...SOURCES.map((s) => resolve(sliceRoot, "input", s + ".csv")),
  resolve(recoveredDir, ".gitignore"),
  resolve(recoveredDir, "README.md"),
  resolve(recoveredDir, "notebook_resp.SANITIZED.md")
];
const secretPatterns = [
  ["IPv4 address literal", /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/],
  ["personal Windows path", /C:[\\/]Users/i],
  ["credential assignment with a real-looking value", /\b(password|passwd|pwd|uid)\b\s*[:=]\s*["']?[A-Za-z0-9]/i],
  ["real e-mail provider or org domain", /@(gmail|hotmail|outlook|yahoo|uchile)\b/i]
];
for (const file of scanTargets) {
  const text = readFileSync(file, "utf8");
  const rel = file.replace(sliceRoot + "/", "").replace(recoveredDir + "/", "recovered/");
  for (const [label, re] of secretPatterns) {
    const m = text.match(re);
    check(`${rel}: no ${label}`, !m, m && m[0]);
  }
  const emails = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [];
  check(`${rel}: all email literals are synthetic (@example.*)`,
    emails.every((e) => /@example\.(com|net|org)$/i.test(e)),
    emails.filter((e) => !/@example\.(com|net|org)$/i.test(e)).join(", "));
}

// ---------- summary ----------
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
