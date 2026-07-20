# Case 01 — Pipeline

## Authority

Operator-verified testimony.

No original scripts, schemas, queries or database exports have yet been
recovered.

## Purpose

Transform heterogeneous marketing and communications data into a consolidated
contact base suitable for operational use.

## Inputs

The pipeline received information from:

- website forms;
- event forms;
- StreamYard;
- SEM agency files;
- MySQL;
- Excel;
- CSV;
- GroupMail;
- H2;
- Fénix.

Some sources were queried directly.

Others arrived as files that required manual or scripted processing.

## Extraction

Data was obtained through:

- SQL queries;
- database access using DBeaver;
- reading Excel and CSV files;
- processing files supplied by agencies;
- retrieving information from operational marketing systems.

The extraction method varied according to the source.

## Inspection

Before consolidation, each source was inspected to identify:

- available columns;
- field types;
- source-specific identifiers;
- missing values;
- duplicate structures;
- inconsistent naming conventions;
- source-specific anomalies.

This inspection determined the transformations required before consolidation.

## Cleaning and normalization

The operator reports applying transformations including:

- standardizing column names;
- normalizing text fields;
- correcting inconsistent formats;
- preparing names, emails and contact attributes;
- handling missing or invalid values;
- aligning source-specific values to common categories;
- preparing records for consolidation.

The exact transformation rules have not yet been recovered.

## Validation

Records were checked before entering the consolidated base.

The objective was to detect malformed, incomplete or low-quality records and
prevent them from entering the final structure unchanged.

The exact validation criteria have not yet been recovered.

## Deduplication

Contacts could appear repeatedly across systems, campaigns, forms and files.

The pipeline included a deduplication stage intended to:

- detect repeated contacts;
- reduce repeated records;
- prevent the same person from being counted multiple times;
- improve consistency in the consolidated base.

The precise matching keys, field priorities and conflict-resolution rules have
not yet been recovered.

## Consolidation

Prepared records were combined into a central contact structure.

That structure supported later operational use, including segmentation,
campaign preparation and reporting.

Confirmed scale:

- more than 250,000 active contacts;
- more than 400,000 historical records;
- more than five operational data sources;
- recurring daily operation.

## Output

The output of the pipeline was a consolidated and prepared contact base.

This atom stops at that boundary.

Segmentation, campaigns, metrics and dashboard delivery are documented in
separate evidence atoms.

## Evidence limits

This document is based on operator-verified testimony.

The following material evidence has not yet been recovered:

- original Python or R scripts;
- SQL queries;
- database schemas;
- sample source files;
- anonymized input and output examples;
- validation rules;
- deduplication rules;
- field-mapping definitions;
- execution logs.

## Operator verification — 2026-07-20

The operator reviewed and approved this atom as factually accurate.

Authority:

OPERATOR-VERIFIED TESTIMONY.

## Next movement

Extract 05_results.md.