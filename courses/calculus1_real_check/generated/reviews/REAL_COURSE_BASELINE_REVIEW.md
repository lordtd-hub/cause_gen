# REAL COURSE BASELINE REVIEW

## Workflow Result

- `calculus1_real_check` now passed a real-course verification of the new Engine 3 and Engine 4 collection rails
- the course kept `build-course` and `validate-course --check-output` passing after one reviewed mission draft and one reviewed content draft were promoted through the Core Course Engine
- `check-workflow-readiness` now reports `assessment-ready`, `content-ready`, and `ready-for-publishable-baseline`

## Baselines Confirmed By This Course

- Engine 1 framing stayed stable while Engine 4 was added later
- Engine 2 remained the only final integrator
- `retrieve-problems -> screen-retrieved-problems -> promote-screened-problems-to-pool -> classify-problem-pool -> build-mission-drafts` is sufficient as a real assessment collection rail
- `init-content-authoring -> screen-retrieved-content -> classify-content-sources -> build-content-drafts` is sufficient as a real content-authoring rail
- targeted web import from `tutorial.math.lamar.edu` can now collect screened problem and content candidates without collapsing into the broken PDF fallback path
- `promote-content-drafts -> modules/*.md` is sufficient as a reviewed promotion bridge through Engine 2
- `promote-mission-drafts -> missions/missions.json` is sufficient as a reviewed promotion bridge through Engine 2
- `run-course-workflow` can rerun safely without resetting unchanged approved content drafts
- screening and problem-pool promotion now preserve enough source and review state to survive reruns
- this course now also carries a `latex-problem-set-intake.md` fixture as the preferred Engine 3 example when assessment sources are already curated and written in LaTeX
- this course now also carries a `latex-problem-set-applied-intake.md` fixture so the same Engine 3 intake block can be tested against applied and modeling-heavy prompts
- `classify-latex-problem-intake.mjs` can now classify all curated LaTeX items in this course into first-pass assessment-use proposals before problem-pool work begins
- the current first-pass split on this course is broad enough to support downstream review by use case, with candidates now proposed for `quick-check`, `module-checkpoint`, `active-learning-task`, and `sbra-exercise-bank`

## Verified Runtime Evidence

- one screened problem was promoted into `problem-pool.json`
- one mission draft was built from the promoted problem and then promoted into `missions/missions.json`
- one reviewed content draft was promoted into module source
- the promoted block now lives under the continuity module source and was rebuilt into the course output
- no new output validation failure was introduced by the reviewed content promotion
- all 156 curated LaTeX problems from the computational, applied, and continuity-plus-integral fixtures now have first-pass topic/module/CLO/Bloom/technique/use-target classifications in `generated/assessment/latex-problem-intake-classification.json`
- the same 156 curated items are now also grouped into module-level review files so assessment design can be checked chapter-by-chapter instead of only through a flat list
- after adding a dedicated continuity-plus-integral-applications intake fixture, the grouped classifier now surfaces a separate `continuity-and-applications` module cluster and a cleaner `integration` cluster for applied definite-integral prompts
- `promote-latex-intake-classification-to-pool.mjs` can now move reviewed LaTeX intake classifications into `problem-pool.json` while preserving solution-planning and review metadata already stored on pool items
- `build-solution-drafts.mjs` can now read `problem-pool.json` and create a review-first `solution-drafts.json` layer for items marked `solution_required: true`
- the same solution rail now distinguishes between answer-only quick checks, concept-plus-answer checkpoints, active-learning analysis flows, and SBRA-style process/reasoning step drafts
- `solve-solution-drafts.mjs` can now fill real `expected_answer` values and `full_solution_latex` for 156 out of 157 pool items on this course
- the only unsolved pool item is an older retrieval artifact with an incomplete statement, which now stays visibly blocked instead of silently receiving a made-up answer
- `build-sbra-item-drafts.mjs` can now turn solved SBRA candidates into explicit step-choice plus reason-choice shells under `generated/assessment/sbra-item-drafts.json`
- the same course now also carries sharper upstream `sbra_profile` tags, separating `strong` CLO-evidence candidates from `medium` support-evidence items and `not_recommended` quick-check style computations

## Remaining Gaps

- collection quality can still improve, especially when source pages contain dense math notation or less clean HTML
- punctuation normalization from some web pages is still imperfect even when the collected candidate is otherwise relevant
- deeper interactive-authoring quality is still a later step
- final learner-facing prose can still improve after the current baseline

## Recommendation

Treat the Engine 3 and Engine 4 collection patterns as accepted on this course and keep the next pressure point on larger-scale item authoring or richer interactive content, not on reopening the basic collection rails.
