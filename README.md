# Cause Gen Template Repo

This repo is the shared framework for opening, extending, and publishing course sites.

## Repo Shape

- `courses/` contains the editable source for each course
- `courses/<course-id>/output/` contains the built course sites
- `examples/` contains legacy or reference material that is not canonical source
- `css/`, `js/`, `templates/`, `tools/`, and `docs/` contain the shared framework

## Core Laws

- Every course source must live under `courses/<course-id>/`
- Every built output must live under `courses/<course-id>/output/`
- Do not use `examples/` as the canonical source of a new course
- Every course must include `XP + badges` as part of the base system
- If a course starts from `TQF3`, begin with `TQF3-first framing` before deep authoring
- If only `TQF3` exists, it is still valid to scaffold the course and build the first honest output

## Current Working Flow

1. `init-new-course`
2. `import-materials`
3. prepare the `TQF3 markdown package`
4. `apply-source-refs`
5. `apply-mission-framings`
6. `apply-resource-seeds`
7. `apply-badge-hooks`
8. optional upstream work in `Assessment Authoring Engine`
9. optional upstream work in `Content Authoring Engine`
10. promote only approved upstream drafts through `Engine 2`
11. `build-course`
12. `validate-course --check-output`
13. `check-workflow-readiness`
14. `check-mojibake`

## Key Docs

- move to another machine: [C:\Users\User\Documents\Cause_gen\docs\MOVE_TO_ANOTHER_MACHINE.md](/C:/Users/User/Documents/Cause_gen/docs/MOVE_TO_ANOTHER_MACHINE.md)
- docs index: [C:\Users\User\Documents\Cause_gen\docs\README.md](/C:/Users/User/Documents/Cause_gen/docs/README.md)
- architecture: [C:\Users\User\Documents\Cause_gen\docs\PROJECT_ARCHITECTURE.md](/C:/Users/User/Documents/Cause_gen/docs/PROJECT_ARCHITECTURE.md)
- engine audit matrix: [C:\Users\User\Documents\Cause_gen\docs\ENGINE_AUDIT_MATRIX.md](/C:/Users/User/Documents/Cause_gen/docs/ENGINE_AUDIT_MATRIX.md)
- shared item-layer workflow: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\SHARED_ITEM_LAYER_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SHARED_ITEM_LAYER_WORKFLOW.md)
- workflow entry: [C:\Users\User\Documents\Cause_gen\docs\new-course-template\README.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/README.md)
- page baseline: [C:\Users\User\Documents\Cause_gen\docs\PAGE_SKELETON_BASELINE.md](/C:/Users/User/Documents/Cause_gen/docs/PAGE_SKELETON_BASELINE.md)
- tone guardrail: [C:\Users\User\Documents\Cause_gen\docs\TONE_GUARDRAIL.md](/C:/Users/User/Documents/Cause_gen/docs/TONE_GUARDRAIL.md)
- LaTeX rendering law: [C:\Users\User\Documents\Cause_gen\docs\LATEX_RENDERING_LAW.md](/C:/Users/User/Documents/Cause_gen/docs/LATEX_RENDERING_LAW.md)
- UTF-8 hardening: [C:\Users\User\Documents\Cause_gen\docs\UTF8_TEXT_HARDENING.md](/C:/Users/User/Documents/Cause_gen/docs/UTF8_TEXT_HARDENING.md)
- real-course hardening: [C:\Users\User\Documents\Cause_gen\docs\REAL_COURSE_HARDENING.md](/C:/Users/User/Documents/Cause_gen/docs/REAL_COURSE_HARDENING.md)
- template requirements: [C:\Users\User\Documents\Cause_gen\docs\TEMPLATE_REQUIREMENTS.md](/C:/Users/User/Documents/Cause_gen/docs/TEMPLATE_REQUIREMENTS.md)

## Sandbox Python

If you need Python from this repo inside Codex sandbox, use:

- `.\tools\python.cmd`

If PowerShell script execution is allowed, you may also use:

- `powershell -ExecutionPolicy Bypass -File .\tools\python.ps1`

Do not assume `python` is on PATH. The canonical sandbox-safe entrypoint is `.\tools\python.cmd`.

For cross-machine handoff, run:

- `node tools/check-machine-readiness.mjs`

## Current Verified Courses

- real-course workflow check: `courses/calculus1_real_check/`
- second real-course workflow check: `courses/intro_to_ai_real_check/`
- additional real-course workflow check: `courses/complex_variables_real_check/`
- additional real-course workflow check: `courses/model_analysis_real_check/`
- lightweight tooling check: `courses/tmp-skill-test/`
- legacy visual baseline: `examples/calculus1-legacy/`

## Main Commands

```bash
node tools/run-course-workflow.mjs --course-dir courses/project_in_mathematics_real_check
node tools/build-course.mjs --course-dir courses/project_in_mathematics_real_check
node tools/validate-course.mjs --course-dir courses/project_in_mathematics_real_check --check-output
node tools/check-workflow-readiness.mjs --course-dir courses/project_in_mathematics_real_check
node tools/check-mojibake.mjs
```

