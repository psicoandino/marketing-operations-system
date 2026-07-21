# Marketing Operations System

Status: PROPOSAL — derived exclusively from versioned repository sources listed under Evidence. Not implemented. Not authoritative until reviewed.

## Purpose

Enable reliable marketing and communications operations — defining audiences, running campaigns, and reporting on results — even though prospect and contact information arrives through many disconnected operational systems. This requires that information to be held as one dependable, continuously current contact base, rather than reassembled by hand whenever it is needed. Consolidation is the means; dependable marketing operation is the purpose, and that purpose does not depend on which systems or tools currently perform the consolidation.

This is the smallest formulation supported convergently by `CASE-01.md` ("Purpose"), `01_context.md` ("Problem statement"), and `02_pipeline.md` ("Purpose"), and is consistent with the existence of a conformed `Persona` identity observed in `canonical-information-model.md`.

## Human outcome

The organization can treat marketing and communications operations — segmenting contacts, running campaigns, and monitoring results — as a standing, dependable capability rather than something rebuilt by hand each time it is needed. Visibility into leads and enrollments is something stakeholders can check on a recurring basis, rather than something assembled on request (`05_results.md`, `04_campaign-and-dashboard.md`).

This outcome is explicitly bounded: `05_results.md` prohibits stating any specific percentage reduction in manual work, conversion uplift, or revenue impact, and states these remain operator-verified operational outcomes, not independently measured impact. This contract inherits that boundary — no quantitative human-outcome claim beyond what is stated above is supported.

## Core business events

Ordered by business chronology: first the prospect relationship itself (interest, status, enrollment), then the marketing-operations cycle exercised on top of the resulting contact base (segmentation, campaign execution, response measurement, reporting).

| Event | Evidence |
|---|---|
| A prospect expresses interest in a program (**Consulta** created) | `02_pipeline.md` (extraction/inspection of inbound sources); `dashboard-audit.md` (Leads KPI, funnel); `canonical-information-model.md` (`FACT_CONSULTA`) |
| The prospect's status progresses (**Estado de consulta** transition) | `dashboard-audit.md` (8-state dimension); `canonical-information-model.md` (`DIM_ESTADO_CONSULTA`) |
| The prospect enrolls (**Matrícula** confirmed) | `02_pipeline.md` (consolidation scale); `dashboard-audit.md` (Matrícula KPI/line); `canonical-information-model.md` (`FACT_MATRICULA`) |
| An audience is defined for targeted outreach | `03_segmentation.md` (methods: business rules — primary; association rules; discontinued experimental Random Forest) |
| A campaign is executed to that audience | `04_campaign-and-dashboard.md` (mechanism: a GroupMail campaign, dispatched via SMTP) |
| The audience's engagement with the campaign is measured | `04_campaign-and-dashboard.md` (mechanism: GroupMail Insights tracking, manually downloaded and parsed) |
| Operational visibility is kept current for stakeholders, on a recurring (hourly) cadence | `04_campaign-and-dashboard.md`; `05_results.md` (mechanism: a Python process on a virtual machine updating Google Sheets, feeding Looker Studio) |

Random Forest reached experimental operational use and was later discontinued in favor of business-rule segmentation (`03_segmentation.md`); business rules are the confirmed long-term segmentation mechanism.

## Canonical entities

