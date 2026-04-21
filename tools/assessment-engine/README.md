# Assessment Engine

This folder contains the schema rails and starter templates for the semi-automatic item-authoring engine.

This engine is the assessment-item branch of the shared cross-course workflow:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\SHARED_ITEM_LAYER_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SHARED_ITEM_LAYER_WORKFLOW.md)

Design law:

- AI is the proposer
- schema is the rail
- human is the approver

Assessment law:

- runtime assessment assets should end as `choice-based` items
- worked solutions are upstream authoring material, not the final learner-facing assessment form
- in repo language, `SBRA` is the established label for the same step-and-reason choice format the user may also call `BSRA`
- `SBRA` or `BSRA` is the primary high-value `CLO evidence` format for this engine

The engine is intentionally not autonomous yet. It produces intermediate files that still require human review before anything should be bridged into runtime mission data.

## Core Outputs

- `latex-problem-set-intake.md`
- `generated/assessment/latex-problem-intake-classification.json`
- `generated/assessment/latex-problem-intake-classification-by-module.json`
- `generated/assessment/latex-problem-intake-classification-by-module.md`
- `assessment-source-draft.md`
- `materials/processed/assessment/problem-pool.json`
- `generated/assessment/solution-drafts.json`
- `generated/assessment/sbra-item-drafts.json`
- `generated/assessment/assessment-classification.json`
- `generated/assessment/mission-drafts.json`
- `generated/bridges/assessment-promotion-log.json`

## Main Commands

```bash
node tools/init-assessment-engine.mjs --course-dir courses/<course-id>
node tools/classify-latex-problem-intake.mjs --course-dir courses/<course-id>
node tools/promote-latex-intake-classification-to-pool.mjs --course-dir courses/<course-id>
node tools/build-solution-drafts.mjs --course-dir courses/<course-id>
node tools/solve-solution-drafts.mjs --course-dir courses/<course-id>
node tools/build-sbra-item-drafts.mjs --course-dir courses/<course-id>
node tools/classify-problem-pool.mjs --course-dir courses/<course-id>
node tools/build-mission-drafts.mjs --course-dir courses/<course-id>
node tools/promote-mission-drafts.mjs --course-dir courses/<course-id>
```

## Expected Flow

0. optional: prepare `latex-problem-set-intake.md` when the user already has a curated LaTeX problem source
0a. optional: build `assessment-source-draft.md` from a topic target
1. optional: run `classify-latex-problem-intake` to produce first-pass topic/module/CLO/Bloom/technique/use-target proposals for every curated LaTeX item
2. either prepare `problem-pool-starter.md` manually or run `promote-latex-intake-classification-to-pool`
3. run `init-assessment-engine`
4. review `problem-pool.json`
5. run `build-solution-drafts` for items where `solution_required: true`
6. run `solve-solution-drafts` to fill real answers and worked LaTeX for solvable items
7. run `build-sbra-item-drafts` for solved items that should become CLO-evidence SBRA items
8. review `solution-drafts.json` and `sbra-item-drafts.json`
9. run `classify-problem-pool`
10. review `assessment-classification.json`
11. run `build-mission-drafts`
12. review `mission-drafts.json`
13. approve specific drafts only
14. run `promote-mission-drafts`

## Rails

- curated LaTeX problem sets are a preferred upstream source when available
- LaTeX intake classification is a first-pass review rail, not final truth
- LaTeX intake classification now carries `sbra_profile` metadata so items can be separated into:
  - `strong`: primary CLO-evidence candidates that are worth hardening into real SBRA items
  - `medium`: support-evidence items that may become SBRA when the module needs extra reasoning coverage
  - `not_recommended`: direct computation or quick-check style items that should usually stay out of SBRA authoring
- topic targets may be turned into structured source drafts before problem-pool work begins
- problem pool items must keep stable ids
- problem pool items should carry solution metadata even before full solutions are authored
- solution drafts are a review-first authoring rail, not a final answer key
- solution drafts may carry different downstream profiles for `quick-check`, `module-checkpoint`, `active-learning-task`, and `sbra-exercise-bank`
- `solve-solution-drafts` is the real solve pass that fills `expected_answer`, `full_solution_latex`, and downstream target answers while still leaving the review gate in place
- the next high-value rail after solving is choice authoring, especially for `SBRA` or `BSRA`
- the strongest CLO-evidence items should become step-based choice sequences with one row for the step choice and another row for the reason choice
- distractors should be built from real misconceptions or plausible wrong methods, not arbitrary filler
- `sbra_profile.pattern_tags` and `sbra_profile.distractor_focus` are the current upstream hooks for sharper SBRA authoring
- `build-sbra-item-drafts` is the current bridge from solved assessment items into explicit SBRA shells with `step-choice` and `reason-choice` rows
- classifications are always proposals, not final truth
- mission drafts are always `needs_human_review: true`
- approved mission drafts are the only promotable assessment asset
- runtime `missions.json` should not be edited by this engine directly at this stage
- rerunning the draft builder must preserve prior review metadata for unchanged draft ids

