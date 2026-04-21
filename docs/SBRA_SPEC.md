# SBRA Specification v1

เอกสารนี้กำหนดความหมายของ `SBRA` ในระบบ template นี้อย่างชัดเจน

เอกสารคู่สำหรับรายละเอียดระดับ rubric และ analytics:
- [SBRA_RUBRIC_ANALYTICS_SPEC.md](/C:/Users/User/Documents/Cause_gen/docs/SBRA_RUBRIC_ANALYTICS_SPEC.md)

## 1. Definition

`SBRA` ย่อมาจาก `Step Based Reasoning Activity`

SBRA ไม่ใช่ quiz แบบเลือกตอบทั่วไป แต่เป็นกิจกรรมประเมินที่:
- ใช้โจทย์คณิตศาสตร์จริงเป็นแกน
- แตกโจทย์ออกเป็นหลาย step ตามโครงสร้างการแก้ปัญหา
- ให้ผู้เรียนตอบทั้ง `process` และ `reasoning` ในแต่ละ step
- เก็บ `confidence` ตอนท้ายเพื่อนำไปใช้วิเคราะห์ metacognition และความสอดคล้องของคำตอบ
- treat `confidence` as the canonical self-assessment block in every SBRA mission

## 2. Assessment Intent

SBRA ต้องวัดอย่างน้อย:
- ผู้เรียนเลือกกระบวนการแก้ปัญหาได้เหมาะสมหรือไม่
- ผู้เรียนเข้าใจเหตุผลที่รองรับกระบวนการนั้นจริงหรือไม่
- ผู้เรียนผิดที่การเลือก process, ผิดที่ reasoning, หรือผิดทั้งคู่
- ผู้เรียนมั่นใจในระดับใด และความมั่นใจนั้นสอดคล้องกับผลการทำหรือไม่

ดังนั้น SBRA เป็นทั้ง:
- `formative assessment`
- `diagnostic assessment`
- `CLO-aligned reasoning assessment`

## 3. Core Design Principles

- ทุก SBRA ต้องอิงกับ `CLO` อย่างน้อย 1 ข้อ
- แต่ละ step ต้องสอดคล้องกับลำดับการแก้ปัญหาจริง
- ตัวเลือกผิดต้องสะท้อน misconception ที่ “สมจริง”
- หลีกเลี่ยง distractors ที่ตัดทิ้งได้ง่าย
- feedback ต้องบอกได้ว่าพลาดตรง process หรือ reasoning
- confidence ไม่ใช่ของตกแต่ง แต่เป็นข้อมูลเพื่อวิเคราะห์ความเข้าใจของผู้เรียน
- self-assessment must be visible as a learner-facing block on the mission page, not hidden as backend-only analytics
- scaffold/default source for self-assessment should use the same `1–5` star scale as the learner-facing runtime
- default XP calibration policy follows the `cal1` legacy pattern: 5★ ×1.25, 4★ ×1.15, 3★ ×1.00, 2★ ×1.10, 1★ ×1.15, and high-confidence failures are flagged as miscalibration
- support tools follow the `cal1` legacy penalty pattern before calibration: showing hint reduces base XP to 70%, and showing solution reduces base XP to 50%

## 4. Canonical JSON Contract

ระดับ mission ต้องมีอย่างน้อย:
- `mission_id`
- `clo_id`
- `module_id`
- `mission_type`
- `title`
- `prompt`
- `steps`
- `rubric`
- `threshold`
- `confidence`

ระดับ step ต้องมีอย่างน้อย:
- `id`
- `title`
- `prompt`
- `process_prompt`
- `process_options`
- `reasoning_prompt`
- `reasoning_options`

ระดับ option ต้องมีอย่างน้อย:
- `id`
- `text`
- `correct`
- `feedback`

## 5. Recommended Mission Shape

