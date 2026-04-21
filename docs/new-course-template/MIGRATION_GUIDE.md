# MIGRATION GUIDE

Use this guide when moving an older course or a partially prepared course into the current template repo.

## Target Structure

The migrated course should end in this structure:

```text
courses/<course-id>/
  course.config.json
  modules/
  missions/
  resources/
  materials/raw/
  materials/processed/
```

The output should be built into:

```text
courses/<course-id>/output/
```

## Migration Steps

1. create the new course folder under `courses/`
2. place raw source files into `materials/raw/`
3. run `import-materials` to normalize the first processed Markdown drafts
4. prepare the TQF3 package if the source starts from TQF3
5. create or refine `course.config.json`
6. split lesson content into `modules/*.md`
7. create or refine `missions/missions.json`
8. create or refine `resources/manifest.json`
9. run build and validation

## Bridge-Oriented Migration

If the source starts from TQF3, prefer this order:

1. `import-materials`
2. prepare `tqf3-course-anchor.md`
3. prepare `tqf3-clo-map.md`
4. prepare `tqf3-week-to-module-map.md`
5. prepare `tqf3-assessment-evidence-map.md`
6. use `apply-source-refs`
7. use `apply-mission-framings`
8. use `apply-resource-seeds`
9. use `apply-badge-hooks`

This keeps migration aligned with the repo's accepted building blocks instead of jumping straight into deep manual authoring.

## Commands

```bash
node tools/import-materials.mjs --course-dir courses/<course-id>
node tools/build-course.mjs --course-dir courses/<course-id>
node tools/validate-course.mjs --course-dir courses/<course-id> --check-output
```

## Legacy Reference

If you need the old structural baseline for comparison:

- `examples/calculus1-legacy/`

But new courses must not use that folder as their canonical source.

