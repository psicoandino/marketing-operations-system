# Case 01 — Marketing Data Pipeline

## Status

EVIDENCE RECONSTRUCTION

## Evidence authority

This document separates:

- operator testimony;
- facts that may be mechanically verified later;
- claims that must not yet be presented as independently demonstrated.

No original code repository, dashboard export, database extract or production
screenshot has yet been recovered for this case.

## Organization

Universidad de Chile  
Educación Ejecutiva  
Departamento de Control de Gestión

## Operator role

Marketing and data analyst.

The operator reports having been responsible for substantially the complete
data flow described in this document, including extraction, preparation,
consolidation, segmentation, automation and dashboard data delivery.

## Operational context

Marketing and commercial information arrived from multiple systems, forms,
campaign providers and manually maintained files.

The data did not arrive through one stable schema or one controlled channel.
Each source could contain different field names, formats, identifiers, update
frequencies and levels of completeness.

The working requirement was to transform those disconnected records into a
usable contact base for segmentation, email marketing, campaign analysis and
operational reporting.

## Source systems and inputs

Reported sources included:

- website forms;
- event registration forms;
- StreamYard;
- SEM agency files;
- MySQL databases;
- Excel files;
- CSV files;
- GroupMail;
- H2;
- Fénix.

These sources did not necessarily enter through the same mechanism.

Some were queried directly, while others were received or processed as files.

## Problems observed

The operator reports the following recurring problems:

- data distributed across multiple disconnected sources;
- inconsistent schemas and column names;
- inconsistent formats for names, emails, identifiers and other attributes;
- duplicate contacts across files and systems;
- incomplete or low-quality contact records;
- difficulty producing reliable audience segments;
- manual processing of spreadsheets supplied by agencies;
- fragmented campaign performance information;
- repetitive dashboard preparation work;
- difficulty maintaining a consolidated and current contact base.

## Objective of the pipeline

Create a repeatable data process capable of:

1. obtaining records from heterogeneous sources;
2. cleaning and normalizing them;
3. identifying and resolving duplicates;
4. consolidating them into a central contact base;
5. producing useful marketing segments;
6. supporting campaign execution and analysis;
7. supplying recurring data to operational dashboards.

## Reported pipeline

```text
Source systems and files
        ↓
Extraction and SQL queries
        ↓
Structural inspection
        ↓
Cleaning and normalization
        ↓
Validation
        ↓
Deduplication
        ↓
Consolidated contact database
        ↓
Segmentation methods
        ↓
Campaign execution and measurement
        ↓
Automated dashboard data update
```

## 1. Extraction

Data was obtained from databases, forms, campaign tools and files.

Reported extraction mechanisms included:

* SQL queries;
* database access through DBeaver;
* reading Excel and CSV files;
* processing manually delivered agency files;
* obtaining records from operational marketing systems.

The extraction stage produced inputs for later cleaning and consolidation.

## 2. Structural inspection

Before consolidation, the data required inspection to understand:

* available columns;
* source-specific identifiers;
* missing values;
* duplicate structures;
* field types;
* incompatible naming conventions;
* source-specific anomalies.

This stage determined how each input had to be transformed before joining it
to the central contact base.

## 3. Cleaning and normalization

Reported transformations included:

* standardizing column names;
* normalizing text fields;
* correcting inconsistent formats;
* preparing email and contact fields;
* handling missing or invalid values;
* aligning source-specific values to common categories;
* creating structures suitable for consolidation and segmentation.

The exact implementation must be recovered or reconstructed before any more
specific transformation rule is claimed publicly.

## 4. Validation

Records were evaluated before entering the consolidated base.

The validation objective was to reduce unusable, malformed or low-quality
records.

The operator reports that this included checking relevant contact fields and
detecting records that should not enter the final marketing base unchanged.

The exact validation rules are not yet supported by recovered artifacts.

## 5. Deduplication

Contacts could appear repeatedly across systems, forms, campaigns and files.

The pipeline included a deduplication stage intended to:

