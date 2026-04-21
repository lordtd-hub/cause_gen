---
id: logic-propositions
slug: logic-propositions
title: ตรรกศาสตร์และประพจน์
summary: เริ่มจากข้อความ ค่าความจริง ตัวเชื่อม และการแปลประโยคเชิงตรรกะ
order: 1
clo_ids: ["CLO1"]
module_kind: concept
widgets: ["quick-check","parameter-playground"]
source_refs: []
---

# ตรรกศาสตร์และประพจน์

เริ่มจากข้อความ ค่าความจริง ตัวเชื่อม และการแปลประโยคเชิงตรรกะ

## เป้าหมายของบทเรียน

- Module kind: `concept`
- CLOs: `CLO1`
- จุดเน้นของบทนี้: เติมจุดเน้นที่ต้องการให้ผู้เรียนเข้าใจหลังเรียนจบบท

## โครงเนื้อหาเริ่มต้น

- เติม learning targets ของ module นี้
- เติมตัวอย่างหรือโจทย์หลัก
- เติมจุดที่ผู้เรียนมักสับสน

## แนวทางเติมบทเรียนต่อ

- เติมนิยาม ตัวอย่าง และคำอธิบายที่ช่วยให้ผู้เรียนค่อย ๆ เข้าใจหัวข้อนี้
- ถ้ามีจุดที่ผู้เรียนมักสับสน ให้เพิ่มตัวอย่างเปรียบเทียบหรือคำถามชวนคิดไว้ในบท
- ถ้า module นี้มีภารกิจ SBRA ให้เชื่อมแนวคิดสำคัญของบทกับภารกิจของโมดูลเดียวกัน

## Interactive Draft

:::quick-check
{
  "question": "คำถามทบทวนสำหรับ module \"ตรรกศาสตร์และประพจน์\" ควรถามอะไร?",
  "choices": [
    {
      "label": "คำตอบตัวอย่างที่ถูก",
      "correct": true
    },
    {
      "label": "คำตอบที่ยังไม่พอ",
      "correct": false
    },
    {
      "label": "คำตอบที่สะท้อน misconception",
      "correct": false
    }
  ],
  "explanation": "แทนที่ quick check นี้ด้วยคำถามที่สอดคล้องกับ concept จริงของ module"
}
:::

## Interactive Draft

:::parameter-playground
{
  "title": "ตรรกศาสตร์และประพจน์: Parameter Playground",
  "description": "ใช้ block นี้ทดลองเปลี่ยน parameter แล้วอธิบายผลที่สังเกตเห็น",
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
    "เปลี่ยน parameter ตัวไหนแล้วผลชัดที่สุด?",
    "มี quantity อะไรที่ผู้เรียนควรอธิบายควบคู่กับภาพ?",
    "จุดไหนของ concept นี้ควรชี้ misconception เพิ่ม?"
  ]
}
:::

