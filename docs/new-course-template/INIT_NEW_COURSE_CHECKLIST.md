# Init New Course Checklist

## Kickoff

- [ ] Confirm the course name and `course_id`
- [ ] Confirm that course source belongs under `courses/<course-id>/`
- [ ] Confirm that final build output belongs under `courses/<course-id>/output/`
- [ ] Confirm that `generated/workflow/README_FIRST.md`, `CURRENT_TASK.md`, and `DECISION_LOG.md` exist
- [ ] Fill `generated/workflow/COURSE_BRIEF.md` and `COURSE_PLAN.md`

## Scaffold

- [ ] Use a validated spec or `init-new-course.ps1`
- [ ] Run `init-new-course.mjs`
- [ ] Confirm that `courses/<course-id>/` was created completely

## Source Setup

- [ ] Place raw source files under `courses/<course-id>/materials/raw/`
- [ ] Run `node tools/import-materials.mjs --course-dir courses/<course-id>`
- [ ] Update the source inventory in `generated/workflow/COURSE_BRIEF.md`
- [ ] Set the first task in `generated/workflow/CURRENT_TASK.md`
- [ ] Create or revise `course.config.json`
- [ ] Confirm that `lesson_completion_xp` and `badges` are defined
- [ ] Create or revise `modules/*.md`
- [ ] Use `generated/workflow/MODULE_AUTHORING_QUEUE.md` to track module status
- [ ] Create or revise `missions/missions.json`
- [ ] Use `generated/workflow/SBRA_DESIGN_LOG.md` for draft SBRA before moving items into `missions.json`
- [ ] Create or revise `resources/manifest.json`
- [ ] Add real files under `resources/files/` when needed

## Build And Validate

- [ ] Run `node tools/build-course.mjs --course-dir courses/<course-id>`
- [ ] Run `node tools/validate-course.mjs --course-dir courses/<course-id>`
- [ ] Run `node tools/validate-course.mjs --course-dir courses/<course-id> --check-output`
- [ ] Update `generated/reviews/RELEASE_CHECKLIST.md`

## Smoke Review

- [ ] Open `courses/<course-id>/output/index.html`
- [ ] Confirm that the page shows the expected high-level progress blocks
- [ ] Open `courses/<course-id>/output/intro.html`
- [ ] Open `courses/<course-id>/output/lessons.html`
- [ ] Open `courses/<course-id>/output/missions.html`
- [ ] Open `courses/<course-id>/output/content/index.html`
- [ ] Open at least two module pages

## Final Rule Check

- [ ] No course source leaks into the repo root
- [ ] `examples/` is not being used as the canonical source
- [ ] Generated docs reflect the current state
