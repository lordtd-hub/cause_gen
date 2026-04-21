# REAL COURSE BASELINE REVIEW

## Accepted Baselines

- `init-new-course` is sufficient for opening a course from minimal bootstrap information
- `import-materials` is sufficient for first-pass `.docx -> .md` extraction when OOXML structure is preserved
- `TQF3_MD_PACKAGE` is sufficient for shaping the first framing pass
- `Teaching Method Map` is sufficient for shaping activity direction
- `CLO Coverage View` is sufficient for mapping introduce / practice / assess
- `Resource Seed List` is sufficient as a structured resource-planning layer
- `Source Inventory Status` is sufficient for showing what exists and what is still missing
- `source_refs` plus `apply-source-refs` are sufficient for the first source bridge into modules
- `Assessment Evidence Map -> Mission Framing -> missions/missions.json` is sufficient as a mission bridge
- `Resource Seed List -> resources/manifest.json` is sufficient as a resource bridge
- `Assessment Evidence Map badge hooks -> course.config.json` is sufficient as a badge bridge
- `build-course` and `validate-course --check-output` are sufficient for the honest output check
- `Problem Pool Template -> problem-pool.json -> assessment-classification.json -> mission-drafts.json` is sufficient as a semi-automatic item-layer rail
- `mission-drafts.json -> promote-mission-drafts -> missions/missions.json` is sufficient as a reviewed assessment promotion rail
- `retrieved-content.json -> screened-content.json -> content-classification.json -> content-drafts.json` is sufficient as a first real content-authoring rail
- `content-drafts.json -> promote-content-drafts -> modules/*.md` is sufficient as a reviewed content promotion rail
- `run-course-workflow.mjs` is sufficient as a safe orchestrator for the current review-first baseline

## Baselines That Are Not Yet Enough

- distractor quality is still too manual for larger mission banks
- final learner-facing copy polish still needs a later pass
- downstream use from `mission-drafts.json` into stronger runtime-ready assets is still manual
- batch promotion is still intentionally out of scope

## Most Important Evidence From This Trial

1. The current workflow still holds after removing the earlier AI and analysis test courses
2. The bridge stack now works on a project-based mathematics course, not just on earlier examples
3. The next large task should come from deeper item-layer use, not from reopening accepted bridges
4. The four-engine replan now has one real-course fixture that reaches `ready-for-publishable-baseline`

## Recommendation

Use the evidence from the two real-course runs before opening the next large framework task.
