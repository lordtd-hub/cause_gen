# Real-Course Hardening

This document records the fixes that became necessary only after running the full workflow on real courses.

## Purpose

Use this file to prevent the project from drifting back toward fragile bridges that only work on examples.

## Accepted Hardening Rules

### 1. Preserve OOXML Structure During `.docx` Import

Do not treat `.docx` as flat text.

Accepted rule:

- unzip the `.docx`
- read OOXML from `word/document.xml`
- read numbering metadata from `word/numbering.xml` when present
- preserve paragraphs, headings, lists, and tables as early as possible
- preserve paragraph breaks inside table cells instead of flattening them into one string
- recover dense inline enumerations when Word stores multiple numbered clauses inside one long paragraph

Reason:

- flat extraction destroys the structure that later framing depends on
- missing numbering metadata collapses ordered lists into weak generic bullets
- flattened table cells make TQF3 maps harder to review and harder for AI to reuse downstream

### 2. Bridges Must Clean Stale Bootstrap Artifacts

A bridge cannot assume that the course still uses the original bootstrap modules or missions.

Accepted rule:

- when real-course shaping changes module ids or runtime ids, bridge tools must remove stale entries that no longer belong

Reason:

- otherwise validation fails for the wrong reason and the course keeps old placeholder artifacts

### 3. Bridges Must Have Safe Fallback Keys

A resource bridge cannot assume that slug generation always works.

Accepted rule:

- if title-based slugging fails, fall back to url-based slugging or a deterministic generated id

Reason:

- runtime manifests must stay valid even when titles contain Thai or unusual punctuation

### 4. Re-Test Bridges On A Real Course Immediately

A bridge is not accepted after a code edit alone.

Accepted rule:

- after editing a shared bridge, rerun the full workflow on a real course:
  - `import-materials`
  - bridge step
  - `build-course`
  - `validate-course --check-output`

Reason:

- example-only testing hides integration bugs

### 5. Update Laws And Docs Right After Acceptance

Once a real-course fix is accepted:

- record it in docs
- update entry-point docs
- stop reopening it unless a later real-course run fails

Reason:

- otherwise the project remembers the fix only in chat history

## Order Of Remediation

When a real-course run fails, fix in this order:

1. source extraction
2. bridge compiler
3. runtime source files under `courses/<course-id>/`
4. build output
5. polish

Do not start by patching the built output if the root cause is upstream.

## Current Hardened Bridges

The following bridges are now accepted at baseline after real-course runs:

- `import-materials` with OOXML-aware `.docx` handling
- `apply-source-refs`
- `apply-mission-framings`
- `apply-resource-seeds`
- `apply-badge-hooks`

The `.docx` bridge is now accepted with:

- UTF-8-safe XML reading
- OOXML body parsing from `document.xml`
- numbering-aware list recovery from `numbering.xml`
- table-cell paragraph preservation in Markdown output
- dense inline enumeration splitting for TQF3-style long paragraphs

These baselines should stay closed unless a later real-course run shows that one is still insufficient.

## Cross-Course Evidence

The current accepted workflow has now been re-run on multiple real courses:

- calculus
- introductory AI
- complex variables
- mathematical model analysis

This means the current bridge stack is no longer justified only by one or two hand-tuned examples. The next large source of workflow pressure should be treated as item-layer authoring, not as a reason to reopen already accepted bridge baselines.
