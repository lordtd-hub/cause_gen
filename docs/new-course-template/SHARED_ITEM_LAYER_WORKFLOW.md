# Shared Item-Layer Workflow

This document locks the shared item-layer workflow for all courses in the Cause Gen repo.

The goal is to keep item-level authoring reusable across courses instead of turning one test course into the accidental standard.

## Purpose

The shared item-layer workflow defines how a course moves from reviewed upstream candidates into reusable item-level assets.

It covers both:

- `Engine 3: Assessment Authoring Engine`
- `Engine 4: Content Authoring Engine`

It does not replace engine-specific schemas. It only defines the shared rail, review gates, and promotion logic that every course should follow.

## Why This Exists

Without a shared item-layer workflow, each course risks inventing its own way to:

- store candidate items
- classify them against `CLO + Bloom`
- mark review status
- decide what is ready for promotion
- move approved assets into the Core Course Engine

This document keeps that process stable across courses.

## Shared Law

Treat item-layer work as a reusable workflow, not as course-specific handcrafted content.

Use real courses only as:

- integration fixtures
- pressure tests
- examples of the workflow

Do not let a single course become the hidden canonical schema for every later course.

## Shared Definition

`Item-layer` means the level where the repo starts working with real reusable teaching or assessment items rather than only course framing.

Examples:

- problem-pool entries
- quick-check choice items
- SBRA or BSRA-ready mission candidates
- hints, distractors, and feedback drafts
- interactive content blocks
- checkpoint seeds that are specific enough to reuse downstream

It does not mean final built HTML output.

## Shared Readiness Gate

Do not open item-layer work too early.

Before item-layer authoring begins, a course should already have:

1. the minimum `TQF3 markdown package`
2. a stable module sequence
3. accepted `source_refs`
4. accepted evidence direction
5. at least one clear downstream target for the item layer

Examples of downstream targets:

- `missions/missions.json`
- module active-learning choice blocks
- module checkpoint choice blocks
- reviewed runtime quick-check choice items

## Shared Assessment Outcome Rule

For the assessment branch, solved problems are not the final runtime product.

The final target is a `choice-based` assessment asset.

This includes:

- `quick-check` choice items
- `module checkpoint` choice items
- `active-learning` choice flows
- `SBRA` or `BSRA` step-based choice sequences

In this repo, the established internal label is `SBRA`, but it refers to the same step-and-reason choice format the user describes as `BSRA`.

For higher-value CLO evidence:

- `SBRA` or `BSRA` is the preferred assessment format
- each step should ask the learner to choose what should be written or done
- each step should also ask the learner to choose why that step is justified
- distractors must be tied to real misconceptions or plausible but wrong process choices

## Shared Workflow

Use this order for every course:

1. `Engine 1` frames the course from TQF3 or equivalent source
2. `Engine 2` builds the first honest baseline output
3. `Engine 3` or `Engine 4` opens item-layer work only after framing is stable
4. items are proposed and stored in engine-specific intermediate files
5. items are reviewed and approved
6. only approved items are promoted through `Engine 2`
7. `Engine 2` rebuilds and validates the course output

## Shared Branches

The shared item-layer workflow has two branches.

Preferred upstream inputs may differ by branch:

- assessment-item branch may start from curated LaTeX problem sets
- content-item branch may start from curated notes, slides, or source digests

### Assessment Item Branch

Use this branch for:

- problems
- assessment tasks
- quick-check choice items
- checkpoint choice items
- SBRA or BSRA candidates
- mission drafts

Typical flow:

0. optional `assessment-source-draft.md`
1. optional sourcing
2. `problem-pool-starter.md`
3. `problem-pool.json`
4. `solution-drafts.json`
5. `assessment-classification.json`
6. choice-authoring or BSRA transformation work
7. `mission-drafts.json`
8. reviewed promotion into `missions/missions.json`

### Content Item Branch

Use this branch for:

- learning activities
- interactive content
- concept explainers
- worked-example seeds
- checkpoint seeds

Typical flow:

0. optional `content-source-draft.md`
1. optional sourcing
2. `retrieved-content.json`
3. `screened-content.json`
4. `content-classification.json`
5. `content-drafts.json`
6. reviewed promotion into managed module blocks

## Shared Modes

Both branches support the same two modes:

1. `user-provided mode`
   use instructor-provided items directly when they are good enough
2. `engine-assisted sourcing mode`
   source candidate items when the course still lacks enough material

There is also one shared topic-guided mode:

3. `topic-to-source-draft mode`
   start from a topic/module/CLO/Bloom target, then let Codex prepare a structured source draft before normal sourcing/screening begins

User-provided material should take priority when it is sufficient.

## Shared Review Rule

AI is a proposer only.

Every promotable item must carry review metadata such as:

- `needs_human_review`
- `approval_status`
- `reviewed_by`
- `reviewed_at`
- `approved_target_destination`

No item should move directly from proposal to runtime without an approval step.

For the assessment branch, this rule also means:

- solution drafts are not yet runtime-ready
- open worked-solution text alone is not enough to count as a final assessment item
- the final review should include choice quality, distractor quality, and CLO-evidence strength

## Shared Promotion Rule

Engine 3 and Engine 4 must not write directly to final runtime output.

Allowed destinations:

- Engine 3 promotes approved assessment drafts into `missions/missions.json`
- Engine 4 promotes approved content drafts into managed blocks inside `modules/*.md`

Not allowed:

- writing directly into built HTML
- bypassing reviewed promotion
- treating raw sourced candidates as runtime-ready assets

## Shared Source Of Truth Rule

Keep the long-lived source of truth upstream.

Examples:

- `problem-pool.json` is more canonical than `missions.json` for assessment items
- `content-drafts.json` and reviewed module-source blocks are more canonical than built HTML for content items

The Core Course Engine owns final runtime files, but it should not become the first place where upstream item logic is invented.

## Shared Automation Rule

Automation should stop at review gates.

Safe automation may:

- initialize missing rails
- normalize starter files
- classify candidates
- build drafts
- promote already approved items

Safe automation must not:

- auto-approve drafts
- auto-publish pending items
- skip engine boundaries

## Shared Contract For Every Course

When testing a new course, ask these questions:

1. can the course open the shared item-layer workflow without inventing a new schema
2. can the course store reviewed items in the standard intermediate files
3. can at least one approved item be promoted through Engine 2
4. can the course rebuild and validate after promotion

If the answer is yes, the shared workflow is holding.

If the answer is no, fix the workflow contract before deepening course-specific authoring.

## Anti-Sprawl Rule

Do not respond to an item-layer gap by expanding Engine 2.

If item-level work is missing, fix it in:

- Engine 3
- Engine 4
- or the shared item-layer workflow

Do not move sourcing, screening, or classification logic into the Core Course Engine.

## Acceptance Rule

Treat the shared item-layer workflow as `baseline accepted` when:

- at least one real course proves the assessment branch
- at least one real course proves the content branch
- approved assets can be promoted through Engine 2
- build and output validation still pass after promotion

Only reopen this workflow when a real course shows a concrete failure.
