# Project Architecture

This document locks the shared four-engine architecture of the Cause Gen repo.

The main goal is to stop the core engine from carrying every concern at once.

## Architecture Overview

The repo is organized around four major engines:

1. `TQF3 Intake Engine`
2. `Core Course Engine`
3. `Assessment Authoring Engine`
4. `Content Authoring Engine`

Each engine has its own source layer, intermediate outputs, and review rules.

## Shared Item-Layer Workflow

The repo also has one cross-engine workflow that spans Engine 3 and Engine 4:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\SHARED_ITEM_LAYER_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SHARED_ITEM_LAYER_WORKFLOW.md)

This workflow exists so item-level authoring can stay reusable across courses instead of being reinvented inside each real-course fixture.

## Shared Runtime Rule

- Engine 1, Engine 3, and Engine 4 stay upstream
- Engine 2 is the final integrator
- Engine 3 and Engine 4 may bypass sourcing when the user already provides suitable input
- Engine 3 and Engine 4 must still promote reviewed drafts through Engine 2 before final runtime publication
- Engine 3 and Engine 4 may share sourcing infrastructure, but not downstream authoring schemas

## Shared Sandbox Tooling Rule

When this repo needs Python inside Codex sandbox, prefer the repo-local wrapper:

- `.\tools\python.cmd`

If PowerShell script execution is allowed, you may also use:

- `powershell -ExecutionPolicy Bypass -File .\tools\python.ps1`

These repo-local entrypoints point to the bundled Codex runtime Python instead of `AppData` installs or user PATH assumptions.

## Shared Design Law

- AI is the proposer
- schema is the rail
- human is the approver

The more an engine is upstream, the less it should write directly into runtime files.

## Shared Assessment Law

Assessment outputs in this repo must be treated as `choice-based` assessment assets.

That includes:

- `quick-check`
- `module checkpoint`
- `active-learning task`
- `SBRA` or `BSRA` step-and-reason items

In current repo language, `SBRA` is the established internal label for the same family of step-based, reason-based choice assessment that the user describes as `BSRA`.

Shared assessment meaning:

- ordinary worked-solution problems may be transformed into choice-based assessment items
- SBRA or BSRA is not a separate source-problem type
- SBRA or BSRA is the primary `CLO evidence` assessment format for higher-value mastery checks
- quick checks and checkpoints are lower-granularity choice formats, while SBRA or BSRA is the stronger evidence layer

This means Engine 3 should not stop at solution drafting alone. Its long-term target is reviewed choice-quality assessment authoring.

## Shared Sourcing Law

Engine 3 and Engine 4 share a common sourcing layer only.

Shared sourcing responsibilities:

- source policy records
- retrieval query plans
- topic-to-source-draft workflows
- provenance fields
- license notes and use-mode tags
- dedupe grouping
- screening status and review flags

Shared sourcing implementation:

- `tools/lib/shared-sourcing.mjs`

Shared review semantics:

- `needs_human_review`
- `screening_status`
- `recommended_use_mode`
- `approval_status`
- `reviewed_by`
- `reviewed_at`
- `approved_target_destination`

After screening, Engine 3 and Engine 4 must diverge into their own downstream schemas.

The shared item-layer workflow applies after divergence as well:

- Engine 3 keeps the assessment-item branch
- Engine 4 keeps the content-item branch
- both branches must still follow the same review-first and promote-through-Core rules

The repo also supports one shared topic-guided upstream block for both engines:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\TOPIC_SOURCE_DRAFT_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TOPIC_SOURCE_DRAFT_WORKFLOW.md)

## Engine 1: TQF3 Intake Engine

### Purpose

Turn `TQF3` source into the minimum structured materials needed to start honest course output and define the intended `CLO evidence` direction.

### Inputs

- `materials/raw/*.docx`
- `materials/raw/*.md`
- `materials/raw/*.tex`
- instructor notes or extracted text from TQF3

### Outputs

- `materials/processed/intake/tqf3-course-anchor.md`
- `materials/processed/intake/tqf3-clo-map.md`
- `materials/processed/intake/tqf3-week-to-module-map.md`
- `materials/processed/intake/tqf3-assessment-evidence-map.md`
- `materials/processed/intake/tqf3-teaching-method-map.md`
- `materials/processed/intake/tqf3-resource-seed-list.md`
- `materials/processed/intake/tqf3-clo-coverage-view.md`
- `materials/processed/intake/source-inventory-status.md`

