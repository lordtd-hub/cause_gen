# Resource Seed List

This document defines the shared building block called `Resource Seed List` for courses that start from `TQF3` or a similar course-design source.

## Purpose

`Resource Seed List` is not the final resources page copy, a full bibliography, or a handout pack.

It is a bridge that connects:

- `TQF3 references`
- `resource role`
- `linked modules`
- `resource grouping`

Its job is to help Codex and the course author answer this question:

`Which starter resources already exist in TQF3, and how should they be organized before deep resource curation begins?`

## Recommended Location

Store the file here when a course starts from TQF3:

`courses/<course-id>/materials/processed/intake/tqf3-resource-seed-list.md`

## What This List Must Answer

At minimum, the list should answer:

1. Which `resource` is already visible in TQF3?
2. What `resource type` is it?
3. Which `module` or modules should it support?
4. What `role` should it play in the course?
5. How should it be grouped when the resources layer is built?

## Recommended Columns

If the list is written as a Markdown table, use at least these columns:

- `Resource Name`
- `Resource Type`
- `Linked Modules`
- `Role`
- `Grouping`
- `Notes / Gaps`

## Field Meaning

- `Resource Name`
  The reference title or short learner-facing name.
- `Resource Type`
  The broad type such as `textbook`, `reference`, `handout`, `practice`, or `interactive`.
- `Linked Modules`
  The modules where this resource should be useful.
- `Role`
  The role the resource plays, such as `main text`, `support`, `review`, or `practice`.
- `Grouping`
  The bucket that will later help build `resources/manifest.json`, such as `core references`, `module support`, or `practice and review`.
- `Notes / Gaps`
  Anything TQF3 still does not tell us clearly, such as edition, link, or file availability.

## Relationship To Placeholder Filling

This list is still one step before deep resource-page authoring.

The intended flow is:

1. `TQF3 references`
2. `tqf3-resource-seed-list.md`
3. `resources/manifest.json` seeds
4. grouped resource cards on the resources page
5. deeper curation later

Current repo bridge:

- use `node tools/apply-resource-seeds.mjs --course-dir courses/<course-id>` to turn the seed list into first-pass entries in `resources/manifest.json`

## Bridge Method

When this building block is used in the repo, the intended chain is:

1. `TQF3 references and support materials`
2. `Resource Seed List`
3. `resources/manifest.json`
4. `resources` page grouping and labels

The purpose of this chain is to avoid jumping directly from a raw reference list into a fully curated resources page.

When the bridge is healthy, the resource layer should no longer depend on manual first-pass manifest writing.

## What This List Is Good For

- seeding the resources layer from TQF3 without guessing
- grouping core references before links and files are fully curated
- keeping resources aligned with module needs
- slowing the workflow down before deep resource-page polishing starts too early

## What This List Is Not

This file is not:

- the final `resources/manifest.json`
- a polished learner-facing bibliography
- a download bundle
- a handout archive
- a citation style guide

## Baseline Acceptance Rule

This bridge can be treated as `baseline accepted` when:

- one real course can turn TQF3 references into stable resource groups
- the list can seed `resources/manifest.json` direction without needing new schema fields
- the list is enough to keep resource authoring from starting blind

## Anti-Loop Rule

When the `Resource Seed List` reaches an accepted baseline:

- mark it as accepted
- stop expanding the schema just because more detail is possible
- reopen it only if real-course testing shows a concrete failure, such as:
  - `resources/manifest.json` still cannot be seeded cleanly
  - module-resource grouping is still too ambiguous
  - a real course reveals a missing field

