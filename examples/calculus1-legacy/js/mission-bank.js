/* ============================================================
   MISSION BANK — OBE + Bloom + Question Pool
   ------------------------------------------------------------
   • แต่ละภารกิจมี "pool" หลายข้อ สุ่ม "draw" ข้อ/รอบ
   • เหมาะกับนักเรียน 20 คน — ทุกคนได้ข้อไม่ซ้ำกันในเซ็ต
   • CLO thresholds ปรับได้ที่ CLO_REGISTRY
   ============================================================ */

const BLOOM_LABELS = [
  null,
  { name:'จดจำ',        en:'Remember',   color:'#94a3b8' },
  { name:'เข้าใจ',       en:'Understand', color:'#22d3ee' },
  { name:'ประยุกต์',     en:'Apply',      color:'#60a5fa' },
  { name:'วิเคราะห์',    en:'Analyze',    color:'#facc15' },
  { name:'ประเมิน',      en:'Evaluate',   color:'#fb7185' },
  { name:'สร้างสรรค์',   en:'Create',     color:'#8b5cf6' },
];

const MISSION_TOPICS = [
  { id:'limits',          label:'ลิมิต',      ready:true  },
  { id:'continuity',      label:'ต่อเนื่อง',  ready:true  },
  { id:'differentiation', label:'อนุพันธ์',   ready:true  },
  { id:'integration',     label:'ปริพันธ์',   ready:true  },
];

/* ============ CLO Registry (ปรับเกณฑ์ได้ที่นี่) ============ */

const CLO_REGISTRY = {
  'CLO-C1': {
    id:'CLO-C1', topic:'continuity', bloom:1,
    label:'จำนิยามและประเภทของความไม่ต่อเนื่อง',
    missionId:'cont-m1',
    // เกณฑ์บรรลุ (ปรับได้):
    threshold: { minCorrectInSet: 4, totalInSet: 5, drillStreakToPass: 5 },
  },
  'CLO-C2': {
    id:'CLO-C2', topic:'continuity', bloom:2,
    label:'อธิบายกราฟกับประเภทความไม่ต่อเนื่อง',
    missionId:'cont-m2',
    threshold: { minPairsCorrect: 4, drillStreakToPass: 3 },
  },
  'CLO-C3': {
    id:'CLO-C3', topic:'continuity', bloom:3,
    label:'คำนวณพารามิเตอร์ให้ฟังก์ชันต่อเนื่อง',
    missionId:'cont-m3',
    threshold: { tolerance: 0.01, drillStreakToPass: 3 },
  },
  'CLO-C4': {
    id:'CLO-C4', topic:'continuity', bloom:4,
    label:'วินิจฉัยประเภทและอ้างเหตุผลได้',
    missionId:'cont-m4',
    threshold: { drillStreakToPass: 3 },
  },
  'CLO-C5': {
    id:'CLO-C5', topic:'continuity', bloom:5,
    label:'ประเมินและหาข้อผิดในการพิสูจน์',
    missionId:'cont-m5',
    threshold: { drillStreakToPass: 3 },
  },
  'CLO-C6': {
    id:'CLO-C6', topic:'continuity', bloom:6,
    label:'สร้างตัวอย่างฟังก์ชันตามเงื่อนไข',
    missionId:'cont-m6',
    threshold: { minChecksPass: 3, drillStreakToPass: 2 },
  },

  /* ───── LIMITS ───── */
  'CLO-L1': { id:'CLO-L1', topic:'limits', bloom:1,
    label:'จำลิมิตมาตรฐานและสมบัติพื้นฐาน', missionId:'lim-m1',
    threshold:{ minCorrectInSet:4, totalInSet:5, drillStreakToPass:5 } },
  'CLO-L2': { id:'CLO-L2', topic:'limits', bloom:2,
    label:'เข้าใจแนวคิดลิมิตและรูปไม่กำหนด', missionId:'lim-m2',
    threshold:{ minCorrectInSet:3, totalInSet:4, drillStreakToPass:4 } },
  'CLO-L3': { id:'CLO-L3', topic:'limits', bloom:3,
    label:'คำนวณลิมิตด้วยเทคนิคต่างๆ', missionId:'lim-m3',
    threshold:{ tolerance:0.01, drillStreakToPass:3 } },
  'CLO-L4': { id:'CLO-L4', topic:'limits', bloom:4,
    label:'เลือก/วิเคราะห์เทคนิคการหาลิมิต', missionId:'lim-m4',
    threshold:{ drillStreakToPass:3 } },
  'CLO-L5': { id:'CLO-L5', topic:'limits', bloom:5,
    label:'ประเมินและหาข้อผิดของการพิสูจน์ลิมิต', missionId:'lim-m5',
    threshold:{ drillStreakToPass:3 } },
  'CLO-L6': { id:'CLO-L6', topic:'limits', bloom:6,
    label:'สร้างโจทย์ลิมิตตามเงื่อนไข', missionId:'lim-m6',
    threshold:{ minChecksPass:2, drillStreakToPass:2 } },

  /* ───── DIFFERENTIATION ───── */
  'CLO-D1': { id:'CLO-D1', topic:'differentiation', bloom:1,
    label:'จำสูตรอนุพันธ์พื้นฐานและอดิศัย', missionId:'dif-m1',
    threshold:{ minCorrectInSet:4, totalInSet:5, drillStreakToPass:5 } },
  'CLO-D2': { id:'CLO-D2', topic:'differentiation', bloom:2,
    label:'เข้าใจความหมายของอนุพันธ์ (เรขาคณิต/อัตราการเปลี่ยนแปลง)', missionId:'dif-m2',
    threshold:{ minCorrectInSet:3, totalInSet:4, drillStreakToPass:4 } },
  'CLO-D3': { id:'CLO-D3', topic:'differentiation', bloom:3,
    label:'หาอนุพันธ์และความชันของเส้นสัมผัส', missionId:'dif-m3',
    threshold:{ tolerance:0.01, drillStreakToPass:3 } },
  'CLO-D4': { id:'CLO-D4', topic:'differentiation', bloom:4,
    label:'วิเคราะห์จุดวิกฤตและความสัมพันธ์ $f, f\'$', missionId:'dif-m4',
    threshold:{ drillStreakToPass:3 } },
  'CLO-D5': { id:'CLO-D5', topic:'differentiation', bloom:5,
    label:'ประเมินและหาข้อผิดของการหาอนุพันธ์', missionId:'dif-m5',
    threshold:{ drillStreakToPass:3 } },
  'CLO-D6': { id:'CLO-D6', topic:'differentiation', bloom:6,
    label:'สร้างฟังก์ชันที่มีคุณสมบัติตามเงื่อนไข', missionId:'dif-m6',
    threshold:{ minChecksPass:2, drillStreakToPass:2 } },

  /* ───── INTEGRATION ───── */
  'CLO-I1': { id:'CLO-I1', topic:'integration', bloom:1,
    label:'จำสูตรแอนติเดริเวทีฟและ FTC', missionId:'int-m1',
    threshold:{ minCorrectInSet:4, totalInSet:5, drillStreakToPass:5 } },
  'CLO-I2': { id:'CLO-I2', topic:'integration', bloom:2,
    label:'เข้าใจแนวคิดปริพันธ์ (การสะสม/พื้นที่/FTC)', missionId:'int-m2',
    threshold:{ minCorrectInSet:3, totalInSet:4, drillStreakToPass:4 } },
  'CLO-I3': { id:'CLO-I3', topic:'integration', bloom:3,
    label:'คำนวณปริพันธ์จำกัดเขตและไม่จำกัด', missionId:'int-m3',
    threshold:{ tolerance:0.02, drillStreakToPass:3 } },
  'CLO-I4': { id:'CLO-I4', topic:'integration', bloom:4,
    label:'วิเคราะห์ผลรวมรีมันน์และวงศ์แอนติเดริเวทีฟ', missionId:'int-m4',
    threshold:{ drillStreakToPass:3 } },
  'CLO-I5': { id:'CLO-I5', topic:'integration', bloom:5,
    label:'ประเมินและหาข้อผิดของการหาปริพันธ์', missionId:'int-m5',
    threshold:{ drillStreakToPass:3 } },
  'CLO-I6': { id:'CLO-I6', topic:'integration', bloom:6,
    label:'สร้างตัวอย่างปริพันธ์ตามเงื่อนไข', missionId:'int-m6',
    threshold:{ minChecksPass:2, drillStreakToPass:2 } },
};

/* =====================================================
   POOL: Remember (M1) — 22 ข้อ, สุ่มหยิบ 5 ข้อ/รอบ
   ===================================================== */

const POOL_M1_REMEMBER = [
  { q:'ถ้า $f(a)$ ไม่นิยาม แต่ $\\lim_{x\\to a} f(x)$ มีค่า → เรียกความไม่ต่อเนื่องแบบใด?',
    opts:['ถอดได้','กระโดด','ไม่จำกัด','ต่อเนื่อง'], ans:0 },
  { q:'$\\lim_{x\\to 0^-} \\dfrac{|x|}{x} = \\,?$',
    opts:['$-1$','$0$','$+1$','หาค่าไม่ได้'], ans:0 },
  { q:'$\\lim_{x\\to 0^+} \\dfrac{|x|}{x} = \\,?$',
    opts:['$-1$','$0$','$+1$','$\\infty$'], ans:2 },
  { q:'เมื่อลิมิตซ้ายไม่เท่ากับลิมิตขวาที่ $a$ → เรียกว่าแบบใด?',
    opts:['ถอดได้','กระโดด','ไม่จำกัด','ต่อเนื่อง'], ans:1 },
  { q:'$\\lim_{x\\to 1} \\dfrac{1}{(x-1)^2} = \\,?$',
    opts:['$0$','$-\\infty$','$+\\infty$','$1$'], ans:2 },
  { q:'ฟังก์ชันพหุนาม (เช่น $x^3+2x$) ต่อเนื่องที่ใดบ้าง?',
    opts:['เฉพาะ $x>0$','ทุก $x\\in\\mathbb{R}$','เฉพาะจำนวนเต็ม','เฉพาะ $|x|<1$'], ans:1 },
  { q:'$\\tan x$ ต่อเนื่องที่ $x = \\pi/2$ หรือไม่?',
    opts:['ต่อเนื่อง','ไม่ต่อเนื่อง (asymptote)','ต่อเนื่องเพียงข้างเดียว','ขึ้นกับโดเมน'], ans:1 },
  { q:'ถ้า $f$ ต่อเนื่องที่ $a$ การหา $\\lim_{x\\to a} f(x)$ ทำได้โดย?',
    opts:['ใช้ L\'Hospital เสมอ','แทน $x=a$ ตรงๆ','ต้องใช้คอนจูเกต','เดาจากกราฟ'], ans:1 },
  { q:'$\\lim_{x\\to 3} \\dfrac{x^2-9}{x-3} = \\,?$',
    opts:['$0$','$3$','$6$','$9$'], ans:2 },
  { q:'$\\lfloor 2.7 \\rfloor = \\,?$',
    opts:['$2$','$3$','$2.7$','$0.7$'], ans:0 },
  { q:'$\\lfloor x \\rfloor$ ที่จำนวนเต็ม: ต่อเนื่องทางใด?',
    opts:['ซ้ายเท่านั้น','ขวาเท่านั้น','ทั้งสองข้าง','ไม่ต่อเนื่องทั้งสองข้าง'], ans:1 },
  { q:'$e^x$ ต่อเนื่องที่ใด?',
    opts:['เฉพาะ $x\\ge 0$','ทุก $x\\in\\mathbb{R}$','เฉพาะ $x>0$','ไม่ต่อเนื่องที่ $0$'], ans:1 },
  { q:'$\\ln x$ ต่อเนื่องบนช่วงใด?',
    opts:['$(-\\infty,\\infty)$','$[0,\\infty)$','$(0,\\infty)$','$(-\\infty,0)$'], ans:2 },
  { q:'$\\dfrac{1}{x}$ ไม่ต่อเนื่องที่ $x = \\,?$',
    opts:['$-1$','$0$','$1$','ต่อเนื่องทุกที่'], ans:1 },
  { q:'สำหรับ $f$ ต่อเนื่องที่ $a$: $\\lim_{x\\to a} f(x) = \\,?$',
    opts:['$0$','$\\infty$','$f(a)$','ค่าใดก็ได้'], ans:2 },
  { q:'ถ้า $f, g$ ต่อเนื่องที่ $a$ แล้ว $f+g$ ต่อเนื่องที่ $a$ หรือไม่?',
    opts:['ใช่ เสมอ','ไม่ จำเป็น','ขึ้นกับค่า $a$','ขึ้นกับเครื่องหมาย'], ans:0 },
  { q:'ฟังก์ชันประกอบ $(f\\circ g)$ ต่อเนื่องที่ $a$ เมื่อ?',
    opts:['$g$ ต่อเนื่องที่ $a$ เท่านั้น','$f$ ต่อเนื่องที่ $a$ เท่านั้น',
          '$g$ ต่อเนื่องที่ $a$ และ $f$ ต่อเนื่องที่ $g(a)$','$f, g$ เป็นพหุนาม'], ans:2 },
  { q:'$\\sqrt{x}$ ต่อเนื่องที่ $x = -1$ หรือไม่?',
    opts:['ต่อเนื่อง','ไม่ต่อเนื่อง (ไม่นิยามในจำนวนจริง)','ต่อเนื่องข้างขวา','ขึ้นกับนิยาม'], ans:1 },
  { q:'ความไม่ต่อเนื่องแบบใดที่ "แก้ได้" โดยนิยามค่า $f(a)$ ใหม่?',
    opts:['กระโดด','ไม่จำกัด','ถอดได้','แก้ไม่ได้ทุกแบบ'], ans:2 },
  { q:'ฟังก์ชัน $\\sin(1/x)$ ที่ $x=0$: ลิมิต?',
    opts:['มีค่า $=0$','มีค่า $=1$','ไม่มีค่า (oscillating)','$+\\infty$'], ans:2 },
  { q:'ถ้าลิมิตซ้าย $= 2$, ลิมิตขวา $= 2$, แต่ $f(a) = 5$ → ต่อเนื่องที่ $a$?',
    opts:['ต่อเนื่อง เพราะลิมิตมีค่า','ไม่ต่อเนื่อง เพราะ $\\lim \\ne f(a)$','แบบถอดได้','แบบกระโดด'], ans:1 },
  { q:'$f(x) = \\dfrac{x^2-1}{x-1}$ ที่ $x=1$: $\\lim = \\,?$',
    opts:['$0$','$1$','$2$','หาไม่ได้'], ans:2 },
];

/* =====================================================
   POOL: Understand (M2) — match graph to type
   แต่ละรอบสุ่ม 4 จาก 6 กราฟ
   ===================================================== */

const POOL_M2_GRAPHS = [
  { id:'g-rem1', kind:'removable', expr:'(x^2-4)/(x-2)', hole:{x:2,y:4},   xRange:[-1,5], yRange:[-2,7] },
  { id:'g-rem2', kind:'removable', expr:'(x^2-1)/(x-1)', hole:{x:1,y:2},   xRange:[-3,3], yRange:[-3,5] },
  { id:'g-jmp1', kind:'jump',      expr:'floor(x)',                          xRange:[-1,4], yRange:[-2,5] },
  { id:'g-jmp2', kind:'jump',      expr:'sign(x)',                           xRange:[-3,3], yRange:[-2,2] },
  { id:'g-inf1', kind:'infinite',  expr:'1/((x-1)^2)',    asymptote:1,      xRange:[-1,3], yRange:[-1,12] },
  { id:'g-inf2', kind:'infinite',  expr:'1/(x+1)',        asymptote:-1,     xRange:[-3,2], yRange:[-10,10] },
  { id:'g-con1', kind:'continuous',expr:'x^2',                               xRange:[-3,3], yRange:[-1,9] },
  { id:'g-con2', kind:'continuous',expr:'sin(x)',                            xRange:[-6,6], yRange:[-1.5,1.5] },
];

const M2_LABELS = [
  { id:'L-removable',  text:'ถอดได้ (Removable)',   kind:'removable' },
  { id:'L-jump',       text:'กระโดด (Jump)',         kind:'jump' },
  { id:'L-infinite',   text:'ไม่จำกัด (Infinite)',   kind:'infinite' },
  { id:'L-continuous', text:'ต่อเนื่อง (Continuous)', kind:'continuous' },
];

/* =====================================================
   POOL: Apply (M3) — หาค่า k (7 variants)
   ===================================================== */

const POOL_M3_NUMERIC = [
  { prompt:'ให้ $f(x) = \\begin{cases} x^2 + 1, & x < 2 \\\\ kx - 1, & x \\ge 2 \\end{cases}$ หาค่า $k$ ที่ทำให้ $f$ ต่อเนื่องที่ $x = 2$',
    hint:'ใช้ $\\lim_{x\\to 2^-} f(x) = \\lim_{x\\to 2^+} f(x)$',
    solution:['$\\lim_{x\\to 2^-}(x^2+1)=5$','$\\lim_{x\\to 2^+}(kx-1)=2k-1$','$5=2k-1 \\Rightarrow k=3$'],
    answer:3 },
  { prompt:'ให้ $f(x) = \\begin{cases} kx + 1, & x \\le 1 \\\\ x^2 + 2, & x > 1 \\end{cases}$ หาค่า $k$ ที่ทำให้ $f$ ต่อเนื่องที่ $x = 1$',
    hint:'เทียบสองลิมิตข้างจุด $x=1$',
    solution:['$f(1)=k+1$','$\\lim_{x\\to 1^+}(x^2+2)=3$','$k+1=3 \\Rightarrow k=2$'],
    answer:2 },
  { prompt:'หาค่า $c$ ที่ทำให้ $f(x) = \\begin{cases} x+c, & x \\le 2 \\\\ x^2-1, & x>2 \\end{cases}$ ต่อเนื่อง',
    hint:'ลิมิตขวาที่ $x=2$ คือ $4-1=3$',
    solution:['$\\lim_{x\\to 2^+}(x^2-1)=3$','$2+c=3 \\Rightarrow c=1$'],
    answer:1 },
  { prompt:'$f(x) = \\begin{cases} \\dfrac{x^2-4}{x-2}, & x\\ne 2 \\\\ A, & x = 2 \\end{cases}$ ค่า $A$ ใดทำให้ $f$ ต่อเนื่องที่ $x=2$?',
    hint:'ลดรูปเศษส่วน แล้วแทนค่า',
    solution:['$\\dfrac{x^2-4}{x-2} = x+2$','$\\lim_{x\\to 2}(x+2)=4$','$A = 4$'],
    answer:4 },
  { prompt:'หาค่า $k$ ที่ทำให้ $\\lim_{x\\to 0} \\dfrac{\\sin(kx)}{x} = 5$',
    hint:'$\\lim_{x\\to 0}\\dfrac{\\sin(kx)}{kx} = 1$',
    solution:['$\\dfrac{\\sin(kx)}{x} = k\\cdot\\dfrac{\\sin(kx)}{kx}$','ดังนั้นลิมิต $= k$','$k = 5$'],
    answer:5 },
  { prompt:'ให้ $f(x) = \\begin{cases} 3x - k, & x < 0 \\\\ x^2 + 4, & x \\ge 0 \\end{cases}$ หาค่า $k$ ที่ทำให้ $f$ ต่อเนื่องที่ $x=0$',
    hint:'$f(0) = 4$',
    solution:['$\\lim_{x\\to 0^-}(3x-k) = -k$','ต้อง $-k=4 \\Rightarrow k=-4$'],
    answer:-4 },
  { prompt:'$f(x) = \\begin{cases} \\dfrac{x^2-9}{x-3}, & x\\ne 3 \\\\ B, & x=3 \\end{cases}$ หาค่า $B$ ให้ $f$ ต่อเนื่อง',
    hint:'แยกตัวประกอบเศษ: $x^2-9=(x-3)(x+3)$',
    solution:['$\\dfrac{(x-3)(x+3)}{x-3}=x+3$','$\\lim_{x\\to 3}(x+3)=6$','$B=6$'],
    answer:6 },
];

/* =====================================================
   POOL: Analyze (M4) — diagnose type + reasoning (5 variants)
   ===================================================== */

const POOL_M4_ANALYZE = [
  { prompt:'พิจารณา $f(x) = \\dfrac{|x - 1|}{x - 1}$ ที่ $x = 1$',
    primary:{ question:'ประเภท:', opts:['ถอดได้','กระโดด (Jump)','ไม่จำกัด','ต่อเนื่อง'], ans:1 },
    secondary:{ question:'เลือกเหตุผลที่ถูกต้อง (ทุกข้อที่ใช่):',
      opts:['ลิมิตซ้าย $= -1$','ลิมิตขวา $= +1$','ลิมิตซ้าย $=$ ลิมิตขวา','$f(1)$ ไม่นิยาม (หาร $0$)','ลิมิตไปอนันต์'],
      correctSet:[0,1,3] } },
  { prompt:'พิจารณา $f(x) = \\dfrac{x^2 - 1}{x - 1}$ ที่ $x = 1$',
    primary:{ question:'ประเภท:', opts:['ถอดได้ (Removable)','กระโดด','ไม่จำกัด','ต่อเนื่อง'], ans:0 },
    secondary:{ question:'เหตุผลที่ถูกต้อง:',
      opts:['แยกตัวประกอบได้ $(x-1)(x+1)$','ลิมิตมีค่า $= 2$','$f(1)$ ไม่นิยาม','ลิมิตซ้าย $\\ne$ ลิมิตขวา','ลิมิตเป็นอนันต์'],
      correctSet:[0,1,2] } },
  { prompt:'พิจารณา $f(x) = \\dfrac{1}{x + 2}$ ที่ $x = -2$',
    primary:{ question:'ประเภท:', opts:['ถอดได้','กระโดด','ไม่จำกัด (Infinite)','ต่อเนื่อง'], ans:2 },
    secondary:{ question:'เหตุผลที่ถูกต้อง:',
      opts:['ตัวส่วน $\\to 0$ แต่ตัวเศษ $\\ne 0$','มีเส้นกำกับแนวดิ่งที่ $x=-2$','ลิมิตซ้าย $= -\\infty$','ลิมิตขวา $= +\\infty$','$f(-2) = 0$'],
      correctSet:[0,1,2,3] } },
  { prompt:'พิจารณา $f(x) = \\dfrac{\\sin x}{x}$ ที่ $x = 0$',
    primary:{ question:'ประเภท:', opts:['ถอดได้ (Removable)','กระโดด','ไม่จำกัด','ต่อเนื่อง'], ans:0 },
    secondary:{ question:'เหตุผลที่ถูกต้อง:',
      opts:['ลิมิต $= 1$','$f(0)$ ไม่นิยาม (หาร $0$)','เติมค่า $f(0)=1$ แล้วต่อเนื่อง','ลิมิตเป็นอนันต์','เป็นฟังก์ชัน periodic'],
      correctSet:[0,1,2] } },
  { prompt:'พิจารณา $f(x) = \\lfloor x \\rfloor$ ที่ $x = 2$',
    primary:{ question:'ประเภท:', opts:['ถอดได้','กระโดด (Jump)','ไม่จำกัด','ต่อเนื่อง'], ans:1 },
    secondary:{ question:'เหตุผลที่ถูกต้อง:',
      opts:['ลิมิตซ้าย $= 1$','ลิมิตขวา $= 2$','$f(2) = 2$','ลิมิตซ้าย $\\ne$ ลิมิตขวา','เป็นความไม่ต่อเนื่องแบบอนันต์'],
      correctSet:[0,1,2,3] } },
];

/* =====================================================
   POOL: Evaluate (M5) — error-finding (5 variants)
   ===================================================== */

