# START

## Goal

Open a new course in an orderly way by keeping source under `courses/` and build output under `courses/<course-id>/output/`.

## Engine Reminder

This repo now separates work into four engines:

1. `TQF3 Intake Engine`
2. `Core Course Engine`
3. `Assessment Authoring Engine`
4. `Content Authoring Engine`

Only the Core Course Engine should own final runtime course files.

## Quick Start

1. prepare a spec or use the interactive wrapper
2. scaffold the course into `courses/<course-id>/`
3. inspect the generated working files under `generated/`
4. place raw source files into `materials/raw/`
5. let Codex read `generated/workflow/README_FIRST.md` and `generated/workflow/CURRENT_TASK.md` first
6. prepare the processed package and bridge files
7. build and validate the first honest output

## If The Course Starts From TQF3

- prepare the `md` package in `materials/processed/` following [C:\Users\User\Documents\Cause_gen\docs\new-course-template\TQF3_MD_PACKAGE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TQF3_MD_PACKAGE.md)
- at minimum, prepare:
  - `tqf3-course-anchor.md`
  - `tqf3-clo-map.md`
  - `tqf3-week-to-module-map.md`
  - `tqf3-assessment-evidence-map.md`
- it is acceptable to scaffold and build the first output from TQF3 alone
- fill stronger materials later in additional rounds

## Bridge Sequence

After the package exists, the normal bridge sequence is:

1. `import-materials`
2. `apply-source-refs`
3. `apply-mission-framings`
4. `apply-resource-seeds`
5. `apply-badge-hooks`
6. if you want more candidate problems from educational internet sources, run `init-problem-sourcing`
7. let AI or a human collect candidate sources, then run `screen-retrieved-problems`
8. if item authoring starts, run `init-assessment-engine`
9. run `classify-problem-pool`
10. run `build-mission-drafts`
11. `build-course`
12. `validate-course --check-output`
13. `check-workflow-readiness`

When reading the readiness report:

- `critical` means stop and fix first
- `important` means not a full blocker; AI can often help fill the gap
- `optional` means it can wait until the current baseline is stable

## Real-Course Hardening Rules

- keep `.docx` import structure-aware by reading OOXML
- keep `.docx` import list-aware by reading `numbering.xml` when present
- keep paragraph separation inside table cells instead of flattening them
- keep an extra recovery pass for dense inline enumerations that commonly appear in TQF3 Word files
- expect bridge tools to remove stale bootstrap artifacts
- expect resource bridges to create safe fallback ids
- after changing a shared bridge, rerun the full workflow on a real course

See:

- [C:\Users\User\Documents\Cause_gen\docs\REAL_COURSE_HARDENING.md](/C:/Users/User/Documents/Cause_gen/docs/REAL_COURSE_HARDENING.md)

## Commands

### Using a spec

```bash
.\tools\python.cmd --version
node tools/validate-init-spec.mjs --spec my-course.spec.json
node tools/init-new-course.mjs --spec my-course.spec.json
node tools/import-materials.mjs --course-dir courses/<course-id>
node tools/build-course.mjs --course-dir courses/<course-id>
node tools/validate-course.mjs --course-dir courses/<course-id> --check-output
```

If sandbox Python is needed, use:

- `.\tools\python.cmd`

If PowerShell script execution is allowed, you may also use:

- `powershell -ExecutionPolicy Bypass -File .\tools\python.ps1`

### Using PowerShell interactive setup

```powershell
.\tools\init-new-course.ps1
```

## Expected Structure After Scaffolding

```text
courses/<course-id>/
  course.config.json
  modules/
  missions/
  resources/
  materials/raw/
  materials/processed/
  generated/
```

## If You Are Working With Codex

- read [C:\Users\User\Documents\Cause_gen\docs\new-course-template\CODEX_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/CODEX_WORKFLOW.md)
- read [C:\Users\User\Documents\Cause_gen\docs\new-course-template\CODEX_SESSION_PROTOCOL.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/CODEX_SESSION_PROTOCOL.md)
- use [C:\Users\User\Documents\Cause_gen\docs\new-course-template\CODEX_PROMPT_PACK.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/CODEX_PROMPT_PACK.md) as the prompt pack
- use [C:\Users\User\Documents\Cause_gen\docs\new-course-template\TERMINAL_COMMAND_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TERMINAL_COMMAND_WORKFLOW.md) for terminal-ready prompts

## Do Not

- do not create a new course at the repo root
- do not edit built output in `courses/<course-id>/output/` when the real cause is in source
- do not use `examples/calculus1-legacy/` as the canonical source of a new course


