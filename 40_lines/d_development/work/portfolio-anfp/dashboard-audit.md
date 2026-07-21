# Functional Reverse-Engineering Audit — Marketing Operations Dashboard

Scope note: this is analysis only, grounded in the screenshot plus the recovered/sanitized notebook (`01_evidence/recovered/notebook_resp.SANITIZED.md`) and the Case 01 evidence atoms. No implementation, no UI design. Where the screenshot shows something the recovered evidence does not explain, it's flagged as inferred or as a gap rather than stated as fact.

---

## 1. KPIs (top-level scorecards)

| KPI | Value shown | Notes |
|---|---|---|
| **Leads** | 5,085 | Total prospect/contact count for the filtered period. Does not exactly equal the sum of the funnel-state table below it (~5,186) — see Anomalies. |
| **Conversion** | 4.18% | Presumed `Matriculado ÷ Leads`, but `217 / 5,085 = 4.27%`, not an exact match — numerator/denominator composition is not confirmed from the screenshot alone (see Anomalies). |

Both scorecards react to the two global filters (program code, date range), consistent with standard aggregate-metric behavior.

## 2. Dimensions

| Dimension | Cardinality shown | Values / examples |
|---|---|---|
| **Estado de consulta** (prospect status) | 8 states | Interesado, Desechado, Gestionado, Matriculado, Retracto Matrícula, Evaluado, Matrícula en Proceso, Reservar Matrícula |
| **Fecha** (day) | 31 (Aug 2025) | Daily grain, rolled up to the filtered month |
| **Canal / llave_compleja** | 6 buckets | IProspect, Convierta, Admision, UE (int), UE (web), Rebold |
| **Formulario / origen** | 51 distinct values | ip_fb, Convierta, Contacto Web, convierta_google, convierta_meta, ip_sc, ip_prog, ip_scg, plus at least two individual person names |
| **Programa** (course name) | 78 distinct | e.g. "Diploma en Planificación, Control y Gestión" |
| **Código** (program/version code) | 139 distinct | e.g. DIGO25CL2AV, DEPT25RM2AH, DPCG25CL3AO |
| **Área** | 7 distinct | Control de Gestión, Sistemas y Tecnologías de Información, Contabilidad y Auditoría, Business Analytics, Tributación, Gestión de Operaciones y Procesos, Gestión en Educación |

## 3. Hierarchies

- **Program hierarchy (3 levels):** Área (7) → Programa (78) → Código/Versión (139). Confirmed by cardinality nesting (each área contains several programas; each programa has ~1.8 código variants on average — cohort/campus/modality instances). This matches the recovered `prg_programa` / `ver_versiones` relationship (`programa` = course, `codigo_trazabilidad` = a specific offering/version) and the `programa_area` field seen in the Fénix-vs-intranet reconciliation script.
- **Channel hierarchy (2 levels):** Canal/`llave_complex` (6 broad buckets) → Formulario/origen (51 granular tags). `convierta_google` and `convierta_meta` look like sub-channels of the `Convierta` bucket, suggesting the granular field is itself composite (platform + medium), consistent with the "complex key" label on the parent chart.
- **Time hierarchy (implicit):** Day → Month (the active filter period). No week/quarter/year rollup is visible, though the chart's secondary row of small numbers under each date (the "Matrículas" series) confirms daily grain is the base fact, not pre-aggregated.
- **Status hierarchy is NOT a clean funnel:** the 8 states read like nodes of a state machine (with terminal/branch states: Desechado, Retracto Matrícula) rather than strict sequential funnel steps. The bar order in the screenshot implies a designer's intended flow (Interesado → Gestionado → Evaluado → Matriculado), but the data itself is a status snapshot, not stage-transition counts.

## 4. Filters

| Filter | Type | Scope |
|---|---|---|
| `programa_codigo` | Single-select dropdown | Global — filters every visual on the page (Looker Studio page-level filter convention) |
| Date range (Aug 1–31, 2025) | Date range picker | Global — same scope |

No per-chart filters, no visible segment/audience filter, no channel filter distinct from the dropdown. Both filters are almost certainly implemented as Looker Studio "page filter" controls tied to `programa_codigo` and `registro_fecha`/`fecha_matricula`.

## 5. Inferred data sources

| Source (per Case 01 evidence) | What in this dashboard likely comes from it |
|---|---|
| **Fénix (SQL Server)** — `pros_prospecto` / `pros_estado` | Estado funnel (8 states), Leads KPI |
| **Fénix** — `ver_versiones` / `prg_programa` | Programa / Código hierarchy |
| **Fénix** — `viaje_viajes` / `viaje_alumnos` | Matrícula line series, Matriculado state |
| **Intranet (MariaDB)** — product/program catalog | Área field (only appears reconciled against Fénix in the recovered "playground" diff script, not in the primary enrollment query) |
| **Intranet** — `contacto_remover` (exclusion list) | Plausible explanation for the negative Rebold count (see Anomalies) — not confirmed |
| **Website / webinar / SEM agency forms** | Formulario/origen granular values (ip_fb, ip_sc, convierta_google, convierta_meta, Contacto Web) map directly to the multi-source intake described in `02_pipeline.md` |
| **GroupMail / GroupMail Insights** | **Not visible in this screen.** No open/click/campaign-engagement metric appears here — this looks like a sibling dashboard to the one described in `04_campaign-and-dashboard.md`, not the same page |
| **Python VM → Google Sheets → Looker Studio** | Delivery mechanism for the whole page (visual language, paginated ranked tables, filter chips are characteristic Looker Studio elements) |