const POOL_M5_EVALUATE = [
  { prompt:'นักเรียนอ้างว่า $f(x) = \\dfrac{x^2 - 4}{x - 2}$ "ต่อเนื่องที่ $x = 2$" — คลิกบรรทัดที่<strong>ผิด</strong>:',
    steps:[
      { line:'บรรทัด 1: ตัวเศษ: $2^2 - 4 = 0$', ok:true },
      { line:'บรรทัด 2: ตัวส่วน: $2 - 2 = 0$', ok:true },
      { line:'บรรทัด 3: $0 \\div 0 = 0$ ดังนั้น $f(2) = 0$', ok:false },
      { line:'บรรทัด 4: $f(2)$ นิยามแล้ว จึงต่อเนื่อง', ok:false },
    ], wrongLine:2,
    fixQuestion:'การแก้ที่ถูก:',
    fixOpts:[
      '$f(2)$ <strong>ไม่นิยาม</strong> (รูป $0/0$) แต่ $\\lim = 4$ → ถอดได้',
      '$f(2)=0$ ถูกแล้ว',
      '$f$ ต่อเนื่องเพราะลิมิตมีค่า โดยไม่สนใจ $f(2)$',
    ], fixAns:0 },
  { prompt:'นักเรียนคำนวณ $\\lim_{x\\to 1}\\dfrac{x^2-1}{x-1}$ ดังนี้ — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: แทน $x=1$: ได้ $\\dfrac{0}{0}$', ok:true },
      { line:'บรรทัด 2: $\\dfrac{x^2-1}{x-1} = x - 1$ (ตัดเศษกับส่วน)', ok:false },
      { line:'บรรทัด 3: $\\lim_{x\\to 1}(x-1) = 0$', ok:true },
    ], wrongLine:1,
    fixQuestion:'การแยกตัวประกอบที่ถูก:',
    fixOpts:[
      '$x^2-1 = (x-1)(x+1)$ ตัดกับ $x-1$ เหลือ $x+1$ → ลิมิต $=2$',
      '$x^2-1 = (x-1)^2$ → ตัดเหลือ $x-1$',
      'ใช้ L\'Hospital: ลิมิต $=0$',
    ], fixAns:0 },
  { prompt:'นักเรียนอ้าง $f(x)=\\dfrac{1}{x}$ "ต่อเนื่องบน $\\mathbb{R}$" — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: $f$ เป็นฟังก์ชันตรรกยะ', ok:true },
      { line:'บรรทัด 2: ฟังก์ชันตรรกยะต่อเนื่องในโดเมน', ok:true },
      { line:'บรรทัด 3: ดังนั้น $f$ ต่อเนื่องบน $\\mathbb{R}$ ทั้งหมด', ok:false },
    ], wrongLine:2,
    fixQuestion:'ข้อสรุปที่ถูก:',
    fixOpts:[
      'ต่อเนื่องบน $\\mathbb{R}\\setminus\\{0\\}$ (ไม่รวม $0$)',
      'ต่อเนื่องเฉพาะ $x > 0$',
      'ไม่ต่อเนื่องที่ไหนเลย',
    ], fixAns:0 },
  { prompt:'พิจารณาการพิสูจน์: "$f(x)=|x|$ มีลิมิตที่ $x=0$ แต่ไม่ต่อเนื่อง"',
    steps:[
      { line:'บรรทัด 1: $\\lim_{x\\to 0^-}|x| = 0$', ok:true },
      { line:'บรรทัด 2: $\\lim_{x\\to 0^+}|x| = 0$', ok:true },
      { line:'บรรทัด 3: ลิมิตมีค่า = 0', ok:true },
      { line:'บรรทัด 4: $f(0) = 0$ แต่ไม่ต่อเนื่อง', ok:false },
    ], wrongLine:3,
    fixQuestion:'ข้อสรุปที่ถูก:',
    fixOpts:[
      '$\\lim = f(0) = 0$ → $f$ <strong>ต่อเนื่อง</strong>ที่ $0$',
      'ไม่ต่อเนื่องเพราะกราฟมีมุมแหลม',
      '$|x|$ ไม่ต่อเนื่องที่จุดมุม',
    ], fixAns:0 },
  { prompt:'นักเรียนสรุปว่า "$f(x)=\\lfloor x\\rfloor$ ต่อเนื่องที่ $x=2$" — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: $f(2) = \\lfloor 2 \\rfloor = 2$', ok:true },
      { line:'บรรทัด 2: $\\lim_{x\\to 2^+}\\lfloor x\\rfloor = 2$', ok:true },
      { line:'บรรทัด 3: $\\lim_{x\\to 2^-}\\lfloor x\\rfloor = 2$', ok:false },
      { line:'บรรทัด 4: ลิมิต $= f(2)$ → ต่อเนื่อง', ok:false },
    ], wrongLine:2,
    fixQuestion:'ลิมิตซ้ายที่แท้จริง:',
    fixOpts:[
      'ลิมิตซ้าย $= 1$ (ไม่เท่ากับลิมิตขวา) → <strong>ไม่ต่อเนื่อง</strong> แบบ Jump',
      'ลิมิตซ้าย $= 2$ เพราะ $\\lfloor$ ปัดขึ้น',
      'ลิมิตซ้าย $= 3$',
    ], fixAns:0 },
];

/* =====================================================
   POOL: Create (M6) — build function meeting criteria (4 variants)
   ===================================================== */

function makeContinuousAt(a) {
  return function(fn) {
    try {
      const c = fn(a), l = fn(a - 1e-5), r = fn(a + 1e-5);
      if (c===null || l===null || r===null) return false;
      if (!isFinite(c) || !isFinite(l) || !isFinite(r)) return false;
      return Math.abs(l - r) < 1e-3 && Math.abs(c - l) < 1e-3;
    } catch (_) { return false; }
  };
}
function makeDiscontinuousAt(a) {
  return function(fn) {
    try {
      const c = fn(a);
      const l = fn(a - 1e-5), r = fn(a + 1e-5);
      if (c === null || !isFinite(c)) return true;
      if (l === null || r === null || !isFinite(l) || !isFinite(r)) return true;
      return Math.abs(l - r) > 1e-2 || Math.abs(c - l) > 1e-2;
    } catch (_) { return true; }
  };
}
function nonTrivial(fn) {
  try {
    const probes = [-2,-1,0,1,2,4,5,6];
    const vals = probes.map(x => fn(x)).filter(v => v!==null && isFinite(v));
    if (vals.length < 3) return false;
    const lo = Math.min(...vals), hi = Math.max(...vals);
    return (hi - lo) > 0.05;
  } catch (_) { return false; }
}

const POOL_M6_CREATE = [
  { id:'cv1', prompt:'สร้าง $f(x)$ ที่ <strong>ต่อเนื่องที่ $x=2$</strong> แต่ <strong>ไม่ต่อเนื่องที่ $x=3$</strong> (ไม่เป็นค่าคงที่)',
    hint:'ลองใส่ตัวส่วนเป็น $(x-3)$ เช่น $\\dfrac{x^2}{x-3}$',
    example:'x^2 / (x - 3)',
    placeholder:'เช่น  x^2/(x-3)',
    checks:[
      { id:'c2',  label:'ต่อเนื่องที่ $x=2$',      test: makeContinuousAt(2) },
      { id:'d3',  label:'ไม่ต่อเนื่องที่ $x=3$',   test: makeDiscontinuousAt(3) },
      { id:'nt',  label:'ไม่เป็นค่าคงที่',          test: nonTrivial },
    ]
  },
  { id:'cv2', prompt:'สร้าง $f(x)$ ที่ <strong>ไม่ต่อเนื่องแบบถอดได้ที่ $x=1$</strong> (limit มีค่า แต่ $f(1)$ ไม่นิยาม หรือไม่เท่ากับ limit)',
    hint:'ลอง $\\dfrac{x^2-1}{x-1}$ (ลิมิต $=2$ แต่ $f(1)$ หาร $0$)',
    example:'(x^2 - 1) / (x - 1)',
    placeholder:'เช่น  (x^2-1)/(x-1)',
    checks:[
      { id:'d1', label:'ไม่ต่อเนื่องที่ $x=1$', test: makeDiscontinuousAt(1) },
      { id:'limExists', label:'ลิมิตที่ $x=1$ มีค่า (finite)',
        test: function(fn) {
          try {
            const l = fn(1-1e-5), r = fn(1+1e-5);
            return l!==null && r!==null && isFinite(l) && isFinite(r) && Math.abs(l-r)<1e-3;
          } catch (_) { return false; }
        }
      },
      { id:'nt', label:'ไม่เป็นค่าคงที่', test: nonTrivial },
    ]
  },
  { id:'cv3', prompt:'สร้าง $f(x)$ ที่มี <strong>asymptote ที่ $x=0$</strong> (ลิมิตเป็นอนันต์)',
    hint:'ลอง $1/x^2$',
    example:'1 / x^2',
    placeholder:'เช่น  1/x^2  หรือ  1/(x^2) + x',
    checks:[
      { id:'inf0', label:'$|f(x)| \\to \\infty$ เมื่อ $x\\to 0$',
        test: function(fn) {
          try {
            const l = fn(-1e-4), r = fn(1e-4);
            return (l!==null && Math.abs(l) > 1000) || (r!==null && Math.abs(r) > 1000);
          } catch (_) { return false; }
        }
      },
      { id:'c1', label:'ต่อเนื่องที่ $x=1$', test: makeContinuousAt(1) },
      { id:'nt', label:'ไม่เป็นค่าคงที่', test: nonTrivial },
    ]
  },
  { id:'cv4', prompt:'สร้าง $f(x)$ ที่ <strong>ต่อเนื่องบนทุก $\\mathbb{R}$</strong> แต่ไม่ใช่พหุนามเชิงเส้น',
    hint:'พหุนามดีกรีสูง หรือ $\\sin, \\cos, e^x$',
    example:'x^2 + sin(x)',
    placeholder:'เช่น  x^2 + sin(x)',
    checks:[
      { id:'cAll', label:'ต่อเนื่องทุกจุดที่ทดสอบ',
        test: function(fn) {
          const pts = [-3, -1.5, 0, 1.5, 3];
          return pts.every(a => {
            try {
              const c = fn(a), l = fn(a-1e-5), r = fn(a+1e-5);
              return c!==null && l!==null && r!==null
                && isFinite(c) && isFinite(l) && isFinite(r)
                && Math.abs(l-r)<1e-3 && Math.abs(c-l)<1e-3;
            } catch (_) { return false; }
          });
        }
      },
      { id:'nonLin', label:'ไม่ใช่เชิงเส้น (มีความโค้ง)',
        test: function(fn) {
          try {
            const a = fn(-1), b = fn(0), c = fn(1);
            if ([a,b,c].some(v => v===null || !isFinite(v))) return false;
            const secondDiff = a - 2*b + c;
            return Math.abs(secondDiff) > 0.01;
          } catch (_) { return false; }
        }
      },
      { id:'nt', label:'ไม่เป็นค่าคงที่', test: nonTrivial },
    ]
  },
];

/* =====================================================
   CONTINUITY MISSIONS — ใช้ pool
   ===================================================== */

/* ============================================================
   Step-Based Reasoning Activity (SBRA) Pools
   แต่ละโจทย์แตกเป็นสเต็ป นักศึกษาเลือก 2 ช่อง/สเต็ป:
     (1) ผลลัพธ์/การกระทำ  (2) เหตุผล/กฎที่ใช้
   ============================================================ */

/* ---------- REAL COURSE CLOs (canonical grouped mapping) ----------
   Use these six CLO codes as the top-level learning-outcome taxonomy for
   every SBRA item (and, over time, every mission). The older runtime micro-CLO
   tags stay in place for existing missions but should be treated as sub-CLO
   skill tags — see CAULD_PROJECT_REVIEW.md. */
const REAL_CLOS = {
  CLO1: 'อธิบายและคำนวณลิมิต',
  CLO2: 'ทดสอบและอธิบายความต่อเนื่อง',
  CLO3: 'คำนวณและตีความอนุพันธ์',
  CLO4: 'ใช้อนุพันธ์วิเคราะห์ฟังก์ชันและการประยุกต์',
  CLO5: 'คำนวณปริพันธ์จำกัดและไม่จำกัด',
  CLO6: 'ใช้ปริพันธ์ในการประยุกต์',
};

/* ---------- SBRA: STRATEGY / PLANNING STEP (prepend to every problem) ----------
   ก่อนลงมือทำจริง ให้นักศึกษาเลือก: (1) เทคนิค/แนวคิดหลักที่จะใช้  (2) เหตุผลที่เลือกเทคนิคนั้น
   key = problem id in pools; controller จะรวม strategy เป็นสเต็ปแรกอัตโนมัติ */
const SBRA_STRATEGY_PROMPT = 'โจทย์นี้ควรใช้<b>แนวคิด/เทคนิคใดเป็นหลัก</b>? (วางแผนก่อนลงมือทำ)';
const SBRA_STRATEGIES = {
  /* ===== LIMITS ===== */
  'sbra-lim-factor':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'แยกตัวประกอบเศษแล้วตัดแฟกเตอร์ร่วมกับส่วน', correct:true },
      { id:'b', text:'คูณด้วยคอนจูเกตของเศษ' },
      { id:'c', text:'ใช้ลิมิตมาตรฐาน \\(\\lim_{u\\to 0}\\sin u/u = 1\\)' },
      { id:'d', text:'หารทั้งเศษและส่วนด้วย \\(x\\) ดีกรีสูงสุด' },
    ],
    reasons:[
      { id:'r1', text:'แทนค่าได้รูป 0/0 และเศษ–ส่วนเป็นพหุนาม จึงแยกตัวประกอบตัดกันได้', correct:true },
      { id:'r2', text:'มีรากที่สองในเศษ ต้องคูณคอนจูเกตเพื่อหมุนเครื่องหมาย' },
      { id:'r3', text:'เห็น \\(\\sin\\) ใกล้ 0 จึงใช้ลิมิตมาตรฐาน' },
      { id:'r4', text:'ลิมิตที่อนันต์ ต้องหารด้วย \\(x\\) ดีกรีสูงสุด' },
    ],
  },
  'sbra-lim-conjugate':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'คูณด้วยคอนจูเกตเพื่อปรับรูป 0/0', correct:true },
      { id:'b', text:'แยกตัวประกอบพหุนามแล้วตัดกัน' },
      { id:'c', text:'ใช้กฎของโลปีตาล (L\'Hôpital) แบบดิบ ๆ' },
      { id:'d', text:'แทนค่าตรง ๆ ได้ทันที' },
    ],
    reasons:[
      { id:'r1', text:'เศษเป็นรูป \\(\\sqrt{\\cdot}-\\sqrt{\\cdot}\\) ที่ให้ 0/0 คอนจูเกตจะลบรากหายได้', correct:true },
      { id:'r2', text:'เศษเป็นพหุนามจึงแยกตัวประกอบได้' },
      { id:'r3', text:'ถึงจะใช้ได้ แต่ในบริบทนี้ต้องการวิธีเชิงพีชคณิตก่อน' },
      { id:'r4', text:'แทนค่าแล้วได้ค่าจำกัดทันที ไม่ต้องจัดรูป' },
    ],
  },
  'sbra-lim-sinu':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'จัดรูปให้เข้ามาตรฐาน \\(\\sin u/u\\to 1\\)', correct:true },
      { id:'b', text:'แยกตัวประกอบแล้วตัดกัน' },
      { id:'c', text:'คูณคอนจูเกตของเศษ' },
      { id:'d', text:'ใช้อนุกรมเทย์เลอร์ของ \\(\\cos x\\)' },
    ],
    reasons:[
      { id:'r1', text:'เห็น \\(\\sin(\\text{something})\\) ใกล้ 0 — จัดให้เข้ามาตรฐานคือทางที่ประหยัดที่สุด', correct:true },
      { id:'r2', text:'โจทย์ไม่ได้เป็นพหุนามล้วน จึงไม่เหมาะที่จะแยกตัวประกอบ' },
      { id:'r3', text:'ไม่มีรากที่สอง คอนจูเกตจึงไม่เกี่ยว' },
      { id:'r4', text:'ใช้ได้ แต่เกินกำลังของเครื่องมือพื้นฐาน' },
    ],
  },
  'sbra-lim-infty':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'หารทั้งเศษและส่วนด้วย \\(x\\) ที่ดีกรีสูงสุด', correct:true },
      { id:'b', text:'แยกตัวประกอบแล้วตัดกัน' },
      { id:'c', text:'คูณคอนจูเกต' },
      { id:'d', text:'ใช้ลิมิตมาตรฐาน \\(\\sin u/u\\)' },
    ],
    reasons:[
      { id:'r1', text:'เป็นลิมิตที่อนันต์ของอัตราส่วนพหุนาม ดีกรีเศษ = ดีกรีส่วน — หารออกได้ค่าแน่นอน', correct:true },
      { id:'r2', text:'ไม่ใช่รูป 0/0 จึงไม่ใช่สถานการณ์แยกตัวประกอบ' },
      { id:'r3', text:'ไม่มีราก คอนจูเกตไม่เกี่ยว' },
      { id:'r4', text:'ไม่มี \\(\\sin\\) ในโจทย์' },
    ],
  },
  'sbra-lim-onesided':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'พิจารณาลิมิตด้านซ้าย–ขวาแยกกัน', correct:true },
      { id:'b', text:'แทนค่าตรง ๆ แล้วจบ' },
      { id:'c', text:'ใช้ลิมิตมาตรฐาน \\(\\sin u/u\\)' },
      { id:'d', text:'คูณคอนจูเกตก่อน' },
    ],
    reasons:[
      { id:'r1', text:'ฟังก์ชันนิยามต่างนิพจน์สองฝั่งของจุด จึงต้องเช็คทั้งสองฝั่งว่าเท่ากันไหม', correct:true },
      { id:'r2', text:'โจทย์เป็นฟังก์ชันแบ่งส่วน การแทนค่าตรงไม่ตอบคำถาม' },
      { id:'r3', text:'ไม่มี \\(\\sin\\) เกี่ยวข้อง' },
      { id:'r4', text:'ไม่มีรากที่สอง ไม่ต้องคอนจูเกต' },
    ],
  },

  /* ===== CONTINUITY ===== */
  'sbra-cont-removable':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'หาลิมิตที่จุด แล้วเทียบกับค่าของฟังก์ชันที่จุดนั้น', correct:true },
      { id:'b', text:'ตรวจโดเมนอย่างเดียว' },
      { id:'c', text:'ใช้ทฤษฎีบทค่าสูงสุด (EVT)' },
      { id:'d', text:'อนุพันธ์สองข้างของจุด' },
    ],
    reasons:[
      { id:'r1', text:'ความต่อเนื่องที่จุด ต้องการ (1) \\(f(a)\\) นิยาม (2) ลิมิตมีค่า (3) ค่าทั้งสองเท่ากัน', correct:true },
      { id:'r2', text:'โดเมนเพียงอย่างเดียวไม่พอ — ต้องดูลิมิตด้วย' },
      { id:'r3', text:'EVT ใช้กับช่วงปิด ไม่ใช่ตรวจที่จุดเดียว' },
      { id:'r4', text:'ความต่อเนื่องไม่ต้องการอนุพันธ์' },
    ],
  },
  'sbra-cont-findk':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'ตั้งสมการ \\(\\lim_{x\\to a^-}f = \\lim_{x\\to a^+}f = f(a)\\) แล้วแก้หา \\(k\\)', correct:true },
      { id:'b', text:'แทนค่า \\(k=0\\) แล้วลองดู' },
      { id:'c', text:'ใช้ IVT หา \\(k\\)' },
      { id:'d', text:'อินทิเกรตสองฝั่งของจุดต่อกัน' },
    ],
    reasons:[
      { id:'r1', text:'ต้องการทำฟังก์ชันแบ่งส่วนให้ต่อเนื่อง ณ จุดต่อ จึงต้องบังคับลิมิตสองข้าง = ค่าฟังก์ชัน', correct:true },
      { id:'r2', text:'การเดาค่าไม่ใช่การให้เหตุผล' },
      { id:'r3', text:'IVT บอกการมีอยู่ของราก ไม่ได้ใช้หาค่าพารามิเตอร์' },
      { id:'r4', text:'ไม่มีการอินทิเกรตเกี่ยวข้องกับความต่อเนื่อง' },
    ],
  },
  'sbra-cont-infty':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'วิเคราะห์พฤติกรรมของลิมิตที่จุดนั้นว่าไม่จำกัด', correct:true },
      { id:'b', text:'แทนค่าตรง ๆ แล้วบอกว่าต่อเนื่อง' },
      { id:'c', text:'ใช้อนุพันธ์เพื่อเช็คความต่อเนื่อง' },
      { id:'d', text:'อินทิเกรตฟังก์ชันเทียบกับโดเมน' },
    ],
    reasons:[
      { id:'r1', text:'เมื่อส่วนเข้าใกล้ 0 เศษคงที่ ค่าจะพุ่งไม่จำกัด จึงเป็น discontinuity แบบอนันต์', correct:true },
      { id:'r2', text:'แทนค่าแล้วส่วนเป็น 0 ไม่สามารถสรุปว่าต่อเนื่องได้' },
      { id:'r3', text:'ต่อเนื่องมาก่อนอนุพันธ์เสมอ ไม่ใช้อนุพันธ์มาเช็ค' },
      { id:'r4', text:'อินทิเกรตไม่เกี่ยวกับความต่อเนื่องที่จุด' },
    ],
  },
  'sbra-cont-ivt':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'ใช้ทฤษฎีบทค่ากลาง (IVT) บนช่วงปิดที่เปลี่ยนเครื่องหมาย', correct:true },
      { id:'b', text:'ใช้กฎโลปีตาล' },
      { id:'c', text:'หาอนุพันธ์ = 0 แล้วบอกว่ามีราก' },
      { id:'d', text:'อินทิเกรตหาค่ารวมของฟังก์ชัน' },
    ],
    reasons:[
      { id:'r1', text:'\\(f\\) ต่อเนื่องบน \\([a,b]\\) และ \\(f(a)\\cdot f(b)<0\\) จึงต้องมี \\(c\\) ที่ \\(f(c)=0\\)', correct:true },
      { id:'r2', text:'โลปีตาลใช้กับลิมิตรูป 0/0 หรือ ∞/∞ ไม่ใช่หาราก' },
      { id:'r3', text:'อนุพันธ์เป็น 0 บอกจุดวิกฤต ไม่ใช่ราก' },
      { id:'r4', text:'อินทิเกรตให้พื้นที่ ไม่เกี่ยวกับการมีรากในช่วง' },
    ],
  },

  /* ===== DIFFERENTIATION ===== */
  'sbra-d-product':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'ใช้กฎผลคูณ \\((uv)\'=u\'v+uv\'\\)', correct:true },
      { id:'b', text:'ใช้กฎลูกโซ่ (Chain Rule)' },
      { id:'c', text:'ใช้กฎผลหาร' },
      { id:'d', text:'ใช้กฎยกกำลังตรง ๆ' },
    ],
    reasons:[
      { id:'r1', text:'ฟังก์ชันเป็นผลคูณของสองฟังก์ชันที่ขึ้นกับ \\(x\\) ทั้งคู่', correct:true },
      { id:'r2', text:'ไม่ใช่ฟังก์ชันประกอบ (ไม่มีฟังก์ชันในฟังก์ชัน)' },
      { id:'r3', text:'ไม่ได้อยู่ในรูปผลหาร \\(u/v\\)' },
      { id:'r4', text:'กฎยกกำลังใช้ได้กับ \\(x^n\\) ล้วน ๆ เท่านั้น' },
    ],
  },
  'sbra-d-chain':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'ใช้กฎลูกโซ่ แยกชั้นนอก–ชั้นใน', correct:true },
      { id:'b', text:'ใช้กฎผลคูณ' },
      { id:'c', text:'กระจายตัวออกก่อนแล้วยกกำลังทีละตัว' },
      { id:'d', text:'ใช้การอนุพันธ์โดยปริยาย' },
    ],
    reasons:[
      { id:'r1', text:'ฟังก์ชันอยู่ในรูป \\(f(g(x))\\) — ฟังก์ชันประกอบ จึงใช้กฎลูกโซ่', correct:true },
      { id:'r2', text:'ไม่ใช่ผลคูณของสองฟังก์ชัน' },
      { id:'r3', text:'กระจายแล้วยุ่งกว่ากฎลูกโซ่มาก' },
      { id:'r4', text:'ไม่ใช่สมการ implicit' },
    ],
  },
  'sbra-d-quotient':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'ใช้กฎผลหาร \\((u/v)\' = (u\'v-uv\')/v^2\\)', correct:true },
      { id:'b', text:'ใช้กฎผลคูณโดยตรง' },
      { id:'c', text:'ใช้กฎลูกโซ่อย่างเดียว' },
      { id:'d', text:'ใช้กฎยกกำลัง' },
    ],
    reasons:[
      { id:'r1', text:'อยู่ในรูป \\(u(x)/v(x)\\) — ทั้งคู่ขึ้นกับ \\(x\\)', correct:true },
      { id:'r2', text:'ทำได้ถ้าเขียน \\(u\\cdot v^{-1}\\) แต่ตรง ๆ คือกฎผลหาร' },
      { id:'r3', text:'ไม่ใช่ฟังก์ชันประกอบชั้นเดียว' },
      { id:'r4', text:'ไม่ได้เป็น \\(x^n\\) ล้วน' },
    ],
  },
  'sbra-d-expchain':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'ใช้กฎลูกโซ่กับฟังก์ชันเลขชี้กำลัง', correct:true },
      { id:'b', text:'ใช้กฎผลคูณ' },
      { id:'c', text:'ใช้กฎผลหาร' },
      { id:'d', text:'ใช้สูตร \\(\\frac{d}{dx}e^x=e^x\\) โดยตรง' },
    ],
    reasons:[
      { id:'r1', text:'อยู่ในรูป \\(e^{g(x)}\\) — ฟังก์ชันประกอบ จึงต้องคูณด้วย \\(g\'(x)\\)', correct:true },
      { id:'r2', text:'ไม่ใช่ผลคูณของสองฟังก์ชัน' },
      { id:'r3', text:'ไม่ใช่ผลหาร' },
      { id:'r4', text:'สูตรตรง ๆ ใช้กับ \\(e^x\\) เท่านั้น ไม่ใช่ \\(e^{g(x)}\\)' },
    ],
  },
  'sbra-d-critical':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'หา \\(f\'(x)=0\\) แล้วตรวจเครื่องหมาย \\(f\'\\) รอบจุด', correct:true },
      { id:'b', text:'หา \\(f(x)=0\\) (ราก)' },
      { id:'c', text:'อินทิเกรต \\(f\\) แล้วดูเครื่องหมาย' },
      { id:'d', text:'ใช้ IVT หาจุดสูงสุด' },
    ],
    reasons:[
      { id:'r1', text:'จุดสูงสุด/ต่ำสุดสัมพัทธ์เกิดที่จุดวิกฤต — พบด้วยอนุพันธ์ = 0 แล้วตรวจเครื่องหมาย', correct:true },
      { id:'r2', text:'รากของ \\(f\\) คือจุดตัดแกน ไม่ใช่จุดสูงต่ำ' },
      { id:'r3', text:'อินทิเกรตให้พื้นที่สะสม ไม่ใช่จุดวิกฤต' },
      { id:'r4', text:'IVT บอกการมีรากในช่วง ไม่ได้บอกจุดสูงต่ำ' },
    ],
  },
  'sbra-d-implicit':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'อนุพันธ์โดยปริยาย (implicit differentiation) ทั้งสองข้าง', correct:true },
      { id:'b', text:'แก้หา \\(y\\) เป็นฟังก์ชันชัดเจนของ \\(x\\) ก่อน' },
      { id:'c', text:'ใช้กฎลูกโซ่ของ \\(x\\) อย่างเดียว' },
      { id:'d', text:'อินทิเกรตสองข้างหา \\(y\\)' },
    ],
    reasons:[
      { id:'r1', text:'\\(y\\) ไม่ได้เขียนเป็นฟังก์ชันชัดเจนของ \\(x\\) จึงใช้ implicit แล้วเก็บ \\(dy/dx\\)', correct:true },
      { id:'r2', text:'แก้ชัดเจนอาจทำได้ยากหรือไม่ได้' },
      { id:'r3', text:'ต้องแยก \\(y\\) เป็นฟังก์ชันของ \\(x\\) ด้วย' },
      { id:'r4', text:'อินทิเกรตไม่ใช่วิธีหา \\(dy/dx\\)' },
    ],
  },

  /* ===== INTEGRATION ===== */
  'sbra-i-usub':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'ใช้การเปลี่ยนตัวแปร (u-substitution)', correct:true },
      { id:'b', text:'ใช้การอินทิเกรตทีละส่วน (IBP)' },
      { id:'c', text:'ใช้สูตรยกกำลังโดยตรง' },
      { id:'d', text:'แยกเศษส่วนย่อย' },
    ],
    reasons:[
      { id:'r1', text:'เห็นฟังก์ชันในฟังก์ชัน และมีอนุพันธ์ของฟังก์ชันในอยู่เป็นตัวคูณ', correct:true },
      { id:'r2', text:'IBP เหมาะกับผลคูณของฟังก์ชันคนละพวก (เช่น พหุนาม × ตรีโกณ)' },
      { id:'r3', text:'สูตรยกกำลังใช้กับ \\(x^n\\) ล้วน ๆ' },
      { id:'r4', text:'ไม่ได้เป็นเศษส่วนตรรกยะที่ต้องแยก' },
    ],
  },
  'sbra-i-ibp':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'ใช้การอินทิเกรตทีละส่วน \\(\\int u\\,dv = uv - \\int v\\,du\\)', correct:true },
      { id:'b', text:'ใช้ u-substitution' },
      { id:'c', text:'ใช้สูตรยกกำลังตรง ๆ' },
      { id:'d', text:'แยกเศษส่วนย่อย' },
    ],
    reasons:[
      { id:'r1', text:'อินทิแกรนด์เป็นผลคูณของสองฟังก์ชันที่เลือก \\(u, dv\\) แล้วอินทิเกรตง่ายขึ้น (เช่น LIATE)', correct:true },
      { id:'r2', text:'ไม่มีฟังก์ชันประกอบที่อนุพันธ์ของตัวในเป็นตัวคูณ' },
      { id:'r3', text:'ไม่ใช่ \\(x^n\\) ล้วน' },
      { id:'r4', text:'ไม่ใช่เศษส่วนตรรกยะ' },
    ],
  },
  'sbra-i-definite':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'หาแอนติเดริเวทีฟ แล้วใช้ FTC \\(\\left[F(x)\\right]_a^b\\)', correct:true },
      { id:'b', text:'ใช้ผลรวมรีมันน์หาค่าตัวเลขโดยตรง' },
      { id:'c', text:'อนุพันธ์ทั้งสองข้างก่อน' },
      { id:'d', text:'ใช้ IVT หาค่าปริพันธ์' },
    ],
    reasons:[
      { id:'r1', text:'ทฤษฎีบทหลักของแคลคูลัสให้วิธีคำนวณปริพันธ์จำกัดแบบ exact ผ่านแอนติเดริเวทีฟ', correct:true },
      { id:'r2', text:'รีมันน์ใช้ประมาณ/นิยาม ไม่จำเป็นเมื่อหาแอนติเดริเวทีฟได้' },
      { id:'r3', text:'อนุพันธ์ไม่ใช่การหาปริพันธ์' },
      { id:'r4', text:'IVT ไม่ใช่เครื่องมือคำนวณปริพันธ์' },
    ],
  },
  'sbra-i-arctan':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'ใช้สูตร \\(\\int \\dfrac{du}{a^2+u^2} = \\dfrac{1}{a}\\arctan\\dfrac{u}{a}+C\\)', correct:true },
      { id:'b', text:'ใช้ IBP' },
      { id:'c', text:'แยกตัวประกอบของส่วนก่อน' },
      { id:'d', text:'สูตรยกกำลัง' },
    ],
    reasons:[
      { id:'r1', text:'อินทิแกรนด์อยู่ในรูป \\(1/(a^2+u^2)\\) ตรงกับสูตรมาตรฐานอาร์กแทน', correct:true },
      { id:'r2', text:'ไม่ใช่ผลคูณของฟังก์ชันคนละพวก' },
      { id:'r3', text:'\\(a^2+u^2\\) แยกตัวประกอบในจำนวนจริงไม่ได้' },
      { id:'r4', text:'ไม่ใช่รูป \\(x^n\\)' },
    ],
  },
  'sbra-i-area':{
    prompt:SBRA_STRATEGY_PROMPT,
    actions:[
      { id:'a', text:'หาจุดตัดของกราฟสองเส้น แล้วอินทิเกรต \\(|f-g|\\) ระหว่างจุดตัด', correct:true },
      { id:'b', text:'อินทิเกรตฟังก์ชันทีละตัวแล้วบวกกัน' },
      { id:'c', text:'ใช้สูตรพื้นที่สามเหลี่ยม' },
      { id:'d', text:'ใช้ IBP' },
    ],
    reasons:[
      { id:'r1', text:'พื้นที่ระหว่างสองเส้นโค้งคือปริพันธ์ของความต่างเหนือช่วงที่กำหนดโดยจุดตัด', correct:true },
      { id:'r2', text:'การบวกพื้นที่ใต้กราฟแต่ละตัวไม่ใช่พื้นที่ระหว่างเส้น' },
      { id:'r3', text:'เส้นโค้งไม่ใช่เส้นตรง ไม่ใช่รูปสามเหลี่ยม' },
      { id:'r4', text:'ไม่จำเป็นต้องใช้ IBP สำหรับฟังก์ชันพหุนาม' },
    ],
  },
};

