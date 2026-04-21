# TQF3 Placeholder Mapping

เอกสารนี้ตอบโจทย์ตรง ๆ ว่า ถ้าไฟล์ `มคอ.3` ของหลายวิชามีหน้าตาและโครงข้อมูลใกล้กัน เราควรมอง `มคอ.3` เป็นแหล่งของ “ไทป์ข้อมูลตั้งต้น” อะไรบ้าง และไทป์ข้อมูลแต่ละแบบควรถูกโยงไปเติม placeholder ส่วนไหนของระบบ

เป้าหมายของเอกสารนี้ไม่ใช่การออกแบบเนื้อหารายวิชาให้เสร็จทันที แต่คือการทำให้ Codex รู้ว่า:

- ข้อมูลแบบไหนเติมได้เลย
- ข้อมูลแบบไหนต้องแปลงก่อน
- ข้อมูลแบบไหนยังไม่พอสำหรับการเติม placeholder เชิงลึก

## 1. หลักคิด

ให้มอง `มคอ.3` เป็น structured input ต้นทาง 7 กลุ่มใหญ่:

1. ข้อมูลระบุตัวรายวิชา
2. คำอธิบายรายวิชา
3. CLOs
4. แผนการสอนรายสัปดาห์หรือรายหัวข้อ
5. วิธีการจัดการเรียนรู้
6. วิธีวัดและประเมินผล
7. เอกสารอ้างอิงและทรัพยากร

เมื่อแยกได้แบบนี้ เราจะไม่เผลอเอา `มคอ.3` ไปใช้เป็นแค่ข้อความยาว ๆ แต่จะใช้มันเป็น source ของ placeholder ได้อย่างเป็นระบบ

## 2. Mapping หลัก: ไทป์ข้อมูลจาก มคอ.3 -> เติม placeholder ตรงไหน

| ไทป์ข้อมูลจาก มคอ.3 | พบได้จากอะไร | เติมได้ตรง ๆ | ต้องแปลงก่อน | ยังไม่พอสำหรับ |
| --- | --- | --- | --- | --- |
| Course identity | รหัสวิชา ชื่อวิชา หน่วยกิต ผู้สอน | `course.config.json`, `index` hero, `intro` at-a-glance | ปรับถ้อยคำให้ learner-facing | module content, mission content |
| Course description | คำอธิบายรายวิชา | `index` overview, `intro` course promise, top-level summary | แตกเป็น topic clusters และ module themes | active learning รายบท, SBRA รายข้อ |
| CLOs | ผลลัพธ์การเรียนรู้รายวิชา | `intro` expectations, `lessons` CLO chips, `missions` CLO labels | ย่อ wording, ผูก Bloom, แยก `introduce / practice / assess` | distractor design, step-level mission design |
| Weekly teaching plan | แผนสอนรายสัปดาห์/หัวข้อ | `lessons` roadmap, module count, module order, module timeline | รวมสัปดาห์เป็นโมดูล, แยก section ย่อย | full lesson prose, worked examples |
| Teaching methods | วิธีสอน/กิจกรรมการเรียนรู้ | `intro` how we learn, `module` active-learning placeholder | แปลงจากภาษาทั่วไปเป็น activity families | widget behavior, exact prompts |
| Assessment plan | สัดส่วนคะแนน วิธีประเมิน | `intro` expectation copy, `missions` framing, assessment explainer | แตกเป็น evidence types เช่น quick-check, proof task, SBRA | problem pool, scoring rubric รายข้อ |
| References/resources | ตำรา เอกสารประกอบ | `resources/manifest.json`, resource cards, seed list | แยกเป็นรายโมดูล/รายหัวข้อ | active learning design, mission logic |
| Learner context or prerequisites | เงื่อนไขวิชาพื้นฐาน/ลักษณะผู้เรียน ถ้ามี | `intro` reassurance, first-step guidance | สรุปเป็น learner-facing tone | mission difficulty tuning รายข้อ |
| Administrative/logistics data | อาจารย์ผู้รับผิดชอบ ภาคเรียน ช่องทางติดต่อ ถ้ามี | `course.config.json`, optional intro info | จัดให้อยู่ในส่วนรอง | lesson structure, mission structure |

