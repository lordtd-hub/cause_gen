# Core Course Engine

This folder is the navigation entry point for the final course integration layer.

The scripts still live at the top level of `tools/`, but this README groups them by responsibility.

## Purpose

Combine accepted source materials and reviewed upstream drafts into the final course source and built output.

## Main Commands

```bash
node tools/draft-course.mjs --course-dir courses/<course-id> [--force]
node tools/apply-source-refs.mjs --course-dir courses/<course-id>
node tools/apply-mission-framings.mjs --course-dir courses/<course-id>
node tools/apply-resource-seeds.mjs --course-dir courses/<course-id>
node tools/apply-badge-hooks.mjs --course-dir courses/<course-id>
node tools/promote-mission-drafts.mjs --course-dir courses/<course-id>
node tools/promote-content-drafts.mjs --course-dir courses/<course-id>
node tools/build-course.mjs --course-dir courses/<course-id>
node tools/validate-course.mjs --course-dir courses/<course-id>
node tools/validate-course.mjs --course-dir courses/<course-id> --check-output
node tools/check-workflow-readiness.mjs --course-dir courses/<course-id>
node tools/run-course-workflow.mjs --course-dir courses/<course-id>
```

## Runtime Source Of Truth

- `course.config.json`
- `modules/*.md`
- `missions/missions.json`
- `resources/manifest.json`

## Integration Law

- the Core Course Engine is the final integrator only
- it may consume reviewed upstream drafts from Engine 3 and Engine 4
- it must not absorb sourcing, screening, or authoring heuristics that belong upstream

## See Also

- [C:\Users\User\Documents\Cause_gen\docs\PROJECT_ARCHITECTURE.md](/C:/Users/User/Documents/Cause_gen/docs/PROJECT_ARCHITECTURE.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\README.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/README.md)
