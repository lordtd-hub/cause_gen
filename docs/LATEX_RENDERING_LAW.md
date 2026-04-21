# LaTeX Rendering Law

เอกสารนี้ล็อกกติกากลางของ repo สำหรับการแสดงผลคณิตศาสตร์และโค้ด LaTeX ในหน้าเว็บ

## เป้าหมาย

- ทุกวิชาที่ generate จาก template นี้ต้องแสดงสูตรคณิตศาสตร์ได้สม่ำเสมอ
- source ต้องเก็บ LaTeX เป็นโค้ด ไม่ใช่แปลงเป็น HTML สำเร็จรูปตั้งแต่ต้นทาง
- หน้าเว็บต้อง render สูตรให้ผู้เรียนเห็นเป็นผลลัพธ์ที่อ่านได้ ไม่หลุดเป็น code ดิบ

## กฎหลัก

1. canonical math source ต้องเป็น LaTeX code ใน `Markdown` หรือ `JSON`
2. ห้าม author สูตรโดยแปะ HTML สำเร็จรูปจากภายนอกเป็นค่าหลักของเนื้อหา
3. output learner-facing ทุกหน้าต้องมี KaTeX assets และ auto-render พร้อมใช้งาน
4. runtime ต้อง render สูตรด้วย `throwOnError: false` เพื่อไม่ทำให้ทั้งหน้าพังเมื่อเจอ snippet ที่ยังไม่สมบูรณ์
5. ถ้า snippet มีปัญหา ให้เห็นเป็นข้อความธรรมดาเฉพาะจุดนั้นได้ แต่ห้ามทำให้หน้าเว็บเสียทั้งหน้า

## Delimiters มาตรฐาน

ระบบต้องรองรับอย่างน้อย:

- display math: `$$ ... $$`
- display math: `\\[ ... \\]`
- inline math: `\\( ... \\)`
- inline math: `$ ... $`

## Authoring Rules

- ใน `modules/*.md` ให้เขียนสูตรเป็น LaTeX ตรง ๆ เช่น `$f(x)=x^2$` หรือ `$$\\int_a^b f(x)\\,dx$$`
- ใน `missions/*.json` ให้เก็บ prompt หรือ option ที่มีสูตรเป็น string ของ LaTeX ได้เลย
- ถ้ามี backslash ใน JSON ต้อง escape ตามกติกาของ JSON เช่น `\\frac{a}{b}`
- ห้ามเปลี่ยนสูตรเป็นรูปภาพถ้ายังสามารถใช้ LaTeX ได้

## Build and Validate Rules

- `templates/layout.html` ต้อง include KaTeX CSS และ auto-render script
- `js/course-runtime.js` ต้องเรียก `renderMathInElement(...)`
- `tools/validate-course.mjs --check-output` ต้อง fail ถ้า output ไม่มี KaTeX assets

## ตัวอย่างที่ควรใช้

- inline: ``สมการ $a_n \\to L$ ใช้บอกการลู่เข้า``
- display:

```tex
$$
\\lim_{x \\to a} f(x) = L
$$
```

- JSON string:

```json
{
  "prompt": "อธิบายว่าทำไม $\\varepsilon$-$\\delta$ definition จึงใช้กับโจทย์นี้ได้"
}
```

