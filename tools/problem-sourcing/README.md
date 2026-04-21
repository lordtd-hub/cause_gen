# Problem Sourcing Engine

This folder contains the shared rails for the semi-automatic internet problem sourcing engine.

Design law:

- AI is the proposer
- schema is the rail
- human is the approver

This engine is upstream from the assessment engine. It is meant to collect and screen candidate problems from educational sources before they become problem-pool items.

Default collection mode is now `document-first`, especially `PDF-first`.
When a source page offers a PDF handout, lecture note, or problem sheet, the retriever should read that document before falling back to page HTML.

It shares its sourcing primitives with the Content Authoring Engine through:

- `tools/lib/shared-sourcing.mjs`

## Scope

The first version is intentionally semi-automatic.

It does not crawl the internet autonomously.
It does:

- define approved educational source policies
- define retrieval query plans
- retrieve candidate problems from approved educational sources, direct PDF URLs, local PDFs, or resource pages that link to PDFs
- store retrieved candidate problems
- screen retrieved candidates into safer downstream items

## Core Outputs

- `generated/sourcing/problem-source-policy.json`
- `generated/sourcing/retrieval-queries.json`
- `generated/sourcing/retrieved-problems.json`
- `generated/sourcing/screened-problems.json`

## Main Commands

```bash
node tools/init-problem-sourcing.mjs --course-dir courses/<course-id>
node tools/retrieve-problems.mjs --course-dir courses/<course-id>
node tools/screen-retrieved-problems.mjs --course-dir courses/<course-id>
node tools/promote-screened-problems-to-pool.mjs --course-dir courses/<course-id>
```

## Intended Flow

1. initialize the sourcing engine for a course
2. review and refine the source policy
3. review and refine the retrieval queries
4. run `retrieve-problems` in `PDF-first` mode or provide approved PDF files/URLs to collect candidate problems into `retrieved-problems.json`
5. run `screen-retrieved-problems`
6. review the screened output
7. approve only the candidates that should enter the shared problem pool
8. run `promote-screened-problems-to-pool`

## Educational Use Note

This repo is being used for educational and non-commercial support of students.

That does not remove the need for source checks. Each candidate problem should still record:

- source URL
- source title
- source type
- license note
- attribution requirement
- whether the candidate is safe for ingestion, link-only use, or manual review

## Rail

- retrieval does not imply approval
- screening does not imply runtime readiness
- candidates from unknown or unclear licenses must stay manual-review-first
- only screened candidates should move into later item-authoring layers
- this engine shares sourcing infrastructure with Engine 4, but it does not share downstream authoring schemas

