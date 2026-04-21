'use strict';

// ฟังก์ชันตัวอย่างทั้งหมด แยกตามกลุ่ม (basic / trig / exp / log)
const FN_CATALOG = {
  basic: [
    { id: 'poly1', label: 'x^2 - 1 หารด้วย x - 1', katex: '\\dfrac{x^2-1}{x-1}',
      expr: '(x^2-1)/(x-1)', a: 1, L: 2, hole: true,
      xRange: [-2, 4], yRange: [-1, 5],
      technique: 'แยกตัวประกอบ',
      steps: ['\\frac{x^2-1}{x-1} = \\frac{(x-1)(x+1)}{x-1} = x+1', '\\lim_{x\\to 1}(x+1) = 2'] },
    { id: 'poly2', label: 'x^2 - 4 หารด้วย x - 2', katex: '\\dfrac{x^2-4}{x-2}',
      expr: '(x^2-4)/(x-2)', a: 2, L: 4, hole: true,
      xRange: [-1, 5], yRange: [0, 6],
      technique: 'แยกตัวประกอบ',
      steps: ['\\frac{x^2-4}{x-2} = \\frac{(x-2)(x+2)}{x-2} = x+2', '\\lim_{x\\to 2}(x+2) = 4'] },
    { id: 'root1', label: '(√(x+4)-2)/x', katex: '\\dfrac{\\sqrt{x+4}-2}{x}',
      expr: '(sqrt(x+4)-2)/x', a: 0, L: 0.25, hole: true,
      xRange: [-3, 4], yRange: [0, 0.6],
      technique: 'คูณคอนจูเกต',
      steps: [
        '\\frac{\\sqrt{x+4}-2}{x} \\cdot \\frac{\\sqrt{x+4}+2}{\\sqrt{x+4}+2}',
        '= \\frac{(x+4)-4}{x(\\sqrt{x+4}+2)} = \\frac{1}{\\sqrt{x+4}+2}',
        '\\lim_{x\\to 0} \\frac{1}{\\sqrt{x+4}+2} = \\frac{1}{4}',
      ] },
    { id: 'poly3', label: '(x^3 - 1)/(x - 1)', katex: '\\dfrac{x^3-1}{x-1}',
      expr: '(x^3-1)/(x-1)', a: 1, L: 3, hole: true,
      xRange: [-2, 3], yRange: [-1, 8],
      technique: 'แยกตัวประกอบ',
      steps: ['\\frac{x^3-1}{x-1} = x^2+x+1', '\\lim_{x\\to 1}(x^2+x+1) = 3'] },
    { id: 'rational', label: '1/(x-2)', katex: '\\dfrac{1}{x-2}',
      expr: '1/(x-2)', a: 2, L: null, hole: false, asymptote: 2,
      xRange: [-1, 5], yRange: [-6, 6],
      technique: 'เส้นกำกับ',
      steps: ['\\lim_{x\\to 2^-}\\frac{1}{x-2}=-\\infty', '\\lim_{x\\to 2^+}\\frac{1}{x-2}=+\\infty', '\\text{ลิมิตหาค่าไม่ได้}'] },
  ],

  trig: [
    { id: 'sinc', label: 'sin(x)/x', katex: '\\dfrac{\\sin x}{x}',
      expr: 'sin(x)/x', a: 0, L: 1, hole: true,
      xRange: [-8, 8], yRange: [-0.4, 1.3],
      technique: 'ทฤษฎีบทการบีบ (Squeeze)',
      steps: ['\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1', '\\text{(สูตรพื้นฐาน — ใช้บ่อยมาก!)}'] },
    { id: 'omcos', label: '(1 - cos(x))/x', katex: '\\dfrac{1-\\cos x}{x}',
      expr: '(1-cos(x))/x', a: 0, L: 0, hole: true,
      xRange: [-6, 6], yRange: [-0.5, 0.5],
      technique: 'คูณคอนจูเกต',
      steps: ['\\frac{1-\\cos x}{x} \\cdot \\frac{1+\\cos x}{1+\\cos x} = \\frac{\\sin^2 x}{x(1+\\cos x)}',
              '= \\frac{\\sin x}{x} \\cdot \\frac{\\sin x}{1+\\cos x} \\to 1\\cdot 0 = 0'] },
    { id: 'tanc', label: 'tan(x)/x', katex: '\\dfrac{\\tan x}{x}',
      expr: 'tan(x)/x', a: 0, L: 1, hole: true,
      xRange: [-1.2, 1.2], yRange: [0.8, 2],
      technique: 'แยก sin/cos',
      steps: ['\\frac{\\tan x}{x} = \\frac{\\sin x}{x} \\cdot \\frac{1}{\\cos x}', '\\to 1 \\cdot \\frac{1}{1} = 1'] },
    { id: 'sin2', label: 'sin(2x)/x', katex: '\\dfrac{\\sin 2x}{x}',
      expr: 'sin(2*x)/x', a: 0, L: 2, hole: true,
      xRange: [-4, 4], yRange: [-1, 2.5],
      technique: 'เปลี่ยนตัวแปร',
      steps: ['\\frac{\\sin 2x}{x} = 2 \\cdot \\frac{\\sin 2x}{2x}', '\\to 2 \\cdot 1 = 2'] },
  ],

  exp: [
    { id: 'expc', label: '(e^x - 1)/x', katex: '\\dfrac{e^x - 1}{x}',
      expr: '(exp(x)-1)/x', a: 0, L: 1, hole: true,
      xRange: [-2, 2], yRange: [0, 3],
      technique: 'สูตรพื้นฐาน',
      steps: ['\\lim_{x\\to 0}\\frac{e^x - 1}{x} = 1'] },
    { id: 'e_def', label: '(1 + 1/n)^n', katex: '\\left(1+\\tfrac{1}{n}\\right)^n',
      expr: '(1 + 1/x)^x', a: Infinity, L: Math.E, hole: false,
      xRange: [1, 30], yRange: [2, 2.8],
      technique: 'นิยามของ e',
      steps: ['\\lim_{n\\to\\infty}\\left(1+\\frac{1}{n}\\right)^n = e \\approx 2.71828'] },
    { id: 'ex', label: 'e^x', katex: 'e^x',
      expr: 'exp(x)', a: Infinity, L: Infinity, hole: false,
      xRange: [-3, 3], yRange: [0, 20],
      technique: 'ฟังก์ชันพื้นฐาน',
      steps: ['\\lim_{x\\to\\infty} e^x = +\\infty', '\\lim_{x\\to -\\infty} e^x = 0'] },
    { id: 'exp2', label: '(2^x - 1)/x', katex: '\\dfrac{2^x - 1}{x}',
      expr: '(2^x-1)/x', a: 0, L: Math.LN2, hole: true,
      xRange: [-2, 2], yRange: [0, 2],
      technique: 'สูตรทั่วไป',
      steps: ['\\lim_{x\\to 0}\\frac{a^x - 1}{x} = \\ln a', '\\text{สำหรับ } a=2: \\ln 2 \\approx 0.693'] },
  ],

  log: [
    { id: 'ln1x', label: 'ln(1+x)/x', katex: '\\dfrac{\\ln(1+x)}{x}',
      expr: 'log(1+x)/x', a: 0, L: 1, hole: true,
      xRange: [-0.8, 2], yRange: [0, 1.5],
      technique: 'สูตรพื้นฐาน',
      steps: ['\\lim_{x\\to 0}\\frac{\\ln(1+x)}{x} = 1'] },
    { id: 'lnx_inf', label: 'ln(x)', katex: '\\ln x',
      expr: 'log(x)', a: Infinity, L: Infinity, hole: false,
      xRange: [0.1, 20], yRange: [-3, 4],
      technique: 'ฟังก์ชันพื้นฐาน',
      steps: ['\\lim_{x\\to\\infty}\\ln x = +\\infty \\text{ (ช้ามาก)}', '\\lim_{x\\to 0^+}\\ln x = -\\infty'] },
    { id: 'ax', label: '(a^x-1)/x, a=3', katex: '\\dfrac{3^x - 1}{x}',
      expr: '(3^x-1)/x', a: 0, L: Math.log(3), hole: true,
      xRange: [-1.5, 1.5], yRange: [0, 3],
      technique: 'สูตรทั่วไป',
      steps: ['\\lim_{x\\to 0}\\frac{a^x - 1}{x} = \\ln a', '\\text{สำหรับ } a=3: \\ln 3 \\approx 1.099'] },
    { id: 'ln_ratio', label: 'ln(x)/x', katex: '\\dfrac{\\ln x}{x}',
      expr: 'log(x)/x', a: Infinity, L: 0, hole: false,
      xRange: [0.5, 30], yRange: [-0.5, 0.5],
      technique: 'L\'Hospital',
      steps: ['\\lim_{x\\to\\infty}\\frac{\\ln x}{x} \\stackrel{\\text{L.H.}}{=} \\lim_{x\\to\\infty}\\frac{1/x}{1} = 0'] },
  ],
};

