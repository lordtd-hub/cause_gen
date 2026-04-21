# UTF-8 Text Hardening

This document records the root cause and prevention rules for Thai text corruption in this repo.

## Root Cause

The main problem was not only browser rendering. Some shared learner-facing strings were already stored as mojibake inside shared framework files.

That caused three effects:

- every rebuilt course repeated the same corruption
- course-specific content could be correct while shared UI text was still broken
- fixing only the final output was not enough

## Hardening Rules

1. Fix shared text corruption at the shared source layer first
2. Prefer ASCII for internal framework docs when Thai is not necessary
3. Write generated files as UTF-8
4. Keep learner-facing copy away from internal implementation vocabulary when possible
5. Treat mojibake as a framework regression, not only as a copy-edit issue
6. Keep generator defaults and templates in clean ASCII or verified UTF-8, because they can reintroduce corruption into every new course scaffold
7. Prefer narrow, deliberate rewrites over broad shell-based Thai text transforms when recovering a corrupted file

## Files To Watch

- `tools/build-course.mjs`
- `js/xp.js`
- `js/missions.js`
- scaffold templates under `docs/new-course-template/templates/`

## Required Checks

When text corruption is suspected:

1. inspect the built output
2. inspect the shared framework source
3. inspect the course-specific source under `courses/<course-id>/`
4. make sure validation still scans for mojibake leakage
5. run `node tools/check-mojibake.mjs` before closing the task

## Practical Rule

After changing shared learner-facing text:

- rebuild at least one real course
- run `validate-course --check-output`
- confirm that the problem is gone from both source and output
- run `node tools/check-mojibake.mjs` to confirm no unexpected corruption remains in repo docs, tools, or course source
