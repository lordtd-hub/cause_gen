# tools/

This folder contains the main scripts for course setup, material import, TQF3 bridging, draft generation, build, and validation in this repo.

## Engine Navigation

Use these folders as the first navigation layer when you want to work by engine instead of by individual script:

- `tools/tqf3-intake/`
- `tools/core-course/`
- `tools/problem-sourcing/`
- `tools/assessment-engine/`
- `tools/content-authoring/`

## Sandbox Python

If Python is needed inside Codex sandbox, use the repo-local wrappers instead of assuming `python` is on PATH:

- `.\tools\python.cmd`

If PowerShell script execution is allowed, you may also use:

- `powershell -ExecutionPolicy Bypass -File .\tools\python.ps1`

The canonical sandbox-safe entrypoint is `.\tools\python.cmd`.

For move-to-another-machine handoff, run:

- `node tools/check-machine-readiness.mjs`

## Repo Laws

- Every course source must live under `courses/<course-id>/`
- Every built output must live under `courses/<course-id>/output/`
- Do not create new courses at the repo root
- If the source starts from `TQF3`, begin with the `TQF3 markdown package` and framing before deep authoring
- If only `TQF3` exists, it is still valid to scaffold and build the first honest output before stronger inside content exists

## Main Commands

### `node tools/init-new-course.mjs --spec <path> [--course-dir courses/<course-id>] [--force]`

Create a new course skeleton under `courses/` together with `generated/*.md` working files for Codex.

### `.\tools\init-new-course.ps1`

Interactive wrapper for terminal-based course setup. It prepares a spec, validates it, and opens a new course.

### `node tools/validate-init-spec.mjs --spec <path>`

Validate an `init-new-course` spec before scaffolding.

### `.\tools\python.cmd <script-or-flags>`

Run bundled Codex Python directly from the repo without depending on system PATH.

Fallback order:

1. `CODEX_BUNDLED_PYTHON`
2. bundled Codex runtime under the current user profile
3. `python` on PATH
4. `py -3`

### `powershell -ExecutionPolicy Bypass -File .\tools\python.ps1 <script-or-flags>`

PowerShell wrapper for the same bundled Codex Python runtime when execution policy blocks direct `.ps1` execution.

### `node tools/check-machine-readiness.mjs`

Check whether another machine is ready to continue this repo. It verifies:

- core repo folders
- Node.js
- Python wrapper resolution
- optional vendored solver dependencies for offline assessment work

### `node tools/import-materials.mjs --course-dir courses/<course-id> [input-path ...]`

Import `.md`, `.docx`, and `.tex` files into `materials/processed/` as normalized Markdown drafts.

Notes:
- `.docx` is now read from OOXML directly instead of flat text extraction
- the current importer reads `word/document.xml` together with `word/numbering.xml`
- ordered lists and bullet lists are now separated more reliably
- table cells now preserve internal paragraph breaks more cleanly with `<br>` in Markdown tables
- dense inline enumerations from TQF3 `.docx` files are now split into readable paragraph/list-like blocks more reliably
- the current importer should preserve paragraphs, headings, lists, and tables more reliably than before

### `node tools/draft-course.mjs --course-dir courses/<course-id> [--force]`

Create an initial course draft from the current materials to help seed config, module stubs, and mission framing.

### `node tools/apply-source-refs.mjs --course-dir courses/<course-id>`

Use `source_refs` in `modules/*.md` to fill placeholder sections from referenced processed source.

### `node tools/apply-mission-framings.mjs --course-dir courses/<course-id>`

Turn `generated/MISSION_FRAMING_*.md` files into draft runtime missions in `missions/missions.json`.

### `node tools/apply-resource-seeds.mjs --course-dir courses/<course-id>`

Turn `materials/processed/intake/tqf3-resource-seed-list.md` into first-pass entries in `resources/manifest.json`.

### `node tools/apply-badge-hooks.mjs --course-dir courses/<course-id>`

Turn badge hooks from `materials/processed/intake/tqf3-assessment-evidence-map.md` into badge rules in `course.config.json`.