/* ---------- SBRA: LIMITS ---------- */
const POOL_SBRA_LIMITS = [
  { id:'sbra-lim-factor', clo:'CLO1',
    title:'แยกตัวประกอบ — \\(\\lim_{x\\to 2}\\frac{x^2-4}{x-2}\\)',
    problem:'\\lim_{x\\to 2}\\dfrac{x^2-4}{x-2}',
    steps:[
      { id:'s1',
        prompt:'แทน \\(x=2\\) ลงในนิพจน์โดยตรง ได้รูปแบบใด?',
        actions:[
          { id:'a', tex:'\\frac{0}{0}', correct:true },
          { id:'b', tex:'\\frac{4}{0}' },
          { id:'c', tex:'0' },
          { id:'d', tex:'\\text{ไม่นิยามทันที}' },
        ],
        reasons:[
          { id:'r1', text:'เพราะ \\(2^2-4=0\\) และ \\(2-2=0\\) จึงเป็นรูป indeterminate \\(0/0\\)', correct:true },
          { id:'r2', text:'เพราะตัวส่วนเป็น 0 เท่านั้น (เศษไม่สำคัญ)' },
          { id:'r3', text:'เพราะ \\(f\\) ไม่นิยามที่ \\(x=2\\) จึงสรุปว่าไม่มีลิมิต' },
          { id:'r4', text:'เพราะ direct substitution ใช้ได้เสมอในทุกกรณี' },
        ],
        commitText:'แทน \\(x=2\\) ได้รูป \\(\\frac{0}{0}\\) (indeterminate form)' },
      { id:'s2',
        prompt:'ขั้นต่อไปควรจัดการรูป \\(0/0\\) นี้อย่างไร?',
        actions:[
          { id:'a', tex:'\\text{แยกตัวประกอบเศษ}', correct:true },
          { id:'b', tex:"\\text{ใช้ L'H\\^opital ทันที}" },
          { id:'c', tex:'\\text{สรุปทันทีว่าลิมิตไม่มี}' },
          { id:'d', tex:'\\text{คูณด้วยคอนจูเกต}' },
        ],
        reasons:[
          { id:'r1', text:'เพราะ \\(x^2-4=(x-2)(x+2)\\) มีแฟกเตอร์ \\(x-2\\) ร่วมกับตัวส่วน', correct:true },
          { id:'r2', text:'เพราะฟังก์ชันนี้เป็นฟังก์ชันตรีโกณ' },
          { id:'r3', text:'เพราะตัวส่วนเป็นเส้นตรง ต้องคอนจูเกตก่อน' },
          { id:'r4', text:'เพราะรูป 0/0 แปลว่าลิมิตไม่มีโดยอัตโนมัติ' },
        ],
        commitText:'\\(\\dfrac{(x-2)(x+2)}{x-2}=x+2\\) (ตัด \\(x-2\\) ได้ เพราะลิมิตสนใจ \\(x\\ne 2\\))' },
      { id:'s3',
        prompt:'แทน \\(x=2\\) ในฟังก์ชันที่ลดรูปแล้ว \\(x+2\\) ได้เท่าใด?',
        actions:[
          { id:'a', tex:'4', correct:true },
          { id:'b', tex:'0' }, { id:'c', tex:'2' }, { id:'d', tex:'\\infty' },
        ],
        reasons:[
          { id:'r1', text:'\\(x+2\\) เป็น polynomial → ต่อเนื่องทุกจุด จึง substitute ได้', correct:true },
          { id:'r2', text:'เพราะลิมิตของผลหาร = ผลหารของลิมิต' },
          { id:'r3', text:'เพราะเอา 2+2 ตรง ๆ โดยไม่ต้องตรวจ' },
          { id:'r4', text:'เพราะเป็นรูปแบบเดียวกับโจทย์เดิม' },
        ],
        commitText:'\\(\\lim_{x\\to 2}(x+2)=4\\)' },
    ],
    finalAnswer:{ tex:'4', sayTH:'ลิมิตเท่ากับ 4' } },

  { id:'sbra-lim-conjugate', clo:'CLO1',
    title:'คอนจูเกต — \\(\\lim_{x\\to 1}\\frac{\\sqrt{x+3}-2}{x-1}\\)',
    problem:'\\lim_{x\\to 1}\\dfrac{\\sqrt{x+3}-2}{x-1}',
    steps:[
      { id:'s1',
        prompt:'แทน \\(x=1\\) โดยตรง ได้รูปใด?',
        actions:[
          { id:'a', tex:'\\frac{0}{0}', correct:true },
          { id:'b', tex:'\\frac{2}{0}' },
          { id:'c', tex:'0' },
          { id:'d', tex:'2' },
        ],
        reasons:[
          { id:'r1', text:'\\(\\sqrt{4}-2=0\\) และ \\(1-1=0\\) → รูป 0/0', correct:true },
          { id:'r2', text:'เพราะตัวส่วนเป็นศูนย์เท่านั้น' },
          { id:'r3', text:'เพราะในเศษมีเครื่องหมายลบ' },
          { id:'r4', text:'เพราะ \\(\\sqrt{x+3}\\) นิยามทุกจุด' },
        ],
        commitText:'แทน \\(x=1\\) ได้ \\(\\frac{0}{0}\\)' },
      { id:'s2',
        prompt:'ควรใช้เทคนิคอะไรกับเศษที่มีราก?',
        actions:[
          { id:'a', tex:'\\text{คูณด้วยคอนจูเกต }\\sqrt{x+3}+2', correct:true },
          { id:'b', tex:'\\text{แยกตัวประกอบตัวส่วน}' },
          { id:'c', tex:"\\text{ใช้ L'H\\^opital}" },
          { id:'d', tex:'\\text{ยกกำลังสองทั้งเศษและส่วน}' },
        ],
        reasons:[
          { id:'r1', text:'คูณคอนจูเกตจะได้ \\((\\sqrt{a})^2-2^2=a-4\\) ลดรูปแบบรากออก', correct:true },
          { id:'r2', text:'เพราะจะทำให้ตัวส่วนง่ายขึ้น' },
          { id:'r3', text:"L'H\\^opital ยังไม่ได้เรียนในบทนี้" },
          { id:'r4', text:'เพื่อทำให้นิพจน์มีดีกรีเท่ากัน' },
        ],
        commitText:'คูณทั้งเศษ–ส่วนด้วย \\(\\sqrt{x+3}+2\\)' },
      { id:'s3',
        prompt:'ตัวเศษหลังคูณคอนจูเกตเท่ากับ?',
        actions:[
          { id:'a', tex:'x-1', correct:true },
          { id:'b', tex:'x+3-2' },
          { id:'c', tex:'x-3' },
          { id:'d', tex:'x+1' },
        ],
        reasons:[
          { id:'r1', text:'\\((\\sqrt{x+3})^2-2^2=(x+3)-4=x-1\\)', correct:true },
          { id:'r2', text:'เพราะเศษเดิมคือ \\(\\sqrt{x+3}-2\\) อยู่แล้ว' },
          { id:'r3', text:'ลบ 3 ออกจากทั้งสองข้าง' },
          { id:'r4', text:'จาก \\((a-b)^2=a^2-2ab+b^2\\)' },
        ],
        commitText:'เศษใหม่ = \\((x+3)-4 = x-1\\)' },
      { id:'s4',
        prompt:'ตัด \\(x-1\\) กับตัวส่วน แล้วแทน \\(x=1\\) ได้เท่าใด?',
        actions:[
          { id:'a', tex:'\\dfrac{1}{4}', correct:true },
          { id:'b', tex:'\\dfrac{1}{2}' },
          { id:'c', tex:'1' },
          { id:'d', tex:'0' },
        ],
        reasons:[
          { id:'r1', text:'\\(\\frac{1}{\\sqrt{1+3}+2}=\\frac{1}{2+2}=\\frac{1}{4}\\)', correct:true },
          { id:'r2', text:'เพราะ \\(\\sqrt{4}=2\\) เท่านั้น' },
          { id:'r3', text:'เพราะ \\(x-1=0\\) ที่ \\(x=1\\)' },
          { id:'r4', text:'ลิมิตของอัตราส่วนคือ 1 เมื่อทั้งสองเข้า 0' },
        ],
        commitText:'\\(\\lim_{x\\to 1}\\dfrac{1}{\\sqrt{x+3}+2}=\\dfrac{1}{4}\\)' },
    ],
    finalAnswer:{ tex:'\\dfrac{1}{4}', sayTH:'ลิมิตเท่ากับ 1/4' } },

  { id:'sbra-lim-sinu', clo:'CLO1',
    title:'ลิมิตพื้นฐาน sin — \\(\\lim_{x\\to 0}\\dfrac{\\sin(3x)}{x}\\)',
    problem:'\\lim_{x\\to 0}\\dfrac{\\sin(3x)}{x}',
    steps:[
      { id:'s1',
        prompt:'แทน \\(x=0\\) โดยตรง ได้รูปใด?',
        actions:[
          { id:'a', tex:'\\frac{0}{0}', correct:true },
          { id:'b', tex:'0' }, { id:'c', tex:'1' }, { id:'d', tex:'3' },
        ],
        reasons:[
          { id:'r1', text:'\\(\\sin 0=0\\) และตัวส่วน = 0 → รูป 0/0', correct:true },
          { id:'r2', text:'\\(\\sin(3x)\\) มีค่าไม่เกิน 1 เสมอ' },
          { id:'r3', text:'sin เข้า 0 เร็วกว่าหาร' },
          { id:'r4', text:'เพราะลิมิต sin ของ 0 คือ 0' },
        ],
        commitText:'แทน \\(x=0\\) ได้ \\(\\frac{0}{0}\\)' },
      { id:'s2',
        prompt:'ใช้สูตร \\(\\lim_{u\\to 0}\\frac{\\sin u}{u}=1\\) ได้โดยการจัดรูปอย่างไร?',
        actions:[
          { id:'a', tex:'3\\cdot\\dfrac{\\sin(3x)}{3x}', correct:true },
          { id:'b', tex:'\\dfrac{\\sin(3x)}{3x}' },
          { id:'c', tex:'\\dfrac{3\\sin x}{x}' },
          { id:'d', tex:'\\dfrac{\\sin x}{x}' },
        ],
        reasons:[
          { id:'r1', text:'คูณ–หารด้วย 3 เพื่อให้รูปเป็น \\(\\sin u/u\\) โดย \\(u=3x\\)', correct:true },
          { id:'r2', text:'\\(\\sin(3x)=3\\sin x\\)' },
          { id:'r3', text:'\\(\\sin(3x)\\) กับ \\(\\sin x\\) เท่ากันเมื่อ x เข้า 0' },
          { id:'r4', text:'ต้องทำให้ดีกรีตัวแปรเท่ากันก่อน' },
        ],
        commitText:'\\(\\dfrac{\\sin(3x)}{x}=3\\cdot\\dfrac{\\sin(3x)}{3x}\\)' },
      { id:'s3',
        prompt:'เมื่อ \\(x\\to 0\\) ค่าลิมิตเท่าใด?',
        actions:[
          { id:'a', tex:'3', correct:true },
          { id:'b', tex:'1' }, { id:'c', tex:'0' }, { id:'d', tex:'\\tfrac{1}{3}' },
        ],
        reasons:[
          { id:'r1', text:'\\(3\\cdot 1 = 3\\) จากสูตร \\(\\lim\\sin u/u=1\\)', correct:true },
          { id:'r2', text:'เพราะ \\(\\sin 3 = 3\\)' },
          { id:'r3', text:'เพราะ \\(\\sin\\) เข้า 1 เมื่อ x เล็ก' },
          { id:'r4', text:'ลิมิตของค่าคงตัวคือค่าคงตัวนั้น' },
        ],
        commitText:'\\(\\lim = 3\\cdot 1 = 3\\)' },
    ],
    finalAnswer:{ tex:'3', sayTH:'ลิมิตเท่ากับ 3' } },

  { id:'sbra-lim-infty', clo:'CLO1',
    title:'ลิมิตอนันต์ — \\(\\lim_{x\\to\\infty}\\dfrac{3x^2+5}{2x^2-x+1}\\)',
    problem:'\\lim_{x\\to\\infty}\\dfrac{3x^2+5}{2x^2-x+1}',
    steps:[
      { id:'s1',
        prompt:'แทน \\(x\\to\\infty\\) โดยตรง ได้รูปใด?',
        actions:[
          { id:'a', tex:'\\frac{\\infty}{\\infty}', correct:true },
          { id:'b', tex:'\\infty' }, { id:'c', tex:'\\tfrac{3}{2}' }, { id:'d', tex:'0' },
        ],
        reasons:[
          { id:'r1', text:'ทั้งเศษและส่วนเป็นพหุนามที่ไม่จำกัด → รูป ∞/∞', correct:true },
          { id:'r2', text:'เพราะเศษโตเร็วกว่าตัวส่วน' },
          { id:'r3', text:'เพราะสัมประสิทธิ์นำคือ 3 และ 2' },
          { id:'r4', text:'เพราะพหุนามดีกรี 2 เท่ากัน' },
        ],
        commitText:'รูป \\(\\infty/\\infty\\)' },
      { id:'s2',
        prompt:'จัดการรูปนี้ด้วยเทคนิคใด?',
        actions:[
          { id:'a', tex:'\\text{หารทั้งเศษและส่วนด้วย } x^2', correct:true },
          { id:'b', tex:'\\text{ตัดพจน์กลาง } -x \\text{ ทิ้ง}' },
          { id:'c', tex:'\\text{แยกตัวประกอบ}' },
          { id:'d', tex:'\\text{คูณคอนจูเกต}' },
        ],
        reasons:[
          { id:'r1', text:'หารด้วยดีกรีสูงสุดของตัวส่วน ทำให้พจน์อื่น ๆ เข้า 0', correct:true },
          { id:'r2', text:'เพราะ \\(-x\\) เล็กกว่ามากเมื่อเทียบกับ \\(x^2\\)' },
          { id:'r3', text:'เพราะเศษมีสัมประสิทธิ์ต่างกันได้' },
          { id:'r4', text:'เพราะมีรูป indeterminate ทุกอย่างต้องคอนจูเกต' },
        ],
        commitText:'หารทั้งเศษ–ส่วนด้วย \\(x^2\\) → \\(\\dfrac{3+5/x^2}{2-1/x+1/x^2}\\)' },
      { id:'s3',
        prompt:'ให้ \\(x\\to\\infty\\) พจน์ \\(1/x\\) และ \\(1/x^2\\) ไปเป็นอะไร แล้วลิมิตเท่าใด?',
        actions:[
          { id:'a', tex:'\\dfrac{3}{2}', correct:true },
          { id:'b', tex:'0' }, { id:'c', tex:'\\infty' }, { id:'d', tex:'\\tfrac{5}{1}' },
        ],
        reasons:[
          { id:'r1', text:'พจน์ \\(1/x,1/x^2\\to 0\\) เหลือแต่ \\(3/2\\)', correct:true },
          { id:'r2', text:'สัมประสิทธิ์ค่าคงตัวในเศษอยู่บน ตัวส่วนอยู่ล่าง' },
          { id:'r3', text:'เพราะ \\(3<\\infty\\) และ \\(2<\\infty\\)' },
          { id:'r4', text:'เพราะดีกรีต่างกัน 2' },
        ],
        commitText:'\\(\\lim=\\dfrac{3+0}{2-0+0}=\\dfrac{3}{2}\\)' },
    ],
    finalAnswer:{ tex:'\\dfrac{3}{2}', sayTH:'ลิมิตเท่ากับ 3/2' } },

  { id:'sbra-lim-onesided', clo:'CLO1',
    title:'ลิมิตสองด้าน — \\(\\lim_{x\\to 0}\\dfrac{|x|}{x}\\)',
    problem:'\\lim_{x\\to 0}\\dfrac{|x|}{x}',
    steps:[
      { id:'s1',
        prompt:'ตรวจลิมิตทางซ้าย \\(x\\to 0^{-}\\) ได้เท่าใด?',
        actions:[
          { id:'a', tex:'-1', correct:true },
          { id:'b', tex:'1' }, { id:'c', tex:'0' }, { id:'d', tex:'\\infty' },
        ],
        reasons:[
          { id:'r1', text:'เมื่อ \\(x<0\\) จะได้ \\(|x|=-x\\) → \\(-x/x=-1\\)', correct:true },
          { id:'r2', text:'เพราะ \\(|x|=x\\) เสมอ' },
          { id:'r3', text:'เพราะ \\(|x|\\to 0\\) ขณะ \\(x\\to 0\\)' },
          { id:'r4', text:'เพราะด้านซ้ายของ 0 คือจำนวนลบมาก' },
        ],
        commitText:'ลิมิตซ้าย = \\(-1\\)' },
      { id:'s2',
        prompt:'ตรวจลิมิตทางขวา \\(x\\to 0^{+}\\) ได้เท่าใด?',
        actions:[
          { id:'a', tex:'1', correct:true },
          { id:'b', tex:'-1' }, { id:'c', tex:'0' }, { id:'d', tex:'\\infty' },
        ],
        reasons:[
          { id:'r1', text:'เมื่อ \\(x>0\\) จะได้ \\(|x|=x\\) → \\(x/x=1\\)', correct:true },
          { id:'r2', text:'เพราะ \\(|x|\\ge 0\\) เท่านั้น' },
          { id:'r3', text:'เพราะ \\(x\\) ใหญ่กว่า 0' },
          { id:'r4', text:'เพราะ d/dx ของ |x| เท่ากับ 1' },
        ],
        commitText:'ลิมิตขวา = \\(1\\)' },
      { id:'s3',
        prompt:'สรุปลิมิตสองข้าง',
        actions:[
          { id:'a', tex:'\\text{ไม่มี (DNE)}', correct:true },
          { id:'b', tex:'0' }, { id:'c', tex:'1' }, { id:'d', tex:'-1' },
        ],
        reasons:[
          { id:'r1', text:'ลิมิตสองข้างไม่เท่ากัน → ลิมิตไม่มี', correct:true },
          { id:'r2', text:'ค่าเฉลี่ยของ \\(-1\\) กับ \\(1\\) คือ 0' },
          { id:'r3', text:'เลือกค่าข้างใดก็ได้' },
          { id:'r4', text:'เพราะฟังก์ชันไม่นิยามที่ 0' },
        ],
        commitText:'ลิมิตซ้าย \\(\\ne\\) ลิมิตขวา → ไม่มีลิมิต' },
    ],
    finalAnswer:{ tex:'\\text{DNE}', sayTH:'ลิมิตไม่มี' } },
];

