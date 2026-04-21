#!/usr/bin/env node

import path from 'node:path';
import {
  findCourseArtifactPath,
  getCoursePaths,
  readJson,
  readText,
  resolveCourseDir,
  slugify,
  writeJson,
} from './lib/course-lib.mjs';

function parseArgs(argv) {
  const options = { courseDir: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/apply-resource-seeds.mjs [--course-dir courses/<course-id>]');
      process.exit(0);
    }
  }

  return options;
}

function parseMarkdownTable(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const tableLines = lines.filter((line) => line.trim().startsWith('|'));
  if (tableLines.length < 3) return [];

  const headers = tableLines[0]
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean);

  return tableLines
    .slice(2)
    .map((line) => line.split('|').map((cell) => cell.trim()))
    .map((cells) => cells.slice(1, headers.length + 1))
    .filter((cells) => cells.length === headers.length && cells.some(Boolean))
    .map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index]])));
}

function splitModules(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferTopic(row, moduleLookup) {
  const modules = splitModules(row.linked_module || row.linked_modules || '');
  if (modules.length === 1 && moduleLookup.has(modules[0])) {
    return moduleLookup.get(modules[0]);
  }

  const role = String(row.role || '').toLowerCase();
  if (role.includes('main')) return 'Core References';
  if (role.includes('practice') || role.includes('review')) return 'Practice and Review';
  return 'Course Resources';
}

function inferDescription(row, moduleLookup) {
  const modules = splitModules(row.linked_module || row.linked_modules || '')
    .map((moduleId) => moduleLookup.get(moduleId) || moduleId);
  const role = row.role ? `${row.role}` : 'support';
  const moduleLabel = modules.length > 0 ? `เหมาะกับ ${modules.join(', ')}` : 'ใช้เป็นแหล่งอ้างอิงของรายวิชา';
  return `${role}: ${moduleLabel}`;
}

function findUrl(row) {
  const joined = `${row.resource_name || ''} ${row.notes || ''}`;
  const match = joined.match(/https?:\/\/\S+/);
  return match ? match[0].replace(/[),.;]+$/, '') : null;
}

function buildManifestItem(row, moduleLookup, index) {
  const title = row.resource_name || 'Untitled resource';
  const url = findUrl(row);
  const role = row.role || 'support';
  const linkedModules = splitModules(row.linked_module || row.linked_modules || '');
  const bodyLines = [
    `ประเภท: ${row.resource_type || 'resource'}`,
    `บทบาท: ${role}`,
  ];

  if (linkedModules.length > 0) {
    bodyLines.push(`โมดูลที่เกี่ยวข้อง: ${linkedModules.map((moduleId) => moduleLookup.get(moduleId) || moduleId).join(', ')}`);
  }
  if (row.notes) {
    bodyLines.push(`หมายเหตุ: ${row.notes}`);
  }

  const item = {
    id: slugify(title) || slugify(url || '') || `resource-seed-${index + 1}`,
    topic: inferTopic(row, moduleLookup),
    title,
    description: inferDescription(row, moduleLookup),
    type: url ? 'link' : 'note',
    addedDate: new Date().toISOString().slice(0, 10),
    body: bodyLines.join('\n'),
    seed_type: row.resource_type || 'resource',
    seed_role: role,
    linked_modules: linkedModules,
  };

  if (url) {
    item.url = url;
    delete item.body;
  }

  return item;
}

function mergeManifestItems(existingItems, generatedItems) {
  const generatedIds = new Set(generatedItems.map((item) => item.id));
  const kept = existingItems.filter((item) => {
    if (!String(item.id || '').trim()) return false;
    if (generatedIds.has(item.id)) return false;
    if (['getting-started', 'module-map'].includes(item.id)) return false;
    if (String(item.id || '').endsWith('-course-note')) return false;
    return true;
  });
  return [...generatedItems, ...kept];
}

const options = parseArgs(process.argv.slice(2));
const courseDir = resolveCourseDir(options.courseDir ?? undefined);
const coursePaths = getCoursePaths(courseDir);
const { COURSE_DIR, RESOURCES_DIR } = coursePaths;

const seedPath = await findCourseArtifactPath(coursePaths, 'TQF3_RESOURCE_SEED_LIST');
const manifestPath = path.join(RESOURCES_DIR, 'manifest.json');
const courseConfig = await readJson(path.join(COURSE_DIR, 'course.config.json'));
const moduleLookup = new Map((courseConfig.modules || []).map((module) => [module.id, module.title || module.id]));

const seedMarkdown = await readText(seedPath);
const rows = parseMarkdownTable(seedMarkdown);

if (rows.length === 0) {
  console.log(`No resource seed rows found in ${seedPath}`);
  process.exit(0);
}

const generatedItems = rows.map((row, index) => buildManifestItem(row, moduleLookup, index));
const existingManifest = await readJson(manifestPath);
const mergedItems = mergeManifestItems(existingManifest.items || [], generatedItems);

await writeJson(manifestPath, {
  course_id: existingManifest.course_id || courseConfig.course_id,
  items: mergedItems,
});

console.log(`Applied ${generatedItems.length} resource seed item(s) into ${manifestPath}`);
generatedItems.forEach((item) => {
  console.log(`- ${item.id} -> ${item.topic}`);
});
