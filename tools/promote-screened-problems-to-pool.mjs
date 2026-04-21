#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  getCoursePaths,
  resolveCourseDir,
  fileExists,
  readJson,
  writeJson,
  slugify,
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
      console.log('usage: node tools/promote-screened-problems-to-pool.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function inferExpectedAnswerForm(statement, problemType) {
  const lower = String(statement || '').toLowerCase();
  const type = String(problemType || '').toLowerCase();

  if (/\\begin\{enumerate\}|find:\s*\n|find:\s*\\begin\{enumerate\}/.test(String(statement || ''))) {
    return 'multi-part-mixed';
  }
  if (/(find all times|all points of discontinuity|break-even points)/.test(lower)) return 'set-of-values';
  if (/(when .* increasing|when .* decreasing|intervals where)/.test(lower)) return 'interval-description';
  if (/(equation of the tangent line)/.test(lower)) return 'equation';
  if (/(position function|cost function|revenue function)/.test(lower)) return 'function-form';
  if (/(maximum|minimum|maximize|minimize|greatest|least|dimensions|radius and height|value of x|price that maximizes)/.test(lower)) {
    return 'optimal-value';
  }
  if (/(how fast|rate of cooling|growth rate|instantaneous velocity|velocity at|acceleration at|marginal)/.test(lower)) {
    return 'rate-value';
  }
  if (type.includes('symbolic') || type.includes('computation')) return 'expression';
  return 'numeric-or-expression';
}

function inferSolutionRequired(usableFor) {
  return (Array.isArray(usableFor) ? usableFor : []).some((value) => ['quick-check', 'module-checkpoint', 'active-learning-task', 'sbra-exercise-bank', 'mission', 'sbra', 'active-learning'].includes(value));
}

function toPoolItem(item) {
  const statement = item.normalized_statement || item.retrieved_excerpt || item.source_title || '';
  const usableFor = ['mission'];
  const solutionRequired = inferSolutionRequired(usableFor);
  return {
    problem_id: item.problem_id || slugify(`${item.proposed_module_id || 'mixed'}-${statement}`).slice(0, 48) || `problem-${item.retrieval_id}`,
    module_id: item.proposed_module_id || 'mixed',
    clo_id: Array.isArray(item.proposed_clo_ids) && item.proposed_clo_ids.length > 0 ? item.proposed_clo_ids[0] : '',
    bloom_level: Array.isArray(item.proposed_bloom_levels) && item.proposed_bloom_levels.length > 0 ? item.proposed_bloom_levels[0] : '',
    problem_type: item.proposed_problem_type || 'reasoning',
    statement,
    target_skill: item.target_skill || `Use ${item.proposed_problem_type || 'reasoning'} to support ${item.proposed_module_id || 'the target module'}.`,
    misconception_tags: Array.isArray(item.misconception_tags) ? item.misconception_tags : [],
    usable_for: usableFor,
    difficulty: item.difficulty || 'medium',
    solution_status: 'not_started',
    solution_required: solutionRequired,
    expected_answer_form: inferExpectedAnswerForm(statement, item.proposed_problem_type),
    needs_solution_review: solutionRequired,
    source: item.provenance?.source_title || item.source_title || item.source_id || 'educational-source',
    notes: item.notes || 'Promoted from screened educational-source candidate after review.',
    review_status: 'pending',
    retrieval_id: item.retrieval_id,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const config = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const screenedPath = await findCourseArtifactPath(coursePaths, 'SCREENED_PROBLEMS');
  const poolPath = courseArtifactPath(coursePaths, 'PROBLEM_POOL_JSON');
  const screened = await readJson(screenedPath);
  const existingPool = await fileExists(poolPath)
    ? await readJson(poolPath)
    : {
        schema_version: '1.0.0',
        course_id: config.course_id,
        pool_status: 'starter',
        source_file: 'materials/processed/assessment/problem-pool.json',
        generated_at: new Date().toISOString(),
        items: [],
      };

  const approvedItems = (Array.isArray(screened.items) ? screened.items : [])
    .filter((item) => item.approval_status === 'approved');

  const byProblemId = new Map((Array.isArray(existingPool.items) ? existingPool.items : []).map((item) => [item.problem_id, item]));
  approvedItems.forEach((item) => {
    const poolItem = toPoolItem(item);
    for (const [problemId, existingItem] of byProblemId.entries()) {
      if (existingItem?.retrieval_id && existingItem.retrieval_id === item.retrieval_id) {
        byProblemId.delete(problemId);
      }
    }
    byProblemId.set(poolItem.problem_id, poolItem);
  });

  const promotedCount = approvedItems.length;
  await writeJson(poolPath, {
    ...existingPool,
    generated_at: new Date().toISOString(),
    items: Array.from(byProblemId.values()).sort((a, b) => a.problem_id.localeCompare(b.problem_id)),
  });

  console.log(`Promoted ${promotedCount} screened problem(s) into the pool for ${config.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), poolPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