```json
{
  "mission_id": "sbra-continuity-diagnosis",
  "clo_id": "CLO2",
  "module_id": "topology-and-continuity",
  "title": "SBRA: Diagnose continuity from definition and examples",
  "mission_type": "sbra-step-based-reasoning",
  "bloom_level": 4,
  "xp": 140,
  "rubric": [
    "เลือก process ที่เหมาะสมกับแต่ละช่วงของโจทย์",
    "ให้ reasoning ที่ตรงกับนิยามหรือทฤษฎีบทที่เกี่ยวข้อง",
    "เชื่อมคำตอบแต่ละ step เป็นโครง reasoning เดียวกันได้"
  ],
  "threshold": {
    "min_steps_mastered": 3
  },
  "prompt": "พิจารณาว่าฟังก์ชันที่กำหนดต่อเนื่องหรือไม่ โดยเลือก process และ reasoning ที่เหมาะสมในแต่ละช่วง",
  "strategy_prompt": "มองก่อนว่าโจทย์นี้ต้องใช้การวิเคราะห์จากนิยาม ตัวอย่าง/ไม่เป็นตัวอย่าง หรือทฤษฎีบทใดเป็นแกน",
  "confidence": {
    "prompt": "หลังทำครบทุก step แล้ว คุณมั่นใจในคำตอบของตนเองระดับใด?",
    "levels": [
      1,
      2,
      3,
      4,
      5
    ]
  },
  "steps": [
    {
      "id": "step-1",
      "title": "Step 1: Choose the opening process",
      "prompt": "ควรเริ่มตรวจ continuity ด้วยกระบวนการแบบใด?",
      "process_prompt": "เลือก process ที่เหมาะที่สุด",
      "process_options": [
        {
          "id": "definition-first",
          "text": "เริ่มจากนิยามของ continuity และตรวจที่จุดที่น่าสงสัย",
          "correct": true,
          "feedback": "ถูกต้อง เพราะโจทย์นี้ต้องเริ่มจากการระบุจุดและนิยามที่จะใช้"
        },
        {
          "id": "differentiate-first",
          "text": "หาอนุพันธ์ก่อนเสมอ",
          "correct": false,
          "feedback": "การหาอนุพันธ์ไม่ใช่ process หลักของทุกโจทย์ continuity"
        }
      ],
      "reasoning_prompt": "เหตุผลหลักที่ทำให้ต้องเลือก process นี้คืออะไร?",
      "reasoning_options": [
        {
          "id": "check-conditions",
          "text": "เพราะ continuity ต้องวิเคราะห์จากเงื่อนไขของนิยามหรือ theorem ที่ใช้ได้จริงกับโจทย์นี้",
          "correct": true,
          "feedback": "ถูกต้อง เหตุผลนี้เชื่อม process กับธรรมชาติของโจทย์"
        },
        {
          "id": "memorized-formula",
          "text": "เพราะเป็นวิธีที่ใช้บ่อยที่สุดเลยเลือกไว้ก่อน",
          "correct": false,
          "feedback": "เหตุผลนี้อิงความคุ้นเคย ไม่ได้อิงโครงคณิตศาสตร์ของโจทย์"
        }
      ],
      "hint": "เริ่มจากถามว่าโจทย์กำลังให้ตรวจ property อะไร และ property นั้นนิยามไว้แบบใด"
    }
  ]
}
```

## 6. Scoring Model

คำแนะนำสำหรับ v1:
- `process_correct` = จำนวน step ที่เลือก process ถูก
- `reasoning_correct` = จำนวน step ที่เลือก reasoning ถูก
- `steps_mastered` = จำนวน step ที่ทั้ง process และ reasoning ถูกพร้อมกัน
- ใช้ `threshold.min_steps_mastered` เป็นเกณฑ์ผ่านพื้นฐาน

ผลสรุปควรรายงาน:
- คะแนน process
- คะแนน reasoning
- จำนวน step ที่ mastered
- confidence ที่ผู้เรียนเลือก
- diagnosis เช่น `high confidence / low mastery`, `low confidence / high mastery`

ถ้าต้องการ rubric และ learner analytics ที่ลึกกว่า v1 ให้อ้างอิง:
- [SBRA_RUBRIC_ANALYTICS_SPEC.md](/C:/Users/User/Documents/Cause_gen/docs/SBRA_RUBRIC_ANALYTICS_SPEC.md)

## 7. Confidence Interpretation

ตัวอย่างการแปลผล:
- `high confidence + low mastery`
  - อาจสะท้อน misconception ที่ฝังแน่น
- `low confidence + high mastery`
  - อาจสะท้อนว่าผู้เรียนยังไม่มั่นใจแม้ reasoning ดี
- `high confidence + high mastery`
  - สะท้อนความเข้าใจที่มั่นคง
- `low confidence + low mastery`
  - สะท้อนว่าผู้เรียนยังต้องการ scaffold เพิ่ม

## 8. Distractor Quality Rules

ตัวเลือกที่ดีควร:
- มาจากความคลาดเคลื่อนที่พบจริงในบทเรียน
- ใกล้เคียงคำตอบถูกพอที่จะบังคับให้คิด
- ผิดด้วยเหตุผลที่อธิบายได้

ตัวเลือกที่ไม่ดี:
- ผิดแบบชัดเกินไป
- หลุดหัวข้อ
- ใช้ภาษาคลุมเครือจนแยกไม่ออกว่าผิดเพราะอะไร
- ทำให้ผู้เรียนตัดช้อยส์ได้โดยไม่ต้อง reasoning

## 9. Relationship to CLOs

SBRA เหมาะมากกับ CLO ที่วัด:
- การเลือกกลยุทธ์
- การใช้เหตุผล
- การวิเคราะห์นิยามและเงื่อนไข
- การเรียงลำดับการพิสูจน์หรือการแก้ปัญหา

SBRA ไม่ควรถูกใช้แทน assessment ทุกแบบ แต่ควรใช้เป็นแกนของกิจกรรมที่ต้องการเห็น “กระบวนการคิด” อย่างชัดเจน
