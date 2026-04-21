#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  COURSES_DIR,
  ensureDir,
  fileExists,
  slugify,
  writeJson,
  writeText,
  resolveCourseDir,
} from './lib/course-lib.mjs';

export function usage() {
  console.log(`usage:
  node tools/init-new-course.mjs --spec <path> [--course-dir <path>] [--force] [--dry-run]
  node tools/init-new-course.mjs --example
  node tools/init-new-course.mjs --write-example <path>

options:
  --spec <path>          Path to the init-course JSON spec
  --course-dir <path>    Target course directory (must stay under courses/)
  --force                Overwrite scaffold files and clear existing module markdown files
  --dry-run              Show planned actions without writing files
  --example              Print an example spec to stdout
  --write-example <path> Write an example spec file to disk
`);
}

function parseArgs(argv) {
  const options = {
    courseDir: null,
    force: false,
    dryRun: false,
    example: false,
    writeExample: null,
    specPath: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--force') {
      options.force = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--example') {
      options.example = true;
    } else if (arg === '--spec') {
      options.specPath = argv[index + 1];
      index += 1;
    } else if (arg === '--write-example') {
      options.writeExample = argv[index + 1];
      index += 1;
    } else if (arg === '--course-dir') {
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

export function exampleSpec() {
  return {
    course_id: 'discrete_math_foundations',
    course_name_th: 'Discrete Mathematics Foundations',
    course_name_en: 'Foundations of Discrete Mathematics',
    course_short_name: 'Discrete Math',
    instructor: 'Concept by Ajarn Sitthichok Songsaard',
    description: 'Starter scaffold for proof-oriented courses that use markdown modules, SBRA missions, and reusable interactive blocks.',
    theme: {
      brand_icon: 'D',
      accent: '#0ea5e9',
      accent_secondary: '#f97316',
    },
    features: {
      resources: true,
      missions: true,
      games: false,
    },
    widgets_enabled: [
      'quick-check',
      'definition-visualizer',
      'proof-unpack',
      'step-sequence',
      'sbra-sequence',
    ],
    lesson_completion_xp: 50,
    clos: [
      {
        id: 'CLO1',
        label: 'Explain and use core ideas of logic and mathematical reasoning.',
        bloom: 'Understand',
        assessment_tags: ['logic', 'definitions'],
      },
      {
        id: 'CLO2',
        label: 'Construct and analyze proof structure from definitions and assumptions.',
        bloom: 'Analyze',
        assessment_tags: ['proof', 'structure'],
      },
    ],
    modules: [
    {
      id: 'logic-propositions',
      slug: 'logic-propositions',
      title: 'Logic and Propositions',
      summary: 'Start with statements, truth values, connectives, and how formal expressions carry meaning.',
      clo_ids: ['CLO1'],
      module_kind: 'concept',
      widgets: ['quick-check', 'definition-visualizer', 'step-sequence'],
    },
    {
      id: 'proof-structure',
      slug: 'proof-structure',
      title: 'Proof Structure',
      summary: 'Turn definitions and conditions into proof structures that can be checked step by step.',
      clo_ids: ['CLO1', 'CLO2'],
      module_kind: 'proof',
        widgets: ['definition-visualizer', 'proof-unpack', 'quick-check'],
      },
    ],
    resources: [
      {
        id: 'logic-cheatsheet',
        topic: 'Logic and Propositions',
        title: 'Logic Cheatsheet',
        description: 'Quick summary of common logical connectives and statement patterns.',
        type: 'file',
        path: 'files/logic-cheatsheet.md',
        body: '# Logic Cheatsheet\n\n- `p -> q` is an implication.\n- `p <-> q` is a biconditional.\n',
      },
      {
        id: 'proof-note',
        topic: 'Proof Structure',
        title: 'Proof Module Authoring Note',
        description: 'Checklist of proof-oriented details to review before publishing.',
        type: 'note',
        body: 'Add at least one proof example tied to a real definition, then verify that every step still maps to the intended CLO.',
      },
    ],
  };
}

function normalizeHexColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim() : fallback;
}

function normalizeConfidenceLevels(levels, missionId) {
  const expected = [1, 2, 3, 4, 5];
  if (!Array.isArray(levels) || levels.length === 0) {
    return [...expected];
  }

  const normalized = levels.map((level) => Number(level));
  const exactMatch = normalized.length === expected.length
    && normalized.every((level, index) => level === expected[index]);

  if (!exactMatch) {
    throw new Error(`mission "${missionId}" must define confidence.levels as [1, 2, 3, 4, 5]`);
  }

  return normalized;
}

export function normalizeSpec(raw) {
  const spec = raw && typeof raw === 'object' ? raw : {};
  const clos = Array.isArray(spec.clos) ? spec.clos : [];
  const modules = Array.isArray(spec.modules) ? spec.modules : [];

  if (!spec.course_id) throw new Error('spec.course_id is required');
  if (!spec.course_name_th) throw new Error('spec.course_name_th is required');
  if (!spec.course_name_en) throw new Error('spec.course_name_en is required');
  if (!spec.course_short_name) throw new Error('spec.course_short_name is required');
  if (!spec.instructor) throw new Error('spec.instructor is required');
  if (clos.length === 0) throw new Error('spec.clos must contain at least one CLO');
  if (modules.length === 0) throw new Error('spec.modules must contain at least one module');

  const normalizedClos = clos.map((clo, index) => ({
    id: clo.id || `CLO${index + 1}`,
    label: clo.label || `Draft CLO ${index + 1}`,
    bloom: clo.bloom || 'Apply',
    assessment_tags: Array.isArray(clo.assessment_tags) && clo.assessment_tags.length > 0
      ? clo.assessment_tags
      : ['draft'],
  }));

  const duplicateCloIds = normalizedClos
    .map((clo) => clo.id)
    .filter((id, index, arr) => arr.indexOf(id) !== index);
  if (duplicateCloIds.length > 0) {
    throw new Error(`Duplicate CLO ids in spec: ${[...new Set(duplicateCloIds)].join(', ')}`);
  }

  const cloIds = new Set(normalizedClos.map((clo) => clo.id));

  const normalizedModules = modules.map((module, index) => {
    const title = module.title || `Module ${index + 1}`;
    const derivedSlug = module.slug || slugify(module.id || title);
    if (!derivedSlug) {
      throw new Error(`module "${title}" needs an explicit slug or ASCII-friendly id`);
    }
    const slug = derivedSlug;
    const clo_ids = Array.isArray(module.clo_ids) && module.clo_ids.length > 0
      ? module.clo_ids
      : [normalizedClos[0].id];

    for (const cloId of clo_ids) {
      if (!cloIds.has(cloId)) {
        throw new Error(`module "${title}" references unknown CLO "${cloId}"`);
      }
    }

    const moduleKind = ['concept', 'application', 'proof'].includes(module.module_kind)
      ? module.module_kind
      : index % 2 === 0 ? 'concept' : 'proof';

    const widgets = Array.isArray(module.widgets) && module.widgets.length > 0
      ? module.widgets
      : moduleKind === 'proof'
        ? ['definition-visualizer', 'proof-unpack', 'quick-check']
        : ['quick-check', 'parameter-playground'];

    return {
      id: module.id || slug,
      slug,
      title,
      summary: module.summary || `Draft module for ${title}`,
      order: Number.isFinite(module.order) ? module.order : index + 1,
      clo_ids,
      module_kind: moduleKind,
      widgets,
      body_markdown: typeof module.body_markdown === 'string' ? module.body_markdown.trim() : '',
      draft_goal: module.draft_goal || '',
      content_outline: Array.isArray(module.content_outline) ? module.content_outline : [],
      quick_check: module.quick_check && typeof module.quick_check === 'object' ? module.quick_check : null,
      source_refs: Array.isArray(module.source_refs) ? module.source_refs : [],
    };
  }).sort((a, b) => a.order - b.order);

  const duplicateModuleIds = normalizedModules
    .map((module) => module.id)
    .filter((id, index, arr) => arr.indexOf(id) !== index);
  if (duplicateModuleIds.length > 0) {
    throw new Error(`Duplicate module ids in spec: ${[...new Set(duplicateModuleIds)].join(', ')}`);
  }

  const duplicateModuleSlugs = normalizedModules
    .map((module) => module.slug)
    .filter((slug, index, arr) => arr.indexOf(slug) !== index);
  if (duplicateModuleSlugs.length > 0) {
    throw new Error(`Duplicate module slugs in spec: ${[...new Set(duplicateModuleSlugs)].join(', ')}`);
  }

  const moduleIds = new Set(normalizedModules.map((module) => module.id));

  const widgetsEnabled = Array.isArray(spec.widgets_enabled) && spec.widgets_enabled.length > 0
    ? spec.widgets_enabled
    : [...new Set(normalizedModules.flatMap((module) => module.widgets).concat(spec.features?.missions === false ? [] : ['sbra-sequence']))];

  const resources = Array.isArray(spec.resources) ? spec.resources : [];
  const normalizedResources = resources.map((resource, index) => ({
    id: resource.id || `resource-${index + 1}`,
    topic: resource.topic || normalizedModules[Math.min(index, normalizedModules.length - 1)].title,
    title: resource.title || `Resource ${index + 1}`,
    description: resource.description || 'Supporting material for review, reinforcement, or extension of this course.',
    type: resource.type || (resource.path ? 'file' : 'note'),
    addedDate: resource.addedDate || new Date().toISOString().slice(0, 10),
    path: resource.path || null,
    url: resource.url || null,
    body: resource.body || '',
  }));

  const features = {
    resources: spec.features?.resources ?? true,
    missions: spec.features?.missions ?? true,
    games: spec.features?.games ?? false,
  };

  return {
    course_id: spec.course_id,
    course_name_th: spec.course_name_th,
    course_name_en: spec.course_name_en,
    course_short_name: spec.course_short_name,
    instructor: spec.instructor,
    description: spec.description || `Draft course scaffold for ${spec.course_name_en}`,
    theme: {
      brand_icon: spec.theme?.brand_icon || 'โ',
      accent: normalizeHexColor(spec.theme?.accent, '#22d3ee'),
      accent_secondary: normalizeHexColor(spec.theme?.accent_secondary, '#8b5cf6'),
    },
    features,
    widgets_enabled: widgetsEnabled,
    lesson_completion_xp: Number.isFinite(spec.lesson_completion_xp) ? spec.lesson_completion_xp : 40,
    badges: Array.isArray(spec.badges) ? spec.badges : defaultBadges(spec.course_short_name, normalizedModules, features),
    clos: normalizedClos,
    modules: normalizedModules,
    resources: normalizedResources,
    missions: Array.isArray(spec.missions)
      ? normalizeMissions(spec.missions, cloIds, moduleIds)
      : buildDraftMissions(normalizedModules, normalizedClos, spec.course_id, features),
  };
}

function normalizeMissions(missions, cloIds, moduleIds) {
  const normalized = missions.map((mission, index) => {
    const missionId = mission.mission_id || `mission-${index + 1}`;
    const cloId = mission.clo_id;
    const moduleId = mission.module_id;

    if (!cloId || !cloIds.has(cloId)) {
      throw new Error(`mission "${missionId}" references unknown clo_id "${cloId || ''}"`);
    }
    if (!moduleId || !moduleIds.has(moduleId)) {
      throw new Error(`mission "${missionId}" references unknown module_id "${moduleId || ''}"`);
    }

    const steps = Array.isArray(mission.steps) && mission.steps.length > 0
      ? mission.steps
      : buildDraftMissions([{ id: moduleId, slug: moduleId, title: mission.title || `Mission ${index + 1}` }], [{ id: cloId }], 'draft', { missions: true })[0].steps;

    const normalizedSteps = steps.map((step, stepIndex) => normalizeMissionStep(step, missionId, stepIndex));

    return {
      mission_id: missionId,
      clo_id: cloId,
      module_id: moduleId,
      title: mission.title || `Mission ${index + 1}`,
      mission_type: mission.mission_type || 'sbra-step-based-reasoning',
      bloom_level: Number.isFinite(mission.bloom_level) ? mission.bloom_level : 3,
      xp: Number.isFinite(mission.xp) ? mission.xp : 120,
      rubric: Array.isArray(mission.rubric) && mission.rubric.length > 0
        ? mission.rubric
        : ['Fill in the mission rubric before publishing.'],
      threshold: mission.threshold && typeof mission.threshold === 'object'
        ? mission.threshold
        : { min_steps_mastered: normalizedSteps.length },
      prompt: mission.prompt || `Fill in the main prompt for mission "${missionId}".`,
      strategy_prompt: mission.strategy_prompt || 'Fill in a strategy prompt that reflects the reasoning pattern for this mission.',
      confidence: mission.confidence && typeof mission.confidence === 'object'
        ? {
            prompt: mission.confidence.prompt || 'After completing all steps, how confident are you in your final answer?',
            levels: normalizeConfidenceLevels(mission.confidence.levels, missionId),
          }
        : {
            prompt: 'After completing all steps, how confident are you in your final answer?',
            levels: [1, 2, 3, 4, 5],
          },
      steps: normalizedSteps,
    };
  });

  const duplicateMissionIds = normalized
    .map((mission) => mission.mission_id)
    .filter((id, index, arr) => arr.indexOf(id) !== index);
  if (duplicateMissionIds.length > 0) {
    throw new Error(`Duplicate mission ids in spec: ${[...new Set(duplicateMissionIds)].join(', ')}`);
  }

  return normalized;
}

function normalizeMissionStep(step, missionId, stepIndex) {
  const prefix = `${missionId}-step-${stepIndex + 1}`;
  const processOptions = Array.isArray(step.process_options) && step.process_options.length > 0
    ? step.process_options
    : [];
  const reasoningOptions = Array.isArray(step.reasoning_options) && step.reasoning_options.length > 0
    ? step.reasoning_options
    : [];

  if (!processOptions.some((option) => option.correct)) {
    throw new Error(`mission "${missionId}" step ${stepIndex + 1} must contain at least one correct process option`);
  }
  if (!reasoningOptions.some((option) => option.correct)) {
    throw new Error(`mission "${missionId}" step ${stepIndex + 1} must contain at least one correct reasoning option`);
  }

  return {
    id: step.id || `step-${stepIndex + 1}`,
    title: step.title || `Step ${stepIndex + 1}`,
    prompt: step.prompt || `Fill in the prompt for step ${stepIndex + 1}.`,
    process_prompt: step.process_prompt || 'Choose the process that best fits this step.',
    process_options: processOptions.map((option, optionIndex) => ({
      id: option.id || `${prefix}-process-${optionIndex + 1}`,
      text: option.text || `Process option ${optionIndex + 1}`,
      correct: Boolean(option.correct),
      feedback: option.feedback || 'Fill in feedback for this process option.',
    })),
    reasoning_prompt: step.reasoning_prompt || 'Choose the reasoning that best supports the selected process.',
    reasoning_options: reasoningOptions.map((option, optionIndex) => ({
      id: option.id || `${prefix}-reasoning-${optionIndex + 1}`,
      text: option.text || `Reasoning option ${optionIndex + 1}`,
      correct: Boolean(option.correct),
      feedback: option.feedback || 'Fill in feedback for this reasoning option.',
    })),
    hint: typeof step.hint === 'string' ? step.hint : '',
  };
}

function defaultBadges(courseShortName, modules, features) {
  const firstModule = modules[0];
  const lastModule = modules[modules.length - 1];
  const badges = [
    {
      id: 'starter',
      emoji: 'S',
      name: 'Starter',
      req: 'Start earning XP and open the first lesson of the course.',
      threshold_xp: 0,
    },
    {
      id: 'explorer',
      emoji: 'E',
      name: 'Explorer',
      req: 'Reach 120 XP and complete at least one module.',
      threshold_xp: 120,
      required_modules_count: 1,
    },
  ];

  if (firstModule) {
    badges.push({
      id: `${firstModule.slug}-specialist`,
      emoji: firstModule.module_kind === 'proof' ? 'P' : 'M',
      name: `${firstModule.title} Specialist`,
      req: `Reach 240 XP and complete module ${firstModule.title}.`,
      threshold_xp: 240,
      required_modules: [firstModule.slug],
    });
  }

  if (lastModule && lastModule.slug !== firstModule?.slug) {
    badges.push({
      id: `${lastModule.slug}-specialist`,
      emoji: lastModule.module_kind === 'proof' ? 'F' : 'A',
      name: `${lastModule.title} Specialist`,
      req: `Reach 360 XP and complete module ${lastModule.title}.`,
      threshold_xp: 360,
      required_modules: [lastModule.slug],
    });
  }

  badges.push({
    id: 'master',
    emoji: 'M',
    name: `${courseShortName} Master`,
    req: features.missions ? 'Reach 600 XP and finish missions with at least 80% accuracy.' : 'Reach 600 XP and complete all modules.',
    threshold_xp: 600,
    required_accuracy: features.missions ? 80 : undefined,
  });

  return badges;
}

function buildDraftMissions(modules, clos, courseId, features) {
  if (!features.missions) {
    return [];
  }

  return modules.map((module, index) => {
    const cloId = module.clo_ids[0] || clos[0].id;
    return {
      mission_id: `draft-${courseId}-${module.slug}`,
      clo_id: cloId,
      module_id: module.id,
      title: `SBRA Draft: ${module.title}`,
      mission_type: 'sbra-step-based-reasoning',
      bloom_level: module.module_kind === 'proof' ? 4 : 3,
      xp: 120 + (index * 10),
      rubric: [
        'Select a process in each step that matches the target task and CLO.',
        'Choose reasoning that explains why the selected process fits the task.',
        'Name at least one misconception or risk point that the learner should watch for.',
      ],
      threshold: {
        min_steps_mastered: 3,
      },
      prompt: `Draft mission for module "${module.title}". Replace this with a real task after reviewing the course materials.`,
      strategy_prompt: 'Add a strategy prompt that reflects the intended reasoning pattern for this course.',
      confidence: {
        prompt: 'After completing all steps, how confident are you in your final answer?',
        levels: [1, 2, 3, 4, 5],
      },
      steps: [
        {
          id: 'step-1',
          title: 'Step 1: Plan',
          prompt: `What is the best way to begin reasoning about module "${module.title}"?`,
          process_prompt: 'Choose the strongest opening process.',
          process_options: [
            { id: 'correct-process', text: 'Start from the key definition or concept structure behind the module.', correct: true, feedback: 'This keeps the reasoning anchored to the intended CLO.' },
            { id: 'wrong-process-1', text: 'Memorize one worked example and generalize immediately.', correct: false, feedback: 'One example is not enough for a reasoning-heavy task.' },
            { id: 'wrong-process-2', text: 'Jump to the final answer without showing the chain of thought.', correct: false, feedback: 'The reasoning must stay inspectable step by step.' },
          ],
          reasoning_prompt: 'Which reasoning best justifies that process?',
          reasoning_options: [
            { id: 'correct-reasoning', text: 'Because it aligns the work with the module concept and the CLO from the start.', correct: true, feedback: 'This explains why the opening process fits the task.' },
            { id: 'wrong-reasoning-1', text: 'Because the fastest method is always the most reliable.', correct: false, feedback: 'Speed alone is not a valid academic justification.' },
            { id: 'wrong-reasoning-2', text: 'Because the task structure does not matter when choosing a method.', correct: false, feedback: 'The structure of the task matters when selecting a method.' },
          ],
          hint: 'Ask first which concept or strategy this task is actually trying to measure.',
        },
        {
          id: 'step-2',
          title: 'Step 2: Analyze',
          prompt: 'What should the learner keep checking so the reasoning stays aligned with the task?',
          process_prompt: 'Choose the best analysis process.',
          process_options: [
            { id: 'correct-process', text: 'Check that every step still matches the active definition, condition, or theorem setup.', correct: true, feedback: 'This keeps the reasoning aligned with the real task constraints.' },
            { id: 'wrong-process-1', text: 'Only compare the answer shape with a familiar example.', correct: false, feedback: 'The reasoning should be checked against the real conditions, not surface similarity.' },
            { id: 'wrong-process-2', text: 'Skip unclear points and hope the conclusion still works out.', correct: false, feedback: 'Pause and resolve unclear points before moving forward.' },
          ],
          reasoning_prompt: 'Which reasoning best supports that analysis process?',
          reasoning_options: [
            { id: 'correct-reasoning', text: 'Because strong reasoning keeps checking the main condition all the way through.', correct: true, feedback: 'This protects the argument from drifting away from the target claim.' },
            { id: 'wrong-reasoning-1', text: 'Because a correct-looking overview removes the need to inspect each step.', correct: false, feedback: 'A plausible overview can still hide a broken step.' },
            { id: 'wrong-reasoning-2', text: 'Because reasoning does not need to stay tied to definitions once it begins.', correct: false, feedback: 'Definitions and conditions still matter throughout the argument.' },
          ],
          hint: 'Ask whether each line still depends on the correct definition or condition.',
        },
        {
          id: 'step-3',
          title: 'Step 3: Conclude',
          prompt: 'How should the solution close so the learner clearly answers the target outcome of the module?',
          process_prompt: 'Choose the best closing process.',
          process_options: [
            { id: 'correct-process', text: 'Summarize the result and link it back to the claim or learning target.', correct: true, feedback: 'A strong conclusion reconnects the work to the learning outcome.' },
            { id: 'wrong-process-1', text: 'End with "it is obvious" and stop.', correct: false, feedback: 'The conclusion still needs a clear connection to the target claim.' },
            { id: 'wrong-process-2', text: 'Add a new example instead of closing the original claim.', correct: false, feedback: 'Extra examples do not replace a proper conclusion.' },
          ],
          reasoning_prompt: 'Which reasoning best supports that closing process?',
          reasoning_options: [
            { id: 'correct-reasoning', text: 'Because the ending should show that the work really answers the intended task or CLO.', correct: true, feedback: 'This gives the conclusion a clear academic role.' },
            { id: 'wrong-reasoning-1', text: 'Because the final line does not need to connect to the task goal.', correct: false, feedback: 'That makes the answer stop without clearly resolving the target.' },
            { id: 'wrong-reasoning-2', text: 'Because adding more examples is the same as closing the original claim.', correct: false, feedback: 'Extra examples do not replace a real conclusion.' },
          ],
          hint: 'Ask whether the final line clearly reconnects to the main question or CLO.',
        },
      ],
    };
  });
}

function widgetBlock(type, module, quickCheckOverride = null) {
  if (type === 'graph-explorer') {
    return `:::graph-explorer
{
  "title": "${module.title}: Graph Explorer",
  "description": "Replace the expression and parameters so they match the real concept of this module.",
  "expression": "a * x + b",
  "formula": "y = ax + b",
  "x_range": [-6, 6],
  "y_range": [-6, 6],
  "parameters": {
    "a": { "label": "a", "min": -3, "max": 3, "step": 1, "value": 1 },
    "b": { "label": "b", "min": -4, "max": 4, "step": 1, "value": 0 }
  }
}
:::`;
  }

  if (type === 'parameter-playground') {
    return `:::parameter-playground
{
  "title": "${module.title}: Parameter Playground",
  "description": "Use this block to vary parameters and explain what changes in the result.",
  "expression": "a * (x - h)^2 + k",
  "formula": "y = a(x - h)^2 + k",
  "x_range": [-8, 8],
  "y_range": [-6, 12],
  "parameters": {
    "a": { "label": "a", "min": -3, "max": 3, "step": 0.5, "value": 1 },
    "h": { "label": "h", "min": -4, "max": 4, "step": 1, "value": 0 },
    "k": { "label": "k", "min": -4, "max": 4, "step": 1, "value": 0 }
  },
  "prompts": [
    "Which parameter creates the clearest visible change?",
    "Which quantity should learners describe alongside the graph?",
    "Where should this module call out a likely misconception?"
  ]
}
:::`;
  }

  if (type === 'definition-visualizer') {
    return `:::definition-visualizer
{
  "title": "${module.title}: Definition Visualizer",
  "description": "Break the definition into reviewable parts that a learner can inspect one by one.",
  "items": [
    {
      "label": "Key terms in the definition",
      "detail": "Add the real definition text and point out words that learners often misunderstand."
    },
    {
      "label": "Conditions that must hold",
      "detail": "List the conditions that cannot be dropped, with a short note about what breaks if one is missing."
    },
    {
      "label": "Examples and non-examples",
      "detail": "Add one valid example and one near-miss that helps learners test the boundary."
    }
  ]
}
:::`;
  }

  if (type === 'proof-unpack') {
    return `:::proof-unpack
{
  "title": "${module.title}: Proof Unpack",
  "description": "Split a proof into reasoning segments that can be reviewed step by step.",
  "steps": [
    {
      "label": "Start from the setup",
      "detail": "Write the correct definition, assumption, or theorem setup that starts the argument."
    },
    {
      "label": "Move through the argument",
      "detail": "Add the key transformation or logical move that carries the reasoning forward."
    },
    {
      "label": "Close the claim",
      "detail": "Reconnect the final result to the target claim or CLO."
    }
  ]
}
:::`;
  }

  if (type === 'step-sequence') {
    return `:::step-sequence
{
  "title": "${module.title}: Step Sequence",
  "description": "Guide the learner through a short, ordered reasoning sequence.",
  "steps": [
    {
      "label": "Step 1",
      "detail": "Add the starting condition, question, or input."
    },
    {
      "label": "Step 2",
      "detail": "Describe the key relation, condition, or operation to inspect."
    },
    {
      "label": "Step 3",
      "detail": "Summarize the result and connect it back to the core concept."
    }
  ]
}
:::`;
  }

  const quickCheck = quickCheckOverride || {
    question: `What is a good quick-check question for module "${module.title}"?`,
    choices: [
      { label: 'Correct answer', correct: true },
      { label: 'Answer that is still incomplete', correct: false },
      { label: 'Answer that reflects a misconception', correct: false },
    ],
    explanation: 'Replace this quick-check with a question tied to the real concept of the module.',
  };

  return `:::quick-check
${JSON.stringify(quickCheck, null, 2)}
:::`;
}

function buildModuleBody(module) {
  if (module.body_markdown) {
    return module.body_markdown;
  }

  const cloLine = module.clo_ids.length > 0 ? module.clo_ids.join(', ') : 'TBD';
  const outline = module.content_outline.length > 0
    ? module.content_outline.map((item) => `- ${item}`).join('\n')
    : '- Add the learning targets for this module.\n- Add a main example or anchor problem.\n- Add the point that learners most often misunderstand.';

  const sections = [
    `# ${module.title}`,
    '',
    `${module.summary}`,
    '',
    '## Module Goals',
    '',
    `- Module kind: \`${module.module_kind}\``,
    `- CLOs: \`${cloLine}\``,
    module.draft_goal ? `- Focus: ${module.draft_goal}` : '- Focus: add the main understanding goal for this module.',
    '',
    '## Starter Content Outline',
    '',
    outline,
    '',
    '## Authoring Notes',
    '',
    '- Add definitions, examples, and explanations that help learners build the idea step by step.',
    '- If the module has common misconceptions, add contrasts, non-examples, or reflective questions.',
    '- If the module will connect to an SBRA mission, tie the core idea here to the same reasoning move.',
    '',
  ];

  for (const widget of module.widgets) {
    sections.push('## Interactive Draft');
    sections.push('');
    sections.push(widgetBlock(widget, module, module.quick_check));
    sections.push('');
  }

  return sections.join('\n');
}

function buildModuleMapResource(modules, clos) {
  const moduleLines = modules.map((module) => `- ${String(module.order).padStart(2, '0')}. ${module.title} | kind: ${module.module_kind} | CLOs: ${module.clo_ids.join(', ')}`).join('\n');
  const cloLines = clos.map((clo) => `- ${clo.id}: ${clo.label}`).join('\n');
  return `# Module Map

## CLO Overview

${cloLines}

## Module Overview

${moduleLines}

## Notes

- Use this page to see how each module connects back to the course CLOs.
- If a learner wants to study in order, start from the first module and continue in sequence.
`;
}

function buildGettingStartedResource(course, courseDir) {
  return `# Getting Started

- Course ID: \`${course.course_id}\`
- Course Name: ${course.course_name_th} / ${course.course_name_en}
- Instructor: ${course.instructor}

## Next Steps

1. Start on the intro page to see the overall course shape.
2. Go to lessons if you want to study module by module.
3. Open missions when you are ready to practice and self-assess.
4. Use resources as the place to review during study or before missions.
`;
}

function buildGeneratedReadmeFirst() {
  return `# README FIRST

Read this file before doing any work in this course.

## Scope Law

- Work only inside \`courses/<course-id>/\`
- Build output only into \`courses/<course-id>/output/\`
- Do not use \`examples/\` as the main source
- Do not patch \`courses/<course-id>/output/\` to hide source problems
- Keep learner-facing copy friendly and avoid leaking system wording into output

## Read Order

1. \`generated/workflow/CURRENT_TASK.md\`
2. \`generated/workflow/DECISION_LOG.md\`
3. \`generated/workflow/COURSE_BRIEF.md\`
4. \`generated/workflow/COURSE_PLAN.md\`
5. \`generated/workflow/MODULE_AUTHORING_QUEUE.md\` or \`generated/workflow/SBRA_DESIGN_LOG.md\`

## TQF3 Intake Rule

If this course starts from TQF3 or a similar weekly teaching plan:

1. classify the source into data types first
2. map those data types to placeholder targets
3. review Week-to-Module Map logic before deep module or mission authoring
4. review Assessment Evidence Map logic before real mission design
5. check whether the minimum markdown package in \`docs/new-course-template/TQF3_MD_PACKAGE.md\` is already prepared in \`materials/processed/\`
6. treat the Assessment Evidence Map as the bridge \`CLO -> Bloom -> module -> evidence type -> badge hook\`, not as real mission content yet

## Bootstrap Rule

If the course currently has only TQF3-based source:

1. scaffold and frame the course anyway
2. build output from the current source state
3. treat incomplete inside content as normal at this stage
4. add better materials in later rounds instead of waiting for perfect source first

## Response Rule

After each important task, summarize:

1. What was done
2. What result was produced
3. What should happen next
4. Whether the user agrees or wants changes

## Stop And Ask Rule

Stop and ask the user before changing:

- CLO wording or Bloom level
- module map or module order
- assessment direction
- SBRA direction or rubric logic
`;
}

function buildGeneratedCurrentTask(courseDir, course) {
  const relativeCourseDir = path.relative(process.cwd(), courseDir).replace(/\\/g, '/');
  return `# CURRENT TASK

## Current Goal

- task: Start the course in a controlled way by mapping source inputs before deep authoring
- requested by: User
- date: ${new Date().toISOString().slice(0, 10)}

## Scope

- course_dir: \`${relativeCourseDir}\`
- output_dir: \`courses/${course.course_id}/output/\`
- files to read first:
  - \`generated/workflow/README_FIRST.md\`
  - \`generated/workflow/DECISION_LOG.md\`
  - \`generated/workflow/COURSE_BRIEF.md\`
  - \`generated/workflow/COURSE_PLAN.md\`
- files expected to change:
  - \`generated/workflow/CURRENT_TASK.md\`
  - \`generated/workflow/COURSE_PLAN.md\`
  - \`generated/workflow/DECISION_LOG.md\`
  - \`generated/workflow/COURSE_BRIEF.md\`
  - \`generated/**/*.md\`

## Do Now

1. Read the generated docs first
2. If the source starts from TQF3, check whether the minimum markdown package exists in \`materials/processed/\`
3. Classify the source into data types and map them to \`index / intro / lessons / module / missions / resources\`
4. Build output from the current source state instead of waiting for every inside material to be complete
5. Record what is still missing in \`materials/processed/\` and the generated docs
6. Plan the next material-addition round after the first honest output exists
7. Update generated docs after the work is done

## TQF3 Package Check

- law reference: \`docs/new-course-template/TQF3_MD_PACKAGE.md\`
- assessment map reference: \`docs/new-course-template/ASSESSMENT_EVIDENCE_MAP.md\`
- minimum package files expected in \`materials/processed/\`:
  - \`tqf3-course-anchor.md\`
  - \`tqf3-clo-map.md\`
  - \`tqf3-week-to-module-map.md\`
  - \`tqf3-assessment-evidence-map.md\`
- recommended support files:
  - \`tqf3-teaching-method-map.md\`
  - \`tqf3-resource-seed-list.md\`
- current package status:
  - present:
  - missing:

## Stop And Ask If

- the CLOs need to change
- the module structure needs to change
- the assessment model needs to change
- the SBRA direction needs to change

## Definition Of Done For This Task

- the first framing pass is clear enough that Codex is not guessing at module or mission structure
- the first output can be built honestly from the current source state, even if inside content is still partial
- the Assessment Evidence Map direction is clear enough to connect CLO, Bloom, module, evidence type, and badge hook
- generated docs reflect the latest state
- if source changed materially, build and validate were run

## Response Back To User

- What was done:
- Result:
- Next step:
- Agree or want changes:
`;
}

function buildGeneratedDecisionLog(course) {
  return `# DECISION LOG

## Locked Decisions

- decision: lesson content uses \`modules/*.md\` as the main source
  source: user confirmed
  impact: Codex must edit source, not output

- decision: mission branching uses \`missions/missions.json\` as the main source
  source: user confirmed
  impact: SBRA and missions should be changed there

- decision: new courses must live under \`courses/<course-id>/\`
  source: user confirmed
  impact: keep the repo organized and multi-course ready

- decision: outputs must live under \`courses/<course-id>/output/\`
  source: user confirmed
  impact: do not write public files to the repo root

- decision: top-level pages should keep the same overall structure first
  source: user confirmed
  impact: \`index / intro / lessons / missions / resources\` stays as the base UX

- decision: if a course starts from TQF3, Codex should map source data types and review Week-to-Module logic before deep authoring
  source: repo workflow
  impact: do not jump from weekly topics straight to modules or SBRA items

## Open Decisions

- decision: which module should be refined next
  why it matters: it decides the next authoring focus
  recommended default: start with the first incomplete module in the queue
  user confirmation needed: yes

- decision: which SBRA mission should be authored next
  why it matters: it decides the next assessment focus
  recommended default: start with the first draft mission in the log
  user confirmation needed: yes

## Course Snapshot

- course_id: \`${course.course_id}\`
- course_name: ${course.course_name_en}
- module_count: ${course.modules.length}
- clo_count: ${course.clos.length}
`;
}

function buildGeneratedCourseBrief(course) {
  const moduleLines = course.modules.map((module) => `- ${module.id}: ${module.title}`).join('\n');
  const cloLines = course.clos.map((clo) => `- ${clo.id}: ${clo.label} (${clo.bloom})`).join('\n');
  return `# COURSE BRIEF

## Course Identity

- course_id: \`${course.course_id}\`
- course_name_th: ${course.course_name_th}
- course_name_en: ${course.course_name_en}
- course_short_name: ${course.course_short_name}
- instructor: ${course.instructor}

## Course Purpose

- description: ${course.description}

## CLO Snapshot

${cloLines}

## Module Snapshot

${moduleLines}

## Features

- resources: ${course.features.resources}
- missions: ${course.features.missions}
- games: ${course.features.games}

## Open Notes

- add source inventory from \`materials/processed/\`
- if the source starts from TQF3, note which package files from \`docs/new-course-template/TQF3_MD_PACKAGE.md\` are present or missing
- add special teaching constraints for this course
- add any instructor preferences that Codex should follow
`;
}

function buildGeneratedCoursePlan(courseDir, course) {
  const relativeCourseDir = path.relative(process.cwd(), courseDir).replace(/\\/g, '/');
  return `# COURSE PLAN

## Scope

- course_dir: \`${relativeCourseDir}\`
- output_dir: \`courses/${course.course_id}/output/\`
- current phase: kickoff

## Deliverables

- \`course.config.json\`
- \`modules/*.md\`
- \`missions/missions.json\`
- \`resources/manifest.json\`
- \`generated/*.md\`

## Phase Plan

### Phase 1

- objective: lock source framing, TQF3 mapping, and working docs
- deliverable: clean course source under \`${relativeCourseDir}\` with clear data-type mapping and week-to-module logic
- status: in_progress

### Phase 2

- objective: refine modules after the framing gates are clear
- deliverable: publish-ready \`modules/*.md\`
- status: pending

### Phase 3

- objective: refine SBRA and missions after assessment evidence is clear
- deliverable: strong \`missions/missions.json\`
- status: pending

### Phase 4

- objective: build and validate output
- deliverable: output under \`courses/${course.course_id}/output/\`
- status: pending

## Next Action

- next task: if the source starts from TQF3, do the first framing pass: data-type mapping, Week-to-Module review, and Assessment Evidence review
- prep law: if the source starts from TQF3, prepare the minimum markdown package in \`materials/processed/\` before deep authoring
- assessment law: use the Assessment Evidence Map as the bridge from TQF3 assessment structure into mission framing and badge direction
- validation command: run validation only after real source or schema changes
`;
}

function buildGeneratedModuleQueue(course) {
  const rows = course.modules.map((module) => {
    const sourceRefs = Array.isArray(module.source_refs) && module.source_refs.length > 0
      ? module.source_refs.map((ref) => {
        const kind = ref.kind || 'source';
        if (Array.isArray(ref.weeks) && ref.weeks.length > 0) {
          return `${kind}:${ref.weeks.join(',')}`;
        }
        if (ref.match) {
          return `${kind}:${ref.match}`;
        }
        return kind;
      }).join('; ')
      : '';
    return `| ${module.order} | ${module.id} | \`modules/${String(module.order).padStart(2, '0')}-${module.slug}.md\` | ${module.clo_ids.join(', ')} | ${module.widgets.join(', ')} | ${sourceRefs} | todo | |`;
  }).join('\n');
  return `# MODULE AUTHORING QUEUE

## Status Legend

- \`todo\`
- \`in_progress\`
- \`review\`
- \`done\`

## Queue

| order | module_id | module_file | linked_clos | widgets | source_refs | status | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## Authoring Notes

- pick one module at a time
- update this file after each real content change
- if the module map changes, ask the user first
`;
}

function buildGeneratedSbraLog(course) {
  const draftRows = course.features.missions
    ? course.modules.map((module, index) => `| draft-${index + 1} | ${module.id} | ${module.clo_ids[0]} | draft source | sbra-step-based-reasoning | draft | |`).join('\n')
    : '| no-missions | n/a | n/a | n/a | n/a | blocked | missions are disabled |';
  return `# SBRA DESIGN LOG

## Mission Queue

| mission_id | module_id | clo_id | problem_source | mission_type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
${draftRows}

## Design Rules

- each mission should test step-based process and reasoning
- each step should have good distractors
- add misconception tags when options are authored
- if SBRA direction changes, ask the user first
`;
}

function buildGeneratedReleaseChecklist(courseDir, course) {
  const relativeCourseDir = path.relative(process.cwd(), courseDir).replace(/\\/g, '/');
  return `# RELEASE CHECKLIST

## Source Check

- [ ] \`course.config.json\` reflects the real course
- [ ] \`modules/*.md\` match the intended module map
- [ ] \`missions/missions.json\` matches the intended SBRA design
- [ ] \`resources/manifest.json\` points to real files
- [ ] \`generated/*.md\` reflects the latest state

## Build Check

- [ ] run \`node tools/build-course.mjs --course-dir ${relativeCourseDir}\`
- [ ] run \`node tools/validate-course.mjs --course-dir ${relativeCourseDir}\`
- [ ] run \`node tools/validate-course.mjs --course-dir ${relativeCourseDir} --check-output\`

## Output Check

- [ ] output exists under \`courses/${course.course_id}/output/\`
- [ ] top-level pages were created
- [ ] module pages were created
- [ ] resource links work
`;
}

async function removeExistingModuleMarkdown(modulesDir) {
  const entries = await fs.readdir(modulesDir, { withFileTypes: true }).catch(() => []);
  const deletions = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      const target = path.join(modulesDir, entry.name);
      await fs.rm(target, { force: true });
      deletions.push(target);
    }
  }
  return deletions;
}

