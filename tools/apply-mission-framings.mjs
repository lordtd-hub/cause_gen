#!/usr/bin/env node

import path from 'node:path';
import {
  getCoursePaths,
  listMissionFramingFiles,
  readJson,
  readText,
  resolveCourseDir,
  slugify,
  writeJson,
} from './lib/course-lib.mjs';

const BLOOM_LEVELS = {
  Remember: 1,
  Understand: 2,
  Apply: 3,
  Analyze: 4,
  Evaluate: 5,
  Create: 6,
};

function parseArgs(argv) {
  const options = { courseDir: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/apply-mission-framings.mjs [--course-dir courses/<course-id>]');
      process.exit(0);
    }
  }

  return options;
}

function stripFormatting(value) {
  return String(value || '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

function splitSections(markdown) {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const matches = [...normalized.matchAll(/^##\s+(.+)$/gm)];
  const sections = {};

  matches.forEach((match, index) => {
    const title = stripFormatting(match[1]);
    const start = match.index + match[0].length + 1;
    const end = index + 1 < matches.length ? matches[index + 1].index : normalized.length;
    sections[title] = normalized.slice(start, end).trim();
  });

  return sections;
}

function parseKeyValueList(sectionBody) {
  return Object.fromEntries(
    sectionBody
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('- ') && line.includes(':'))
      .map((line) => {
        const idx = line.indexOf(':');
        return [stripFormatting(line.slice(2, idx).trim()), stripFormatting(line.slice(idx + 1).trim())];
      }),
  );
}

function parseBulletList(sectionBody) {
  return sectionBody
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => stripFormatting(line.slice(2)))
    .filter(Boolean);
}

function parseNumberedList(sectionBody) {
  return sectionBody
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line))
    .map((line) => stripFormatting(line.replace(/^\d+\.\s*/, '')))
    .map((line) => line.replace(/^"|"$/g, '').trim())
    .filter(Boolean);
}

function summarizeMisconception(text) {
  const lower = text.toLowerCase();
  if (lower.includes('goal structure')) {
    return 'เลือกวิธีโดยไม่ตรวจโครงของเป้าหมายหรือข้อจำกัดของโจทย์';
  }
  if (lower.includes('familiar example') || lower.includes('example as')) {
    return 'ยึดตัวอย่างที่คุ้นเคยเพียงกรณีเดียวแล้วใช้แทนทุกโจทย์';
  }
  if (lower.includes('representation') && lower.includes('search')) {
    return 'สับสนระหว่างการแทนความรู้กับการเลือกวิธีค้นหา';
  }
  if (lower.includes('decision path') || lower.includes('explaining')) {
    return 'รีบตอบผลลัพธ์โดยไม่อธิบายเส้นทางการตัดสินใจ';
  }
  if (lower.includes('condition')) {
    return 'ใช้วิธีหรือทฤษฎีโดยไม่ตรวจเงื่อนไขที่ทำให้ใช้ได้จริง';
  }
  if (lower.includes('proof')) {
    return 'สรุปแบบ proof โดยข้ามเหตุผลที่ต้องเชื่อมทีละขั้น';
  }
  return `เลือกแนวคิดที่คลาดเคลื่อนจากโจทย์ เช่น "${text}"`;
}

function buildWrongOptions(misconceptions, count = 2) {
  const picked = misconceptions.slice(0, count);
  while (picked.length < count) {
    picked.push('ตอบผลลัพธ์ทันทีโดยไม่ตรวจเงื่อนไขของโจทย์');
  }

  return picked.map((item, index) => ({
    text: summarizeMisconception(item),
    tag: slugify(item) || slugify(summarizeMisconception(item)) || `misconception-${index + 1}`,
  }));
}

function inferMissionId(identity) {
  if (identity.mission_id) {
    return slugify(identity.mission_id);
  }
  const moduleId = slugify(identity.module || identity.module_id || 'module');
  const cloId = String(identity.target_clo || identity.clo || 'CLO1').toLowerCase();
  return `sbra-${moduleId}-${slugify(cloId)}`;
}

function inferMissionTitle(moduleTitle) {
  return `SBRA: ${moduleTitle}`;
}

