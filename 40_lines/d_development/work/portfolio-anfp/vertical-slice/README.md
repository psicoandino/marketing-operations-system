# Multi-Source Marketing Data Pipeline — Vertical Slice

A guided, browser-based reconstruction of the multi-source marketing data
pipeline documented in portfolio case 01: heterogeneous operational sources
are inspected, mapped, normalized, validated, consolidated and deduplicated
into a common contact structure.

## Run

Open `index.html` in any modern browser. No server, no build step, no
network access, no dependencies. All processing happens locally.

## What it demonstrates

Ten guided stages over four deliberately heterogeneous synthetic sources:

| Source | Style | Separator | Dates | Identity | Signature defects |
|---|---|---|---|---|---|
| `fenix.csv` | SQL Server operational extraction | `,` | timestamps + placeholder dates | RUT + email | UPPERCASE names, mixed RUT formats, numeric gender codes |
| `intranet.csv` | MariaDB inquiry base | `,` | ISO dates | email only | phone-format noise, free-text program names, stray spaces |
| `webinars.csv` | Form CSV exports | `,` | ISO-8601 timestamps | email only | camelCase + human-authored headers (one with trailing spaces), split Institución/Empresa and Cargo columns, consent as Sí/si/1/TRUE |
| `legacy.csv` | Historical spreadsheet | `;` | dd/mm/yyyy | RUT (with gaps) | Windows-1252 mojibake, single full-name column, placeholder emails |

Stages: source overview → schema inspection → field mapping →
source-specific transformation → incremental-processing explanation →
consolidation → validation → contextual deduplication → final result with
CSV export → open table exploration.

Deduplication reproduces the recovered two-rule logic: a stronger identity
key (RUT + program) when a stable identifier exists, an email + program
fallback when it does not, with deterministic survivor selection. The key is
contextual — the same email interested in two programs is not a duplicate.

## Deterministic result

44 synthetic input records (12 + 10 + 12 + 10) → 4 rejected by validation →
7 duplicates removed (5 by the identity rule, 2 by the email fallback) →
**33 final contacts**. Every load produces the identical output CSV.

## Provenance and scope

- Reconstructed from the operator-verified evidence in `../01_evidence/`
  and the sanitized recovered notebook
  (`../01_evidence/recovered/notebook_resp.SANITIZED.md`).
- **All data is synthetic.** Names, emails (`@example.*`), RUT-like
  identifiers, phones and organizations are fictional.
- This is a reference implementation, **not the historical production
  system**, which operated on live databases at a scale above 250,000
  active contacts.
- `index.html` is intentionally monolithic (single self-contained file) so
  it runs from `file://` with zero infrastructure. The four CSVs are
  embedded verbatim in the page (browsers cannot `fetch` local files from
  `file://`); `input/*.csv` are the canonical fixtures and the smoke test
  verifies both copies are identical.

## Verification

```
node tests/smoke-test.mjs
```

The smoke test checks file inventory, absence of external/runtime
dependencies and network calls, embedded-vs-fixture CSV identity, presence
of the ten stages, and — by executing the page's own pipeline core in
Node — the deterministic counts, validation separation, deduplication
behavior, export shape and a basic secret scan.
