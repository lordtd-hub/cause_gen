#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const REPO_ROOT = path.resolve(__dirname, '..', '..');
export const COURSES_DIR = path.join(REPO_ROOT, 'courses');
export const OUTPUTS_DIR = path.join(REPO_ROOT, 'outputs');
export const EXAMPLES_DIR = path.join(REPO_ROOT, 'examples');
export const DEFAULT_COURSE_DIR = path.join(COURSES_DIR, 'example-sma2301-mathematical-analysis');
export const TEMPLATES_DIR = path.join(REPO_ROOT, 'templates');
export const SOURCE_REF_ALLOWED_FILLS = [
  'module-at-a-glance',
  'module-core-content',
  'module-active-learning',
  'module-checkpoints',
];

function normalizeForCompare(target) {
  return path.resolve(target).replace(/\\/g, '/').toLowerCase();
}

export function assertPathInside(rootDir, targetDir, label) {
  const root = normalizeForCompare(rootDir);
  const target = normalizeForCompare(targetDir);
  if (target !== root && !target.startsWith(`${root}/`)) {
    throw new Error(`${label} must stay inside ${rootDir}: ${targetDir}`);
  }
}

export function resolveCourseDir(courseDir = DEFAULT_COURSE_DIR) {
  const resolved = path.resolve(courseDir);
  assertPathInside(COURSES_DIR, resolved, 'Course directory');
  return resolved;
}

export function resolveOutputDir(courseId, outputDir = null, courseDir = null) {
  if (outputDir) {
    const resolved = path.resolve(outputDir);
    const allowedRoots = [OUTPUTS_DIR];
    if (courseDir) {
      allowedRoots.push(resolveCourseDir(courseDir));
    }
    const withinAllowedRoot = allowedRoots.some((rootDir) => {
      try {
        assertPathInside(rootDir, resolved, 'Output directory');
        return true;
      } catch {
        return false;
      }
    });
    if (!withinAllowedRoot) {
      throw new Error(`Output directory must stay inside one of: ${allowedRoots.join(', ')}: ${resolved}`);
    }
    return resolved;
  }

  if (courseDir) {
    return path.join(resolveCourseDir(courseDir), 'output');
  }

  const resolved = path.join(OUTPUTS_DIR, courseId);
  assertPathInside(OUTPUTS_DIR, resolved, 'Output directory');
  return resolved;
}

export async function findOutputDir(courseId, courseDir, outputDir = null) {
  if (outputDir) {
    return resolveOutputDir(courseId, outputDir, courseDir);
  }

  const resolvedCourseDir = resolveCourseDir(courseDir);
  const preferred = path.join(resolvedCourseDir, 'output');
  const legacy = path.join(OUTPUTS_DIR, courseId);

  if (await fileExists(preferred)) return preferred;
  if (await fileExists(legacy)) return legacy;
  return preferred;
}

export function getCoursePaths(courseDir = DEFAULT_COURSE_DIR) {
  const COURSE_DIR = resolveCourseDir(courseDir);
  const GENERATED_DIR = path.join(COURSE_DIR, 'generated');
  const MATERIALS_DIR = path.join(COURSE_DIR, 'materials');
  const MATERIALS_PROCESSED_DIR = path.join(MATERIALS_DIR, 'processed');
  return {
    COURSE_DIR,
    OUTPUT_DIR: path.join(COURSE_DIR, 'output'),
    MODULES_DIR: path.join(COURSE_DIR, 'modules'),
    RESOURCES_DIR: path.join(COURSE_DIR, 'resources'),
    MISSIONS_DIR: path.join(COURSE_DIR, 'missions'),
    GENERATED_DIR,
    GENERATED_WORKFLOW_DIR: path.join(GENERATED_DIR, 'workflow'),
    GENERATED_FRAMING_DIR: path.join(GENERATED_DIR, 'framing'),
    GENERATED_BRIDGES_DIR: path.join(GENERATED_DIR, 'bridges'),
    GENERATED_ASSESSMENT_DIR: path.join(GENERATED_DIR, 'assessment'),
    GENERATED_CONTENT_DIR: path.join(GENERATED_DIR, 'content'),
    GENERATED_SOURCING_DIR: path.join(GENERATED_DIR, 'sourcing'),
    GENERATED_REVIEWS_DIR: path.join(GENERATED_DIR, 'reviews'),
    MATERIALS_RAW_DIR: path.join(MATERIALS_DIR, 'raw'),
    MATERIALS_PROCESSED_DIR,
    MATERIALS_PROCESSED_INTAKE_DIR: path.join(MATERIALS_PROCESSED_DIR, 'intake'),
    MATERIALS_PROCESSED_DESIGN_DIR: path.join(MATERIALS_PROCESSED_DIR, 'design'),
    MATERIALS_PROCESSED_ASSESSMENT_DIR: path.join(MATERIALS_PROCESSED_DIR, 'assessment'),
    MATERIALS_PROCESSED_CONTENT_DIR: path.join(MATERIALS_PROCESSED_DIR, 'content'),
  };
}