* detect repeated contacts;
* prevent the same person from being counted multiple times;
* reduce repeated campaign records;
* improve the consistency of the consolidated base.

The precise matching keys, priorities and conflict-resolution rules have not
yet been recovered.

They must not be represented as verified technical details until evidence is
available.

## 6. Consolidation

After preparation, records were brought into a centralized contact structure.

The consolidated base was used to support:

* contact management;
* segmentation;
* marketing campaign preparation;
* historical analysis;
* operational reporting.

Reported scale:

* more than 250,000 contacts;
* more than 400,000 historical records;
* more than five source systems;
* recurring or daily operational use.

These figures currently come from operator testimony.

## 7. Segmentation

The operator reports using three complementary segmentation approaches.

### 7.1 Business rules

Business-defined criteria were used to form operational audiences.

Reported examples include segmentation by:

* area of interest;
* program interest;
* event participation;
* previous interactions;
* available contact attributes;
* other campaign-relevant conditions.

These rules allowed marketing teams to create audiences based on explicit
operational criteria.

### 7.2 Association rules

Association rules were used operationally to identify recurring relationships
between program interests, purchases or historical behavior.

Conceptual example:

```text
When records associated with A frequently also show interest in B,
contacts related to A become candidates for communication about B.
```

A simplified formulation is:

```text
A → B
```

The relationship was used as evidence for constructing campaign audiences.
It did not imply that every contact related to A automatically received B.

The exact support, confidence, lift thresholds and production parameters have
not yet been recovered and must not be invented for the portfolio.


### 7.3 Random Forest

A Random Forest model was reportedly developed to estimate the probability
that a contact would be interested in a program.

The model supported prioritization or segmentation based on predicted
interest.

At present, the following details are not materially verified:

* exact target variable;
* training period;
* feature list;
* train/test procedure;
* performance metrics;
* probability threshold;
* deployment mechanism;
* retraining frequency.

Until evidence is recovered, the public case may state only that a Random
Forest approach was used to estimate program interest.

It must not claim a specific accuracy, uplift or commercial result.

## 8. Campaign information

The consolidated and segmented data supported email marketing activity.

GroupMail was among the reported operational systems.

Campaign information could then be used to analyze outcomes and update
reporting views.

The exact relationship between the consolidated base, campaign exports,
GroupMail and campaign result ingestion still requires reconstruction.

## 9. Dashboard automation

The dashboard process initially involved manual work.

It later evolved into a recurring automated flow.

Reported architecture:

```text
Python process
        ↓
Execution on a virtual machine
        ↓
Hourly data processing
        ↓
Google Sheets update
        ↓
Looker Studio dashboard
```

The operator reports that the Python process ran on a virtual machine and
updated the data used by Looker Studio through Google Sheets.

The update frequency was hourly.

Therefore the case must describe the dashboard as:

```text
updated hourly
```

It must not describe it as:

```text
real-time
```

unless later evidence proves real-time behavior.

## 10. Tools reported

* Python;
* R;
* SQL;
* MySQL;
* DBeaver;
* Excel;
* CSV;
* Google Sheets;
* Looker Studio;
* GroupMail;
* virtual machine infrastructure.

A tool should appear in the final portfolio only when its role in the case is
clear.

The portfolio must not present a list of technologies without connecting
them to an actual part of the pipeline.

## 11. Operator responsibilities

The operator reports direct responsibility for work including:

* understanding the available sources;
* extracting data;
* writing or executing SQL queries;
* inspecting schemas and records;
* cleaning data;
* normalizing fields;
* validating records;
* deduplicating contacts;
* consolidating the contact base;
* developing segmentation logic;
* applying business rules;
* exploring association rules;
* developing a Random Forest interest model;
* preparing data for campaigns;
* automating recurring processing;
* supplying dashboard data;
* maintaining or supervising the operational flow.

The final portfolio should describe this as substantial ownership of the
pipeline.

It should not claim sole ownership of unrelated systems, infrastructure or
organizational decisions without further evidence.

## 12. Results reported

Reported operational outcomes include:

