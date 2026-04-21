# TQF3 Markdown Package

This document defines the Markdown package that should exist when a course starts from `TQF3` or a similar weekly teaching plan.

The goal is not to finish full lesson authoring immediately. The goal is to convert TQF3 into stable source files that Codex can use to fill placeholders, connect modules, and prepare mission design without guessing.

## Purpose

This package should answer:

- What is this course?
- What modules should exist, and in what order?
- Which CLOs are introduced, practiced, and assessed where?
- What assessment direction is already visible from TQF3?
- Which source files are still missing before deep module or mission authoring starts?

## Recommended Location

Store these files under:

`courses/<course-id>/materials/processed/`

## Minimum Package

These four files are the minimum set before deep authoring should begin.

### 1. `tqf3-course-anchor.md`

Use this file to extract course-level identity:

- course code
- Thai and English course names
- credits
- short course description
- instructor or attribution
- learner-facing course overview draft

This file feeds:

- `course.config.json`
- `index` hero and overview
- `intro` course promise

### 2. `tqf3-clo-map.md`

Use this file to extract and normalize CLOs while staying faithful to TQF3.

It should include:

- `clo_id`
- full CLO wording
- short CLO wording
- Bloom level
- notes about whether the CLO is mainly `introduce`, `practice`, or `assess`

This file feeds:

- `course.config.json`
- `intro` expectations
- `lessons` CLO chips
- `missions` targeting

### 3. `tqf3-week-to-module-map.md`

Use this file to translate the weekly teaching plan into modules for the site.

It should include:

- week or week range
- TQF3 topics
- module id or slug
- module title
- reason for grouping those weeks together
- linked CLOs
- placeholder targets for `lessons` and `module` pages

This file feeds:

- module count
- module order
- `lessons` roadmap
- `source_refs` for each module

### 4. `tqf3-assessment-evidence-map.md`

Use this file to translate the assessment direction from TQF3 into a reusable evidence map.

It should include:

- target CLO
- Bloom level
- linked module
- evidence type such as `quick-check`, `proof task`, `practice mission`, or `SBRA candidate`
- assessment role such as `diagnostic`, `formative`, `practice`, or `assess`
- badge hook direction
- notes about what TQF3 still does not provide

This file feeds:

- `intro` assessment framing
- `missions` page framing
- badge logic direction at CLO level
- the step before real SBRA authoring

## Recommended Support Package

These files are not mandatory at first, but they are still useful building blocks.

### 5. `tqf3-teaching-method-map.md`

Use this file to translate teaching methods from TQF3 into active-learning block families.

It should include:

- original teaching method from TQF3
- learning meaning or intended use
- linked modules
- activity family such as `discussion`, `guided exploration`, `proof practice`, or `parameter play`

This file feeds:

- `intro` how-we-learn
- `module-active-learning`

Use [TEACHING_METHOD_MAP.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TEACHING_METHOD_MAP.md) as the shared baseline law for this file.

### 6. `tqf3-resource-seed-list.md`

Use this file to capture reference materials and starter resources.

It should include:

- resource name
- resource type
- linked module
- role such as `main text`, `support`, `practice`, or `review`

This file feeds:

- `resources/manifest.json`
- resource grouping on the resources page

Use [RESOURCE_SEED_LIST.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/RESOURCE_SEED_LIST.md) as the shared baseline law for this file.

### 7. `tqf3-clo-coverage-view.md`

Use this file to show where each CLO is introduced, practiced, and assessed across the module sequence.

It should include:

- target CLO
- linked module
- coverage role such as `introduce`, `practice`, or `assess`
- a short reason for placing that role there

This file feeds:

- `lessons` CLO emphasis and roadmap cues
- `missions` targeting direction
- badge direction at the CLO level

Use [CLO_COVERAGE_VIEW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/CLO_COVERAGE_VIEW.md) as the shared baseline law for this file.

## Flow Into This Repo

When the package exists, the intended flow is:

