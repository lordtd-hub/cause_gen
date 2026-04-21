# Codex Session Protocol

This file defines how Codex should operate in a course session so the work stays scoped, traceable, and easy to review.

## Read Order Before Work Starts

Read these files first:

1. `courses/<course-id>/generated/workflow/README_FIRST.md`
2. `courses/<course-id>/generated/workflow/CURRENT_TASK.md`
3. `courses/<course-id>/generated/workflow/DECISION_LOG.md`
4. `courses/<course-id>/generated/workflow/COURSE_BRIEF.md`
5. `courses/<course-id>/generated/workflow/COURSE_PLAN.md`
6. the relevant queue file such as `MODULE_AUTHORING_QUEUE.md` or `SBRA_DESIGN_LOG.md`

If a required file is missing, report the missing file first and propose the smallest next fix.

## Scope Law

- Work only inside `courses/<course-id>/`.
- Built output belongs in `courses/<course-id>/output/`.
- Do not use `examples/` as the canonical source for a live course.
- Do not patch `courses/<course-id>/output/` to hide source problems.

## Response Contract

At the start of a work cycle, Codex should make three things clear:

- what the user wants
- which files will be read first
- what the first practical step will be

After an important task, Codex should answer in this shape:

```text
What was done:
- ...

What result was produced:
- ...

What should happen next:
- ...

Agree or want changes:
- ...
```

## When Codex Must Stop And Ask

Codex should stop and ask for confirmation when a change would materially affect course structure or assessment, for example:

- CLO wording or Bloom level
- module map or module order
- assessment direction
- SBRA direction, mission type, or rubric logic
- major theme or feature direction

Codex does not need to stop for routine maintenance such as:

- copy cleanup
- queue updates
- checklist updates
- build and validate after source edits

## Next-Step Discipline

Every meaningful update should end with one concrete next action.

The next action should:

- be one clear task
- name the target file or target artifact
- be realistic for the next turn

Avoid vague next actions that are too broad to execute.

## Decision Hygiene

- Put locked decisions in `DECISION_LOG.md`.
- Keep unresolved items in the open-decisions section.
- After user confirmation, update the decision log promptly.
