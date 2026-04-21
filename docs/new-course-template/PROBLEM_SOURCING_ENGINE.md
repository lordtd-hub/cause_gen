# Problem Sourcing Engine

This document defines the shared upstream engine for collecting candidate problems from educational sources.

## Purpose

The problem sourcing engine exists because a course often needs many more candidate problems than one instructor can manually author at the start.

It supports:

- CLO coverage
- randomized delivery later
- a wider misconception range
- a stronger starting pool before item-level authoring

## Design Law

- AI is the proposer
- schema is the rail
- human is the approver

The sourcing engine should not publish runtime missions directly.

It should feed safer intermediate layers first.

## Core Outputs

- `generated/sourcing/problem-source-policy.json`
- `generated/sourcing/retrieval-queries.json`
- `generated/sourcing/retrieved-problems.json`
- `generated/sourcing/screened-problems.json`

## Educational Use Rule

This repo is used for educational and non-commercial student support.

Even so, every retrieved candidate must still record:

- source URL
- source title
- license note
- attribution requirement
- recommended use mode

## Recommended Source Tiers

Preferred starter sources:

- WeBWorK Open Problem Library
- OpenStax
- MIT OpenCourseWare
- Project Euler
- CS Unplugged

Review-first sources:

- LibreTexts

## Intended Flow

1. initialize the sourcing engine
2. review the educational source policy
3. review retrieval queries
4. prefer `document-first` retrieval, especially PDF notes, problem sheets, or handouts
5. let AI or a human gather candidate problems into `retrieved-problems.json`
6. run the screening step
7. review screened candidates
8. move only accepted candidates into later item-authoring layers

## Anti-Loop Rule

Do not turn this into a fully autonomous crawler before the semi-automatic flow is stable.

First prove:

- the source policy is safe enough
- retrieval queries are useful enough
- screened candidates actually help the later problem pool

