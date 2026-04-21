# Problem Pool Template

This document defines the shared building block called `Problem Pool Template`.

Use it as the assessment-item branch inside the shared cross-engine law at:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\SHARED_ITEM_LAYER_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SHARED_ITEM_LAYER_WORKFLOW.md)

## Purpose

`Problem Pool Template` is the first stable layer for item-level authoring.

It is not:

- the final mission bank
- the final SBRA step map
- a full distractor bank
- the final hints and solutions set

It is a structured source layer that connects:

- `module`
- `CLO`
- `Bloom`
- `problem type`
- `misconception direction`
- `usable downstream target`

Its job is to answer:

`Which item-level problems already exist in a form that can support active learning, quick checks, and later mission writing without blind guessing?`

## Recommended Location

Store the first problem-pool file here:

`courses/<course-id>/materials/processed/assessment/problem-pool-starter.md`

Additional files can later be split by module, for example:

- `problem-pool-module-01.md`
- `problem-pool-module-02.md`

## Readiness Rule

Do not open item-level problem-pool work too early.

The recommended order is:

1. `TQF3 markdown package`
2. `source_refs`
3. `Assessment Evidence Map`
4. `Mission Framing`
5. `Problem Pool Template`

Open this layer when the project already knows:

- module sequence
- CLO targeting
- evidence direction
- the first accepted mission families

This layer is not a course-specific exception. It should follow one reusable workflow across courses.

If the user already has a curated LaTeX problem set, open this upstream block first:

- [LATEX_PROBLEM_SET_INTAKE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/LATEX_PROBLEM_SET_INTAKE.md)

If the course still needs many more candidate problems, open the sourcing layer first through:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\PROBLEM_SOURCING_ENGINE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/PROBLEM_SOURCING_ENGINE.md)

## Minimum Columns

If the pool is written as a Markdown table, use at least these columns:

- `Problem ID`
- `Module`
- `CLO`
- `Bloom`
- `Problem Type`
- `Statement`
- `Target Skill`
- `Misconception Tags`
- `Usable For`
- `Difficulty`
- `Solution Status`
- `Solution Required`
- `Expected Answer Form`
- `Needs Solution Review`
- `Source`
- `Notes`

## Field Meaning

- `Problem ID`
  A stable id for the item.
- `Module`
  The module where the item belongs.
- `CLO`
  The CLO the problem is intended to measure or support.
- `Bloom`
  The intended cognitive level such as `understand`, `apply`, `analyze`, `evaluate`, or `create`.
- `Problem Type`
  The broad item shape such as `diagnosis`, `classification`, `proof-repair`, `construction`, `reflection`, or `project-checkpoint`.
- `Statement`
  The learner-facing problem statement or short prompt.
- `Target Skill`
  The main skill the learner should demonstrate.
- `Misconception Tags`
  Short tags for the likely mistake patterns.
- `Usable For`
  The downstream uses such as `active-learning`, `quick-check`, `mission`, or `sbra`.
- `Difficulty`
  A coarse level such as `easy`, `medium`, or `hard`.
- `Solution Status`
  The current solution layer state such as `not_started`, `drafted`, or `reviewed`.
- `Solution Required`
  Whether the item should eventually receive a worked answer or solution draft before downstream use.
- `Expected Answer Form`
  The likely answer shape such as `expression`, `numeric-or-expression`, `interval-description`, `function-form`, `equation`, `optimal-value`, `rate-value`, or `multi-part-mixed`.
- `Needs Solution Review`
  Whether the item still needs a human check on its solution layer before promotion into stronger assessment assets.
- `Source`
  Where the item came from, such as `TQF3`, instructor notes, worksheet, or project handbook.
- `Notes`
  Anything still missing before the item can become a stronger runtime asset.

## Preferred Shape

Use YAML frontmatter for file-level defaults, then a Markdown table for the item rows.

Recommended frontmatter:

```md
---
course_id: example_course
module_id: module-01
default_clo: CLO1
default_bloom: apply
pool_status: starter
---
```

Recommended table:

```md
| Problem ID | Module | CLO | Bloom | Problem Type | Statement | Target Skill | Misconception Tags | Usable For | Difficulty | Solution Status | Solution Required | Expected Answer Form | Needs Solution Review | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| item-01 | module-01 | CLO1 | apply | diagnosis | ... | ... | tag-a, tag-b | quick-check, mission | medium | not_started | true | numeric-or-expression | true | TQF3 + notes | needs refinement |
```

## Semi-Automatic Engine

Typical upstream inputs before this point include:

- `latex-problem-set-intake.md`
- `assessment-source-draft.md`
- screened retrieval candidates

When the starter table is stable enough, move it into the assessment-engine rail:

```bash
node tools/init-assessment-engine.mjs --course-dir courses/<course-id>
node tools/promote-latex-intake-classification-to-pool.mjs --course-dir courses/<course-id>
node tools/build-solution-drafts.mjs --course-dir courses/<course-id>
node tools/solve-solution-drafts.mjs --course-dir courses/<course-id>
node tools/classify-problem-pool.mjs --course-dir courses/<course-id>
node tools/build-mission-drafts.mjs --course-dir courses/<course-id>
```

This produces:

- `materials/processed/assessment/problem-pool.json`
- `generated/assessment/assessment-classification.json`
- `generated/assessment/mission-drafts.json`

At this stage AI is still only a proposer. Human approval is required before anything should be treated as runtime mission content.

## Downstream Use

This pool is meant to feed:

1. `module-active-learning`
2. `module-checkpoints`
3. `quick-check` drafts
4. `Mission Framing`
5. later `missions/missions.json`

The important point is that the problem pool should reduce guessing before SBRA or mission-item writing begins.

## What Makes A Good Starter Pool

A good starter pool:

- separates items clearly
- keeps ids stable
- maps each item to a module and CLO
- records the intended Bloom level
- records likely misconception direction
- says where the item can be reused downstream
- records whether and how a solution layer should be added later

## What Not To Do

Do not wait for a perfect item bank before opening the file.

Do not force full distractors, hints, and full solutions into the first version.

Do not invent mission steps directly inside the problem pool unless the item is already mature enough for that.

## Anti-Loop Rule

The first goal is a stable baseline, not a perfect schema.

Treat this block as `baseline accepted` when:

- at least one real course can store item-level rows clearly
- the pool supports module-level reuse
- the pool supports at least one later mission-framing or quick-check move

Only reopen the schema if real-course use shows a concrete failure.

