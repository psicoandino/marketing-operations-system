# Dashboard Build Contract

Status: PROPOSAL — derived exclusively from `DASHBOARD_CONTRACT_PROPOSAL.md`, `SYSTEM_CONTRACT_PROPOSAL.md`, `dashboard-audit.md`, and `canonical-information-model.md`. Not implemented. No HTML, UI design, or code is produced by this document.

## Goal

Build a dashboard that makes visible the operational evolution of a prospect from acquisition to enrollment — answering "how does a prospect evolve through the operational system?" as its primary question, with aggregate marketing-operations questions ("what is happening right now") addressed as secondary. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Purpose, § Primary Question, § Secondary Questions)

## Success Criteria

A build satisfies this contract when:

1. A reviewer can, without narration, identify where prospects currently stand across the status set, before noticing any aggregate volume metric. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Purpose, § Views #1)
2. Every metric on the dashboard is presented with an explicit, internally consistent formula computed against this build's own synthetic dataset — confirmed count or confirmed derived ratio, never an unresolved formula presented as if settled. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Canonical Metrics, as revised for a synthetic reconstruction — see Data Requirements)
3. The four required views are all present and each is traceable to the view list below; no additional view is present unless listed under Future Extensions. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Views)
4. The Estado de consulta dimension is presented as a status/state set, not as a strictly sequential funnel implying guaranteed forward progression. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Canonical Dimensions; § Exclusions)
5. The five historical anomalies described in `dashboard-audit.md` and carried as evidence boundaries in `DASHBOARD_CONTRACT_PROPOSAL.md` do not appear as defects in this build's synthetic dataset — the synthetic numbers reconcile exactly — while the dashboard visibly discloses that the historical recovered evidence contains these anomalies, unresolved, so the reviewer is never left thinking the historical system was this clean. Silently reproducing the anomalies and silently claiming they are resolved are both prohibited; the only correct treatment is a clean synthetic dataset plus a visible disclosure. (`dashboard-audit.md`, § Anomalies and open questions; `DASHBOARD_CONTRACT_PROPOSAL.md`, § Exclusions)

## Required Views

Mandatory — each maps directly to `DASHBOARD_CONTRACT_PROPOSAL.md`, § Views:

1. **Lifecycle status view** — current distribution of prospects across the 8 Estado de consulta values (Interesado, Desechado, Gestionado, Matriculado, Retracto Matrícula, Evaluado, Matrícula en Proceso, Reservar Matrícula).
2. **Acquisition-to-enrollment trend view** — leads generated and enrollments confirmed over time, at daily grain, rolling up to the filtered period.
3. **Origin view** — where entering prospects came from, at the Canal (channel) level and the granular Formulario/Origen level.
4. **Program-interest view** — the Área → Programa → Versión/Código hierarchy prospects are entering for.

No fifth view (in particular, no campaign-engagement view) is required or permitted by this contract. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Views, § Exclusions)

## Required Interactions

Mandatory, per `DASHBOARD_CONTRACT_PROPOSAL.md`, § Interactions ("Confirmed"):

1. A `programa_codigo` filter, global in scope (affects all four required views).
2. A date-range filter, global in scope (affects all four required views).
3. Pagination on any ranked list long enough to need it (Origin view, Program-interest view).
4. Sortable columns on ranked lists.

Not mandatory — the source contract lists these only as "inferred platform behavior," not confirmed requirements, so they may be included or omitted at build discretion without violating this contract:

- Legend toggling on the trend view.
- Cross-filtering between views on selection.

No interaction beyond this list (drill-down, export, annotation, alerting, scheduled delivery) is in scope. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Exclusions)

## Required Metrics

Each metric must be built and labeled exactly at the calculation status given — this status is a build requirement, not a presentational suggestion. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Canonical Metrics)

