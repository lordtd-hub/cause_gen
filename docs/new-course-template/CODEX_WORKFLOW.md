# Codex Course Workflow

This document explains how Codex should work inside a course in this repo.

## Core Laws

- Every course source lives under `courses/<course-id>/`.
- Every built output lives under `courses/<course-id>/output/`.
- Do not use `examples/` as the canonical source for a live course.
- The canonical lesson source is `modules/*.md`.
- The canonical mission source is `missions/missions.json`.
- Planning, review notes, queues, and drafts belong under `courses/<course-id>/generated/`.
- Learner-facing output must stay within the tone guardrail and must not leak system wording.

## Course Structure

```text
courses/<course-id>/
  course.config.json
  modules/
  missions/
  resources/
  materials/raw/
  materials/processed/
  generated/
  output/
```

## Working Pack Under `generated/`

The standard working pack is:

- `workflow/README_FIRST.md`
- `workflow/CURRENT_TASK.md`
- `workflow/DECISION_LOG.md`
- `workflow/COURSE_BRIEF.md`
- `workflow/COURSE_PLAN.md`
- `workflow/MODULE_AUTHORING_QUEUE.md`
- `workflow/SBRA_DESIGN_LOG.md`
- `reviews/RELEASE_CHECKLIST.md`

Templates live under `docs/new-course-template/templates/`.

## Read Order For Each Session

Before meaningful work starts, read:

1. `README_FIRST.md`
2. `CURRENT_TASK.md`
3. `DECISION_LOG.md`
4. `COURSE_BRIEF.md`
5. `COURSE_PLAN.md`
6. the relevant queue file

## Response Protocol

After meaningful work, summarize in four parts:

- What was done
- What result was produced
- What should happen next
- Agree or want changes

If a change would alter CLOs, the module map, assessment direction, or SBRA direction, stop and ask first.

## Standard Workflow

### Phase 1: Kickoff

Goals:

- define the course id
- scaffold the course
- confirm the working pack

### Phase 2: Source Intake

Goals:

- place raw source in `materials/raw/`
- normalize import into `materials/processed/`
- update the source inventory

If the source starts from TQF3, prepare the TQF3 markdown package first.

### Phase 3: Course Framing

Goals:

- tighten CLO framing
- align with Bloom's taxonomy
- lock the initial module structure

If the course starts from TQF3:

- classify source data types first
- map them to placeholder targets
- review Week-to-Module logic before deep authoring
- review the Assessment Evidence Map before deep mission work

### Phase 4: Module Authoring

Goals:

- author `modules/*.md`
- use the queue to track progress
- keep the tone learner-facing

### Phase 5: Mission Authoring

Goals:

- refine SBRA and mission structure
- use `SBRA_DESIGN_LOG.md` for drafts
- move only approved mission content into `missions.json`

### Phase 6: Build And Review

Goals:

- run build
- run validation
- review the final course site in `output/`

## Definition Of Done

The work is considered ready when:

- source files are current
- generated docs reflect reality
- build passes
- validation passes
- output lives under `courses/<course-id>/output/`
- learner-facing pages do not leak system vocabulary
