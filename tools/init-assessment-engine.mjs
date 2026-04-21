#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  getCoursePaths,
  resolveCourseDir,
  fileExists,
  readText,
  writeJson,
  readJson,
  slugify,
} from './lib/course-lib.mjs';

function parseArgs(argv) {
  const options = {
    courseDir: null,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/init-assessment-engine.mjs --course-dir courses/<course-id> [--force]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function normalizeHeader(header) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitCsvLike(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeModuleId(rawValue, validModuleIds) {
  const value = String(rawValue || '').trim();
  if (!value) return '';
  if (validModuleIds.has(value)) return value;
  const withoutPrefix = value.replace(/^\d{1,2}-/, '');
  if (validModuleIds.has(withoutPrefix)) return withoutPrefix;
  return value;
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
  if (/(position function|cost function|revenue function|find l\(t\)|find c\(x\)|find r\(x\))/i.test(String(statement || ''))) {
    return 'function-form';
  }
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
  const uses = splitCsvLike(Array.isArray(usableFor) ? usableFor.join(',') : usableFor);
  return uses.some((value) => ['quick-check', 'module-checkpoint', 'active-learning-task', 'sbra-exercise-bank', 'mission', 'sbra', 'active-learning'].includes(value));
}

function normalizeProblemItem(item, validModuleIds) {
  const usableFor = Array.isArray(item.usable_for) ? item.usable_for.filter(Boolean) : splitCsvLike(item.usable_for);
  const solutionRequired = typeof item.solution_required === 'boolean'
    ? item.solution_required
    : inferSolutionRequired(usableFor);
  const solutionStatus = item.solution_status || 'not_started';

  return {
    ...item,
    module_id: normalizeModuleId(item.module_id || '', validModuleIds),
    misconception_tags: Array.isArray(item.misconception_tags) ? item.misconception_tags.filter(Boolean) : splitCsvLike(item.misconception_tags),
    usable_for: usableFor,
    solution_status: solutionStatus,
    solution_required: solutionRequired,
    expected_answer_form: item.expected_answer_form || inferExpectedAnswerForm(item.statement, item.problem_type),
    needs_solution_review: typeof item.needs_solution_review === 'boolean'
      ? item.needs_solution_review
      : (solutionRequired && solutionStatus !== 'reviewed'),
  };
}

function parseOptionalBoolean(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
}

function parseMarkdownTable(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let start = -1;

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (lines[index].includes('|') && /^\s*\|?\s*[-:]+/.test(lines[index + 1])) {
      start = index;
      break;
    }
  }

  if (start === -1) return [];

  const tableLines = [];
  for (let index = start; index < lines.length; index += 1) {
    if (!lines[index].includes('|')) break;
    tableLines.push(lines[index]);
  }

  if (tableLines.length < 2) return [];

  const headers = tableLines[0]
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean)
    .map(normalizeHeader);

  return tableLines.slice(2).map((line) => {
    const cells = line.split('|').map((cell) => cell.trim());
    const values = cells[0] === '' ? cells.slice(1, -1) : cells;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  }).filter((row) => Object.values(row).some(Boolean));
}

function toProblemItem(row, index, validModuleIds) {
  const statement = row.statement || row.prompt || row.question || '';
  const problemId = row['problem-id'] || row.problemid || slugify(statement).slice(0, 48) || `problem-${index + 1}`;
  return normalizeProblemItem({
    problem_id: problemId,
    module_id: normalizeModuleId(row.module || row['module-id'] || '', validModuleIds),
    clo_id: row.clo || row['clo-id'] || '',
    bloom_level: row.bloom || row['bloom-level'] || '',
    problem_type: row['problem-type'] || '',
    statement,
    target_skill: row['target-skill'] || '',
    misconception_tags: splitCsvLike(row['misconception-tags']),
    usable_for: splitCsvLike(row['usable-for']),
    difficulty: row.difficulty || '',
    solution_status: row['solution-status'] || 'not_started',
    solution_required: parseOptionalBoolean(row['solution-required']),
    expected_answer_form: row['expected-answer-form'] || '',
    needs_solution_review: parseOptionalBoolean(row['needs-solution-review']),
    source: row.source || '',
    notes: row.notes || '',
    review_status: 'pending',
  }, validModuleIds);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const courseConfig = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const validModuleIds = new Set((courseConfig.modules || []).map((module) => module.id));
  const starterPath = await findCourseArtifactPath(coursePaths, 'PROBLEM_POOL_STARTER');
  const poolPath = courseArtifactPath(coursePaths, 'PROBLEM_POOL_JSON');
  const solutionDraftsPath = courseArtifactPath(coursePaths, 'SOLUTION_DRAFTS');
  const classificationPath = courseArtifactPath(coursePaths, 'ASSESSMENT_CLASSIFICATION');
  const draftsPath = courseArtifactPath(coursePaths, 'MISSION_DRAFTS');

  const starterExists = await fileExists(starterPath);
  const existingPool = await fileExists(poolPath) ? await readJson(poolPath) : null;
  let items = Array.isArray(existingPool?.items)
    ? existingPool.items.map((item) => normalizeProblemItem(item, validModuleIds))
    : [];

  if (starterExists) {
    const starterSource = await readText(starterPath);
    const rows = parseMarkdownTable(starterSource);
    if (rows.length > 0) {
      items = rows.map((row, index) => toProblemItem(row, index, validModuleIds));
    }
  }

  if (!(await fileExists(poolPath)) || options.force) {
    await writeJson(poolPath, {
      schema_version: '1.0.0',
      course_id: courseConfig.course_id,
      pool_status: existingPool?.pool_status || 'starter',
      source_file: 'materials/processed/assessment/problem-pool-starter.md',
      generated_at: new Date().toISOString(),
      items,
    });
  } else if (existingPool && JSON.stringify(existingPool.items) !== JSON.stringify(items)) {
    await writeJson(poolPath, {
      ...existingPool,
      generated_at: new Date().toISOString(),
      items,
    });
  }

  if (!(await fileExists(classificationPath)) || options.force) {
    await writeJson(classificationPath, {
      schema_version: '1.0.0',
      course_id: courseConfig.course_id,
      source_problem_pool: 'materials/processed/assessment/problem-pool.json',
      generated_at: new Date().toISOString(),
      classifications: [],
    });
  }

  if (!(await fileExists(solutionDraftsPath)) || options.force) {
    await writeJson(solutionDraftsPath, {
      schema_version: '1.0.0',
      course_id: courseConfig.course_id,
      source_problem_pool: 'materials/processed/assessment/problem-pool.json',
      generated_at: new Date().toISOString(),
      drafts: [],
    });
  }

  if (!(await fileExists(draftsPath)) || options.force) {
    await writeJson(draftsPath, {
      schema_version: '1.0.0',
      course_id: courseConfig.course_id,
      source_classification: 'generated/assessment-classification.json',
      generated_at: new Date().toISOString(),
      drafts: [],
    });
  }

  console.log(`Initialized assessment engine for ${courseConfig.course_id}`);
  console.log(`- problem pool: ${path.relative(process.cwd(), poolPath)}`);
  console.log(`- classifications: ${path.relative(process.cwd(), classificationPath)}`);
  console.log(`- solution drafts: ${path.relative(process.cwd(), solutionDraftsPath)}`);
  console.log(`- mission drafts: ${path.relative(process.cwd(), draftsPath)}`);
  console.log(`- items imported: ${items.length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