## 3. Mapping ตามหน้า placeholder

### 3.1 `index`

ข้อมูลจาก `มคอ.3` ที่เติมได้:

- ชื่อวิชา รหัสวิชา หน่วยกิต
- คำอธิบายรายวิชาฉบับย่อ
- ภาพรวมของหัวข้อหลัก
- ภาพรวมวิธีเรียนและวิธีประเมิน

ควรถูกแปลงไปเป็น:

- hero ของรายวิชา
- overview card
- activity map ระดับบน
- summary stats เช่น จำนวนโมดูล จำนวน CLO จำนวน missions

สิ่งที่ `มคอ.3` ยังไม่ให้ตรง ๆ:

- copy เชิงชวนเรียนแบบเป็นมิตร
- badge narrative
- learner progress text

### 3.2 `intro`

ข้อมูลจาก `มคอ.3` ที่เติมได้:

- จุดมุ่งหมายของรายวิชา
- ลักษณะการเรียนรู้
- วิธีจัดการเรียนการสอน
- ผลลัพธ์การเรียนรู้

ควรถูกแปลงไปเป็น:

- ข้อความแนะนำรายวิชาแบบไม่กดดัน
- “ในวิชานี้เราจะเรียนกันอย่างไร”
- “ผู้เรียนจะค่อย ๆ พัฒนาอะไรได้บ้าง”
- ทางเริ่มต้นที่แนะนำ

กฎสำคัญ:

- `มคอ.3` ให้ข้อมูลเชิงทางการ
- `intro` ต้องแปลงข้อมูลนั้นเป็นภาษาผู้เรียน

### 3.3 `lessons`

ข้อมูลจาก `มคอ.3` ที่เติมได้:

- จำนวนหัวข้อ/สัปดาห์
- ลำดับการสอน
- น้ำหนักของแต่ละช่วง
- ความเชื่อมโยงโดยรวมกับ CLO

ควรถูกแปลงไปเป็น:

- จำนวนโมดูล
- ลำดับโมดูล
- roadmap หรือ rail ของบทเรียน
- module summary ระดับสั้น
- high-level prerequisite flow

กฎสำคัญ:

- สำหรับ template นี้ `weekly plan` คือฐานของ `module count`
- ถ้า `cal1` มี `limit / continuity / differentiation / integration`
  ก็เทียบเชิงโครงกับวิชาใหม่ว่า `มคอ.3` แบ่งก้อนเนื้อหาเป็นอะไรบ้าง แล้วค่อย map เป็น modules

### 3.4 `module page`

ข้อมูลจาก `มคอ.3` ที่เติมได้:

- หัวข้อหลักของแต่ละช่วง
- ประเด็นแนวคิดสำคัญ
- รายชื่อเนื้อหาที่ต้องครอบคลุม
- วิธีสอนที่เหมาะกับหัวข้อนั้น

ควรถูกแปลงไปเป็น placeholder ต่อบท เช่น:

- `module-at-a-glance`
- `module-section-map`
- `module-core-content`
- `module-active-learning`
- `module-checkpoints`
- `module-next-step`

แต่ `มคอ.3` ยังไม่พอสำหรับ:

- ตัวอย่างละเอียด
- counterexample เฉพาะจุด
- widget config จริง
- quick-check รายข้อ

ดังนั้น `มคอ.3` เติม “โครงบท” ได้ดี แต่ยังไม่ใช่ source สุดท้ายของ “กิจกรรมระดับ item”

### 3.5 `missions`

ข้อมูลจาก `มคอ.3` ที่เติมได้:

- รายวิชานี้วัดอะไร
- หัวข้อไหนควรมีการประเมิน
- วิธีประเมินแบบไหนเหมาะกับวิชา
- จุดที่ต้องตอบ CLO

ควรถูกแปลงไปเป็น:

- mission framing ของทั้งหน้า
- mission families ที่ควรมีในวิชานี้
- `CLO -> module -> assessment evidence` mapping
- candidate list ของหัวข้อที่ควรทำ SBRA ก่อน

แต่ `มคอ.3` ยังไม่พอสำหรับ:

- โจทย์จริงแต่ละข้อ
- step ของ SBRA
- distractors
- misconception tags รายตัวเลือก