const COURSE_ARTIFACTS = {
  README_FIRST: {
    current: ['generated/workflow/README_FIRST.md'],
    legacy: ['generated/README_FIRST.md'],
  },
  CURRENT_TASK: {
    current: ['generated/workflow/CURRENT_TASK.md'],
    legacy: ['generated/CURRENT_TASK.md'],
  },
  DECISION_LOG: {
    current: ['generated/workflow/DECISION_LOG.md'],
    legacy: ['generated/DECISION_LOG.md'],
  },
  COURSE_BRIEF: {
    current: ['generated/workflow/COURSE_BRIEF.md'],
    legacy: ['generated/COURSE_BRIEF.md'],
  },
  COURSE_PLAN: {
    current: ['generated/workflow/COURSE_PLAN.md'],
    legacy: ['generated/COURSE_PLAN.md'],
  },
  MODULE_AUTHORING_QUEUE: {
    current: ['generated/workflow/MODULE_AUTHORING_QUEUE.md'],
    legacy: ['generated/MODULE_AUTHORING_QUEUE.md'],
  },
  SBRA_DESIGN_LOG: {
    current: ['generated/workflow/SBRA_DESIGN_LOG.md'],
    legacy: ['generated/SBRA_DESIGN_LOG.md'],
  },
  RELEASE_CHECKLIST: {
    current: ['generated/reviews/RELEASE_CHECKLIST.md'],
    legacy: ['generated/RELEASE_CHECKLIST.md'],
  },
  REAL_COURSE_BASELINE_REVIEW: {
    current: ['generated/reviews/REAL_COURSE_BASELINE_REVIEW.md'],
    legacy: ['generated/REAL_COURSE_BASELINE_REVIEW.md'],
  },
  SOURCE_TO_MODULE_MAP: {
    current: ['generated/bridges/SOURCE_TO_MODULE_MAP.md'],
    legacy: ['generated/SOURCE_TO_MODULE_MAP.md'],
  },
  ASSESSMENT_CLASSIFICATION: {
    current: ['generated/assessment/assessment-classification.json'],
    legacy: ['generated/assessment-classification.json'],
  },
  LATEX_PROBLEM_INTAKE_CLASSIFICATION: {
    current: ['generated/assessment/latex-problem-intake-classification.json'],
    legacy: [],
  },
  LATEX_PROBLEM_INTAKE_CLASSIFICATION_BY_MODULE_JSON: {
    current: ['generated/assessment/latex-problem-intake-classification-by-module.json'],
    legacy: [],
  },
  LATEX_PROBLEM_INTAKE_CLASSIFICATION_BY_MODULE_MD: {
    current: ['generated/assessment/latex-problem-intake-classification-by-module.md'],
    legacy: [],
  },
  SOLUTION_DRAFTS: {
    current: ['generated/assessment/solution-drafts.json'],
    legacy: ['generated/solution-drafts.json'],
  },
  SBRA_ITEM_DRAFTS: {
    current: ['generated/assessment/sbra-item-drafts.json'],
    legacy: [],
  },
  MISSION_DRAFTS: {
    current: ['generated/assessment/mission-drafts.json'],
    legacy: ['generated/mission-drafts.json'],
  },
  CONTENT_CLASSIFICATION: {
    current: ['generated/content/content-classification.json'],
    legacy: ['generated/content-classification.json'],
  },
  CONTENT_DRAFTS: {
    current: ['generated/content/content-drafts.json'],
    legacy: ['generated/content-drafts.json'],
  },
  ASSESSMENT_PROMOTION_LOG: {
    current: ['generated/bridges/assessment-promotion-log.json'],
    legacy: ['generated/assessment-promotion-log.json'],
  },
  CONTENT_PROMOTION_LOG: {
    current: ['generated/bridges/content-promotion-log.json'],
    legacy: ['generated/content-promotion-log.json'],
  },
  PROBLEM_SOURCE_POLICY: {
    current: ['generated/sourcing/problem-source-policy.json'],
    legacy: ['generated/problem-source-policy.json'],
  },
  RETRIEVAL_QUERIES: {
    current: ['generated/sourcing/retrieval-queries.json'],
    legacy: ['generated/retrieval-queries.json'],
  },
  RETRIEVED_PROBLEMS: {
    current: ['generated/sourcing/retrieved-problems.json'],
    legacy: ['generated/retrieved-problems.json'],
  },
  SCREENED_PROBLEMS: {
    current: ['generated/sourcing/screened-problems.json'],
    legacy: ['generated/screened-problems.json'],
  },
  CONTENT_SOURCE_POLICY: {
    current: ['generated/sourcing/content-source-policy.json'],
    legacy: ['generated/content-source-policy.json'],
  },
  CONTENT_RETRIEVAL_QUERIES: {
    current: ['generated/sourcing/content-retrieval-queries.json'],
    legacy: ['generated/content-retrieval-queries.json'],
  },
  RETRIEVED_CONTENT: {
    current: ['generated/sourcing/retrieved-content.json'],
    legacy: ['generated/retrieved-content.json'],
  },
  SCREENED_CONTENT: {
    current: ['generated/sourcing/screened-content.json'],
    legacy: ['generated/screened-content.json'],
  },
  PROBLEM_POOL_STARTER: {
    current: ['materials/processed/assessment/problem-pool-starter.md'],
    legacy: ['materials/processed/problem-pool-starter.md'],
  },
  PROBLEM_POOL_JSON: {
    current: ['materials/processed/assessment/problem-pool.json'],
    legacy: ['materials/processed/problem-pool.json'],
  },
  TQF3_COURSE_ANCHOR: {
    current: ['materials/processed/intake/tqf3-course-anchor.md'],
    legacy: ['materials/processed/tqf3-course-anchor.md'],
  },
  TQF3_CLO_MAP: {
    current: ['materials/processed/intake/tqf3-clo-map.md'],
    legacy: ['materials/processed/tqf3-clo-map.md'],
  },
  TQF3_WEEK_TO_MODULE_MAP: {
    current: ['materials/processed/intake/tqf3-week-to-module-map.md'],
    legacy: ['materials/processed/tqf3-week-to-module-map.md'],
  },
  TQF3_ASSESSMENT_EVIDENCE_MAP: {
    current: ['materials/processed/intake/tqf3-assessment-evidence-map.md'],
    legacy: ['materials/processed/tqf3-assessment-evidence-map.md'],
  },
  TQF3_TEACHING_METHOD_MAP: {
    current: ['materials/processed/intake/tqf3-teaching-method-map.md'],
    legacy: ['materials/processed/tqf3-teaching-method-map.md'],
  },
  TQF3_RESOURCE_SEED_LIST: {
    current: ['materials/processed/intake/tqf3-resource-seed-list.md'],
    legacy: ['materials/processed/tqf3-resource-seed-list.md'],
  },
  TQF3_CLO_COVERAGE_VIEW: {
    current: ['materials/processed/intake/tqf3-clo-coverage-view.md'],
    legacy: ['materials/processed/tqf3-clo-coverage-view.md'],
  },
  SOURCE_INVENTORY_STATUS: {
    current: ['materials/processed/intake/source-inventory-status.md'],
    legacy: ['materials/processed/source-inventory-status.md'],
  },
};

