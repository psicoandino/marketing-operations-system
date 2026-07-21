# Dashboard View — Increment 1

The second public view of the Marketing Operations System (`SYSTEM_CONTRACT_PROPOSAL.md` → `DASHBOARD_CONTRACT_PROPOSAL.md` → `DASHBOARD_BUILD_CONTRACT.md`).

## Scope of this increment

This increment exists to validate the architecture of the dashboard view, not to finish it. It implements:

- the full synthetic data layer required by `DASHBOARD_BUILD_CONTRACT.md` § Data Requirements (Consulta, Matrícula, Canal/Origen mapping), reconciling exactly — no reproduced historical anomaly;
- one of the four required views: **Lifecycle Status**, presented as a status/state set (terminal and reversible states marked), never as a sequential funnel;
- the two required global interactions (`programa_codigo` filter, date-range filter), wired end-to-end against the implemented view;
- the required synthetic-data / historical-anomaly disclosure.

The remaining three required views (Acquisition-to-enrollment trend, Origin, Program-interest) are scaffolded in the navigation as disabled, clearly labeled "later increment" — not implemented, not faked.

## Run

Open `index.html` in a browser. No server, no build step, no network access, no dependencies.

## Verify

```
node tests/smoke-test.mjs
```

## Provenance

This file, and everything in this directory, exists only inside the current git worktree until explicitly committed and merged into `main`.
