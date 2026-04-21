# REAL COURSE BASELINE REVIEW

## Workflow Result

- `complex_variables_real_check` passed the full workflow from `TQF3 .docx -> imported markdown -> TQF3 package -> bridges -> build output`
- `validate-course --check-output` passed
- `check-workflow-readiness` ends at `can-continue-with-ai-help`
- publishability now reaches `ready-for-publishable-baseline`

## Baselines Confirmed By This Course

- OOXML-aware `.docx` import is strong enough for a theory-heavy mathematics course
- `TQF3 markdown package` is sufficient for shaping a complex analysis style course
- `apply-source-refs` works for concept-heavy and theorem-adjacent modules
- `Assessment Evidence Map -> Mission Framing -> missions.json` works for an analytic-function reasoning mission
- `Resource Seed List -> resources/manifest.json` works for mathematics references and worksheets
- `Badge Hook -> course.config.json` works for module-linked mission evidence

## Output Review

- top-level pages were built successfully
- module pages are learner-facing and free from mojibake
- no learner-facing source-path leakage was found in the output review pass
- the temporary shell validation failure came from template-internal wording in `course.config.json:description`, not from the Engine 4 rail or from encoding damage
- after replacing that wording with learner-facing copy, the output validation pass closed again

## Workflow Gaps Still Visible

- item-layer work is still missing
- `problem-pool-starter.md` is still not opened
- module prose is structurally complete but still baseline rather than fully authored
- the main remaining gap is item-layer authoring, not shell hardening

## Recommendation

Keep the current workflow baseline closed for this course and move the next pressure point to problem-pool and item-level authoring.