## 6. Derived metrics

- **Conversion %** — computed, not stored; numerator/denominator not confirmed (see Anomalies).
- **`programa_sigla`** (recovered function: prefix of `programa_codigo` before the first digit pair) is the plausible join key that lets 139 codes roll up to 78 program names and 7 areas — this is exactly the derivation documented in the sanitized notebook, now visible operating one layer downstream in a BI tool.
- **`llave_complex`** — explicitly named as a composite/derived key in the chart title, not a raw column. Likely a concatenation or CASE-mapping of raw origin fields into 6 marketing-channel buckets, distinct from and coarser than the raw `Formulario (origen)` field.
- **Daily "Consultas Generadas"** — a count aggregate of inbound prospect records per day, feeding the dual-axis chart.

## 7. Business questions this dashboard answers

1. How many leads came in this period, and what share converted to enrollment?
2. Where in the prospect lifecycle is volume concentrated — new interest, active management, or drop-off (Desechado)?
3. Which channel (Canal) and which specific form/source (Formulario/origen) produced the leads?
4. Do lead-generation spikes correlate with enrollment spikes, and when did they occur (visible co-spikes around Aug 11–12 and Aug 18–19)?
5. Which academic area, program, and specific program version/cohort is attracting the most interest this month?
6. Is a given program code (via the `programa_codigo` filter) performing above or below the portfolio average?
7. Are there enrollment-adjacent risk states worth operational attention (Retracto Matrícula = withdrawals, Matrícula en Proceso = stalled in-progress enrollments)?

## 8. Interactions visible or strongly implied

- Global filter changes (`programa_codigo`, date range) re-render every visual.
- Pagination controls on all four ranked tables/charts (`1–51/51`, `1–78/78`, `1–100/139`, `1–7/7`) — these are scrollable lists, not fixed top-N views.
- Sortable columns (the `(n) ▾` header convention is a Looker Studio sort-order control).
- Legend toggle on the dual-axis line chart (standard Looker Studio behavior: clicking "Consultas Generadas" or "Matrículas" in the legend hides that series) — not directly evidenced by the screenshot but standard for this chart type.
- Cross-filtering between charts (clicking a bar in `llave_complex` or a row in `Formulario`, `Programa`, `Código`, or `Área` would typically filter the rest of the page) — inferred from the platform, not confirmed pixel-by-pixel.

## 9. Relationships between entities

- **Área 1 — n Programa 1 — n Código**: confirmed by cardinality (7 → 78 → 139).
- **Canal 1 — n Formulario/origen**: confirmed by the `convierta_google` / `convierta_meta` sub-tags nesting under `Convierta`.
- **Prospect (consulta) — Enrollment (matrícula)**: one prospect can transition into (at most) one enrollment record; the dashboard blends a prospect-status fact with an enrollment-date fact, joined by program code and date — this requires at least two underlying fact tables unioned or joined, not one flat export.
- **Formulario/origen — Executive (unmodeled)**: two rows in the Formulario table are person names rather than system tags, implying a hidden relationship between "who logged this lead" and "where it came from" that the current schema does not cleanly separate (see Missing Entities).

## 10. Missing entities likely existing but not visible

- **A time/calendar dimension table** — the chart's daily-to-monthly rollup and the filter's date range both imply one, even though no explicit date-hierarchy control is shown.
- **An Executive/Salesperson entity** — recovered from the Fénix query (`consulta_ejecutivo`, concatenated first/last name) but not shown as a dimension here; the two leaked names in the origin field are indirect evidence it exists and is currently *conflated* with the source-of-lead field rather than modeled separately.
- **An Exclusion/Removal entity** (`contacto_remover`, recovered in the notebook) — plausible but unconfirmed explanation for the negative Rebold value; if real, this dashboard nets removals into channel counts rather than showing them as their own metric.
- **A Campaign/Vendor entity** — `IProspect`, `Convierta`, `Rebold` read as named external platforms or agencies (consistent with "SEM agency files" in `02_pipeline.md`), but no campaign-level detail (spend, campaign name, date range) is present in this view; if it exists, it lives elsewhere.
- **An Engagement/Metrics entity** (GroupMail Insights: opens, clicks) — documented in Case 01 evidence as part of the operator's scope, but entirely absent from this screen, suggesting a separate dashboard page or tab not captured here.
- **A Contact/Person master record** — this view is pre-aggregated; the underlying `persona_*` contact table (the level the vertical-slice reconstruction operates on) is not directly observable, only its rollups.

---

## Anomalies and open questions (audit findings, not fixes)

1. **Funnel-state sum ≠ Leads KPI** (~5,186 vs 5,085) — either a different base filter, de-duplication difference, or an omitted 9th state not shown in the visible bar list.
2. **Conversion 4.18% doesn't reconcile exactly to 217/5,085** — the numerator may include `Reservar Matrícula` and/or `Matrícula en Proceso`, or the metric may use a trailing/all-time base rather than the filtered month. Not resolvable from the screenshot alone.
3. **Negative lead count for "Rebold" (-4)** — a count metric going negative is a strong signal of either a correction/removal netting mechanism or a raw data-entry defect being faithfully surfaced rather than clamped.
4. **Two person names inside a system-origin field** — a data-quality/modeling gap: manual entry or a missing join is letting an executive-name value leak into what should be a closed set of channel tags.
5. **`Código` (139) roughly 1.8× `Programa` (78)** — confirms the hierarchy is real, but the exact rule for how many code-versions a program can have per period isn't visible here (would need the underlying catalog, as in the recovered notebook's product-reconciliation script).
