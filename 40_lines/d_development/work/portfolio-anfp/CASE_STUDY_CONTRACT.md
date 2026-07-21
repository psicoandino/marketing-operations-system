# Case Study Contract

Status: PROPOSAL — derived exclusively from `PUBLIC_PRODUCT_INTEGRATION_AUDIT.md`, `CASE-01.md`, `01_evidence/01_context.md` through `05_results.md`, `SYSTEM_CONTRACT_PROPOSAL.md`, `DASHBOARD_CONTRACT_PROPOSAL.md`, and `DASHBOARD_BUILD_CONTRACT.md`. Not implemented. No HTML is produced by this document.

## Purpose

Govern the content of the public Case Study page named in `PUBLIC_PRODUCT_INTEGRATION_AUDIT.md` (§3, §9 step 2) — the narrative that explains, to a visitor who has never seen either app, what the Pipeline View and Dashboard View are demonstrations of, and why they exist as two views of one reconstructed system. This is a narrative contract: it governs what a visitor may be told, not how the system was engineered.

## Audience

A visitor arriving from a CV or portfolio link who has no prior context: most plausibly a hiring manager, recruiter, or technical reviewer evaluating the operator's marketing-data and analytics engineering work. No role is confirmed by any evidence source beyond this inference — do not over-specify further.

## Core Story

An operator was responsible for a substantial part of the marketing data pipeline at a real organization (Universidad de Chile, Educación Ejecutiva), consolidating information from more than five heterogeneous operational sources into a single dependable contact base at a scale above 250,000 active contacts and 400,000 historical records (`01_context.md`; `02_pipeline.md`). That consolidated base supported segmentation, campaign execution, and hourly-refreshed operational reporting (`03_segmentation.md`; `04_campaign-and-dashboard.md`; `05_results.md`). This portfolio reconstructs that system as two independent, self-contained public demonstrations — the Pipeline View and the Dashboard View — each addressing one stage of the same underlying story, built with synthetic data because the original organizational data cannot be exposed publicly.

## Sections

A public Case Study page built to this contract must contain, in order:

1. **What this case is** — one paragraph: real operator role, real organization, real scale, reconstructed (not exported) for public demonstration.
2. **The problem** — heterogeneous, disconnected marketing data sources requiring repeated manual work before they were usable (`01_context.md`, § Problem statement).
3. **The reconstruction** — two linked, self-contained demonstrations: a Pipeline View (data consolidation) and a Dashboard View (operational visibility into the prospect lifecycle), each independently viewable and each disclosing its own synthetic data.
4. **What to look at first** — a plain-language pointer into each linked view, not a re-explanation of their internals.
5. **What this is not** — a short, explicit disclaimer: not the original organizational system, not exported production data, not a claim of a specific measured business outcome.

## Evidence Boundaries

Every sentence on the public page must trace to one of the ten permitted read sources listed above. Sources explicitly excluded from this narrative surface, per `PUBLIC_PRODUCT_INTEGRATION_AUDIT.md` §4:

- `dashboard-audit.md`, `canonical-information-model.md` (real vendor/channel names, unresolved anomalies — maintainer evidence, not public narrative)
- `01_evidence/recovered/notebook_resp.*` (credentials, internal structure)
- `SYSTEM_CONTRACT_PROPOSAL.md`, `DASHBOARD_CONTRACT_PROPOSAL.md`, `DASHBOARD_BUILD_CONTRACT.md` themselves (governance contracts — read here to derive the narrative, never linked or exposed to a visitor)
- `CASE-01.md`, `README.md` (internal project tracking)

## Allowed Claims

The portfolio may state, per `05_results.md` § Claims supported and `03_segmentation.md`:

- the operator designed and operated a multi-source marketing data pipeline, consolidating heterogeneous sources into a prepared contact base;
- automated cleaning, normalization, and deduplication were part of that pipeline;
- segmentation was supported through business rules (primary long-term mechanism), association rules, and an experimentally operational Random Forest model, later discontinued in favor of business rules;
- campaign metrics were processed for internal reporting;
- an hourly automated flow updated Google Sheets and Looker Studio (`04_campaign-and-dashboard.md`);
- the work operated at a scale above 250,000 active contacts and 400,000 historical records, across more than five operational sources.

## Forbidden Claims

Per `05_results.md` § Claims prohibited and `04_campaign-and-dashboard.md` § Claims prohibited, the page must never state:

- a specific percentage reduction in manual work, duplicate rate, conversion increase, or revenue impact;
- a specific model accuracy for the Random Forest model, or that it reached permanent production use;
- real-time reporting (the confirmed cadence is hourly, not real-time);
- fully automated campaign execution, or automatic ingestion directly from tracking tools;
- guaranteed contact quality or current production availability of the historical system;
- any invented impact metric not present in the evidence atoms.

## Calls to Action

Exactly two primary calls to action, matching the route tree in `PUBLIC_PRODUCT_INTEGRATION_AUDIT.md` §3:

1. A link to the Pipeline View.
2. A link to the Dashboard View.

Neutral shared-shell navigation back to Landing and access to the CV is permitted alongside these two, as common page chrome rather than a narrative call to action. No other outbound link (no contact form, no link to any excluded source in Evidence Boundaries, no unrelated external destination).

## Relationship to Pipeline View

The Case Study page frames the Pipeline View as the consolidation stage of the reconstructed story — turning heterogeneous sources into one dependable contact base. Per current verified state, the Pipeline View is complete, monolithic, self-contained, zero-dependency, and supports EN | ES with `localStorage` persistence (`PUBLIC_PRODUCT_INTEGRATION_AUDIT.md` §1). The Case Study must not restate or duplicate the Pipeline View's internal content — it links to it.

## Relationship to Dashboard View

The Case Study page frames the Dashboard View as the operational-visibility stage of the same story — making visible how a prospect evolves from acquisition to enrollment (`DASHBOARD_CONTRACT_PROPOSAL.md` § Purpose). Verified current state, confirmed directly in this session:

- all four required views are implemented and enabled: **Lifecycle**, **Trend**, **Origin**, **Program Interest** (`dashboard/tests/smoke-test.mjs`, 157/157 passed);
- EN | ES support is present and verified (language switch, persistence, full translation-key parity);
- the dashboard uses synthetic data and visibly discloses that the five historical anomalies documented in `dashboard-audit.md` were not reproduced.

The Case Study must not claim the Dashboard View reproduces or resolves the historical production system's anomalies — it must state the data is a synthetic, disclosed reconstruction, consistent with `DASHBOARD_BUILD_CONTRACT.md` § Explicit Non-Goals.

## Success

A Case Study page satisfies this contract when: every claim traces to a permitted evidence atom; the two Allowed/Forbidden claim lists are both respected exactly; exactly two primary calls to action exist, pointing to Pipeline and Dashboard; no internal contract, audit, or evidence-atom filename is exposed to the visitor; the page states plainly that displayed data in both linked apps is synthetic; and the core narrative can be scanned in under five minutes without opening either demonstration.

## Failure

A Case Study page violates this contract if it: invents any quantitative outcome not present in `05_results.md` or `04_campaign-and-dashboard.md`; names or links to `dashboard-audit.md`, `canonical-information-model.md`, any contract file, or any recovered-notebook artifact; asserts the Random Forest model reached permanent production use or cites a specific accuracy; describes the reporting flow as real-time; presents Estado de consulta as a strict linear funnel; or omits the synthetic-data disclosure for either linked view.