ดังนั้น `มคอ.3` ใช้เติม “mission placeholder และทิศทางการวัด” ได้ แต่ยังไม่ใช่ mission source เต็มรูปแบบ

### 3.6 `resources`

ข้อมูลจาก `มคอ.3` ที่เติมได้:

- ตำราหลัก
- เอกสารประกอบ
- หนังสืออ้างอิง

ควรถูกแปลงไปเป็น:

- resource seed list
- `resources/manifest.json` รุ่นตั้งต้น
- หมวด resource ตามโมดูลหรือการใช้งาน

## 4. สิ่งที่ควรสกัดจาก มคอ.3 ออกมาเป็นไฟล์กลางก่อนเติม placeholder

ถ้าจะให้ Codex เติม placeholder ได้ง่ายโดยไม่หลง ผมแนะนำให้สกัด `มคอ.3` ออกมาเป็นข้อมูลกลาง 6 ชุดนี้ก่อน

1. `course anchor`
   ใช้กับ `index`, `intro`, `course.config.json`

2. `clo map`
   ใช้กับ `intro`, `lessons`, `missions`, assessment explanation

3. `week-to-module map`
   ใช้กับ `lessons`, `module page`, activity map

4. `teaching-method map`
   ใช้กับ `intro` และ `module-active-learning`

5. `assessment evidence map`
   ใช้กับ `intro`, `missions`, placeholder ของ progress/evidence

6. `resource seed list`
   ใช้กับ `resources`

## 5. ข้อมูลจาก มคอ.3 ที่เติม placeholder ได้เลย vs ข้อมูลที่ต้องแปลง

### เติมได้ค่อนข้างตรง

- ชื่อวิชา
- รหัสวิชา
- ผู้สอน
- หน่วยกิต
- หัวข้อรายสัปดาห์
- รายการ CLO
- รายการเอกสารอ้างอิง

### ต้องแปลงก่อนใช้

- คำอธิบายรายวิชา -> learner-facing course promise
- วิธีสอน -> active learning blocks
- วิธีประเมิน -> evidence types และ mission framing
- weekly topics -> module sections
- CLO wording ทางการ -> copy ที่อ่านง่ายบนหน้าเว็บ

### ยังไม่พอ ต้องมีข้อมูลเพิ่มทีหลัง

- ตัวอย่างละเอียด
- problem pool
- misconceptions รายบท
- quick-check items
- SBRA steps และ distractors
- widget content จริง

## 6. กฎใช้งานกับ Codex

เมื่อ Codex ได้ไฟล์ `มคอ.3` หรือ markdown ที่สกัดจาก `มคอ.3` มา ให้ใช้ลำดับคิดนี้ก่อนเสมอ:

1. จัดหมู่ข้อมูลจาก `มคอ.3` ให้เข้าหนึ่งใน 7 ไทป์หลัก
2. ตัดสินว่าไทป์นั้นเติม placeholder ส่วนไหนได้บ้าง
3. แยกว่าเติมได้ตรง ๆ หรือจำเป็นต้องแปลง
4. จัดหรืออย่างน้อยต้องตรวจ `Week-to-Module Map` ก่อนเริ่ม authoring โมดูลหรือ mission เชิงลึก
5. อย่ารีบกระโดดไปเขียน problem pool หรือ SBRA รายข้อ ถ้า source ที่มีอยู่ยังเป็นแค่ข้อมูลระดับ course/module

## 7. ข้อสรุป

สิ่งที่ `มคอ.3` ให้เราได้แน่ ๆ คือ:

- โครงของรายวิชา
- ทิศของการเรียนรู้
- ทิศของการวัดผล
- โครงของบทเรียน
- โครงของ placeholder

สิ่งที่ `มคอ.3` ยังไม่ให้เราเต็ม ๆ คือ:

- item-level activities
- item-level assessment
- item-level SBRA

ดังนั้นบทบาทที่ถูกต้องของ `มคอ.3` ในโปรเจ็กต์นี้คือ:

- เป็น source หลักของ `placeholder architecture`
- เป็น source รองของ `module content planning`
- เป็นแค่ source ตั้งต้นของ `missions/SBRA`, ไม่ใช่ source ปลายทาง