| Entity | Evidence |
|---|---|
| **Persona** (contact) | `01_context.md` / `02_pipeline.md` (consolidated contact base); `canonical-information-model.md` (`DIM_PERSONA`, conformed dimension); `dashboard-audit.md` (missing-entity #10 — confirmed to exist, not directly observable at dashboard grain) |
| **Consulta** (prospect inquiry) | `dashboard-audit.md`; `canonical-information-model.md` |
| **Estado de consulta** | `dashboard-audit.md`; `canonical-information-model.md` |
| **Matrícula** (enrollment) | `02_pipeline.md`; `dashboard-audit.md`; `canonical-information-model.md` |
| **Área / Programa / Versión-Código** (program hierarchy) | `03_segmentation.md` ("program interest", "area of interest"); `dashboard-audit.md` (confirmed 3-level cardinality); `canonical-information-model.md` |
| **Canal / Origen** (source/channel) | `02_pipeline.md` (multi-source input list); `dashboard-audit.md`; `canonical-information-model.md` |
| **Campaña** (dispatched campaign) | `04_campaign-and-dashboard.md`; `CASE-01.md`; `canonical-information-model.md` |

`Conversion %` is explicitly **not** an entity — `canonical-information-model.md` derives it as a query-time ratio, not a stored fact, and this is the documented reason it does not reconcile cleanly against the KPI in `dashboard-audit.md`.

## Canonical relationships

| Relationship | Evidence |
|---|---|
| Persona 1—n Consulta | `dashboard-audit.md`; `canonical-information-model.md` |
| Persona 1—n Matrícula | `02_pipeline.md`; `canonical-information-model.md` |
| Área 1—n Programa 1—n Versión/Código | `dashboard-audit.md` (confirmed cardinality 7→78→139); `03_segmentation.md`; `canonical-information-model.md` |
| Canal 1—n Origen | `dashboard-audit.md`; `canonical-information-model.md` |
| Versión 1—n Consulta; Versión 1—n Matrícula | `dashboard-audit.md` (`programa_codigo` filter scope); `canonical-information-model.md` |
| Consulta n—1 Estado de consulta | `dashboard-audit.md`; `canonical-information-model.md` |
| Campaña 1—n Campaña_Métrica (engagement) | `04_campaign-and-dashboard.md`; `canonical-information-model.md` |

## Information flow

**As business information flow, independent of any particular system:**

1. Prospect and contact information originates across many independent operational systems and channels, in whatever shape each of them produces it.
2. That information is unified into one dependable contact base before it is relied on for any operational decision.
3. The unified base is the foundation from which audiences are defined for outreach.
4. Defined audiences are the basis on which campaigns are executed.
5. What audiences do in response to a campaign is measured and folded back into the unified base and into reporting.
6. Stakeholders draw on this same unified base for recurring operational visibility, rather than each requesting a fresh reconstruction of it.

**As currently implemented** (the specific mechanism behind each step above — this is the layer expected to change over time without altering the business flow it serves):

1. Data is extracted from disconnected operational sources (SQL queries, database access, file processing) — `02_pipeline.md`.
2. Each source is inspected for columns, types, identifiers, anomalies — `02_pipeline.md`.
3. Records are cleaned and normalized into common attributes and categories — `02_pipeline.md`.
4. Records are validated to exclude malformed/incomplete entries before consolidation — `02_pipeline.md`.
5. Records are deduplicated to prevent the same contact from being counted multiple times — `02_pipeline.md`.
6. Records are consolidated into the central `Persona`/contact structure — `02_pipeline.md`.
7. Segments/audiences are constructed from the consolidated base using business rules (primary), association rules, or the discontinued experimental Random Forest — `03_segmentation.md`.
8. Campaigns are defined, loaded with content and recipient base, and dispatched via GroupMail/SMTP — `04_campaign-and-dashboard.md`.
9. Post-dispatch engagement is tracked via GroupMail Insights, then manually downloaded and parsed into internal reporting structures — `04_campaign-and-dashboard.md`.
10. A Python process on a virtual machine updates Google Sheets hourly, which supplies Looker Studio — `04_campaign-and-dashboard.md`; `05_results.md`.

## User views

| View | Evidence |
|---|---|
| Consolidated contact base (internal; not directly end-user-facing) | `01_context.md`; `02_pipeline.md` |
| Marketing/lead operations dashboard (Looker Studio) — the screen audited in `dashboard-audit.md` | `dashboard-audit.md`; `canonical-information-model.md`; `04_campaign-and-dashboard.md`; `05_results.md` |
| A distinct campaign-engagement reporting view (opens/clicks) may exist but was not observed in the audited screen | `dashboard-audit.md` (§5, §10 — "not visible in this screen"); `04_campaign-and-dashboard.md` (tracking/metrics exist as a process) — **unconfirmed as a separate view; see Open questions.** |

## Evidence

| Contract section / claim | Supporting file(s) |
|---|---|
| Purpose statement | `CASE-01.md`, `01_evidence/01_context.md`, `01_evidence/02_pipeline.md` |
| Human outcome and its explicit boundary | `01_evidence/05_results.md` |
| Core business events (Consulta, Estado, Matrícula) | `01_evidence/02_pipeline.md`, `dashboard-audit.md`, `canonical-information-model.md` |
| Core business events (segmentation methods) | `01_evidence/03_segmentation.md` |
| Core business events (campaign dispatch, engagement tracking, reporting refresh) | `01_evidence/04_campaign-and-dashboard.md`, `01_evidence/05_results.md` |
| Canonical entities and relationships | `dashboard-audit.md`, `canonical-information-model.md`, cross-checked against `01_evidence/02_pipeline.md` and `01_evidence/03_segmentation.md` for the program/channel hierarchy |
| Information flow | `01_evidence/02_pipeline.md`, `01_evidence/04_campaign-and-dashboard.md`, `01_evidence/05_results.md` |
| User views | `dashboard-audit.md`, `canonical-information-model.md`, `01_evidence/04_campaign-and-dashboard.md` |
| Open questions | `dashboard-audit.md` (§ Anomalies and open questions), `canonical-information-model.md` (entities/relationships marked pipeline-only or inferred), `01_evidence/02_pipeline.md` (§ Evidence limits) |

Note on source paths: this proposal was requested to derive from `01_evidence/source/01_context.md` through `05_results.md`; the versioned repository currently holds these five files at `01_evidence/01_context.md` through `01_evidence/05_results.md` (no `source/` subdirectory contains them — `01_evidence/source/` holds a separate monolith file). Content was read from the existing `01_evidence/*.md` location under the assumption this is the intended target; no file was moved or modified to reconcile the path difference.

## Open questions

Carried forward from `dashboard-audit.md` and `canonical-information-model.md`, not resolved here:

1. The funnel-state sum (~5,186) does not equal the Leads KPI (5,085) — cause unconfirmed (`dashboard-audit.md`).
2. The Conversion % numerator/denominator does not reconcile exactly against visible KPIs — composition unconfirmed (`dashboard-audit.md`; `canonical-information-model.md`).
3. A negative channel count ("Rebold", -4) is unexplained; an exclusion/removal-netting mechanism is a plausible but unconfirmed cause (`dashboard-audit.md`; `canonical-information-model.md`).
4. Person names appear inside what should be a closed channel/origin field, indicating an unmodeled or conflated **Ejecutivo** (staff) entity — not included as a canonical entity above for lack of direct evidence in `CASE-01.md`/`01_evidence/*.md`, but flagged as latent (`dashboard-audit.md`; `canonical-information-model.md`).
5. The exact derivation rule for the "Canal" channel grouping (labeled a composite/complex key on the dashboard) is not confirmed (`dashboard-audit.md`; `canonical-information-model.md`).
6. Whether campaign-engagement metrics (GroupMail Insights) are surfaced on the same dashboard or a separate, unobserved view is unconfirmed (`dashboard-audit.md`; `04_campaign-and-dashboard.md`).
7. Exact validation and deduplication rules in the historical production system have not been recovered — only their existence and intent are confirmed (`01_evidence/02_pipeline.md`, § Evidence limits).

## Excluded from this contract (evidence threshold not met)

- **Webinar / Evento / Actividad entities** — `02_pipeline.md` names "event forms" and "StreamYard" only as raw input labels, not as a modeled entity of the contact base; no `01_evidence/*.md` file or `CASE-01.md` describes a webinar/event registration entity. `canonical-information-model.md` itself marks these "(pipeline-only)", sourced from the recovered notebook, which is outside this contract's permitted source set.
- **Exclusión/Remover entity** — same reasoning: marked "(pipeline-only)" and unconfirmed even in the permitted sources; retained only as an open-question hypothesis, not as a canonical entity.
- **Ejecutivo entity** — recovered-notebook-only per `canonical-information-model.md`; no `01_evidence/*.md` file names an executive/salesperson entity. Retained only as an open question (item 4 above).
- **Campaña_Métrica as a distinct user-facing view** — the underlying event (engagement tracked) is confirmed core business event material via `04_campaign-and-dashboard.md`, but its presentation as a *separate dashboard view* is not confirmed by `dashboard-audit.md`, which observed no engagement metrics on the audited screen. Kept as an open question, not asserted as a view.
