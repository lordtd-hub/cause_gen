# Topic Source Draft Workflow

This document defines the shared `topic -> source draft` workflow for Engine 3 and Engine 4.

The goal is to let a user provide a topic target first, then let Codex gather or organize source material into structured Markdown drafts before those materials enter the normal authoring rails.

## Purpose

Use this workflow when:

- the user knows the topic, module, CLO, or Bloom target
- the course still needs source material
- the team wants something more guided than free-form retrieval
- the team wants a review-first source digest before item authoring or content authoring

This workflow is a shared upstream building block. It is not a runtime publisher.

## Shared Law

- AI proposes source drafts
- schema rails the draft shape
- human approves what moves downstream

Do not treat source drafts as final truth.

Do not publish source drafts directly into runtime files.

## Two Branches

### Assessment Source Draft Branch

Use when the target is:

- problem candidates
- exercises
- worked problems
- assessment prompts
- misconception-rich question sources

Main output:

- `assessment-source-draft.md`

Typical downstream path:

`assessment-source-draft.md`
-> `retrieved-problems.json`
-> `screened-problems.json`
-> `problem-pool.json`
-> `assessment-classification.json`
-> `mission-drafts.json`

### Content Source Draft Branch

Use when the target is:

- concept explanations
- lecture notes
- worked examples
- activity ideas
- checkpoint ideas
- interactive learning ideas

Main output:

- `content-source-draft.md`

Typical downstream path:

`content-source-draft.md`
-> `retrieved-content.json`
-> `screened-content.json`
-> `content-classification.json`
-> `content-drafts.json`

## Inputs

The minimum useful input is:

- topic or module target
- intended branch: `assessment` or `content`

Better inputs include:

- course id
- module id
- CLO target
- Bloom target
- source preference
- user-provided links, PDFs, notes, or candidate references

## Output Contract

Every source draft should include:

- topic target
- branch
- course/module target
- CLO candidates
- Bloom candidates
- source list with provenance
- extracted candidate material
- short rationale for why each item fits
- review note

## Source Modes

The workflow supports three practical modes:

1. `user-provided source mode`
   The user already has links, PDFs, notes, or source material.

2. `topic-guided Codex sourcing mode`
   The user provides the topic target and Codex proposes source material.

3. `hybrid mode`
   The user provides some source material, and Codex adds more to fill gaps.

Prefer `user-provided` or `hybrid` modes when good sources already exist.

## Draft Quality Rule

The source draft should not be a long essay.

It should be a structured Markdown digest that is easy to:

- review
- approve
- convert into source JSON
- map into `CLO + Bloom`

## Required Review Gate

Before a source draft moves downstream, a reviewer should confirm:

- the source is relevant
- the source is acceptable for educational use
- the CLO/Bloom direction is plausible
- the extracted items are worth keeping
- the draft is specific enough to support later authoring

## Promotion Rule

Approved topic source drafts may be converted into:

- `retrieved-problems.json`
- `retrieved-content.json`

They should not skip straight to:

- `missions/missions.json`
- `modules/*.md`
- built output

## Why This Block Exists

This workflow gives the repo a middle path between:

- fully manual source gathering
- fully automated retrieval that is still too noisy

It lets the team work from a guided topic target while keeping review-first control.
