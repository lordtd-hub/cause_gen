# Codex Prompt Pack

This file stores reusable prompt fragments for course work in this repo.

If you need terminal-ready command flow, use:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\TERMINAL_COMMAND_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TERMINAL_COMMAND_WORKFLOW.md)

## 1. Kickoff Prompt

```text
Work only inside courses/<course-id>/.
Read generated/workflow/README_FIRST.md and generated/workflow/CURRENT_TASK.md first.
Then read generated/workflow/COURSE_BRIEF.md and generated/workflow/COURSE_PLAN.md.
Check whether the main source is complete enough to start the current phase.
If anything important is missing, summarize the gap.
Do not use examples/ as the canonical source.
Finish with:
1. What was done
2. What result was produced
3. What should happen next
4. Whether the user agrees or wants changes
```

## 2. CLO And Module Framing Prompt

```text
Work only inside courses/<course-id>/.
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, and generated/workflow/DECISION_LOG.md first.
Read materials/processed/ and generated/workflow/COURSE_BRIEF.md.
Tighten the CLO framing, align it with Bloom's taxonomy, and propose the first module structure.
Update generated/workflow/MODULE_AUTHORING_QUEUE.md if the module framing is clear enough.
If CLOs or the module map would change materially, stop and ask first.
```

## 3. Module Draft Prompt

```text
Work only inside courses/<course-id>/.
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, generated/workflow/COURSE_BRIEF.md, generated/workflow/COURSE_PLAN.md, and generated/workflow/MODULE_AUTHORING_QUEUE.md.
Pick the next incomplete module.
Author or refine modules/<file>.md so it matches the CLOs, module kind, and widget plan.
Update the queue after the edit.
Finish with the normal 4-part summary.
```

## 4. SBRA Design Prompt

```text
Work only inside courses/<course-id>/.
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, generated/workflow/DECISION_LOG.md, generated/workflow/SBRA_DESIGN_LOG.md, and missions/missions.json.
Design SBRA for the requested module and split it into steps.
Each step should have process options, reasoning options, and misconception tags when appropriate.
If the mission is not ready for missions.json yet, keep it in generated/workflow/SBRA_DESIGN_LOG.md as a draft.
If the SBRA direction or rubric logic would change materially, stop and ask first.
```

## 5. Build And Validate Prompt

```text
Work only inside courses/<course-id>/.
Read generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, and generated/reviews/RELEASE_CHECKLIST.md first.
Build and validate the course.
If there are errors, fix the source under courses/<course-id>/, not courses/<course-id>/output/.
Update the checklist and summarize the build state.
Finish with the normal 4-part summary.
```

## 6. Review Prompt

```text
Review the course in courses/<course-id>/ with a code-review mindset.
Focus on bugs, inconsistencies, CLO mismatch, broken resource paths, mission schema risk, and testing gaps.
Show findings first with file references.
```

## 7. Handoff Prompt

```text
Summarize the course state in courses/<course-id>/ from the generated docs.
Tell me what is done, what is still open, what the next task should be, and what risks remain in content, structure, or assessment.
```

## 8. Controlled Execution Prompt

```text
Work only inside courses/<course-id>/.
Start by reading generated/workflow/README_FIRST.md, generated/workflow/CURRENT_TASK.md, and generated/workflow/DECISION_LOG.md.
Do only the task described in CURRENT_TASK.md.
If changing CLOs, the module map, assessment, or SBRA direction becomes necessary, stop and ask first.
When done, update the relevant generated docs and report:
1. What was done
2. What result was produced
3. What should happen next
4. Whether the user agrees or wants changes
```