* contact information centralized into a more usable base;
* reduced repetitive manual processing;
* improved ability to construct marketing segments;
* support for campaign audience selection;
* campaign metrics made available for analysis;
* recurring visibility through dashboards;
* hourly refresh of dashboard source data;
* greater continuity in the marketing data process.

No numerical improvement percentage has yet been verified.

The portfolio must not invent:

* time saved;
* conversion uplift;
* revenue impact;
* model accuracy;
* duplicate reduction percentage;
* campaign performance increase.

## 13. Candidate portfolio claim

The strongest currently supportable summary is:

> Designed and operated a marketing data pipeline that consolidated records
> from multiple databases, forms and campaign sources; automated cleaning,
> normalization and deduplication; supported segmentation through business
> rules, association analysis and a Random Forest model; and supplied hourly
> data updates to a Looker Studio dashboard.

Authority:

OPERATOR TESTIMONY — NOT YET INDEPENDENTLY VERIFIED.

## 14. Claims prohibited until evidence is recovered

Do not state that the system:

* operated in real time;
* eliminated all duplicates;
* guaranteed contact quality;
* automatically made marketing decisions;
* increased sales by a specific amount;
* improved conversion by a specific percentage;
* achieved a particular model accuracy;
* used a production-grade machine-learning deployment platform;
* processed exactly the same sources throughout the entire period;
* was built entirely by one person without collaboration;
* remains operational today.

## 15. Evidence currently missing

The following artifacts would strengthen or verify the case:

* original Python scripts;
* original R scripts;
* SQL queries;
* repository history;
* database diagrams;
* sample schemas;
* anonymized input examples;
* anonymized output examples;
* deduplication rules;
* validation rules;
* model notebook or script;
* feature definitions;
* model evaluation output;
* association-rule results;
* automation scheduler configuration;
* virtual machine execution logs;
* Google Sheets structure;
* Looker Studio screenshots;
* dashboard exports;
* campaign reports;
* internal documentation;
* emails or messages confirming responsibilities;
* colleague or manager validation.

## 16. Evidence recovery order

Search in this order:

1. local repositories and code folders;
2. old computer directories and backups;
3. Google Drive and Google Sheets;
4. email attachments and sent messages;
5. Looker Studio assets or screenshots;
6. exported reports;
7. archived documents;
8. people who can confirm the work.

Do not delay the portfolio indefinitely while searching.

The case can use clearly labeled operator testimony when original evidence no
longer exists.

## 17. Current classification

| Statement                                                          | Current authority                 |
| ------------------------------------------------------------------ | --------------------------------- |
| The operator worked with marketing data at Educación Ejecutiva DCS | Operator testimony and CV context |
| Data came from multiple systems and files                          | Operator testimony                |
| The base involved 250,000+ contacts                                | Operator testimony                |
| Historical records exceeded 400,000                                | Operator testimony                |
| Cleaning and deduplication were performed                          | Operator testimony                |
| Business rules were used for segmentation                          | Operator testimony                |
| Association rules were explored or applied                         | Operator testimony                |
| Random Forest estimated program interest                           | Operator testimony                |
| Python updated Google Sheets from a virtual machine                | Operator testimony                |
| Dashboard source data was updated hourly                           | Operator testimony                |
| Looker Studio displayed the resulting information                  | Operator testimony                |
| Exact performance improvement                                      | Unsupported                       |
| Exact model accuracy                                               | Unsupported                       |
| Exact financial impact                                             | Unsupported                       |

## 18. Human verification required

Before this case enters the final portfolio, the operator must confirm:

* that every named source was actually used;
* that the reported scale is accurate;
* that the hourly frequency is accurate;
* that the model was used operationally or only experimentally;
* that association rules were used operationally or only analytically;
* that GroupMail's role is described correctly;
* that no confidential institutional information appears;
* that the final wording reflects the operator's actual responsibility.

## Next movement

Perform the operator verification of the seven unresolved factual points
listed above.

Do not design the portfolio page yet.

Do not write the final public case yet.

Do not create additional architecture.