### `node tools/init-assessment-engine.mjs --course-dir courses/<course-id> [--force]`

Initialize the semi-automatic item-authoring engine by creating:

- `materials/processed/assessment/problem-pool.json`
- `generated/assessment/assessment-classification.json`
- `generated/assessment/mission-drafts.json`

If `problem-pool-starter.md` already exists, the initializer will import its table rows into `problem-pool.json`.

The pool now also preserves solution-planning metadata so items can be stored first and solved later in a controlled way:

- `solution_status`
- `solution_required`
- `expected_answer_form`
- `needs_solution_review`

### `node tools/classify-latex-problem-intake.mjs --course-dir courses/<course-id> [--input <intake-file>]`

Read curated `latex-problem-set-*.md` intake files under `materials/processed/assessment/` and create `generated/assessment/latex-problem-intake-classification.json` as first-pass proposals for:

- topic
- module
- CLO
- Bloom
- likely technique
- answer type
- multi-step flag
- misconception tags
- downstream assessment use such as `quick-check`, `module-checkpoint`, `active-learning-task`, and `sbra-exercise-bank`

This is a review-first intake classifier, not a runtime publisher.

### `node tools/promote-latex-intake-classification-to-pool.mjs --course-dir courses/<course-id>`

Promote curated LaTeX intake classifications into `materials/processed/assessment/problem-pool.json`.

This bridge keeps the work at the source-layer level:

- it preserves existing item review state when problem ids already exist
- it adds solution-planning metadata for `store first, solve later`
- it does not publish runtime missions directly

### `node tools/build-solution-drafts.mjs --course-dir courses/<course-id>`

Read `materials/processed/assessment/problem-pool.json` and create `generated/assessment/solution-drafts.json` for items where `solution_required: true`.

This rail is for review-first solution authoring. It drafts:

- expected answer
- solution outline
- hint drafts
- common error notes

It now also separates solution structure by downstream use:

- `quick-check` -> answer only
- `module-checkpoint` -> concept summary + answer
- `active-learning-task` -> problem analysis + method steps + answer
- `sbra-exercise-bank` -> SBRA-style step drafts with process and reasoning options

It is not a final answer key and should be reviewed before stronger downstream use.

### `node tools/solve-solution-drafts.mjs --course-dir courses/<course-id>`

Run the real solve pass against `materials/processed/assessment/problem-pool.json` and merge the results into `generated/assessment/solution-drafts.json`.

This pass fills real downstream-ready fields such as:

- `expected_answer`
- `full_solution_latex`
- `downstream_profiles.*.answer`

Current baseline:

- works for the curated Calculus I pool fixture with SymPy plus handwritten heuristics
- preserves review state already stored on solution drafts
- keeps blocked items visible instead of silently inventing answers

### `node tools/build-sbra-item-drafts.mjs --course-dir courses/<course-id>`

Read `generated/assessment/solution-drafts.json` and turn solved `sbra_exercise_bank` candidates into explicit `generated/assessment/sbra-item-drafts.json`.

Each SBRA draft now carries:

- the original item prompt
- one `step-choice` row per step
- one `reason-choice` row per step
- the expected answer and worked solution as authoring support

This is the current bridge from solved worked-solution items into choice-based CLO-evidence assessment shells.

### `node tools/classify-problem-pool.mjs --course-dir courses/<course-id>`

Read `problem-pool.json` and create `generated/assessment/assessment-classification.json` as AI-style proposals for:

- module
- CLO
- Bloom
- mission family
- SBRA shape

All classifications are still marked for human review.

### `node tools/build-mission-drafts.mjs --course-dir courses/<course-id>`

Read `generated/assessment/assessment-classification.json` and build `generated/assessment/mission-drafts.json` as draft-level SBRA-ready mission blueprints.

### `node tools/promote-mission-drafts.mjs --course-dir courses/<course-id>`

Promote only approved mission drafts into `missions/missions.json` and write a promotion log to `generated/bridges/assessment-promotion-log.json`.

### `node tools/init-problem-sourcing.mjs --course-dir courses/<course-id> [--force]`

