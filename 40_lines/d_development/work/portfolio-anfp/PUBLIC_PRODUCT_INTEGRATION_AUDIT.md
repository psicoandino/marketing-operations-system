# Public Product Integration Audit

Status: AUDIT — read-only. No file was implemented or modified to produce this document. Not authoritative until reviewed; governs a future integration build, does not perform it.

Deliverable framing used throughout: **CV.pdf + one public URL.** Every recommendation below is evaluated against that framing, not against "most complete possible site."

## 1. Public-facing artifacts that already exist

Confirmed by direct inspection of the repository at `40_lines/d_development/work/portfolio-anfp/`:

| Artifact | State |
|---|---|
| `vertical-slice/index.html` ("Pipeline View") | Complete, monolithic, self-contained, zero dependencies, EN\|ES with `localStorage` persistence, own smoke test (`vertical-slice/tests/smoke-test.mjs`). Title: "Multi-Source Marketing Data Pipeline — Guided Reconstruction". |
| `dashboard/index.html` ("Dashboard View") | Complete (all 4 views), monolithic, self-contained, zero dependencies, EN\|ES with `localStorage` persistence, own smoke test (`dashboard/tests/smoke-test.mjs`). |
| `public/` | **Does not exist.** No such directory anywhere in this worktree or in `main`, despite being named in this task's own read list. |
| Landing page | **Does not exist.** No file anywhere in the repository serves this role. |
| Case Study page | **Does not exist.** `CASE-01.md` (this directory) states explicitly: "Public artifact — Not yet created." |
| CV.pdf | Not present in this directory tree; out of this audit's read scope, assumed to be produced/maintained elsewhere. |

Two finished, independently-verified applications exist. Nothing connects them, and nothing introduces them.

## 2. What is missing for one coherent public URL

Factual gaps (each independently blocks "one public URL"):

- No shared entry point — a visitor has no single address to start from.
- No cross-navigation — confirmed by direct search: **zero `<a href>` elements exist in either `vertical-slice/index.html` or `dashboard/index.html`.**
- No case-study narrative page exists to explain what the two apps are demonstrations of.
- No deploy root exists — there is nothing that could be pointed a static host at today and produce a working multi-page site.

## 3. Smallest information architecture connecting Landing / Pipeline / Dashboard / Case Study

Recommendation (not yet built): a single flat route tree, one level deep, at one deployed origin:

```
/                    → Landing (new, minimal)
/case-study/         → Case Study (new, minimal, derived from 01_evidence/*.md)
/pipeline/            → vertical-slice/index.html, placed here verbatim
/dashboard/           → dashboard/index.html, placed here verbatim
/CV.pdf
```

Rationale: this is the smallest tree that lets Landing link to the other three, and needs no framework, no router, and no rewrite of either app — only placement plus a handful of `<a href="...">` additions on the Landing and Case Study pages. Motivated by the explicit rule "prefer links and a minimal shell over copying or combining large HTML files" and by "do not rewrite the Pipeline or Dashboard applications."

## 4. Internal artifacts that must never be exposed publicly

| Artifact | Why |
|---|---|
| `01_evidence/recovered/notebook_resp.PRIVATE.Rmd` | Contains credentials, internal hosts, personal paths (per its own sanitization record). Already git-ignored; must stay so. |
| `01_evidence/recovered/notebook_resp.SANITIZED.md` | Sanitized, but still a maintainer-facing recovery/derivation artifact (internal table/column structure, notebook logic) — not written as public prose. |
| `SYSTEM_CONTRACT_PROPOSAL.md`, `DASHBOARD_CONTRACT_PROPOSAL.md`, `DASHBOARD_BUILD_CONTRACT.md` | Governance/build contracts for maintainers; not narrative, not meant for a visitor. |
| `dashboard-audit.md`, `canonical-information-model.md` | Reverse-engineering analysis of the real historical dashboard screenshot, including real vendor/channel names (IProspect, Convierta, Rebold) and unresolved data anomalies. Explicitly maintainer/evidence material, not a public claim surface. |
| `01_evidence/01_context.md`, `02_pipeline.md`, `03_segmentation.md`, `04_campaign-and-dashboard.md`, `05_results.md`, `case-01-marketing-pipeline.md`, `01_evidence/source/case-01-marketing-pipeline.monolith.md` | Operator-verified testimony evidence atoms and their derivation trail — the *source* the Case Study must be written from, not the Case Study itself. Contain explicit "claims prohibited" lists that a casual copy-paste into a public page could violate. |
| `CASE-01.md`, `README.md` (root of this directory) | Internal project-tracking/status files (Psicoandino OS bookkeeping), not narrative content. |
| `vertical-slice/README.md`, `dashboard/README.md`, both `tests/smoke-test.mjs` | Developer documentation and test tooling. No secrets, but not part of the intended visitor experience and not linked from any public page. |
| `PUBLIC_PRODUCT_INTEGRATION_AUDIT.md` (this file) | Maintainer audit governing the build; not a public artifact itself. |

## 5. Duplicate, conflicting, or unsupported narrative claims

