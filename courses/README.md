# Courses

This folder contains course-local source, generated working files, and runtime-ready assets.

## Directory Types

- `*_real_check/`
  Real-course workflow runs that exercise the current TQF3-first pipeline end to end.
- `*_import_check/`
  Lightweight importer checks used to test `.docx -> .md` quality without running the full course pipeline.
- `tmp-skill-test/`
  A small sandbox course used to test shared workflow and skill behavior.

## Common Course Layout

- `course.config.json`
  Final course-level runtime config. Treat this as the learner-facing source of truth for course identity, badges, themes, modules, and CLO labels.
- `materials/raw/`
  Raw source files such as TQF3 `.docx`, notes, slides, or source documents.
- `materials/processed/`
  Normalized intake artifacts and intermediate authoring sources such as the TQF3 markdown package, source maps, problem pools, and course-design extracts.
- `generated/`
  Working docs, bridge outputs, readiness artifacts, and review logs created during the authoring workflow.
- `modules/`
  Module source markdown used by the core course engine.
- `missions/`
  Runtime mission data, usually `missions.json`.
- `resources/`
  Runtime resource manifest and supporting files.

## Read Order For A Course

1. `generated/workflow/README_FIRST.md`
2. `generated/workflow/CURRENT_TASK.md`
3. `generated/workflow/DECISION_LOG.md`
4. `course.config.json`
5. `materials/processed/`

## Editing Rule

- Fix source in `course.config.json`, `materials/processed/`, `generated/`, or `modules/`
- Do not patch `courses/<course-id>/output/` to hide source problems
- Use the engine boundaries in [docs/PROJECT_ARCHITECTURE.md](/C:/Users/User/Documents/Cause_gen/docs/PROJECT_ARCHITECTURE.md)


