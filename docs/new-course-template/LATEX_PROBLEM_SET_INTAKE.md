# LaTeX Problem Set Intake

This document defines the shared Engine 3 building block called `LaTeX Problem Set Intake`.

Use it when the user or instructor already has a curated assessment source in:

- `.tex`
- Markdown with LaTeX math
- copied LaTeX problem blocks

## Purpose

`LaTeX Problem Set Intake` is the clean intake layer between:

- user-provided assessment sources
- and `problem-pool.json`

Its job is to preserve:

- problem numbering
- section or part structure
- learner-facing statements
- mathematical notation in LaTeX
- first-pass module, CLO, and Bloom hints
- enough structure to support item-by-item intake classification

before Engine 3 starts deeper classification and mission drafting.

## Why This Block Exists

This block exists because curated LaTeX problem sets are often cleaner than:

- web retrieval
- PDF extraction from very large documents
- image OCR

If a user already has a strong problem bank, Engine 3 should prefer this path before any external retrieval path.

## Recommended Location

Store the intake file here:

`courses/<course-id>/materials/processed/assessment/latex-problem-set-intake.md`

If the original `.tex` file should stay with the course, keep it under:

`courses/<course-id>/materials/raw/`

## Minimum Intake Contract

The intake should preserve:

- source title
- source file or provenance note
- section or part labels
- original numbering
- learner-facing statement
- LaTeX math exactly as written
- first-pass part-to-module mapping

## Math Law

If the source contains mathematical notation, keep it as LaTeX code.

Do not flatten formulas into plain text unless the original source already did so.

Prefer:

- inline math like `\( ... \)` or `$...$`
- display math like `\[ ... \]` or `$$...$$`

## Expected Shape

The intake file may contain:

1. source metadata
2. part-to-module mapping
3. raw problem blocks grouped by part

This block is intentionally closer to the original source than `problem-pool.json`.

## Typical Flow

1. prepare `latex-problem-set-intake.md`
2. confirm part-to-module mapping
3. optionally run a first-pass classifier over the intake:

```bash
node tools/classify-latex-problem-intake.mjs --course-dir courses/<course-id>
```

4. review `generated/assessment/latex-problem-intake-classification.json`
5. optionally bridge the reviewed intake classification into the pool:

```bash
node tools/promote-latex-intake-classification-to-pool.mjs --course-dir courses/<course-id>
```

6. convert the intake into `problem-pool-starter.md` or directly into `problem-pool.json`
7. run:

```bash
node tools/init-assessment-engine.mjs --course-dir courses/<course-id>
node tools/classify-problem-pool.mjs --course-dir courses/<course-id>
node tools/build-mission-drafts.mjs --course-dir courses/<course-id>
```

## Relationship To Other Blocks

This block is upstream from:

- [PROBLEM_POOL_TEMPLATE.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/PROBLEM_POOL_TEMPLATE.md)

It can also produce a first-pass review artifact:

- `generated/assessment/latex-problem-intake-classification.json`
- `generated/assessment/latex-problem-intake-classification-by-module.json`
- `generated/assessment/latex-problem-intake-classification-by-module.md`

This artifact helps separate curated items into likely assessment uses such as:

- `quick-check`
- `module-checkpoint`
- `active-learning-task`
- `sbra-exercise-bank`

It is parallel to:

- topic-guided assessment source drafts
- screened retrieval candidates

It should usually be preferred when the user already has a curated LaTeX problem set.

## Review Rules

Human review should confirm:

- section-to-module mapping is sensible
- LaTeX copied correctly
- problem numbering is stable
- statements are complete
- graph-dependent or image-dependent items are clearly marked if text alone is not enough
- the proposed topic, module, CLO, Bloom level, likely technique, answer type, and downstream assessment target make sense per item

## Anti-Loop Rule

Treat this block as `baseline accepted` when:

- at least one real course can use it as upstream assessment intake
- LaTeX math survives into later problem-pool rows
- it reduces the need for noisy external retrieval

Only reopen the block if real-course use shows a concrete failure.
