#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  getCoursePaths,
  loadModules,
  readText,
  resolveCourseDir,
  SOURCE_REF_ALLOWED_FILLS,
  writeText,
} from './lib/course-lib.mjs';

function usage() {
  console.log('usage: node tools/apply-source-refs.mjs [--course-dir courses/<course-id>]');
}

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
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function formatFrontmatter(meta) {
  return `---
id: ${meta.id}
slug: ${meta.slug}
title: ${meta.title}
summary: ${meta.summary}
order: ${meta.order}
clo_ids: ${JSON.stringify(meta.clo_ids ?? [])}
module_kind: ${meta.module_kind ?? 'concept'}
widgets: ${JSON.stringify(meta.widgets ?? [])}
source_refs: ${JSON.stringify(meta.source_refs ?? [])}
---`;
}

function extractWidgetBlocks(body) {
  const matches = body.match(/:::.*?[\r\n]+[\s\S]*?[\r\n]+:::/g);
  return matches ? matches.map((block) => block.trim()) : [];
}

function sliceSection(markdown, headingLine) {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const start = normalized.indexOf(headingLine);
  if (start === -1) return '';
  const afterStart = normalized.slice(start);
  const nextHeadingMatch = afterStart.slice(headingLine.length).match(/\n##\s|\n###\s/);
  if (!nextHeadingMatch) return afterStart.trim();
  return afterStart.slice(0, headingLine.length + nextHeadingMatch.index).trim();
}

function parseMarkdownTable(sectionText) {
  const lines = sectionText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));

  if (lines.length < 3) return [];

  const headers = lines[0].split('|').slice(1, -1).map((cell) => cell.trim());
  return lines.slice(2).map((line) => {
    const values = line.split('|').slice(1, -1).map((cell) => cell.trim());
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? '';
      return row;
    }, {});
  });
}

function expandWeekToken(token) {
  const raw = String(token ?? '').trim();
  if (!raw) return [];
  if (/^\d+$/.test(raw)) return [Number(raw)];
  const range = raw.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }
  return [];
}

