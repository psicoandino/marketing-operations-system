# Case 01 — Segmentation

## Authority

Operator-confirmed testimony.

No original model files, rule tables or evaluation outputs have yet been
recovered.

## Purpose

Transform the consolidated contact base into campaign audiences according to
program interest and historical behavior.

## Methods used

### Business rules

Operational segments were created using explicit criteria such as:

- area of interest;
- program interest;
- event participation;
- previous interactions;
- available contact attributes;
- campaign-specific conditions.

Business rules became the preferred long-term segmentation mechanism.

### Association rules

Association rules were used operationally to identify recurring relationships
between program interests, purchases or historical behavior.

A simplified relationship was:

```text
A → B
```

When contacts associated with A frequently also showed interest in B, that
relationship could support the construction of an audience for B.

This did not mean that every contact associated with A automatically received
communications about B.

The original support, confidence, lift thresholds and production parameters
have not yet been recovered.

### Random Forest

A Random Forest model was developed to estimate the probability that a
contact would be interested in a program.

The model reached operational experimental use.

It was later discontinued in favor of business-rule segmentation.

The portfolio may state that the model was developed and operationally tested.

It must not claim:

* permanent production use;
* a specific accuracy;
* a specific conversion uplift;
* a specific financial result.

## Current evidence gaps

The following have not yet been recovered:

* target-variable definition;
* feature list;
* training period;
* train/test procedure;
* model metrics;
* probability threshold;
* retraining procedure;
* association-rule parameter values;
* original segmentation code.

## Human verification

Confirmed by the operator on 2026-07-20:

* association rules were used operationally;
* Random Forest reached operational experimental use;
* Random Forest was later replaced by business rules.