# DECISION LOG

## Locked Decisions

- decision: lesson content uses `modules/*.md` as the main source
  source: user confirmed
  impact: edit source, not output

- decision: mission branching uses `missions/missions.json` as the main source
  source: user confirmed
  impact: missions should be changed there

- decision: new courses must live under `courses/<course-id>/`
  source: user confirmed
  impact: keep the repo organized and multi-course ready

- decision: outputs must live under `courses/<course-id>/output/`
  source: user confirmed
  impact: do not write public files to the repo root

- decision: if a baseline is accepted, stop expanding it until real-course evidence shows failure
  source: user confirmed
  impact: avoid design loops

- decision: the repo is governed by four engines and the core engine must remain the final integrator only
  source: user confirmed
  impact: keep sourcing, screening, and authoring logic upstream

- decision: Engine 3 and Engine 4 may share only the sourcing library, not downstream authoring schemas
  source: user confirmed
  impact: reuse retrieval/provenance logic without collapsing assessment and content work into one engine

- decision: automation stays review-first
  source: user confirmed
  impact: orchestration may generate and classify drafts, but runtime promotion still needs approved artifacts

## Real-Course Findings

- finding: `.docx -> .md` extraction now works well enough on this TQF3 file when OOXML structure is preserved
  impact: the package could be built from the processed markdown instead of manual recovery from XML noise

- finding: the full TQF3 package was enough to reframe the course without inventing new schema
  impact: the existing building blocks are reusable across at least two real courses

- finding: `apply-source-refs` held on a project-based course as well as on concept-heavy courses
  impact: module bridge logic is no longer limited to theorem or analysis modules

- finding: `apply-mission-framings` held on a project-feasibility mission
  impact: mission framing can move into runtime JSON outside the earlier AI and analysis examples

- finding: `apply-resource-seeds` needed one fallback-id fix for a Thai-titled resource and then held
  impact: the bridge is acceptable, and the tool now handles blank slug cases more safely

- finding: `apply-badge-hooks` held on this second real course
  impact: badge direction from the evidence map now looks reusable across more than one course shape

- finding: the new assessment engine can convert a starter problem pool into `problem-pool.json`, `assessment-classification.json`, and `mission-drafts.json`
  impact: item-level work now has a semi-automatic rail instead of jumping straight into runtime authoring

- finding: `problem-pool.json` now includes solution-planning metadata such as `solution_status`, `solution_required`, `expected_answer_form`, and `needs_solution_review`
  impact: this course can keep assessment items in the pool before full solutions are authored, while still tracking which items need solution work later

- finding: mission-family heuristics needed one correction so proof-repair items do not collapse into generic SBRA
  impact: item-type-specific heuristics should stay ahead of generic `usable_for: sbra` hints

- finding: approved content drafts were initially being reset to pending on rerun
  impact: draft builders now preserve prior review metadata for unchanged draft ids so orchestration remains review-first in practice

- finding: one reviewed assessment asset and one reviewed content asset can now be promoted through the core engine on this real-course fixture
  impact: the course now satisfies the current `publishable baseline` gate

## Open Decisions

- decision: the next large task should use one accepted problem-pool row downstream before expanding the item-level schema again
  why it matters: it will test whether the new engine outputs are actually enough for the next authoring move
  recommended default: pick one row and bridge it into a deeper authoring target before reopening the schema
  user confirmation needed: no

- decision: batch promotion remains out of scope until single-item and single-content promotion stay stable across more than one course
  why it matters: it keeps automation practical without skipping review safeguards too early
  recommended default: keep reviewed single-asset promotion as the baseline
  user confirmation needed: no

## Course Snapshot

- course_id: `project_in_mathematics_real_check`
- course_name: `Project in Mathematics`
- module_count: 4
- clo_count: 5