function listWeeksFromRow(row) {
  return expandWeekToken(row.Week);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function normalizeFills(fills) {
  const list = Array.isArray(fills) ? fills : [];
  return list.filter((fill) => SOURCE_REF_ALLOWED_FILLS.includes(fill));
}

function looksMojibake(value) {
  return /(?:\u0E40\u0E18|\u0E40\u0E19\u20AC|\u0E4F\u0E1F\u0E1D|\uFFFD)/.test(String(value || ''));
}

function safeText(value, fallback) {
  const trimmed = String(value || '').trim();
  if (!trimmed || looksMojibake(trimmed)) return fallback;
  return trimmed;
}

async function loadRefData(courseDir, ref) {
  const sourcePath = path.join(courseDir, ref.file);
  const source = await readText(sourcePath);

  if (ref.kind === 'module-structure') {
    const section = sliceSection(source, '### 3.1 Module Structure');
    const rows = parseMarkdownTable(section);
    const target = String(ref.match || '').trim().toLowerCase();
    const row = rows.find((item) => (item.Module || '').trim().toLowerCase().includes(target));
    if (!row) {
      return {
        kind: ref.kind,
        file: ref.file,
        missing: true,
        match: ref.match || '',
      };
    }
    return {
      kind: ref.kind,
      file: ref.file,
      match: ref.match || '',
      fills: normalizeFills(ref.fills),
      suggestedWeeks: row['Suggested Weeks'] || '',
      coreContent: row['Core Content'] || '',
      mainClos: row['Main CLOs'] || '',
    };
  }

  if (ref.kind === 'week-plan') {
    const section = sliceSection(source, '### 3.2 Week-by-Week Plan');
    const rows = parseMarkdownTable(section);
    const targetWeeks = new Set((ref.weeks || []).flatMap((week) => expandWeekToken(week)));
    const matchedRows = rows.filter((row) => listWeeksFromRow(row).some((week) => targetWeeks.has(week)));
    return {
      kind: ref.kind,
      file: ref.file,
      weeks: ref.weeks || [],
      fills: normalizeFills(ref.fills),
      rows: matchedRows,
    };
  }

  return {
    kind: ref.kind || 'source',
    file: ref.file,
    unsupported: true,
  };
}

function buildBridgeBody(module, refData, widgetBlocks) {
  const structure = refData.find((item) => item.kind === 'module-structure' && !item.missing);
  const weekPlan = refData.find((item) => item.kind === 'week-plan');
  const weekRows = weekPlan?.rows || [];
  const themes = unique(weekRows.map((row) => safeText(row.Theme, 'topic emphasis for this module')));
  const activities = unique(weekRows.map((row) => safeText(row['Suggested Interactive Materials'], 'interactive plan to refine from source')));
  const evidence = unique(weekRows.map((row) => safeText(row['Main Evidence'], 'assessment evidence to refine from source')));
  const weekLabels = unique(weekRows.map((row) => String(row.Week || '').trim()).filter(Boolean));
  const suggestedWeeks = structure?.suggestedWeeks || weekLabels.join(', ') || 'to be confirmed';
  const sourceContent = safeText(
    structure?.coreContent,
    'Use this section to unfold the main ideas of the module in small, connected steps.',
  );

  const sections = [
    `# ${module.meta.title}`,
    '',
    module.meta.summary,
    '',
    '## Learning Snapshot',
    '',
    `- Learning pace: ${suggestedWeeks} week(s)`,
    `- Main CLO emphasis: ${(module.meta.clo_ids || []).join(', ')}`,
    `- Module style: ${module.meta.module_kind}`,
    '',
    '## What You Will Explore',
    '',
    `In this module, learners gradually work through ${sourceContent}.`,
    '',
    ...(themes.length > 0 ? [
      'The main ideas you will revisit in this part of the course are:',
      '',
      ...themes.map((item) => `- ${item}`),
      '',
    ] : []),
    '## Learning Flow',
    '',
    ...(weekRows.length > 0
      ? weekRows.map((row) => `- Week ${row.Week}: ${safeText(row.Theme, 'Review the focus of this week and connect it to the previous idea.')}`)
      : ['- Begin with the key ideas of the module, then move into short practice and reflection.']),
    '',
    '## Try While You Learn',
    '',
    ...(activities.length > 0
      ? activities.map((item) => `- ${item}`)
      : ['- Pause after each concept, test a small case, and explain your reasoning in your own words.']),
    '',
    '## Check Your Understanding',
    '',
    ...(evidence.length > 0
      ? evidence.map((item) => `- ${item}`)
      : ['- Use a short explanation, a quick example, or a small verification task to check understanding.']),
  ];

  if (widgetBlocks.length > 0) {
    widgetBlocks.forEach((block) => {
      sections.push('', '## Interactive Practice', '', block);
    });
  }

  return `${sections.join('\n').trim()}\n`;
}

function buildSourceMap(modules) {
  const rows = modules.map((module) => {
    const refs = Array.isArray(module.meta.source_refs) ? module.meta.source_refs : [];
    const refSummary = refs.length > 0
      ? refs.map((ref) => {
        if (Array.isArray(ref.weeks) && ref.weeks.length > 0) {
          return `${ref.kind}:${ref.weeks.join(',')}`;
        }
        return `${ref.kind}:${ref.match || ref.file}`;
      }).join('; ')
      : 'pending';
    return `| ${module.meta.order} | ${module.meta.id} | ${path.basename(module.sourcePath)} | ${refSummary} |`;
  }).join('\n');

  return `# SOURCE TO MODULE MAP

Use this file as the course-level reference when the build or authoring flow needs to know which processed source is expected to feed each module.

| order | module_id | module_file | source_refs |
| --- | --- | --- | --- |
${rows}
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const modules = await loadModules(courseDir);

  let updated = 0;
  for (const module of modules) {
    const sourceRefs = Array.isArray(module.meta.source_refs) ? module.meta.source_refs : [];
    if (sourceRefs.length === 0) continue;
    const refData = [];
    for (const ref of sourceRefs) {
      refData.push(await loadRefData(courseDir, ref));
    }
    const widgetBlocks = extractWidgetBlocks(module.body);
    const nextBody = buildBridgeBody(module, refData, widgetBlocks);
    const nextSource = `${formatFrontmatter(module.meta)}\n\n${nextBody}`;
    await writeText(module.sourcePath, nextSource);
    updated += 1;
  }

  await writeText(courseArtifactPath(coursePaths, 'SOURCE_TO_MODULE_MAP'), `${buildSourceMap(modules).trim()}\n`);
  console.log(`Applied source refs to ${updated} module(s) in ${courseDir}`);
}

await main();