function buildPlan(courseDir, course) {
  const paths = {
    config: path.join(courseDir, 'course.config.json'),
    modulesDir: path.join(courseDir, 'modules'),
    missions: path.join(courseDir, 'missions', 'missions.json'),
    resourcesManifest: path.join(courseDir, 'resources', 'manifest.json'),
    resourcesRootDir: path.join(courseDir, 'resources'),
    resourcesFilesDir: path.join(courseDir, 'resources', 'files'),
    materialsRawDir: path.join(courseDir, 'materials', 'raw'),
    materialsProcessedDir: path.join(courseDir, 'materials', 'processed'),
    generatedDir: path.join(courseDir, 'generated'),
  };

  const moduleFiles = course.modules.map((module) => ({
    path: path.join(paths.modulesDir, `${String(module.order).padStart(2, '0')}-${module.slug}.md`),
    content: buildModuleFile(module),
  }));

  const manifestItems = [...course.resources];
  const resourceFileMap = new Map();

  const moduleMapPath = 'files/module-map.md';
  resourceFileMap.set(moduleMapPath, buildModuleMapResource(course.modules, course.clos));
  if (!manifestItems.some((item) => item.path === moduleMapPath)) {
    manifestItems.unshift({
      id: 'module-map',
      topic: 'Course Overview',
      title: 'Module Map',
      description: 'Overview of all modules and how they connect to course CLOs.',
      type: 'file',
      path: moduleMapPath,
      addedDate: new Date().toISOString().slice(0, 10),
    });
  }

  const gettingStartedPath = 'files/getting-started.md';
  resourceFileMap.set(gettingStartedPath, buildGettingStartedResource(course, courseDir));
  if (!manifestItems.some((item) => item.path === gettingStartedPath)) {
    manifestItems.unshift({
      id: 'getting-started',
      topic: 'Course Overview',
      title: 'Getting Started',
      description: 'Short guide for starting and navigating this course.',
      type: 'file',
      path: gettingStartedPath,
      addedDate: new Date().toISOString().slice(0, 10),
    });
  }

  for (const resource of course.resources) {
    if (resource.path) {
      resourceFileMap.set(resource.path, resource.body || `# ${resource.title}\n\nAdd the content for this resource before publishing.\n`);
    }
  }

  const generatedFileMap = new Map([
    ['workflow/README_FIRST.md', buildGeneratedReadmeFirst()],
    ['workflow/CURRENT_TASK.md', buildGeneratedCurrentTask(courseDir, course)],
    ['workflow/DECISION_LOG.md', buildGeneratedDecisionLog(course)],
    ['workflow/COURSE_BRIEF.md', buildGeneratedCourseBrief(course)],
    ['workflow/COURSE_PLAN.md', buildGeneratedCoursePlan(courseDir, course)],
    ['workflow/MODULE_AUTHORING_QUEUE.md', buildGeneratedModuleQueue(course)],
    ['workflow/SBRA_DESIGN_LOG.md', buildGeneratedSbraLog(course)],
    ['reviews/RELEASE_CHECKLIST.md', buildGeneratedReleaseChecklist(courseDir, course)],
  ]);

  return {
    paths,
    moduleFiles,
    configJson: {
      course_id: course.course_id,
      course_name_th: course.course_name_th,
      course_name_en: course.course_name_en,
      course_short_name: course.course_short_name,
      instructor: course.instructor,
      description: course.description,
      theme: course.theme,
      features: course.features,
      widgets_enabled: course.widgets_enabled,
      lesson_completion_xp: course.lesson_completion_xp,
      badges: course.badges,
      modules: course.modules.map(({ id, slug, title, summary, order, module_kind }) => ({ id, slug, title, summary, order, module_kind })),
      clos: course.clos,
    },
    missionsJson: {
      course_id: course.course_id,
      missions: course.missions,
    },
    resourcesManifestJson: {
      course_id: course.course_id,
      items: manifestItems.map((item) => ({
        id: item.id,
        topic: item.topic,
        title: item.title,
        description: item.description,
        type: item.type,
        addedDate: item.addedDate,
        ...(item.path ? { path: item.path } : {}),
        ...(item.url ? { url: item.url } : {}),
        ...(item.type === 'note' && item.body ? { body: item.body } : {}),
      })),
    },
    resourceFiles: [...resourceFileMap.entries()].map(([relativePath, content]) => ({
      path: path.join(paths.resourcesRootDir, relativePath),
      content,
    })),
    generatedFiles: [...generatedFileMap.entries()].map(([filename, content]) => ({
      path: path.join(paths.generatedDir, filename),
      content,
    })),
  };
}

