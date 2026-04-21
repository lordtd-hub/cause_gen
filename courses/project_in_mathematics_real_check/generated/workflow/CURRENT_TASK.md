# CURRENT TASK

## Current Goal

- task: Verify the four-engine replan on a real course and lock the review-first automation baseline
- requested by: User
- date: 2026-04-21

## Scope

- course_dir: `courses/project_in_mathematics_real_check`
- output_dir: `courses/project_in_mathematics_real_check/output/`
- files to read first:
  - `generated/workflow/README_FIRST.md`
  - `generated/workflow/DECISION_LOG.md`
  - `generated/bridges/SOURCE_TO_MODULE_MAP.md`
  - `materials/processed/intake/source-inventory-status.md`
- files expected to change:
  - `materials/processed/*.md`
  - `modules/*.md`
  - `missions/missions.json`
  - `resources/manifest.json`
  - `course.config.json`
  - `generated/*.md`

## Do Now

1. Keep Engine 1 as the framing layer
2. Keep Engine 2 as the final integrator only
3. Run Engine 3 through reviewed mission promotion
4. Run Engine 4 through reviewed content promotion
5. Keep shared sourcing in a common library only
6. Use engine-level readiness and publishability gates
7. Verify the orchestration command on a real course
8. Lock the architecture and audit docs to match the verified state
9. Keep problem sourcing and problem-pool work visible in the working docs
10. Keep the problem-pool authoring rail visible even after the reviewed promotion baseline passes
11. Keep Problem Pool decisions visible even while the four-engine baseline is marked ready

## TQF3 Package Check

- law reference: `docs/new-course-template/TQF3_MD_PACKAGE.md`
- current package status:
  - minimum package: complete
  - support package: complete
  - course-design bridge source: complete
  - item-level source: still missing

## Accepted Bridges In This Run

- `import-materials` preserved OOXML structure well enough for first-pass Markdown extraction
- `apply-source-refs` filled module placeholders from processed course-design source
- `apply-mission-framings` generated a real mission draft in `missions/missions.json`
- `apply-resource-seeds` generated real resource entries in `resources/manifest.json`
- `apply-badge-hooks` generated badge rules in `course.config.json`
- `init-assessment-engine` generated `problem-pool.json`
- `classify-problem-pool` generated `assessment-classification.json`
- `build-mission-drafts` generated `mission-drafts.json`
- `promote-mission-drafts` promoted one reviewed assessment asset through Engine 2
- `init-content-authoring` generated the content-authoring rail
- `screen-retrieved-content` generated review-first screened content candidates
- `classify-content-sources` generated `content-classification.json`
- `build-content-drafts` generated `content-drafts.json`
- `promote-content-drafts` promoted one reviewed content asset into module source through Engine 2
- `run-course-workflow` completed the safe orchestration pass without bypassing review gates

## Definition Of Done For This Task

- the engine audit matrix exists
- engine-level readiness is visible in the readiness report
- one reviewed assessment asset is promoted into runtime
- one reviewed content asset is promoted into module source
- the orchestrator can run safely on the real course
- the course reaches `ready-for-publishable-baseline`

## Response Back To User

- What was done:
- Result:
- Next step:
- Agree or want changes:


