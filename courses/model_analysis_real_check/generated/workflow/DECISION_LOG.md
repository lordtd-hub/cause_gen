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

- decision: the current bridge stack is accepted for this course after one full real-course run
  source: workflow run on 2026-04-21
  impact: do not reopen import or bridge work here unless a later run fails

## Open Decisions

- decision: when to open item-layer authoring for this course
  why it matters: it decides when `problem-pool-starter.md` and richer mission items should begin
  recommended default: wait until the user wants to pressure-test item-level authoring
  user confirmation needed: yes

## Course Snapshot

- course_id: `model_analysis_real_check`
- course_name: Analysis of Mathematical Models
- module_count: 6
- clo_count: 6