Initialize the semi-automatic internet problem sourcing engine by creating:

- `generated/sourcing/problem-source-policy.json`
- `generated/sourcing/retrieval-queries.json`
- `generated/sourcing/retrieved-problems.json`
- `generated/sourcing/screened-problems.json`

### `node tools/retrieve-problems.mjs --course-dir courses/<course-id> [--query-id <id>] [--source-id <id>] [--url <url>] [--file <path>]`

Retrieve candidate assessment problems from approved educational sources into `generated/sourcing/retrieved-problems.json`.

Modes:

- query-driven retrieval from the course retrieval plan
- direct document ingestion for approved PDF URLs or local PDFs
- direct URL ingestion for approved source pages, with PDF-first fallback when a document is available

### `node tools/screen-retrieved-problems.mjs --course-dir courses/<course-id>`

Read `generated/sourcing/retrieved-problems.json` together with the source policy and retrieval queries, then build `generated/sourcing/screened-problems.json` as human-review-first proposals for later item-authoring work.

### `node tools/promote-screened-problems-to-pool.mjs --course-dir courses/<course-id>`

Promote only approved screened problem candidates into `materials/processed/assessment/problem-pool.json`.

### `node tools/init-content-authoring.mjs --course-dir courses/<course-id> [--force]`

Initialize the semi-automatic content-authoring rail by creating:

- `generated/sourcing/content-source-policy.json`
- `generated/sourcing/content-retrieval-queries.json`
- `generated/sourcing/retrieved-content.json`
- `generated/sourcing/screened-content.json`
- `generated/content/content-classification.json`
- `generated/content/content-drafts.json`

### `node tools/retrieve-content.mjs --course-dir courses/<course-id> [--query-id <id>] [--source-id <id>] [--url <url>] [--file <path>]`

Retrieve candidate learning-content assets from approved educational sources into `generated/sourcing/retrieved-content.json`.

Modes:

- query-driven retrieval from the course retrieval plan
- direct document ingestion for approved PDF URLs or local PDFs
- direct URL ingestion for approved source pages, with PDF-first fallback when a document is available

### `node tools/screen-retrieved-content.mjs --course-dir courses/<course-id>`

Read `generated/sourcing/retrieved-content.json` together with the content source policy and retrieval queries, then build `generated/sourcing/screened-content.json` as review-first content candidates.

### `node tools/classify-content-sources.mjs --course-dir courses/<course-id>`

Read `generated/sourcing/screened-content.json` and create `generated/content/content-classification.json` as AI-style proposals for:

- module
- CLO
- Bloom
- content kind
- asset family
- target section
- widget type

### `node tools/build-content-drafts.mjs --course-dir courses/<course-id>`

Read `generated/content/content-classification.json` and build `generated/content/content-drafts.json` as review-first interactive/content drafts.

### `node tools/promote-content-drafts.mjs --course-dir courses/<course-id>`

Promote only approved content drafts into managed blocks inside `modules/*.md` and write a promotion log to `generated/bridges/content-promotion-log.json`.

### `node tools/run-course-workflow.mjs --course-dir courses/<course-id>`

Run the non-destructive orchestration flow. It initializes missing rails, runs safe generation steps, promotes only approved drafts, builds the course, validates it, and prints the readiness snapshot.

### `node tools/new-sbra.mjs <mission-id> <clo-id> <module-id> [numSteps]`

Print a JSON draft for a mission that follows the generic SBRA schema so it can be pasted into `missions/missions.json`.

### `node tools/build-course.mjs --course-dir courses/<course-id>`

Build a self-contained course site into `courses/<course-id>/output/`.

### `node tools/validate-course.mjs --course-dir courses/<course-id>`

Validate source contracts such as config, modules, missions, and resources.

### `node tools/validate-course.mjs --course-dir courses/<course-id> --check-output`

Validate the built output for learner-facing structure, KaTeX assets, and mojibake leakage.

### `node tools/check-mojibake.mjs [--json]`

Scan repo docs, tools, and course source for unexpected mojibake. The scanner ignores the small set of detector files that intentionally contain mojibake patterns for validation logic.

