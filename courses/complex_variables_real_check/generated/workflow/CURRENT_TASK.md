# CURRENT TASK

## Current Goal

- task: Record that retrieval/collection quality is still not satisfactory, then pause collection work until a better sourcing approach is chosen
- requested by: User
- date: 2026-04-21

## Scope

- course_dir: `courses/complex_variables_real_check`
- output_dir: `courses/complex_variables_real_check/output/`
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

1. Keep the current workflow baseline accepted for this course
2. Keep `TQF3 package`, bridges, build, and validate closed unless a later run fails
3. Keep learner-facing shell hardening closed for this course
4. Record that the collection engine was tested in both web-first and PDF-first modes
5. Record that the user is still not satisfied with retrieval quality
6. Pause deeper collection work until a better sourcing approach is chosen
7. Do not treat the current retrieval layer as a finished baseline
8. Reopen this layer only when the user wants to revisit the sourcing strategy

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
  - present: all minimum and support package files
  - missing: no critical TQF3 package files remain

## Optional Next Layer

- problem sourcing can now start with:
  - `generated/sourcing/problem-source-policy.json`
  - `generated/sourcing/retrieval-queries.json`
  - `generated/sourcing/retrieved-problems.json`
  - `generated/sourcing/screened-problems.json`
- this layer is for educational-source discovery before item-level authoring
- this layer should still keep human review for source policy and license checks
- this layer is currently paused because retrieval quality still needs redesign

## Stop And Ask If

- the CLOs need to change
- the module structure needs to change
- the assessment model needs to change
- the SBRA direction needs to change

## Definition Of Done For This Task

- the first framing pass is clear enough that Codex is not guessing at module or mission structure
- the first output can be built honestly from the current source state, even if inside content is still partial
- the Assessment Evidence Map direction is clear enough to connect CLO, Bloom, module, evidence type, and badge hook
- generated docs reflect the latest state
- if source changed materially, build and validate were run

## Response Back To User

- What was done: retrieval work was tested and documented, and the current collection quality was marked as not yet satisfactory
- Result: authoring rails remain usable, but collection quality is paused for redesign
- Next step: wait for a new sourcing idea before reopening retrieval work
- Agree or want changes:


