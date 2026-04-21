# Engine Audit Matrix

This document is the maintained readiness and maturity matrix for the four-engine Cause Gen architecture.

Use it together with [PROJECT_ARCHITECTURE.md](/C:/Users/User/Documents/Cause_gen/docs/PROJECT_ARCHITECTURE.md).

Use [SHARED_ITEM_LAYER_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SHARED_ITEM_LAYER_WORKFLOW.md) when you need the cross-engine law for item-level authoring that spans Engine 3 and Engine 4.

## Success Target

A course reaches the current `publishable baseline` when:

1. `Engine 1: TQF3 Intake Engine` is complete enough to supply framing.
2. `Engine 2: Core Course Engine` can build and validate the course baseline.
3. At least one reviewed upstream asset from `Engine 3` or `Engine 4` has been promoted through `Engine 2`.

## Shared Item-Layer Workflow

- Purpose:
  - keep item-level authoring reusable across courses instead of making one course-specific fixture the accidental standard
- Shared branches:
  - assessment-item branch
  - content-item branch
- Shared laws:
  - AI proposes
  - schema rails the work
  - human approves
  - Engine 2 is still the only final integrator
  - assessment assets should terminate as choice-based items
  - SBRA or BSRA is the primary CLO-evidence assessment format
- Shared upstream helper:
  - topic-to-source-draft workflow for assessment and content branches
- Current validators:
  - `tools/check-workflow-readiness.mjs`
  - reviewed promotion logs under `generated/bridges/`
- Current maturity:
  - `baseline-ready`

## Engine 1: TQF3 Intake Engine

- Purpose:
  - extract the minimum framing package from TQF3 and related raw course materials
- Current scripts:
  - `tools/init-new-course.mjs`
  - `tools/validate-init-spec.mjs`
  - `tools/import-materials.mjs`
- Source of truth:
  - `courses/<course-id>/materials/raw/*`
  - `courses/<course-id>/materials/processed/intake/*.md`
- Accepted outputs:
  - `tqf3-course-anchor.md`
  - `tqf3-clo-map.md`
  - `tqf3-week-to-module-map.md`
  - `tqf3-assessment-evidence-map.md`
  - `tqf3-teaching-method-map.md`
  - `tqf3-resource-seed-list.md`
  - `tqf3-clo-coverage-view.md`
  - `source-inventory-status.md`
- Validators:
  - `tools/check-workflow-readiness.mjs`
  - `tools/check-mojibake.mjs`
- Missing bridges:
  - none required for the current baseline
- Current maturity:
  - `framing-ready`

## Engine 2: Core Course Engine

- Purpose:
  - integrate reviewed upstream assets into runtime course source and final built output
- Current scripts:
  - `tools/draft-course.mjs`
  - `tools/apply-source-refs.mjs`
  - `tools/apply-mission-framings.mjs`
  - `tools/apply-resource-seeds.mjs`
  - `tools/apply-badge-hooks.mjs`
  - `tools/build-course.mjs`
  - `tools/validate-course.mjs`
- Source of truth:
  - `courses/<course-id>/course.config.json`
  - `courses/<course-id>/modules/*.md`
  - `courses/<course-id>/missions/missions.json`
  - `courses/<course-id>/resources/manifest.json`
  - `courses/<course-id>/output/*`
- Accepted outputs:
  - runtime module source
  - runtime missions
  - runtime resources
  - badge configuration
  - built course site
- Validators:
  - `tools/validate-course.mjs`
  - `tools/validate-course.mjs --check-output`
  - `tools/check-workflow-readiness.mjs`
- Missing bridges:
  - none required for the current baseline
- Current maturity:
  - `core-ready`

## Engine 3: Assessment Authoring Engine

- Purpose:
  - source or accept problems, classify them against `CLO + Bloom`, and prepare reviewed choice-based assessment drafts
- Current scripts:
  - `tools/init-problem-sourcing.mjs`
  - `tools/screen-retrieved-problems.mjs`
  - `tools/init-assessment-engine.mjs`
  - `tools/classify-problem-pool.mjs`
  - `tools/build-mission-drafts.mjs`
  - `tools/promote-mission-drafts.mjs`
- Shared sourcing dependency:
  - `tools/lib/shared-sourcing.mjs`
- Source of truth:
  - `courses/<course-id>/generated/sourcing/problem-source-policy.json`
  - `courses/<course-id>/generated/sourcing/retrieval-queries.json`
  - `courses/<course-id>/generated/sourcing/retrieved-problems.json`
  - `courses/<course-id>/generated/sourcing/screened-problems.json`
  - `courses/<course-id>/materials/processed/assessment/problem-pool.json`
  - `courses/<course-id>/generated/assessment/assessment-classification.json`
  - `courses/<course-id>/generated/assessment/mission-drafts.json`
- Accepted outputs:
  - `latex-problem-set-intake.md`
  - `assessment-source-draft.md`
  - solved problem candidates that are ready for later choice-authoring
  - reviewed mission drafts
  - reviewed assessment promotion logs
- Promotion contract:
  - only approved mission drafts may move into `missions/missions.json`
- Validators:
  - `tools/check-workflow-readiness.mjs`
  - reviewed promotion logs in `generated/bridges/assessment-promotion-log.json`
- Missing bridges:
  - batch promotion remains intentionally out of scope
  - retrieval quality from external sources is still under review and is not yet accepted as a user-satisfying baseline
  - topic-source-draft to retrieved-problems conversion is still a documented workflow, not a dedicated script yet
  - there is not yet a dedicated choice-authoring rail that converts solved pool items into reviewed `quick-check`, `checkpoint`, `active-learning`, and `SBRA` or `BSRA` choice assets
  - there is not yet a dedicated `BSRA transformation` script that turns worked solutions into step-choice plus reason-choice items with sharp distractors
- Current maturity:
  - `assessment-ready`

## Engine 4: Content Authoring Engine

- Purpose:
  - source or accept learning materials, classify them against `module + CLO + Bloom`, and prepare reviewed interactive/content drafts
- Current scripts:
  - `tools/init-content-authoring.mjs`
  - `tools/screen-retrieved-content.mjs`
  - `tools/classify-content-sources.mjs`
  - `tools/build-content-drafts.mjs`
  - `tools/promote-content-drafts.mjs`
- Shared sourcing dependency:
  - `tools/lib/shared-sourcing.mjs`
- Source of truth:
  - `courses/<course-id>/generated/sourcing/content-source-policy.json`
  - `courses/<course-id>/generated/sourcing/content-retrieval-queries.json`
  - `courses/<course-id>/generated/sourcing/retrieved-content.json`
  - `courses/<course-id>/generated/sourcing/screened-content.json`
  - `courses/<course-id>/generated/content/content-classification.json`
  - `courses/<course-id>/generated/content/content-drafts.json`
- Accepted outputs:
  - `content-source-draft.md`
  - reviewed content drafts
  - reviewed content promotion logs
- Promotion contract:
  - only approved content drafts may move into `modules/*.md`
  - promotion must use the managed block bridge, not direct runtime editing
- Validators:
  - `tools/check-workflow-readiness.mjs`
  - reviewed promotion logs in `generated/bridges/content-promotion-log.json`
- Missing bridges:
  - batch promotion remains intentionally out of scope
  - retrieval quality from external sources is still under review and is not yet accepted as a user-satisfying baseline
  - topic-source-draft to retrieved-content conversion is still a documented workflow, not a dedicated script yet
- Current maturity:
  - `content-ready`

## Retrieval Quality Status

- The shared authoring rails for Engines 3 and 4 are usable.
- The external collection layer is not yet considered finished.
- Current user decision:
  - the collection engine still needs more work before it is considered satisfactory
  - pause deeper retrieval work until a better sourcing approach is chosen

## Shared Sourcing Contract

Engine 3 and Engine 4 share only the sourcing library and review semantics.

Shared fields include:

- source policy entries
- retrieval query entries
- provenance metadata
- license notes
- attribution requirements
- recommended use mode
- dedupe group
- `needs_human_review`
- `screening_status`
- `approval_status`
- `reviewed_by`
- `reviewed_at`
- `approved_target_destination`

Downstream schemas remain separate after screening.

## Orchestration Status

The current orchestrator is:

- `tools/run-course-workflow.mjs`

Current behavior:

- detects missing rails
- initializes safe upstream files
- runs safe generation steps
- promotes only approved drafts
- stops automation at review gates instead of auto-publishing pending drafts
- prints the course readiness snapshot at the end

## Verified Integration Fixture

Current main integration fixture:

- `courses/project_in_mathematics_real_check/`

Verified facts:

- Engine 1 framing package is complete
- Engine 2 builds and validates the course
- one reviewed assessment draft has been promoted into runtime missions
- one reviewed content draft has been promoted into module source
- readiness reports `ready-for-publishable-baseline`
