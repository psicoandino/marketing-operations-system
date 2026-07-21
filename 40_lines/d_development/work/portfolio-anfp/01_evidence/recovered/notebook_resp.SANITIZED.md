# Recovered notebook — sanitized technical evidence

Source artifact
`notebook_resp.PRIVATE.Rmd` (R notebook, "DCS | UE DATABASE MANAGEMENT",
recovered from the operator's personal archive). The private file is excluded
from Git (`.gitignore` in this directory) and must never be committed.

Sanitization date
2026-07-20

Authority
RECOVERED MATERIAL EVIDENCE (sanitized). This file supersedes testimony for
the pipeline mechanics it documents, per this directory's README.

## Sanitization manifest

All sensitive values were replaced with explicit `<PLACEHOLDER>` tokens.
Categories removed (values described by category only, never reproduced):

- database credentials (one service username, one password, reused across
  two connections);
- two internal private-network host addresses;
- one internal database name;
- personal Windows filesystem paths (user profile directory);
- internal table and column identifiers of the source systems (replaced by
  descriptive placeholder names that preserve join structure);
- no real personal contact data was present in the notebook (code only,
  no embedded records).

## What the notebook proves

The notebook is direct material evidence that the pipeline described in
`../02_pipeline.md` existed and how it worked:

1. two live database connections (a MariaDB intranet source and a SQL
   Server operational source, "Fénix");
2. file-based sources: webinar form CSV exports, legacy CSV bases and an
   Excel attributes catalog;
3. a canonical column vocabulary (`persona_*`, `programa_*`, `registro_*`);
4. source-specific normalization before consolidation;
5. incremental, mtime-based reprocessing of webinar files against a
   persisted master;
6. deterministic deduplication with a stronger identity key when a stable
   identifier (RUT) exists and an email-based key otherwise;
7. an exclusion list ("remover") queried from the intranet;
8. a downstream HTML executive report generated from the consolidated data.

## Connections (sanitized)

```r
con_intranet <- dbConnect(RMariaDB::MariaDB(),
  host = "<INTERNAL_HOST_A>", dbname = "<INTERNAL_DB>",
  user = "<SERVICE_ACCOUNT>", password = "<SECRET>")

con_fenix <- DBI::dbConnect(odbc::odbc(), Driver = "SQL Server",
  Server = "<INTERNAL_HOST_B>", Database = "<INTERNAL_DB>",
  UID = "<SERVICE_ACCOUNT>", PWD = "<SECRET>",
  TrustServerCertificate = "yes")
```

Both connections used the same service account. The credential was
hard-coded in the notebook — noted as a security finding of the historical
artifact, not reproduced anywhere.

## Recovered functions (verbatim logic, sanitized names)

### Program sigla extraction

Takes the program code prefix up to (not including) the first pair of
digits; falls back to the leading letters:

```r
sigla_from_codigo <- function(cod) {
  out <- sub("^(.+?)(?=\\d{2}).*$", "\\1", cod, perl = TRUE)
  idx <- out == cod
  if (any(idx)) out[idx] <- sub("^([A-Za-z]+).*$", "\\1", cod[idx])
  trimws(out)
}
```

### Date normalization

Fénix dates arrive as character; placeholder dates are nulled; timestamps
are cut to `YYYY-MM-DD`:

```r
norm_date <- function(x_chr) {
  x_chr <- trimws(as.character(x_chr))
  x_chr[x_chr %in% c("", "0000-00-00", "1900-01-01")] <- NA_character_
  x_chr <- sub("^([0-9]{4}-[0-9]{2}-[0-9]{2}).*$", "\\1", x_chr)
  suppressWarnings(lubridate::ymd(x_chr))
}
```

### Webinar id from filename

`webinar_id` is the first numeric block of the CSV filename
(`get_id_from_filename`, `as.integer` of the digits in `basename`).

### Truthy normalization for consent fields

```r
logical_from_yes <- function(x) tolower(as.character(x)) %in% c("true", "1", "sí", "si")
```

## Webinar CSV normalization (`normalize_webinar_csv`)

Each webinar export had form-authored, inconsistent column names. The
function:

- coalesces organization from `Institución` / `Empresa` into
  `persona_empresa`;
- coalesces role from `Cargo` / `Cargo en la Institución` into
  `persona_cargo`;
- coalesces attendance modality across at least five column-name variants,
  including one variant containing trailing whitespace inside the header
  (`"Evento Híbrido, indica tu modalidad de asistencia:      "`);
- marks `registro_consentimiento` TRUE if any consent-question column is
  truthy (four recovered variants of the consent question);
- marks `registro_newsletter` TRUE if any column whose name contains
  `Newsletter` is truthy;
- renames to the canonical vocabulary:
  `email → persona_correo`, `firstName → persona_nombre`,
  `lastName → persona_apellidos`, `phone → persona_fono`,
  `createdAt → registro_fecha`;
- coerces types so `rbindlist` cannot fail;
- stamps `source_mtime` (file modification time, UTC) on every row for
  incremental control.

## Incremental processing (webinars)

Recovered control flow against a persisted legacy/master CSV:

1. list webinar CSV files; extract `webinar_id` from each filename; order
   naturally by id;
2. load the master ("legacy") base; if it lacks `source_mtime`, initialize
   it to epoch;
3. compare each file's on-disk mtime against
   `max(source_mtime) by webinar_id` in the master;
4. process only files that are new (`id` absent from master) or updated
   (`file mtime > stored mtime`);
5. additionally filter to ids present in the Excel attributes catalog
   (`df_webinars_attributes`, joined by id);
6. drop the master's rows for reprocessed ids, append the fresh rows
   (replace-by-id upsert), reorder, and rewrite the master CSV with BOM.

## Enrollments consolidation (Fénix + legacy CSV)

Recovered staging pattern (`staging/` master as RDS + CSV, `exports/`
daily snapshot, `force_refresh` / `use_chunked_fetch` /
`write_daily_export` switches):

- **Legacy CSV**: read with `sep = ";"`, encoding Latin-1/Windows-1252,
  dates parsed as `%d/%m/%Y`, all character columns converted to UTF-8 via
  `iconv`, tagged `source = "legacy"`.
- **Fénix (SQL Server)**: one SELECT with seven LEFT JOINs from the
  enrollment fact table to student, program-version, studies, university,
  employment, company and country tables (sanitized shape below); dates
  arrive ISO; a numeric gender id is mapped
  (`1 → "Masculino"`, `2 → "Femenino"`); text re-encoded to UTF-8; tagged
  `source = "fenix"`; incremental window
  `WHERE <enrollment_date> >= '<CUTOFF_DATE>'`; optional chunked fetch
  (5000-row chunks streamed to a temp CSV) for memory control.

```sql
SELECT <enrollment_date>  AS registro_fecha,
       s.<email>          AS persona_correo,
       s.<first_name>     AS persona_nombre,
       s.<national_id>    AS persona_rut,
       s.<birth_date>     AS persona_nacimiento,
       s.<surname_1>      AS persona_paterno,
       s.<surname_2>      AS persona_materno,
       s.<gender_id>      AS persona_sexo,
       c.<nationality>    AS persona_nacionalidad,
       s.<profession>     AS persona_profesion,
       u.<name>           AS persona_universidad,
       w.<role>           AS persona_cargo,
       e.<legal_name>     AS persona_empresa,
       pv.<tracking_code> AS programa_codigo
FROM <tbl_enrollments> en
LEFT JOIN <tbl_students>         s  ON en.<student_id> = s.<id>
LEFT JOIN <tbl_program_versions> pv ON en.<program_version_id> = pv.<id>
LEFT JOIN <tbl_student_studies>  st ON en.<student_id> = st.<student_id>
LEFT JOIN <tbl_universities>     u  ON st.<university_id> = u.<id>
LEFT JOIN <tbl_student_jobs>     w  ON en.<student_id> = w.<student_id>
LEFT JOIN <tbl_companies>        e  ON w.<company_id> = e.<id>
LEFT JOIN <tbl_countries>        c  ON s.<nationality_id> = c.<country_code>
WHERE <enrollment_date> >= '<CUTOFF_DATE>'
```

Consolidation steps recovered verbatim:

1. reconcile columns (union of names; missing columns filled with NA);
2. select a canonical column order:
   `registro_fecha, persona_correo, persona_nombre, persona_rut,
   persona_nacimiento, persona_paterno, persona_materno, persona_sexo,
   persona_nacionalidad, persona_profesion, persona_universidad,
   persona_cargo, persona_empresa, programa_codigo, source`;
3. `rbindlist(..., use.names = TRUE, fill = TRUE)`;
4. `trimws` on every character column;
5. dual date parsing: try `%d/%m/%Y`, fall back to ISO.

## Deduplication (recovered rule — the key finding)

```r
# dedupe: preferir persona_rut si existe
if ("persona_rut" %in% names(df) && any(nzchar(df$persona_rut), na.rm = TRUE)) {
  k <- c("persona_rut", "programa_codigo", "registro_fecha")
} else {
  k <- c("persona_correo", "programa_codigo", "registro_fecha")
}
setorderv(df, k)
df <- unique(df, by = k)
```

- **Stronger identity rule**: when the stable national identifier (RUT)
  is available, the duplicate key is RUT + program + date.
- **Email fallback**: otherwise the key is email + program + date.
- Deterministic: rows are sorted by the key before `unique` keeps the
  first occurrence.
- The key is contextual (per program and date), not a global
  email-collapse: the same person may legitimately appear once per
  program.

## Other recovered stages

- **Inquiries**: intranet/Fénix prospect query joining prospect, program
  version, state, program and executive-user tables into
  `consulta_* / persona_* / programa_*` columns; plus a legacy inquiries
  CSV.
- **Events**: two event CSVs (two organizational units) tagged with
  `registro_source` and row-bound together.
- **Exclusion list**: `SELECT <date> AS remover_fecha, <email> AS
  persona_correo FROM <tbl_contact_removals>` — an unsubscribe/removal
  base applied to marketing use.
- **Phone normalization**: `gsub("[^0-9]", "", persona_fono)` (digits
  only, NA preserved).
- **Cross-source reconciliation (playground)**: full outer merge of the
  Fénix vs intranet product catalogs by `programa_codigo`, with
  NA-tolerant per-field difference flags (`diff_nombre`,
  `diff_modalidad`, `diff_area`, `diff_inicio`, `diff_termino`) to audit
  divergence between the two systems of record.
- **Reporting**: a fully self-contained HTML executive report (KPIs,
  per-event stats, lead-time distribution, loyalty segmentation
  Nuevo / Recurrente / Fiel at 1 / 2–3 / 4+ events) rendered from
  `data.table` aggregates — evidence for the reporting stage described in
  `../04_campaign-and-dashboard.md`.

## Derived artifact

The browser-based reference implementation in `../../vertical-slice/`
reconstructs stages 3–7 of this notebook (mapping, normalization,
incremental logic, consolidation, validation, deduplication) with
synthetic data only.
