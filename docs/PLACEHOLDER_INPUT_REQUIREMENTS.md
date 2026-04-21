# Placeholder Input Requirements

This document answers a practical question:

`What input should exist if we want placeholders to become honest course pages without blind guessing?`

Use this document together with:

- [C:\Users\User\Documents\Cause_gen\docs\TQF3_PLACEHOLDER_MAPPING.md](/C:/Users/User/Documents/Cause_gen/docs/TQF3_PLACEHOLDER_MAPPING.md)
- [C:\Users\User\Documents\Cause_gen\docs\PROJECT_ARCHITECTURE.md](/C:/Users/User/Documents/Cause_gen/docs/PROJECT_ARCHITECTURE.md)

## Core Idea

Placeholders become much easier to fill when source information exists at three levels:

1. course level
2. module level
3. item level

When one of these layers is missing, Codex starts guessing more than it should.

## Minimum Input For One Course

The minimum useful source set is:

- course title and description
- CLOs with Bloom levels
- module sequence or week-to-module map
- assessment direction
- active-learning direction
- SBRA role in the course

With this set, the repo can usually support the first honest output.

## Page-Level Input Needs

### `index`

Useful inputs:

- learner-facing course positioning
- recommended first step
- module overview
- available missions, resources, and other course features

### `intro`

Useful inputs:

- non-threatening learner-facing welcome message
- what students should expect from the course
- how the course is meant to be learned
- the best first action

### `lessons`

Useful inputs:

- real module count
- module order
- short summary per module
- CLO connection for each module

### `module page`

Useful inputs:

- key concepts
- definitions or theorems
- examples and counterexamples
- likely misconceptions
- active-learning direction
- checkpoints or quick checks

### `missions`

Useful inputs:

- which CLOs are targeted
- which module the mission belongs to
- mission family or assessment role
- starter problem statements
- misconception direction

## Module-Level Input

For one module, the most useful inputs are:

- `module_id`
- module title
- summary
- related CLOs
- main subtopics
- essential definitions
- essential theorems or methods
- strong examples
- strong error patterns
- active-learning ideas
- starter problem pool entries

## Item-Level Input

If the repo wants to fill missions or SBRA well, item-level input needs more than raw questions.

For each problem, the useful fields are:

- `problem_id`
- statement
- module
- CLO
- Bloom
- problem type
- target skill
- likely misconception tags
- difficulty
- usable downstream targets such as `active-learning`, `quick-check`, `mission`, or `sbra`

## Problem Pool Shape

The most practical starter shape is a table or JSON object with fields like:

- `problem_id`
- `module_id`
- `clo_id`
- `bloom_level`
- `problem_type`
- `statement`
- `target_skill`
- `misconception_tags`
- `difficulty`
- `usable_for`
- `source`
- `notes`

This is enough for later movement into:

- `problem-pool.json`
- `assessment-classification.json`
- `mission-drafts.json`

## SBRA-Ready Additions

If an item is already close to SBRA use, add:

- expected process direction
- expected reasoning direction
- common wrong process paths
- common wrong reasoning paths
- hint direction
- short solution path

## Suggested File Split

To keep the repo workable, it is useful to split information into:

- course design brief
- module authoring map
- problem pool
- SBRA design log

## Priority Order

If source must be created gradually, the best order is:

1. course framing
2. module framing
3. assessment evidence
4. starter problem pool
5. SBRA-ready item detail

## Short Summary

If we want placeholders to become stable course output, we should first secure:

- course framing
- module framing
- assessment direction
- starter item pool

Without these layers, placeholders may still render, but they will not stay trustworthy for real-course use.