| Metric | Required calculation status (this build) | Build requirement |
|---|---|---|
| Leads | confirmed count | Count of Consulta records in the filtered period. |
| Status-state counts | confirmed count | One count per Estado de consulta value, in the filtered period. Must sum exactly to the Leads count for the same filtered scope — see Data Requirements. |
| Enrollments / Matrículas | confirmed count | Daily count of confirmed enrollments in the filtered period. |
| Conversion % | confirmed derived ratio (synthetic) | Explicit formula, applied consistently: Conversion % = Matrícula count ÷ Leads count, both computed over the identical filtered scope. Must reconcile exactly in this build's synthetic dataset. The historical dashboard's Conversion % did not reconcile this way and remains an unresolved formula in `dashboard-audit.md` — this build's clean formula is a synthetic-demo convention and must not be presented as having resolved that historical finding. |
| Canal (channel) counts | confirmed count, composite derivation explicit (synthetic) | Row-level counts are a build requirement. The bucketing of origin values into Canal groups must follow an explicit, documented synthetic mapping table (see Data Requirements) — disclosed as a demo convention, not asserted as the historical production business rule, which remains unconfirmed per `dashboard-audit.md`. |
| Formulario/Origen counts | confirmed count | Row-level counts by granular origin value. Every synthetic origin value must be a system/channel-style tag; none may be a person's name — see Data Requirements. |
| Program-hierarchy counts (Área, Programa, Código) | confirmed count | Row-level counts at each of the three hierarchy levels. |

No metric outside this table may be added. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Canonical Metrics — this is the complete, closed list; calculation statuses revised for a synthetic reconstruction per the decision recorded in Data Requirements)

## Required Dimensions

| Dimension | Build requirement |
|---|---|
| Estado de consulta (8 values) | Must be built as a status/state set. Must not be built or visually encoded as a strictly ordered, sequential funnel unless a future source confirms transition ordering — see Explicit Non-Goals. Counts across all 8 values must sum exactly to the Leads count in this build's synthetic dataset. |
| Fecha (day, rolling to filtered period) | Daily grain is the required base grain for the trend view. |
| Canal → Formulario/Origen (2-level hierarchy) | Both levels are required dimensions. Unlike the historical, unconfirmed derivation, this build's Canal level must be produced by an explicit, documented synthetic mapping from Formulario/Origen values (see Data Requirements), disclosed as a demo convention rather than a reproduction of historical business logic. |
| Área → Programa → Versión/Código (3-level hierarchy) | All three levels are required dimensions for the Program-interest view. |

(`DASHBOARD_CONTRACT_PROPOSAL.md`, § Canonical Dimensions — this is the complete, closed list)

## Data Requirements

**Decision governing this section:** this build is a professional portfolio reconstruction using synthetic, internally coherent data — not a re-enactment of the historical system's defects. The five anomalies documented in `dashboard-audit.md` (§ Anomalies and open questions) and carried as evidence boundaries in `DASHBOARD_CONTRACT_PROPOSAL.md` (§ Exclusions) remain true statements about the *recovered historical evidence* and must stay documented there, unchanged. They must **not** be reproduced as defects in this build's synthetic dataset, and this build must **not** claim to have resolved them for the historical system. Both documentation sources (`dashboard-audit.md`, `DASHBOARD_CONTRACT_PROPOSAL.md`) are read-only from this build's perspective and are not modified by this contract.

Per anomaly, the synthetic-build requirement is:

1. **Leads vs. status-total mismatch** — historically unresolved (~5,186 vs. 5,085 in the audited instance; `dashboard-audit.md`, Anomaly #1). In this build, the sum of the 8 status-state counts must equal the Leads count exactly, for any filtered scope. This reconciliation is a property of the synthetic dataset, not a claim about the historical mismatch, which remains open in `dashboard-audit.md`.
2. **Conversion % mismatch** — historically unresolved (`dashboard-audit.md`, Anomaly #2). In this build, Conversion % must be computed by the explicit formula given in Required Metrics (Matrícula count ÷ Leads count, same filtered scope) and must reconcile exactly against the displayed Leads and Matrícula counts. This does not resolve or explain the historical figure, which remains open in `dashboard-audit.md`.
3. **Negative channel count** — historically unresolved (the "Rebold" anomaly; `dashboard-audit.md`, Anomaly #3). In this build, no synthetic origin/channel row may have a negative count. This does not explain the historical negative value, which remains open in `dashboard-audit.md`.
4. **Names inside the origin field** — historically unresolved (`dashboard-audit.md`, Anomaly #4). In this build, every synthetic origin/Formulario value must be a system- or channel-style tag; none may be a person's name. This does not explain the historical name leakage, which remains open in `dashboard-audit.md`.
5. **Unknown Canal derivation** — historically unresolved (`dashboard-audit.md`, Anomaly #5). In this build, the mapping from Formulario/Origen values to Canal groups must be an explicit, documented synthetic mapping table, fixed and internally consistent, and disclosed to the reviewer as a demo convention. This mapping is not asserted as the historical production rule, which remains unconfirmed in `dashboard-audit.md`.

**Required disclosure:** the built dashboard must visibly state, in a location a reviewer will naturally encounter (not hidden in a separate document), that (a) all data shown is synthetic, and (b) the five anomalies above were present in the historical recovered evidence and remain unresolved there — they were deliberately not reproduced in this synthetic reconstruction. This is a disclosure/labeling requirement, not a new view or business capability, consistent with the synthetic-data disclosures already established elsewhere in this portfolio reconstruction.

## Explicit Non-Goals

Carried forward from `DASHBOARD_CONTRACT_PROPOSAL.md`, § Exclusions, with the five anomaly-related items reframed per the synthetic-reconstruction decision in Data Requirements (the underlying exclusions are unchanged; what each bullet must not *claim* is now stated precisely):

- No campaign-engagement metrics or view (opens, clicks, GroupMail Insights) — not confirmed visible in the audited dashboard.
- No claim that this build's clean synthetic Conversion % formula resolves or explains the historical production anomaly — the synthetic formula is a demo convention; the historical figure remains unresolved in `dashboard-audit.md`.
- No claim that this build's synthetic status-total/Leads reconciliation resolves the historical mismatch — it remains open in `dashboard-audit.md`.
- No claim that the absence of negative counts in this build's synthetic data explains or corrects the historical negative-count anomaly — it remains open in `dashboard-audit.md`.
- No claim that the absence of person names in this build's synthetic origin values explains or corrects the historical name-leakage anomaly — it remains open in `dashboard-audit.md`.
- No claim that this build's documented synthetic Canal mapping is the historical production derivation rule — it is a demo convention only; the historical rule remains unconfirmed in `dashboard-audit.md`.
- No strictly linear/sequential funnel presentation of Estado de consulta.
- No named user/role/team beyond "stakeholders."
- No `Ejecutivo`, `Webinar`/`Evento`/`Actividad`, or `Exclusión`/`Remover` entities or dimensions.
- No interaction beyond filter, pagination, sort (required) and legend-toggle/cross-filter (optional, platform-inferred, not required).
- No literal, pixel-level, or vendor-specific reconstruction of the audited Looker Studio screen.
- No UI design, HTML, CSS, JavaScript, wireframe, or diagram is produced by this contract itself.

## Acceptance Tests

Each test is objectively verifiable against the built artifact, independent of subjective judgment.

1. **View completeness:** the built dashboard contains exactly the four required views (Lifecycle status, Acquisition-to-enrollment trend, Origin, Program-interest) and no undeclared fifth view.
2. **Metric closure:** every numeric value displayed on the dashboard corresponds to one row of the Required Metrics table above; no displayed number is absent from that table.
3. **Metric formula consistency:** the displayed Conversion % equals the displayed Matrícula count divided by the displayed Leads count, over the same filtered scope, exactly (no unexplained rounding gap).
4. **Funnel non-assertion:** the Estado de consulta view does not visually encode a guaranteed left-to-right sequential order (e.g., no directional funnel-shape chart implying every prospect must pass through every prior stage).
5. **Global filter scope:** changing the `programa_codigo` filter or the date-range filter changes the displayed values in all four required views, not a subset.
6. **Non-negative channel counts:** no origin/channel row in the synthetic dataset displays a negative count, for any filter combination.
7. **Synthetic reconciliation:** for any filtered scope, (a) the sum of the 8 status-state counts equals the displayed Leads count exactly; (b) no origin/Formulario value is a person's name; (c) every Canal value present in the data maps to a Formulario/Origen value via the documented synthetic mapping table, with no unmapped or ad hoc grouping.
8. **Disclosure presence:** the built dashboard visibly displays a statement that the data is synthetic and that the five historical anomalies (per `dashboard-audit.md`) remain unresolved in the recovered evidence and were not reproduced in this build.
9. **Non-goal absence:** none of the items listed under Explicit Non-Goals is present in the built dashboard (no campaign-engagement view, no `Ejecutivo`/`Webinar`/`Evento`/`Exclusión` entity, no export/alerting/annotation control, no claim of having resolved a historical anomaly).

## Human Verification

A reviewer who opens the finished dashboard, without being told what to look for, should perceive:

- Within the first few seconds, a sense of *where prospects are right now* in their journey (status distribution) — not a wall of unrelated marketing statistics presented with equal weight.
- That the dashboard is organized as a lifecycle, not as an arbitrary collection of charts — the four views should read as answering "what happens to a prospect," in that order of primacy, before "what is the state of the operation."
- That the Estado de consulta breakdown does not read as a guaranteed, one-way funnel — a reviewer should be able to tell some states are terminal (Desechado) and at least one is reversible (Retracto Matrícula), rather than assuming every prospect flows strictly forward.
- That the Conversion % reads as a clean, internally consistent figure that visibly derives from the Leads and Matrícula counts also shown on the dashboard — not as an authoritative claim about the historical production system's real conversion rate.
- That filtering by program or date visibly changes every view, confirming the views are not independent, disconnected widgets.
- No confusion about campaign engagement (opens/clicks) being part of this dashboard — its absence should not read as a bug or an omission the reviewer expects to find elsewhere on the same screen.
- Without needing to search for it, a plain statement that the data on screen is synthetic, and that the historical system this reconstructs had five specific, documented data anomalies (mismatched totals, an unreconciled conversion rate, a negative count, name leakage into a source field, an unconfirmed channel-grouping rule) that are described in the project's evidence documents rather than reproduced here — so the clean numbers on screen read as a deliberate reconstruction choice, not as evidence that the historical system was actually this tidy.

## Future Extensions

Ideas explicitly out of scope for this build, kept separate from mandatory requirements:

- A campaign-engagement view, if and when a source confirms it belongs to this dashboard or a linked one. (`DASHBOARD_CONTRACT_PROPOSAL.md`, § Exclusions)
- A resolved explanation of the five *historical* production anomalies (Conversion % mismatch, Leads/status-total mismatch, negative channel count, name leakage, unconfirmed Canal derivation) against the real historical system — still open, pending further evidence recovery. This is distinct from, and does not follow from, this build's synthetic reconciliation, which is a demo convention documented in Data Requirements above, not a historical finding. (`SYSTEM_CONTRACT_PROPOSAL.md`, § Open questions; `dashboard-audit.md`, § Anomalies and open questions)
- A confirmed transition model for Estado de consulta (if evidence ever establishes actual stage-to-stage transition rates), which could then justify a true funnel visualization.
- A named user/role for the dashboard, once confirmed, which could inform future prioritization between the Primary and Secondary Questions.
- An `Ejecutivo` (staff/executive) dimension, if the conflation with the origin field is ever resolved upstream.
- Legend-toggle and cross-filter interactions, if a future decision elects to include them (currently optional/inferred, not required).
