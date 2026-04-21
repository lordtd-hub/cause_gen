# tools/content-authoring/

This folder is the navigation entry for `Engine 4: Content Authoring Engine`.

Use this engine when the course needs richer learning materials beyond the baseline TQF3 package and bridge layer.

This engine is the content-item branch of the shared cross-course workflow:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\SHARED_ITEM_LAYER_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SHARED_ITEM_LAYER_WORKFLOW.md)

## Purpose

- organize learning-content sources
- map content to `module + CLO + Bloom`
- draft interactive learning assets
- prepare reviewed content blocks before promotion into the core course engine

This engine shares its sourcing primitives with the Problem Sourcing Engine through:

- `tools/lib/shared-sourcing.mjs`

## Typical Inputs

- user-provided notes, slides, worksheets, readings, or examples
- approved external educational content
- `materials/processed/intake/tqf3-week-to-module-map.md`
- `materials/processed/intake/tqf3-teaching-method-map.md`
- `materials/processed/intake/tqf3-clo-coverage-view.md`

## Typical Outputs

- `content-source-draft.md`
- `generated/sourcing/content-source-policy.json`
- `generated/sourcing/content-retrieval-queries.json`
- `generated/sourcing/retrieved-content.json`
- `generated/sourcing/screened-content.json`
- `generated/content/content-classification.json`
- `generated/content/content-drafts.json`
- `generated/bridges/content-promotion-log.json`

## Boundary Law

- Do not write directly to `modules/*.md` as final truth without review
- Do not write directly to `courses/<course-id>/output/`
- Promote reviewed drafts into the Core Course Engine instead of bypassing it

## Operating Modes

1. `user-provided mode`
   Use content that the instructor or user already has.
2. `engine-assisted sourcing mode`
   Find and organize candidate content when the user does not yet have enough material.

Prefer `user-provided mode` when the course already has suitable content.
When external sourcing is needed, prefer `document-first`, especially `PDF-first`, before falling back to loose web pages.

## Main Commands

```bash
node tools/init-content-authoring.mjs --course-dir courses/<course-id>
node tools/retrieve-content.mjs --course-dir courses/<course-id>
node tools/screen-retrieved-content.mjs --course-dir courses/<course-id>
node tools/classify-content-sources.mjs --course-dir courses/<course-id>
node tools/build-content-drafts.mjs --course-dir courses/<course-id>
node tools/promote-content-drafts.mjs --course-dir courses/<course-id>
```

## Expected Flow

0. optional: build `content-source-draft.md` from a topic target
1. initialize the content-authoring rail
2. review and refine the content source policy
3. review and refine the retrieval queries
4. run `retrieve-content` in `PDF-first` mode or provide approved PDF files/URLs to collect content candidates into `retrieved-content.json`
5. run `screen-retrieved-content`
6. review `screened-content.json`
7. run `classify-content-sources`
8. review `content-classification.json`
9. run `build-content-drafts`
10. approve specific drafts only
11. run `promote-content-drafts`

## Rails

- topic targets may be turned into structured source drafts before retrieved-content work begins
- content sourcing does not imply approval
- screened content does not imply module readiness
- content drafts are always `needs_human_review: true`
- only approved content drafts may be promoted
- rerunning the draft builder must preserve prior review metadata for unchanged draft ids