// รวมทุก ฟังก์ชันเป็น flat list (สำหรับเกม)
const ALL_FUNCTIONS = [
  ...FN_CATALOG.basic,
  ...FN_CATALOG.trig,
  ...FN_CATALOG.exp,
  ...FN_CATALOG.log,
].map(f => ({ ...f, topic: Object.keys(FN_CATALOG).find(k => FN_CATALOG[k].includes(f)) }));

// หัวข้อภาษาไทย (สำหรับแสดงผล)
const TOPIC_LABELS = {
  basic: 'พื้นฐาน (พหุนาม/ตรรกยะ/ราก)',
  trig:  'ตรีโกณมิติ',
  exp:   'เอ็กซ์โพเนนเชียล',
  log:   'ลอการิทึม',
  continuity:      'ฟังก์ชันต่อเนื่อง',
  differentiation: 'อนุพันธ์',
  diff_apps:       'การประยุกต์ของอนุพันธ์',
  integration:     'ปริพันธ์',
  integrate_apps:  'การประยุกต์ของปริพันธ์',
};

// ── แคตตาล็อกอนุพันธ์ (สำหรับหน้า differentiation / diff-app) ──
const DIFF_CATALOG = {
  basic: [
    { id: 'power2',  label: 'x²',         expr: 'x^2',         dexpr: '2*x',           katex: 'x^2',         dkatex: '2x',               x0: 1,   xRange: [-3, 3],   yRange: [-1, 9] },
    { id: 'power3',  label: 'x³',         expr: 'x^3',         dexpr: '3*x^2',         katex: 'x^3',         dkatex: '3x^2',             x0: 1,   xRange: [-2, 2],   yRange: [-8, 8] },
    { id: 'sumfn',   label: 'x² + 2x',    expr: 'x^2+2*x',     dexpr: '2*x+2',         katex: 'x^2+2x',      dkatex: '2x+2',             x0: 0,   xRange: [-4, 3],   yRange: [-2, 10] },
    { id: 'cubic',   label: 'x³ − 3x',    expr: 'x^3-3*x',     dexpr: '3*x^2-3',       katex: 'x^3-3x',      dkatex: '3x^2-3',           x0: 0,   xRange: [-3, 3],   yRange: [-5, 5] },
    { id: 'recip',   label: '1/x',        expr: '1/x',         dexpr: '-1/x^2',        katex: '\\dfrac{1}{x}',  dkatex: '-\\dfrac{1}{x^2}', x0: 1,   xRange: [0.2, 5],  yRange: [-1, 5] },
    { id: 'sqrt',    label: '√x',         expr: 'sqrt(x)',     dexpr: '1/(2*sqrt(x))', katex: '\\sqrt{x}',   dkatex: '\\dfrac{1}{2\\sqrt{x}}', x0: 1, xRange: [0, 6], yRange: [0, 3] },
  ],
  trans: [
    { id: 'sin',  label: 'sin x',  expr: 'sin(x)',   dexpr: 'cos(x)',       katex: '\\sin x',  dkatex: '\\cos x',        x0: 0,   xRange: [-7, 7],  yRange: [-1.5, 1.5] },
    { id: 'cos',  label: 'cos x',  expr: 'cos(x)',   dexpr: '-sin(x)',      katex: '\\cos x',  dkatex: '-\\sin x',       x0: 0,   xRange: [-7, 7],  yRange: [-1.5, 1.5] },
    { id: 'tan',  label: 'tan x',  expr: 'tan(x)',   dexpr: '1/cos(x)^2',   katex: '\\tan x',  dkatex: '\\sec^2 x',      x0: 0,   xRange: [-1.3, 1.3], yRange: [-5, 5] },
    { id: 'exp',  label: 'e^x',    expr: 'exp(x)',   dexpr: 'exp(x)',       katex: 'e^x',      dkatex: 'e^x',            x0: 0,   xRange: [-3, 3],  yRange: [-1, 8] },
    { id: 'ln',   label: 'ln x',   expr: 'log(x)',   dexpr: '1/x',          katex: '\\ln x',   dkatex: '\\dfrac{1}{x}',  x0: 1,   xRange: [0.1, 6], yRange: [-3, 2] },
    { id: 'pow2', label: '2^x',    expr: '2^x',      dexpr: '(log(2))*2^x', katex: '2^x',      dkatex: '(\\ln 2)\\,2^x', x0: 0,   xRange: [-3, 3],  yRange: [0, 8] },
  ],
};