export function courseArtifactPath(coursePaths, key) {
  const artifact = COURSE_ARTIFACTS[key];
  if (!artifact) {
    throw new Error(`Unknown course artifact key: ${key}`);
  }
  return path.join(coursePaths.COURSE_DIR, artifact.current[0]);
}

export async function findCourseArtifactPath(coursePaths, key) {
  const artifact = COURSE_ARTIFACTS[key];
  if (!artifact) {
    throw new Error(`Unknown course artifact key: ${key}`);
  }

  for (const relativePath of [...artifact.current, ...artifact.legacy]) {
    const target = path.join(coursePaths.COURSE_DIR, relativePath);
    if (await fileExists(target)) return target;
  }

  return path.join(coursePaths.COURSE_DIR, artifact.current[0]);
}

export async function listMissionFramingFiles(coursePaths) {
  const candidates = [
    coursePaths.GENERATED_FRAMING_DIR,
    coursePaths.GENERATED_DIR,
  ];
  const seen = new Set();
  const files = [];

  for (const dir of candidates) {
    if (!(await fileExists(dir))) continue;
    const dirFiles = await listFiles(dir, ['.md']);
    for (const file of dirFiles) {
      const basename = path.basename(file);
      if (!basename.startsWith('MISSION_FRAMING_')) continue;
      if (seen.has(file)) continue;
      seen.add(file);
      files.push(file);
    }
  }

  return files.sort();
}

