# Source Refs Schema

`source_refs` is the shared P2 building block that connects processed source files to authored module files.

It exists to make source-to-module mapping explicit, repeatable, and reviewable. The goal is to update `modules/*.md` from course source, not to patch built output.

## Purpose

- Tell each module which source file and source slice it depends on.
- Reduce broad guessing across all processed markdown files.
- Let Codex fill module placeholders in a source-first way.

## Minimal Shape

Put `source_refs` in the frontmatter of `modules/*.md`.

```yaml
source_refs:
  - file: materials/processed/intake/course-design.md
    kind: module-structure
    match: Sequences and Series
    fills:
      - module-at-a-glance
      - module-core-content
  - file: materials/processed/intake/course-design.md
    kind: week-plan
    weeks: [3, 4, 5]
    fills:
      - module-active-learning
      - module-checkpoints
```

## Field Meaning

- `file`: source markdown file inside the same course folder
- `kind`: supported values are `module-structure` and `week-plan`
- `match`: row key used when `kind = module-structure`
- `weeks`: list of week numbers used when `kind = week-plan`
- `fills`: module blocks that this source is allowed to support

## Allowed Fill Targets

`fills` may currently use only these shared module targets:

- `module-at-a-glance`
- `module-core-content`
- `module-active-learning`
- `module-checkpoints`

This keeps vocabulary stable across courses and prevents `source_refs` from becoming an ad hoc section-naming channel.

Do not use `fills` for:

- temporary section names
- learner-facing widget labels
- module-specific custom block names
- built-output patch instructions

## Laws

- `source_refs` is source metadata, not learner-facing copy.
- If a module is not ready for deep authoring, add `source_refs` before guessing body content.
- If the course starts from TQF3, review Week-to-Module logic before adding `week-plan` refs.
- `source_refs` updates must happen in `modules/*.md`, never in `courses/<course-id>/output/`.
- `fills` must stay within the allowed targets above.

## Validation Rules

`validate-course.mjs` should fail when:

- `source_refs` is not an array of objects
- a ref is missing `file`
- a ref is missing `kind`
- a ref is missing `fills`
- a ref uses a fill target outside the allowed list
- `module-structure` is missing `match`
- `week-plan` is missing `weeks`
