#!/usr/bin/env node
// ──────────────────────────────────────────────────────────────
// new-sbra.mjs — SBRA problem scaffolder
// พิมพ์ template ของ SBRA problem + strategy entry เพื่อ copy-paste
// ไปวางใน js/mission-bank.js
//
// ใช้: node tools/new-sbra.mjs <id> <clo> [numSteps]
//   <id>        e.g. sbra-lim-standard-exp   (ต้องเริ่มด้วย sbra-lim- / sbra-cont- / sbra-diff- / sbra-int-)
//   <clo>       CLO1 | CLO2 | CLO3 | CLO4 | CLO5 | CLO6
//   [numSteps]  จำนวนขั้น tactical (ไม่รวม 🎯 วางแผน) — default 3
// ──────────────────────────────────────────────────────────────

const [, , id, clo, nStepsStr] = process.argv;

const CLO_LABELS = {
  CLO1: 'อธิบายและคำนวณลิมิต',
  CLO2: 'ทดสอบและอธิบายความต่อเนื่อง',
  CLO3: 'คำนวณและตีความอนุพันธ์',
  CLO4: 'ใช้อนุพันธ์วิเคราะห์ฟังก์ชันและการประยุกต์',
  CLO5: 'คำนวณปริพันธ์จำกัดและไม่จำกัด',
  CLO6: 'ใช้ปริพันธ์ในการประยุกต์',
};

const POOL_BY_PREFIX = {
  'sbra-lim-':  'POOL_SBRA_LIMITS',
  'sbra-cont-': 'POOL_SBRA_CONT',
  'sbra-diff-': 'POOL_SBRA_DIFF',
  'sbra-int-':  'POOL_SBRA_INT',
};

function usage(msg) {
  if (msg) console.error(`error: ${msg}\n`);
  console.error('usage: node tools/new-sbra.mjs <id> <clo> [numSteps]');
  console.error('  id      e.g. sbra-lim-newid, sbra-diff-chain, sbra-int-usub');
  console.error('  clo     CLO1 | CLO2 | CLO3 | CLO4 | CLO5 | CLO6');
  console.error('  steps   จำนวนขั้น tactical (ไม่รวม 🎯 วางแผน) — default 3');
  process.exit(msg ? 1 : 0);
}

if (!id || !clo) usage();
if (!CLO_LABELS[clo]) usage(`unknown CLO: ${clo}`);

const prefixEntry = Object.entries(POOL_BY_PREFIX).find(([p]) => id.startsWith(p));
if (!prefixEntry) usage(`id "${id}" must start with one of: ${Object.keys(POOL_BY_PREFIX).join(', ')}`);
const pool = prefixEntry[1];

const nSteps = Math.max(1, Math.min(8, parseInt(nStepsStr || '3', 10)));

const step = (i) => `    { id:'s${i}',
      prompt:'คำถามประจำขั้นที่ ${i} (LaTeX inline: \\\\(\\\\dots\\\\))',
      actions:[
        { id:'a', tex:'ตัวเลือกถูก', correct:true },
        { id:'b', tex:'ตัวเลือกผิด 1' },
        { id:'c', tex:'ตัวเลือกผิด 2' },
        { id:'d', tex:'ตัวเลือกผิด 3' },
      ],
      reasons:[
        { id:'r1', text:'เหตุผลที่ action a ถูก (อธิบายว่าทำไม)', correct:true },
        { id:'r2', text:'เหตุผลผิด 1' },
        { id:'r3', text:'เหตุผลผิด 2' },
        { id:'r4', text:'เหตุผลผิด 3' },
      ],
      commitText:'สรุปขั้น ${i} สั้น ๆ (แสดงหลังยืนยัน)' },`;

const stepsBlock = Array.from({ length: nSteps }, (_, k) => step(k + 1)).join('\n');

const problemEntry = `  { id:'${id}', clo:'${clo}',
    title:'ชื่อสั้น — \\\\(\\\\text{โจทย์ย่อ}\\\\)',
    problem:'\\\\text{นิพจน์โจทย์เต็ม (LaTeX)}',
    steps:[
${stepsBlock}
    ],
    finalAnswer:{ tex:'\\\\text{คำตอบสุดท้าย}', sayTH:'อ่านคำตอบเป็นภาษาไทย' } },`;

const strategyEntry = `  '${id}':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'เทคนิคหลัก (ถูก)', correct:true },
      { id:'b', text:'เทคนิคอื่น 1' },
      { id:'c', text:'เทคนิคอื่น 2' },
      { id:'d', text:'เทคนิคอื่น 3' },
    ],
    reasons:[
      { id:'r1', text:'เหตุผลที่เลือกเทคนิคนี้ (ถูก)', correct:true },
      { id:'r2', text:'เหตุผลอื่น 1' },
      { id:'r3', text:'เหตุผลอื่น 2' },
      { id:'r4', text:'เหตุผลอื่น 3' },
    ],
  },`;

const hr = '─'.repeat(70);
console.log(`${hr}
id:   ${id}
CLO:  ${clo} — ${CLO_LABELS[clo]}
pool: ${pool}   (js/mission-bank.js)
${hr}

1) วาง block นี้ลงใน const ${pool} = [ ... ]:

${problemEntry}

${hr}

2) วาง block นี้ลงใน const SBRA_STRATEGIES = { ... }:

${strategyEntry}

${hr}
✓ เสร็จแล้วเปิด missions.html ทดสอบว่ารันได้
`);
