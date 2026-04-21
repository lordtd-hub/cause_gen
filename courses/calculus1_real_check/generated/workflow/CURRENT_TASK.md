# CURRENT TASK

## Current Goal

- task: Verify the new Engine 3 and Engine 4 collection rails on a real calculus course and confirm reviewed promotion through the Core Course Engine
- requested by: User
- date: 2026-04-21

## Scope

- course_dir: `courses/calculus1_real_check`
- output_dir: `courses/calculus1_real_check/output/`
- files to read first:
  - `generated/workflow/README_FIRST.md`
  - `generated/workflow/DECISION_LOG.md`
  - `generated/workflow/COURSE_BRIEF.md`
  - `generated/workflow/COURSE_PLAN.md`
- files expected to change:
  - `generated/workflow/CURRENT_TASK.md`
  - `generated/workflow/COURSE_PLAN.md`
  - `generated/workflow/DECISION_LOG.md`
  - `generated/workflow/COURSE_BRIEF.md`
  - `generated/*.md`

## Do Now

1. Keep Engine 1 framing and Engine 2 runtime baseline closed unless a rerun fails
2. Keep the curated LaTeX intake path as the default assessment-source path for this course
3. Maintain `problem-pool.json` as the source of truth for assessment items
4. Use `build-solution-drafts` and `solve-solution-drafts` as the new `store first, solve later` rail
5. Review the one blocked retrieval artifact and decide whether to replace it, rewrite it, or drop it from the pool
6. Choose the next module that should move from solved pool items into reviewed mission authoring
7. Re-run validate, readiness, and mojibake checks after any further promotion work
8. Record what full-pool solving proved and what still needs hardening

## TQF3 Package Check

- law reference: `docs/new-course-template/TQF3_MD_PACKAGE.md`
- assessment map reference: `docs/new-course-template/ASSESSMENT_EVIDENCE_MAP.md`
- minimum package files expected in `materials/processed/`:
  - `tqf3-course-anchor.md`
  - `tqf3-clo-map.md`
  - `tqf3-week-to-module-map.md`
  - `tqf3-assessment-evidence-map.md`
- recommended support files:
  - `tqf3-teaching-method-map.md`
  - `tqf3-resource-seed-list.md`
- current package status:
  - present:
  - missing:

## Stop And Ask If

- the CLOs need to change
- the module structure needs to change
- the assessment model needs to change
- the SBRA direction needs to change

## Definition Of Done For This Task

- the curated LaTeX intake files remain stable under `materials/processed/assessment/`
- `problem-pool.json` remains current and fully classified by module
- `solution-drafts.json` contains real `expected_answer` and `full_solution_latex` for every honest solvable item in the pool
- blocked items remain explicitly blocked instead of getting fabricated answers
- `validate-course --check-output` still passes
- `check-workflow-readiness` still reports `assessment-ready`, `content-ready`, and `ready-for-publishable-baseline`

## Response Back To User

- What was done:
- Result:
- Next step:
- Agree or want changes:


