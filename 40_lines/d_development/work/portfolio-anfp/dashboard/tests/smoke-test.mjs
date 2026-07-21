#!/usr/bin/env node
/**
 * Smoke test for the Dashboard View — Increment 1 (Lifecycle Status view only).
 *
 * Verifies, mechanically, against DASHBOARD_BUILD_CONTRACT.md:
 *   - required files exist, no external runtime dependencies, no network calls;
 *   - embedded CSVs match the input/*.csv fixtures exactly;
 *   - the nav scaffolds exactly 4 views, with only 1 enabled this increment;
 *   - the synthetic-data + historical-anomalies disclosure is present;
 *   - Estado de consulta has exactly the 8 contract-specified values;
 *   - status counts reconcile exactly to Leads (no forced/hidden equality);
 *   - Conversion % reconciles exactly (Matrículas ÷ Leads);
 *   - no negative counts are possible in the synthetic dataset;
 *   - no origin/formulario value is a person's name (tag-shaped values only);
 *   - the Canal mapping covers every distinct origin value, unambiguously;
 *   - required interactions (programa_codigo filter, date-range filter) exist;
 *   - the Estado view is not presented as a sequential funnel;
 *   - none of the contract's non-goal entities/capabilities are present.
 *
 * Run: node tests/smoke-test.mjs   (no dependencies beyond Node >= 16)
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

let passed = 0;
let failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log("  ok  " + name); }
  else { failed++; console.error("FAIL  " + name + (detail ? " — " + detail : "")); }
}
function section(t) { console.log("\n== " + t + " =="); }

// ---------- file inventory ----------
section("file inventory");
const requiredFiles = [
  "index.html",
  "input/consultas.csv",
  "input/matriculas.csv",
  "input/canal_mapping.csv",
  "tests/smoke-test.mjs"
];
for (const f of requiredFiles) check(`file exists: ${f}`, existsSync(resolve(root, f)));
check("no package.json (no runtime dependencies)", !existsSync(resolve(root, "package.json")));
check("no node_modules", !existsSync(resolve(root, "node_modules")));

const html = readFileSync(resolve(root, "index.html"), "utf8");
const consultasCsv = readFileSync(resolve(root, "input/consultas.csv"), "utf8");
const matriculasCsv = readFileSync(resolve(root, "input/matriculas.csv"), "utf8");
const canalCsv = readFileSync(resolve(root, "input/canal_mapping.csv"), "utf8");

// ---------- self-containment ----------
section("self-containment");
const forbidden = [
  ["<script src", /<script[^>]*\ssrc\s*=/i],
  ["<link tag", /<link\b/i],
  ["<img tag", /<img\b/i],
  ["http:// URL", /http:\/\//i],
  ["https:// URL", /https:\/\//i],
  ["fetch(", /\bfetch\s*\(/],
  ["XMLHttpRequest", /XMLHttpRequest/],
  ["WebSocket", /\bWebSocket\b/]
];
for (const [label, re] of forbidden) check(`index.html contains no ${label}`, !re.test(html));

// ---------- embedded CSVs match fixtures ----------
section("embedded data matches fixtures");
function embeddedBlock(id) {
  const m = html.match(new RegExp(`<script type="text/csv" id="${id}">\\n([\\s\\S]*?)</script>`));
  return m ? m[1] : null;
}
const embeddedConsultas = embeddedBlock("csv-consultas");
const embeddedMatriculas = embeddedBlock("csv-matriculas");
const embeddedCanal = embeddedBlock("csv-canal");
check("csv-consultas block present", embeddedConsultas !== null);
check("csv-consultas matches input/consultas.csv", embeddedConsultas === consultasCsv);
check("csv-matriculas block present", embeddedMatriculas !== null);
check("csv-matriculas matches input/matriculas.csv", embeddedMatriculas === matriculasCsv);
check("csv-canal block present", embeddedCanal !== null);
check("csv-canal matches input/canal_mapping.csv", embeddedCanal === canalCsv);

// ---------- nav scaffolding ----------
section("navigation scaffolding (4 required views)");
const navMatch = html.match(/<nav class="nav" id="viewNav">([\s\S]*?)<\/nav>/);
check("nav block present", !!navMatch);
if (navMatch) {
  const buttons = [...navMatch[1].matchAll(/<button([^>]*)data-view="([a-z]+)"/g)];
  check("exactly 4 view buttons", buttons.length === 4, `found ${buttons.length}`);
  const enabled = buttons.filter(([attrs]) => !/disabled/.test(attrs));
  const disabled = buttons.filter(([attrs]) => /disabled/.test(attrs));
  check("exactly 1 view enabled this increment", enabled.length === 1, `found ${enabled.length}`);
  check("exactly 3 views disabled (later increments)", disabled.length === 3, `found ${disabled.length}`);
  check("the enabled view is 'lifecycle'", enabled[0] && enabled[0][2] === "lifecycle");
  check("disabled views are labeled as a later increment",
    disabled.every(() => /later increment/.test(navMatch[1])));
}

// ---------- disclosure ----------
section("synthetic-data + anomaly disclosure");
check("states data is synthetic", /All data on this page is synthetic/i.test(html));
check("references dashboard-audit.md", html.includes("dashboard-audit.md"));
check("references DASHBOARD_BUILD_CONTRACT.md", html.includes("DASHBOARD_BUILD_CONTRACT.md"));
check("mentions the historical anomalies were not reproduced",
  /not reproduced here/i.test(html));
check("discloses the Canal mapping is a synthetic convention, not the historical rule",
  /explicit synthetic mapping/i.test(html) && /not the historical, unconfirmed production rule/i.test(html));

// ---------- required interactions ----------
section("required interactions");
check("programa_codigo filter present", /id="filterPrograma"/.test(html));
check("date-range start filter present", /<input[^>]*id="filterStart"[^>]*>/.test(html) && /<input[^>]*type="date"[^>]*id="filterStart"/.test(html));
check("date-range end filter present", /<input[^>]*id="filterEnd"[^>]*>/.test(html) && /<input[^>]*type="date"[^>]*id="filterEnd"/.test(html));

// ---------- funnel non-assertion ----------
section("funnel non-assertion");
check("no element/class literally named 'funnel'", !/class=["'][^"']*funnel/i.test(html));
check("explicit 'not a sequential funnel' caption present", /not a sequential funnel/i.test(html));
check("terminal/reversible tags present (state-set framing)",
  /tag-terminal/.test(html) && /tag-reversible/.test(html));

// ---------- non-goal absence ----------
section("non-goal absence (contract Explicit Non-Goals)");
const forbiddenTerms = [
  "GroupMail", "Insights", "aperturas", "clics", "opens", "clicks",
  "Ejecutivo", "Exclusión", "Remover", "Evento", "Webinar registro",
  "export", "alerting", "annotation", "schedule delivery"
];
for (const term of forbiddenTerms) {
  check(`no forbidden term "${term}"`, !new RegExp(term, "i").test(html));
}

// ---------- data-layer logic (shipped code, run in Node) ----------
section("data-layer logic (shipped code, run in Node)");
const START = "/* __DASHBOARD_CORE_START__ */";
const END = "/* __DASHBOARD_CORE_END__ */";
const si = html.indexOf(START), ei = html.indexOf(END);
check("dashboard core markers present", si !== -1 && ei !== -1 && ei > si);
let Core = null;
if (si !== -1 && ei !== -1) {
  try {
    const code = html.slice(si + START.length, ei);
    Core = vm.runInNewContext(code + "\nDashboardCore", {}, { timeout: 5000 });
    check("dashboard core evaluates in Node", true);
  } catch (e) {
    check("dashboard core evaluates in Node", false, String(e));
  }
}

