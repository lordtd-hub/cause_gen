#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  getCoursePaths,
  resolveCourseDir,
  readJson,
  writeJson,
  fileExists,
} from './lib/course-lib.mjs';
import {
  buildSourceMap,
  dedupeGroup,
  screeningFields,
} from './lib/shared-sourcing.mjs';

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
      console.log('usage: node tools/screen-retrieved-problems.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function inferProblemType(item) {
  const text = `${item.source_title || ''} ${item.retrieved_excerpt || ''}`.toLowerCase();
  if (/proof|justify|show that/.test(text)) return 'proof-repair';
  if (/classify|sort|match/.test(text)) return 'classification';
  if (/reflect|discuss|explain why/.test(text)) return 'reflection';
  if (/diagnose|determine whether|decide whether/.test(text)) return 'diagnosis';
  return 'reasoning';
}

function inferMissionFamily(problemType) {
  if (problemType === 'proof-repair') return 'proof-reasoning';
  if (problemType === 'classification') return 'quick-check';
  if (problemType === 'reflection') return 'reflection';
  if (problemType === 'diagnosis') return 'diagnose-and-justify';
  return 'sbra-step-reasoning';
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const config = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const policy = await readJson(await findCourseArtifactPath(coursePaths, 'PROBLEM_SOURCE_POLICY'));
  const queries = await readJson(await findCourseArtifactPath(coursePaths, 'RETRIEVAL_QUERIES'));
  const retrieved = await readJson(await findCourseArtifactPath(coursePaths, 'RETRIEVED_PROBLEMS'));
  const outputPath = courseArtifactPath(coursePaths, 'SCREENED_PROBLEMS');
  const existingOutput = await fileExists(outputPath) ? await readJson(outputPath) : null;

  const sourceMap = buildSourceMap(policy.sources, 'source_id');
  const queryMap = buildSourceMap(queries.queries, 'query_id');
  const existingMap = buildSourceMap(existingOutput?.items, 'retrieval_id');
  const items = Array.isArray(retrieved.items) ? retrieved.items : [];

  const screenedItems = items.map((item) => {
    const source = sourceMap.get(item.source_id);
    const query = queryMap.get(item.query_id);
    const previous = existingMap.get(item.retrieval_id);
    const recommendedUseMode = source?.default_use_mode || 'manual-review-first';
    const problemType = inferProblemType(item);
    const freshScreeningFields = screeningFields(source, query, 'materials/processed/assessment/problem-pool.json');
    const preservedProvenance = previous?.provenance ?? freshScreeningFields.provenance;

    return {
      retrieval_id: item.retrieval_id,
      dedupe_group: dedupeGroup(item.source_title || '', item.retrieved_excerpt || '') || `dedupe-${item.retrieval_id}`,
      proposed_module_id: item.candidate_module_id || query?.module_id || 'mixed',
      proposed_clo_ids: Array.isArray(item.candidate_clo_ids) && item.candidate_clo_ids.length > 0
        ? item.candidate_clo_ids
        : (Array.isArray(query?.target_clo_ids) ? query.target_clo_ids : []),
      proposed_bloom_levels: Array.isArray(item.candidate_bloom_levels) && item.candidate_bloom_levels.length > 0
        ? item.candidate_bloom_levels
        : (Array.isArray(query?.target_bloom_levels) ? query.target_bloom_levels : []),
      proposed_problem_type: problemType,
      proposed_mission_family: inferMissionFamily(problemType),
      retrieved_excerpt: item.retrieved_excerpt || '',
      normalized_statement: item.normalized_statement || item.retrieved_excerpt || '',
      source_id: item.source_id || source?.source_id || null,
      source_title: item.source_title || source?.label || '',
      source_url: item.source_url || source?.homepage_url || '',
      query_id: item.query_id || query?.query_id || null,
      license_note: item.license_note || source?.license_note || '',
      ...(previous ? {
        needs_human_review: previous.needs_human_review ?? true,
        approval_status: previous.approval_status ?? 'pending',
        reviewed_by: previous.reviewed_by ?? null,
        reviewed_at: previous.reviewed_at ?? null,
        approved_target_destination: previous.approved_target_destination ?? 'materials/processed/assessment/problem-pool.json',
        screening_status: previous.screening_status ?? 'proposed',
        recommended_use_mode: previous.recommended_use_mode ?? recommendedUseMode,
        provenance: preservedProvenance,
      } : freshScreeningFields),
      recommended_use_mode: previous?.recommended_use_mode ?? recommendedUseMode,
      notes: source
        ? `Educational use policy matched source ${source.source_id}. Human review still required before pool ingestion.`
        : 'Source policy not found. Manual review is required before any downstream use.',
    };
  });

  await writeJson(outputPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    generated_at: new Date().toISOString(),
    items: screenedItems,
  });

  console.log(`Screened ${screenedItems.length} retrieved problem(s) for ${config.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
