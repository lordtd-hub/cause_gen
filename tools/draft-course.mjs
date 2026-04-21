#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ensureDir,
  fileExists,
  importMaterialFile,
  listFiles,
  listFilesRecursive,
  slugify,
  titleFromSlug,
  writeJson,
  writeText,
  resolveCourseDir,
  getCoursePaths,
} from './lib/course-lib.mjs';

function parseArgs(argv) {
  const options = {
    courseDir: null,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/draft-course.mjs [--course-dir courses/<course-dir>] [--force]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const courseDir = resolveCourseDir(options.courseDir ?? undefined);
const {
  COURSE_DIR,
  MATERIALS_PROCESSED_DIR,
  MATERIALS_PROCESSED_INTAKE_DIR,
  MATERIALS_RAW_DIR,
  MODULES_DIR,
} = getCoursePaths(courseDir);

const processedFiles = await listFilesRecursive(MATERIALS_PROCESSED_DIR, ['.md']);
if (processedFiles.length === 0) {
  const rawFiles = await listFiles(MATERIALS_RAW_DIR, ['.md', '.tex', '.docx']);
  for (const file of rawFiles) {
    await importMaterialFile(file, MATERIALS_PROCESSED_INTAKE_DIR);
  }
}

const markdownFiles = await listFilesRecursive(MATERIALS_PROCESSED_DIR, ['.md']);
if (markdownFiles.length === 0) {
  console.log('No processed markdown files available for drafting.');
  process.exit(0);
}

const moduleEntries = markdownFiles.map((file, index) => {
  const basename = path.basename(file, '.md');
  const slug = slugify(basename);
  return {
    id: slug,
    slug,
    title: titleFromSlug(slug),
    summary: `Draft module generated from ${basename}.md`,
    order: index + 1,
    clo_ids: ['CLO1'],
    module_kind: index % 2 === 0 ? 'concept' : 'proof',
    widgets: index % 2 === 0 ? ['quick-check', 'parameter-playground'] : ['quick-check', 'proof-unpack'],
    sourceFile: file,
  };
});

function defaultDraftBadges(modules) {
  const firstModule = modules[0];
  const lastModule = modules[modules.length - 1];
  const badges = [
    {
      id: 'starter',
      emoji: '🌱',
      name: 'Starter',
      req: 'เปิดคอร์สและเริ่มสะสม XP',
      threshold_xp: 0,
    },
    {
      id: 'explorer',
      emoji: '🧭',
      name: 'Explorer',
      req: '120 XP และเรียนอย่างน้อย 1 โมดูล',
      threshold_xp: 120,
      required_modules_count: 1,
    },
  ];

  if (firstModule) {
    badges.push({
      id: `${firstModule.slug}-specialist`,
      emoji: firstModule.module_kind === 'proof' ? '🧠' : '📘',
      name: `${firstModule.title} Specialist`,
      req: `240 XP และเรียนโมดูล ${firstModule.title}`,
      threshold_xp: 240,
      required_modules: [firstModule.slug],
    });
  }

  if (lastModule && lastModule.slug !== firstModule?.slug) {
    badges.push({
      id: `${lastModule.slug}-specialist`,
      emoji: lastModule.module_kind === 'proof' ? '🧠' : '📗',
      name: `${lastModule.title} Specialist`,
      req: `360 XP และเรียนโมดูล ${lastModule.title}`,
      threshold_xp: 360,
      required_modules: [lastModule.slug],
    });
  }

  badges.push({
    id: 'master',
    emoji: '🏆',
    name: 'Master',
    req: `เรียนครบ ${modules.length || 1} โมดูล และผ่านอย่างน้อย 80% accuracy`,
    threshold_xp: Math.max(300, modules.length * 60),
    required_modules_count: modules.length || 1,
    required_accuracy: 80,
  });

  return badges;
}

await ensureDir(MODULES_DIR);

for (const [index, module] of moduleEntries.entries()) {
  const modulePath = path.join(MODULES_DIR, `${String(index + 1).padStart(2, '0')}-${module.slug}.md`);
  if (!options.force && await fileExists(modulePath)) continue;

  const sourceContent = await fs.readFile(module.sourceFile, 'utf8');
  const content = `---
id: ${module.id}
slug: ${module.slug}
title: ${module.title}
summary: ${module.summary}
order: ${module.order}
clo_ids: ["CLO1"]
module_kind: ${module.module_kind}
widgets: ${JSON.stringify(module.widgets)}
---

# ${module.title}

โมดูลนี้ถูก draft จากไฟล์ <code>${path.basename(module.sourceFile)}</code>

${sourceContent.trim()}

:::quick-check
{
  "question": "ต้องการเขียนคำถามทบทวนสำหรับ ${module.title} อย่างไร",
  "choices": [
    { "label": "เขียนคำถามและเฉลยต่อจาก draft นี้", "correct": true },
    { "label": "ปล่อยว่างไว้โดยไม่ต้องตรวจ", "correct": false }
  ],
  "explanation": "draft-course สร้างโครงให้แล้ว แต่ยังควรเกลารายละเอียดของเนื้อหาและกิจกรรมต่อ"
}
:::
`;
  await writeText(modulePath, content);
}

const configPath = path.join(COURSE_DIR, 'course.config.json');
if (options.force || !(await fileExists(configPath))) {
  await writeJson(configPath, {
    course_id: 'new_course_draft',
    course_name_th: 'ร่างรายวิชาใหม่',
    course_name_en: 'New Course Draft',
    course_short_name: 'Course Draft',
    instructor: 'แนวคิดโดยอาจารย์สิทธิโชค ทรงสอาด',
    description: 'ร่างคอร์สที่สร้างจาก draft-course.mjs',
    theme: {
      brand_icon: '∞',
      accent: '#22d3ee',
      accent_secondary: '#8b5cf6',
    },
    features: {
      resources: true,
      missions: true,
      games: false,
    },
    widgets_enabled: ['quick-check', 'parameter-playground', 'proof-unpack', 'sbra-sequence'],
    lesson_completion_xp: 40,
    badges: defaultDraftBadges(moduleEntries),
    modules: moduleEntries.map(({ id, slug, title, summary, order, module_kind }) => ({ id, slug, title, summary, order, module_kind })),
    clos: [
      {
        id: 'CLO1',
        label: 'เขียน CLO จริงของรายวิชาแทนที่ข้อความนี้',
        bloom: 'Apply',
        assessment_tags: ['draft'],
      }
    ],
  });
}

const missionsPath = path.join(COURSE_DIR, 'missions', 'missions.json');
if (options.force || !(await fileExists(missionsPath))) {
  await writeJson(missionsPath, {
    course_id: 'new_course_draft',
    missions: moduleEntries.slice(0, 2).map((module, index) => ({
      mission_id: `draft-mission-${module.slug}`,
      clo_id: 'CLO1',
      module_id: module.id,
      title: `Draft mission for ${module.title}`,
      mission_type: 'sbra-step-based-reasoning',
      bloom_level: index + 2,
      xp: 100,
      rubric: [
        'ตรวจความสอดคล้องกับ CLO',
        'เพิ่มโจทย์จริงและ feedback ที่เฉพาะวิชา',
      ],
      threshold: { min_steps_mastered: 1 },
      confidence: {
        prompt: 'หลังทำครบทุก step แล้ว คุณมั่นใจในคำตอบของตนเองระดับใด',
        levels: [1, 2, 3, 4, 5],
      },
      prompt: `ภารกิจ draft สำหรับโมดูล ${module.title}`,
      strategy_prompt: 'เขียน strategy prompt ที่ตรงกับลักษณะรายวิชา',
      steps: [
        {
          id: 'draft-step-1',
          title: 'Draft step',
          prompt: 'แทนที่ step นี้ด้วยโจทย์ SBRA จริง',
          process_prompt: 'ควรเลือกกระบวนการใดสำหรับ step นี้',
          process_options: [
            { id: 'correct-process', text: 'process ที่ถูก', correct: true, feedback: 'แทนที่ feedback นี้ด้วยข้อความจริง' },
            { id: 'wrong-process', text: 'process ที่ผิด', correct: false, feedback: 'แทนที่ feedback นี้ด้วยข้อความจริง' },
          ],
          reasoning_prompt: 'เหตุผลใดรองรับการเลือก process นี้',
          reasoning_options: [
            { id: 'correct-reasoning', text: 'reasoning ที่ถูก', correct: true, feedback: 'แทนที่ feedback นี้ด้วยข้อความจริง' },
            { id: 'wrong-reasoning', text: 'reasoning ที่ผิด', correct: false, feedback: 'แทนที่ feedback นี้ด้วยข้อความจริง' },
          ],
          hint: 'เติม hint สำหรับ step นี้',
        },
      ],
    })),
  });
}

console.log(`Drafted ${moduleEntries.length} module(s) in ${path.relative(process.cwd(), COURSE_DIR).replace(/\\/g, '/')}.`);