### Source Of Truth

- `materials/raw/*`
- `materials/processed/tqf3-*.md`
- `materials/processed/intake/source-inventory-status.md`

### Contract

- This engine defines the course framing layer.
- It does not write runtime course output directly.
- It must be good enough to support the first honest build, even if content is still partial.

## Engine 2: Core Course Engine

### Purpose

Combine accepted source materials and shared bridges into the final course source and built output.

### Inputs

- TQF3 package files from Engine 1
- `modules/*.md`
- `generated/MISSION_FRAMING_*.md`
- `materials/processed/intake/tqf3-resource-seed-list.md`
- `materials/processed/intake/tqf3-assessment-evidence-map.md`
- accepted item/content assets from Engines 3 and 4

### Outputs

- `course.config.json`
- `modules/*.md`
- `missions/missions.json`
- `resources/manifest.json`
- `courses/<course-id>/output/*`

### Source Of Truth

- `course.config.json`
- `modules/*.md`
- `missions/missions.json`
- `resources/manifest.json`

### Contract

- This is the only engine that should own final runtime course files.
- It can consume accepted drafts from other engines.
- It should not absorb upstream discovery or authoring logic that belongs elsewhere.
- Promotion bridges may write into runtime source, but only as reviewed Engine 2 integration steps.

## Engine 3: Assessment Authoring Engine

### Purpose

Find or collect candidate problems, classify them against `CLO + Bloom`, and prepare reviewed choice-based assessment drafts, with SBRA or BSRA as the primary high-value `CLO evidence` target.

### Operating Modes

This engine supports two valid modes:

1. `user-provided mode`
   The user or instructor provides problems directly.
2. `engine-assisted sourcing mode`
   The engine helps find or screen candidate problems from educational sources.

The engine must not force sourcing if the user already has suitable problems.

### Inputs

- user-provided problem statements or worksheets
- user-provided LaTeX problem sets
- topic-guided assessment source drafts
- source policy and retrieval plans
- `retrieved-problems.json`
- `screened-problems.json`
- `problem-pool-starter.md`
- `problem-pool.json`
- course framing from Engine 1

### Outputs

- `materials/processed/assessment/latex-problem-set-intake.md`
- `assessment-source-draft.md`
- `generated/sourcing/problem-source-policy.json`
- `generated/sourcing/retrieval-queries.json`
- `generated/sourcing/retrieved-problems.json`
- `generated/sourcing/screened-problems.json`
- `materials/processed/assessment/problem-pool.json`
- `generated/assessment/assessment-classification.json`
- `generated/assessment/mission-drafts.json`
- `generated/bridges/assessment-promotion-log.json`

### Source Of Truth

- `generated/sourcing/problem-source-policy.json`
- `generated/sourcing/retrieval-queries.json`
- `generated/sourcing/retrieved-problems.json`
- `generated/sourcing/screened-problems.json`
- `materials/processed/assessment/problem-pool.json`
- `generated/assessment/assessment-classification.json`
- `generated/assessment/mission-drafts.json`

### Contract

- This engine may propose mappings to `module`, `CLO`, `Bloom`, `mission family`, and SBRA shape.
- This engine should treat worked-solution problems as upstream raw material that may later be transformed into choice-based assessment items.
- This engine should treat SBRA or BSRA as the strongest assessment-evidence format for deciding whether students have met target CLOs.
- All learner-facing assessment assets should terminate as `choice-based` items, not open worked-solution text only.
- This engine must keep `needs_human_review` gates.
- This engine must not write directly to `missions/missions.json`.
- Promotion into runtime mission files must happen through a separate reviewed bridge or through the Core Course Engine.
- If the user provides good problems directly, the engine may bypass sourcing and move straight into pool/classification/draft work.
- If the user provides a curated LaTeX problem set, the engine should prefer `latex-problem-set-intake.md` before any external retrieval path.
- If the user provides only a topic target, Codex may first build a structured assessment source draft before normal sourcing/screening starts.
- If the user does not provide enough problems, the engine may switch to sourcing mode and propose candidates for review.
- `problem-pool.json` remains the long-lived assessment source of truth, not `missions.json`.
- This engine follows the shared item-layer workflow for every course instead of inventing course-specific item rails.
- The current solution rail is an upstream preparation layer only. It is not the final assessment format.
- A later choice-authoring or BSRA transformation rail should convert approved solved items into sharp distractor-based choice assets.

