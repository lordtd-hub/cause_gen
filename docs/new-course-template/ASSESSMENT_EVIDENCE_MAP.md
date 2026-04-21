# Assessment Evidence Map

This document defines the shared building block called `Assessment Evidence Map` for courses that start from `TQF3` or a similar course-design source.

## Purpose

`Assessment Evidence Map` is not a mission bank, problem pool, or SBRA item set.

It is a bridge that connects:

- `CLO`
- `Bloom's taxonomy`
- `module`
- `evidence type`
- `assessment role`
- `badge hook`

Its job is to help Codex and the course author answer this question:

`What evidence should exist before we can honestly say a learner is progressing toward this CLO at the intended Bloom level?`

## Recommended Location

Store the file here when a course starts from TQF3:

`courses/<course-id>/materials/processed/intake/tqf3-assessment-evidence-map.md`

## What This Map Must Answer

At minimum, the map should answer:

1. Which `CLO` is being targeted?
2. Which `Bloom` level is involved?
3. In which `module` should this evidence appear?
4. What `evidence type` fits this learning target?
5. Is the evidence mainly `diagnostic`, `formative`, `practice`, or `assess`?
6. How should this evidence contribute to `badges` or learner progression?

## Recommended Columns

If the map is written as a Markdown table, use at least these columns:

- `CLO`
- `Bloom`
- `Module`
- `Evidence Type`
- `Activity Family`
- `Assessment Role`
- `Badge Hook`
- `Notes / Gaps`

## Field Meaning

- `CLO`
  The target course learning outcome.
- `Bloom`
  The intended cognitive level such as `understand`, `apply`, `analyze`, `evaluate`, or `create`.
- `Module`
  The module where the evidence should appear.
- `Evidence Type`
  The broad form of evidence such as `quick-check`, `proof task`, `practice mission`, `reflection`, or `SBRA candidate`.
- `Activity Family`
  The reusable learning-activity family such as `definition unpack`, `proof practice`, `error analysis`, or `parameter play`.
- `Assessment Role`
  The role of this evidence in the course, for example `diagnostic`, `formative`, `practice`, or `assess`.
- `Badge Hook`
  The way this evidence should count toward badge progress or badge unlocking.
- `Notes / Gaps`
  Anything TQF3 does not yet provide and must be added later.

## Relationship To Missions

This file is still one step before real mission authoring.

The intended flow is:

1. `TQF3`
2. `tqf3-assessment-evidence-map.md`
3. mission framing
4. SBRA candidate selection
5. mission item writing

Current repo bridge:

- use `node tools/apply-mission-framings.mjs --course-dir courses/<course-id>` to turn accepted mission framings into draft runtime missions in `missions/missions.json`
- use `node tools/apply-badge-hooks.mjs --course-dir courses/<course-id>` to turn accepted badge hooks into badge rules in `course.config.json`

## Bridge Method

When this building block is used in the repo, the intended chain is:

1. `TQF3 assessment direction`
2. `Assessment Evidence Map`
3. `Mission Framing`
4. `missions/missions.json` draft

The purpose of this chain is to avoid jumping directly from TQF3 into item-level mission writing.

Each layer should answer a different question:

- `Assessment Evidence Map`
  What kind of evidence should exist for this CLO and Bloom level?
- `Mission Framing`
  What kind of mission should exist, and why?
- `missions/missions.json`
  What concrete runtime-ready mission structure should the system render?

When the bridge is healthy, this no longer stops at design-only framing. It should reach:

- runtime-ready mission drafts
- runtime badge rules

## Baseline Acceptance Rule

This bridge can be treated as `baseline accepted` when it has been tested with at least:

- one analysis-heavy example
- one proof-heavy example

and both examples can move from:

- evidence map
- to mission framing
- to a plausible mission JSON direction

without introducing new required schema fields.

## Relationship To Badges

`Badge Hook` exists so badges do not depend only on total XP.

The idea is that a learner may unlock badge progress because:

- the learner has enough evidence for a specific `CLO`
- the learner has evidence at a higher `Bloom` level
- the learner has accumulated evidence across multiple modules for the same CLO

Example draft hook names:

- `CLO1-understand-starter`
- `CLO2-apply-practice`
- `CLO3-analyze-readiness`

This file does not need the final badge formula yet. It only needs a stable direction.

## What This Map Is Good For

- framing assessment on `intro`
- shaping mission direction on `missions`
- connecting badge logic back to CLOs
- slowing the workflow down before item-level authoring starts too early

## What This Map Is Not

This file is not:

- a problem pool
- a distractor bank
- an SBRA step map
- an item-level rubric
- a hints or solutions document

## Anti-Loop Rule

When the `Assessment Evidence Map` reaches an accepted baseline:

- mark it as accepted
- stop expanding the schema just because more detail is possible
- reopen it only if real-course testing shows a concrete failure, such as:
  - mission framing still does not connect cleanly
  - badge hooks are not usable
  - a real CLO example reveals a missing field

