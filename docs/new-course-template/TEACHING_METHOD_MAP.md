# Teaching Method Map

This document defines the shared building block called `Teaching Method Map` for courses that start from `TQF3` or a similar course-design source.

## Purpose

`Teaching Method Map` is not a lesson script, widget spec, or item-level activity bank.

It is a bridge that connects:

- `TQF3 teaching methods`
- `learning intent`
- `linked modules`
- `activity family`
- `placeholder targets`

Its job is to help Codex and the course author answer this question:

`How should the teaching methods described in TQF3 turn into reusable active-learning blocks in the course site?`

## Recommended Location

Store the file here when a course starts from TQF3:

`courses/<course-id>/materials/processed/intake/tqf3-teaching-method-map.md`

## What This Map Must Answer

At minimum, the map should answer:

1. Which original `teaching method` appears in TQF3?
2. What is the `learning intent` behind that method?
3. Which `module` or modules should use it?
4. Which reusable `activity family` fits that method?
5. Which placeholder target should receive it?

## Recommended Columns

If the map is written as a Markdown table, use at least these columns:

- `Source Method`
- `Learning Intent`
- `Linked Modules`
- `Activity Family`
- `Placeholder Target`
- `Notes / Gaps`

## Field Meaning

- `Source Method`
  The wording or short summary of the teaching method from TQF3.
- `Learning Intent`
  Why this method exists in the course, such as concept building, theorem use, proof fluency, strategy selection, or reflection.
- `Linked Modules`
  The modules where this method should appear.
- `Activity Family`
  The reusable active-learning family that the method becomes in the template.
- `Placeholder Target`
  The target block that should use this row, usually `intro-how-we-learn` or `module-active-learning`.
- `Notes / Gaps`
  What still cannot be decided from TQF3 alone.

## Recommended Activity Families

Use a small reusable vocabulary first. The baseline set is:

- `guided discussion`
- `guided exploration`
- `proof practice`
- `proof repair`
- `counterexample hunt`
- `theorem-condition diagnosis`
- `parameter play`
- `reflection`

Do not expand this family list unless real-course testing shows a clear need.

## Relationship To Placeholder Filling

This map is still one step before deep module authoring.

The intended flow is:

1. `TQF3 teaching methods`
2. `tqf3-teaching-method-map.md`
3. `intro` how-we-learn framing
4. `module-active-learning` placeholder filling
5. deeper course-specific activity writing later

## Bridge Method

When this building block is used in the repo, the intended chain is:

1. `TQF3 teaching-method wording`
2. `Teaching Method Map`
3. `intro` how-we-learn bullets
4. `module-active-learning` seeds in `modules/*.md`

The purpose of this chain is to avoid jumping directly from generic teaching-method wording into detailed activity prose.

Each layer should answer a different question:

- `Teaching Method Map`
  What reusable active-learning family does this TQF3 method become?
- `intro`
  How should the learner be told that the course works?
- `module-active-learning`
  What kind of active-learning block belongs in this module?

## What This Map Is Good For

- shaping the learner-facing `how we learn` section on `intro`
- seeding `module-active-learning` without guessing
- keeping active-learning direction aligned with TQF3
- slowing the workflow down before deep activity writing starts too early

## What This Map Is Not

This file is not:

- a widget configuration file
- a full lesson plan
- an item-level prompt bank
- a mission bank
- a problem pool

## Baseline Acceptance Rule

This bridge can be treated as `baseline accepted` when:

- one real course can map TQF3 methods into reusable activity families
- the map can feed both `intro-how-we-learn` and `module-active-learning`
- no new schema fields are required to keep that flow working

## Anti-Loop Rule

When the `Teaching Method Map` reaches an accepted baseline:

- mark it as accepted
- stop expanding the schema just because more detail is possible
- reopen it only if real-course testing shows a concrete failure, such as:
  - `intro` still cannot explain the learning style cleanly
  - `module-active-learning` still cannot be seeded from the map
  - a real course reveals a missing field