export async function listFilesRecursive(dir, extensions = []) {
  const output = [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);

  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...await listFilesRecursive(target, extensions));
    } else if (entry.isFile()) {
      if (extensions.length === 0 || extensions.includes(path.extname(target).toLowerCase())) {
        output.push(target);
      }
    }
  }

  return output.sort();
}

export async function ensureDir(target) {
  await fs.mkdir(target, { recursive: true });
}

export async function readText(target) {
  return fs.readFile(target, 'utf8');
}

export async function writeText(target, content) {
  await ensureDir(path.dirname(target));
  await fs.writeFile(target, content, 'utf8');
}

export async function readJson(target) {
  return JSON.parse(await readText(target));
}

export async function writeJson(target, data) {
  await writeText(target, `${JSON.stringify(data, null, 2)}\n`);
}

export async function copyFile(source, target) {
  await ensureDir(path.dirname(target));
  await fs.copyFile(source, target);
}

export async function copyDir(source, target) {
  await ensureDir(path.dirname(target));
  await fs.cp(source, target, { recursive: true, force: true });
}

export async function fileExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function listFiles(dir, extensions = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dir, entry.name))
    .filter((file) => extensions.length === 0 || extensions.includes(path.extname(file).toLowerCase()))
    .sort();
}

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function titleFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function renderTemplate(template, replacements) {
  return Object.entries(replacements).reduce(
    (output, [key, value]) => output.replaceAll(`{{${key}}}`, value ?? ''),
    template,
  );
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseValue(raw) {
  const value = raw.trim();
  if (value === '') return '';
  if (
    value.startsWith('[') ||
    value.startsWith('{') ||
    value === 'true' ||
    value === 'false' ||
    value === 'null' ||
    /^-?\d+(\.\d+)?$/.test(value) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function parseFrontmatter(source) {
  const normalized = source.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { data: {}, body: normalized };
  }

  const endIndex = normalized.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { data: {}, body: normalized };
  }

  const rawFrontmatter = normalized.slice(4, endIndex);
  const body = normalized.slice(endIndex + 5);
  const data = {};

  rawFrontmatter.split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1);
    data[key] = parseValue(value);
  });

  return { data, body };
}

function renderInline(value) {
  let output = escapeHtml(value);
  output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return output;
}

function widgetHost(type, rawBody) {
  const safeJson = rawBody.trim().replace(/<\/script/gi, '<\\/script');
  return `<div class="interactive-widget" data-widget-type="${escapeHtml(type)}"><script type="application/json" class="widget-data">${safeJson}</script></div>`;
}

