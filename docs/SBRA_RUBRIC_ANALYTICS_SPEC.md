# SBRA Rubric and Analytics Specification v1

เอกสารนี้ต่อยอดจาก [SBRA_SPEC.md](/C:/Users/User/Documents/Cause_gen/docs/SBRA_SPEC.md)
โดยโฟกัส 2 เรื่อง:
- `rubric model` สำหรับประเมินคุณภาพการคิดของผู้เรียน
- `analytics fields` สำหรับเก็บข้อมูลผู้เรียนในระดับที่นำไปวิเคราะห์ต่อได้

## 1. Design Goals

สิ่งที่ spec นี้ต้องการให้ระบบตอบได้:
- ผู้เรียนผิดตรง `process`, `reasoning`, หรือทั้งสองอย่าง
- ผู้เรียนผิดซ้ำใน misconception แบบใด
- ผู้เรียนทำได้เพราะเดา หรือเพราะ reasoning มั่นคง
- ผู้เรียนมั่นใจสอดคล้องกับผลการทำหรือไม่
- ผู้เรียนอ่อนตรง step ไหนของโจทย์มากที่สุด
- CLO ข้อใดมีหลักฐานสนับสนุนว่าบรรลุหรือยังไม่บรรลุ

## 2. Rubric Philosophy

SBRA ไม่ควรให้ภาพแค่ `ถูก/ผิด`

อย่างน้อยควรแยกผลลัพธ์ออกเป็น 4 มิติ:
- `process accuracy`
- `reasoning accuracy`
- `step mastery`
- `confidence calibration`

สำหรับงานที่ต้องการดูความเข้มของคำอธิบายหรือการเขียนประกอบ สามารถเพิ่มมิติรองได้:
- `communication clarity`
- `mathematical integrity`
- `consistency across steps`

## 3. Recommended Rubric Dimensions

### 3.1 Core Dimensions

| Dimension | What it measures | Why it matters |
| --- | --- | --- |
| Process Selection | ผู้เรียนเลือกวิธีหรือกระบวนการแก้ปัญหาได้เหมาะหรือไม่ | แยกว่ารู้ว่าจะ “เริ่มอย่างไร” หรือไม่ |
| Reasoning Quality | ผู้เรียนเข้าใจเหตุผลที่รองรับ process หรือไม่ | แยกว่าตอบถูกเพราะเข้าใจหรือเพราะเดา |
| Step Mastery | ในแต่ละ step ผู้เรียนทำถูกทั้ง process และ reasoning หรือไม่ | เป็นหน่วยวิเคราะห์หลักของ SBRA |
| Confidence Calibration | ความมั่นใจกับคุณภาพคำตอบสอดคล้องกันหรือไม่ | ใช้ดู metacognition |

### 3.2 Optional Extended Dimensions

| Dimension | Use when | Notes |
| --- | --- | --- |
| Communication Clarity | มีคำอธิบายแบบเขียนสั้นหรือ oral explanation | ใช้ rubric 0-3 |
| Mathematical Integrity | ต้องการตรวจการอ้างเหตุผลที่ไม่ข้ามขั้น | เหมาะกับสายพิสูจน์ |
| Consistency Across Steps | โจทย์มีหลาย step ที่ต้องใช้ logic ต่อเนื่อง | ใช้ดูว่าผู้เรียนสลับ strategy กลางทางหรือไม่ |
| Hint Independence | ระบบมี hints/scaffolds ให้ใช้ | ใช้ดูระดับการพึ่งพา scaffold |

## 4. Recommended Performance Levels

แนะนำให้ใช้ระดับ 0-3 เพื่ออ่านง่ายและ map เข้ากับรายงานได้ง่าย

| Level | Label | General meaning |
| --- | --- | --- |
| 0 | Not Yet | ยังไม่แสดงหลักฐานที่พอจะถือว่าบรรลุ |
| 1 | Emerging | เริ่มมีสัญญาณของความเข้าใจ แต่ยังไม่เสถียร |
| 2 | Proficient | ทำได้ถูกต้องในระดับใช้งานได้และอธิบายได้ |
| 3 | Strong | ทำได้มั่นคง สม่ำเสมอ และเชื่อมโยงเหตุผลได้ดี |

### 4.1 Process Selection Rubric

| Level | Descriptor |
| --- | --- |
| 0 | เลือก process ผิดหรือไม่สัมพันธ์กับโจทย์ |
| 1 | เลือก process ใกล้เคียง แต่ยังไม่ตรงเป้าหมายของ step |
| 2 | เลือก process ถูกต้องและสัมพันธ์กับโจทย์ |
| 3 | เลือก process ถูกต้องและมองเห็นทางเลือกอื่นที่ไม่เหมาะพร้อมเหตุผล |

