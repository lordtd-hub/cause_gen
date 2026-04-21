# TQF3 Intake Engine

This folder is the navigation entry point for the TQF3 intake layer.

The scripts still live at the top level of `tools/`, but this README groups them by responsibility.

## Purpose

Turn `TQF3` and related raw source files into the minimum structured package needed for honest course generation.

## Main Commands

```bash
node tools/validate-init-spec.mjs --spec <path>
node tools/init-new-course.mjs --spec <path> [--course-dir courses/<course-id>] [--force]
node tools/import-materials.mjs --course-dir courses/<course-id> [input-path ...]
node tools/check-workflow-readiness.mjs --course-dir courses/<course-id>
```

## Main Outputs

- `materials/processed/intake/tqf3-course-anchor.md`
- `materials/processed/intake/tqf3-clo-map.md`
- `materials/processed/intake/tqf3-week-to-module-map.md`
- `materials/processed/intake/tqf3-assessment-evidence-map.md`
- `materials/processed/intake/tqf3-teaching-method-map.md`
- `materials/processed/intake/tqf3-resource-seed-list.md`
- `materials/processed/intake/tqf3-clo-coverage-view.md`
- `materials/processed/intake/source-inventory-status.md`

## See Also

- [C:\Users\User\Documents\Cause_gen\docs\PROJECT_ARCHITECTURE.md](/C:/Users/User/Documents/Cause_gen/docs/PROJECT_ARCHITECTURE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\TQF3_MD_PACKAGE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/TQF3_MD_PACKAGE.md)

