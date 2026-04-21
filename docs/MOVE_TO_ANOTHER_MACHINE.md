# Move To Another Machine

Use this when you want to continue the same Cause Gen work on a second computer without rebuilding the workflow by hand.

## Goal

Move the repo so the second machine can:

- open the same courses
- keep the same four-engine workflow
- reuse the same assessment/content authoring rails
- keep working even if the bundled Codex Python path is different

## What To Carry

Copy or clone the whole repo, especially:

- `courses/`
- `docs/`
- `tools/`
- `templates/`
- `css/`
- `js/`

If you want the second machine to work offline more easily, also keep:

- `tools/vendor_clean/`
- `tools/wheels/`

These are optional but useful for the current solver-based assessment flow.

## What Not To Depend On

Do not depend on machine-local artifacts such as:

- `.venv/`
- `.tmp/`
- `tools/vendor/`

Those are local or unstable and should not be treated as the portable source of truth.

## Python Rule

Inside Codex, the preferred entrypoint is still:

- `.\tools\python.cmd`

The wrappers now try this order:

1. `CODEX_BUNDLED_PYTHON` env var, if set
2. the default bundled Codex runtime path under the current user profile
3. `python` on PATH
4. `py -3`

That means the second machine can still work even if the Codex runtime is installed in a different user profile or if you need to point to a different Python explicitly.

If needed, set:

```powershell
$env:CODEX_BUNDLED_PYTHON="C:\path\to\python.exe"
```

## First Commands On The New Machine

Run these from the repo root:

```bash
node tools/check-machine-readiness.mjs
node tools/check-mojibake.mjs
node tools/check-workflow-readiness.mjs --course-dir courses/calculus1_real_check
```

If the machine will continue assessment work with solved items, also smoke-test:

```bash
node tools/build-solution-drafts.mjs --course-dir courses/calculus1_real_check
node tools/build-sbra-item-drafts.mjs --course-dir courses/calculus1_real_check
```

## Recommended Handoff Order

1. Confirm the repo opens and `node` works.
2. Run `node tools/check-machine-readiness.mjs`.
3. Confirm `.\tools\python.cmd --version` works.
4. Confirm one real course passes `check-workflow-readiness`.
5. Continue work from the course-specific files under `courses/<course-id>/`.

## Source Of Truth Reminder

The portable source of truth is the repo itself:

- `courses/<course-id>/`
- `docs/`
- `tools/`

Do not treat external Codex home files, AppData installs, or local scratch folders as the primary handoff target.