function buildStep(stepText, index, misconceptions) {
  const intent = stripFormatting(stepText).replace(/^`|`$/g, '').trim();
  const wrongOptions = buildWrongOptions(
    misconceptions.slice(index).concat(misconceptions.slice(0, index)),
  );

  return {
    id: slugify(intent) || `step-${index + 1}`,
    title: `Step ${index + 1}: ${intent}`,
    prompt: `ในขั้น "${intent}" ผู้เรียนควรเลือกกระบวนการและเหตุผลแบบใดจึงจะสอดคล้องกับโจทย์`,
    process_prompt: 'เลือก process ที่เหมาะที่สุดกับขั้นนี้',
    process_options: [
      {
        id: 'correct-process',
        text: `เลือกกระบวนการที่เชื่อมตรงกับขั้น "${intent}" และยังอิงโครงของโจทย์อย่างชัดเจน`,
        correct: true,
        feedback: 'ถูกต้อง เพราะกระบวนการนี้ยังผูกกับเจตนาของขั้นและเงื่อนไขของโจทย์',
        misconception_tags: [],
      },
      {
        id: 'wrong-process-1',
        text: wrongOptions[0].text,
        correct: false,
        feedback: 'แนวนี้ทำให้ reasoning หลุดจากโครงของโจทย์หรือ CLO ที่กำลังวัด',
        misconception_tags: [wrongOptions[0].tag],
      },
      {
        id: 'wrong-process-2',
        text: wrongOptions[1].text,
        correct: false,
        feedback: 'แนวนี้ยังไม่พอสำหรับภารกิจที่ต้องอธิบายกระบวนการคิดอย่างตรวจสอบได้',
        misconception_tags: [wrongOptions[1].tag],
      },
    ],
    reasoning_prompt: 'เหตุผลใดรองรับ process นี้ได้ดีที่สุด',
    reasoning_options: [
      {
        id: 'correct-reasoning',
        text: `เพราะขั้น "${intent}" ต้องอธิบายให้เห็นว่าทำไมกระบวนการนี้จึงเหมาะกับโครงของโจทย์และเป้าหมายการวัด`,
        correct: true,
        feedback: 'ถูกต้อง เพราะเหตุผลยังเชื่อมทั้งกับโจทย์ เป้าหมาย และวิธีคิดของขั้นนี้',
        misconception_tags: [],
      },
      {
        id: 'wrong-reasoning-1',
        text: 'เพราะดูเหมือนจะตอบได้เร็วที่สุดจึงน่าจะถูกต้องที่สุด',
        correct: false,
        feedback: 'ความเร็วไม่ใช่เหตุผลหลักของภารกิจเชิง reasoning',
        misconception_tags: ['speed-over-validity'],
      },
      {
        id: 'wrong-reasoning-2',
        text: 'เพราะไม่จำเป็นต้องตรวจโครงของโจทย์ให้ละเอียดก็เลือกคำตอบได้',
        correct: false,
        feedback: 'ภารกิจนี้ต้องผูกเหตุผลกับโครงของปัญหา ไม่ใช่เลือกคำตอบลอย ๆ',
        misconception_tags: ['structure-ignored'],
      },
    ],
    hint: `ลองถามก่อนว่า ขั้น "${intent}" กำลังต้องการตรวจอะไรในโจทย์ แล้วค่อยเลือก process ที่อธิบายได้จริง`,
  };
}

function parseFraming(markdown, moduleTitleLookup) {
  const sections = splitSections(markdown);
  const identity = {
    ...parseKeyValueList(sections['Mission Identity'] || ''),
    ...parseKeyValueList(sections['Framing Anchor'] || ''),
  };
  const evidence = parseKeyValueList(sections['Evidence Target'] || '');
  const misconceptions = parseBulletList(
    sections['Misconceptions Worth Targeting'] || sections['Strong Misconceptions To Target'] || '',
  );
  const stepIntents = parseNumberedList(
    sections['Step Intent Draft'] || sections['Suggested Step Intent'] || '',
  );

  const moduleId = slugify(identity.module || identity.module_id || 'module');
  const moduleTitle = moduleTitleLookup.get(moduleId) || moduleId;
  const bloomLabel = identity.bloom || identity.bloom_anchor || 'Apply';

  return {
    missionId: inferMissionId(identity),
    cloId: identity.target_clo || identity.clo || 'CLO1',
    moduleId,
    moduleTitle,
    missionFamily: identity.mission_family || identity['mission family'] || 'sbra-step-based-reasoning',
    bloomLevel: BLOOM_LEVELS[bloomLabel] || 3,
    bloomLabel,
    badgeHook: evidence['badge hook'] || null,
    misconceptions,
    stepIntents,
    prompt: `พิจารณาสถานการณ์ในหัวข้อ ${moduleTitle} แล้วเลือก process และ reasoning ที่เหมาะสมที่สุดในแต่ละขั้น เพื่อแสดงว่าคุณกำลังทำงานตาม ${identity.target_clo || 'CLO'} ระดับ ${bloomLabel}`,
    strategyPrompt: `อ่านโจทย์ก่อนว่ากำลังต้องการการวิเคราะห์แบบใดในหัวข้อ ${moduleTitle} แล้วค่อยเลือก process ที่ยังอิงโครงของปัญหาอยู่`,
  };
}