### 4.2 Reasoning Quality Rubric

| Level | Descriptor |
| --- | --- |
| 0 | เหตุผลผิด ไม่เกี่ยว หรือเป็นการเดา |
| 1 | เหตุผลแตะประเด็น แต่ยังคลุมเครือหรืออิงความคุ้นเคยมากกว่าโครงคณิตศาสตร์ |
| 2 | เหตุผลถูกต้องและเชื่อมกับนิยาม/เงื่อนไข/ทฤษฎีบทที่เกี่ยวข้อง |
| 3 | เหตุผลถูกต้อง ชัดเจน และแยกได้ว่าทางเลือกอื่นผิดเพราะอะไร |

### 4.3 Confidence Calibration Rubric

| Pattern | Interpretation |
| --- | --- |
| High confidence + high mastery | เข้าใจมั่นคง |
| Medium confidence + high mastery | เข้าใจดี แต่ยังไม่มั่นใจเต็มที่ |
| Low confidence + high mastery | ทำได้แต่ self-efficacy ยังต่ำ |
| High confidence + low mastery | overconfidence / entrenched misconception |
| Low confidence + low mastery | ยังไม่พร้อมและรู้ว่าตนเองยังไม่พร้อม |

## 5. Mission-Level Rubric Model

แนะนำให้ mission หนึ่งมีทั้ง:
- `step rubric`
- `mission summary rubric`

### 5.1 Step-Level Evaluation

สำหรับแต่ละ step:
- `process_score`
- `reasoning_score`
- `step_mastered`
- `misconception_tags`
- `hint_used`
- `confidence_optional` ถ้าภายหลังต้องการเก็บ confidence ราย step

### 5.2 Mission-Level Evaluation

สำหรับทั้ง mission:
- `process_accuracy_rate`
- `reasoning_accuracy_rate`
- `step_mastery_rate`
- `confidence_alignment`
- `dominant_misconceptions`
- `clo_evidence_strength`

## 6. Suggested Canonical Rubric Fields

แนะนำให้ mission JSON รองรับ field เพิ่มเติมแบบ optional:

- `rubric_model`
- `analytics_schema`

ตัวอย่าง:

```json
{
  "rubric_model": {
    "dimensions": [
      {
        "id": "process_selection",
        "label": "Process Selection",
        "scope": "step",
        "scale": "0-3"
      },
      {
        "id": "reasoning_quality",
        "label": "Reasoning Quality",
        "scope": "step",
        "scale": "0-3"
      },
      {
        "id": "confidence_calibration",
        "label": "Confidence Calibration",
        "scope": "mission",
        "scale": "pattern"
      }
    ],
    "mastery_rule": {
      "step_mastered_when": [
        "process_correct",
        "reasoning_correct"
      ],
      "mission_pass_when": "steps_mastered >= threshold.min_steps_mastered"
    }
  }
}
```

## 7. Learner Analytics Layers

ควรแบ่ง analytics เป็น 3 ชั้น:

### 7.1 Attempt Summary

ใช้ดูผลเร็วของการทำแต่ละครั้ง

ตัวอย่าง field:
- `attempt_id`
- `mission_id`
- `learner_id`
- `started_at`
- `submitted_at`
- `duration_ms`
- `attempt_number`
- `process_correct`
- `reasoning_correct`
- `steps_mastered`
- `confidence_level`
- `confidence_alignment`
- `pass`

### 7.2 Step-Level Response Data

ใช้วิเคราะห์พฤติกรรมเชิงลึก

ตัวอย่าง field:
- `step_id`
- `step_index`
- `process_selected_id`
- `process_correct`
- `reasoning_selected_id`
- `reasoning_correct`
- `step_mastered`
- `hint_used`
- `hint_count`
- `answer_changed`
- `change_count`
- `latency_ms`
- `misconception_tags`
- `clo_evidence_tags`

### 7.3 Aggregate Learner Profile

ใช้ดูภาพรวมรายคน/ราย CLO

ตัวอย่าง field:
- `learner_id`
- `course_id`
- `module_id`
- `clo_id`
- `missions_attempted`
- `missions_passed`
- `avg_process_accuracy`
- `avg_reasoning_accuracy`
- `avg_step_mastery`
- `confidence_alignment_profile`
- `top_misconceptions`
- `hint_dependency_index`
- `retry_persistence_index`

