'use strict';

// ── หน้า ฟังก์ชันต่อเนื่อง ──
(function () {
  // แทนที่ math renderer เมื่อพร้อมใช้งาน
  function renderLatex(el) {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$',  right: '$',  display: false },
          ],
          throwOnError: false,
        });
      } catch (e) { /* ignore */ }
    } else {
      setTimeout(() => renderLatex(el), 100);
    }
  }

  // ── Mini canvases ──
  let fixedHole = false;

  function drawRemovable() {
    const g = new GraphCanvas('c-removable', {
      xMin: -1, xMax: 5, yMin: -1, yMax: 7, padding: 26,
    });
    g.render();
    const evalFn = makeEvalFn('(x^2-4)/(x-2)');
    g.drawFunction(evalFn, '#8b5cf6', { lineWidth: 2 });
    if (fixedHole) {
      g.drawPoint(2, 4, { color: '#34d399', radius: 5 });
    } else {
      g.drawHole(2, 4, '#fb7185');
    }
  }

  function drawJump() {
    const g = new GraphCanvas('c-jump', {
      xMin: -2, xMax: 4, yMin: -2, yMax: 4, padding: 26,
    });
    g.render();
    // floor function drawn as segments with solid-left / open-right endpoints
    const ctx = g.ctx;
    for (let k = -2; k <= 3; k++) {
      const p1 = g.worldToCanvas(k, k);
      const p2 = g.worldToCanvas(k + 1, k);
      ctx.save();
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
      // solid left endpoint
      g.drawPoint(k, k, { color: '#22d3ee', radius: 4 });
      // open right endpoint
      g.drawHole(k + 1, k, '#fb7185');
    }
  }

  function drawInfinite() {
    const g = new GraphCanvas('c-infinite', {
      xMin: -1, xMax: 3, yMin: -1, yMax: 10, padding: 26,
    });
    g.render();
    const evalFn = (x) => {
      const d = (x - 1);
      if (Math.abs(d) < 0.01) return null;
      return 1 / (d * d);
    };
    g.drawFunction(evalFn, '#8b5cf6', { lineWidth: 2 });
    g.drawVerticalAsymptote(1);
  }

  // ── IVT ──
  const ivtFn = makeEvalFn('x^3 - x - 2');
  let bisectionTrace = [];
  let bisectionIdx = -1;
  let animTimer = null;

  const slA = document.getElementById('sl-a');
  const slB = document.getElementById('sl-b');
  const slN = document.getElementById('sl-n');
  const valA = document.getElementById('val-a');
  const valB = document.getElementById('val-b');
  const valN = document.getElementById('val-n');
  const readout = document.getElementById('ivt-readout');

  function renderIVT() {
    const a = parseFloat(slA.value);
    const b = parseFloat(slB.value);
    const N = parseFloat(slN.value);
    valA.textContent = a.toFixed(2);
    valB.textContent = b.toFixed(2);
    valN.textContent = N.toFixed(2);

    const g = new GraphCanvas('c-ivt', {
      xMin: -0.5, xMax: 3.5, yMin: -6, yMax: 8, padding: 40,
    });
    g.render();
    g.drawFunction(ivtFn, '#8b5cf6', { lineWidth: 2.5 });

    // shaded interval [a,b]
    const ctx = g.ctx;
    const p1 = g.worldToCanvas(a, g.yMin);
    const p2 = g.worldToCanvas(b, g.yMax);
    ctx.save();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fillRect(p1.x, p2.y, p2.x - p1.x, p1.y - p2.y);
    ctx.restore();

    // horizontal line y = N
    {
      const pL = g.worldToCanvas(g.xMin, N);
      const pR = g.worldToCanvas(g.xMax, N);
      ctx.save();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(pL.x, pL.y);
      ctx.lineTo(pR.x, pR.y);
      ctx.stroke();
      ctx.restore();
    }

    // endpoint values
    const fa = ivtFn(a), fb = ivtFn(b);
    if (fa !== null) g.drawPoint(a, fa, { color: '#fb7185', radius: 5 });
    if (fb !== null) g.drawPoint(b, fb, { color: '#fb7185', radius: 5 });

    // bisection trace (animated)
    if (bisectionIdx >= 0 && bisectionTrace.length) {
      for (let i = 0; i <= Math.min(bisectionIdx, bisectionTrace.length - 1); i++) {
        const m = bisectionTrace[i];
        const fm = ivtFn(m);
        const alpha = 0.3 + 0.7 * (i / bisectionTrace.length);
        ctx.save();
        const pt = g.worldToCanvas(m, fm);
        const base = g.worldToCanvas(m, N);
        ctx.strokeStyle = `rgba(250, 204, 21, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(base.x, base.y);
        ctx.stroke();
        ctx.restore();
        g.drawPoint(m, fm, { color: '#facc15', radius: 4 });
      }
    }

    // readout
    const faStr = fa === null ? '–' : fa.toFixed(3);
    const fbStr = fb === null ? '–' : fb.toFixed(3);
    let conclusion = '';
    if (fa !== null && fb !== null) {
      const between = (fa - N) * (fb - N) <= 0;
      conclusion = between
        ? '✅ $N$ อยู่ระหว่าง $f(a)$ และ $f(b)$ → <strong>มี $c$ ที่ $f(c)=N$</strong>'
        : '⚠️ $N$ ไม่อยู่ระหว่าง $f(a)$ และ $f(b)$ → IVT ยืนยันไม่ได้ในช่วงนี้';
    }
    let cVal = '';
    if (bisectionIdx >= 0 && bisectionTrace.length) {
      const m = bisectionTrace[Math.min(bisectionIdx, bisectionTrace.length - 1)];
      cVal = `<div style="margin-top:.4rem;">รอบที่ ${Math.min(bisectionIdx+1, bisectionTrace.length)}: $c \\approx ${m.toFixed(4)}$ &nbsp; $f(c) \\approx ${ivtFn(m).toFixed(4)}$</div>`;
    }
    readout.innerHTML =
      `$f(a) = ${faStr}$ &nbsp; $f(b) = ${fbStr}$ &nbsp; $N = ${N.toFixed(2)}$` +
      `<div style="margin-top:.25rem;">${conclusion}</div>` + cVal;
    renderLatex(readout);
  }

  function bisect(a, b, target, steps = 8) {
    const mids = [];
    let lo = a, hi = b;
    for (let i = 0; i < steps; i++) {
      const m = (lo + hi) / 2;
      mids.push(m);
      const fLo = ivtFn(lo), fM = ivtFn(m);
      if (fLo === null || fM === null) break;
      if ((fLo - target) * (fM - target) < 0) hi = m;
      else lo = m;
    }
    return mids;
  }

  function startBisection() {
    const a = parseFloat(slA.value);
    const b = parseFloat(slB.value);
    const N = parseFloat(slN.value);
    const fa = ivtFn(a), fb = ivtFn(b);
    if (fa === null || fb === null) {
      showToast('ฟังก์ชันหาค่าไม่ได้ในช่วงนี้', '⚠️');
      return;
    }
    if ((fa - N) * (fb - N) > 0) {
      showToast('N ไม่อยู่ระหว่าง f(a) และ f(b)', '⚠️');
      return;
    }
    if (animTimer) clearInterval(animTimer);
    bisectionTrace = bisect(a, b, N, 8);
    bisectionIdx = 0;
    renderIVT();
    animTimer = setInterval(() => {
      bisectionIdx += 1;
      if (bisectionIdx >= bisectionTrace.length) {
        clearInterval(animTimer);
        animTimer = null;
        markCompleteIfNeeded();
      }
      renderIVT();
    }, 400);
  }

  function resetIVT() {
    if (animTimer) clearInterval(animTimer);
    animTimer = null;
    bisectionTrace = [];
    bisectionIdx = -1;
    renderIVT();
  }

  // ── Completion ──
  let interactionCount = 0; // track fix hole + bisection
  function markCompleteIfNeeded() {
    interactionCount += 1;
    const state = loadState();
    if (!state.lessonsCompleted.includes('continuity')) {
      completeLesson('continuity');
      addXP(40, 'เรียนจบ "ฟังก์ชันต่อเนื่อง"');
      fireConfetti(50);
      document.getElementById('completion-banner').style.display = '';
    } else {
      document.getElementById('completion-banner').style.display = '';
    }
  }

  function init() {
    drawRemovable();
    drawJump();
    drawInfinite();
    renderIVT();

    document.getElementById('btn-fix').addEventListener('click', () => {
      fixedHole = !fixedHole;
      drawRemovable();
      showToast(fixedHole ? 'เติมรูแล้ว — ต่อเนื่อง' : 'เอารูคืน', fixedHole ? '✅' : '↩️');
      if (fixedHole) markCompleteIfNeeded();
    });

    [slA, slB, slN].forEach(s => s.addEventListener('input', () => {
      bisectionTrace = []; bisectionIdx = -1;
      renderIVT();
    }));
    document.getElementById('btn-bisect').addEventListener('click', startBisection);
    document.getElementById('btn-reset-ivt').addEventListener('click', resetIVT);

    renderLatex(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
