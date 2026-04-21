#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  fileExists,
  getCoursePaths,
  readJson,
  resolveCourseDir,
  writeJson,
} from './lib/course-lib.mjs';

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
      console.log('usage: node tools/promote-latex-intake-classification-to-pool.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function inferDifficulty(bloomLevel, multiStep, problemType) {
  const bloom = String(bloomLevel || '').toLowerCase();
  const type = String(problemType || '').toLowerCase();
  if (multiStep || ['analyze', 'evaluate', 'create'].includes(bloom)) return 'medium';
  if (['optimization', 'related-rates', 'motion-analysis', 'applied-modeling', 'model-analysis', 'applied-integral'].includes(type)) {
    return 'medium';
  }
  return 'easy';
}

function inferSolutionRequired(usableFor) {
  return (Array.isArray(usableFor) ? usableFor : []).some((value) => [
    'quick-check',
    'module-checkpoint',
    'active-learning-task',
    'sbra-exercise-bank',
    'mission',
    'sbra',
    'active-learning',
  ].includes(value));
}

function toPoolItem(classification) {
  const proposal = classification.proposed || {};
  const usableFor = Array.isArray(proposal.suitable_for) ? proposal.suitable_for.filter(Boolean) : [];
  const solutionRequired = inferSolutionRequired(usableFor);

  return {
    problem_id: classification.problem_id,
    module_id: proposal.module_id || 'mixed',
    clo_id: proposal.clo_id || '',
    bloom_level: proposal.bloom_level || '',
    problem_type: proposal.problem_type || 'reasoning',
    statement: classification.statement || '',
    target_skill: proposal.target_skill || '',
    misconception_tags: Array.isArray(proposal.misconception_tags) ? proposal.misconception_tags : [],
    usable_for: usableFor,
    sbra_profile: proposal.sbra_profile || {
      candidate_strength: 'medium',
      evidence_role: 'support-clo-evidence',
      recommended_step_count: 3,
      pattern_tags: [],
      distractor_focus: [],
    },
    difficulty: inferDifficulty(proposal.bloom_level, proposal.is_multi_step, proposal.problem_type),
    solution_status: 'not_started',
    solution_required: solutionRequired,
    expected_answer_form: proposal.answer_type || 'numeric-or-expression',
    needs_solution_review: solutionRequired,
    source: classification.source_title || classification.source_intake_file || 'latex-problem-intake',
    notes: [
      `Promoted from ${classification.source_intake_file || 'latex intake classification'}.`,
      classification.review_notes || 'Human review still required before deeper downstream use.',
    ].filter(Boolean).join(' '),
    review_status: 'pending',
    source_intake_file: classification.source_intake_file || '',
    intake_part_label: classification.part_label || '',
    raw_label: classification.raw_label || '',
  };
}

function preserveExistingState(existingItem, freshItem) {
  if (!existingItem || typeof existingItem !== 'object') return freshItem;
  return {
    ...freshItem,
    target_skill: existingItem.target_skill || freshItem.target_skill,
    misconception_tags: Array.isArray(existingItem.misconception_tags) && existingItem.misconception_tags.length > 0
      ? existingItem.misconception_tags
      : freshItem.misconception_tags,
    usable_for: Array.isArray(existingItem.usable_for) && existingItem.usable_for.length > 0
      ? existingItem.usable_for
      : freshItem.usable_for,
    // Prefer the fresh upstream SBRA tagging so heuristics can evolve without
    // stale pool metadata freezing older, less-sharp labels.
    sbra_profile: freshItem.sbra_profile,
    difficulty: existingItem.difficulty || freshItem.difficulty,
    solution_status: existingItem.solution_status ?? freshItem.solution_status,
    solution_required: typeof existingItem.solution_required === 'boolean'
      ? existingItem.solution_required
      : freshItem.solution_required,
    expected_answer_form: existingItem.expected_answer_form || freshItem.expected_answer_form,
    needs_solution_review: typeof existingItem.needs_solution_review === 'boolean'
      ? existingItem.needs_solution_review
      : freshItem.needs_solution_review,
    notes: existingItem.notes || freshItem.notes,
    review_status: existingItem.review_status || freshItem.review_status,
    retrieval_id: existingItem.retrieval_id,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const courseConfig = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const classificationPath = await findCourseArtifactPath(coursePaths, 'LATEX_PROBLEM_INTAKE_CLASSIFICATION');
  const poolPath = courseArtifactPath(coursePaths, 'PROBLEM_POOL_JSON');
  const classificationPayload = await readJson(classificationPath);
  const existingPool = await fileExists(poolPath)
    ? await readJson(poolPath)
    : {
        schema_version: '1.0.0',
        course_id: courseConfig.course_id,
        pool_status: 'starter',
        source_file: 'materials/processed/assessment/problem-pool.json',
        generated_at: new Date().toISOString(),
        items: [],
      };

  if (!Array.isArray(classificationPayload.classifications)) {
    throw new Error('latex-problem-intake-classification.json must contain a classifications array');
  }

  const byProblemId = new Map(
    (Array.isArray(existingPool.items) ? existingPool.items : []).map((item) => [item.problem_id, item]),
  );

  for (const classification of classificationPayload.classifications) {
    if (!classification.problem_id || !classification.statement) continue;
    const freshItem = toPoolItem(classification);
    const existingItem = byProblemId.get(freshItem.problem_id);
    byProblemId.set(freshItem.problem_id, preserveExistingState(existingItem, freshItem));
  }

  const items = Array.from(byProblemId.values()).sort((a, b) => a.problem_id.localeCompare(b.problem_id));

  await writeJson(poolPath, {
    ...existingPool,
    schema_version: '1.0.0',
    course_id: courseConfig.course_id,
    pool_status: existingPool.pool_status || 'starter',
    source_file: existingPool.source_file || 'materials/processed/assessment/problem-pool.json',
    generated_at: new Date().toISOString(),
    items,
  });

  console.log(`Promoted ${classificationPayload.classifications.length} classified LaTeX intake item(s) into the pool for ${courseConfig.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), poolPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
