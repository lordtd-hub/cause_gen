# Page Skeleton Baseline

เอกสารนี้ล็อก baseline ของหน้า top-level ใน template โดยยึด pattern จาก `examples/calculus1-legacy/` เป็นหลัก

## Goal

เป้าหมายของรอบนี้ไม่ใช่ทำ block ที่ reusable สมบูรณ์ทุกส่วนในทันที แต่คือ:

- ทำ placeholder skeleton ที่บทบาทชัด
- รักษาจังหวะการใช้งานของผู้เรียนให้ใกล้ `cal1`
- กันไม่ให้ Codex หลงไปออกแบบหน้าใหม่เองโดยไม่จำเป็น

## Rule Of Thumb

ถ้ายังตัดสินใจไม่ได้:

1. ดูว่า `cal1` มี section อะไรและเรียงยังไง
2. คงโครงนั้นไว้ก่อน
3. เปลี่ยนเฉพาะข้อความ ตัวอย่าง และ card destinations ให้เข้ากับวิชา
4. ถ้ายังไม่มีเนื้อหาจริง ให้เขียน placeholder ที่บอก purpose ของ section นั้น

## Index Baseline

หน้า `index` ต้องทำหน้าที่เป็น learner home และอย่างน้อยควรมี:

1. `identity card`
2. `hero`
3. `how-to / getting started`
4. `progress / XP dashboard`
5. `badge showcase`
6. `activity map`
7. `reset learner data`

### What Can Vary

- ข้อความต้อนรับ
- ชื่อ badge
- activity cards
- คำอธิบายรายวิชา

### What Should Stay Stable

- เรียงลำดับ section
- identity มาก่อน hero หรืออย่างน้อยอยู่ส่วนบนสุดของหน้า
- มีทางเริ่มต้นชัดเจนมากกว่า 1 ทาง
- มี learner progress ให้เห็นบนหน้าแรก

## Intro Baseline

หน้า `intro` ต้องเป็นหน้าแนะนำผู้เรียน ไม่ใช่หน้าอธิบายระบบ template

### Tone

- เป็นมิตร
- ไม่กดดัน
- ชวนเริ่ม
- ทำให้รู้สึกว่าเริ่มได้แม้ยังไม่มั่นใจ

### Required Skeleton

1. welcome / reassurance
2. what to expect
3. how to start
4. CTA ไป `lessons` หรือ activity แรก

### Avoid

- อธิบาย path อย่าง `courses/...`
- พูดถึง build pipeline
- พูดถึง schema/runtime เป็นเนื้อหาหลัก

## Lessons Baseline

หน้า `lessons` ต้องเป็น lesson hub ของผู้เรียน

### Required Skeleton

1. page intro สั้น
2. roadmap หรือ list ของบท
3. จุดเริ่มต้นที่แนะนำ
4. placeholder สำหรับ progress/filter/state ถ้ายังไม่พร้อมทำเต็ม

## Missions Baseline

หน้า `missions` ต้องเป็น mission hub ของผู้เรียน

### Required Skeleton

1. mission purpose
2. mission cards
3. learner-facing CLO connection
4. placeholder สำหรับผลลัพธ์/สถานะ/คำแนะนำก่อนเริ่ม

## Placeholder Writing Style

placeholder ที่ดีควร:

- บอกว่าตรงนี้มีไว้ทำอะไร
- ใช้ภาษาผู้เรียน ไม่ใช่ภาษาคนทำระบบ
- ไม่อธิบาย implementation details
- สั้น แต่ชี้ทางไปต่อได้

## Decision

ตราบใดที่ยังไม่มีเหตุผลชัดเจนพอ:

- อย่า redesign โครงหน้าใหม่
- ให้ใช้ `cal1` เป็น structural baseline ก่อนเสมอ