- **`dashboard/README.md` is stale relative to the actual shipped state.** It still describes "Increment 1," only the Lifecycle Status view implemented, and the other three views as "disabled... later increment." The dashboard is now functionally complete (4 views, bilingual, per this task's own preamble). This is a real, findable conflict between a developer-facing doc and reality — low risk today only because that file is not linked from anywhere public (see §4), but it must not be mistaken for current documentation during the integration build.
- **`dashboard/index.html`'s `<title>` tag still reads "Marketing Operations Dashboard — Increment 5."** An internal build/sprint label is currently the literal browser-tab / link-preview title of a "complete" artifact. This is a citable, concrete defect a visitor would actually see. (Contrast: `vertical-slice/index.html`'s title, "Multi-Source Marketing Data Pipeline — Guided Reconstruction," carries no internal versioning language.)
- **No unsupported quantitative claims found.** Both apps' disclosure text correctly avoids the outcomes `05_results.md` prohibits (no invented conversion uplift, time savings, or revenue figures) — stated here as a confirmed pass, not a gap.
- **No narrative currently ties the two apps together as one body of work.** The "first public view" / "second public view" framing exists only inside `DASHBOARD_CONTRACT_PROPOSAL.md` (maintainer-facing); nothing visitor-facing states that Pipeline and Dashboard are two views of the same reconstructed system. This is a gap, not a conflict, but it directly motivates the Landing/Case Study pages in §3.
- **`CASE-01.md`'s own status tracking ("Public artifact: Not yet created," last review 2026-07-20) has not been updated** to reflect that both apps referencing this same case are now complete. Project-hygiene note only; `CASE-01.md` is internal (§4), so this is not a public-facing conflict.

## 6. Missing or broken navigation between public artifacts

Total absence, not partial breakage: neither `index.html` contains a single `<a href>` element (confirmed by direct search of both files). There is no way to reach the Dashboard from the Pipeline, no way to reach either from any landing surface (none exists), and no way back. Every link required by §3's route tree has yet to be written.

## 7. Static deployment constraints

- Both apps are confirmed dependency-free, network-free, build-free (each smoke test asserts no `package.json`, no `node_modules`, no `<script src>`, no `fetch`/`XHR`/`WebSocket`, no `http(s)://` URLs) — both are already maximally compatible with any static host (GitHub Pages, Netlify, Cloudflare Pages, S3+CDN, or plain `file://`).
- Because both apps use only relative DOM ids and inline scripts with no absolute-path assumptions, placing them at `/pipeline/` and `/dashboard/` under a shared static root requires no internal modification — only file placement.
- Each app manages its own `localStorage` key independently (vertical-slice and dashboard use different keys already) — safe to co-host at the same origin without collision.
- `CV.pdf` is a static binary and can be served from the same root with zero server logic.
- No routing framework, server, or build step is required to satisfy "one public URL" — a static multi-directory site at one origin already satisfies that framing; "one URL" means one deployed origin a CV can point to, not literally a single HTML file.

## 8. Should `public/` become the deployable root, or is another minimal shell preferable?

Factual basis: `public/` does not exist yet anywhere (§1), so this is a build decision, not a correction.

**Recommendation: yes, create `public/` as the deployable root**, populated by *placing* (not rewriting) the two finished apps at `public/pipeline/` and `public/dashboard/`, plus two new minimal files (`public/index.html`, `public/case-study/index.html` or equivalent). Rationale:

- A dedicated deploy root is the only way to guarantee the internal artifacts in §4 are *structurally* excluded (they simply live outside `public/`), rather than relying on a hosting platform's include/ignore configuration to correctly exclude them from a shared directory that also contains the shippable files as siblings — the latter is one accidental config change away from exposing a contract or the sanitized notebook.
- This does not violate "prefer links... over copying or combining large HTML files": that rule governs how Landing/Case Study *reference* Pipeline/Dashboard (via `<a href>`, never by inlining or merging their HTML). Placing the already-complete, self-contained app folders at their public path is not a rewrite or a combination — it is deployment, and the same constraint applies however the files get to `public/` (see §9, and the operator decision in the closing section on *how* that placement happens).

## 9. Smallest build sequence required to ship

1. Create `public/` with two new, minimal files: `public/index.html` (Landing) and a Case Study page, each linking to the other three routes in §3's tree.
2. Write the Case Study page's content strictly from the operator-verified evidence atoms (`01_evidence/01_context.md` through `05_results.md`), respecting every "claims prohibited" list they contain. Do not source it from `dashboard-audit.md`, `canonical-information-model.md`, or the sanitized notebook (§4).
3. Place `vertical-slice/` at `public/pipeline/` and `dashboard/` at `public/dashboard/`, verbatim, with no internal edits.
4. Place `CV.pdf` at `public/CV.pdf`.
5. Re-run both existing smoke tests unchanged (`vertical-slice/tests/smoke-test.mjs`, `dashboard/tests/smoke-test.mjs`) against their placed copies to confirm placement introduced no byte-level change.
6. Deploy `public/` to a static host as the single public origin; point the CV and any external portfolio listing at that one URL.

Steps 1–2 are the only new content this sequence requires; steps 3–4 are placement; step 5 is verification; step 6 is the actual ship.

## 10. What to omit, to avoid overbuilding

- No shared design system unifying the visual language of Pipeline and Dashboard pixel-for-pixel — each is already internally consistent; forcing parity is decoration this task's own preamble forbids ("do not add new functionality").
- No unified cross-app language switcher — each app's EN\|ES is independent and must be preserved as-is per explicit instruction; building a shared one would require touching both apps' internals.
- No build framework, bundler, or `package.json` anywhere in `public/` — every existing artifact is zero-dependency; a static shell with relative links preserves that.
- No backend, analytics pipeline, contact form, or server logic — nothing read in this audit calls for it, and every existing artifact explicitly discloses "processing occurs locally in the browser."
- No second or parallel case-study/landing variant — exactly one Case Study page, one Landing page, per the "one public URL, not multiple independent URLs" framing.
- No "behind the scenes" or "how it was built" page exposing the contracts, audits, or evidence atoms — nothing in the read sources asks for build-process transparency, and it would directly violate §4.
- No edits to `dashboard/README.md`'s stale content or `dashboard/index.html`'s title tag as part of *this* audit — both are real findings (§5) but fixing them is an implementation act outside this audit's read-only scope; they are handed to the operator as decisions below.