### `node tools/check-workflow-readiness.mjs --course-dir courses/<course-id> [--json]`

Check which workflow phases and engines are already ready for a course, what is still missing, what the next recommended command should be, and whether the course has reached the current `publishable baseline`.

The readiness tool now treats `item-layer` as a shared workflow spanning:

- `Engine 3: Assessment Authoring Engine`
- `Engine 4: Content Authoring Engine`

Use this law when deciding whether to deepen one course or lock a reusable item-layer contract first:

- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\SHARED_ITEM_LAYER_WORKFLOW.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/SHARED_ITEM_LAYER_WORKFLOW.md)

Readiness levels:

- `critical`: missing this should block the workflow until fixed
- `important`: not a full blocker, and AI can often help draft the missing layer
- `optional`: useful next layer, but safe to defer

## Recommended Workflow

1. `init-new-course`
2. `import-materials`
3. prepare the `TQF3 markdown package` in `materials/processed/`
4. if `source_refs` exist, run `apply-source-refs`
5. if mission framing files exist, run `apply-mission-framings`
6. if resource seed files exist, run `apply-resource-seeds`
7. if badge hooks exist in the evidence map, run `apply-badge-hooks`
8. if you want to source candidate problems from educational internet sources, run `init-problem-sourcing`
9. run `retrieve-problems` in `document-first` mode, preferably with PDFs when available, then run `screen-retrieved-problems`
10. approve only the screened problem candidates that should enter the shared pool, then run `promote-screened-problems-to-pool`
11. if you are entering item-level assessment authoring, run `init-assessment-engine`
12. use `classify-problem-pool` and `build-mission-drafts` as the semi-automatic assessment-authoring rail
13. if you are entering item-level learning-content authoring, run `init-content-authoring`
14. run `retrieve-content` in `document-first` mode, preferably with PDFs when available, then run `screen-retrieved-content`
15. run `classify-content-sources` and `build-content-drafts`
16. promote only approved mission/content drafts
17. `build-course`
18. `validate-course --check-output`
19. `check-mojibake`
20. use `check-workflow-readiness` whenever you need a phase-level readiness snapshot

When item-level work begins, follow the shared cross-course rail instead of inventing a course-specific flow:

21. follow `SHARED_ITEM_LAYER_WORKFLOW.md`

## Shared Sourcing Library

Engine 3 and Engine 4 share only the sourcing infrastructure:

- `tools/lib/shared-sourcing.mjs`

This library owns:

- source policy records
- retrieval query planning
- provenance and attribution fields
- license notes and use-mode tags
- dedupe grouping
- screening status and review flags

After screening, the downstream schemas must stay separate.

## Real-Course Hardening

- `.docx` import now preserves OOXML structure instead of flat text extraction
- `.docx` import now reads `numbering.xml` so list structure survives more reliably
- `.docx` import now preserves paragraph separation inside table cells more cleanly
- `.docx` import now includes an extra pass for dense inline enumerations that Word often stores inside long paragraphs
- bridge tools are expected to clean stale bootstrap artifacts when the real course shape changes
- resource bridges must keep valid fallback ids when slugging from learner-facing titles fails
- after changing a shared bridge, rerun the workflow on a real course before accepting the change

See:

- [C:\Users\User\Documents\Cause_gen\docs\REAL_COURSE_HARDENING.md](/C:/Users/User/Documents/Cause_gen/docs/REAL_COURSE_HARDENING.md)

## Related Laws

- [C:\Users\User\Documents\Cause_gen\docs\LATEX_RENDERING_LAW.md](/C:/Users/User/Documents/Cause_gen/docs/LATEX_RENDERING_LAW.md)
- [C:\Users\User\Documents\Cause_gen\docs\UTF8_TEXT_HARDENING.md](/C:/Users/User/Documents/Cause_gen/docs/UTF8_TEXT_HARDENING.md)
- [C:\Users\User\Documents\Cause_gen\docs\new-course-template\README.md](/C:/Users/User/Documents/Cause_gen/docs/new-course-template/README.md)


