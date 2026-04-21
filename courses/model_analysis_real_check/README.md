# Model Analysis Real Check

This course is a real-course workflow check for `Analysis of Mathematical Models`.

## Current Status

- Source and course config are clean enough to continue authoring.
- Build currently succeeds.
- Output validation still fails because learner-facing intro, lessons, missions, resources, and module copy are not fully hardened yet.

## Read First

1. `generated/workflow/README_FIRST.md`
2. `generated/workflow/CURRENT_TASK.md`
3. `generated/workflow/DECISION_LOG.md`
4. `course.config.json`
5. `materials/processed/intake/source-inventory-status.md`

## Folder Guide

- `course.config.json`
  Final learner-facing course identity, badges, modules, and CLO labels.
- `materials/raw/`
  Raw TQF3 source and original course files.
- `materials/processed/`
  TQF3 package, course-design extracts, and source inventory.
- `generated/`
  Workflow logs, bridge outputs, readiness notes, and review records.
- `modules/`
  Module markdown source.
- `missions/`
  Runtime mission data.
- `resources/`
  Runtime resource manifest.

## Editing Rule

- Update source here, then rebuild to refresh `courses/model_analysis_real_check/output/`
- Do not patch output files directly