/* ---------- SBRA: CONTINUITY ---------- */
const POOL_SBRA_CONT = [
  { id:'sbra-cont-removable', clo:'CLO2',
    title:'ตรวจต่อเนื่อง — removable',
    problem:'f(x)=\\begin{cases}\\dfrac{x^2-4}{x-2}&x\\ne 2\\\\5&x=2\\end{cases}\\quad\\text{ต่อเนื่องที่ }x=2\\text{ หรือไม่?}',
    steps:[
      { id:'s1',
        prompt:'\\(f(2)\\) มีค่าเท่าใด?',
        actions:[
          { id:'a', tex:'5', correct:true },
          { id:'b', tex:'4' }, { id:'c', tex:'0' }, { id:'d', tex:'\\text{ไม่นิยาม}' },
        ],
        reasons:[
          { id:'r1', text:'กรณี \\(x=2\\) นิยามตรงๆ ว่า \\(f(2)=5\\)', correct:true },
          { id:'r2', text:'เพราะลิมิตที่ 2 เท่ากับ 4' },
          { id:'r3', text:'เพราะเศษเป็น 0' },
          { id:'r4', text:'เพราะ \\(x-2=0\\) → ไม่นิยาม' },
        ],
        commitText:'\\(f(2)=5\\) (จาก branch)' },
      { id:'s2',
        prompt:'\\(\\lim_{x\\to 2}f(x)=\\) ?',
        actions:[
          { id:'a', tex:'4', correct:true },
          { id:'b', tex:'5' }, { id:'c', tex:'0' }, { id:'d', tex:'\\text{DNE}' },
        ],
        reasons:[
          { id:'r1', text:'แยกตัวประกอบ \\((x-2)(x+2)/(x-2)=x+2\\to 4\\)', correct:true },
          { id:'r2', text:'แทนค่า \\(f(2)=5\\) โดยตรง' },
          { id:'r3', text:'ตัวส่วน 0 แปลว่าลิมิตไม่มี' },
          { id:'r4', text:'ลิมิตเท่ากับค่าฟังก์ชันเสมอ' },
        ],
        commitText:'\\(\\lim_{x\\to 2}f(x)=4\\)' },
      { id:'s3',
        prompt:'สรุปประเภทความต่อเนื่องที่ \\(x=2\\)',
        actions:[
          { id:'a', tex:'\\text{ไม่ต่อเนื่องแบบ removable}', correct:true },
          { id:'b', tex:'\\text{ต่อเนื่อง}' },
          { id:'c', tex:'\\text{jump}' },
          { id:'d', tex:'\\text{infinite}' },
        ],
        reasons:[
          { id:'r1', text:'ลิมิตมี (=4) แต่ไม่เท่ากับ \\(f(2)=5\\) → removable', correct:true },
          { id:'r2', text:'ลิมิตซ้าย≠ขวา' },
          { id:'r3', text:'ฟังก์ชันเป็น ∞ ที่ 2' },
          { id:'r4', text:'\\(f(2)\\) นิยาม จึงต่อเนื่อง' },
        ],
        commitText:'ลิมิตมี แต่ \\(f(2)\\ne\\lim\\) → removable discontinuity' },
    ],
    finalAnswer:{ tex:'\\text{removable}', sayTH:'ไม่ต่อเนื่องแบบ removable' } },

  { id:'sbra-cont-findk', clo:'CLO2',
    title:'หา k ให้ต่อเนื่อง',
    problem:'f(x)=\\begin{cases}x+k&x<1\\\\3x&x\\ge 1\\end{cases}\\quad\\text{หา }k',
    steps:[
      { id:'s1',
        prompt:'ลิมิตทางซ้าย \\(\\lim_{x\\to 1^{-}}f(x)\\) =',
        actions:[
          { id:'a', tex:'1+k', correct:true },
          { id:'b', tex:'3' }, { id:'c', tex:'k' }, { id:'d', tex:'0' },
        ],
        reasons:[
          { id:'r1', text:'เมื่อ \\(x<1\\) ใช้ \\(f(x)=x+k\\) → แทน \\(x=1\\) ได้ \\(1+k\\)', correct:true },
          { id:'r2', text:'เพราะด้านซ้ายต้องเป็นค่าคงที่' },
          { id:'r3', text:'เพราะลิมิตซ้ายต้องเล็กกว่าขวา' },
          { id:'r4', text:'เพราะ branch ซ้ายให้ \\(f(1)\\) เสมอ' },
        ],
        commitText:'ลิมิตซ้าย = \\(1+k\\)' },
      { id:'s2',
        prompt:'ลิมิตทางขวา \\(\\lim_{x\\to 1^{+}}f(x)\\) =',
        actions:[
          { id:'a', tex:'3', correct:true },
          { id:'b', tex:'1' }, { id:'c', tex:'3k' }, { id:'d', tex:'1+k' },
        ],
        reasons:[
          { id:'r1', text:'เมื่อ \\(x\\ge 1\\) ใช้ \\(f(x)=3x\\) → แทน \\(x=1\\) ได้ 3', correct:true },
          { id:'r2', text:'เพราะลิมิตขวาต้องเท่ากับ \\(f(1)\\) เท่านั้น' },
          { id:'r3', text:'เพราะ 3x โตเร็วกว่า x+k' },
          { id:'r4', text:'เพราะขอบเขต \\(x\\ge 1\\) รวม 1' },
        ],
        commitText:'ลิมิตขวา = \\(3\\)' },
      { id:'s3',
        prompt:'เงื่อนไขต่อเนื่องทำให้ \\(k\\)=?',
        actions:[
          { id:'a', tex:'k=2', correct:true },
          { id:'b', tex:'k=3' }, { id:'c', tex:'k=1' }, { id:'d', tex:'k=0' },
        ],
        reasons:[
          { id:'r1', text:'ต่อเนื่อง ⇔ ลิมิตซ้าย=ขวา: \\(1+k=3 \\Rightarrow k=2\\)', correct:true },
          { id:'r2', text:'เพราะ \\(3\\cdot 1 = 3\\) และ \\(1+k\\) ต้องมากกว่า' },
          { id:'r3', text:'เพราะ \\(k\\) ต้องเป็น 3 เหมือนค่าขวา' },
          { id:'r4', text:'เพราะค่าใดก็ได้ที่ทำให้ \\(f\\) นิยาม' },
        ],
        commitText:'ต้องให้ \\(1+k=3\\) → \\(k=2\\)' },
    ],
    finalAnswer:{ tex:'k=2', sayTH:'ต้องใช้ k=2' } },

  { id:'sbra-cont-infty', clo:'CLO2',
    title:'จำแนกความไม่ต่อเนื่อง — \\(\\frac{1}{(x-3)^2}\\)',
    problem:'f(x)=\\dfrac{1}{(x-3)^2}\\text{ ที่ }x=3',
    steps:[
      { id:'s1',
        prompt:'\\(\\lim_{x\\to 3}f(x)\\) =',
        actions:[
          { id:'a', tex:'+\\infty', correct:true },
          { id:'b', tex:'-\\infty' }, { id:'c', tex:'0' }, { id:'d', tex:'\\text{DNE (ต่างทิศ)}' },
        ],
        reasons:[
          { id:'r1', text:'\\((x-3)^2>0\\) เสมอ และเข้า \\(0^{+}\\) → \\(1/0^{+}=+\\infty\\)', correct:true },
          { id:'r2', text:'เพราะ \\(x-3\\) เปลี่ยนเครื่องหมาย' },
          { id:'r3', text:'เพราะฟังก์ชันเป็นคู่' },
          { id:'r4', text:'เพราะ \\(1/0\\) คือ 0' },
        ],
        commitText:'\\(\\lim=+\\infty\\)' },
      { id:'s2',
        prompt:'สรุปประเภท',
        actions:[
          { id:'a', tex:'\\text{infinite discontinuity}', correct:true },
          { id:'b', tex:'\\text{removable}' },
          { id:'c', tex:'\\text{jump}' },
          { id:'d', tex:'\\text{ต่อเนื่อง}' },
        ],
        reasons:[
          { id:'r1', text:'ลิมิตเป็นอนันต์ + asymptote ตั้ง', correct:true },
          { id:'r2', text:'ลิมิตมีค่าจำกัดแต่ไม่เท่า \\(f(a)\\)' },
          { id:'r3', text:'ลิมิตซ้ายขวาต่างกัน' },
          { id:'r4', text:'\\(f\\) นิยามที่ 3' },
        ],
        commitText:'infinite discontinuity' },
    ],
    finalAnswer:{ tex:'\\text{infinite}', sayTH:'ไม่ต่อเนื่องแบบอนันต์' } },

  { id:'sbra-cont-ivt', clo:'CLO2',
    title:'IVT — \\(x^3+x-1=0\\) บน [0,1]',
    problem:'f(x)=x^3+x-1,\\ f(0)=-1,\\ f(1)=1 \\Rightarrow\\text{มีรากใน (0,1) หรือไม่?}',
    steps:[
      { id:'s1',
        prompt:'ตรวจต่อเนื่องของ \\(f\\) บน \\([0,1]\\)',
        actions:[
          { id:'a', tex:'\\text{ต่อเนื่อง}', correct:true },
          { id:'b', tex:'\\text{ไม่ต่อเนื่อง}' },
          { id:'c', tex:'\\text{ต้องตรวจแยกแต่ละจุด}' },
          { id:'d', tex:'\\text{ตรวจไม่ได้}' },
        ],
        reasons:[
          { id:'r1', text:'\\(f\\) เป็น polynomial → ต่อเนื่องทุกจุด', correct:true },
          { id:'r2', text:'เพราะ \\(f\\) มีค่าทั้งสองปลาย' },
          { id:'r3', text:'เพราะค่าเฉลี่ย -1 กับ 1 คือ 0' },
          { id:'r4', text:'เพราะช่วงปิดเสมอให้ต่อเนื่อง' },
        ],
        commitText:'polynomial → ต่อเนื่องบน \\([0,1]\\)' },
      { id:'s2',
        prompt:'เปรียบเทียบเครื่องหมายของ \\(f(0)\\) และ \\(f(1)\\)',
        actions:[
          { id:'a', tex:'\\text{เครื่องหมายต่างกัน } (f(0)<0<f(1))', correct:true },
          { id:'b', tex:'\\text{เครื่องหมายเดียวกัน}' },
          { id:'c', tex:'\\text{เป็น 0 ทั้งคู่}' },
          { id:'d', tex:'\\text{เทียบไม่ได้}' },
        ],
        reasons:[
          { id:'r1', text:'\\(-1<0<1\\) ซึ่ง 0 อยู่ระหว่าง \\(f(0)\\) และ \\(f(1)\\)', correct:true },
          { id:'r2', text:'เพราะเป็นช่วงยาว 1 หน่วย' },
          { id:'r3', text:'\\(f\\) เพิ่มทุกจุด' },
          { id:'r4', text:'0 เป็น average' },
        ],
        commitText:'\\(f(0)=-1<0<1=f(1)\\)' },
      { id:'s3',
        prompt:'ใช้ IVT สรุปได้ว่า?',
        actions:[
          { id:'a', tex:'\\exists c\\in(0,1):\\ f(c)=0', correct:true },
          { id:'b', tex:'\\text{ไม่มีรากใน (0,1)}' },
          { id:'c', tex:'\\text{มีหลายราก}' },
          { id:'d', tex:'\\text{สรุปไม่ได้}' },
        ],
        reasons:[
          { id:'r1', text:'IVT: ต่อเนื่อง + สลับเครื่องหมาย ⇒ มีค่า c ให้ f(c)=0', correct:true },
          { id:'r2', text:'เพราะดีกรี 3 มีรากเสมอ' },
          { id:'r3', text:'กราฟ odd symmetric' },
          { id:'r4', text:'ไม่มีข้อมูลเพียงพอ' },
        ],
        commitText:'IVT ⇒ มี \\(c\\in(0,1)\\) ที่ \\(f(c)=0\\)' },
    ],
    finalAnswer:{ tex:'\\exists\\,c\\in(0,1),\\ f(c)=0', sayTH:'มีรากอย่างน้อย 1 ค่าใน (0,1)' } },
];

/* ---------- SBRA: DIFFERENTIATION ---------- */
const POOL_SBRA_DIFF = [
  { id:'sbra-d-product', clo:'CLO3',
    title:'Product rule — \\(\\dfrac{d}{dx}[x^2\\sin x]\\)',
    problem:'\\dfrac{d}{dx}\\big[x^2\\sin x\\big]',
    steps:[
      { id:'s1',
        prompt:'กฎหลักที่เหมาะสม',
        actions:[
          { id:'a', tex:'\\text{Product rule}', correct:true },
          { id:'b', tex:'\\text{Chain rule}' },
          { id:'c', tex:'\\text{Quotient rule}' },
          { id:'d', tex:'\\text{Power rule อย่างเดียว}' },
        ],
        reasons:[
          { id:'r1', text:'เป็นผลคูณของสองฟังก์ชัน \\(x^2\\) กับ \\(\\sin x\\)', correct:true },
          { id:'r2', text:'เพราะมีฟังก์ชันประกอบ (composition)' },
          { id:'r3', text:'เพราะเศษ/ส่วน' },
          { id:'r4', text:'เพราะเป็น \\(x^n\\) ล้วน' },
        ],
        commitText:'ใช้ Product rule: \\((uv)\'=u\'v+uv\'\\)' },
      { id:'s2',
        prompt:'\\(u=x^2\\Rightarrow u\'=\\) ?',
        actions:[
          { id:'a', tex:'2x', correct:true },
          { id:'b', tex:'x' }, { id:'c', tex:'2' }, { id:'d', tex:'x^2' },
        ],
        reasons:[
          { id:'r1', text:'Power rule: \\((x^n)\'=nx^{n-1}\\)', correct:true },
          { id:'r2', text:'\\((x^2)\'=x^2\\) เพราะอนุพันธ์ของยกกำลังคือตัวเอง' },
          { id:'r3', text:'ลบ 1 จากดีกรี = 1' },
          { id:'r4', text:'\\((c)\'=0\\)' },
        ],
        commitText:'\\(u\'=2x\\)' },
      { id:'s3',
        prompt:'\\(v=\\sin x\\Rightarrow v\'=\\) ?',
        actions:[
          { id:'a', tex:'\\cos x', correct:true },
          { id:'b', tex:'-\\cos x' },
          { id:'c', tex:'-\\sin x' },
          { id:'d', tex:'\\tan x' },
        ],
        reasons:[
          { id:'r1', text:'สูตรมาตรฐาน \\((\\sin x)\'=\\cos x\\)', correct:true },
          { id:'r2', text:'\\((\\cos x)\'=-\\sin x\\) (ตัวที่ผิด)' },
          { id:'r3', text:'เพราะ sin เป็นฟังก์ชันคี่' },
          { id:'r4', text:'เพราะ sin,cos คู่กัน จึงสลับ' },
        ],
        commitText:'\\(v\'=\\cos x\\)' },
      { id:'s4',
        prompt:'ประกอบ \\(u\'v+uv\'\\)',
        actions:[
          { id:'a', tex:'2x\\sin x + x^2\\cos x', correct:true },
          { id:'b', tex:'2x\\cos x' },
          { id:'c', tex:'x^2\\cos x - 2x\\sin x' },
          { id:'d', tex:'2x\\sin x\\cos x' },
        ],
        reasons:[
          { id:'r1', text:'แทน u\',v,u,v\' ตามสูตร product rule', correct:true },
          { id:'r2', text:'เพราะ sin·cos=½sin(2x)' },
          { id:'r3', text:'Product rule คือ u\'v\' เท่านั้น' },
          { id:'r4', text:'เครื่องหมายสลับกันเสมอ' },
        ],
        commitText:'\\((x^2\\sin x)\'=2x\\sin x+x^2\\cos x\\)' },
    ],
    finalAnswer:{ tex:'2x\\sin x + x^2\\cos x' } },

  { id:'sbra-d-chain', clo:'CLO3',
    title:'Chain rule — \\(\\dfrac{d}{dx}[\\sin(3x^2)]\\)',
    problem:'\\dfrac{d}{dx}\\sin(3x^2)',
    steps:[
      { id:'s1',
        prompt:'แยกเป็น outer/inner อย่างไร?',
        actions:[
          { id:'a', tex:'\\text{outer}=\\sin u,\\ \\text{inner}=3x^2', correct:true },
          { id:'b', tex:'\\text{outer}=3x^2,\\ \\text{inner}=\\sin' },
          { id:'c', tex:'\\text{outer}=3,\\ \\text{inner}=x^2\\sin' },
          { id:'d', tex:'\\text{outer}=x^2,\\ \\text{inner}=\\sin(3)' },
        ],
        reasons:[
          { id:'r1', text:'ฟังก์ชันนอกสุดคือ sin; อาร์กิวเมนต์ข้างในคือ \\(3x^2\\)', correct:true },
          { id:'r2', text:'เพราะ \\(3x^2\\) ใหญ่กว่า' },
          { id:'r3', text:'เพราะต้องใช้ประจุ outer ให้เป็นพหุนาม' },
          { id:'r4', text:'Chain rule คือสลับลำดับ' },
        ],
        commitText:'outer = sin, inner = \\(3x^2\\)' },
      { id:'s2',
        prompt:'อนุพันธ์ outer ที่ u: \\((\\sin u)\'\\)',
        actions:[
          { id:'a', tex:'\\cos u', correct:true },
          { id:'b', tex:'-\\cos u' }, { id:'c', tex:'\\sin u' }, { id:'d', tex:'-\\sin u' },
        ],
        reasons:[
          { id:'r1', text:'สูตร \\((\\sin)\'=\\cos\\)', correct:true },
          { id:'r2', text:'สูตร \\((\\cos)\'=-\\sin\\)' },
          { id:'r3', text:'เพราะ sin เป็นคี่' },
          { id:'r4', text:'เพราะต้องใช้สัญลักษณ์ u' },
        ],
        commitText:'\\((\\sin u)\'=\\cos u\\) → \\(\\cos(3x^2)\\)' },
      { id:'s3',
        prompt:'อนุพันธ์ inner \\((3x^2)\'\\)',
        actions:[
          { id:'a', tex:'6x', correct:true },
          { id:'b', tex:'3x' }, { id:'c', tex:'2x' }, { id:'d', tex:'3x^2' },
        ],
        reasons:[
          { id:'r1', text:'\\((3x^2)\'=3\\cdot 2x=6x\\)', correct:true },
          { id:'r2', text:'เพราะสัมประสิทธิ์เดิม 3 หายไป' },
          { id:'r3', text:'power rule ลบ 1 แค่ครั้งเดียว' },
          { id:'r4', text:'เพราะ d/dx ของคงตัวคูณด้วย x² คือ 2x' },
        ],
        commitText:'\\((3x^2)\'=6x\\)' },
      { id:'s4',
        prompt:'Chain rule: outer\'(inner) · inner\'',
        actions:[
          { id:'a', tex:'6x\\cos(3x^2)', correct:true },
          { id:'b', tex:'\\cos(6x)' },
          { id:'c', tex:'6x\\sin(3x^2)' },
          { id:'d', tex:'\\cos(3x^2)\\cdot 3x^2' },
        ],
        reasons:[
          { id:'r1', text:'คูณ outer\' ที่ประเมินที่ inner แล้วคูณด้วย inner\'', correct:true },
          { id:'r2', text:'chain คือเอามาบวกกัน' },
          { id:'r3', text:'คูณ inner เดิมตรง ๆ' },
          { id:'r4', text:'ใช้ cos แทน sin เพราะสลับ' },
        ],
        commitText:'\\((\\sin(3x^2))\'=6x\\cos(3x^2)\\)' },
    ],
    finalAnswer:{ tex:'6x\\cos(3x^2)' } },

  { id:'sbra-d-quotient', clo:'CLO3',
    title:'Quotient rule — \\(\\dfrac{d}{dx}\\big[\\dfrac{2x+1}{x^2+1}\\big]\\)',
    problem:'\\dfrac{d}{dx}\\dfrac{2x+1}{x^2+1}',
    steps:[
      { id:'s1',
        prompt:'กฎหลัก',
        actions:[
          { id:'a', tex:'\\text{Quotient rule}', correct:true },
          { id:'b', tex:'\\text{Product rule}' },
          { id:'c', tex:'\\text{Chain rule}' },
          { id:'d', tex:'\\text{Power rule}' },
        ],
        reasons:[
          { id:'r1', text:'เป็นเศษ/ส่วน และตัวส่วนมีตัวแปร', correct:true },
          { id:'r2', text:'เพราะมีผลคูณสองฟังก์ชัน' },
          { id:'r3', text:'เพราะมี composition' },
          { id:'r4', text:'เพราะเป็น \\(x^n\\)' },
        ],
        commitText:'ใช้ Quotient rule: \\((u/v)\'=(u\'v-uv\')/v^2\\)' },
      { id:'s2',
        prompt:'u = 2x+1 → u\' = ?',
        actions:[
          { id:'a', tex:'2', correct:true },
          { id:'b', tex:'1' }, { id:'c', tex:'0' }, { id:'d', tex:'2x' },
        ],
        reasons:[
          { id:'r1', text:'\\((2x)\'=2,\\ (1)\'=0\\) รวมกัน = 2', correct:true },
          { id:'r2', text:'\\((c)\'=c\\)' },
          { id:'r3', text:'\\((2x+1)\'=2x\\)' },
          { id:'r4', text:'ตัดค่าคงตัวทิ้ง' },
        ],
        commitText:'u\' = 2' },
      { id:'s3',
        prompt:'v = x²+1 → v\' = ?',
        actions:[
          { id:'a', tex:'2x', correct:true },
          { id:'b', tex:'x' }, { id:'c', tex:'2x+1' }, { id:'d', tex:'2' },
        ],
        reasons:[
          { id:'r1', text:'power rule + \\((1)\'=0\\)', correct:true },
          { id:'r2', text:'เพราะ \\(x^2+1\\) เอง' },
          { id:'r3', text:'\\((x^2)\'=x\\)' },
          { id:'r4', text:'เพราะ \\(v\\) คือค่าคงตัว' },
        ],
        commitText:'v\' = 2x' },
      { id:'s4',
        prompt:'ประกอบ (u\'v - uv\') / v²',
        actions:[
          { id:'a', tex:'\\dfrac{2(x^2+1)-(2x+1)(2x)}{(x^2+1)^2}', correct:true },
          { id:'b', tex:'\\dfrac{2\\cdot 2x}{(x^2+1)^2}' },
          { id:'c', tex:'\\dfrac{(2x+1)(2x)-2(x^2+1)}{(x^2+1)^2}' },
          { id:'d', tex:'2(x^2+1)-(2x+1)(2x)' },
        ],
        reasons:[
          { id:'r1', text:'\\((u/v)\'=(u\'v-uv\')/v^2\\) — เรียง u\'v ก่อน', correct:true },
          { id:'r2', text:'Quotient rule คือ u\'·v\'' },
          { id:'r3', text:'สลับเครื่องหมายลบไปข้างหน้า' },
          { id:'r4', text:'ลืมใส่กำลัง 2 ของ v ได้' },
        ],
        commitText:'\\(\\dfrac{2(x^2+1)-(2x+1)(2x)}{(x^2+1)^2}\\)' },
      { id:'s5',
        prompt:'ลดรูปเศษ',
        actions:[
          { id:'a', tex:'-2x^2-2x+2', correct:true },
          { id:'b', tex:'2x^2-2x+2' },
          { id:'c', tex:'-2x^2+2x-2' },
          { id:'d', tex:'2x^2+2x+2' },
        ],
        reasons:[
          { id:'r1', text:'\\(2x^2+2-(4x^2+2x)=-2x^2-2x+2\\)', correct:true },
          { id:'r2', text:'\\((2x+1)(2x)=2x^2+2x\\)' },
          { id:'r3', text:'ลืมกระจายเครื่องหมาย' },
          { id:'r4', text:'สัมประสิทธิ์คงเดิม' },
        ],
        commitText:'เศษ = \\(-2x^2-2x+2\\)' },
    ],
    finalAnswer:{ tex:'\\dfrac{-2x^2-2x+2}{(x^2+1)^2}' } },

  { id:'sbra-d-expchain', clo:'CLO3',
    title:'Chain + exp — \\(\\dfrac{d}{dx}e^{x^2}\\)',
    problem:'\\dfrac{d}{dx}e^{x^2}',
    steps:[
      { id:'s1',
        prompt:'แยก outer/inner',
        actions:[
          { id:'a', tex:'\\text{outer}=e^u,\\ \\text{inner}=x^2', correct:true },
          { id:'b', tex:'\\text{outer}=x^2,\\ \\text{inner}=e^u' },
          { id:'c', tex:'\\text{outer}=e,\\ \\text{inner}=x^2' },
          { id:'d', tex:'\\text{ไม่ต้องแยก ใช้ power rule}' },
        ],
        reasons:[
          { id:'r1', text:'ฟังก์ชันประกอบ: exp ครอบ \\(x^2\\)', correct:true },
          { id:'r2', text:'เพราะ e เป็นค่าคงตัว' },
          { id:'r3', text:'\\(e^{x^2}\\) คือ \\(x^2\\) คูณ e' },
          { id:'r4', text:'เพราะ power rule ใช้กับ \\(x^n\\) ทุกกรณี' },
        ],
        commitText:'outer = \\(e^u\\), inner = \\(x^2\\)' },
      { id:'s2',
        prompt:'\\((e^u)\'\\)',
        actions:[
          { id:'a', tex:'e^u', correct:true },
          { id:'b', tex:'u e^{u-1}' }, { id:'c', tex:'1/u' }, { id:'d', tex:'\\ln u' },
        ],
        reasons:[
          { id:'r1', text:'สูตรพิเศษของ exp: อนุพันธ์ = ตัวเอง', correct:true },
          { id:'r2', text:'power rule' }, { id:'r3', text:'สูตรของ ln' },
          { id:'r4', text:'เพราะ e ≈ 2.71' },
        ],
        commitText:'\\((e^u)\'=e^u\\)' },
      { id:'s3',
        prompt:'\\((x^2)\'\\)',
        actions:[
          { id:'a', tex:'2x', correct:true },
          { id:'b', tex:'x' }, { id:'c', tex:'2' }, { id:'d', tex:'x^2' },
        ],
        reasons:[
          { id:'r1', text:'power rule', correct:true },
          { id:'r2', text:'เพราะ \\(x^2=x\\cdot x\\)' },
          { id:'r3', text:'ลบ 1 จาก 2' }, { id:'r4', text:'คงที่' },
        ],
        commitText:'inner\' = \\(2x\\)' },
      { id:'s4',
        prompt:'ประกอบ chain rule',
        actions:[
          { id:'a', tex:'2x\\,e^{x^2}', correct:true },
          { id:'b', tex:'e^{2x}' },
          { id:'c', tex:'e^{x^2}/2x' },
          { id:'d', tex:'2x+e^{x^2}' },
        ],
        reasons:[
          { id:'r1', text:'outer\'(inner)·inner\' = \\(e^{x^2}\\cdot 2x\\)', correct:true },
          { id:'r2', text:'chain = บวก' }, { id:'r3', text:'outer\'/inner\'' },
          { id:'r4', text:'outer+inner' },
        ],
        commitText:'\\((e^{x^2})\'=2xe^{x^2}\\)' },
    ],
    finalAnswer:{ tex:'2xe^{x^2}' } },

  { id:'sbra-d-critical', clo:'CLO4',
    title:'หาจุดวิกฤต — \\(f(x)=x^3-3x\\)',
    problem:'\\text{หา critical points และจำแนก: }f(x)=x^3-3x',
    steps:[
      { id:'s1',
        prompt:'\\(f\'(x)\\) =',
        actions:[
          { id:'a', tex:'3x^2-3', correct:true },
          { id:'b', tex:'3x^2' }, { id:'c', tex:'x^2-3' }, { id:'d', tex:'3x-3' },
        ],
        reasons:[
          { id:'r1', text:'power rule: \\((x^3)\'=3x^2\\), \\((3x)\'=3\\)', correct:true },
          { id:'r2', text:'ลืม \\((3x)\'\\)' }, { id:'r3', text:'ลดดีกรี 1' },
          { id:'r4', text:'แยกตัวประกอบเลย' },
        ],
        commitText:'\\(f\'(x)=3x^2-3\\)' },
      { id:'s2',
        prompt:'แก้ \\(f\'(x)=0\\)',
        actions:[
          { id:'a', tex:'x=\\pm 1', correct:true },
          { id:'b', tex:'x=0' },
          { id:'c', tex:'x=\\pm\\sqrt{3}' },
          { id:'d', tex:'x=3' },
        ],
        reasons:[
          { id:'r1', text:'\\(3(x^2-1)=0\\Rightarrow x^2=1\\Rightarrow x=\\pm 1\\)', correct:true },
          { id:'r2', text:'เพราะ \\(f\'(0)=-3\\)' },
          { id:'r3', text:'เพราะยกกำลังสองต้องใช้รากที่ 2 ของ 3' },
          { id:'r4', text:'เพราะ \\(f(3)=18\\)' },
        ],
        commitText:'Critical points: \\(x=\\pm 1\\)' },
      { id:'s3',
        prompt:'\\(f\'\'(x)\\) =',
        actions:[
          { id:'a', tex:'6x', correct:true },
          { id:'b', tex:'3x' }, { id:'c', tex:'6' }, { id:'d', tex:'3x^2' },
        ],
        reasons:[
          { id:'r1', text:'อนุพันธ์ครั้งที่สองของ \\(3x^2-3\\)', correct:true },
          { id:'r2', text:'ลืมตัดค่าคงตัว' }, { id:'r3', text:'power rule ซ้ำ' },
          { id:'r4', text:'เพราะ constant → 0' },
        ],
        commitText:'\\(f\'\'(x)=6x\\)' },
      { id:'s4',
        prompt:'จำแนก max/min',
        actions:[
          { id:'a', tex:'x=1\\text{ min},\\ x=-1\\text{ max}', correct:true },
          { id:'b', tex:'x=1\\text{ max},\\ x=-1\\text{ min}' },
          { id:'c', tex:'\\text{saddle ทั้งคู่}' },
          { id:'d', tex:'\\text{ไม่มี max/min}' },
        ],
        reasons:[
          { id:'r1', text:'\\(f\'\'(1)=6>0\\) min; \\(f\'\'(-1)=-6<0\\) max (2nd derivative test)', correct:true },
          { id:'r2', text:'เพราะฟังก์ชัน odd' },
          { id:'r3', text:'ต้องใช้ 1st derivative test เสมอ' },
          { id:'r4', text:'ค่าสุดขั้วอยู่ที่กลาง \\(x=0\\)' },
        ],
        commitText:'\\(x=1\\): min, \\(x=-1\\): max' },
    ],
    finalAnswer:{ tex:'x=-1\\ \\text{(max)},\\ x=1\\ \\text{(min)}' } },

  { id:'sbra-d-implicit', clo:'CLO3',
    title:'Implicit — \\(x^2+y^2=25\\), หา \\(dy/dx\\)',
    problem:'x^2+y^2=25,\\ \\dfrac{dy}{dx}=?',
    steps:[
      { id:'s1',
        prompt:'อนุพันธ์ทั้งสองข้างตาม \\(x\\)',
        actions:[
          { id:'a', tex:'2x+2y\\,\\dfrac{dy}{dx}=0', correct:true },
          { id:'b', tex:'2x+2y=0' },
          { id:'c', tex:'2x+2y\\,dy=0' },
          { id:'d', tex:'x+y\\,y\'=25' },
        ],
        reasons:[
          { id:'r1', text:'Chain rule กับ \\(y^2\\): \\(\\frac{d}{dx}(y^2)=2y\\,y\'\\)', correct:true },
          { id:'r2', text:'\\((y^2)\'=2y\\) อย่างเดียว (ลืม chain)' },
          { id:'r3', text:'25\' ไม่ใช่ 0' },
          { id:'r4', text:'ไม่ต้องหารด้วย 2' },
        ],
        commitText:'\\(2x+2y\\,y\'=0\\)' },
      { id:'s2',
        prompt:'แก้หา \\(y\'\\)',
        actions:[
          { id:'a', tex:'y\'=-\\dfrac{x}{y}', correct:true },
          { id:'b', tex:'y\'=\\dfrac{x}{y}' },
          { id:'c', tex:'y\'=-\\dfrac{y}{x}' },
          { id:'d', tex:'y\'=-x' },
        ],
        reasons:[
          { id:'r1', text:'จาก \\(2y\\,y\'=-2x\\Rightarrow y\'=-x/y\\)', correct:true },
          { id:'r2', text:'ลืมเครื่องหมายลบ' },
          { id:'r3', text:'สลับ x กับ y' },
          { id:'r4', text:'หาร y ไม่ได้' },
        ],
        commitText:'\\(y\'=-x/y\\)' },
    ],
    finalAnswer:{ tex:'\\dfrac{dy}{dx}=-\\dfrac{x}{y}' } },
];

/* ---------- SBRA: INTEGRATION ---------- */
const POOL_SBRA_INT = [
  { id:'sbra-i-usub', clo:'CLO5',
    title:'u-substitution — \\(\\int 2x\\cos(x^2)\\,dx\\)',
    problem:'\\int 2x\\cos(x^2)\\,dx',
    steps:[
      { id:'s1',
        prompt:'เลือก \\(u\\) ให้เหมาะสม',
        actions:[
          { id:'a', tex:'u=x^2', correct:true },
          { id:'b', tex:'u=\\cos(x^2)' },
          { id:'c', tex:'u=2x' },
          { id:'d', tex:'u=\\cos u' },
        ],
        reasons:[
          { id:'r1', text:'\\(2x\\) คือ \\(du/dx\\) ของ \\(x^2\\) — จัด \\(du\\) ได้พอดี', correct:true },
          { id:'r2', text:'เพราะ cos(x²) ซับซ้อนกว่า' },
          { id:'r3', text:'เพราะเป็นสัมประสิทธิ์นำ' },
          { id:'r4', text:'เพราะ u ต้องอยู่ข้างนอก' },
        ],
        commitText:'ให้ \\(u=x^2\\)' },
      { id:'s2',
        prompt:'\\(du\\) =',
        actions:[
          { id:'a', tex:'2x\\,dx', correct:true },
          { id:'b', tex:'x^2\\,dx' },
          { id:'c', tex:'2\\,dx' },
          { id:'d', tex:'\\cos(x^2)\\,dx' },
        ],
        reasons:[
          { id:'r1', text:'อนุพันธ์ของ \\(x^2\\) คือ \\(2x\\) คูณ \\(dx\\)', correct:true },
          { id:'r2', text:'เพราะ u เป็น \\(x^2\\)' },
          { id:'r3', text:'เพราะ 2 คือค่าคงตัว' },
          { id:'r4', text:'เพราะต้องเลือกตามอาร์กิวเมนต์ของ cos' },
        ],
        commitText:'\\(du=2x\\,dx\\)' },
      { id:'s3',
        prompt:'เขียนอินทิกรัลเป็น u',
        actions:[
          { id:'a', tex:'\\int\\cos u\\,du', correct:true },
          { id:'b', tex:'\\int 2u\\cos u\\,du' },
          { id:'c', tex:'\\int u\\cos u\\,du' },
          { id:'d', tex:'\\int\\cos u\\,dx' },
        ],
        reasons:[
          { id:'r1', text:'แทนที่ \\(x^2\\to u\\) และ \\(2x\\,dx\\to du\\) ตรง ๆ', correct:true },
          { id:'r2', text:'เก็บ 2x ไว้ข้างนอก' },
          { id:'r3', text:'\\(dx\\) ไม่ต้องแทน' },
          { id:'r4', text:'คง \\(u\\) ไว้ข้างนอก cos' },
        ],
        commitText:'อินทิกรัลใหม่: \\(\\int\\cos u\\,du\\)' },
      { id:'s4',
        prompt:'หาปริพันธ์ แล้วแทนกลับ',
        actions:[
          { id:'a', tex:'\\sin(x^2)+C', correct:true },
          { id:'b', tex:'\\cos(x^2)+C' },
          { id:'c', tex:'-\\sin(x^2)+C' },
          { id:'d', tex:'\\sin u + C' },
        ],
        reasons:[
          { id:'r1', text:'\\(\\int\\cos u\\,du=\\sin u+C\\) แล้วแทน \\(u=x^2\\)', correct:true },
          { id:'r2', text:'อนุพันธ์ของ sin คือ cos' },
          { id:'r3', text:'ลืมบวก C' },
          { id:'r4', text:'ไม่ต้องแทนกลับ' },
        ],
        commitText:'\\(\\int\\cos u\\,du=\\sin u+C=\\sin(x^2)+C\\)' },
    ],
    finalAnswer:{ tex:'\\sin(x^2)+C' } },

  { id:'sbra-i-ibp', clo:'CLO5',
    title:'Integration by parts — \\(\\int xe^x\\,dx\\)',
    problem:'\\int xe^x\\,dx',
    steps:[
      { id:'s1',
        prompt:'เทคนิคที่เหมาะสม',
        actions:[
          { id:'a', tex:'\\text{Integration by parts}', correct:true },
          { id:'b', tex:'\\text{u-substitution}' },
          { id:'c', tex:'\\text{Partial fractions}' },
          { id:'d', tex:'\\text{Power rule}' },
        ],
        reasons:[
          { id:'r1', text:'ผลคูณของสองฟังก์ชันที่ต่างประเภท (algebraic × exp)', correct:true },
          { id:'r2', text:'มีเศษ/ส่วน' }, { id:'r3', text:'มีอนุพันธ์ข้างใน' },
          { id:'r4', text:'เป็น \\(x^n\\) ล้วน' },
        ],
        commitText:'ใช้ IBP: \\(\\int u\\,dv=uv-\\int v\\,du\\)' },
      { id:'s2',
        prompt:'เลือก u, dv ตาม LIATE',
        actions:[
          { id:'a', tex:'u=x,\\ dv=e^x\\,dx', correct:true },
          { id:'b', tex:'u=e^x,\\ dv=x\\,dx' },
          { id:'c', tex:'u=xe^x,\\ dv=dx' },
          { id:'d', tex:'u=dx,\\ dv=xe^x' },
        ],
        reasons:[
          { id:'r1', text:'LIATE: Algebraic (x) ก่อน Exponential (e^x)', correct:true },
          { id:'r2', text:'เพราะ e^x ใหญ่กว่า' },
          { id:'r3', text:'ต้องให้ dv ง่ายที่สุด' },
          { id:'r4', text:'ใช้ขั้นตอนใดก็ได้' },
        ],
        commitText:'\\(u=x,\\ dv=e^x\\,dx\\)' },
      { id:'s3',
        prompt:'คำนวณ \\(du\\) และ \\(v\\)',
        actions:[
          { id:'a', tex:'du=dx,\\ v=e^x', correct:true },
          { id:'b', tex:'du=1,\\ v=e^x\\,dx' },
          { id:'c', tex:'du=x\\,dx,\\ v=e^x' },
          { id:'d', tex:'du=dx,\\ v=xe^x' },
        ],
        reasons:[
          { id:'r1', text:'\\((x)\'=1\\) → \\(du=dx\\); \\(\\int e^x\\,dx=e^x\\)', correct:true },
          { id:'r2', text:'\\(du\\) ไม่มี dx' }, { id:'r3', text:'เพราะ v = original' },
          { id:'r4', text:'เพราะเลือก u ผิด' },
        ],
        commitText:'\\(du=dx,\\ v=e^x\\)' },
      { id:'s4',
        prompt:'ใส่สูตร IBP: \\(uv-\\int v\\,du\\)',
        actions:[
          { id:'a', tex:'xe^x-\\int e^x\\,dx', correct:true },
          { id:'b', tex:'e^x-\\int xe^x\\,dx' },
          { id:'c', tex:'\\int xe^x\\,dx' },
          { id:'d', tex:'xe^x+\\int e^x\\,dx' },
        ],
        reasons:[
          { id:'r1', text:'\\(uv=xe^x\\); \\(\\int v\\,du=\\int e^x\\,dx\\)', correct:true },
          { id:'r2', text:'IBP เครื่องหมายบวก' }, { id:'r3', text:'สลับ u กับ v' },
          { id:'r4', text:'เพราะ du=dx ไม่ต้องใส่' },
        ],
        commitText:'\\(= xe^x-\\int e^x\\,dx\\)' },
      { id:'s5',
        prompt:'ทำอินทิกรัลที่เหลือ',
        actions:[
          { id:'a', tex:'xe^x-e^x+C', correct:true },
          { id:'b', tex:'xe^x+e^x+C' },
          { id:'c', tex:'xe^x-\\ln(e^x)+C' },
          { id:'d', tex:'e^x-xe^x+C' },
        ],
        reasons:[
          { id:'r1', text:'\\(\\int e^x\\,dx=e^x+C\\)', correct:true },
          { id:'r2', text:'อนุพันธ์ของ \\(e^x\\) คือ \\(xe^x\\)' },
          { id:'r3', text:'ต้องใช้ ln' },
          { id:'r4', text:'สลับเครื่องหมาย' },
        ],
        commitText:'\\(xe^x-e^x+C\\)' },
    ],
    finalAnswer:{ tex:'xe^x-e^x+C' } },

  { id:'sbra-i-definite', clo:'CLO5',
    title:'FTC — \\(\\int_0^2 3x^2\\,dx\\)',
    problem:'\\int_0^2 3x^2\\,dx',
    steps:[
      { id:'s1',
        prompt:'หา antiderivative \\(F(x)\\)',
        actions:[
          { id:'a', tex:'F(x)=x^3', correct:true },
          { id:'b', tex:'F(x)=x^3+C' },
          { id:'c', tex:'F(x)=\\tfrac{3}{2}x^2' },
          { id:'d', tex:'F(x)=6x' },
        ],
        reasons:[
          { id:'r1', text:'power rule: \\(\\int 3x^2\\,dx=x^3\\) (ไม่ต้องบวก C เพราะเป็น definite)', correct:true },
          { id:'r2', text:'ต้องเพิ่มกำลัง 2' },
          { id:'r3', text:'ต้องหารด้วย 2' },
          { id:'r4', text:'อนุพันธ์ซ้ำ' },
        ],
        commitText:'\\(F(x)=x^3\\)' },
      { id:'s2',
        prompt:'ใช้ FTC: \\(F(2)-F(0)\\)',
        actions:[
          { id:'a', tex:'8', correct:true },
          { id:'b', tex:'0' }, { id:'c', tex:'6' }, { id:'d', tex:'2' },
        ],
        reasons:[
          { id:'r1', text:'\\(F(2)=8,\\ F(0)=0 → 8-0=8\\)', correct:true },
          { id:'r2', text:'เพราะ \\(2^2=4\\)' },
          { id:'r3', text:'เพราะคูณด้วย 3' }, { id:'r4', text:'สลับ upper/lower' },
        ],
        commitText:'\\(\\int_0^2 3x^2\\,dx = 2^3-0^3 = 8\\)' },
    ],
    finalAnswer:{ tex:'8' } },

  { id:'sbra-i-arctan', clo:'CLO5',
    title:'สูตรมาตรฐาน — \\(\\int\\dfrac{1}{x^2+1}\\,dx\\)',
    problem:'\\int\\dfrac{1}{x^2+1}\\,dx',
    steps:[
      { id:'s1',
        prompt:'จดจำสูตรที่เหมาะสม',
        actions:[
          { id:'a', tex:'\\text{arctan rule}', correct:true },
          { id:'b', tex:'\\text{u-sub}' },
          { id:'c', tex:'\\text{IBP}' },
          { id:'d', tex:'\\text{power rule}' },
        ],
        reasons:[
          { id:'r1', text:'\\(\\dfrac{d}{dx}\\arctan x = \\dfrac{1}{x^2+1}\\)', correct:true },
          { id:'r2', text:'เพราะตัวส่วนเป็นกำลัง 2' },
          { id:'r3', text:'เพราะเป็นผลคูณฟังก์ชัน' },
          { id:'r4', text:'เพราะเป็น \\(x^n\\)' },
        ],
        commitText:'รู้จักสูตรนี้เป็น arctan' },
      { id:'s2',
        prompt:'ผลลัพธ์',
        actions:[
          { id:'a', tex:'\\arctan x + C', correct:true },
          { id:'b', tex:'\\ln(x^2+1)+C' },
          { id:'c', tex:'\\dfrac{1}{2x}+C' },
          { id:'d', tex:'\\arcsin x + C' },
        ],
        reasons:[
          { id:'r1', text:'antiderivative ของ \\(1/(x^2+1)\\) คือ \\(\\arctan x\\)', correct:true },
          { id:'r2', text:'เพราะ \\((\\ln)\'=1/x\\)' },
          { id:'r3', text:'สูตรของ arcsin คือ \\(1/\\sqrt{1-x^2}\\)' },
          { id:'r4', text:'ใช้ power rule ลบ 1' },
        ],
        commitText:'\\(\\int\\frac{1}{x^2+1}\\,dx=\\arctan x+C\\)' },
    ],
    finalAnswer:{ tex:'\\arctan x + C' } },

  { id:'sbra-i-area', clo:'CLO6',
    title:'พื้นที่ระหว่าง \\(y=x\\) และ \\(y=x^2\\)',
    problem:'\\text{หา area ระหว่าง }y=x,\\ y=x^2\\text{ บน }[0,1]',
    steps:[
      { id:'s1',
        prompt:'ฟังก์ชันใดอยู่บนในช่วง [0,1]',
        actions:[
          { id:'a', tex:'y=x \\ge y=x^2', correct:true },
          { id:'b', tex:'y=x^2 \\ge y=x' },
          { id:'c', tex:'\\text{เท่ากันทั้งช่วง}' },
          { id:'d', tex:'\\text{ตัดกันที่จุดเดียว}' },
        ],
        reasons:[
          { id:'r1', text:'ที่ \\(0<x<1\\): \\(x>x^2\\) (เช่น x=0.5: 0.5>0.25)', correct:true },
          { id:'r2', text:'เพราะดีกรี 2 ใหญ่กว่า' },
          { id:'r3', text:'เพราะทั้งคู่เป็น 0 ที่ 0' },
          { id:'r4', text:'พาราโบลาอยู่บนเสมอ' },
        ],
        commitText:'บน [0,1]: \\(x\\ge x^2\\)' },
      { id:'s2',
        prompt:'เขียน integrand',
        actions:[
          { id:'a', tex:'\\int_0^1 (x-x^2)\\,dx', correct:true },
          { id:'b', tex:'\\int_0^1 (x^2-x)\\,dx' },
          { id:'c', tex:'\\int_0^1 x\\,dx - \\int_0^1 x^2\\,dx\\ \\text{(ค่าสัมบูรณ์)}' },
          { id:'d', tex:'\\int_0^1 |x+x^2|\\,dx' },
        ],
        reasons:[
          { id:'r1', text:'พื้นที่ = \\(\\int (\\text{บน}-\\text{ล่าง})\\,dx\\)', correct:true },
          { id:'r2', text:'สลับลำดับได้เพราะมีค่าสัมบูรณ์' },
          { id:'r3', text:'พื้นที่คือผลรวม' },
          { id:'r4', text:'ต้องคำนวณแยก' },
        ],
        commitText:'\\(\\text{Area}=\\int_0^1(x-x^2)\\,dx\\)' },
      { id:'s3',
        prompt:'antiderivative',
        actions:[
          { id:'a', tex:'\\tfrac{x^2}{2}-\\tfrac{x^3}{3}', correct:true },
          { id:'b', tex:'x-\\tfrac{x^3}{3}' },
          { id:'c', tex:'\\tfrac{x^2}{2}+\\tfrac{x^3}{3}' },
          { id:'d', tex:'x^2-x^3' },
        ],
        reasons:[
          { id:'r1', text:'power rule: \\(\\int x\\,dx=x^2/2,\\ \\int x^2=x^3/3\\)', correct:true },
          { id:'r2', text:'ลืมหารด้วยกำลังใหม่' },
          { id:'r3', text:'เครื่องหมายบวกแทนลบ' },
          { id:'r4', text:'power rule ใช้กับตัวเดียว' },
        ],
        commitText:'\\(F(x)=x^2/2-x^3/3\\)' },
      { id:'s4',
        prompt:'ประเมินที่ขอบ 0 → 1',
        actions:[
          { id:'a', tex:'\\tfrac{1}{6}', correct:true },
          { id:'b', tex:'\\tfrac{1}{2}' },
          { id:'c', tex:'\\tfrac{1}{3}' },
          { id:'d', tex:'\\tfrac{5}{6}' },
        ],
        reasons:[
          { id:'r1', text:'\\(\\tfrac12-\\tfrac13=\\tfrac{3-2}{6}=\\tfrac16\\)', correct:true },
          { id:'r2', text:'เพราะ \\(F(0)\\ne 0\\)' },
          { id:'r3', text:'ต้องคูณ 2' },
          { id:'r4', text:'คำนวณเฉพาะ upper' },
        ],
        commitText:'\\(F(1)-F(0)=\\tfrac12-\\tfrac13=\\tfrac16\\)' },
    ],
    finalAnswer:{ tex:'\\dfrac{1}{6}' } },
];

