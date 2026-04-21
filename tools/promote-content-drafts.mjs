#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  getCoursePaths,
  resolveCourseDir,
  readJson,
  readText,
  writeJson,
  writeText,
  parseFrontmatter,
} from './lib/course-lib.mjs';

const MANAGED_BLOCK_START = '<!-- CONTENT_DRAFT_PROMOTIONS_START -->';
const MANAGED_BLOCK_END = '<!-- CONTENT_DRAFT_PROMOTIONS_END -->';

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
      console.log('usage: node tools/promote-content-drafts.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function serializeFrontmatterValue(value) {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function serializeModule(meta, body) {
  const lines = ['---'];
  Object.entries(meta).forEach(([key, value]) => {
    lines.push(`${key}: ${serializeFrontmatterValue(value)}`);
  });
  lines.push('---', '', body.trim(), '');
  return lines.join('\n');
}

function approvedDrafts(payload) {
  return (Array.isArray(payload.drafts) ? payload.drafts : []).filter((draft) =>
    draft.approval_status === 'approved'
      && (!draft.approved_target_destination || draft.approved_target_destination === 'modules/*.md'),
  );
}

function normalizeModuleId(rawValue, validModuleIds) {
  const value = String(rawValue || '').trim();
  if (!value) return value;
  if (validModuleIds.has(value)) return value;
  const withoutPrefix = value.replace(/^\d{1,2}-/, '');
  if (validModuleIds.has(withoutPrefix)) return withoutPrefix;
  return value;
}

function replaceManagedBlock(body, newBlock) {
  const normalized = body.trim();
  const managed = `${MANAGED_BLOCK_START}\n${newBlock}\n${MANAGED_BLOCK_END}`;
  const existingPattern = new RegExp(`${MANAGED_BLOCK_START}[\\s\\S]*?${MANAGED_BLOCK_END}`, 'm');
  if (existingPattern.test(normalized)) {
    return normalized.replace(existingPattern, managed).trim();
  }
  return `${normalized}\n\n${managed}`.trim();
}

function moduleBlock(drafts) {
  const sections = [
    '## Reviewed Content Additions',
    '',
    'These blocks were promoted from reviewed Engine 4 drafts.',
    '',
  ];

  drafts.forEach((draft) => {
    sections.push(draft.markdown_block.trim(), '');
  });

  return sections.join('\n').trim();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const config = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const validModuleIds = new Set((config.modules || []).map((module) => module.id));
  const draftPayload = await readJson(await findCourseArtifactPath(coursePaths, 'CONTENT_DRAFTS'));
  const logPath = courseArtifactPath(coursePaths, 'CONTENT_PROMOTION_LOG');

  const approved = approvedDrafts(draftPayload);
  const grouped = approved.reduce((map, draft) => {
    const moduleId = normalizeModuleId(draft.module_id, validModuleIds);
    const list = map.get(moduleId) || [];
    list.push({ ...draft, module_id: moduleId });
    map.set(moduleId, list);
    return map;
  }, new Map());

  const promotedModules = [];
  for (const module of config.modules || []) {
    const drafts = grouped.get(module.id);
    if (!drafts?.length) continue;
    const modulePath = path.join(coursePaths.MODULES_DIR, `${String(module.order).padStart(2, '0')}-${module.slug}.md`);
    const raw = await readText(modulePath);
    const parsed = parseFrontmatter(raw);
    const nextBody = replaceManagedBlock(parsed.body, moduleBlock(drafts));
    await writeText(modulePath, serializeModule(parsed.data, nextBody));
    promotedModules.push({
      module_id: module.id,
      module_file: path.relative(process.cwd(), modulePath),
      promoted_draft_ids: drafts.map((draft) => draft.draft_id),
    });
  }

  await writeJson(logPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    promoted_at: new Date().toISOString(),
    promoted_count: approved.length,
    promoted_modules: promotedModules,
    destination: 'modules/*.md',
  });

  console.log(`Promoted ${approved.length} approved content draft(s) for ${config.course_id}`);
  console.log(`- log: ${path.relative(process.cwd(), logPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
