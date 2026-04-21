#!/usr/bin/env node

import path from 'node:path';
import {
  findCourseArtifactPath,
  getCoursePaths,
  readJson,
  readText,
  resolveCourseDir,
  writeJson,
} from './lib/course-lib.mjs';

const BLOOM_EMOJI = {
  Remember: '🧠',
  Understand: '📘',
  Apply: '🛠',
  Analyze: '🔍',
  Evaluate: '🎯',
  Create: '🚀',
};

const ROLE_XP_BONUS = {
  diagnostic: 0,
  practice: 20,
  formative: 30,
  assess: 50,
};

function parseArgs(argv) {
  const options = { courseDir: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/apply-badge-hooks.mjs [--course-dir courses/<course-id>]');
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

function stripTicks(value) {
  return String(value || '').replace(/`/g, '').trim();
}

function titleCaseWords(value) {
  return String(value || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function deriveBadgeName(cloId, bloom, hookId) {
  const parts = String(hookId || '')
    .split('-')
    .filter(Boolean);
  const suffixParts = parts.filter((part) =>
    part.toLowerCase() !== cloId.toLowerCase() && part.toLowerCase() !== bloom.toLowerCase(),
  );
  const suffix = suffixParts.length > 0 ? ` ${titleCaseWords(suffixParts.join(' '))}` : '';
  return `${cloId} ${titleCaseWords(bloom)}${suffix}`;
}

function thresholdFor(row, moduleOrder) {
  const role = String(row['Assessment Role'] || '').toLowerCase();
  return 100 + (moduleOrder * 40) + (ROLE_XP_BONUS[role] || 10);
}

function buildEvidenceBadges(rows, config, missionsByKey) {
  const moduleLookup = new Map((config.modules || []).map((module) => [module.id, module]));
  const groupedByClo = new Map();

  rows.forEach((row) => {
    const cloId = stripTicks(row.CLO);
    const list = groupedByClo.get(cloId) || [];
    list.push(row);
    groupedByClo.set(cloId, list);
  });

  const generated = [];

  groupedByClo.forEach((rowsForClo, cloId) => {
    const orderedRows = rowsForClo
      .map((row) => ({
        ...row,
        moduleId: stripTicks(row.Module),
        badgeHook: stripTicks(row['Badge Hook']),
        bloom: stripTicks(row.Bloom),
      }))
      .sort((left, right) => {
        const leftOrder = moduleLookup.get(left.moduleId)?.order || 99;
        const rightOrder = moduleLookup.get(right.moduleId)?.order || 99;
        return leftOrder - rightOrder;
      });

    orderedRows.forEach((row, index) => {
      const module = moduleLookup.get(row.moduleId);
      const moduleTitle = module?.title || row.moduleId;
      const missionKey = `${cloId}::${row.moduleId}`;
      const linkedMissionIds = missionsByKey.get(missionKey) || [];
      const badge = {
        id: row.badgeHook,
        emoji: BLOOM_EMOJI[row.bloom] || '🏅',
        name: deriveBadgeName(cloId, row.bloom, row.badgeHook),
        req: `Collect ${row['Evidence Type']} evidence in ${moduleTitle}`,
        threshold_xp: thresholdFor(row, module?.order || 1),
        required_modules: [row.moduleId],
      };

      if (linkedMissionIds.length > 0) {
        badge.required_missions = linkedMissionIds;
      }

      if (index > 0) {
        badge.required_badges = [orderedRows[index - 1].badgeHook];
      }

      if (String(row['Assessment Role'] || '').toLowerCase() === 'assess') {
        badge.required_accuracy = 60;
      }

      generated.push(badge);
    });
  });

  return generated;
}

function mergeBadges(existingBadges, generatedBadges) {
  const coreBadges = (existingBadges || []).filter((badge) =>
    ['starter', 'explorer', 'master'].includes(badge.id),
  );
  return [...coreBadges, ...generatedBadges];
}

const options = parseArgs(process.argv.slice(2));
const courseDir = resolveCourseDir(options.courseDir ?? undefined);
const coursePaths = getCoursePaths(courseDir);
const { COURSE_DIR, MISSIONS_DIR } = coursePaths;

const configPath = path.join(COURSE_DIR, 'course.config.json');
const evidencePath = await findCourseArtifactPath(coursePaths, 'TQF3_ASSESSMENT_EVIDENCE_MAP');
const missionsPath = path.join(MISSIONS_DIR, 'missions.json');

const config = await readJson(configPath);
const missionsPayload = await readJson(missionsPath);
const evidenceMarkdown = await readText(evidencePath);
const rows = parseMarkdownTable(evidenceMarkdown);

if (rows.length === 0) {
  console.log(`No assessment evidence rows found in ${evidencePath}`);
  process.exit(0);
}

const missionsByKey = new Map();
(missionsPayload.missions || []).forEach((mission) => {
  if (String(mission.mission_id || '').startsWith('draft-')) return;
  const key = `${mission.clo_id}::${mission.module_id}`;
  const list = missionsByKey.get(key) || [];
  list.push(mission.mission_id);
  missionsByKey.set(key, list);
});

const generatedBadges = buildEvidenceBadges(rows, config, missionsByKey);
config.badges = mergeBadges(config.badges || [], generatedBadges);

await writeJson(configPath, config);

console.log(`Applied ${generatedBadges.length} badge hook(s) into ${configPath}`);
generatedBadges.forEach((badge) => {
  console.log(`- ${badge.id}`);
});