export function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let paragraph = [];
  let listItems = [];
  let quoteLines = [];
  let inCode = false;
  let codeLang = '';
  let codeLines = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      html.push(`<ul>${listItems.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`);
      listItems = [];
    }
  };

  const flushQuote = () => {
    if (quoteLines.length) {
      html.push(`<blockquote>${quoteLines.map((line) => `<p>${renderInline(line)}</p>`).join('')}</blockquote>`);
      quoteLines = [];
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (inCode) {
      if (line.startsWith('```')) {
        html.push(`<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        inCode = false;
        codeLang = '';
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (line.startsWith('```')) {
      flushAll();
      inCode = true;
      codeLang = line.slice(3).trim();
      continue;
    }

    if (line.startsWith(':::')) {
      flushAll();
      const type = line.slice(3).trim();
      const bodyLines = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== ':::') {
        bodyLines.push(lines[i]);
        i += 1;
      }
      html.push(widgetHost(type, bodyLines.join('\n')));
      continue;
    }

    if (line.trim() === '') {
      flushAll();
      continue;
    }

    if (line.startsWith('### ')) {
      flushAll();
      html.push(`<h3>${renderInline(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith('## ')) {
      flushAll();
      html.push(`<h2>${renderInline(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('# ')) {
      flushAll();
      html.push(`<h1>${renderInline(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      flushQuote();
      listItems.push(line.slice(2).trim());
      continue;
    }

    if (line.startsWith('> ')) {
      flushParagraph();
      flushList();
      quoteLines.push(line.slice(2).trim());
      continue;
    }

    paragraph.push(line.trim());
  }

  flushAll();
  return html.join('\n');
}

export function decodeXmlEntities(value) {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function normalizeWhitespace(value, { preserveNewlines = false } = {}) {
  if (!value) return '';
  const normalized = String(value)
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (preserveNewlines) {
    return normalized
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  return normalized.replace(/\n+/g, ' ').trim();
}

function readXmlElement(source, startIndex) {
  const openMatch = source.slice(startIndex).match(/^<([A-Za-z0-9:_-]+)\b[^>]*>/);
  if (!openMatch) return null;

  const tagName = openMatch[1];
  const openTag = openMatch[0];
  if (openTag.endsWith('/>')) {
    return {
      tagName,
      xml: openTag,
      endIndex: startIndex + openTag.length,
    };
  }

  const tagRegex = /<[^>]+>/g;
  tagRegex.lastIndex = startIndex;
  let depth = 0;
  let match = tagRegex.exec(source);

  while (match) {
    const tag = match[0];
    if (/^<\?/.test(tag) || /^<!/.test(tag)) {
      match = tagRegex.exec(source);
      continue;
    }

    const closeMatch = tag.match(/^<\/([A-Za-z0-9:_-]+)\s*>$/);
    const openInnerMatch = tag.match(/^<([A-Za-z0-9:_-]+)\b[^>]*>$/);
    const selfClosing = /\/>$/.test(tag);

    if (closeMatch) {
      depth -= 1;
      if (depth === 0) {
        return {
          tagName,
          xml: source.slice(startIndex, tagRegex.lastIndex),
          endIndex: tagRegex.lastIndex,
        };
      }
    } else if (openInnerMatch && !selfClosing) {
      depth += 1;
    }

    match = tagRegex.exec(source);
  }

  return null;
}

function extractBodyBlocks(xml) {
  const bodyMatch = xml.match(/<w:body\b[^>]*>([\s\S]*?)<\/w:body>/);
  if (!bodyMatch) return [];

  const body = bodyMatch[1];
  const blocks = [];
  let index = 0;

  while (index < body.length) {
    const nextTag = body.indexOf('<', index);
    if (nextTag === -1) break;
    index = nextTag;

    if (body.startsWith('<w:p', index) || body.startsWith('<w:tbl', index)) {
      const element = readXmlElement(body, index);
      if (!element) break;
      blocks.push(element);
      index = element.endIndex;
      continue;
    }

    const skipped = readXmlElement(body, index);
    if (!skipped) {
      index += 1;
      continue;
    }
    index = skipped.endIndex;
  }

  return blocks;
}

function extractXmlText(xml) {
  const withControls = xml
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<w:(?:br|cr)[^>]*\/>/g, '\n')
    .replace(/<w:noBreakHyphen[^>]*\/>/g, '-')
    .replace(/<w:softHyphen[^>]*\/>/g, '-')
    .replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g, (_, value) => decodeXmlEntities(value));

  const stripped = withControls.replace(/<[^>]+>/g, '');
  return normalizeWhitespace(stripped, { preserveNewlines: true });
}

function splitDenseEnumerations(text) {
  const normalized = String(text || '').trim();
  if (normalized.length < 180) return normalized;

  return normalized
    .replace(/([^\n\d])(\d{1,2}\.\s*[^\d\s])/g, (match, prefix, start) => {
      if (!/[)\].,;:ะาำไใโเแ้๊๋์ๆA-Za-zก-๙]$/.test(prefix)) return match;
      return `${prefix}\n\n${start}`;
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitDenseEnumerationsV2(text) {
  const normalized = String(text || '').trim();
  if (normalized.length < 180) return normalized;

  return normalized
    .replace(/\s+/g, ' ')
    .replace(/([^\n])\s+((?:\d{1,2}\.){1,3})\s*(?=[^\d\s])/gu, (match, prefix, marker, offset, source) => {
      const previousChunk = source.slice(0, offset).split('\n').pop()?.trim() || '';
      if (previousChunk.length < 40) {
        return `${prefix} ${marker} `;
      }
      if (!/[\p{Script=Thai}A-Za-z0-9)\].,;:]$/u.test(prefix)) {
        return `${prefix} ${marker} `;
      }
      return `${prefix}\n\n${marker} `;
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitTqf3SectionLabels(text) {
  const normalized = String(text || '').trim();
  if (normalized.length < 180) return normalized;

  const labels = [
    'คำชี้แจง',
    'รายละเอียด CLOs',
    'CLOs',
    'หน่วยกิตทฤษฎีปฏิบัติ',
  ];

  return labels.reduce((output, label) => {
    const pattern = new RegExp(`([^\\n])\\s*(${escapeRegExp(label)})`, 'gu');
    return output.replace(pattern, (match, prefix, marker, offset, source) => {
      const previousChunk = source.slice(0, offset).split('\n').pop()?.trim() || '';
      if (previousChunk.length < 60) {
        return `${prefix} ${marker}`;
      }
      return `${prefix}\n\n${marker}`;
    });
  }, normalized);
}

function parseNumberingXml(xml) {
  if (!xml) return new Map();

  const abstractMap = new Map();
  const abstractMatches = [...xml.matchAll(/<w:abstractNum\b[^>]*w:abstractNumId="([^"]+)"[\s\S]*?<\/w:abstractNum>/g)];
  abstractMatches.forEach((match) => {
    const abstractId = match[1];
    const levelMap = new Map();
    const levelMatches = [...match[0].matchAll(/<w:lvl\b[^>]*w:ilvl="([^"]+)"[\s\S]*?<\/w:lvl>/g)];
    levelMatches.forEach((levelMatch) => {
      const level = Number(levelMatch[1] || '0');
      const levelXml = levelMatch[0];
      levelMap.set(level, {
        format: levelXml.match(/<w:numFmt\b[^>]*w:val="([^"]+)"/)?.[1] || 'bullet',
        text: levelXml.match(/<w:lvlText\b[^>]*w:val="([^"]+)"/)?.[1] || '',
      });
    });
    abstractMap.set(abstractId, levelMap);
  });

  const numberingMap = new Map();
  const numMatches = [...xml.matchAll(/<w:num\b[^>]*w:numId="([^"]+)"[\s\S]*?<\/w:num>/g)];
  numMatches.forEach((match) => {
    const numId = match[1];
    const abstractId = match[0].match(/<w:abstractNumId\b[^>]*w:val="([^"]+)"/)?.[1];
    if (abstractId && abstractMap.has(abstractId)) {
      numberingMap.set(numId, abstractMap.get(abstractId));
    }
  });

  return numberingMap;
}

function nextListMarker(listState, numId, level, format) {
  if (format === 'bullet') return '-';

  const state = listState.get(numId) || new Map();
  for (const key of [...state.keys()]) {
    if (key > level) state.delete(key);
  }

  const current = (state.get(level) || 0) + 1;
  state.set(level, current);
  listState.set(numId, state);
  return `${current}.`;
}

function paragraphToMarkdown(xml, options = {}) {
  const text = splitTqf3SectionLabels(splitDenseEnumerationsV2(splitDenseEnumerations(extractXmlText(xml))));
  if (!text) return '';

  const style = xml.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/)?.[1] || '';
  const headingLevel = style.match(/Heading([1-6])/i)?.[1];
  if (headingLevel) {
    return `${'#'.repeat(Number(headingLevel))} ${text}`;
  }
  if (/^title$/i.test(style)) {
    return `# ${text}`;
  }
  if (/^subtitle$/i.test(style)) {
    return `## ${text}`;
  }

  if (/<w:numPr\b/.test(xml)) {
    const level = Number(xml.match(/<w:ilvl\b[^>]*w:val="(\d+)"/)?.[1] || '0');
    const numId = xml.match(/<w:numId\b[^>]*w:val="(\d+)"/)?.[1] || '';
    const definition = options.numbering?.get(numId)?.get(level);
    const marker = nextListMarker(options.listState || new Map(), numId, level, definition?.format || 'bullet');
    const indent = '  '.repeat(Math.max(0, level));
    return `${indent}${marker} ${text}`;
  }

  return text;
}

function tableCellToMarkdown(xml) {
  const paragraphMatches = [...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)];
  if (paragraphMatches.length === 0) {
    return normalizeWhitespace(extractXmlText(xml)).replace(/\|/g, '\\|');
  }

  const lines = paragraphMatches
    .map((match) => normalizeWhitespace(extractXmlText(match[0]), { preserveNewlines: false }))
    .filter(Boolean)
    .map((line) => line.replace(/\|/g, '\\|'));

  return lines.join('<br>');
}

function tableToMarkdown(xml) {
  const rowMatches = [...xml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)];
  if (rowMatches.length === 0) return '';

  const rows = rowMatches
    .map((match) => {
      const cells = [...match[0].matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)]
        .map((cell) => tableCellToMarkdown(cell[0]));
      return cells.filter((cell) => cell !== '');
    })
    .filter((row) => row.length > 0);

  if (rows.length === 0) return '';
  if (rows.length === 1) {
    return rows[0].map((cell) => `- ${cell}`).join('\n');
  }

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizedRows = rows.map((row) => {
    const padded = [...row];
    while (padded.length < columnCount) padded.push('');
    return padded.map((cell) => cell.replace(/\|/g, '\\|'));
  });

  const header = normalizedRows[0];
  const separator = header.map(() => '---');
  const body = normalizedRows.slice(1);
  return [
    `| ${header.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...body.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function docxXmlToMarkdown(xml, options = {}) {
  const blocks = extractBodyBlocks(xml);
  const listState = new Map();
  const markdownBlocks = blocks
    .map((block) => {
      if (block.tagName === 'w:p') {
        const markdown = paragraphToMarkdown(block.xml, { numbering: options.numbering, listState });
        return markdown ? { kind: /^\s*(?:-|\d+\.)\s/.test(markdown) ? 'list' : 'paragraph', markdown } : null;
      }
      if (block.tagName === 'w:tbl') {
        const markdown = tableToMarkdown(block.xml);
        return markdown ? { kind: 'table', markdown } : null;
      }
      return null;
    })
    .filter(Boolean);

  const output = [];
  markdownBlocks.forEach((block, index) => {
    const previous = markdownBlocks[index - 1];
    if (index > 0) {
      output.push(previous?.kind === 'list' && block.kind === 'list' ? '\n' : '\n\n');
    }
    output.push(block.markdown);
  });

  return output.join('').trim();
}

export function texToMarkdown(source) {
  return source
    .replace(/\r\n/g, '\n')
    .replace(/\\documentclass[\s\S]*?\\begin\{document\}/g, '')
    .replace(/\\end\{document\}/g, '')
    .replace(/\\section\{([^}]+)\}/g, '# $1')
    .replace(/\\subsection\{([^}]+)\}/g, '## $1')
    .replace(/\\subsubsection\{([^}]+)\}/g, '### $1')
    .replace(/\\begin\{equation\*?\}/g, '$$\n')
    .replace(/\\end\{equation\*?\}/g, '\n$$')
    .replace(/\\begin\{align\*?\}/g, '$$\n')
    .replace(/\\end\{align\*?\}/g, '\n$$')
    .trim();
}

export async function extractDocxText(docxPath) {
  if (process.platform !== 'win32') {
    throw new Error('DOCX import is currently implemented for Windows via PowerShell only');
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'course-docx-'));
  const tempZip = path.join(tempRoot, 'source.zip');
  const extractDir = path.join(tempRoot, 'unzipped');

  const command = [
    `$src = '${docxPath.replace(/'/g, "''")}';`,
    `$zip = '${tempZip.replace(/'/g, "''")}';`,
    `$dest = '${extractDir.replace(/'/g, "''")}';`,
    "Copy-Item -LiteralPath $src -Destination $zip -Force;",
    "Expand-Archive -LiteralPath $zip -DestinationPath $dest -Force;",
  ].join(' ');

  try {
    execFileSync('powershell.exe', ['-NoProfile', '-Command', command], { stdio: 'ignore' });
    const xml = await readText(path.join(extractDir, 'word', 'document.xml'));
    const numberingPath = path.join(extractDir, 'word', 'numbering.xml');
    const numberingXml = await fileExists(numberingPath) ? await readText(numberingPath) : '';
    const numbering = parseNumberingXml(numberingXml);
    return docxXmlToMarkdown(xml, { numbering });
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

export async function importMaterialFile(sourcePath, targetDir) {
  const ext = path.extname(sourcePath).toLowerCase();
  const basename = path.basename(sourcePath, ext);
  const outPath = path.join(targetDir, `${basename}.md`);

  let content = '';
  if (ext === '.md') {
    content = await readText(sourcePath);
  } else if (ext === '.tex') {
    content = texToMarkdown(await readText(sourcePath));
  } else if (ext === '.docx') {
    content = await extractDocxText(sourcePath);
  } else {
    throw new Error(`Unsupported material type: ${ext}`);
  }

  await writeText(outPath, `${content.trim()}\n`);
  return outPath;
}

export async function loadModules(courseDir = DEFAULT_COURSE_DIR) {
  const { MODULES_DIR } = getCoursePaths(courseDir);
  const files = await listFiles(MODULES_DIR, ['.md']);
  const modules = [];
  for (const file of files) {
    const raw = await readText(file);
    const parsed = parseFrontmatter(raw);
    modules.push({
      sourcePath: file,
      meta: parsed.data,
      body: parsed.body,
      html: renderMarkdown(parsed.body),
    });
  }
  return modules.sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
}

export async function loadCourseProject(courseDir = DEFAULT_COURSE_DIR) {
  const { COURSE_DIR, MISSIONS_DIR, RESOURCES_DIR } = getCoursePaths(courseDir);
  const config = await readJson(path.join(COURSE_DIR, 'course.config.json'));
  const modules = await loadModules(courseDir);
  const missions = await readJson(path.join(MISSIONS_DIR, 'missions.json'));
  const resources = await readJson(path.join(RESOURCES_DIR, 'manifest.json'));
  return { config, modules, missions, resources };
}

export function moduleSummary(module) {
  return {
    id: module.meta.id,
    slug: module.meta.slug,
    title: module.meta.title,
    summary: module.meta.summary,
    order: module.meta.order,
    clo_ids: module.meta.clo_ids ?? [],
    module_kind: module.meta.module_kind ?? 'concept',
    widgets: module.meta.widgets ?? [],
  };
}