const CONTINUITY_MISSIONS = [
  {
    id:'cont-m1', bloom:1, icon:'🔖', clo:'CLO-C1',
    title:'จำนิยามและประเภทความไม่ต่อเนื่อง',
    cloLabel:'CLO-C1: ระบุนิยามและจำแนกประเภทของความไม่ต่อเนื่องได้',
    type:'quick-mcq',
    pool: POOL_M1_REMEMBER,
    draw: 5,
    passThreshold: 4,
    rubric:[
      `คลัง ${POOL_M1_REMEMBER.length} ข้อ — สุ่มครั้งละ 5 ข้อ`,
      'ตอบถูก ≥ 4 จาก 5 ข้อ = ผ่าน',
    ],
    xp:10,
  },
  {
    id:'cont-m2', bloom:2, icon:'🗂', clo:'CLO-C2',
    title:'จับคู่กราฟกับประเภทความไม่ต่อเนื่อง',
    cloLabel:'CLO-C2: อธิบายความหมายเชิงกราฟของประเภทความไม่ต่อเนื่องได้',
    type:'match-graph',
    graphPool: POOL_M2_GRAPHS,
    drawGraphs: 4,
    labels: M2_LABELS,
    rubric:[
      `กราฟ ${POOL_M2_GRAPHS.length} ตัวในคลัง — สุ่ม 4 ตัว/รอบ`,
      'จับคู่ถูกทั้ง 4 คู่ = ผ่าน',
    ],
    xp:15,
  },
  {
    id:'cont-m3', bloom:3, icon:'✏', clo:'CLO-C3',
    title:'คำนวณพารามิเตอร์ให้ฟังก์ชันต่อเนื่อง',
    cloLabel:'CLO-C3: คำนวณพารามิเตอร์ที่ทำให้ฟังก์ชันต่อเนื่องได้',
    type:'numeric',
    pool: POOL_M3_NUMERIC,
    rubric:[
      `คลัง ${POOL_M3_NUMERIC.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,
      'คำตอบอยู่ใน ±0.01 ของค่าจริง',
      'เปิดใบ้ → XP ลด 30% · เปิดเฉลย → ลด 50%',
    ],
    xp:20,
  },
  {
    id:'cont-m4', bloom:4, icon:'🔍', clo:'CLO-C4',
    title:'วินิจฉัยประเภทและให้เหตุผล',
    cloLabel:'CLO-C4: วินิจฉัยประเภทความไม่ต่อเนื่องพร้อมอ้างหลักฐาน',
    type:'analyze',
    pool: POOL_M4_ANALYZE,
    rubric:[
      `คลัง ${POOL_M4_ANALYZE.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,
      'ประเภทถูก + เหตุผลครบ (ไม่ false positive)',
    ],
    xp:25,
  },
  {
    id:'cont-m5', bloom:5, icon:'⚖', clo:'CLO-C5',
    title:'ตรวจการพิสูจน์: หาข้อผิด',
    cloLabel:'CLO-C5: ประเมินความถูกต้องของการพิสูจน์ความต่อเนื่อง',
    type:'evaluate',
    pool: POOL_M5_EVALUATE,
    rubric:[
      `คลัง ${POOL_M5_EVALUATE.length} การพิสูจน์ — สุ่ม 1 อัน/รอบ`,
      'ชี้บรรทัดผิดถูก + เลือกการแก้ไขถูก',
    ],
    xp:30,
  },
  {
    id:'cont-m6', bloom:6, icon:'🎨', clo:'CLO-C6',
    title:'สร้างฟังก์ชันตามเงื่อนไข',
    cloLabel:'CLO-C6: สร้างตัวอย่าง/counter-example ของฟังก์ชันตามเงื่อนไข',
    type:'create',
    pool: POOL_M6_CREATE,
    rubric:[
      `คลัง ${POOL_M6_CREATE.length} โจทย์สร้าง — สุ่ม 1 โจทย์/รอบ`,
      'ผ่านเกณฑ์ทุกข้อของโจทย์นั้น',
    ],
    xp:40,
  },
  { id:'cont-m7', bloom:3, icon:'🧭', clo:'CLO-C3',
    title:'ประกอบการตรวจต่อเนื่อง/IVT ทีละขั้น (SBRA)',
    cloLabel:'CLO-C3: ไล่ขั้นการตรวจต่อเนื่อง/จำแนก/IVT พร้อมเหตุผล',
    type:'step-reason', pool:POOL_SBRA_CONT,
    rubric:[
      `คลัง ${POOL_SBRA_CONT.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,
      'เลือกผลลัพธ์ + เหตุผลถูกทุกขั้น',
      '≥ 70% = ผ่าน',
    ],
    xp:45,
  },
];

/* ============================================================
   LIMITS — pools & missions (seeded จาก .tex problem banks)
   ============================================================ */

const POOL_L1_REMEMBER = [
  { q:'$\\lim_{x\\to 0}\\dfrac{\\sin x}{x} = \\,?$',
    opts:['$0$','$1$','$-1$','หาค่าไม่ได้'], ans:1 },
  { q:'$\\lim_{x\\to 0}\\dfrac{e^x - 1}{x} = \\,?$',
    opts:['$0$','$e$','$1$','$\\infty$'], ans:2 },
  { q:'$\\lim_{x\\to 0}\\dfrac{1-\\cos x}{x} = \\,?$',
    opts:['$0$','$1$','$\\tfrac12$','ไม่มีค่า'], ans:0 },
  { q:'$\\lim_{x\\to \\infty}\\left(1+\\dfrac{1}{x}\\right)^x = \\,?$',
    opts:['$1$','$0$','$e$','$\\infty$'], ans:2 },
  { q:'$\\lim_{x\\to \\infty}\\dfrac{1}{x} = \\,?$',
    opts:['$0$','$1$','$\\infty$','$-\\infty$'], ans:0 },
  { q:'$\\lim_{x\\to 3}(x^2 - 2x + 1) = \\,?$ (ใช้การแทนค่าตรง)',
    opts:['$0$','$4$','$1$','$7$'], ans:1 },
  { q:'ลิมิตที่ได้รูป $0/0$ เป็น …',
    opts:['ลิมิตไม่มีค่าเสมอ','ลิมิตเป็น $0$ เสมอ','รูปไม่กำหนด ต้องใช้เทคนิคเพิ่ม','ลิมิตเป็น $1$'], ans:2 },
  { q:'สำหรับพหุนาม: $\\lim_{x\\to a} P(x) = \\,?$',
    opts:['$P(0)$','$P(a)$','ต้องใช้ L\'Hospital','$0$ เสมอ'], ans:1 },
  { q:'$\\lim_{x\\to 0}\\dfrac{\\tan x}{x} = \\,?$',
    opts:['$0$','$1$','$\\infty$','ไม่มีค่า'], ans:1 },
  { q:'$\\lim_{x\\to \\infty} e^{-x} = \\,?$',
    opts:['$0$','$1$','$\\infty$','$e$'], ans:0 },
  { q:'$\\lim_{x\\to 0^+} \\ln x = \\,?$',
    opts:['$0$','$-\\infty$','$+\\infty$','$1$'], ans:1 },
  { q:'$\\lim_{x\\to \\infty} \\arctan x = \\,?$',
    opts:['$\\pi/2$','$\\pi$','$0$','ไม่มีค่า'], ans:0 },
];

const POOL_L2_UNDERSTAND = [
  { q:'ทำไม $\\lim_{x\\to 2}\\dfrac{x^2-4}{x-2}$ จึงมีค่า ทั้งที่นิพจน์ไม่นิยามที่ $x=2$?',
    opts:['เพราะลิมิตดูจุดรอบข้าง ไม่ใช่จุด $x=2$ เอง',
          'เพราะ $\\tfrac{0}{0}=0$','เพราะ $x^2-4=0$ ที่ $x=2$','เพราะ $f(2)=4$'], ans:0 },
  { q:'คำกล่าว: "ถ้า $f(a)$ ไม่นิยาม แล้ว $\\lim_{x\\to a}f(x)$ จะไม่มีค่า"',
    opts:['จริงเสมอ','เท็จ — ลิมิตไม่ขึ้นกับค่าที่จุด $a$','จริงเฉพาะฟังก์ชันตรรกยะ','ไม่สามารถบอกได้'], ans:1 },
  { q:'ทำไมจึงแทนค่าตรงๆ ได้สำหรับลิมิตของพหุนามที่จุดใดก็ได้?',
    opts:['เพราะพหุนามต่อเนื่องทุกจุด','เพราะสูตรบังคับ','เพราะ $n$ เป็นจำนวนเต็ม','เพราะสัมประสิทธิ์คงที่'], ans:0 },
  { q:'รูปไม่กำหนด $0/0$ หมายความว่าอย่างไร?',
    opts:['ลิมิตเป็น $0$ เสมอ','ลิมิตไม่มีค่าเสมอ','ต้องใช้เทคนิคเพิ่มเติม (แยกตัวประกอบ, คอนจูเกต, ฯลฯ)','คำตอบคือ $1$'], ans:2 },
  { q:'ลิมิตซ้ายต่างจากลิมิตขวาที่ $a$ — สรุปได้ว่า?',
    opts:['ลิมิตสองข้างที่ $a$ ไม่มีค่า','ลิมิตสองข้างยังมีค่า','$f(a)$ ไม่นิยาม','$f$ ต่อเนื่องที่ $a$'], ans:0 },
  { q:'ทำไม $\\lim_{x\\to 0}\\tfrac{\\sin x}{x}=1$ จึงเป็น "ลิมิตมาตรฐาน"?',
    opts:['เพราะใช้บ่อยและใช้พิสูจน์อื่นๆ','เพราะคำนวณไม่ได้','เพราะเท่ากับ $0$','เพราะ $\\sin 0 = 0$'], ans:0 },
  { q:'ถ้า $\\lim_{x\\to a}f(x) = L$ และ $\\lim_{x\\to a}g(x)=M$ แล้ว $\\lim(f+g) = ?$',
    opts:['$L-M$','$L+M$','$L\\cdot M$','ไม่สามารถบอกได้'], ans:1 },
];

const POOL_L3_NUMERIC = [
  { prompt:'คำนวณ $\\lim_{x\\to 3}(x^2 - 2x + 1)$',
    hint:'แทนค่า $x=3$ โดยตรงได้ (พหุนามต่อเนื่อง)',
    solution:['แทน $x=3$: $9-6+1 = 4$'], answer:4 },
  { prompt:'คำนวณ $\\lim_{x\\to 1}\\dfrac{x^3-1}{x-1}$',
    hint:'แยกตัวประกอบ $x^3-1 = (x-1)(x^2+x+1)$',
    solution:['ตัด $x-1$ เหลือ $x^2+x+1$','แทน $x=1$: $1+1+1 = 3$'], answer:3 },
  { prompt:'คำนวณ $\\lim_{x\\to 0}\\dfrac{\\sqrt{x+4}-2}{x}$',
    hint:'คูณคอนจูเกต $\\sqrt{x+4}+2$ ทั้งเศษและส่วน',
    solution:['$\\dfrac{x}{x(\\sqrt{x+4}+2)} = \\dfrac{1}{\\sqrt{x+4}+2}$','แทน $x=0$: $\\tfrac{1}{4}$'], answer:0.25 },
  { prompt:'คำนวณ $\\lim_{x\\to 0}\\dfrac{\\ln(1+3x)}{x}$',
    hint:'ใช้ $\\lim_{u\\to 0}\\tfrac{\\ln(1+u)}{u}=1$, ตั้ง $u=3x$',
    solution:['$= 3\\cdot\\lim_{x\\to 0}\\tfrac{\\ln(1+3x)}{3x} = 3\\cdot 1 = 3$'], answer:3 },
  { prompt:'คำนวณ $\\lim_{x\\to 0}\\dfrac{\\sin 5x}{x}$',
    hint:'$\\tfrac{\\sin 5x}{x} = 5\\cdot\\tfrac{\\sin 5x}{5x}$',
    solution:['ดังนั้นลิมิต $= 5\\cdot 1 = 5$'], answer:5 },
  { prompt:'คำนวณ $\\lim_{x\\to 1}\\dfrac{x^2-1}{x-1}$',
    hint:'$(x^2-1) = (x-1)(x+1)$',
    solution:['ตัด $x-1$ เหลือ $x+1$','แทน $x=1$: $2$'], answer:2 },
  { prompt:'คำนวณ $\\lim_{x\\to 0}\\dfrac{\\sqrt{x+9}-3}{x}$',
    hint:'คูณคอนจูเกต $\\sqrt{x+9}+3$',
    solution:['$\\dfrac{x}{x(\\sqrt{x+9}+3)} = \\dfrac{1}{\\sqrt{x+9}+3}$','แทน $x=0$: $\\tfrac{1}{6}$'],
    answer: 1/6, tolerance:0.005 },
  { prompt:'คำนวณ $\\lim_{x\\to 4}\\dfrac{x-4}{\\sqrt{x}-2}$',
    hint:'คูณคอนจูเกต $\\sqrt{x}+2$',
    solution:['$\\dfrac{(x-4)(\\sqrt{x}+2)}{x-4} = \\sqrt{x}+2$','แทน $x=4$: $4$'], answer:4 },
];

const POOL_L4_ANALYZE = [
  { prompt:'พิจารณา $\\lim_{x\\to 2^-}\\dfrac{1}{x-2}$ และ $\\lim_{x\\to 2^+}\\dfrac{1}{x-2}$',
    primary:{ question:'ลิมิตสองข้างที่ $x=2$ เป็นอย่างไร?',
      opts:['มีค่าเท่ากัน ลิมิตมีค่า','ต่างเครื่องหมาย ลิมิตไม่มีค่า','เท่ากับ $0$ ทั้งคู่','เท่ากับ $+\\infty$ ทั้งคู่'], ans:1 },
    secondary:{ question:'เหตุผลที่ถูกต้อง:',
      opts:['$\\lim_{x\\to 2^-}\\tfrac{1}{x-2} = -\\infty$',
            '$\\lim_{x\\to 2^+}\\tfrac{1}{x-2} = +\\infty$',
            'ลิมิตซ้าย $=$ ลิมิตขวา',
            'มีเส้นกำกับแนวดิ่งที่ $x=2$',
            'ลิมิตสองข้างที่ $2$ มีค่าจำกัด'],
      correctSet:[0,1,3] } },
  { prompt:'ต้องการคำนวณ $\\lim_{x\\to 0}\\dfrac{\\sin x}{x^2}$',
    primary:{ question:'ลิมิตนี้…',
      opts:['$= 1$','$= 0$','ไม่มีค่าจำกัด (diverge)','$= \\tfrac12$'], ans:2 },
    secondary:{ question:'เหตุผลที่ถูกต้อง:',
      opts:['$\\tfrac{\\sin x}{x^2} = \\tfrac{1}{x}\\cdot\\tfrac{\\sin x}{x}$',
            '$\\tfrac{\\sin x}{x} \\to 1$',
            '$\\tfrac{1}{x} \\to \\pm\\infty$ ขึ้นกับด้าน',
            '$\\tfrac{\\sin x}{x^2} \\to 1$',
            'ลิมิตซ้าย $\\ne$ ลิมิตขวา'],
      correctSet:[0,1,2,4] } },
  { prompt:'ต้องการเลือกเทคนิคที่เหมาะกับ $\\lim_{x\\to 0}\\dfrac{\\sqrt{x+1}-1}{x}$',
    primary:{ question:'เทคนิคที่เหมาะที่สุด:',
      opts:['แทนค่าตรง','คูณคอนจูเกต','แยกตัวประกอบ','ใช้ลิมิตมาตรฐาน $\\sin x/x$'], ans:1 },
    secondary:{ question:'เหตุผล:',
      opts:['แทนค่าตรงได้ $0/0$ เป็นรูปไม่กำหนด',
            'คูณคอนจูเกต $\\sqrt{x+1}+1$ ตัดรูปออกได้',
            'แยก $(x+1)$ ออกจากเศษได้โดยตรง',
            'ใช้ $\\sin x/x$ เพราะมีราก',
            'ลิมิตเป็น $\\tfrac12$'],
      correctSet:[0,1,4] } },
];

const POOL_L5_EVALUATE = [
  { prompt:'นักเรียนคำนวณ $\\lim_{x\\to 0}\\dfrac{\\sin 2x}{x}$ — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: $\\tfrac{\\sin 2x}{x} = \\tfrac{\\sin 2x}{2x}$', ok:false },
      { line:'บรรทัด 2: ใช้ $\\lim \\tfrac{\\sin u}{u}=1$', ok:true },
      { line:'บรรทัด 3: ดังนั้นลิมิต $= 1$', ok:false },
    ], wrongLine:0,
    fixQuestion:'ที่ถูกต้องคือ:',
    fixOpts:[
      '$\\tfrac{\\sin 2x}{x} = 2\\cdot\\tfrac{\\sin 2x}{2x}$ → ลิมิต $= 2$',
      'แทน $x=0$ ตรงๆ ได้ $0$',
      'ใช้ L\'Hospital ได้ $1$ เท่านั้น',
    ], fixAns:0 },
  { prompt:'นักเรียนอ้าง $\\lim_{x\\to 0}\\dfrac{1-\\cos x}{x} = 1$ — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: แทน $x=0$: ได้ $0/0$', ok:true },
      { line:'บรรทัด 2: ใช้ L\'Hospital: ได้ $\\tfrac{\\sin x}{1}$', ok:true },
      { line:'บรรทัด 3: ลิมิต $= \\sin 0 = 1$', ok:false },
    ], wrongLine:2,
    fixQuestion:'ลิมิตที่ถูกคือ:',
    fixOpts:[
      'ลิมิต $= 0$ (เพราะ $\\sin 0 = 0$ ไม่ใช่ $1$)',
      'ลิมิต $= 1$ ถูกแล้ว',
      'ลิมิต $= \\tfrac12$',
    ], fixAns:0 },
  { prompt:'นักเรียนสรุปว่า $\\lim_{x\\to 2}\\dfrac{1}{x-2} = \\infty$ — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: แทน $x=2$: ได้ $1/0$', ok:true },
      { line:'บรรทัด 2: $\\lim_{x\\to 2^+} = +\\infty$', ok:true },
      { line:'บรรทัด 3: $\\lim_{x\\to 2^-} = +\\infty$ เช่นกัน', ok:false },
      { line:'บรรทัด 4: ดังนั้นลิมิต $= +\\infty$', ok:false },
    ], wrongLine:2,
    fixQuestion:'ลิมิตซ้ายที่แท้จริง:',
    fixOpts:[
      '$\\lim_{x\\to 2^-} = -\\infty$ (คนละเครื่องหมาย) → ลิมิตสองข้างไม่มีค่า',
      '$\\lim_{x\\to 2^-} = 0$',
      '$\\lim_{x\\to 2^-} = +\\infty$ ถูกแล้ว',
    ], fixAns:0 },
];

const POOL_L6_CREATE = [
  { id:'lv1', prompt:'สร้าง $f(x)$ ที่มีรูไม่ต่อเนื่อง (removable) ที่ $x=4$ และ $\\lim_{x\\to 4} f(x) = 7$',
    hint:'ลอง $\\dfrac{(x-4)(x+3)}{x-4}$ ลิมิตที่ $x=4$ จะได้ $4+3=7$',
    example:'(x - 4)*(x + 3) / (x - 4)',
    placeholder:'เช่น  (x-4)*(x+3)/(x-4)',
    checks:[
      { id:'limVal', label:'$\\lim_{x\\to 4} f(x) = 7$',
        test:function(fn){
          try{
            const L = fn(4-1e-5), R = fn(4+1e-5);
            if (L===null||R===null||!isFinite(L)||!isFinite(R)) return false;
            return Math.abs(L-R)<1e-2 && Math.abs((L+R)/2 - 7) < 0.05;
          }catch(_){ return false; }
        }},
      { id:'hole4', label:'$f(4)$ ไม่นิยาม (มีรู)',
        test:function(fn){
          try{ const c = fn(4); return c===null || !isFinite(c); }catch(_){ return true; }
        }},
    ] },
  { id:'lv2', prompt:'สร้าง $f(x)$ ที่ใช้ $\\lim_{x\\to 0}\\dfrac{\\sin x}{x}=1$ แล้วลิมิตที่ $x=0$ เท่ากับ $6$',
    hint:'ลอง $6\\sin x / x$',
    example:'6*sin(x)/x',
    placeholder:'เช่น  6*sin(x)/x',
    checks:[
      { id:'lim6', label:'$\\lim_{x\\to 0} f(x) = 6$',
        test:function(fn){
          try{
            const L = fn(-1e-5), R = fn(1e-5);
            if (L===null||R===null||!isFinite(L)||!isFinite(R)) return false;
            return Math.abs((L+R)/2 - 6) < 0.05;
          }catch(_){ return false; }
        }},
      { id:'nt', label:'ไม่เป็นค่าคงที่', test: nonTrivial },
    ] },
];

const LIMITS_MISSIONS = [
  { id:'lim-m1', bloom:1, icon:'🔖', clo:'CLO-L1',
    title:'จำลิมิตมาตรฐานและสมบัติพื้นฐาน',
    cloLabel:'CLO-L1: ระบุค่าลิมิตมาตรฐานและสมบัติได้',
    type:'quick-mcq', pool:POOL_L1_REMEMBER, draw:5, passThreshold:4,
    rubric:[`คลัง ${POOL_L1_REMEMBER.length} ข้อ — สุ่ม 5 ข้อ/รอบ`,'ตอบถูก ≥ 4 จาก 5 = ผ่าน'], xp:10 },
  { id:'lim-m2', bloom:2, icon:'💡', clo:'CLO-L2',
    title:'เข้าใจแนวคิดลิมิตและรูปไม่กำหนด',
    cloLabel:'CLO-L2: อธิบายแนวคิดลิมิต, รูป $0/0$, ลิมิตซ้าย/ขวา',
    type:'quick-mcq', pool:POOL_L2_UNDERSTAND, draw:4, passThreshold:3,
    rubric:[`คลัง ${POOL_L2_UNDERSTAND.length} ข้อ — สุ่ม 4 ข้อ/รอบ`,'ตอบถูก ≥ 3 จาก 4 = ผ่าน'], xp:12 },
  { id:'lim-m3', bloom:3, icon:'✏', clo:'CLO-L3',
    title:'คำนวณลิมิตด้วยเทคนิคต่างๆ',
    cloLabel:'CLO-L3: คำนวณลิมิต (แทนค่า, แยกตัวประกอบ, คอนจูเกต, ลิมิตมาตรฐาน)',
    type:'numeric', pool:POOL_L3_NUMERIC,
    rubric:[`คลัง ${POOL_L3_NUMERIC.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,'คำตอบอยู่ใน ±0.01 ของค่าจริง'], xp:20 },
  { id:'lim-m4', bloom:4, icon:'🔍', clo:'CLO-L4',
    title:'เลือก/วิเคราะห์เทคนิคการหาลิมิต',
    cloLabel:'CLO-L4: เลือกเทคนิคให้เหมาะกับรูปของลิมิต',
    type:'analyze', pool:POOL_L4_ANALYZE,
    rubric:[`คลัง ${POOL_L4_ANALYZE.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,'เลือกประเภทถูก + เหตุผลครบ'], xp:25 },
  { id:'lim-m5', bloom:5, icon:'⚖', clo:'CLO-L5',
    title:'ตรวจการพิสูจน์ลิมิต: หาข้อผิด',
    cloLabel:'CLO-L5: ประเมินและแก้ข้อผิดของการหาลิมิต',
    type:'evaluate', pool:POOL_L5_EVALUATE,
    rubric:[`คลัง ${POOL_L5_EVALUATE.length} การพิสูจน์ — สุ่ม 1 อัน/รอบ`,'ชี้บรรทัดผิดถูก + เลือกการแก้ไขถูก'], xp:30 },
  { id:'lim-m6', bloom:6, icon:'🎨', clo:'CLO-L6',
    title:'สร้างโจทย์ลิมิตตามเงื่อนไข',
    cloLabel:'CLO-L6: สร้าง $f$ ให้ลิมิตมีค่าตามที่กำหนด',
    type:'create', pool:POOL_L6_CREATE,
    rubric:[`คลัง ${POOL_L6_CREATE.length} โจทย์สร้าง — สุ่ม 1 โจทย์/รอบ`,'ผ่านเกณฑ์ทุกข้อของโจทย์นั้น'], xp:40 },
  { id:'lim-m7', bloom:3, icon:'🧭', clo:'CLO-L3',
    title:'ประกอบวิธีทำลิมิตทีละขั้น (SBRA)',
    cloLabel:'CLO-L3: แก้ลิมิตโดยเลือกขั้นตอน + เหตุผลทีละสเต็ป',
    type:'step-reason', pool:POOL_SBRA_LIMITS,
    rubric:[`คลัง ${POOL_SBRA_LIMITS.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,'เลือกทั้ง "ผลลัพธ์" + "เหตุผล" ถูกทุกขั้น','≥ 70% ของคะแนนเต็ม = ผ่าน'], xp:45 },
];

/* ============================================================
   DIFFERENTIATION — pools & missions
   ============================================================ */

const POOL_D1_REMEMBER = [
  { q:'$\\dfrac{d}{dx}(x^n) = \\,?$',
    opts:['$nx^{n-1}$','$x^{n-1}$','$nx^n$','$(n-1)x^n$'], ans:0 },
  { q:'$\\dfrac{d}{dx}(\\sin x) = \\,?$',
    opts:['$\\cos x$','$-\\cos x$','$\\tan x$','$-\\sin x$'], ans:0 },
  { q:'$\\dfrac{d}{dx}(\\cos x) = \\,?$',
    opts:['$\\sin x$','$-\\sin x$','$-\\cos x$','$\\tan x$'], ans:1 },
  { q:'$\\dfrac{d}{dx}(e^x) = \\,?$',
    opts:['$e^{x-1}$','$e^x \\ln x$','$e^x$','$xe^{x-1}$'], ans:2 },
  { q:'$\\dfrac{d}{dx}(\\ln x) = \\,?$',
    opts:['$\\tfrac{1}{x}$','$\\tfrac{1}{x\\ln x}$','$x$','$-\\tfrac{1}{x}$'], ans:0 },
  { q:'กฎผลคูณ: $(uv)\' = \\,?$',
    opts:['$u\'v\'$','$u\'v + uv\'$','$uv\' - u\'v$','$(u\'+v\')/2$'], ans:1 },
  { q:'กฎหารผลหาร: $(u/v)\' = \\,?$',
    opts:['$\\tfrac{u\'v-uv\'}{v^2}$','$\\tfrac{u\'v+uv\'}{v^2}$','$\\tfrac{u\'}{v\'}$','$\\tfrac{uv\'-u\'v}{v^2}$'], ans:0 },
  { q:'กฎลูกโซ่: $\\dfrac{d}{dx}f(g(x)) = \\,?$',
    opts:['$f\'(x)g\'(x)$','$f\'(g(x))\\cdot g\'(x)$','$f(g\'(x))$','$f\'(g\'(x))$'], ans:1 },
  { q:'$\\dfrac{d}{dx}(c) = \\,?$ เมื่อ $c$ เป็นค่าคงที่',
    opts:['$c$','$1$','$0$','$-c$'], ans:2 },
  { q:'$\\dfrac{d}{dx}(\\tan x) = \\,?$',
    opts:['$\\sec^2 x$','$-\\sec^2 x$','$\\cot x$','$\\csc^2 x$'], ans:0 },
  { q:'อนุพันธ์หมายถึงอะไรในเชิงเรขาคณิต?',
    opts:['พื้นที่ใต้กราฟ','ความชันของเส้นสัมผัส','ความยาวของส่วนโค้ง','ระยะทาง'], ans:1 },
  { q:'ถ้า $s(t)$ = ตำแหน่ง, $s\'(t)$ คืออะไร?',
    opts:['ความเร็ว','ความเร่ง','ระยะทาง','พลังงาน'], ans:0 },
];

const POOL_D2_UNDERSTAND = [
  { q:'ความหมายเชิงเรขาคณิตของ $f\'(a)$ คือ?',
    opts:['พื้นที่ใต้กราฟที่ $a$','ความชันของเส้นสัมผัสที่ $(a, f(a))$',
          'ค่าของ $f$ ที่ $a$','ค่าเฉลี่ยของ $f$'], ans:1 },
  { q:'ทำไมอนุพันธ์จึงเรียกว่า "อัตราการเปลี่ยนแปลงขณะหนึ่ง"?',
    opts:['เพราะเป็นค่าเฉลี่ยในช่วง','เพราะเป็นลิมิตของอัตราเปลี่ยนแปลงเฉลี่ยเมื่อ $h\\to 0$',
          'เพราะหารด้วย $0$','เพราะเป็นค่าคงที่'], ans:1 },
  { q:'นิยาม $f\'(x)=\\lim_{h\\to 0}\\dfrac{f(x+h)-f(x)}{h}$ เกิดจากแนวคิดใด?',
    opts:['ผลคูณของผลต่าง','ลิมิตของความชันเส้นตัด (secant) เมื่อเข้าใกล้จุดเดียวกัน',
          'พื้นที่สี่เหลี่ยม','การหาค่าเฉลี่ยเลขคณิต'], ans:1 },
  { q:'ถ้า $f\'(x)>0$ บนช่วงหนึ่ง หมายความว่า?',
    opts:['$f$ ลดลง','$f$ เพิ่มขึ้น','$f$ คงที่','$f$ เป็นค่าคงที่'], ans:1 },
  { q:'ถ้า $s(t)$ คือตำแหน่ง $s\'(t)$ และ $s\'\'(t)$ คือ?',
    opts:['ความเร็วและความเร่ง','พลังงานและโมเมนตัม','ระยะและทิศทาง','เวลาและพื้นที่'], ans:0 },
  { q:'กฎผลคูณ $(uv)\'=u\'v+uv\'$ สะท้อนอะไร?',
    opts:['อนุพันธ์แจกจ่ายตรงๆ','อัตราการเปลี่ยนแปลงรวมจากทั้งสองปัจจัย',
          'ต้องหารด้วย $v$','ใช้เฉพาะพหุนาม'], ans:1 },
  { q:'ทำไมกฎลูกโซ่ $(f\\circ g)\'=f\'(g)\\cdot g\'$ จึงมีการ "คูณด้วย $g\'$"?',
    opts:['เพื่อชดเชยการเปลี่ยนตัวแปรภายใน','เพราะ $g$ เป็นค่าคงที่',
          'ไม่มีเหตุผลเฉพาะ','เพราะเป็นพหุนาม'], ans:0 },
];

const POOL_D3_NUMERIC = [
  { prompt:'หาค่า $f\'(1)$ เมื่อ $f(x) = x^3 - 3x + 2$',
    hint:'$f\'(x) = 3x^2 - 3$',
    solution:['$f\'(x)=3x^2-3$','$f\'(1)=3-3=0$'], answer:0 },
  { prompt:'หาความชันของเส้นสัมผัสของ $f(x) = \\sqrt{x}$ ที่ $x=1$',
    hint:'$f\'(x) = \\tfrac{1}{2\\sqrt{x}}$',
    solution:['$f\'(x)=\\tfrac{1}{2\\sqrt{x}}$','$f\'(1)=\\tfrac12$'], answer:0.5 },
  { prompt:'หาค่า $f\'(0)$ เมื่อ $f(x) = e^x \\sin x$',
    hint:'$f\'(x) = e^x(\\sin x + \\cos x)$',
    solution:['ใช้กฎผลคูณ','$f\'(0) = 1\\cdot(0+1) = 1$'], answer:1 },
  { prompt:'หาค่า $f\'(2)$ เมื่อ $f(x) = x^3$',
    hint:'$f\'(x)=3x^2$',
    solution:['$f\'(2)=12$'], answer:12 },
  { prompt:'หาค่า $f\'(1)$ เมื่อ $f(x) = \\ln x + x^2$',
    hint:'$f\'(x) = 1/x + 2x$',
    solution:['$f\'(1) = 1 + 2 = 3$'], answer:3 },
  { prompt:'หาค่า $f\'(\\pi)$ เมื่อ $f(x) = \\cos x$',
    hint:'$f\'(x) = -\\sin x$',
    solution:['$f\'(\\pi) = -\\sin\\pi = 0$'], answer:0, tolerance:0.01 },
  { prompt:'ความเร็วที่ $t=1$ ของ $s(t) = 20t - 5t^2$',
    hint:'$v(t) = s\'(t) = 20 - 10t$',
    solution:['$v(1) = 20 - 10 = 10$'], answer:10 },
];

const POOL_D4_ANALYZE = [
  { prompt:'วิเคราะห์จุดวิกฤตของ $f(x) = x^3 - 3x$',
    primary:{ question:'จุดวิกฤตอยู่ที่ไหน?',
      opts:['$x = 0$ เท่านั้น','$x = \\pm 1$','$x = \\pm \\sqrt{3}$','ไม่มีจุดวิกฤต'], ans:1 },
    secondary:{ question:'การจำแนก (เลือกทุกข้อที่ถูก):',
      opts:['$f\'(x) = 3x^2 - 3$','$x = -1$ เป็น local max','$x = 1$ เป็น local min',
            '$f\'\'(x) = 6x$','$x = 0$ เป็น saddle'],
      correctSet:[0,1,2,3] } },
  { prompt:'ความสัมพันธ์ระหว่าง $f$ และ $f\'$',
    primary:{ question:'ถ้า $f\'(x) > 0$ บนช่วงหนึ่ง …',
      opts:['$f$ ลดลงบนช่วงนั้น','$f$ เพิ่มขึ้นบนช่วงนั้น','$f$ เป็นค่าคงที่','หา $f$ ไม่ได้'], ans:1 },
    secondary:{ question:'เลือกทุกข้อที่ถูก:',
      opts:['$f\'(a)=0$ $\\Rightarrow$ จุดวิกฤตที่ $a$',
            '$f\'\'(a) > 0$ $\\Rightarrow$ local min',
            '$f\'\'(a) < 0$ $\\Rightarrow$ local max',
            'local max ทุกครั้ง $f\'(a)=0$',
            '$f\'(a)=0$ $\\Rightarrow$ ต้องเป็น max เสมอ'],
      correctSet:[0,1,2] } },
  { prompt:'วิเคราะห์ $f(x) = x^3 - 6x^2 + 9x$',
    primary:{ question:'จุดวิกฤตอยู่ที่?',
      opts:['$x=1, 3$','$x=0, 3$','$x=2$','$x=\\pm 3$'], ans:0 },
    secondary:{ question:'การจำแนก:',
      opts:['$f\'(x) = 3x^2 - 12x + 9 = 3(x-1)(x-3)$',
            '$x=1$ เป็น local max',
            '$x=3$ เป็น local min',
            '$x=1$ เป็น local min',
            '$x=3$ เป็น local max'],
      correctSet:[0,1,2] } },
];

const POOL_D5_EVALUATE = [
  { prompt:'นักเรียนเขียน $\\dfrac{d}{dx}(x^2+2x) = x+2$ — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: ใช้กฎผลบวก แยกแต่ละเทอม', ok:true },
      { line:'บรรทัด 2: $\\tfrac{d}{dx}(x^2) = x$', ok:false },
      { line:'บรรทัด 3: $\\tfrac{d}{dx}(2x) = 2$', ok:true },
      { line:'บรรทัด 4: รวมเป็น $x + 2$', ok:false },
    ], wrongLine:1,
    fixQuestion:'ที่ถูกคือ:',
    fixOpts:[
      '$\\tfrac{d}{dx}(x^2) = 2x$ → คำตอบ $= 2x + 2$',
      '$\\tfrac{d}{dx}(x^2) = 2$ → คำตอบ $= 4$',
      '$\\tfrac{d}{dx}(x^2) = x^2$ → คำตอบ $= x^2 + 2$',
    ], fixAns:0 },
  { prompt:'นักเรียนอ้าง "ถ้า $f\'(a)=0$ แล้ว $f$ ต้องมี max ที่ $a$" — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: $f\'(a)=0$ แปลว่าเส้นสัมผัสแนวนอน', ok:true },
      { line:'บรรทัด 2: เส้นสัมผัสแนวนอน $\\Rightarrow$ เป็น max เสมอ', ok:false },
      { line:'บรรทัด 3: ดังนั้น $f(a)$ เป็น max', ok:false },
    ], wrongLine:1,
    fixQuestion:'ข้อสรุปที่ถูก:',
    fixOpts:[
      '$f\'(a)=0$ อาจเป็น min, max, หรือ saddle (ต้องตรวจด้วย $f\'\'$)',
      '$f\'(a)=0$ ไม่เคยเป็น max เลย',
      '$f\'(a)=0$ เป็น min เสมอ',
    ], fixAns:0 },
  { prompt:'นักเรียนหา $\\dfrac{d}{dx}(\\sin x \\cdot \\cos x) = \\cos^2 x$ — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: ใช้กฎผลคูณ $(uv)\' = u\'v + uv\'$', ok:true },
      { line:'บรรทัด 2: $u = \\sin x$, $u\' = \\cos x$', ok:true },
      { line:'บรรทัด 3: $v = \\cos x$, $v\' = \\cos x$', ok:false },
      { line:'บรรทัด 4: รวม: $\\cos^2 x + \\sin x \\cos x = \\cos^2 x$', ok:false },
    ], wrongLine:2,
    fixQuestion:'ที่ถูกต้อง:',
    fixOpts:[
      '$v\' = -\\sin x$ → คำตอบ $= \\cos^2 x - \\sin^2 x$',
      '$v\' = \\sin x$ → คำตอบ $= \\cos^2 x + \\sin^2 x = 1$',
      '$v\' = 0$ → คำตอบ $= \\sin x \\cos x$',
    ], fixAns:0 },
];

