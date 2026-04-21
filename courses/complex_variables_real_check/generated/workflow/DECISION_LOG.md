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

- decision: learner-facing shell hardening for this course is closed after removing template-internal tone leakage from course-level metadata
  source: validation pass on 2026-04-21
  impact: do not reopen top-level page shell work here unless a later build fails again

- decision: collection work for this course is paused because the current retrieval quality is still not satisfactory to the user
  source: user feedback on 2026-04-21
  impact: do not treat the current web-first or PDF-first retrieval approach as accepted; revisit only after a better sourcing idea is chosen

## Open Decisions

- decision: when to open item-layer authoring for this course
  why it matters: it decides when `problem-pool-starter.md` and richer mission items should begin
  recommended default: wait until the user wants to pressure-test item-level authoring
  user confirmation needed: yes

- decision: if this course needs a larger bank of candidate problems, open the problem-sourcing layer before item-level authoring
  why it matters: it lets the course gather and screen educational-source problems before they become pool items
  recommended default: keep source policy and screening human-reviewed, then move accepted candidates into later problem-pool work
  user confirmation needed: no

- decision: what the next sourcing strategy should be
  why it matters: the current collection engine was tested but did not satisfy the user, so the next retrieval approach should change before more engineering time is spent
  recommended default: pause and redesign the collection strategy first
  user confirmation needed: yes

## Course Snapshot

- course_id: `complex_variables_real_check`
- course_name: Complex Variables
- module_count: 5
- clo_count: 5

