#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  fileExists,
  getCoursePaths,
  readJson,
  resolveCourseDir,
  slugify,
  writeJson,
} from './lib/course-lib.mjs';
import { reviewFields } from './lib/shared-sourcing.mjs';

function parseArgs(argv) {
  const options = {
    courseDir: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/build-sbra-item-drafts.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function toChoiceRow(type, prompt, options, prefix) {
  const choices = options.map((option, index) => ({
    choice_id: `${prefix}-${index + 1}`,
    text: option.text,
    is_correct: option.correct,
    feedback: option.feedback,
  }));
  const correctChoice = choices.find((choice) => choice.is_correct);
  return {
    row_type: type,
    prompt,
    choices,
    correct_choice_id: correctChoice?.choice_id || null,
  };
}

function buildStepRows(step, stepIndex) {
  return {
    step_id: step.step_id || `step-${stepIndex + 1}`,
    title: step.title || `Step ${stepIndex + 1}`,
    prompt: step.prompt || `Step ${stepIndex + 1}`,
    step_choice_row: toChoiceRow(
      'step-choice',
      step.process_prompt || 'Choose the best step.',
      Array.isArray(step.process_options) ? step.process_options : [],
      `step-${stepIndex + 1}-choice`,
    ),
    reason_choice_row: toChoiceRow(
      'reason-choice',
      step.reasoning_prompt || 'Choose the best reason.',
      Array.isArray(step.reasoning_options) ? step.reasoning_options : [],
      `step-${stepIndex + 1}-reason`,
    ),
  };
}

function buildDraft(problem, solutionDraft) {
  const sbraProfile = solutionDraft?.downstream_profiles?.sbra_exercise_bank;
  const steps = Array.isArray(sbraProfile?.steps)
    ? sbraProfile.steps.map((step, index) => buildStepRows(step, index))
    : [];

  return {
    draft_id: `sbra-${slugify(problem.problem_id)}`,
    problem_id: problem.problem_id,
    module_id: problem.module_id || 'mixed',
    clo_id: problem.clo_id || '',
    bloom_level: problem.bloom_level || '',
    mastery_role: 'clo-evidence',
    runtime_ready: false,
    ...reviewFields('generated/assessment/mission-drafts.json'),
    review_status: 'pending',
    item_prompt: problem.statement,
    learner_task: 'For each step, choose the best thing to write or do, then choose the best reason for that step.',
    expected_answer: solutionDraft.expected_answer ?? null,
    full_solution_latex: solutionDraft.full_solution_latex ?? null,
    steps,
    source_refs: {
      problem_pool_item: problem.problem_id,
      solution_draft: solutionDraft.draft_id,
      transformation: 'solution-draft-to-sbra-item',
    },
  };
}

function preserveReviewState(freshDraft, existingDraft) {
  if (!existingDraft || typeof existingDraft !== 'object') return freshDraft;
  return {
    ...freshDraft,
    runtime_ready: existingDraft.runtime_ready ?? freshDraft.runtime_ready,
    approval_status: existingDraft.approval_status ?? freshDraft.approval_status,
    reviewed_by: existingDraft.reviewed_by ?? freshDraft.reviewed_by,
    reviewed_at: existingDraft.reviewed_at ?? freshDraft.reviewed_at,
    approved_target_destination: existingDraft.approved_target_destination ?? freshDraft.approved_target_destination,
    review_status: existingDraft.review_status ?? freshDraft.review_status,
    source_refs: {
      ...(freshDraft.source_refs || {}),
      ...(existingDraft.source_refs || {}),
    },
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const courseConfig = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const pool = await readJson(await findCourseArtifactPath(coursePaths, 'PROBLEM_POOL_JSON'));
  const solutionDrafts = await readJson(await findCourseArtifactPath(coursePaths, 'SOLUTION_DRAFTS'));
  const outputPath = courseArtifactPath(coursePaths, 'SBRA_ITEM_DRAFTS');
  const existingPayload = await fileExists(outputPath) ? await readJson(outputPath) : null;
  const existingMap = new Map(
    Array.isArray(existingPayload?.drafts)
      ? existingPayload.drafts.map((draft) => [draft.draft_id, draft])
      : [],
  );

  const problemMap = new Map(
    Array.isArray(pool.items)
      ? pool.items.map((item) => [item.problem_id, item])
      : [],
  );

  const sbraSolutionDrafts = Array.isArray(solutionDrafts?.drafts)
    ? solutionDrafts.drafts.filter((draft) => draft?.downstream_profiles?.sbra_exercise_bank)
    : [];

  const drafts = sbraSolutionDrafts.map((solutionDraft) => {
    const problem = problemMap.get(solutionDraft.problem_id);
    if (!problem) {
      throw new Error(`Missing problem pool item for SBRA transform: ${solutionDraft.problem_id}`);
    }
    const freshDraft = buildDraft(problem, solutionDraft);
    return preserveReviewState(freshDraft, existingMap.get(freshDraft.draft_id));
  });

  await writeJson(outputPath, {
    schema_version: '1.0.0',
    course_id: courseConfig.course_id,
    source_solution_drafts: 'generated/assessment/solution-drafts.json',
    generated_at: new Date().toISOString(),
    drafts,
  });

  console.log(`Built ${drafts.length} SBRA item draft(s) for ${courseConfig.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
