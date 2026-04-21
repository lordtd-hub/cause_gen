# Source Inventory Status

This document defines the shared building block called `Source Inventory Status` for courses that start from `TQF3` or a similar course-design source.

## Purpose

`Source Inventory Status` is not a lesson map, mission map, or resource list.

It is a bridge that connects:

- `existing source files`
- `data layer`
- `readiness status`
- `next missing files`

Its job is to help Codex and the course author answer this question:

`What source already exists, what level is it at, and what still needs to be prepared before deeper authoring starts?`

## Recommended Location

Store the file here when a course starts from TQF3:

`courses/<course-id>/materials/processed/intake/source-inventory-status.md`

## What This Status Must Answer

At minimum, the inventory should answer:

1. Which source files already exist in `materials/processed/`?
2. Which data layer does each file belong to: `course`, `module`, or `item`?
3. What is the current `readiness` of that file?
4. Which expected files are still missing?
5. What is the next safe authoring move from the current inventory state?

## Recommended Columns

If the inventory is written as a Markdown table, use at least these columns:

- `File`
- `Layer`
- `Purpose`
- `Readiness`
- `Feeds`
- `Notes / Missing Next`

## Field Meaning

- `File`
  The source file name in `materials/processed/`.
- `Layer`
  One of `course`, `module`, or `item`.
- `Purpose`
  What the file is mainly for.
- `Readiness`
  A simple state such as `starter`, `usable`, or `needs extraction`.
- `Feeds`
  The downstream block this file helps, such as `course config`, `modules`, `missions`, or `resources`.
- `Notes / Missing Next`
  What still needs to happen before the file is truly useful for the next phase.

## Recommended Readiness Vocabulary

Use a small reusable vocabulary first:

- `starter`
- `usable`
- `needs extraction`

Do not expand this list unless real-course testing shows a clear need.

## Relationship To Other TQF3 Maps

This file sits above the other TQF3-derived building blocks.

The intended flow is:

1. inspect `materials/processed/`
2. write `Source Inventory Status`
3. identify missing maps
4. prepare the missing files before deep authoring

## Bridge Method

When this building block is used in the repo, the intended chain is:

1. `materials/processed/`
2. `Source Inventory Status`
3. missing-file checklist
4. safer decisions about whether module or mission authoring may begin

The purpose of this chain is to avoid pretending that the source is deeper or more complete than it really is.

## What This Status Is Good For

- making the current source state visible
- preventing Codex from treating course-level source as item-level source
- showing exactly which TQF3-derived files are still missing
- helping decide the next safe building block to create

## What This Status Is Not

This file is not:

- a replacement for the other TQF3 maps
- a quality score for the whole course
- a publish checklist
- a final authoring plan

## Baseline Acceptance Rule

This bridge can be treated as `baseline accepted` when:

- one real course can classify its current processed files into the three data layers
- the inventory can clearly show which important building blocks still need extraction
- no new schema fields are required to keep that flow working

## Anti-Loop Rule

When the `Source Inventory Status` reaches an accepted baseline:

- mark it as accepted
- stop expanding the schema just because more detail is possible
- reopen it only if real-course testing shows a concrete failure, such as:
  - the inventory still cannot reveal missing prerequisite files
  - Codex still misreads the current source depth
  - a real course reveals a missing field

