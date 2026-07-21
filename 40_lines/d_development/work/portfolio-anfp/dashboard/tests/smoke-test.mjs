#!/usr/bin/env node
/**
 * Smoke test for the Dashboard View — Increment 4 (all four required views:
 * Lifecycle Status + Acquisition → Enrollment Trend + Origin + Program
 * Interest). Increments 1-3's checks are preserved verbatim below except
 * for the nav-count assertions that literally encoded "exactly 3 views
 * enabled" — those are updated to "exactly 4 enabled" because enabling the
 * Program Interest view is this increment's explicit purpose, not a
 * regression. Every other prior assertion, and every prior view's rendered
 * behavior, is unchanged. EN | ES / localStorage language persistence is
 * explicitly out of scope for this increment (deferred to Increment 5) and
 * is left untouched — no assertion is added or removed about its absence.
 *
 * Verifies, mechanically, against DASHBOARD_BUILD_CONTRACT.md:
 *   - required files exist, no external runtime dependencies, no network calls;
 *   - embedded CSVs match the input/*.csv fixtures exactly;
 *   - the nav scaffolds exactly 4 views, all 4 enabled this increment;
 *   - the synthetic-data + historical-anomalies disclosure is present;
 *   - Estado de consulta has exactly the 8 contract-specified values;
 *   - status counts reconcile exactly to Leads (no forced/hidden equality);
 *   - Conversion % reconciles exactly (Matrículas ÷ Leads);
 *   - no negative counts are possible in the synthetic dataset;
 *   - no origin/formulario value is a person's name (tag-shaped values only);
 *   - the Canal mapping covers every distinct origin value, unambiguously;
 *   - required interactions (programa_codigo filter, date-range filter) exist;
 *   - the Estado view is not presented as a sequential funnel;
 *   - none of the contract's non-goal entities/capabilities are present;
 *   - [Increment 2] the Trend view's daily totals reconcile exactly with
 *     Lifecycle Status's Leads/Matrículas, filtered and unfiltered;
 *   - [Increment 2] no duplicated data model, filter logic, or conversion
 *     formula was introduced for the new view;
 *   - [Increment 3] the Origin view's Canal and Formulario/Origen totals
 *     each reconcile exactly to Leads, filtered and unfiltered;
 *   - [Increment 3] every origin maps to exactly one documented Canal;
 *   - [Increment 3] no duplicated filtering/aggregation logic was
 *     introduced for the new view;
 *   - [Increment 4] the Program Interest view's Área, Programa and
 *     Código totals each reconcile exactly to Leads, filtered and unfiltered;
 *   - [Increment 4] every código maps to exactly one programa, and every
 *     programa to exactly one área;
 *   - [Increment 4] no duplicated filtering/aggregation logic was
 *     introduced for the new view.
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
  "input/programa_mapping.csv",
  "tests/smoke-test.mjs"
];
for (const f of requiredFiles) check(`file exists: ${f}`, existsSync(resolve(root, f)));
check("no package.json (no runtime dependencies)", !existsSync(resolve(root, "package.json")));
check("no node_modules", !existsSync(resolve(root, "node_modules")));

const html = readFileSync(resolve(root, "index.html"), "utf8");
const consultasCsv = readFileSync(resolve(root, "input/consultas.csv"), "utf8");
const matriculasCsv = readFileSync(resolve(root, "input/matriculas.csv"), "utf8");
const canalCsv = readFileSync(resolve(root, "input/canal_mapping.csv"), "utf8");
const programaCsv = readFileSync(resolve(root, "input/programa_mapping.csv"), "utf8");

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
const embeddedPrograma = embeddedBlock("csv-programa");
check("csv-consultas block present", embeddedConsultas !== null);
check("csv-consultas matches input/consultas.csv", embeddedConsultas === consultasCsv);
check("csv-matriculas block present", embeddedMatriculas !== null);
check("csv-matriculas matches input/matriculas.csv", embeddedMatriculas === matriculasCsv);
check("csv-canal block present", embeddedCanal !== null);
check("csv-canal matches input/canal_mapping.csv", embeddedCanal === canalCsv);
check("csv-programa block present", embeddedPrograma !== null);
check("csv-programa matches input/programa_mapping.csv", embeddedPrograma === programaCsv);

// ---------- nav scaffolding ----------
section("navigation scaffolding (4 required views)");
const navMatch = html.match(/<nav class="nav" id="viewNav">([\s\S]*?)<\/nav>/);
check("nav block present", !!navMatch);
if (navMatch) {
  const buttons = [...navMatch[1].matchAll(/<button([^>]*)data-view="([a-z]+)"/g)];
  check("exactly 4 view buttons", buttons.length === 4, `found ${buttons.length}`);
  const enabled = buttons.filter(([attrs]) => !/disabled/.test(attrs));
  const disabled = buttons.filter(([attrs]) => /disabled/.test(attrs));
  check("all 4 views enabled this increment", enabled.length === 4, `found ${enabled.length}`);
  check("no view remains disabled", disabled.length === 0, `found ${disabled.length}`);
  check("the enabled views are exactly 'lifecycle', 'trend', 'origin' and 'program'",
    JSON.stringify(enabled.map((b) => b[2]).sort()) === JSON.stringify(["lifecycle", "origin", "program", "trend"]));
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

// ---------- [Increment 2] Trend view markup ----------
section("Trend view markup (Increment 2)");
check("view-lifecycle section still present (regression check)", /id="view-lifecycle"/.test(html));
check("view-trend section present", /id="view-trend"/.test(html));
check("view-trend starts hidden in the static markup", /id="view-trend" hidden/.test(html));
check("Trend nav button is enabled (no disabled attribute)",
  /<button data-view="trend">/.test(html));
check("Trend table has Date/Leads/Matrículas columns",
  /<th>Date<\/th>/.test(html) && />Leads<\/th>/.test(html) && />Matrículas<\/th>/.test(html));
check("Trend view has a reconciliation note element", /id="trendReconcileNote"/.test(html));

// ---------- [Increment 3] Origin view markup ----------
section("Origin view markup (Increment 3)");
check("view-trend section still present (regression check)", /id="view-trend"/.test(html));
check("view-origin section present", /id="view-origin"/.test(html));
check("view-origin starts hidden in the static markup", /id="view-origin" hidden/.test(html));
check("Origin nav button is enabled (no disabled attribute)",
  /<button data-view="origin">/.test(html));
check("Canal table present with Canal/Leads columns",
  /id="canalBody"/.test(html) && /<th>Canal<\/th>/.test(html));
check("Formulario/Origen table present with Formulario / Origen, Canal, Leads columns",
  /id="originBody"/.test(html) && /Formulario \/ Origen/.test(html));
check("Origin view has a reconciliation note element", /id="originReconcileNote"/.test(html));
check("Canal is disclosed as a synthetic, documented grouping, not the historical rule",
  /Canal is a synthetic, documented grouping/i.test(html) &&
  /not a reproduction of the historical, unconfirmed production channel-grouping rule/i.test(html));

// ---------- [Increment 4] Program Interest view markup ----------
section("Program Interest view markup (Increment 4)");
check("view-origin section still present (regression check)", /id="view-origin"/.test(html));
check("view-program section present", /id="view-program"/.test(html));
check("view-program starts hidden in the static markup", /id="view-program" hidden/.test(html));
check("Program Interest nav button is enabled (no disabled attribute)",
  /<button data-view="program">/.test(html));
check("no nav button remains disabled (all 4 views implemented)",
  !/<button disabled/.test(html));
check("Área table present", /id="areaBody"/.test(html) && /<th>Área<\/th>/.test(html));
check("Programa table present", /id="programaBody"/.test(html) && /<th>Programa<\/th>/.test(html));
check("Código table present", /id="codigoBody"/.test(html) && /<th>Código<\/th>/.test(html));
check("Program Interest view has a reconciliation note element", /id="programReconcileNote"/.test(html));
check("Área/Programa disclosed as a synthetic, documented hierarchy",
  /Área\/Programa are a synthetic, documented hierarchy/i.test(html));

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
  const programaRows = Core.parseCsv(programaCsv);
  const programaMap = Core.buildProgramaMap(programaRows);

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

  section("Trend view reconciliation (Increment 2)");
  const trendAll = Core.dailyTrend(consultas, matriculas);
  const trendLeadsSum = trendAll.reduce((a, d) => a + d.leads, 0);
  const trendMatsSum = trendAll.reduce((a, d) => a + d.matriculas, 0);
  check("daily trend leads sum equals Leads exactly (unfiltered)",
    trendLeadsSum === leads, `sum=${trendLeadsSum}, leads=${leads}`);
  check("daily trend matriculas sum equals Matrículas exactly (unfiltered)",
    trendMatsSum === mats, `sum=${trendMatsSum}, mats=${mats}`);
  check("conversion computed from trend sums matches Lifecycle Conversion % exactly",
    Math.abs(conv - trendMatsSum / trendLeadsSum) < 1e-12);
  check("daily trend rows are sorted by date ascending",
    trendAll.every((d, i) => i === 0 || trendAll[i - 1].fecha <= d.fecha));
  check("every daily trend count is non-negative",
    trendAll.every((d) => d.leads >= 0 && d.matriculas >= 0));

  const filteredMatriculas = Core.filterMatriculas(matriculas, { programaCodigo: oneCode });
  const trendFiltered = Core.dailyTrend(filteredConsultas, filteredMatriculas);
  const trendFilteredLeadsSum = trendFiltered.reduce((a, d) => a + d.leads, 0);
  const trendFilteredMatsSum = trendFiltered.reduce((a, d) => a + d.matriculas, 0);
  check("daily trend reconciles exactly to Lifecycle totals under a program-code filter too",
    trendFilteredLeadsSum === filteredConsultas.length &&
    trendFilteredMatsSum === filteredMatriculas.length);

  section("Origin view reconciliation (Increment 3)");
  check("Canal total equals Leads exactly (unfiltered)",
    Object.values(canal.byCanal).reduce((a, b) => a + b, 0) === leads,
    `canalSum=${Object.values(canal.byCanal).reduce((a, b) => a + b, 0)}, leads=${leads}`);
  check("Formulario/Origen total equals Leads exactly (unfiltered)",
    Object.values(canal.byOrigin).reduce((a, b) => a + b, 0) === leads,
    `originSum=${Object.values(canal.byOrigin).reduce((a, b) => a + b, 0)}, leads=${leads}`);

  const filteredCanal = Core.canalCounts(filteredConsultas, canalMap);
  check("Canal total equals filtered Leads exactly (program-code filter)",
    Object.values(filteredCanal.byCanal).reduce((a, b) => a + b, 0) === filteredConsultas.length);
  check("Formulario/Origen total equals filtered Leads exactly (program-code filter)",
    Object.values(filteredCanal.byOrigin).reduce((a, b) => a + b, 0) === filteredConsultas.length);

  check("every origin maps to exactly one Canal (one-origin-to-one-canal)",
    distinctOrigins.every((o) => typeof canalMap[o] === "string" && canalMap[o].length > 0));
  const canalValuesUsed = new Set(distinctOrigins.map((o) => canalMap[o]));
  check("Canal rollup covers exactly the Canal values reachable from used origins",
    JSON.stringify(Object.keys(canal.byCanal).sort()) === JSON.stringify([...canalValuesUsed].sort()));

  section("Program Interest view reconciliation (Increment 4)");
  const programaRollup = Core.programaCounts(consultas, programaMap);
  const areaSum = Object.values(programaRollup.byArea).reduce((a, b) => a + b, 0);
  const programaSum = Object.values(programaRollup.byPrograma).reduce((a, b) => a + b, 0);
  const codigoSum = Object.values(programaRollup.byCodigo).reduce((a, b) => a + b, 0);
  check("Área total equals Leads exactly (unfiltered)", areaSum === leads, `areaSum=${areaSum}, leads=${leads}`);
  check("Programa total equals Leads exactly (unfiltered)", programaSum === leads, `programaSum=${programaSum}, leads=${leads}`);
  check("Código total equals Leads exactly (unfiltered)", codigoSum === leads, `codigoSum=${codigoSum}, leads=${leads}`);

  const filteredPrograma = Core.programaCounts(filteredConsultas, programaMap);
  const filteredAreaSum = Object.values(filteredPrograma.byArea).reduce((a, b) => a + b, 0);
  const filteredProgramaSum = Object.values(filteredPrograma.byPrograma).reduce((a, b) => a + b, 0);
  const filteredCodigoSum = Object.values(filteredPrograma.byCodigo).reduce((a, b) => a + b, 0);
  check("Área total equals filtered Leads exactly (program-code filter)",
    filteredAreaSum === filteredConsultas.length);
  check("Programa total equals filtered Leads exactly (program-code filter)",
    filteredProgramaSum === filteredConsultas.length);
  check("Código total equals filtered Leads exactly (program-code filter)",
    filteredCodigoSum === filteredConsultas.length);
  check("a program-code filter produces a single-branch, coherent hierarchy slice",
    Object.keys(filteredPrograma.byCodigo).length === 1 &&
    Object.keys(filteredPrograma.byPrograma).length === 1 &&
    Object.keys(filteredPrograma.byArea).length === 1);

  const distinctCodigos = [...new Set(consultas.map((r) => r.programa_codigo))];
  check("every distinct programa_codigo used in consultas.csv has a programa mapping entry",
    distinctCodigos.every((c) => !!programaMap[c]));
  check("every código maps to exactly one programa (one-código-to-one-programa)",
    distinctCodigos.every((c) => typeof programaMap[c].programa === "string" && programaMap[c].programa.length > 0));
  check("every programa maps to exactly one área (one-programa-to-one-área)",
    distinctCodigos.every((c) => typeof programaMap[c].area === "string" && programaMap[c].area.length > 0));
  const programaToAreas = {};
  programaRows.forEach((r) => {
    programaToAreas[r.programa_nombre] = programaToAreas[r.programa_nombre] || new Set();
    programaToAreas[r.programa_nombre].add(r.area);
  });
  check("no programa maps to more than one área in the mapping fixture",
    Object.values(programaToAreas).every((set) => set.size === 1));
  check("no negative count at any Program Interest hierarchy level",
    Object.values(programaRollup.byArea).every((n) => n >= 0) &&
    Object.values(programaRollup.byPrograma).every((n) => n >= 0) &&
    Object.values(programaRollup.byCodigo).every((n) => n >= 0));
  check("no duplicate programa_codigo rows in the mapping fixture (unambiguous one-to-one join)",
    new Set(programaRows.map((r) => r.programa_codigo)).size === programaRows.length);

  section("no duplicated logic introduced (Increment 2 & 3 constraint)");
  const coreSource = html.slice(si, ei);
  function countOccurrences(src, pattern) {
    return (src.match(pattern) || []).length;
  }
  check("exactly one parseCsv implementation (no duplicated data model)",
    countOccurrences(coreSource, /function parseCsv\(/g) === 1);
  check("exactly one filterConsultas implementation (no duplicated filter logic)",
    countOccurrences(coreSource, /function filterConsultas\(/g) === 1);
  check("exactly one filterMatriculas implementation (no duplicated filter logic)",
    countOccurrences(coreSource, /function filterMatriculas\(/g) === 1);
  check("exactly one conversionRatio implementation (conversion formula stays mathematically consistent)",
    countOccurrences(coreSource, /function conversionRatio\(/g) === 1);
  check("exactly one dailyTrend implementation", countOccurrences(coreSource, /function dailyTrend\(/g) === 1);
  check("exactly one canalCounts implementation (no duplicated aggregation logic)",
    countOccurrences(coreSource, /function canalCounts\(/g) === 1);
  check("exactly one buildCanalMap implementation (no duplicated Canal-mapping logic)",
    countOccurrences(coreSource, /function buildCanalMap\(/g) === 1);
  check("exactly one programaCounts implementation (no duplicated aggregation logic)",
    countOccurrences(coreSource, /function programaCounts\(/g) === 1);
  check("exactly one buildProgramaMap implementation (no duplicated hierarchy-mapping logic)",
    countOccurrences(coreSource, /function buildProgramaMap\(/g) === 1);
  check("only one DashboardCore module defined (no second application/rendering framework)",
    countOccurrences(html, /const DashboardCore = \(function/g) === 1);
  check("only one nav click handler wired (no duplicated navigation infrastructure)",
    countOccurrences(html, /getElementById\("viewNav"\)\.addEventListener\("click"/g) === 1);
  check("no i18n/translation dictionary exists to duplicate (out of this contract's scope)",
    !/I18N|translations\s*=|data-i18n/i.test(html));
}

// ---------- summary ----------
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