function buildMissionDraft(framing) {
  const stepIntents = framing.stepIntents.length > 0
    ? framing.stepIntents
    : [
        'ระบุลักษณะของโจทย์',
        'เลือกกระบวนการ reasoning ที่เหมาะที่สุด',
        'ตรวจความสอดคล้องของคำตอบกับเป้าหมายและเงื่อนไข',
      ];
  const steps = stepIntents.map((item, index) => buildStep(item, index, framing.misconceptions));

  return {
    mission_id: framing.missionId,
    clo_id: framing.cloId,
    module_id: framing.moduleId,
    title: inferMissionTitle(framing.moduleTitle),
    mission_type: framing.missionFamily,
    bloom_level: framing.bloomLevel,
    xp: 120 + (steps.length * 10),
    badge_hook: framing.badgeHook,
    rubric: [
      `เลือก process ที่สอดคล้องกับการวัด ${framing.cloId} ในหัวข้อ ${framing.moduleTitle}`,
      'อธิบาย reasoning ให้เห็นว่าทำไมกระบวนการที่เลือกจึงเหมาะกับโครงของโจทย์',
      'หลีกเลี่ยง shortcut หรือ misconception ที่ทำให้ตอบได้โดยไม่ตรวจเงื่อนไขให้ครบ',
    ],
    threshold: {
      min_steps_mastered: Math.max(2, steps.length - 1),
    },
    confidence: {
      prompt: 'หลังทำครบทุก step แล้ว คุณมั่นใจต่อคำตอบและเหตุผลของตนเองระดับใด',
      levels: [1, 2, 3, 4, 5],
    },
    prompt: framing.prompt,
    strategy_prompt: framing.strategyPrompt,
    misconceptions: framing.misconceptions,
    steps,
  };
}

function mergeMissions(existingMissions, generatedMissions, validModuleIds) {
  const generatedKeys = new Set(generatedMissions.map((mission) => `${mission.clo_id}::${mission.module_id}`));
  const kept = existingMissions.filter((mission) => {
    if (!validModuleIds.has(mission.module_id)) return false;
    const key = `${mission.clo_id}::${mission.module_id}`;
    if (!generatedKeys.has(key)) return true;
    if (generatedMissions.some((generated) => generated.mission_id === mission.mission_id)) return false;
    return !String(mission.mission_id || '').startsWith('draft-');
  });

  const merged = [...kept];
  generatedMissions.forEach((mission) => {
    const existingIndex = merged.findIndex((entry) => entry.mission_id === mission.mission_id);
    if (existingIndex >= 0) {
      merged[existingIndex] = mission;
    } else {
      merged.push(mission);
    }
  });
  return merged;
}

const options = parseArgs(process.argv.slice(2));
const courseDir = resolveCourseDir(options.courseDir ?? undefined);
const coursePaths = getCoursePaths(courseDir);
const { COURSE_DIR, MISSIONS_DIR } = coursePaths;

const framingFiles = await listMissionFramingFiles(coursePaths);

if (framingFiles.length === 0) {
  console.log(`No mission framing files found in ${coursePaths.GENERATED_FRAMING_DIR}`);
  process.exit(0);
}

const courseConfig = await readJson(path.join(COURSE_DIR, 'course.config.json'));
const moduleTitleLookup = new Map(
  (courseConfig.modules || []).map((module) => [module.id, module.title || module.id]),
);
const validModuleIds = new Set((courseConfig.modules || []).map((module) => module.id));

const generatedMissions = [];
for (const file of framingFiles) {
  const markdown = await readText(file);
  const framing = parseFraming(markdown, moduleTitleLookup);
  generatedMissions.push(buildMissionDraft(framing));
}

const missionsPath = path.join(MISSIONS_DIR, 'missions.json');
const existingPayload = await readJson(missionsPath);
const mergedMissions = mergeMissions(existingPayload.missions || [], generatedMissions, validModuleIds);

await writeJson(missionsPath, {
  course_id: existingPayload.course_id || courseConfig.course_id,
  missions: mergedMissions,
});

console.log(`Applied ${generatedMissions.length} mission framing file(s) into ${missionsPath}`);
generatedMissions.forEach((mission) => {
  console.log(`- ${mission.mission_id} (${mission.clo_id} / ${mission.module_id})`);
});
