# Template Requirements

This file is the implementation contract for the shared Cause Gen framework.

## 1. Repo Law

- Every course source must live under `courses/<course-id>/`
- Every built output must live under `courses/<course-id>/output/`
- Legacy and reference material must stay under `examples/`
- Learner-facing output must pass the tone guardrail
- Shared building blocks should be locked before course-specific detail is deepened

## 2. Framework vs Course Source

Shared framework files belong in:

- `css/`
- `js/`
- `templates/`
- `tools/`
- `docs/`

Course-specific source belongs in:

```text
courses/<course-id>/
  course.config.json
  modules/
  missions/
  resources/
  materials/raw/
  materials/processed/
  generated/
```

## 3. Canonical Source Formats

- lesson content: `Markdown`
- mission runtime: `JSON`
- resource manifest: `JSON`
- imported source: `.md`, `.docx`, `.tex`

## 4. Course Config Contract

Each course must define, at minimum:

- `course_id`
- `course_name_th`
- `course_name_en`
- `course_short_name`
- `instructor`
- `description`
- `theme`
- `features`
- `widgets_enabled`
- `lesson_completion_xp`
- `badges[]`
- `modules[]`
- `clos[]`

Gamification law:

- every course must have `XP` and `badges`
- if spec input does not define badges, tooling must scaffold defaults
- `lesson_completion_xp` must be a positive number

## 5. Module Contract

Each file in `modules/*.md` must define frontmatter with at least:

- `id`
- `slug`
- `title`
- `summary`
- `order`
- `clo_ids`
- `module_kind`
- `widgets`

Optional but recommended:

- `source_refs`

## 6. Mission Contract

Each mission in `missions/missions.json` must define at least:

- `mission_id`
- `clo_id`
- `module_id`
- `mission_type`
- `title`
- `prompt`
- `rubric`
- `threshold`
- `confidence`
- `steps[]`

Self-assessment law:

- `confidence` is the canonical self-assessment field
- the shared runtime uses the `1-5` star scale
- default XP calibration follows the accepted `cal1` rule unless later requirements override it
- default hint and solution penalties also follow the accepted `cal1` rule unless later requirements override it

## 7. Page Skeleton Law

The shared top-level pages are:

- `index`
- `intro`
- `lessons`
- `missions`

They should follow the structure and learner journey pattern from:

- `examples/calculus1-legacy/`

If a reusable block is not ready yet, keep a stable placeholder skeleton first.

## 8. TQF3 Intake Law

When a course starts from `TQF3`:

- do not jump directly from weekly topics into deep module prose or item-level missions
- first prepare the `TQF3 markdown package`
- review the `Week-to-Module Map`
- use shared building blocks before deep authoring

Accepted TQF3 building blocks are:

- `Assessment Evidence Map`
- `Teaching Method Map`
- `CLO Coverage View`
- `Resource Seed List`
- `Source Inventory Status`

## 9. Bridge Law

The accepted bridge sequence is:

1. `import-materials`
2. `apply-source-refs`
3. `apply-mission-framings`
4. `apply-resource-seeds`
5. `apply-badge-hooks`
6. `build-course`
7. `validate-course --check-output`

Bridge law:

- bridges should compile design-layer source into runtime-layer source
- do not teach the runtime to read every framing file directly
- fix bridge problems at the bridge or source layer, not by patching built output

## 10. Real-Course Hardening Law

The framework now includes the following hardening rules from real-course runs:

- `.docx` import must preserve OOXML structure instead of flat text extraction
- bridge tools must clean stale bootstrap artifacts when the real course shape changes
- resource bridges must produce valid fallback ids even when title slugging fails
- after changing any shared bridge, rerun the full workflow on a real course before accepting the change

See:

- [C:\Users\User\Documents\Cause_gen\docs\REAL_COURSE_HARDENING.md](/C:/Users/User/Documents/Cause_gen/docs/REAL_COURSE_HARDENING.md)

## 11. UTF-8 and Text Safety

- learner-facing text must not leak mojibake
- fix shared text corruption at the source, not only in output
- output validation should fail when mojibake patterns are still present

See:

- [C:\Users\User\Documents\Cause_gen\docs\UTF8_TEXT_HARDENING.md](/C:/Users/User/Documents/Cause_gen/docs/UTF8_TEXT_HARDENING.md)

## 12. Anti-Loop Rule

When a shared building block reaches an accepted baseline:

- mark it as accepted
- stop expanding it
- reopen it only when real-course evidence shows it is still insufficient

Do not reopen a baseline only because more detail is still possible.

