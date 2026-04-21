#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  fileExists,
  getCoursePaths,
  resolveCourseDir,
  readJson,
  writeJson,
  slugify,
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
      console.log('usage: node tools/build-mission-drafts.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function blueprintFor(shape) {
  if (shape === 'claim-evidence-repair') {
    return [
      'Locate the claim that needs mathematical support.',
      'Choose the mathematical evidence or condition that matters.',
      'Repair the claim so it becomes defensible.',
      'Reflect on why the repaired version is stronger.',
    ];
  }
  if (shape === 'sort-and-justify') {
    return [
      'Inspect the mathematical signals in each option.',
      'Sort or classify the options using a defensible rule.',
      'Justify the rule with mathematical reasoning.',
      'Reflect on the most tempting wrong classification.',
    ];
  }
  if (shape === 'reflect-and-prioritize') {
    return [
      'Read the situation carefully and identify the most important signal.',
      'Choose the best priority or response.',
      'Explain why the choice matters most.',
      'Reflect on one plausible but weaker alternative.',
    ];
  }
  if (shape === 'diagnose-and-justify') {
    return [
      'Detect the key mathematical issue in the prompt.',
      'Choose the best diagnosis or direction.',
      'Justify the diagnosis with mathematical reasoning.',
      'Reflect on the most tempting incorrect diagnosis.',
    ];
  }
  return [
    'Read the prompt and identify the mathematical target.',
    'Choose a defensible process.',
    'Justify the process with mathematical reasoning.',
    'Reflect before you submit.',
  ];
}

function buildDraft(item, classification) {
  const proposal = classification.proposed;
  const familyLabel = proposal.mission_family.replaceAll('-', ' ');
  const titleSeed = item.target_skill || item.problem_type || item.problem_id;
  const title = titleSeed.charAt(0).toUpperCase() + titleSeed.slice(1);
  const shape = proposal.sbra_shape || 'choose-and-justify';
  const steps = blueprintFor(shape).map((intent, index) => ({
    step_id: `step-${index + 1}`,
    intent,
  }));

  return {
    draft_id: `draft-${slugify(item.problem_id)}`,
    problem_id: item.problem_id,
    module_id: proposal.module_id,
    clo_id: proposal.clo_id,
    bloom_level: proposal.bloom_level,
    mission_family: proposal.mission_family,
    runtime_ready: false,
    ...reviewFields('missions/missions.json'),
    title,
    prompt: item.statement,
    strategy_prompt: `Use a ${familyLabel} approach and explain the mathematical reason behind your choice before you submit.`,
    misconception_tags: Array.isArray(proposal.misconception_tags) ? proposal.misconception_tags : [],
    sbra_blueprint: {
      shape,
      steps,
    },
    review_status: 'pending',
    source_refs: {
      problem_pool_item: item.problem_id,
      classification: classification.problem_id,
    },
  };
}

function indexItemsById(problemPool) {
  return new Map(problemPool.items.map((item) => [item.problem_id, item]));
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
  const classification = await readJson(await findCourseArtifactPath(coursePaths, 'ASSESSMENT_CLASSIFICATION'));
  const outputPath = courseArtifactPath(coursePaths, 'MISSION_DRAFTS');
  const existingPayload = await fileExists(outputPath) ? await readJson(outputPath) : null;
  const existingMap = new Map(
    Array.isArray(existingPayload?.drafts)
      ? existingPayload.drafts.map((draft) => [draft.draft_id, draft])
      : [],
  );

  if (!Array.isArray(pool.items)) {
    throw new Error('problem-pool.json must contain an items array');
  }
  if (!Array.isArray(classification.classifications)) {
    throw new Error('assessment-classification.json must contain a classifications array');
  }

  const itemMap = indexItemsById(pool);
  const drafts = classification.classifications.map((entry) => {
    const item = itemMap.get(entry.problem_id);
    if (!item) {
      throw new Error(`Missing problem pool item for classification: ${entry.problem_id}`);
    }
    const freshDraft = buildDraft(item, entry);
    return preserveReviewState(freshDraft, existingMap.get(freshDraft.draft_id));
  });

  await writeJson(outputPath, {
    schema_version: '1.0.0',
    course_id: courseConfig.course_id,
    source_classification: 'generated/assessment-classification.json',
    generated_at: new Date().toISOString(),
    drafts,
  });

  console.log(`Built ${drafts.length} mission draft(s) for ${courseConfig.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