function hasPositiveDerivative(fn) {
  try {
    const probes = [-2, -1, -0.5, 0.5, 1, 2];
    return probes.every(x => {
      const d = (fn(x + 1e-5) - fn(x - 1e-5)) / 2e-5;
      return d !== null && isFinite(d) && d > 0.001;
    });
  } catch (_) { return false; }
}
function hasOneLocalMaxOneLocalMin(fn) {
  try {
    // sign-change count of the numeric derivative across [-3, 3]
    let prev = null, changes = 0;
    for (let x = -3; x <= 3; x += 0.05) {
      const d = (fn(x + 1e-5) - fn(x - 1e-5)) / 2e-5;
      if (d === null || !isFinite(d)) continue;
      const s = Math.sign(d);
      if (prev !== null && s !== 0 && prev !== s) changes++;
      if (s !== 0) prev = s;
    }
    return changes === 2;
  } catch (_) { return false; }
}

const POOL_D6_CREATE = [
  { id:'dv1', prompt:'สร้าง $f(x)$ ที่มี $f\'(x) > 0$ ทุกจุด แต่ไม่เป็นค่าคงที่ (ไม่ใช่เส้นตรง)',
    hint:'ลอง $e^x$ หรือ $x + \\sin(x)/2$ ซึ่งมีอนุพันธ์เป็นบวกแต่ไม่คงที่',
    example:'exp(x)',
    placeholder:'เช่น  exp(x)  หรือ  x + sin(x)/2',
    checks:[
      { id:'dPos', label:'$f\'(x) > 0$ ทุกจุดที่ทดสอบ', test:hasPositiveDerivative },
      { id:'nt',   label:'ไม่เป็นค่าคงที่', test:nonTrivial },
    ] },
  { id:'dv2', prompt:'สร้างฟังก์ชันที่มี local max หนึ่งจุดและ local min หนึ่งจุด',
    hint:'ลูกบาศก์เช่น $x^3 - 3x$',
    example:'x^3 - 3*x',
    placeholder:'เช่น  x^3 - 3*x',
    checks:[
      { id:'oneMaxOneMin', label:'มี local max 1 จุด + local min 1 จุด', test:hasOneLocalMaxOneLocalMin },
      { id:'nt',           label:'ไม่เป็นค่าคงที่', test:nonTrivial },
    ] },
];