async function detectConflicts(plan) {
  const existing = [];
  const fixedFiles = [
    plan.paths.config,
    plan.paths.missions,
    plan.paths.resourcesManifest,
    ...plan.generatedFiles.map((file) => file.path),
  ];

  for (const target of fixedFiles) {
    if (await fileExists(target)) {
      existing.push(target);
    }
  }

  const moduleEntries = await fs.readdir(plan.paths.modulesDir, { withFileTypes: true }).catch(() => []);
  for (const entry of moduleEntries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      existing.push(path.join(plan.paths.modulesDir, entry.name));
    }
  }

  return existing;
}

export async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.example) {
    console.log(JSON.stringify(exampleSpec(), null, 2));
    return;
  }

  if (options.writeExample) {
    const target = path.resolve(options.writeExample);
    await writeJson(target, exampleSpec());
    console.log(`Wrote example spec to ${target}`);
    return;
  }

  if (!options.specPath) {
    usage();
    process.exit(1);
  }

  const specPath = path.resolve(options.specPath);
  const rawSpec = JSON.parse(await fs.readFile(specPath, 'utf8'));
  const course = normalizeSpec(rawSpec);
  const resolvedCourseDir = resolveCourseDir(options.courseDir ? path.resolve(options.courseDir) : path.join(COURSES_DIR, course.course_id));
  const plan = buildPlan(resolvedCourseDir, course);

  const conflicts = await detectConflicts(plan);
  if (conflicts.length > 0 && !options.force) {
    console.error('Refusing to scaffold into a non-empty course directory without --force.');
    conflicts.forEach((conflict) => console.error(`- ${conflict}`));
    process.exit(1);
  }

  if (options.dryRun) {
    console.log(`Would scaffold course "${course.course_id}" into ${resolvedCourseDir}`);
    console.log(`- config: ${plan.paths.config}`);
    console.log(`- modules: ${plan.moduleFiles.length}`);
    plan.moduleFiles.forEach((moduleFile) => console.log(`  - ${moduleFile.path}`));
    console.log(`- missions: ${plan.paths.missions}`);
    console.log(`- resources manifest: ${plan.paths.resourcesManifest}`);
    plan.resourceFiles.forEach((resourceFile) => console.log(`  - resource file: ${resourceFile.path}`));
    plan.generatedFiles.forEach((generatedFile) => console.log(`  - generated file: ${generatedFile.path}`));
    return;
  }

  await ensureDir(resolvedCourseDir);
  await ensureDir(plan.paths.modulesDir);
  await ensureDir(path.dirname(plan.paths.missions));
  await ensureDir(path.dirname(plan.paths.resourcesManifest));
  await ensureDir(plan.paths.resourcesFilesDir);
  await ensureDir(plan.paths.materialsRawDir);
  await ensureDir(plan.paths.materialsProcessedDir);
  await ensureDir(plan.paths.generatedDir);

  let removedModules = [];
  if (options.force) {
    removedModules = await removeExistingModuleMarkdown(plan.paths.modulesDir);
  }

  await writeJson(plan.paths.config, plan.configJson);
  await writeJson(plan.paths.missions, plan.missionsJson);
  await writeJson(plan.paths.resourcesManifest, plan.resourcesManifestJson);

  for (const moduleFile of plan.moduleFiles) {
    await writeText(moduleFile.path, moduleFile.content);
  }

  for (const resourceFile of plan.resourceFiles) {
    await writeText(resourceFile.path, `${resourceFile.content.trim()}\n`);
  }

  for (const generatedFile of plan.generatedFiles) {
    await writeText(generatedFile.path, `${generatedFile.content.trim()}\n`);
  }

  const rawReadmePath = path.join(plan.paths.materialsRawDir, 'README.md');
  if (options.force || !(await fileExists(rawReadmePath))) {
    await writeText(rawReadmePath, `# Raw Materials

Place raw course source files in this folder, such as .md, .docx, and .tex.
Then run node tools/import-materials.mjs --course-dir <your-course-dir> to normalize them into the current course folder's materials/processed/ directory.

`);
  }

  const relativeCourseDir = path.relative(process.cwd(), resolvedCourseDir).replace(/\\/g, '/');
  console.log(`Scaffolded course "${course.course_id}" into ${resolvedCourseDir}`);
  if (removedModules.length > 0) {
    console.log(`Removed ${removedModules.length} existing module markdown file(s) because --force was used.`);
  }
  console.log(`Created ${plan.moduleFiles.length} module file(s), ${course.missions.length} mission(s), ${plan.resourcesManifestJson.items.length} resource item(s), and ${plan.generatedFiles.length} Codex working file(s).`);
  console.log('Next steps:');
  console.log(`- Review ${relativeCourseDir}/course.config.json`);
  console.log(`- Read ${relativeCourseDir}/generated/workflow/README_FIRST.md`);
  console.log(`- Review and refine the starter task in ${relativeCourseDir}/generated/workflow/CURRENT_TASK.md`);
  console.log(`- Review ${relativeCourseDir}/modules/*.md`);
  console.log(`- Add raw files to ${relativeCourseDir}/materials/raw/`);
  console.log(`- If you currently only have TQF3-based source, build the first honest output now and add stronger materials in later rounds`);
  console.log(`- Run node tools/build-course.mjs --course-dir ${relativeCourseDir}`);
  console.log(`- Run node tools/validate-course.mjs --course-dir ${relativeCourseDir}`);
}

const isDirectExecution = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectExecution) {
  await main();
}

