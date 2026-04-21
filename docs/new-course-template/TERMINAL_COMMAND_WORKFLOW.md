# Terminal Command Workflow

This file translates the repo workflow into terminal-ready commands and prompt snippets.

Use it together with:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\START.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/START.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\CODEX_PROMPT_PACK.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/CODEX_PROMPT_PACK.md)

## Core Laws

- Every course lives under `courses/<course-id>/`.
- Final built output lives under `courses/<course-id>/output/`.
- Do not treat `examples/` as the canonical source of a new course.
- Read the generated working docs before doing real authoring work.

## Flow 1: Open A New Course From A Spec

### 1. Validate the spec

```text
node tools/validate-init-spec.mjs --spec my-course.spec.json
```

### 2. Create the course scaffold

```text
node tools/init-new-course.mjs --spec my-course.spec.json
```

Overwrite the scaffold if needed:

```text
node tools/init-new-course.mjs --spec my-course.spec.json --force
```

### 3. Ask Codex to review the new scaffold

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Read generated/workflow/README_FIRST.md and generated/workflow/CURRENT_TASK.md first.
Check whether the new course scaffold is complete enough to start.
If anything is missing, summarize the missing pieces.
Do not use examples/ as the canonical source.
```

## Flow 2: Open A New Course From The Terminal Helper

### 1. Run the helper

```powershell
.\tools\init-new-course.ps1
```

Force overwrite when needed:

```powershell
.\tools\init-new-course.ps1 -Force
```

### 2. Ask Codex to start from the working files

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, and generated/workflow/DECISION_LOG.md first.
Summarize what phase the course is in and what should happen next.
```

## Import Source Materials

Place raw source files under:

```text
courses/<course-id>/materials/raw/
```

Normalize imported source:

```text
node tools/import-materials.mjs --course-dir courses/<course-id>
```

Then ask Codex:

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, generated/workflow/COURSE_BRIEF.md, and materials/processed/ first.
Summarize the imported materials and propose the first framing move.
If changing CLOs or the module map would be necessary, stop and ask first.
```

## Start Module Authoring

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, generated/workflow/COURSE_BRIEF.md, generated/workflow/COURSE_PLAN.md, and generated/workflow/MODULE_AUTHORING_QUEUE.md first.
Pick the next incomplete module.
Author or refine modules/*.md so the content matches the course framing and CLOs.
Update the queue when done.
```

## Start SBRA Work

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, generated/workflow/DECISION_LOG.md, generated/workflow/SBRA_DESIGN_LOG.md, and missions/missions.json first.
Design or refine SBRA for the requested module.
Each step should test process and reasoning clearly.
If the mission is not ready for missions.json yet, keep it as a draft in generated/workflow/SBRA_DESIGN_LOG.md.
```

## Build The Course Site

```text
node tools/build-course.mjs --course-dir courses/<course-id>
```

Then ask Codex:

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, and generated/reviews/RELEASE_CHECKLIST.md first.
Review the build result and tell me what should be fixed in source.
Do not patch courses/<course-id>/output/ to hide source problems.
```

## Validate Before Use

```text
node tools/validate-course.mjs --course-dir courses/<course-id>
node tools/validate-course.mjs --course-dir courses/<course-id> --check-output
```

If you want Codex to review the result:

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Review this course in a code-review mindset.
Focus on broken paths, CLO mismatch, mission/schema risk, and publish readiness.
Show findings first, then summarize the overall state.
```

## Short Prompt Snippets

### Controlled start

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Read generated/workflow/README_FIRST.md and generated/workflow/CURRENT_TASK.md first.
Work only inside courses/<course-id>/.
When done, report:
1. What was done
2. What result was produced
3. What should happen next
4. Whether the user agrees or wants changes
```

### Only do the current task

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, and generated/workflow/DECISION_LOG.md first.
Do only the task described in CURRENT_TASK.md.
If changing CLOs, the module map, assessment, or SBRA direction becomes necessary, stop and ask first.
```

### Handoff

```text
Use $cause-gen-course-workflow with courses/<course-id>/
Summarize the current state from the generated docs.
Tell me what is done, what is still open, what the next task should be, and what risks remain.
```
