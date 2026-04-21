# Real-Course Workflow Crosscheck

This file summarizes what the current workflow has already survived across multiple real TQF3-driven courses.

## Verified Real-Course Runs

- `courses/project_in_mathematics_real_check/`
- `courses/calculus1_real_check/`
- `courses/intro_to_ai_real_check/`
- `courses/complex_variables_real_check/`
- `courses/model_analysis_real_check/`

## What Now Looks Stable

- `init-new-course`
- `.docx -> .md` import with OOXML-aware parsing
- TQF3 markdown package authoring
- `apply-source-refs`
- `apply-mission-framings`
- `apply-resource-seeds`
- `apply-badge-hooks`
- `init-problem-sourcing`
- `screen-retrieved-problems`
- `promote-screened-problems-to-pool`
- `init-assessment-engine`
- `classify-problem-pool`
- `build-mission-drafts`
- `promote-mission-drafts`
- `init-content-authoring`
- `retrieve-problems` with direct educational PDFs
- `retrieve-content`
- `retrieve-content` with direct educational PDFs
- `screen-retrieved-content`
- `classify-content-sources`
- `build-content-drafts`
- `promote-content-drafts`
- `run-course-workflow`
- `build-course`
- `validate-course --check-output`
- `check-workflow-readiness`

## What These Runs Covered

- theory-heavy calculus
- AI with coding and ethics direction
- project-based mathematics
- complex analysis style mathematics
- mathematical modeling with project-based weeks

## What Is Still Not Fully Solved

- item-layer authoring
- stronger downstream use from problem sourcing into problem pools
- retrieval quality from external sources is still not accepted as a satisfactory baseline
- higher-quality distractor banks for larger mission sets
- richer final learner-facing copy after the first honest build
- some older course fixtures still need learner-facing skeleton hardening even when the new Engine 4 rail itself succeeds

## Improvement Signal

The main workflow is no longer the weak point. The strongest remaining pressure comes from item-level authoring rather than from scaffold or bridge structure.

The latest crosscheck also shows a useful split:

- `calculus1_real_check` now confirms that the new collection rails work end-to-end for both problems and content, not just downstream promotion after manual intake
- `calculus1_real_check` confirms the Engine 4 reviewed-promotion pattern holds on a second real course
- `complex_variables_real_check` exposes older learner-facing shell debt that should be hardened separately from the new content-authoring rail
- `complex_variables_real_check` now also shows that direct MIT OCW PDFs can feed both retrieval rails cleanly, even when the surrounding resource page shell is less reliable than the document itself
- user feedback after the PDF-first test is still negative on the overall retrieval experience, so the collection layer remains open for redesign rather than accepted as complete
- `calculus1_real_check` now also shows that targeted web import from a cleaner educational site can collect usable candidates after source-policy and PDF-fallback fixes
- the same web-import test still leaves punctuation normalization gaps on some excerpts, so web collection should be treated as partially working rather than accepted as high-quality intake
