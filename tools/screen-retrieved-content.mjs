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
      console.log('usage: node tools/screen-retrieved-content.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function inferContentKind(item) {
  const text = `${item.source_title || ''} ${item.content_excerpt || ''} ${item.content_summary || ''}`.toLowerCase();
  if (/interactive|simulation|manipulative|widget/.test(text)) return 'interactive';
  if (/worksheet|activity|exercise|task/.test(text)) return 'activity';
  if (/example|worked example|case/.test(text)) return 'worked-example';
  if (/slide|note|reading|lecture|chapter/.test(text)) return 'reading';
  return 'concept-explainer';
}

function inferAssetFamily(kind, item) {
  const text = `${item.content_summary || ''} ${item.content_excerpt || ''}`.toLowerCase();
  if (kind === 'interactive') return 'interactive-activity';
  if (/reflect|checkpoint|self-check/.test(text)) return 'checkpoint-seed';
  if (kind === 'activity') return 'active-learning-seed';
  return 'module-content-block';
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const config = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const policy = await readJson(await findCourseArtifactPath(coursePaths, 'CONTENT_SOURCE_POLICY'));
  const queries = await readJson(await findCourseArtifactPath(coursePaths, 'CONTENT_RETRIEVAL_QUERIES'));
  const retrieved = await readJson(await findCourseArtifactPath(coursePaths, 'RETRIEVED_CONTENT'));
  const outputPath = courseArtifactPath(coursePaths, 'SCREENED_CONTENT');
  const existingOutput = await fileExists(outputPath) ? await readJson(outputPath) : null;

  const sourceMap = buildSourceMap(policy.sources, 'source_id');
  const queryMap = buildSourceMap(queries.queries, 'query_id');
  const existingMap = buildSourceMap(existingOutput?.items, 'retrieval_id');
  const items = Array.isArray(retrieved.items) ? retrieved.items : [];

  const screenedItems = items.map((item) => {
    const source = sourceMap.get(item.source_id);
    const query = queryMap.get(item.query_id);
    const previous = existingMap.get(item.retrieval_id);
    const contentKind = inferContentKind(item);
    const assetFamily = inferAssetFamily(contentKind, item);
    const freshScreeningFields = screeningFields(source, query, 'generated/content/content-classification.json');
    const recommendedUseMode = source?.default_use_mode || 'manual-review-first';
    const preservedProvenance = previous?.provenance ?? freshScreeningFields.provenance;

    return {
      retrieval_id: item.retrieval_id,
      content_id: item.content_id || `content-${item.retrieval_id}`,
      dedupe_group: dedupeGroup(item.source_title || '', item.content_excerpt || '', item.content_summary || '') || `content-${item.retrieval_id}`,
      proposed_module_id: item.candidate_module_id || query?.module_id || 'mixed',
      proposed_clo_ids: Array.isArray(item.candidate_clo_ids) && item.candidate_clo_ids.length > 0
        ? item.candidate_clo_ids
        : (Array.isArray(query?.target_clo_ids) ? query.target_clo_ids : []),
      proposed_bloom_levels: Array.isArray(item.candidate_bloom_levels) && item.candidate_bloom_levels.length > 0
        ? item.candidate_bloom_levels
        : (Array.isArray(query?.target_bloom_levels) ? query.target_bloom_levels : []),
      proposed_content_kind: contentKind,
      proposed_asset_family: assetFamily,
      title: item.content_title || item.source_title || `Content candidate ${item.retrieval_id}`,
      summary: item.content_summary || item.content_excerpt || '',
      excerpt: item.content_excerpt || '',
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
        approved_target_destination: previous.approved_target_destination ?? 'generated/content/content-classification.json',
        screening_status: previous.screening_status ?? 'proposed',
        recommended_use_mode: previous.recommended_use_mode ?? recommendedUseMode,
        provenance: preservedProvenance,
      } : freshScreeningFields),
      recommended_use_mode: previous?.recommended_use_mode ?? recommendedUseMode,
      notes: source
        ? `Educational use policy matched source ${source.source_id}. Human review is still required before promotion into content drafts.`
        : 'Source policy not found. Manual review is required before any downstream use.',
    };
  });

  await writeJson(outputPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    generated_at: new Date().toISOString(),
    items: screenedItems,
  });

  console.log(`Screened ${screenedItems.length} retrieved content item(s) for ${config.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
