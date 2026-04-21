'use strict';

// ── การประยุกต์ของปริพันธ์ ──
(function () {
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
      } catch (e) {}
    } else { setTimeout(() => renderLatex(el), 100); }
  }

  // ═════════ APP A: Area between curves ═════════
  const selF   = document.getElementById('ab-f');
  const selG   = document.getElementById('ab-g');
  const slAbA  = document.getElementById('sl-ab-a');
  const slAbB  = document.getElementById('sl-ab-b');
  const valAbA = document.getElementById('val-ab-a');
  const valAbB = document.getElementById('val-ab-b');
  const readAb = document.getElementById('ab-readout');

  function renderArea() {
    let a = parseFloat(slAbA.value);
    let b = parseFloat(slAbB.value);
    if (a >= b) b = a + 0.1;
    valAbA.textContent = a.toFixed(2);
    valAbB.textContent = b.toFixed(2);
    const fExpr = selF.value, gExpr = selG.value;
    const evalF = makeEvalFn(fExpr);
    const evalG = makeEvalFn(gExpr);

    // determine y range by sampling
    const xMin = Math.min(-1, a - 0.5);
    const xMax = Math.max(4, b + 0.5);
    let yMin = Infinity, yMax = -Infinity;
    for (let i = 0; i <= 200; i++) {
      const x = xMin + (xMax - xMin) * i / 200;
      [evalF, evalG].forEach(fn => {
        const y = fn(x);
        if (y !== null && isFinite(y)) { if (y < yMin) yMin = y; if (y > yMax) yMax = y; }
      });
    }
    if (!isFinite(yMin)) { yMin = -2; yMax = 4; }
    const padY = Math.max(0.5, (yMax - yMin) * 0.15);

    const g = new GraphCanvas('c-ab', {
      xMin, xMax, yMin: yMin - padY, yMax: yMax + padY, padding: 40,
    });
    g.render();

    // Fill area between curves on [a, b]
    const samples = 200;
    const dx = (b - a) / samples;
    const ctx = g.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= samples; i++) {
      const x = a + i * dx;
      const yF = evalF(x);
      if (yF === null) continue;
      const p = g.worldToCanvas(x, yF);
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    for (let i = samples; i >= 0; i--) {
      const x = a + i * dx;
      const yG = evalG(x);
      if (yG === null) continue;
      const p = g.worldToCanvas(x, yG);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    g.drawFunction(evalF, '#8b5cf6', { lineWidth: 2.5 });
    g.drawFunction(evalG, '#22d3ee', { lineWidth: 2.5 });

    // compute |f-g| integral via Simpson
    const diff = (x) => {
      const yf = evalF(x), yg = evalG(x);
      if (yf === null || yg === null) return 0;
      return Math.abs(yf - yg);
    };
    const area = numericIntegral(diff, a, b, 1000);
    readAb.innerHTML =
      `พื้นที่ $\\displaystyle\\int_{${a.toFixed(2)}}^{${b.toFixed(2)}} |f-g|\\,dx = ` +
      `<strong>${area.toFixed(4)}</strong>$`;
    renderLatex(readAb);
  }

  [selF, selG].forEach(s => s.addEventListener('change', renderArea));
  [slAbA, slAbB].forEach(s => s.addEventListener('input', renderArea));

  // ═════════ APP B: Volume of revolution ═════════
  const selVF  = document.getElementById('vol-f');
  const slVA   = document.getElementById('sl-vol-a');
  const slVB   = document.getElementById('sl-vol-b');
  const slVN   = document.getElementById('sl-vol-n');
  const valVA  = document.getElementById('val-vol-a');
  const valVB  = document.getElementById('val-vol-b');
  const valVN  = document.getElementById('val-vol-n');
  const readV  = document.getElementById('vol-readout');

  function renderVolume() {
    const fExpr = selVF.value;
    let a = parseFloat(slVA.value), b = parseFloat(slVB.value);
    if (a >= b) b = a + 0.1;
    const n = parseInt(slVN.value, 10);
    valVA.textContent = a.toFixed(2);
    valVB.textContent = b.toFixed(2);
    valVN.textContent = n;

    const evalF = makeEvalFn(fExpr);

    // sample to find radius scale
    let rMax = 0;
    for (let i = 0; i <= 100; i++) {
      const x = a + (b - a) * i / 100;
      const y = evalF(x);
      if (y !== null) rMax = Math.max(rMax, Math.abs(y));
    }
    const yRange = Math.max(1.5, rMax * 1.2);

    const g = new GraphCanvas('c-vol', {
      xMin: a - 0.3, xMax: b + 0.3, yMin: -yRange, yMax: yRange, padding: 30,
    });
    g.render();

    // draw disks (ellipses) along x-axis
    const dx = (b - a) / n;
    const ctx = g.ctx;
    for (let i = 0; i < n; i++) {
      const xc = a + (i + 0.5) * dx;
      const r = evalF(xc);
      if (r === null) continue;
      const p = g.worldToCanvas(xc, 0);
      const pTop = g.worldToCanvas(xc, Math.abs(r));
      const pEdge = g.worldToCanvas(xc + dx/2, 0);
      const ry = Math.abs(p.y - pTop.y);
      const rxCanvas = Math.max(2, pEdge.x - p.x);
      ctx.save();
      ctx.fillStyle = `rgba(139, 92, 246, ${0.15 + 0.35 * (i % 2)})`;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rxCanvas, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    // draw generating curve on top
    g.drawFunction(evalF, '#fb7185', { lineWidth: 2.5 });
    // mirror curve (−f)
    g.drawFunction((x) => { const y = evalF(x); return y === null ? null : -y; }, '#fb7185', { lineWidth: 2.5 });

    // volume: π ∫ [f(x)]² dx
    const squared = (x) => { const y = evalF(x); return y === null ? 0 : y*y; };
    const V = Math.PI * numericIntegral(squared, a, b, 2000);
    readV.innerHTML = `$V = \\pi\\displaystyle\\int_{${a.toFixed(2)}}^{${b.toFixed(2)}} [f(x)]^2\\,dx$ &nbsp;≈&nbsp; <strong>${V.toFixed(4)}</strong>`;
    renderLatex(readV);
  }

  selVF.addEventListener('change', renderVolume);
  [slVA, slVB, slVN].forEach(s => s.addEventListener('input', renderVolume));

  // ═════════ APP C: Work (spring) ═════════
  const slK   = document.getElementById('sl-k');
  const slD   = document.getElementById('sl-d');
  const valK  = document.getElementById('val-k');
  const valD  = document.getElementById('val-d');
  const readW = document.getElementById('work-readout');

  function renderWork() {
    const k = parseFloat(slK.value);
    const d = parseFloat(slD.value);
    valK.textContent = k.toFixed(2);
    valD.textContent = d.toFixed(2);

    const evalF = (x) => k * x;
    const yMax = Math.max(1, k * 4);
    const g = new GraphCanvas('c-work', {
      xMin: -0.2, xMax: 4.2, yMin: -1, yMax: yMax, padding: 36,
    });
    g.render();
    // fill triangle under F=kx from 0 to d
    if (d > 0) g.drawAreaFill(evalF, 0, d, 'rgba(52, 211, 153, 0.35)');
    g.drawFunction(evalF, '#8b5cf6', { lineWidth: 2.5 });

    // mark d
    const evalY = evalF(d);
    g.drawPoint(d, evalY, { color: '#fb7185', radius: 6 });
    // vertical drop at d
    const ctx = g.ctx;
    const p1 = g.worldToCanvas(d, 0);
    const p2 = g.worldToCanvas(d, evalY);
    ctx.save();
    ctx.strokeStyle = 'rgba(251,113,133,.8)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();

    const W = 0.5 * k * d * d;
    readW.innerHTML =
      `$W = \\displaystyle\\int_0^{${d.toFixed(2)}} ${k.toFixed(2)}x\\,dx = ` +
      `\\tfrac{1}{2}(${k.toFixed(2)})(${d.toFixed(2)})^2$ &nbsp;=&nbsp; <strong>${W.toFixed(4)} J</strong>`;
    renderLatex(readW);
  }

  [slK, slD].forEach(s => s.addEventListener('input', renderWork));

  // ── Completion ──
  const appsSeen = new Set();
  function awardApp(key) {
    if (appsSeen.has(key)) return;
    appsSeen.add(key);
    addXP(25, 'ใช้แอป ' + key);
    if (appsSeen.size >= 3) {
      const state = loadState();
      if (!state.lessonsCompleted.includes('integrate_apps')) {
        completeLesson('integrate_apps');
        fireConfetti(60);
      }
    }
  }
  [slAbA, slAbB].forEach(s => s.addEventListener('change', () => awardApp('area')));
  [slVA, slVB, slVN].forEach(s => s.addEventListener('change', () => awardApp('volume')));
  [slK, slD].forEach(s => s.addEventListener('change', () => awardApp('work')));

  // ── Init ──
  function init() {
    renderArea();
    renderVolume();
    renderWork();
    renderLatex(document.body);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