## Engine 4: Content Authoring Engine

### Purpose

Find, organize, and transform course-content materials into interactive learning assets aligned with `CLO + Bloom`.

### Operating Modes

This engine supports two valid modes:

1. `user-provided mode`
   The user or instructor provides content, examples, notes, or learning materials directly.
2. `engine-assisted sourcing mode`
   The engine helps find and organize candidate learning materials from approved sources.

The engine must not force external sourcing if the user already has suitable course content.

### Inputs

- course framing from Engine 1
- user-provided content, notes, examples, slides, or reading materials
- topic-guided content source drafts
- content sources from educational materials, textbooks, notes, and approved web sources
- module targets from `tqf3-week-to-module-map.md`
- teaching direction from `tqf3-teaching-method-map.md`

### Outputs

- `content-source-draft.md`
- `generated/sourcing/content-source-policy.json`
- `generated/sourcing/content-retrieval-queries.json`
- `generated/sourcing/retrieved-content.json`
- `generated/sourcing/screened-content.json`
- `generated/content/content-classification.json`
- `generated/content/content-drafts.json`
- `generated/bridges/content-promotion-log.json`

### Source Of Truth

- `generated/sourcing/content-source-policy.json`
- `generated/sourcing/content-retrieval-queries.json`
- `generated/sourcing/retrieved-content.json`
- `generated/sourcing/screened-content.json`
- `generated/content/content-classification.json`
- `generated/content/content-drafts.json`

### Contract

- This engine may propose interactive learning content.
- This engine must not write directly to `modules/*.md` as final truth without review.
- This engine must not write directly to `courses/<course-id>/output/`.
- Promotion into learner-facing runtime or source files should happen through reviewed bridges or through the Core Course Engine.
- If the user provides suitable content directly, the engine may bypass sourcing and move into content drafting and mapping work.
- If the user provides only a topic target, Codex may first build a structured content source draft before normal sourcing/screening starts.
- If the user does not provide enough content, the engine may switch to sourcing mode and propose candidate learning materials for review.
- approved drafts may be promoted only into managed module-source blocks, never directly into built HTML output
- This engine follows the shared item-layer workflow for every course instead of inventing course-specific content-item rails.

## Boundary Rules

### Engine 1 -> Engine 2

- allowed: framing, maps, and package files
- not allowed: direct mutation of runtime output

### Engine 3 -> Engine 2

- allowed: reviewed assessment drafts
- not allowed: direct writes to `missions/missions.json`

### Engine 4 -> Engine 2

- allowed: reviewed content and activity drafts
- not allowed: direct writes to `modules/*.md` as final truth without review

### Engine 3 and Engine 4

- must stay upstream
- must prefer intermediate artifacts
- must keep human approval checkpoints
- must not bypass the Core Course Engine for final runtime publication
- must support both `user-provided input` and `engine-assisted sourcing`
- must treat user-provided material as preferred input when it is already sufficient

## Recommended Flow

1. run Engine 1 to create the TQF3 package
2. let Engine 2 build the first honest course baseline
3. open Engine 3 when the course needs a larger assessment/problem bank
4. open Engine 4 when the course needs richer interactive learning content
5. promote only reviewed drafts back into Engine 2

## Acceptance Gate

A course reaches the current `publishable baseline` only when:

1. Engine 1 is complete enough to provide framing
2. Engine 2 is complete enough to build and validate the baseline
3. at least one reviewed asset from Engine 3 or Engine 4 has been promoted through Engine 2

## Anti-Sprawl Rule

If new functionality belongs clearly to intake, assessment authoring, or content authoring, do not add it to the Core Course Engine by default.

The Core Course Engine should remain the final integrator, not the place where every upstream concern lives forever.


