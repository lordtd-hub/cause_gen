# New Course Template

This document set explains the workflow for opening and extending courses in this repo. It is the main entry point for the `TQF3-first` workflow.

## Four Engines

The repo is now organized around four engines:

1. `TQF3 Intake Engine`
2. `Core Course Engine`
3. `Assessment Authoring Engine`
4. `Content Authoring Engine`

Use [C:\Users\User\Documents\Cause_gen\docs\PROJECT_ARCHITECTURE.md](/C:/Users/User/Documents/Cause_gen/docs/PROJECT_ARCHITECTURE.md) as the boundary law for what each engine owns.

Use [C:\Users\User\Documents\Cause_gen\docs\ENGINE_AUDIT_MATRIX.md](/C:/Users/User/Documents/Cause_gen/docs/ENGINE_AUDIT_MATRIX.md) when you need the current maturity, missing bridges, validators, and source-of-truth summary for each engine.

## Core Laws

- Every new course must live under `courses/<course-id>/`
- Every built output must live under `courses/<course-id>/output/`
- If the only starting source is `TQF3`, it is still valid to scaffold the course and build the first honest output
- Do not jump from `TQF3` straight into item-level authoring
- Lock shared building blocks first, then deepen course-specific content later

## Source of Truth

The main course source lives in:

- `courses/<course-id>/course.config.json`
- `courses/<course-id>/modules/*.md`
- `courses/<course-id>/missions/missions.json`
- `courses/<course-id>/resources/manifest.json`
- `courses/<course-id>/materials/raw/*`
- `courses/<course-id>/materials/processed/*`

## Entry Points

- project architecture: [C:\Users\User\Documents\Cause_gen\docs\PROJECT_ARCHITECTURE.md](/C:/Users/User/Documents/Cause_gen/docs/PROJECT_ARCHITECTURE.md)
- quick start: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\START.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/START.md)
- interview questions: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\INTERVIEW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/INTERVIEW.md)
- new-course checklist: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\INIT_NEW_COURSE_CHECKLIST.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/INIT_NEW_COURSE_CHECKLIST.md)
- migration guide: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\MIGRATION_GUIDE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/MIGRATION_GUIDE.md)
- Codex workflow: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\CODEX_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/CODEX_WORKFLOW.md)
- Codex session protocol: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\CODEX_SESSION_PROTOCOL.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/CODEX_SESSION_PROTOCOL.md)
- Codex prompt pack: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\CODEX_PROMPT_PACK.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/CODEX_PROMPT_PACK.md)
- terminal-ready workflow: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\TERMINAL_COMMAND_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TERMINAL_COMMAND_WORKFLOW.md)

## TQF3 Building Blocks

If a course starts from `TQF3`, use these documents as one connected package:

- TQF3 markdown package: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\TQF3_MD_PACKAGE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TQF3_MD_PACKAGE.md)
- Assessment Evidence Map: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\ASSESSMENT_EVIDENCE_MAP.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/ASSESSMENT_EVIDENCE_MAP.md)
- Teaching Method Map: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\TEACHING_METHOD_MAP.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TEACHING_METHOD_MAP.md)
- CLO Coverage View: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\CLO_COVERAGE_VIEW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/CLO_COVERAGE_VIEW.md)
- Resource Seed List: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\RESOURCE_SEED_LIST.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/RESOURCE_SEED_LIST.md)
- Source Inventory Status: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\SOURCE_INVENTORY_STATUS.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SOURCE_INVENTORY_STATUS.md)

## Later-Stage Item Building Block

After the bridge layer is stable, use:

- Shared Item-Layer Workflow: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\SHARED_ITEM_LAYER_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SHARED_ITEM_LAYER_WORKFLOW.md)
- Topic Source Draft Workflow: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\TOPIC_SOURCE_DRAFT_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TOPIC_SOURCE_DRAFT_WORKFLOW.md)
- Problem Sourcing Engine: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\PROBLEM_SOURCING_ENGINE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/PROBLEM_SOURCING_ENGINE.md)
- LaTeX Problem Set Intake: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\LATEX_PROBLEM_SET_INTAKE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/LATEX_PROBLEM_SET_INTAKE.md)
- Problem Pool Template: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\PROBLEM_POOL_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/PROBLEM_POOL_TEMPLATE.md)
- Assessment Engine: `tools/assessment-engine/README.md`
- Assessment Source Draft Template: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\ASSESSMENT_SOURCE_DRAFT_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/ASSESSMENT_SOURCE_DRAFT_TEMPLATE.md)
- Content Source Draft Template: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\CONTENT_SOURCE_DRAFT_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/CONTENT_SOURCE_DRAFT_TEMPLATE.md)

Use the shared item-layer workflow as the governing rail before deepening any one course. Real courses should pressure-test this workflow, not replace it.

## Bridge Workflow

The repo now supports these core bridges:

1. `TQF3 -> md package`
2. `source_refs -> modules/*.md`
3. `Assessment Evidence Map -> Mission Framing -> missions/missions.json`
4. `Resource Seed List -> resources/manifest.json`
5. `Assessment Evidence Map badge hooks -> course.config.json badges`
6. `Educational source policy -> retrieval queries -> screened problems`
   Default sourcing mode should now be `document-first`, especially `PDF-first`, when stable educational documents are available.
   Topic-guided source drafts may be used before normal retrieval when the user starts from a target topic instead of a ready source list.
7. `LaTeX Problem Set Intake -> latex-problem-intake-classification.json -> Problem Pool or Problem Pool Starter`
8. `Problem Pool -> assessment-classification.json -> mission-drafts.json`
9. `Reviewed mission drafts -> missions/missions.json`
10. `Educational content policy -> retrieval queries -> screened content`
   Default sourcing mode should now be `document-first`, especially `PDF-first`, when stable educational documents are available.
   Topic-guided source drafts may be used before normal retrieval when the user starts from a target topic instead of a ready source list.