const DIFFERENTIATION_MISSIONS = [
  { id:'dif-m1', bloom:1, icon:'🔖', clo:'CLO-D1',
    title:'จำสูตรอนุพันธ์พื้นฐานและอดิศัย',
    cloLabel:'CLO-D1: ระบุสูตรอนุพันธ์พื้นฐานและอดิศัย',
    type:'quick-mcq', pool:POOL_D1_REMEMBER, draw:5, passThreshold:4,
    rubric:[`คลัง ${POOL_D1_REMEMBER.length} ข้อ — สุ่ม 5 ข้อ/รอบ`,'ตอบถูก ≥ 4 จาก 5 = ผ่าน'], xp:10 },
  { id:'dif-m2', bloom:2, icon:'💡', clo:'CLO-D2',
    title:'เข้าใจความหมายของอนุพันธ์',
    cloLabel:'CLO-D2: อธิบายอนุพันธ์เชิงเรขาคณิต/อัตราการเปลี่ยนแปลง',
    type:'quick-mcq', pool:POOL_D2_UNDERSTAND, draw:4, passThreshold:3,
    rubric:[`คลัง ${POOL_D2_UNDERSTAND.length} ข้อ — สุ่ม 4 ข้อ/รอบ`,'ตอบถูก ≥ 3 จาก 4 = ผ่าน'], xp:12 },
  { id:'dif-m3', bloom:3, icon:'✏', clo:'CLO-D3',
    title:'คำนวณอนุพันธ์/ความชันเส้นสัมผัส',
    cloLabel:'CLO-D3: คำนวณ $f\'(a)$ และความชันเส้นสัมผัส',
    type:'numeric', pool:POOL_D3_NUMERIC,
    rubric:[`คลัง ${POOL_D3_NUMERIC.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,'ค่าอยู่ใน ±0.01'], xp:20 },
  { id:'dif-m4', bloom:4, icon:'🔍', clo:'CLO-D4',
    title:'วิเคราะห์จุดวิกฤตและ $f, f\'$',
    cloLabel:'CLO-D4: วิเคราะห์พฤติกรรมของ $f$ จาก $f\', f\'\'$',
    type:'analyze', pool:POOL_D4_ANALYZE,
    rubric:[`คลัง ${POOL_D4_ANALYZE.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,'เลือกคำตอบหลัก + เหตุผลครบ'], xp:25 },
  { id:'dif-m5', bloom:5, icon:'⚖', clo:'CLO-D5',
    title:'ตรวจการหาอนุพันธ์: หาข้อผิด',
    cloLabel:'CLO-D5: ประเมินความถูกต้องของการหาอนุพันธ์',
    type:'evaluate', pool:POOL_D5_EVALUATE,
    rubric:[`คลัง ${POOL_D5_EVALUATE.length} การพิสูจน์ — สุ่ม 1 อัน/รอบ`,'ชี้บรรทัดผิด + เลือกการแก้ไข'], xp:30 },
  { id:'dif-m6', bloom:6, icon:'🎨', clo:'CLO-D6',
    title:'สร้างฟังก์ชันที่มีคุณสมบัติตามเงื่อนไข',
    cloLabel:'CLO-D6: สร้าง $f$ ที่มีพฤติกรรมอนุพันธ์ตามกำหนด',
    type:'create', pool:POOL_D6_CREATE,
    rubric:[`คลัง ${POOL_D6_CREATE.length} โจทย์สร้าง — สุ่ม 1 โจทย์/รอบ`,'ผ่านทุกเกณฑ์'], xp:40 },
  { id:'dif-m7', bloom:3, icon:'🧭', clo:'CLO-D3',
    title:'ประกอบวิธีหาอนุพันธ์ทีละขั้น (SBRA)',
    cloLabel:'CLO-D3: เลือกกฎอนุพันธ์ + เหตุผลแต่ละขั้น (product/chain/quotient/implicit)',
    type:'step-reason', pool:POOL_SBRA_DIFF,
    rubric:[`คลัง ${POOL_SBRA_DIFF.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,'เลือกกฎ + เหตุผลถูกทุกขั้น','≥ 70% = ผ่าน'], xp:45 },
];

/* ============================================================
   INTEGRATION — pools & missions
   ============================================================ */

const POOL_I1_REMEMBER = [
  { q:'$\\int x^n\\,dx = \\,?$ (เมื่อ $n\\ne -1$)',
    opts:['$nx^{n-1}+C$','$\\tfrac{x^{n+1}}{n+1}+C$','$\\tfrac{x^{n-1}}{n-1}+C$','$x^{n+1}+C$'], ans:1 },
  { q:'$\\int e^x\\,dx = \\,?$',
    opts:['$e^x + C$','$e^{x+1}+C$','$xe^{x-1}+C$','$\\ln e^x + C$'], ans:0 },
  { q:'$\\int \\dfrac{1}{x}\\,dx = \\,?$',
    opts:['$\\ln x + C$','$\\ln|x|+C$','$-\\tfrac{1}{x^2}+C$','$x\\ln x + C$'], ans:1 },
  { q:'$\\int \\sin x\\,dx = \\,?$',
    opts:['$\\cos x + C$','$-\\cos x + C$','$\\sin x + C$','$-\\sin x + C$'], ans:1 },
  { q:'$\\int \\cos x\\,dx = \\,?$',
    opts:['$\\sin x + C$','$-\\sin x + C$','$\\cos x + C$','$\\tan x + C$'], ans:0 },
  { q:'$\\int \\sec^2 x\\,dx = \\,?$',
    opts:['$\\tan x + C$','$\\sec x + C$','$-\\cot x + C$','$\\sin x + C$'], ans:0 },
  { q:'ทฤษฎีบทหลักแคลคูลัส (FTC) ส่วนที่ 1: ถ้า $F\'(x)=f(x)$ บน $[a,b]$ แล้ว …',
    opts:['$\\int_a^b f(x)\\,dx = F(a)-F(b)$',
          '$\\int_a^b f(x)\\,dx = F(b)-F(a)$',
          '$\\int_a^b f(x)\\,dx = f(b)-f(a)$',
          '$\\int_a^b f(x)\\,dx = 0$'], ans:1 },
  { q:'เหตุใดต้องเติม $+C$ ในแอนติเดริเวทีฟไม่จำกัด?',
    opts:['เพื่อความสวยงาม','เพราะอนุพันธ์ของค่าคงที่เป็น $0$',
          'เพราะกฎกำหนด','เพราะ $C$ ช่วยให้เทียบได้'], ans:1 },
  { q:'ผลรวมรีมันน์ใช้ประมาณค่าอะไร?',
    opts:['ความชัน','ความยาวของเส้นโค้ง','พื้นที่ใต้กราฟ','อนุพันธ์'], ans:2 },
  { q:'$\\int_a^a f(x)\\,dx = \\,?$',
    opts:['$f(a)$','$0$','$1$','ไม่นิยาม'], ans:1 },
  { q:'$\\int (f+g)\\,dx = \\,?$',
    opts:['$\\int f\\,dx \\cdot \\int g\\,dx$','$\\int f\\,dx + \\int g\\,dx$',
          '$f+g$','$(f+g)\'$'], ans:1 },
];

const POOL_I2_UNDERSTAND = [
  { q:'ทำไมแอนติเดริเวทีฟไม่จำกัดจึงต้องเติม $+C$?',
    opts:['เพื่อให้สวยงาม','เพราะอนุพันธ์ของค่าคงที่เป็น $0$ ดังนั้นมีแอนติเดริเวทีฟเป็นวงศ์',
          'เพราะกฎบังคับ','เพราะ $C=1$ เสมอ'], ans:1 },
  { q:'ผลรวมรีมันน์สัมพันธ์อย่างไรกับพื้นที่ใต้กราฟ?',
    opts:['เป็นค่าเฉลี่ยของกราฟ','เป็นการประมาณพื้นที่โดยผลรวมของสี่เหลี่ยม — แม่นขึ้นเมื่อ $n\\to\\infty$',
          'ไม่เกี่ยวข้องกับพื้นที่','เท่ากับความชันของ $f$'], ans:1 },
  { q:'FTC ส่วนที่ 2 ($\\tfrac{d}{dx}\\int_a^x f(t)\\,dt = f(x)$) บอกอะไร?',
    opts:['ปริพันธ์ของอนุพันธ์ = ฟังก์ชันเดิม','อนุพันธ์ของฟังก์ชันสะสม = ฟังก์ชันต้นทาง',
          'ปริพันธ์คือค่าคงที่','ไม่เกี่ยวข้องกับอนุพันธ์'], ans:1 },
  { q:'ทำไม $\\int_a^a f(x)\\,dx = 0$?',
    opts:['เพราะฟังก์ชันเป็น $0$','เพราะช่วงมีความกว้าง $0$ ดังนั้นพื้นที่ = $0$',
          'เพราะ $f(a)=0$','เป็นข้อกำหนดทางสัญลักษณ์'], ans:1 },
  { q:'ถ้า $f(x)>0$ บน $[a,b]$ แล้ว $\\int_a^b f(x)\\,dx$ แปลว่าอะไร?',
    opts:['ความชันเฉลี่ย','พื้นที่ระหว่างกราฟกับแกน $x$',
          'ค่าของ $f$ ที่ปลายทาง','ระยะทาง'], ans:1 },
  { q:'สำหรับฟังก์ชันเพิ่มขึ้นบน $[a,b]$: left Riemann sum…',
    opts:['ประมาณเกิน (overestimate)','ประมาณขาด (underestimate)',
          'เท่ากับค่าจริงเสมอ','ไม่เกี่ยวข้องกับพฤติกรรม'], ans:1 },
  { q:'ปริพันธ์สามารถใช้คำนวณ "ปริมาณที่สะสม" เช่น พื้นที่, ปริมาตร, งาน — เพราะเหตุใด?',
    opts:['เพราะเป็นสูตรท่องจำ','เพราะปริพันธ์ = ลิมิตของผลรวมของชิ้นเล็กๆ ซึ่งสะสมเป็นผลรวม',
          'เพราะแคลคูลัสเท่านั้นที่ใช้ได้','เพราะฟิสิกส์'], ans:1 },
];

const POOL_I3_NUMERIC = [
  { prompt:'คำนวณ $\\int_0^2 x\\,dx$',
    hint:'$\\int x\\,dx = \\tfrac{x^2}{2}+C$',
    solution:['$\\left[\\tfrac{x^2}{2}\\right]_0^2 = 2 - 0 = 2$'], answer:2 },
  { prompt:'คำนวณ $\\int_1^4 \\dfrac{1}{x}\\,dx$',
    hint:'แอนติเดริเวทีฟคือ $\\ln|x|$',
    solution:['$[\\ln x]_1^4 = \\ln 4 - 0 = \\ln 4$','$\\ln 4 \\approx 1.386$'],
    answer: Math.log(4), tolerance:0.01 },
  { prompt:'คำนวณ $\\int_0^3 (2x+1)\\,dx$',
    hint:'แยกเทอม: $\\int 2x\\,dx + \\int 1\\,dx$',
    solution:['$= [x^2 + x]_0^3 = 9+3 = 12$'], answer:12 },
  { prompt:'คำนวณ $\\int_0^1 x^2\\,dx$',
    hint:'$\\int x^2\\,dx = \\tfrac{x^3}{3}+C$',
    solution:['$\\left[\\tfrac{x^3}{3}\\right]_0^1 = \\tfrac{1}{3}$'],
    answer:1/3, tolerance:0.01 },
  { prompt:'คำนวณ $\\int_0^{\\pi} \\sin x\\,dx$',
    hint:'แอนติเดริเวทีฟคือ $-\\cos x$',
    solution:['$[-\\cos x]_0^{\\pi} = 1 - (-1) = 2$'], answer:2 },
  { prompt:'คำนวณ $\\int_0^1 e^x\\,dx$',
    hint:'แอนติเดริเวทีฟคือ $e^x$',
    solution:['$[e^x]_0^1 = e - 1 \\approx 1.718$'],
    answer: Math.E - 1, tolerance:0.01 },
  { prompt:'หาพื้นที่ระหว่าง $y=x$ กับ $y=x^2$ บน $[0,1]$',
    hint:'$\\int_0^1 (x - x^2)\\,dx$',
    solution:['$[\\tfrac{x^2}{2} - \\tfrac{x^3}{3}]_0^1 = \\tfrac12 - \\tfrac13 = \\tfrac16$'],
    answer:1/6, tolerance:0.01 },
  { prompt:'งานที่ทำโดยแรง $F(x) = 2x$ จาก $x=0$ ถึง $x=3$ คือ?',
    hint:'$W = \\int_0^3 F(x)\\,dx$',
    solution:['$W = [x^2]_0^3 = 9$'], answer:9 },
];

const POOL_I4_ANALYZE = [
  { prompt:'เปรียบเทียบผลรวม left / right / midpoint สำหรับฟังก์ชัน<em>เพิ่มขึ้น</em>บน $[a,b]$',
    primary:{ question:'left sum ให้ผล…',
      opts:['ประมาณเกิน (overestimate)','ประมาณขาด (underestimate)','เท่ากับค่าจริงเสมอ','ขึ้นกับ $n$'], ans:1 },
    secondary:{ question:'เลือกทุกข้อที่ถูก (สำหรับฟังก์ชันเพิ่มขึ้น):',
      opts:['left sum = underestimate','right sum = overestimate','midpoint อยู่ระหว่างทั้งสอง',
            'trapezoid แม่นกว่า left/right','midpoint = overestimate เสมอ'],
      correctSet:[0,1,2,3] } },
  { prompt:'วิเคราะห์ผลของการเปลี่ยน $C$ ต่อกราฟ $F(x) = \\tfrac{x^3}{3} + C$',
    primary:{ question:'เลื่อน $C$ ทำให้กราฟ …',
      opts:['เลื่อนไปทางซ้าย/ขวา','เลื่อนขึ้น/ลงในแนวดิ่ง','เปลี่ยนความชัน','บิดเป็นรูปใหม่'], ans:1 },
    secondary:{ question:'ข้อสรุปที่ถูก:',
      opts:['$F\'(x) = x^2$ ไม่ขึ้นกับ $C$',
            'รูปร่างกราฟเหมือนเดิม',
            '$C$ ไม่เปลี่ยนแอนติเดริเวทีฟพื้นฐาน',
            '$C$ เปลี่ยนค่าที่จุดเฉพาะแต่ไม่เปลี่ยนความชัน',
            '$C$ เปลี่ยนความชันของกราฟ'],
      correctSet:[0,1,2,3] } },
  { prompt:'พิจารณาพื้นที่ระหว่าง $y=x$ และ $y=x^2$ บน $[0,1]$',
    primary:{ question:'ฟังก์ชันไหน<em>อยู่บน</em>บน $(0,1)$?',
      opts:['$y=x^2$','$y=x$','เท่ากันตลอดช่วง','ขึ้นกับจุด'], ans:1 },
    secondary:{ question:'ข้อสรุปที่ถูก:',
      opts:['ต้องใช้ $\\int_0^1 (x-x^2)\\,dx$',
            'ถ้าตั้งตรงข้ามจะได้ค่าลบ',
            'ค่าเท่ากับ $1/6$',
            'ถ้าใช้ $|f-g|$ จะได้ค่าเดียวกัน',
            'ควรใช้ $\\int_0^1 (x^2-x)\\,dx$ เสมอ'],
      correctSet:[0,1,2,3] } },
];

const POOL_I5_EVALUATE = [
  { prompt:'นักเรียนเขียน $\\int x^2\\,dx = x^3$ — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: ใช้สูตรกำลัง $\\int x^n\\,dx$', ok:true },
      { line:'บรรทัด 2: $\\int x^2\\,dx = x^3$', ok:false },
      { line:'บรรทัด 3: ไม่ต้องเติม $C$ เพราะเป็นเทอมเดียว', ok:false },
    ], wrongLine:1,
    fixQuestion:'คำตอบที่ถูก:',
    fixOpts:[
      '$\\int x^2\\,dx = \\tfrac{x^3}{3} + C$',
      '$\\int x^2\\,dx = 2x + C$',
      '$\\int x^2\\,dx = x^3 + C$',
    ], fixAns:0 },
  { prompt:'นักเรียนคำนวณ $\\int_0^2 x\\,dx = \\left[\\tfrac{x^2}{2}\\right]_0^2 = 2 - 0 = 1$ — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: แอนติเดริเวทีฟคือ $\\tfrac{x^2}{2}$', ok:true },
      { line:'บรรทัด 2: แทน $x=2$ และ $x=0$', ok:true },
      { line:'บรรทัด 3: $\\tfrac{2^2}{2} = 2$ และ $\\tfrac{0^2}{2} = 0$', ok:true },
      { line:'บรรทัด 4: $2 - 0 = 1$', ok:false },
    ], wrongLine:3,
    fixQuestion:'ที่ถูก:',
    fixOpts:[
      '$2 - 0 = 2$ → คำตอบ $= 2$',
      '$2 - 0 = 0$ → คำตอบ $= 0$',
      '$2 - 0 = 4$',
    ], fixAns:0 },
  { prompt:'นักเรียนอ้างพื้นที่ระหว่าง $y=x$ กับ $y=x^2$ บน $[0,1]$ คือ $\\int_0^1 (x^2-x)\\,dx$ — หาข้อผิด:',
    steps:[
      { line:'บรรทัด 1: บน $(0,1)$, $x > x^2$', ok:true },
      { line:'บรรทัด 2: ใช้ $y=x^2$ เป็นเส้นบน', ok:false },
      { line:'บรรทัด 3: ตั้ง $\\int_0^1 (x^2-x)\\,dx$ จะได้ค่าติดลบ', ok:false },
    ], wrongLine:1,
    fixQuestion:'การตั้งถูกคือ:',
    fixOpts:[
      '$\\int_0^1 (x - x^2)\\,dx = \\tfrac{1}{6}$',
      '$\\int_0^1 (x^2-x)\\,dx$',
      'ไม่ต้องสนใจเครื่องหมาย',
    ], fixAns:0 },
];

const POOL_I6_CREATE = [
  { id:'iv1', prompt:'สร้าง $f(x)$ (ไม่ใช่ค่าคงที่) ที่ $\\int_0^1 f(x)\\,dx = 5$',
    hint:'ถ้า $f(x) = 10x$ แล้ว $\\int_0^1 10x\\,dx = [5x^2]_0^1 = 5$',
    example:'10*x',
    placeholder:'เช่น  10*x  หรือ  5  (แต่ต้องไม่เป็นค่าคงที่)',
    checks:[
      { id:'int1', label:'$\\int_0^1 f(x)\\,dx = 5$',
        test:function(fn){
          try{
            // Simpson's rule with n=1000
            const n = 1000, a = 0, b = 1, h = (b-a)/n;
            let sum = fn(a) + fn(b);
            for (let i = 1; i < n; i++) {
              const x = a + i*h;
              const v = fn(x);
              if (v === null || !isFinite(v)) return false;
              sum += (i % 2 === 0 ? 2 : 4) * v;
            }
            const I = (h/3) * sum;
            return Math.abs(I - 5) < 0.05;
          }catch(_){ return false; }
        }},
      { id:'nt', label:'ไม่เป็นค่าคงที่', test:nonTrivial },
    ] },
  { id:'iv2', prompt:'สร้าง $f(x)$ ที่ $\\int_0^3 f(x)\\,dx = 12$ (ไม่ใช่ค่าคงที่)',
    hint:'ลอง $2x + 1$ (เช่นเดียวกับโจทย์ใน .tex): $\\int_0^3 (2x+1)\\,dx = 9 + 3 = 12$',
    example:'2*x + 1',
    placeholder:'เช่น  2*x + 1',
    checks:[
      { id:'int12', label:'$\\int_0^3 f(x)\\,dx = 12$',
        test:function(fn){
          try{
            const n = 1000, a = 0, b = 3, h = (b-a)/n;
            let sum = fn(a) + fn(b);
            for (let i = 1; i < n; i++) {
              const x = a + i*h;
              const v = fn(x);
              if (v === null || !isFinite(v)) return false;
              sum += (i % 2 === 0 ? 2 : 4) * v;
            }
            const I = (h/3) * sum;
            return Math.abs(I - 12) < 0.1;
          }catch(_){ return false; }
        }},
      { id:'nt', label:'ไม่เป็นค่าคงที่', test:nonTrivial },
    ] },
];

const INTEGRATION_MISSIONS = [
  { id:'int-m1', bloom:1, icon:'🔖', clo:'CLO-I1',
    title:'จำสูตรแอนติเดริเวทีฟและ FTC',
    cloLabel:'CLO-I1: ระบุสูตรแอนติเดริเวทีฟและ FTC',
    type:'quick-mcq', pool:POOL_I1_REMEMBER, draw:5, passThreshold:4,
    rubric:[`คลัง ${POOL_I1_REMEMBER.length} ข้อ — สุ่ม 5 ข้อ/รอบ`,'ตอบถูก ≥ 4 จาก 5 = ผ่าน'], xp:10 },
  { id:'int-m2', bloom:2, icon:'💡', clo:'CLO-I2',
    title:'เข้าใจแนวคิดปริพันธ์และ FTC',
    cloLabel:'CLO-I2: อธิบายความหมายของ $+C$, รีมันน์, FTC',
    type:'quick-mcq', pool:POOL_I2_UNDERSTAND, draw:4, passThreshold:3,
    rubric:[`คลัง ${POOL_I2_UNDERSTAND.length} ข้อ — สุ่ม 4 ข้อ/รอบ`,'ตอบถูก ≥ 3 จาก 4 = ผ่าน'], xp:12 },
  { id:'int-m3', bloom:3, icon:'✏', clo:'CLO-I3',
    title:'คำนวณปริพันธ์จำกัดเขตและไม่จำกัด',
    cloLabel:'CLO-I3: คำนวณ $\\int_a^b f(x)\\,dx$',
    type:'numeric', pool:POOL_I3_NUMERIC,
    rubric:[`คลัง ${POOL_I3_NUMERIC.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,'ค่าอยู่ใน ±0.02'], xp:20 },
  { id:'int-m4', bloom:4, icon:'🔍', clo:'CLO-I4',
    title:'วิเคราะห์ผลรวมรีมันน์/วงศ์แอนติเดริเวทีฟ',
    cloLabel:'CLO-I4: วิเคราะห์พฤติกรรมของผลรวมและแอนติเดริเวทีฟ',
    type:'analyze', pool:POOL_I4_ANALYZE,
    rubric:[`คลัง ${POOL_I4_ANALYZE.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,'เลือกคำตอบหลัก + เหตุผลครบ'], xp:25 },
  { id:'int-m5', bloom:5, icon:'⚖', clo:'CLO-I5',
    title:'ตรวจการหาปริพันธ์: หาข้อผิด',
    cloLabel:'CLO-I5: ประเมินความถูกต้องของการหาปริพันธ์',
    type:'evaluate', pool:POOL_I5_EVALUATE,
    rubric:[`คลัง ${POOL_I5_EVALUATE.length} การพิสูจน์ — สุ่ม 1 อัน/รอบ`,'ชี้บรรทัดผิด + เลือกการแก้ไข'], xp:30 },
  { id:'int-m6', bloom:6, icon:'🎨', clo:'CLO-I6',
    title:'สร้างปริพันธ์ตามเงื่อนไขค่า',
    cloLabel:'CLO-I6: สร้าง $f$ ให้ปริพันธ์มีค่าตามกำหนด',
    type:'create', pool:POOL_I6_CREATE,
    rubric:[`คลัง ${POOL_I6_CREATE.length} โจทย์สร้าง — สุ่ม 1 โจทย์/รอบ`,'ผ่านทุกเกณฑ์'], xp:40 },
  { id:'int-m7', bloom:3, icon:'🧭', clo:'CLO-I3',
    title:'ประกอบวิธีหาปริพันธ์ทีละขั้น (SBRA)',
    cloLabel:'CLO-I3: เลือกเทคนิค + เหตุผลแต่ละขั้น (u-sub/IBP/FTC/สูตรมาตรฐาน)',
    type:'step-reason', pool:POOL_SBRA_INT,
    rubric:[`คลัง ${POOL_SBRA_INT.length} โจทย์ — สุ่ม 1 โจทย์/รอบ`,'เลือกเทคนิค + เหตุผลถูกทุกขั้น','≥ 70% = ผ่าน'], xp:45 },
];


/* ============ Export ============ */

const MISSION_BANK = {
  continuity: {
    id:'continuity',
    label:'ฟังก์ชันต่อเนื่อง',
    missions: CONTINUITY_MISSIONS,
  },
  limits: {
    id:'limits',
    label:'ลิมิต',
    missions: LIMITS_MISSIONS,
  },
  differentiation: {
    id:'differentiation',
    label:'อนุพันธ์',
    missions: DIFFERENTIATION_MISSIONS,
  },
  integration: {
    id:'integration',
    label:'ปริพันธ์',
    missions: INTEGRATION_MISSIONS,
  },
};

/* ============ Utility: random sample without replacement ============ */

function sampleN(arr, n) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = copy[i]; copy[i] = copy[j]; copy[j] = t;
  }
  return copy.slice(0, Math.min(n, copy.length));
}

function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
