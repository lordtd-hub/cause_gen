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

## Open Decisions

- decision: which module should be refined next
  why it matters: it decides the next authoring focus
  recommended default: start with the first incomplete module in the queue
  user confirmation needed: yes

- decision: which SBRA mission should be authored next
  why it matters: it decides the next assessment focus
  recommended default: start with the first draft mission in the log
  user confirmation needed: yes

## Course Snapshot

- course_id: `intro_to_ai_real_check`
- course_name: Introduction to Artificial Intelligence
- module_count: 4
- clo_count: 4

