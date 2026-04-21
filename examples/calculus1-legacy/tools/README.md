# tools/

สคริปต์ช่วยพัฒนา — **ไม่รวมอยู่ในเว็บที่ deploy** (GitHub Pages ไม่รัน Node)
รันจาก root ของ repo เสมอ

---

## `new-sbra.mjs`

Scaffolder สำหรับโจทย์ SBRA ใหม่ พิมพ์ template ที่พร้อม copy-paste ลง `js/mission-bank.js`

```bash
node tools/new-sbra.mjs <id> <clo> [numSteps]
```

**ตัวอย่าง:**

```bash
# โจทย์ลิมิต 3 ขั้น
node tools/new-sbra.mjs sbra-lim-trig-standard CLO1

# โจทย์อนุพันธ์ 4 ขั้น (chain rule)
node tools/new-sbra.mjs sbra-diff-chain-nested CLO3 4

# โจทย์ปริพันธ์ 5 ขั้น (u-sub + by-parts)
node tools/new-sbra.mjs sbra-int-by-parts-ln CLO5 5
```

**Output** — 2 block:
1. Problem entry → วางลง `POOL_SBRA_LIMITS / POOL_SBRA_CONT / POOL_SBRA_DIFF / POOL_SBRA_INT`
2. Strategy entry → วางลง `SBRA_STRATEGIES`

รายละเอียดโครงสร้างและกฎทอง: `docs/ADDING_PROBLEMS.md`

---

## แนวทางเพิ่ม tool ใหม่

- ใช้ชื่อไฟล์ `kebab-case.mjs` หรือ `.js`
- เริ่มไฟล์ด้วย `#!/usr/bin/env node` ถ้ารันตรง ๆ ได้
- header comment อธิบายวัตถุประสงค์ + ตัวอย่าง CLI
- ถ้า script สร้างไฟล์ ต้องไม่เขียนทับไฟล์ที่มีอยู่โดยไม่ถาม

ตัวอย่างงานที่อาจทำเป็น tool ในอนาคต:
- `new-bloom-problem.mjs` — scaffolder สำหรับ POOL_L/D/I*_* Bloom pool
- `validate-bank.mjs` — ตรวจ id ซ้ำ / CLO ขาด / strategy ขาดคู่กับ problem
- `export-bank-latex.mjs` — export บัญชีโจทย์เป็น LaTeX เพื่อพิมพ์ข้อสอบ
