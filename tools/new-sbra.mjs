#!/usr/bin/env node

const [, , missionId, cloId, moduleId, stepsArg] = process.argv;
const stepCount = Math.max(1, Math.min(8, Number.parseInt(stepsArg || '3', 10) || 3));

if (!missionId || !cloId || !moduleId) {
  console.error('usage: node tools/new-sbra.mjs <mission-id> <clo-id> <module-id> [numSteps]');
  console.error('example: node tools/new-sbra.mjs sbra-mvt-application CLO3 differentiation-and-mean-value 3');
  process.exit(1);
}

const steps = Array.from({ length: stepCount }, (_, index) => ({
  id: `step-${index + 1}`,
  title: `Step ${index + 1}`,
  prompt: `เขียน prompt สำหรับ step ${index + 1}`,
  process_prompt: `ควรเลือกกระบวนการใดสำหรับ step ${index + 1}`,
  process_options: [
    { id: 'process-correct', text: 'กระบวนการที่ถูก', correct: true, feedback: 'อธิบายว่าทำไม process นี้ถูก' },
    { id: 'process-wrong-1', text: 'กระบวนการที่ผิด 1', correct: false, feedback: 'อธิบาย misconception ของ process นี้' },
    { id: 'process-wrong-2', text: 'กระบวนการที่ผิด 2', correct: false, feedback: 'อธิบาย misconception ของ process นี้' },
    { id: 'process-wrong-3', text: 'กระบวนการที่ผิด 3', correct: false, feedback: 'อธิบาย misconception ของ process นี้' }
  ],
  reasoning_prompt: `เหตุผลใดรองรับการเลือก process ของ step ${index + 1}`,
  reasoning_options: [
    { id: 'reasoning-correct', text: 'เหตุผลที่ถูก', correct: true, feedback: 'อธิบายว่าทำไม reasoning นี้ถูก' },
    { id: 'reasoning-wrong-1', text: 'เหตุผลที่ผิด 1', correct: false, feedback: 'อธิบาย misconception ของ reasoning นี้' },
    { id: 'reasoning-wrong-2', text: 'เหตุผลที่ผิด 2', correct: false, feedback: 'อธิบาย misconception ของ reasoning นี้' },
    { id: 'reasoning-wrong-3', text: 'เหตุผลที่ผิด 3', correct: false, feedback: 'อธิบาย misconception ของ reasoning นี้' }
  ],
  hint: `เขียน hint สำหรับ step ${index + 1}`
}));

const mission = {
  mission_id: missionId,
  clo_id: cloId,
  module_id: moduleId,
  title: 'ตั้งชื่อภารกิจ',
  mission_type: 'sbra-step-based-reasoning',
  bloom_level: 3,
  xp: 120,
  rubric: [
    'เขียน rubric ข้อที่ 1',
    'เขียน rubric ข้อที่ 2'
  ],
  threshold: {
    min_steps_mastered: stepCount
  },
  prompt: 'อธิบายโจทย์หลักของภารกิจนี้',
  strategy_prompt: 'อธิบายว่าผู้เรียนควรวางแผนอย่างไรก่อนเริ่มทำทีละ step',
  confidence: {
    prompt: 'หลังทำครบทุก step แล้ว คุณมั่นใจในคำตอบของตนเองระดับใด?',
    levels: [1, 2, 3, 4, 5]
  },
  steps
};

console.log(JSON.stringify(mission, null, 2));
