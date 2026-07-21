# Dashboard Contract

Status: PROPOSAL — derived from versioned evidence. Not implemented. Not authoritative until reviewed.

## Purpose

Make visible the operational evolution of a prospect from acquisition to enrollment.

This dashboard is the second public view of the Marketing Operations System defined in `SYSTEM_CONTRACT_PROPOSAL.md` — specifically an instance of the "Marketing/lead operations dashboard (Looker Studio)" view named there (`SYSTEM_CONTRACT_PROPOSAL.md`, § User views), scoped to the prospect-lifecycle events that system contract orders first: interest, status progression, enrollment (`SYSTEM_CONTRACT_PROPOSAL.md`, § Core business events).

## Primary Question

How does a prospect evolve through the operational system?

## Secondary Questions

- What is happening in marketing operations right now — how many leads, how many enrollments, over what period? (`dashboard-audit.md`, § 1, § 7)
- Where are prospects entering from — which channel, which granular source/form? (`dashboard-audit.md`, § 2, § 7)
- Which part of the program hierarchy (área / programa / versión-código) is attracting interest? (`dashboard-audit.md`, § 2, § 7; `canonical-information-model.md`, § 1)
- Is a given program version performing differently once the dashboard is filtered to it? (`dashboard-audit.md`, § 4)

This question set is explicitly secondary to the primary question above — it describes the operation in aggregate, not the individual prospect's path through it.

## User

Not separately specified by the three permitted sources. `SYSTEM_CONTRACT_PROPOSAL.md` names the audience only implicitly, as whoever draws "recurring operational visibility" from the system (`SYSTEM_CONTRACT_PROPOSAL.md`, § Human outcome) and as "stakeholders" receiving refreshed visibility (`SYSTEM_CONTRACT_PROPOSAL.md`, § Core business events, § Information flow). No role, team, or seniority is confirmed. Left as an open item — see Exclusions.

## Views

Organized around the prospect lifecycle, not around a collection of charts. Each view answers a stage of the Primary Question before the Secondary Questions are addressed.

1. **Lifecycle status view** — where prospects currently sit across the status set (Interesado, Desechado, Gestionado, Matriculado, Retracto Matrícula, Evaluado, Matrícula en Proceso, Reservar Matrícula). This is the direct answer to the Primary Question at a point in time. (`dashboard-audit.md`, § 2, § 3)
2. **Acquisition-to-enrollment trend view** — leads generated and enrollments confirmed over time, at daily grain rolling up to the filtered period. This is the direct answer to the Primary Question across time. (`dashboard-audit.md`, § 1, § 2, § 3)
3. **Origin view** — where prospects entering the lifecycle came from, at both the channel level and the granular form/source level. Supports the secondary "where are prospects entering from" question and is a precondition for understanding the lifecycle's inputs. (`dashboard-audit.md`, § 2, § 9)
4. **Program-interest view** — the área / programa / versión-código hierarchy prospects are entering the lifecycle for. Supports the secondary program-interest question. (`dashboard-audit.md`, § 2, § 3, § 9; `canonical-information-model.md`, § 1, § 2)

No campaign-engagement view is included — see Exclusions.

## Canonical Metrics

Named with confirmed calculation status, per `dashboard-audit.md` and `canonical-information-model.md`.

