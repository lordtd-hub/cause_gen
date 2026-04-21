#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  findOutputDir,
  resolveCourseDir,
  loadCourseProject,
  moduleSummary,
  fileExists,
  SOURCE_REF_ALLOWED_FILLS,
} from './lib/course-lib.mjs';

function parseArgs(argv) {
  const options = {
    courseDir: null,
    outputDir: null,
    checkOutput: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check-output') {
      options.checkOutput = true;
    } else if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--output-dir') {
      options.outputDir = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/validate-course.mjs [--course-dir courses/<course-dir>] [--output-dir courses/<course-id>/output] [--check-output]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const courseDir = resolveCourseDir(options.courseDir ?? undefined);
const { config, modules, missions, resources } = await loadCourseProject(courseDir);
const errors = [];
const warnings = [];
const LEARNER_FACING_BANNED_PHRASES = [
  'placeholder',
  'scaffold',
  'init-new-course.mjs',
  'Workflow ของ template',
  'template workflow',
  'canonical source',
  'manifest.json',
];
const MOJIBAKE_PATTERNS = [
  '\u0E40\u0E18',
  '\u0E40\u0E19\u20AC',
  '\u0E42\u0E0D',
  '\u0E4F\u0E1F\u0E1D',
  '\uFFFD',
];

function requireField(obj, key, label) {
  if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
    errors.push(`Missing ${label}`);
  }
}

function hasToneLeak(text) {
  return LEARNER_FACING_BANNED_PHRASES.some((phrase) => text.includes(phrase));
}

function hasMojibake(text) {
  return MOJIBAKE_PATTERNS.some((pattern) => text.includes(pattern));
}

