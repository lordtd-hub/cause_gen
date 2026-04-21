# CLO Coverage View

This document defines the shared building block called `CLO Coverage View` for courses that start from `TQF3` or a similar course-design source.

## Purpose

`CLO Coverage View` is not a lesson script, mission bank, or assessment map.

It is a bridge that connects:

- `CLO`
- `module order`
- `coverage role`
- `learning sequence`

Its job is to help Codex and the course author answer this question:

`Where is each CLO introduced, practiced, and assessed across the course?`

## Recommended Location

Store the file here when a course starts from TQF3:

`courses/<course-id>/materials/processed/intake/tqf3-clo-coverage-view.md`

## What This View Must Answer

At minimum, the view should answer:

1. Which `CLO` is being tracked?
2. In which `module` does it appear?
3. Is that module mainly `introduce`, `practice`, or `assess` for the CLO?
4. Does the sequence across modules make sense for learner progression?

## Recommended Columns

If the view is written as a Markdown table, use at least these columns:

- `CLO`
- `Module`
- `Coverage Role`
- `Why Here`
- `Notes / Gaps`

## Field Meaning

- `CLO`
  The target course learning outcome.
- `Module`
  The module where that CLO appears.
- `Coverage Role`
  One of `introduce`, `practice`, or `assess`.
- `Why Here`
  A short explanation for why this module has that role for this CLO.
- `Notes / Gaps`
  Anything TQF3 still does not tell us clearly.

## Relationship To Other TQF3 Maps

This view sits between `tqf3-clo-map.md` and deeper module or mission writing.

The intended flow is:

1. `TQF3 CLO wording`
2. `tqf3-clo-map.md`
3. `tqf3-clo-coverage-view.md`
4. module chips, roadmap framing, mission targeting

## Bridge Method

When this building block is used in the repo, the intended chain is:

1. `CLO map`
2. `CLO Coverage View`
3. `lessons` CLO chips and module emphasis
4. `missions` targeting direction
5. badge logic direction at the CLO level

The purpose of this chain is to avoid guessing where each CLO should first appear, where it should be practiced, and where it should be assessed.

## What This View Is Good For

- showing a clear CLO progression across modules
- keeping `lessons` and `missions` aligned
- supporting badge direction at the CLO level
- slowing the workflow down before deep mission writing starts too early

## What This View Is Not

This file is not:

- a Bloom map by itself
- an assessment evidence map
- a module outline
- a mission bank
- an item-level rubric

## Baseline Acceptance Rule

This bridge can be treated as `baseline accepted` when:

- one real course can place each CLO across modules with `introduce / practice / assess`
- the sequence supports both `lessons` framing and `missions` targeting
- no new schema fields are required to keep that flow working

## Anti-Loop Rule

When the `CLO Coverage View` reaches an accepted baseline:

- mark it as accepted
- stop expanding the schema just because more detail is possible
- reopen it only if real-course testing shows a concrete failure, such as:
  - `lessons` still cannot signal CLO emphasis clearly
  - `missions` still cannot target modules cleanly from the coverage view
  - a real course reveals a missing field