## 8. Recommended Attempt Schema

```json
{
  "attempt_id": "attempt-2026-04-20T20:10:31.000Z",
  "course_id": "math_template_demo",
  "module_id": "working-with-definitions",
  "mission_id": "sbra-definition-diagnosis",
  "clo_id": "CLO2",
  "learner_id": "anonymous-local",
  "attempt_number": 3,
  "started_at": "2026-04-20T20:08:11.000Z",
  "submitted_at": "2026-04-20T20:10:31.000Z",
  "duration_ms": 140000,
  "process_correct": 2,
  "reasoning_correct": 3,
  "steps_mastered": 2,
  "step_mastery_rate": 0.67,
  "confidence_level": "high",
  "confidence_alignment": "overconfident",
  "pass": false,
  "step_results": [
    {
      "step_id": "start",
      "step_index": 1,
      "process_selected_id": "definition-start",
      "process_correct": true,
      "reasoning_selected_id": "reason-definition-open",
      "reasoning_correct": true,
      "step_mastered": true,
      "hint_used": false,
      "latency_ms": 22000,
      "misconception_tags": []
    },
    {
      "step_id": "middle",
      "step_index": 2,
      "process_selected_id": "quote-theorem-without-checking",
      "process_correct": false,
      "reasoning_selected_id": "reason-quote",
      "reasoning_correct": false,
      "step_mastered": false,
      "hint_used": true,
      "latency_ms": 48000,
      "misconception_tags": [
        "theorem-without-condition-check",
        "form-over-reason"
      ]
    }
  ]
}
```

## 9. Misconception Tagging

เพื่อให้ analytics ใช้ต่อได้จริง ควร tag distractors ด้วย `misconception_tags`

ตัวอย่าง tag:
- `definition-misread`
- `condition-ignored`
- `theorem-overgeneralized`
- `example-as-proof`
- `symbol-manipulation-without-meaning`
- `visual-intuition-only`
- `rote-procedure`
- `overconfidence`

ข้อดีของการ tag:
- สรุปภาพรวมของผู้เรียนแต่ละคนได้
- ดู pattern ทั้งห้องได้
- วางแผน remediation ได้ชัดขึ้น

## 10. Confidence Alignment Categories

แนะนำให้แปลงผล confidence เป็น category มาตรฐาน:

| Category | Rule |
| --- | --- |
| calibrated-high | high confidence + pass/high mastery |
| calibrated-low | low confidence + low mastery |
| overconfident | high confidence + fail/low mastery |
| underconfident | low confidence + pass/high mastery |
| mixed | medium confidence หรือผลก้ำกึ่ง |

## 11. Derived Indices

เพื่อรายงานผลระยะยาว สามารถคำนวณดัชนีเพิ่มได้:

- `process_reasoning_gap`
  - ช่องว่างระหว่างการเลือกวิธีกับการเข้าใจเหตุผล
- `hint_dependency_index`
  - สัดส่วนการพึ่ง hints ต่อจำนวน step
- `retry_persistence_index`
  - การกลับมาทำซ้ำจนดีขึ้นหรือไม่
- `misconception_stability_index`
  - misconception เดิมโผล่ซ้ำบ่อยแค่ไหน
- `confidence_misalignment_rate`
  - over/underconfidence บ่อยเพียงใด

## 12. Minimal Runtime Storage Recommendation

ถ้าระบบยังไม่มี backend อย่างน้อยควรเก็บใน local storage:
- `last_attempt_summary`
- `attempt_history` แบบ capped
- `latest_step_results`
- `last_confidence_alignment`

ถ้ามี backend ภายหลัง ค่อยส่ง:
- attempt summary ทุกครั้งที่ submit
- aggregate rollup แยกอีกชั้น

## 13. Privacy and Storage Guidance

- อย่าเก็บข้อมูลผู้เรียนเกินจำเป็น
- ถ้ายังไม่มีระบบ auth ให้ใช้ `anonymous-local` หรือ device-scoped id
- แยก `content analytics` ออกจาก `identity data`
- ถ้าจะ export หรือ sync ควรมี field version ชัดเจน เช่น `analytics_version`

## 14. Recommended Next Implementation Targets

หลังจากใช้ spec นี้ ควรพัฒนาต่อเป็น:
- runtime ที่เก็บ `attempt summary` และ `step results`
- mission option schema ที่รองรับ `misconception_tags`
- dashboard summary ระดับ `mission / module / CLO`
- export format สำหรับส่งต่อไปวิเคราะห์ภายนอก