1. Store the package under `materials/processed/`
2. Read `generated/workflow/README_FIRST.md` and `generated/workflow/CURRENT_TASK.md`
3. Confirm that the minimum package is present
4. Use `tqf3-week-to-module-map.md` as the basis for `source_refs`
5. Use `source_refs` to fill `modules/*.md`
6. Use `tqf3-assessment-evidence-map.md` for mission framing before real SBRA writing
7. Use `apply-mission-framings.mjs` to move accepted framing into `missions/missions.json`
8. Use `apply-resource-seeds.mjs` to move accepted resource seeds into `resources/manifest.json`
9. Use `apply-badge-hooks.mjs` to move accepted badge hooks into `course.config.json`

## Real-Course Reminder

The package is only the first stable layer.

After the package is prepared, the real-course check should continue through:

1. `apply-source-refs`
2. `apply-mission-framings`
3. `apply-resource-seeds`
4. `apply-badge-hooks`
5. `build-course`
6. `validate-course --check-output`

If a bridge fails during a real-course run, treat it as framework hardening work and fix the bridge at the source.

See:

- [C:\Users\User\Documents\Cause_gen\docs\REAL_COURSE_HARDENING.md](/C:/Users/User/Documents/Cause_gen/docs/REAL_COURSE_HARDENING.md)

## What This Package Does Not Replace

This package still does not replace item-level content such as:

- worked examples
- a full problem pool
- distractors
- SBRA steps
- hints and solutions

It is a bridge from `TQF3` to placeholder filling and source framing, not the final source for item-level course content.

## Practical Rule

If a course starts from `TQF3`:

- this minimum package or an equivalent set of files should exist
- if it does not exist yet, do not jump into deep `modules/*.md` or `missions/*.json` authoring
- the safe work at that stage is source classification, framing, and working-doc setup

## Bootstrap Rule

It is acceptable to open a new course with only `TQF3` plus the current extracted Markdown package.

The intended workflow is:

1. extract what is already visible from TQF3
2. scaffold the course
3. build the first output from the current source state
4. accept that inside content may still be partial
5. add stronger materials in later rounds

Do not wait for perfect inside content before generating the first course output.

The first output is still useful if it honestly shows:

- the course structure
- the module sequence
- the CLO direction
- the assessment direction
- the current placeholder state

## Anti-Loop Rule

When any TQF3-based building block reaches an accepted baseline:

- mark it as `baseline accepted`
- stop expanding the schema immediately
- reopen it only when new evidence shows the baseline is not enough, for example:
  - output is wrong
  - validation fails
  - placeholder filling fails during real-course use
  - user review says the behavior still misses the target

Do not reopen a baseline only because more explanation or more detail is still possible.

## Accepted Building Blocks From TQF3

After the minimum package and `source_refs` baseline are stable, these building blocks are the accepted shared layers:

1. `Assessment Evidence Map`
   Connect `CLO -> Bloom -> module -> evidence type -> badge hook`

2. `Teaching Method Map`
   Translate TQF3 teaching methods into reusable active-learning families

3. `Resource Seed List`
   Seed the resources layer in a structured way

4. `CLO Coverage View`
   Show where each CLO is introduced, practiced, and assessed

5. `Source Inventory Status`
   Show what already exists in `materials/processed/` and what is still missing

Use [SOURCE_INVENTORY_STATUS.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SOURCE_INVENTORY_STATUS.md) as the shared baseline law for this block.

## Not Worth Deepening Yet

Do not try to get these directly from TQF3 alone:

- full problem pools
- item-level distractors
- real SBRA items
- item-level hints or solutions
- heavy course-specific copy polishing

## Next Layer After The Package

Once the package, bridges, and first honest output are stable, the next item-level shared block is:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\PROBLEM_POOL_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/PROBLEM_POOL_TEMPLATE.md)

This block belongs after the framing and bridge layer, not before it.

Those belong to later stages after stronger module- or item-level source exists.