| Metric | Calculation status | Notes |
|---|---|---|
| Leads (count of Consulta records in period) | **confirmed count** | `dashboard-audit.md`, § 1 |
| Status-state counts (one count per Estado de consulta value) | **confirmed count** | `dashboard-audit.md`, § 2, § 3 |
| Enrollments / Matrículas (daily count) | **confirmed count** | `dashboard-audit.md`, § 1, § 2 |
| Conversion % | **unresolved formula** | Shown as 4.18%, but `217 / 5,085 = 4.27%` — the numerator/denominator do not reconcile from the evidence available. `canonical-information-model.md` treats it as a derived ratio, not a stored fact, computed at query time over two facts (`FACT_MATRICULA` ÷ `FACT_CONSULTA`) that do not share identical dimensional scope — offered as the most likely explanation, not a resolution. (`dashboard-audit.md`, Anomalies #2; `canonical-information-model.md`, § 2) |
| Origin/channel counts (Canal, Formulario/Origen) | **confirmed count**, with one **unresolved formula** — see below | Row-level counts are confirmed; the composite "Canal" bucket is explicitly a derived/composite key, and its exact derivation rule is not confirmed (`dashboard-audit.md`, § 6, Anomalies #5; `canonical-information-model.md`, § 3 "Canal") |
| Program-hierarchy counts (Área, Programa, Código) | **confirmed count** | `dashboard-audit.md`, § 2 |

## Canonical Dimensions

| Dimension | Status | Notes |
|---|---|---|
| Estado de consulta (8 values) | Confirmed dimension. **Not confirmed as a strictly linear funnel.** The evidence reads it as a status/state set with terminal and reversible states (Desechado, Retracto Matrícula), not a sequential stage-by-stage progression. (`dashboard-audit.md`, § 3: "Status hierarchy is NOT a clean funnel") | Do not present as a funnel visualization implying strict sequential flow unless a future source confirms transition ordering. |
| Fecha (day, rolling to filtered month) | Confirmed dimension | `dashboard-audit.md`, § 2, § 3 |
| Canal → Formulario/Origen (2-level hierarchy) | Confirmed hierarchy; derivation of the top level unconfirmed | `dashboard-audit.md`, § 3, § 6 |
| Área → Programa → Versión/Código (3-level hierarchy) | Confirmed hierarchy | `dashboard-audit.md`, § 3; `canonical-information-model.md`, § 1, § 2 |

## Interactions

Distinguishing confirmed dashboard behavior from inferred platform behavior, per `dashboard-audit.md`, § 8.

**Confirmed:**
- A `programa_codigo` filter and a date-range filter, both global in scope (`dashboard-audit.md`, § 4, § 8).
- Pagination on ranked lists (`dashboard-audit.md`, § 8).
- Sortable columns (`dashboard-audit.md`, § 8).

**Inferred platform behavior, not directly evidenced:**
- Legend toggling on the trend view (standard for this chart type on the inferred platform, not confirmed pixel-by-pixel) (`dashboard-audit.md`, § 8).
- Cross-filtering between views on selection (standard for the inferred platform, not confirmed) (`dashboard-audit.md`, § 8).

This contract does not reconstruct the audited platform literally; it specifies confirmed and inferred interaction *behavior*, not a specific vendor's chart or control implementation.

## Evidence

| Contract section / claim | Supporting file(s) |
|---|---|
| Purpose, Primary Question | Supplied directly by this task's derivation constraints; positioned within the system by `SYSTEM_CONTRACT_PROPOSAL.md` (§ User views, § Core business events) |
| Secondary Questions | `dashboard-audit.md`, § 7 ("Business questions this dashboard answers") |
| User | `SYSTEM_CONTRACT_PROPOSAL.md`, § Human outcome, § Core business events (no independent confirmation found; treated as unconfirmed) |
| Views (lifecycle status, trend, origin, program-interest) | `dashboard-audit.md`, § 1–§ 3, § 7, § 9; `canonical-information-model.md`, § 1, § 2 |
| Canonical Metrics | `dashboard-audit.md`, § 1, § 6, Anomalies #2 and #5; `canonical-information-model.md`, § 2 |
| Canonical Dimensions | `dashboard-audit.md`, § 2, § 3; `canonical-information-model.md`, § 1, § 2 |
| Interactions | `dashboard-audit.md`, § 8 |
| Exclusions | `dashboard-audit.md`, § 5, § 10, Anomalies; `canonical-information-model.md` (entities marked pipeline-only); `SYSTEM_CONTRACT_PROPOSAL.md`, § Open questions, § Excluded from this contract |

## Exclusions

Capabilities, metrics, entities, and views considered and not included, with reasons:

- **Campaign-engagement metrics/view (opens, clicks, GroupMail Insights)** — `dashboard-audit.md` explicitly states no such metric is visible in the audited screen (§ 5, § 10), and `SYSTEM_CONTRACT_PROPOSAL.md` retains this as an open question rather than a confirmed view. **Not asserted as visible in the audited dashboard; excluded from Views on that basis, per instruction.**
- **A resolved Conversion % formula** — the evidence does not reconcile the numerator/denominator; inventing one would fabricate a metric definition not supported by the sources. Retained as an unresolved formula (see Canonical Metrics), not silently resolved.
- **A resolved Leads-vs-status-total reconciliation** — the ~5,186 status-sum vs 5,085 Leads mismatch is not explained by any of the three sources. Not resolved here; carried as an evidence boundary.
- **A resolved explanation for the negative "Rebold" channel count** — an exclusion/removal-netting mechanism is the best available hypothesis in `canonical-information-model.md`, but it is explicitly unconfirmed. Not asserted as fact; carried as an evidence boundary.
- **A resolved explanation for person names inside the origin field** — indicates a latent, unmodeled `Ejecutivo` entity per `SYSTEM_CONTRACT_PROPOSAL.md` (§ Open questions #4) and `canonical-information-model.md`, but no source confirms the mechanism. Not resolved; carried as an evidence boundary.
- **A confirmed derivation rule for the "Canal" channel grouping** — labeled a composite/complex key on the audited dashboard; no source specifies its construction. Not invented; carried as an evidence boundary (see Canonical Metrics).
- **A strictly linear/sequential funnel presentation of Estado de consulta** — the evidence characterizes this as a status set with terminal and reversible states, not a confirmed sequential funnel. Excluded per explicit instruction and per `dashboard-audit.md`, § 3.
- **A named user/role/team** — no source specifies who uses this dashboard beyond "stakeholders"/"the operator/organization." Excluded as an invented detail; left open (see User, and Operator judgment below).
- **`Ejecutivo`, `Webinar`/`Evento`/`Actividad`, `Exclusión`/`Remover` as canonical entities or dimensions of this dashboard** — `SYSTEM_CONTRACT_PROPOSAL.md` already excludes these from the system contract itself for lack of evidence within the permitted source set; this dashboard contract inherits that exclusion rather than reopening it.
- **Any interaction beyond filter, pagination, sort (confirmed) and legend/cross-filter (inferred platform behavior)** — no source evidences drill-down, export, annotation, alerting, or scheduled-delivery interactions at the dashboard level; not invented.
- **A literal reconstruction of the audited Looker Studio screen** — excluded per explicit instruction; this contract specifies confirmed behavior and structure, not a pixel-level or vendor-specific reconstruction.