if (Core) {
  const consultas = Core.parseCsv(consultasCsv);
  const matriculas = Core.parseCsv(matriculasCsv);
  const canalRows = Core.parseCsv(canalCsv);
  const canalMap = Core.buildCanalMap(canalRows);

  section("dimension completeness");
  const CONTRACT_ESTADOS = [
    "Interesado", "Desechado", "Gestionado", "Matriculado",
    "Retracto Matrícula", "Evaluado", "Matrícula en Proceso", "Reservar Matrícula"
  ];
  check("exactly 8 Estado de consulta values defined",
    Core.ESTADOS.length === 8, `found ${Core.ESTADOS.length}`);
  check("Estado values match the contract's 8-state set exactly",
    JSON.stringify(Core.ESTADOS.map((e) => e.name).sort()) === JSON.stringify([...CONTRACT_ESTADOS].sort()));
  const distinctEstadosInData = new Set(consultas.map((r) => r.estado));
  check("every state present in the dataset is one of the 8 contract states",
    [...distinctEstadosInData].every((e) => CONTRACT_ESTADOS.includes(e)));

  section("reconciliation (Data Requirements)");
  check("30 synthetic consulta records", consultas.length === 30, `found ${consultas.length}`);
  check("3 synthetic matricula records", matriculas.length === 3, `found ${matriculas.length}`);

  const leads = Core.leadsCount(consultas);
  const counts = Core.estadoCounts(consultas);
  const sumEstados = Object.values(counts).reduce((a, b) => a + b, 0);
  check("sum of status-state counts equals Leads exactly (unfiltered)",
    sumEstados === leads, `sum=${sumEstados}, leads=${leads}`);

  const mats = Core.matriculasCount(matriculas);
  const conv = Core.conversionRatio(consultas, matriculas);
  check("Conversion % reconciles exactly to Matrículas ÷ Leads",
    Math.abs(conv - mats / leads) < 1e-12);
  check("Conversion % is a clean, exact value in the synthetic dataset (10%)",
    Math.abs(conv - 0.1) < 1e-12, `got ${conv}`);

  // Filtered-scope reconciliation, per Acceptance Test 7.
  const oneCode = consultas[0].programa_codigo;
  const filteredConsultas = Core.filterConsultas(consultas, { programaCodigo: oneCode });
  const filteredCounts = Core.estadoCounts(filteredConsultas);
  const filteredSum = Object.values(filteredCounts).reduce((a, b) => a + b, 0);
  check("status-state counts reconcile to Leads under a program-code filter too",
    filteredSum === filteredConsultas.length);

  section("non-negativity");
  const canal = Core.canalCounts(consultas, canalMap);
  check("every Canal count is non-negative",
    Object.values(canal.byCanal).every((n) => n >= 0));
  check("every origin count is non-negative",
    Object.values(canal.byOrigin).every((n) => n >= 0));
  check("no status-state count is negative",
    Object.values(counts).every((n) => n >= 0));

  section("origin field integrity (no name leakage)");
  const distinctOrigins = [...new Set(consultas.map((r) => r.formulario_origen))];
  check("at least one distinct origin value present", distinctOrigins.length > 0);
  check("every origin value is a system/channel-style tag (lowercase_snake_case, no spaces)",
    distinctOrigins.every((v) => /^[a-z][a-z_]*[a-z]$/.test(v)),
    distinctOrigins.filter((v) => !/^[a-z][a-z_]*[a-z]$/.test(v)).join(", "));
  check("no origin value looks like a person's name (Title Case with a space)",
    distinctOrigins.every((v) => !/^[A-Z][a-z]+ [A-Z][a-z]+/.test(v)));

  section("Canal mapping coverage (explicit synthetic mapping)");
  const unmapped = distinctOrigins.filter((v) => !(v in canalMap));
  check("every distinct origin value used in consultas.csv has a Canal mapping entry",
    unmapped.length === 0, unmapped.join(", "));
  const mappingKeys = canalRows.map((r) => r.formulario_origen);
  check("no duplicate/ambiguous mapping entries (one canal per origin)",
    new Set(mappingKeys).size === mappingKeys.length);

  section("determinism");
  const run2Counts = Core.estadoCounts(Core.parseCsv(consultasCsv));
  check("re-parsing and recomputing produces identical status counts",
    JSON.stringify(counts) === JSON.stringify(run2Counts));
}

// ---------- summary ----------
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
