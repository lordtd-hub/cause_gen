# DECISION LOG

## Locked Decisions

- decision: lesson content uses `modules/*.md` as the main source
  source: user confirmed
  impact: Codex must edit source, not output

- decision: mission branching uses `missions/missions.json` as the main source
  source: user confirmed
  impact: SBRA and missions should be changed there

- decision: new courses must live under `courses/<course-id>/`
  source: user confirmed
  impact: keep the repo organized and multi-course ready

- decision: outputs must live under `courses/<course-id>/output/`
  source: user confirmed
  impact: do not write public files to the repo root

- decision: top-level pages should keep the same overall structure first
  source: user confirmed
  impact: `index / intro / lessons / missions / resources` stays as the base UX

- decision: if a course starts from TQF3, Codex should map source data types and review Week-to-Module logic before deep authoring
  source: repo workflow
  impact: do not jump from weekly topics straight to modules or SBRA items

- decision: use this course as the second real-course fixture for Engine 4 reviewed promotion
  source: workflow verification run on 2026-04-21
  impact: keep the calculus baseline stable while testing content-authoring and promotion

- decision: use this course as the first real-course fixture for the new Engine 3 and Engine 4 collection rails
  source: retrieval verification run on 2026-04-21
  impact: keep the calculus module-level sourcing path stable while proving that retrieved candidates can flow into reviewed runtime assets

## Open Decisions

- decision: which module should be refined next
  why it matters: it decides the next authoring focus
  recommended default: start with the first incomplete module in the queue
  user confirmation needed: yes

- decision: which SBRA mission should be authored next
  why it matters: it decides the next assessment focus
  recommended default: start with the first draft mission in the log
  user confirmation needed: yes

## Real-Course Findings

- finding: Engine 4 can create `content-source-policy`, `content-retrieval-queries`, `retrieved-content`, `screened-content`, `content-classification`, and `content-drafts` on this course without changing framing or runtime contracts
  impact: the content-authoring rail is reusable on a second real course

- finding: one reviewed content draft can be promoted into module source and still keep `build-course` plus `validate-course --check-output` passing
  impact: this course now satisfies the current `publishable baseline` through Engine 4

- finding: rerunning `run-course-workflow` preserved the approved content draft instead of resetting it to pending
  impact: review-first automation now survives a real rerun on a second course

- finding: `retrieve-problems -> screen-retrieved-problems -> promote-screened-problems-to-pool -> classify-problem-pool -> build-mission-drafts` now works on this course without manual file surgery in the middle
  impact: the new Engine 3 collection rail is viable as a shared upstream path, not just a paper architecture

- finding: `retrieve-content -> screen-retrieved-content -> classify-content-sources -> build-content-drafts` now works on this course and can still promote one approved content draft afterward
  impact: the new Engine 4 collection rail is viable as a shared upstream path, not just a manual intake path

- finding: screening now preserves review metadata and source excerpts across reruns, and problem-pool promotion now replaces older items by `retrieval_id`
  impact: the collection rails can be rerun without silently dropping approval state or keeping broken pool artifacts around

- finding: targeted web import from `tutorial.math.lamar.edu` works after adding an approved source-policy entry and tightening the PDF fallback so HTML pages no longer collapse into broken `Complete.pdf` errors
  impact: the web-import path is viable for cleaner educational sites, but it still needs stronger text normalization before it should be treated as a high-quality default

- finding: a curated `latex-problem-set-intake.md` fixture is now stored under this course as the preferred Engine 3 upstream example for user-provided assessment sources
  impact: later Engine 3 work can pressure-test a cleaner assessment-intake path without reopening noisy retrieval as the default

- finding: a second curated `latex-problem-set-applied-intake.md` fixture is now stored under this course to pressure-test the same Engine 3 block with modeling and applied-calculus prompts
  impact: the shared intake law now has one computational fixture and one applied fixture under the same course

- finding: `classify-latex-problem-intake.mjs` now classifies every curated LaTeX item in this course into first-pass topic, module, CLO, Bloom, likely technique, answer type, multi-step flag, misconception tags, and downstream assessment target
  impact: Engine 3 can now separate curated intake items into likely `quick-check`, `module-checkpoint`, `active-learning-task`, and `sbra-exercise-bank` candidates before problem-pool normalization

- finding: the same classifier now also writes grouped by-module review outputs in both JSON and Markdown
  impact: instructors and Codex can review curated problem banks chapter-by-chapter instead of scanning one flat classification list

- finding: adding a continuity-plus-integral-applications LaTeX fixture exposed one parser edge case and one topic-mapping gap, both now fixed in `classify-latex-problem-intake.mjs`
  impact: grouped review now shows `continuity-and-applications` as its own five-item cluster and keeps applied-integral prompts inside the integration module

- finding: `problem-pool.json` now carries solution-planning metadata such as `solution_status`, `solution_required`, `expected_answer_form`, and `needs_solution_review`
  impact: Engine 3 can now store first and solve later without losing track of which items still need worked solutions before stronger downstream use

- finding: `promote-latex-intake-classification-to-pool.mjs` now bridges curated LaTeX intake classifications directly into `problem-pool.json`
  impact: Engine 3 now has a clean upstream path from curated LaTeX source -> intake classification -> problem pool without manual file surgery in the middle

- finding: `build-solution-drafts.mjs` now builds review-first solution drafts from `problem-pool.json` for all items where `solution_required: true`
  impact: Engine 3 now supports the intended `store first, solve later` pattern with a real intermediate solution-authoring rail

- finding: solution drafts now separate their content by downstream target, so quick checks get answer-only profiles while active-learning and SBRA targets receive richer analysis, steps, and reasoning structures
  impact: the same pool item can now support different assessment shapes without forcing one generic solution format onto every downstream use

- finding: `solve-solution-drafts.mjs` now runs a real solve pass over this course and fills `expected_answer`, `full_solution_latex`, and downstream answer slots for almost the entire pool
  impact: Engine 3 now has a concrete `store first, solve later` path that can pressure-test whether a real course can carry worked answers before runtime promotion

- finding: 156 out of 157 pool items on this course now have solved solution drafts, while one older OpenStax retrieval item remains blocked because its imported statement is too incomplete to solve honestly
  impact: the main blocker on full-pool solving is source quality on legacy retrieval artifacts, not the new curated LaTeX intake path

- finding: `build-sbra-item-drafts.mjs` now converts solved `sbra_exercise_bank` candidates into explicit SBRA shells with a `step-choice` row and a `reason-choice` row for each step
  impact: Engine 3 now has a first real bridge from worked-solution authoring into the choice-based CLO-evidence format the project wants to use

- finding: first-pass SBRA tagging is now sharper at the upstream classification layer, with curated items split into `strong`, `medium`, and `not_recommended` evidence bands plus pattern and distractor hints
  impact: direct computation and quick-check items no longer masquerade as SBRA-ready evidence, while applied reasoning items now carry clearer hooks for later SBRA hardening

## Course Snapshot

- course_id: `calculus1_real_check`
- course_name: Calculus I
- module_count: 4
- clo_count: 4

