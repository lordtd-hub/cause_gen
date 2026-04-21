#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  getCoursePaths,
  resolveCourseDir,
  readJson,
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
      console.log('usage: node tools/classify-content-sources.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function inferTargetSection(item) {
  if (item.proposed_asset_family === 'checkpoint-seed') return 'module-checkpoints';
  if (item.proposed_asset_family === 'active-learning-seed') return 'module-active-learning';
  return 'module-core-content';
}

function inferWidgetType(item) {
  const text = `${item.summary || ''} ${item.excerpt || ''}`.toLowerCase();
  if (item.proposed_asset_family === 'checkpoint-seed') return 'quick-check';
  if (/sequence|step by step|workflow/.test(text)) return 'step-sequence';
  if (/compare|classify|diagnose/.test(text)) return 'quick-check';
  if (item.proposed_content_kind === 'interactive') return 'quick-check';
  return null;
}

function normalizeModuleId(rawValue, validModuleIds) {
  const value = String(rawValue || '').trim();
  if (!value) return 'mixed';
  if (validModuleIds.has(value)) return value;
  const withoutPrefix = value.replace(/^\d{1,2}-/, '');
  if (validModuleIds.has(withoutPrefix)) return withoutPrefix;
  return value;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const config = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const validModuleIds = new Set((config.modules || []).map((module) => module.id));
  const screened = await readJson(await findCourseArtifactPath(coursePaths, 'SCREENED_CONTENT'));
  const outputPath = courseArtifactPath(coursePaths, 'CONTENT_CLASSIFICATION');

  const items = Array.isArray(screened.items) ? screened.items : [];
  const classifications = items.map((item) => ({
    content_id: item.content_id,
    classification_status: 'proposed',
    ...reviewFields('generated/content/content-drafts.json'),
    proposed: {
      module_id: normalizeModuleId(item.proposed_module_id || 'mixed', validModuleIds),
      clo_ids: Array.isArray(item.proposed_clo_ids) ? item.proposed_clo_ids : [],
      bloom_levels: Array.isArray(item.proposed_bloom_levels) ? item.proposed_bloom_levels : [],
      content_kind: item.proposed_content_kind || 'concept-explainer',
      asset_family: item.proposed_asset_family || 'module-content-block',
      target_section: inferTargetSection(item),
      widget_type: inferWidgetType(item),
      title: item.title || item.content_id,
      summary: item.summary || '',
      excerpt: item.excerpt || '',
      source_note: item.provenance?.source_title || item.license_note || '',
    },
    review_notes: 'AI proposal only. Human approval is required before this content can be treated as course-ready.',
  }));

  await writeJson(outputPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    source_screened_content: 'generated/sourcing/screened-content.json',
    generated_at: new Date().toISOString(),
    items: classifications,
  });

  console.log(`Classified ${classifications.length} content source item(s) for ${config.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