// ── แคตตาล็อกปริพันธ์ (สำหรับหน้า integration / integrate-app) ──
const INTEGRAL_CATALOG = {
  basic: [
    { id: 'const',  label: '1',     expr: '1',       antiExpr: 'x',           katex: '1',    antiKatex: 'x + C',                       a: 0, b: 2,  xRange: [-1, 4], yRange: [-1, 3] },
    { id: 'linear', label: 'x',     expr: 'x',       antiExpr: 'x^2/2',       katex: 'x',    antiKatex: '\\dfrac{x^2}{2} + C',          a: 0, b: 2,  xRange: [-1, 4], yRange: [-1, 4] },
    { id: 'sq',     label: 'x²',    expr: 'x^2',     antiExpr: 'x^3/3',       katex: 'x^2',  antiKatex: '\\dfrac{x^3}{3} + C',          a: 0, b: 2,  xRange: [-1, 3], yRange: [-1, 6] },
    { id: 'cub',    label: 'x³',    expr: 'x^3',     antiExpr: 'x^4/4',       katex: 'x^3',  antiKatex: '\\dfrac{x^4}{4} + C',          a: 0, b: 2,  xRange: [-1, 3], yRange: [-2, 8] },
    { id: 'recip',  label: '1/x',   expr: '1/x',     antiExpr: 'log(x)',      katex: '\\dfrac{1}{x}', antiKatex: '\\ln|x| + C',         a: 1, b: 4,  xRange: [0.1, 6], yRange: [-1, 6] },
  ],
  trans: [
    { id: 'sin',  label: 'sin x',  expr: 'sin(x)',  antiExpr: '-cos(x)',  katex: '\\sin x',  antiKatex: '-\\cos x + C',   a: 0, b: Math.PI,    xRange: [-0.5, 4],  yRange: [-1.3, 1.3] },
    { id: 'cos',  label: 'cos x',  expr: 'cos(x)',  antiExpr: 'sin(x)',   katex: '\\cos x',  antiKatex: '\\sin x + C',    a: 0, b: Math.PI/2, xRange: [-0.5, 3],  yRange: [-1.3, 1.3] },
    { id: 'exp',  label: 'e^x',    expr: 'exp(x)',  antiExpr: 'exp(x)',   katex: 'e^x',      antiKatex: 'e^x + C',        a: 0, b: 1,         xRange: [-1, 3],    yRange: [-1, 8] },
    { id: 'sec2', label: 'sec²x',  expr: '1/cos(x)^2', antiExpr: 'tan(x)', katex: '\\sec^2 x', antiKatex: '\\tan x + C',   a: 0, b: 1,         xRange: [-0.5, 1.2], yRange: [0, 5] },
  ],
};