11. `Screened content -> content-classification.json -> content-drafts.json`
12. `Reviewed content drafts -> modules/*.md`

Notes:
- `.docx` import now reads OOXML directly to preserve structure better
- `.docx` import now uses `numbering.xml` when available so ordered lists survive better
- `.docx` import now keeps paragraph separation inside table cells more cleanly
- `.docx` import now splits dense inline enumerations from TQF3 files more aggressively before downstream mapping
- these bridges have now been tested on multiple real courses

See the hardening notes from real-course runs:

- [C:\Users\User\Documents\Cause_gen\docs\REAL_COURSE_HARDENING.md](/C:/Users/User/Documents/Cause_gen/docs/REAL_COURSE_HARDENING.md)
- [C:\Users\User\Documents\Cause_gen\docs\REAL_COURSE_WORKFLOW_CROSSCHECK.md](/C:/Users/User/Documents/Cause_gen/docs/REAL_COURSE_WORKFLOW_CROSSCHECK.md)

## Codex Working Pack

When `init-new-course.mjs` opens a new course, it automatically creates working files under `courses/<course-id>/generated/`.

Template references:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\README_FIRST_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/README_FIRST_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\CURRENT_TASK_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/CURRENT_TASK_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\DECISION_LOG_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/DECISION_LOG_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\COURSE_BRIEF_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/COURSE_BRIEF_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\COURSE_PLAN_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/COURSE_PLAN_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\MODULE_AUTHORING_QUEUE_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/MODULE_AUTHORING_QUEUE_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\SBRA_DESIGN_LOG_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/SBRA_DESIGN_LOG_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\RELEASE_CHECKLIST_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/RELEASE_CHECKLIST_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\ASSESSMENT_EVIDENCE_MAP_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/ASSESSMENT_EVIDENCE_MAP_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\TEACHING_METHOD_MAP_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/TEACHING_METHOD_MAP_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\CLO_COVERAGE_VIEW_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/CLO_COVERAGE_VIEW_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\RESOURCE_SEED_LIST_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/RESOURCE_SEED_LIST_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\SOURCE_INVENTORY_STATUS_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/SOURCE_INVENTORY_STATUS_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\LATEX_PROBLEM_SET_INTAKE_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/LATEX_PROBLEM_SET_INTAKE_TEMPLATE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\templates\PROBLEM_POOL_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/templates/PROBLEM_POOL_TEMPLATE.md)

## Main Commands

```bash
.\tools\python.cmd --version
node tools/validate-init-spec.mjs --spec docs/new-course-template/init-course.spec.example.json
node tools/init-new-course.mjs --spec docs/new-course-template/init-course.spec.example.json
node tools/import-materials.mjs --course-dir courses/<course-id>
node tools/apply-source-refs.mjs --course-dir courses/<course-id>
node tools/apply-mission-framings.mjs --course-dir courses/<course-id>
node tools/apply-resource-seeds.mjs --course-dir courses/<course-id>
node tools/apply-badge-hooks.mjs --course-dir courses/<course-id>
node tools/init-problem-sourcing.mjs --course-dir courses/<course-id>
node tools/retrieve-problems.mjs --course-dir courses/<course-id>
node tools/screen-retrieved-problems.mjs --course-dir courses/<course-id>
node tools/promote-screened-problems-to-pool.mjs --course-dir courses/<course-id>
node tools/classify-latex-problem-intake.mjs --course-dir courses/<course-id>
node tools/promote-latex-intake-classification-to-pool.mjs --course-dir courses/<course-id>
node tools/init-assessment-engine.mjs --course-dir courses/<course-id>
node tools/build-solution-drafts.mjs --course-dir courses/<course-id>
node tools/solve-solution-drafts.mjs --course-dir courses/<course-id>
node tools/classify-problem-pool.mjs --course-dir courses/<course-id>
node tools/build-mission-drafts.mjs --course-dir courses/<course-id>
node tools/promote-mission-drafts.mjs --course-dir courses/<course-id>
node tools/init-content-authoring.mjs --course-dir courses/<course-id>
node tools/retrieve-content.mjs --course-dir courses/<course-id>
node tools/screen-retrieved-content.mjs --course-dir courses/<course-id>
node tools/classify-content-sources.mjs --course-dir courses/<course-id>
node tools/build-content-drafts.mjs --course-dir courses/<course-id>
node tools/promote-content-drafts.mjs --course-dir courses/<course-id>
node tools/run-course-workflow.mjs --course-dir courses/<course-id>
node tools/build-course.mjs --course-dir courses/<course-id>
node tools/validate-course.mjs --course-dir courses/<course-id> --check-output
node tools/check-mojibake.mjs
node tools/check-workflow-readiness.mjs --course-dir courses/<course-id>
```

If Python is needed in sandbox, use the repo-local wrappers:

- `.\tools\python.cmd`

If PowerShell script execution is allowed, you may also use:

- `powershell -ExecutionPolicy Bypass -File .\tools\python.ps1`

## Example Courses

- real-course workflow test: `courses/calculus1_real_check/`
- second real-course workflow test: `courses/intro_to_ai_real_check/`
- additional real-course workflow test: `courses/complex_variables_real_check/`
- additional real-course workflow test: `courses/model_analysis_real_check/`
- lightweight tooling check: `courses/tmp-skill-test/`
- legacy baseline: `examples/calculus1-legacy/`

For placeholder structure, use `examples/calculus1-legacy/` as the visual and structural baseline.

