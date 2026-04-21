# 📚 content/ — สื่อบทเรียนเพิ่มเติม

ที่สำหรับวาง **ไฟล์สื่อประกอบการสอน** — PDF, รูปภาพ, handout, ลิงก์วิดีโอ, โน้ตขยายความ
ผู้ใช้เปิดผ่านหน้า `content/index.html` ซึ่งโหลดรายการจาก `manifest.json`

---

## โครงสร้างโฟลเดอร์

```
content/
├── manifest.json         ← single source of truth (ทุกรายการที่แสดงในหน้าเว็บ)
├── index.html            ← หน้าเบราว์ซ์สื่อ (ไม่ต้องแก้ ยกเว้นอยาก customize UI)
│
├── limits/               ← สื่อเฉพาะลิมิต
│   ├── notes/            ← โน้ตขยายความ (.md, .html)
│   ├── examples/         ← ตัวอย่างเพิ่มเติม
│   ├── handouts/         ← PDF cheatsheet / สไลด์
│   └── media/            ← รูปภาพ, diagram, .svg, .png
│
├── continuity/           ← โครงเดียวกัน
├── differentiation/      ← โครงเดียวกัน
├── integration/          ← โครงเดียวกัน
└── shared/               ← สื่อข้ามหัวข้อ (e.g. สรุป notation ทั้งวิชา)
```

---

## วิธีเพิ่มสื่อใหม่

### ขั้นที่ 1 — วางไฟล์ลงในโฟลเดอร์ที่เหมาะสม

ตัวอย่าง:
- `content/limits/handouts/limit-cheatsheet-v2.pdf`
- `content/differentiation/media/chainrule-diagram.png`
- `content/integration/notes/u-substitution-deep-dive.md`

**ชื่อไฟล์ควร**:
- ใช้ `kebab-case` (อย่าใช้ space / ภาษาไทย)
- อ่านออกว่าเป็นอะไร (ไม่เขียน `file1.pdf`)

### ขั้นที่ 2 — เพิ่ม entry ลง `manifest.json`

เปิด `content/manifest.json` เพิ่มใน array `items`:

```json
{
  "id": "limits-cheatsheet-v2",
  "topic": "limits",
  "title": "สรุปสูตรลิมิต (v2)",
  "description": "cheat sheet หน้าเดียว ครอบคลุม L'Hôpital + ลิมิตพิเศษ",
  "type": "pdf",
  "path": "limits/handouts/limit-cheatsheet-v2.pdf",
  "addedDate": "2026-04-19"
}
```

### ขั้นที่ 3 — ตรวจ

เปิด `content/index.html` (ผ่าน `python -m http.server 8080` ที่ root) —
รายการใหม่ควรโผล่และกดลิงก์แล้วเปิดไฟล์ได้

---

## Schema ของ manifest.json

| field | ต้องใส่? | ค่า | คำอธิบาย |
|---|---|---|---|
| `id` | ✅ | kebab-case | unique ทุกรายการ |
| `topic` | ✅ | `limits` / `continuity` / `differentiation` / `integration` / `shared` | filter / grouping |
| `title` | ✅ | string | หัวเรื่องแสดงในการ์ด |
| `description` | ✅ | string ≤ 160 chars | คำอธิบายสั้น ๆ |
| `type` | ✅ | `pdf` / `md` / `html` / `image` / `video` / `link` / `note` | ประเภทสื่อ (กำหนดไอคอน) |
| `path` | ✅* | relative path ภายใน content/ | `*ไม่จำเป็น` ถ้า `type=link` หรือ `type=video` |
| `url` | ✅* | external URL | `*จำเป็น` ถ้า `type=link` หรือ `type=video` |
| `addedDate` | ✅ | `YYYY-MM-DD` | แสดงเป็น "ใหม่" ถ้า ≤ 14 วัน |
| `tags` | ❌ | `string[]` | tag สำหรับ filter ขั้น advanced |
| `duration` | ❌ | string (e.g. `"8:42"`) | ความยาววิดีโอ |
| `author` | ❌ | string | ชื่อผู้สร้างเนื้อหา |

---

## ประเภท `type` กับการแสดงผล

| type | ไอคอน | การเปิด |
|---|---|---|
| `pdf` | 📄 | เปิดในแท็บใหม่ |
| `md` | 📝 | แสดงแบบ rendered markdown (ผ่าน library หรือ preview) |
| `html` | 🌐 | embed iframe หรือเปิดแท็บใหม่ |
| `image` | 🖼 | preview inline + คลิกดูภาพเต็ม |
| `video` | 🎬 | embed (ถ้า YouTube/Vimeo) หรือลิงก์ออก |
| `link` | 🔗 | เปิดแท็บใหม่ |
| `note` | 💡 | text สั้น ๆ แสดงในการ์ดเลย (ไม่มีไฟล์แยก) |

---

## Tips

- **ไฟล์ขนาดใหญ่** (> 5 MB เช่น วิดีโอ) — แนะนำให้ upload YouTube/Vimeo แล้วใส่เป็น `type: "link"` แทนการ commit
- **รูป diagram** — ใช้ `.svg` ถ้าเป็น vector (เบากว่ามาก); `.png` ถ้าเป็น screenshot
- **Thai ในชื่อไฟล์** — หลีกเลี่ยง (URL encoding ปัญหาบน GitHub Pages บางเคส)
- **ลบสื่อ** — ลบไฟล์ออก + ลบ entry จาก manifest.json (ทั้งคู่)

---

## Linking จากหน้า lesson

ถ้าอยากให้ `lessons.html` (หน้าลิมิต) มีปุ่ม "อ่านเพิ่มเติม" ไปที่สื่อของลิมิต เขียนใน HTML:

```html
<a class="btn btn-sm" href="content/?topic=limits">📚 สื่อเพิ่มเติมเรื่องลิมิต</a>
```

หน้า `content/index.html` รองรับ query string `?topic=<name>` จะ filter ให้อัตโนมัติ
