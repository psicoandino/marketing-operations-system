# Case 01 — Campaign and Dashboard Flow

## Authority

Operator-confirmed testimony.

No original campaign exports, tracking files, automation scripts, scheduler
configuration or dashboard screenshots have yet been recovered.

## Purpose

Execute email campaigns, recover engagement metrics, transform those metrics
into internally usable data and update an operational dashboard on a recurring
schedule.

## Campaign execution

GroupMail was used through a primarily manual workflow:

1. create the campaign;
2. load the campaign HTML;
3. load the recipient base;
4. dispatch the campaign through SMTP.

The campaign content and recipient base were prepared before dispatch.

The exact SMTP configuration, sending infrastructure and campaign templates
have not yet been recovered.

## Tracking

GroupMail Insights was a paid add-on used to add tracking information to
emails and links.

This enabled campaign interactions to be measured after dispatch.

The operator reports that the tracking process required inserting the
corresponding tags into the campaign content.

The exact tracking fields and event definitions have not yet been recovered.

## Metrics recovery

After dispatch, campaign metrics were downloaded manually from the GroupMail
Insights website.

Those exports were not directly compatible with the internal data structures.

They therefore required an additional transformation stage.

Reported processing included:

- parsing exported data;
- formatting fields;
- normalizing structures;
- adapting metrics to internally usable schemas;
- preparing the result for analysis and reporting.

## Operational flow

```text
Campaign definition
        ↓
HTML loaded into GroupMail
        ↓
Recipient base loaded
        ↓
SMTP dispatch
        ↓
GroupMail Insights tracking
        ↓
Manual metrics download
        ↓
Parsing and normalization
        ↓
Internal reporting structures
        ↓
Dashboard source update
```

## Dashboard automation

The reporting process initially required manual intervention.

It later evolved into an automated recurring flow:

```text
Python process
        ↓
Virtual machine
        ↓
Hourly execution
        ↓
Google Sheets update
        ↓
Looker Studio dashboard
```

The Python process ran on a virtual machine.

It updated the Google Sheets data source used by Looker Studio.

The confirmed refresh frequency was hourly.

The portfolio may state:

> Automated an hourly reporting flow from Python on a virtual machine to
> Google Sheets and Looker Studio.

It must not describe the process as real-time.

## Tools involved

- GroupMail;
- GroupMail Insights;
- SMTP;
- Python;
- virtual machine infrastructure;
- Google Sheets;
- Looker Studio.

## Operator responsibilities

The operator confirms responsibility for work including:

- creating campaigns;
- loading campaign HTML;
- loading recipient bases;
- executing dispatches through SMTP;
- using GroupMail Insights tracking;
- downloading campaign metrics;
- parsing and formatting exported metrics;
- adapting those metrics to internal structures;
- automating the dashboard data flow;
- maintaining the hourly update process.

## Results supported by testimony

The workflow produced:

- repeatable campaign dispatch;
- measurable email and link interactions;
- campaign metrics available for internal analysis;
- reduced repetitive dashboard preparation;
- hourly dashboard source updates;
- recurring operational visibility in Looker Studio.

No exact performance uplift, time saving or revenue contribution has yet been
verified.

## Claims prohibited until evidence is recovered

Do not claim:

- real-time reporting;
- fully automated campaign execution;
- automatic ingestion directly from GroupMail Insights;
- a specific increase in opens, clicks, conversions or revenue;
- a specific reduction in processing time;
- uninterrupted operation throughout the entire employment period;
- current production availability.

## Current evidence gaps

The following have not yet been recovered:

- campaign HTML examples;
- anonymized recipient-base examples;
- GroupMail campaign exports;
- GroupMail Insights screenshots;
- tracking-tag examples;
- downloaded metric files;
- parsing scripts;
- field-mapping rules;
- scheduler configuration;
- virtual machine logs;
- Google Sheets structure;
- Looker Studio screenshots or exports.

## Human verification

Confirmed by the operator on 2026-07-20:

- GroupMail was used to create campaigns;
- campaign HTML and recipient bases were loaded manually;
- dispatch was performed through SMTP;
- GroupMail Insights was a paid tracking add-on;
- metrics were downloaded manually;
- exported metrics required parsing, formatting or processing;
- Python ran on a virtual machine;
- dashboard source data was updated hourly;
- Google Sheets supplied data to Looker Studio.

## Next movement

Review this file for factual accuracy and confidentiality.

Do not create the public portfolio case until the operator approves it.