function hasInternalCoursesLeak(text) {
  return /(?:href|src)=["'](?:\.\.\/)?courses\//.test(text) || /["'\s>]courses\//.test(text);
}

['course_id', 'course_name_th', 'course_name_en', 'course_short_name', 'instructor', 'description', 'theme', 'features', 'widgets_enabled', 'modules', 'clos', 'lesson_completion_xp', 'badges'].forEach((field) => {
  requireField(config, field, `course.config.json:${field}`);
});

if (!Number.isFinite(config.lesson_completion_xp) || config.lesson_completion_xp <= 0) {
  errors.push('course.config.json:lesson_completion_xp must be a positive number');
}

if (!Array.isArray(config.badges) || config.badges.length === 0) {
  errors.push('course.config.json:badges must contain at least one badge');
} else {
  const badgeIds = new Set();
  config.badges.forEach((badge, index) => {
    ['id', 'name', 'req', 'threshold_xp'].forEach((field) =>
      requireField(badge, field, `badge ${badge.id || index}:${field}`));
    if (badgeIds.has(badge.id)) {
      errors.push(`Duplicate badge id: ${badge.id}`);
    }
    badgeIds.add(badge.id);
    if (!Number.isFinite(badge.threshold_xp) || badge.threshold_xp < 0) {
      errors.push(`Badge ${badge.id} must define a non-negative threshold_xp`);
    }
  });
}

const moduleIds = new Set();
const moduleSlugs = new Set();
const actualModules = modules.map(moduleSummary);

for (const module of actualModules) {
  ['id', 'slug', 'title', 'summary', 'order', 'clo_ids', 'module_kind', 'widgets'].forEach((field) => {
    requireField(module, field, `module ${module.slug}:${field}`);
  });
  if (moduleIds.has(module.id)) errors.push(`Duplicate module id: ${module.id}`);
  if (moduleSlugs.has(module.slug)) errors.push(`Duplicate module slug: ${module.slug}`);
  moduleIds.add(module.id);
  moduleSlugs.add(module.slug);

  const sourceRefs = Array.isArray(module.source_refs) ? module.source_refs : [];
  sourceRefs.forEach((ref, index) => {
    if (!ref || typeof ref !== 'object') {
      errors.push(`Module ${module.slug} source_refs[${index}] must be an object`);
      return;
    }
    requireField(ref, 'file', `module ${module.slug} source_refs[${index}]:file`);
    requireField(ref, 'kind', `module ${module.slug} source_refs[${index}]:kind`);
    if (!Array.isArray(ref.fills) || ref.fills.length === 0) {
      errors.push(`Module ${module.slug} source_refs[${index}] must define at least one fill target`);
    } else {
      ref.fills.forEach((fill) => {
        if (!SOURCE_REF_ALLOWED_FILLS.includes(fill)) {
          errors.push(`Module ${module.slug} source_refs[${index}] uses unsupported fill target "${fill}"`);
        }
      });
    }
    if (ref.kind === 'module-structure' && !String(ref.match || '').trim()) {
      errors.push(`Module ${module.slug} source_refs[${index}] with kind "module-structure" must define match`);
    }
    if (ref.kind === 'week-plan' && (!Array.isArray(ref.weeks) || ref.weeks.length === 0)) {
      errors.push(`Module ${module.slug} source_refs[${index}] with kind "week-plan" must define weeks`);
    }
  });
}

const cloIds = new Set();
for (const clo of config.clos) {
  ['id', 'label', 'bloom', 'assessment_tags'].forEach((field) => requireField(clo, field, `CLO ${clo.id || '<unknown>'}:${field}`));
  if (cloIds.has(clo.id)) errors.push(`Duplicate CLO id: ${clo.id}`);
  cloIds.add(clo.id);
}

for (const module of actualModules) {
  for (const cloId of module.clo_ids || []) {
    if (!cloIds.has(cloId)) {
      errors.push(`Module ${module.slug} references unknown CLO ${cloId}`);
    }
  }
}

const missionIds = new Set();
for (const mission of missions.missions || []) {
  ['mission_id', 'clo_id', 'module_id', 'mission_type', 'title', 'prompt', 'steps', 'rubric', 'threshold', 'confidence'].forEach((field) =>
    requireField(mission, field, `mission ${mission.mission_id || '<unknown>'}:${field}`));
  if (missionIds.has(mission.mission_id)) errors.push(`Duplicate mission id: ${mission.mission_id}`);
  missionIds.add(mission.mission_id);
  if (!cloIds.has(mission.clo_id)) errors.push(`Mission ${mission.mission_id} references unknown CLO ${mission.clo_id}`);
  if (!moduleIds.has(mission.module_id)) errors.push(`Mission ${mission.mission_id} references unknown module ${mission.module_id}`);
  if (typeof mission.confidence?.prompt !== 'string' || !mission.confidence.prompt.trim()) {
    errors.push(`Mission ${mission.mission_id} must define confidence.prompt for the self-assessment block`);
  }
  if (!Array.isArray(mission.confidence?.levels) || mission.confidence.levels.length === 0) {
    errors.push(`Mission ${mission.mission_id} must define confidence levels`);
  } else {
    const expectedLevels = [1, 2, 3, 4, 5];
    const normalizedLevels = mission.confidence.levels.map((level) => Number(level));
    const exactLevels = normalizedLevels.length === expectedLevels.length
      && normalizedLevels.every((level, index) => level === expectedLevels[index]);
    if (!exactLevels) {
      errors.push(`Mission ${mission.mission_id} must define confidence.levels as [1, 2, 3, 4, 5]`);
    }
  }
  if (!Array.isArray(mission.steps) || mission.steps.length === 0) {
    errors.push(`Mission ${mission.mission_id} must contain at least one step`);
  } else {
    mission.steps.forEach((step, index) => {
      ['id', 'title', 'prompt', 'process_prompt', 'process_options', 'reasoning_prompt', 'reasoning_options'].forEach((field) =>
        requireField(step, field, `mission ${mission.mission_id} step ${index + 1}:${field}`));
      if (!Array.isArray(step.process_options) || step.process_options.length === 0) {
        errors.push(`Mission ${mission.mission_id} step ${index + 1} is missing process options`);
      }
      if (!Array.isArray(step.reasoning_options) || step.reasoning_options.length === 0) {
        errors.push(`Mission ${mission.mission_id} step ${index + 1} is missing reasoning options`);
      }
      if (Array.isArray(step.process_options) && !step.process_options.some((option) => option.correct)) {
        errors.push(`Mission ${mission.mission_id} step ${index + 1} has no correct process option`);
      }
      if (Array.isArray(step.reasoning_options) && !step.reasoning_options.some((option) => option.correct)) {
        errors.push(`Mission ${mission.mission_id} step ${index + 1} has no correct reasoning option`);
      }
    });
  }
}

for (const item of resources.items || []) {
  ['id', 'topic', 'title', 'description', 'type', 'addedDate'].forEach((field) =>
    requireField(item, field, `resource ${item.id || '<unknown>'}:${field}`));
  if (item.path) {
    const resourcePath = path.join(courseDir, 'resources', item.path);
    if (!(await fileExists(resourcePath))) {
      errors.push(`Resource ${item.id} points to missing file ${resourcePath}`);
    }
  }
}

if (options.checkOutput) {
  const outputDir = await findOutputDir(config.course_id, courseDir, options.outputDir);
  const expectedPages = [
    'index.html',
    'intro.html',
    'lessons.html',
    'missions.html',
    path.join('content', 'index.html'),
    ...actualModules.map((module) => path.join('modules', module.slug, 'index.html')),
    path.join('data', 'course-index.json'),
    path.join('data', 'content-manifest.json'),
    path.join('data', 'course.config.json'),
  ];

  for (const page of expectedPages) {
    if (!(await fileExists(path.join(outputDir, page)))) {
      errors.push(`Missing generated output: ${page}`);
    }
  }

  const indexPath = path.join(outputDir, 'index.html');
  if (await fileExists(indexPath)) {
    const indexHtml = await fs.readFile(indexPath, 'utf8');
    if (!indexHtml.includes('id="identity-card"') || !indexHtml.includes('id="badge-showcase"') || !indexHtml.includes('id="progress"')) {
      errors.push('Generated index.html is missing the learner-home structure (identity, progress, or badge showcase)');
    }
    if (!indexHtml.includes('katex.min.css') || !indexHtml.includes('auto-render.min.js')) {
      errors.push('Generated output is missing the KaTeX assets required for LaTeX rendering');
    }
    if (hasMojibake(indexHtml)) {
      errors.push('Generated index.html still contains mojibake in learner-facing copy');
    }
  }

  const introPath = path.join(outputDir, 'intro.html');
  if (await fileExists(introPath)) {
    const introHtml = await fs.readFile(introPath, 'utf8');
    if (!introHtml.includes('id="intro-welcome"') || introHtml.includes('courses/') || hasToneLeak(introHtml)) {
      errors.push('Generated intro.html is missing the learner-facing intro skeleton or still exposes template-internal copy');
    }
    if (hasMojibake(introHtml)) {
      errors.push('Generated intro.html still contains mojibake in learner-facing copy');
    }
  }

  const lessonsPath = path.join(outputDir, 'lessons.html');
  if (await fileExists(lessonsPath)) {
    const lessonsHtml = await fs.readFile(lessonsPath, 'utf8');
    if (!lessonsHtml.includes('id="lessons-module-rail"') || !lessonsHtml.includes('id="lessons-roadmap"') || hasToneLeak(lessonsHtml)) {
      errors.push('Generated lessons.html is missing the module-based lessons skeleton');
    }
    if (hasMojibake(lessonsHtml)) {
      errors.push('Generated lessons.html still contains mojibake in learner-facing copy');
    }
  }

  const missionsPath = path.join(outputDir, 'missions.html');
  if (await fileExists(missionsPath)) {
    const missionsHtml = await fs.readFile(missionsPath, 'utf8');
    if (
      !missionsHtml.includes('id="missions-welcome"') ||
      !missionsHtml.includes('id="missions-self-assessment"') ||
      !missionsHtml.includes('id="missions-heatmap"') ||
      !missionsHtml.includes('id="missions-module-tabs"') ||
      !missionsHtml.includes('id="missions-next-step"') ||
      missionsHtml.includes('courses/') ||
      missionsHtml.includes('runtime generic') ||
      missionsHtml.includes('missions.json') ||
      hasToneLeak(missionsHtml)
    ) {
      errors.push('Generated missions.html is missing the learner-facing missions skeleton or still exposes template-internal copy');
    }
    if (hasMojibake(missionsHtml)) {
      errors.push('Generated missions.html still contains mojibake in learner-facing copy');
    }
  }

  const resourcesPath = path.join(outputDir, 'content', 'index.html');
  if (await fileExists(resourcesPath)) {
    const resourcesHtml = await fs.readFile(resourcesPath, 'utf8');
    if (hasInternalCoursesLeak(resourcesHtml) || hasToneLeak(resourcesHtml)) {
      errors.push('Generated resources page still exposes template-internal copy');
    }
    if (hasMojibake(resourcesHtml)) {
      errors.push('Generated resources page still contains mojibake in learner-facing copy');
    }
  }

  for (const module of actualModules) {
    const modulePath = path.join(outputDir, 'modules', module.slug, 'index.html');
    if (await fileExists(modulePath)) {
      const moduleHtml = await fs.readFile(modulePath, 'utf8');
      if (
        !moduleHtml.includes('id="module-at-a-glance"') ||
        !moduleHtml.includes('id="module-section-map"') ||
        !moduleHtml.includes('id="module-core-content"') ||
        !moduleHtml.includes('id="module-active-learning"') ||
        !moduleHtml.includes('id="module-checkpoints"') ||
        !moduleHtml.includes('id="module-next-step"') ||
        hasToneLeak(moduleHtml)
      ) {
        errors.push(`Generated module page ${module.slug} is missing the generic module-page skeleton`);
      }
      if (hasMojibake(moduleHtml)) {
        errors.push(`Generated module page ${module.slug} still contains mojibake in learner-facing copy`);
      }
    }
  }
}

config.modules.forEach((declared) => {
  if (!moduleIds.has(declared.id)) {
    warnings.push(`course.config.json declares module ${declared.id} but no matching markdown module was loaded`);
  }
});

if (warnings.length) {
  console.warn('Warnings:');
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (errors.length) {
  console.error('Validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validation passed for ${config.course_id} (${path.relative(process.cwd(), courseDir).replace(/\\/g, '/')})`);

