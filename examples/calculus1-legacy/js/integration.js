'use strict';

// ── Integration lesson page ──
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
      } catch (e) { /* ignore */ }
    } else {
      setTimeout(() => renderLatex(el), 100);
    }
  }

  // ── Tabs ──
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-panel');
  let currentTopic = 'concept';
  const visited = new Set();

  function showTab(topic) {
    currentTopic = topic;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.topic === topic));
    panes.forEach(p => p.classList.toggle('active', p.id === `pane-${topic}`));
    visited.add(topic);
    if (topic === 'concept') renderRiemann();
    if (topic === 'anti')    renderAnti();
    if (topic === 'ftc')     renderFTC();
    if (topic === 'summary') markCompleteIfNeeded();
    const pane = document.getElementById(`pane-${topic}`);
    if (pane) renderLatex(pane);
  }
  tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.topic)));

  // ── Riemann concept ──
  const selR  = document.getElementById('riemann-fn');
  const slN   = document.getElementById('sl-n');
  const slA   = document.getElementById('sl-a');
  const slB   = document.getElementById('sl-b');
  const valN  = document.getElementById('val-n');
  const valA  = document.getElementById('val-a');
  const valB  = document.getElementById('val-b');
  const readR = document.getElementById('riemann-readout');
  const modePills = document.querySelectorAll('#riemann-modes .mode-pill');
  let mode = 'L';
  let convergeAnim = null;

  // Use a curated subset for Riemann (positive-ish graphs work best)
  const riemannFns = [
    ...INTEGRAL_CATALOG.basic,
    ...INTEGRAL_CATALOG.trans,
  ];
  riemannFns.forEach((f, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = f.label;
    selR.appendChild(opt);
  });

  function currentRiemannFn() {
    return riemannFns[parseInt(selR.value || 0, 10)];
  }

  function renderRiemann() {
    const fn = currentRiemannFn();
    const n = parseInt(slN.value, 10);
    let a = parseFloat(slA.value);
    let b = parseFloat(slB.value);
    if (a >= b) b = a + 0.1;
    valN.textContent = n;
    valA.textContent = a.toFixed(2);
    valB.textContent = b.toFixed(2);

    const g = new GraphCanvas('c-riemann', {
      xMin: fn.xRange[0], xMax: fn.xRange[1],
      yMin: fn.yRange[0], yMax: fn.yRange[1],
      padding: 40,
    });
    g.render();
    const evalFn = makeEvalFn(fn.expr);
    // draw rectangles first so curve sits on top
    const sum = g.drawRiemann(evalFn, a, b, n, mode);
    g.drawFunction(evalFn, '#8b5cf6', { lineWidth: 2.5 });

    const exact = numericIntegral(evalFn, a, b, 4000);
    const err = Math.abs(exact - sum);
    readR.innerHTML =
      `ผลรวมรีมันน์ ($n=${n}$, โหมด ${mode}): <strong>${sum.toFixed(5)}</strong> &nbsp;·&nbsp; ` +
      `ค่าจริง $\\int_{${a.toFixed(2)}}^{${b.toFixed(2)}} ${fn.katex}\\,dx \\approx ${exact.toFixed(5)}$ &nbsp;·&nbsp; ` +
      `<span class="error-tile">คลาดเคลื่อน ${err.toFixed(5)}</span>`;
    renderLatex(readR);

    // XP on convergence (n >= 100 reached)
    if (n >= 100) markCompleteIfNeeded();
  }

  function animateConverge() {
    if (convergeAnim) clearInterval(convergeAnim);
    const steps = [1, 2, 4, 8, 16, 32, 64, 128, 256, 500];
    let i = 0;
    convergeAnim = setInterval(() => {
      slN.value = steps[i];
      renderRiemann();
      i++;
      if (i >= steps.length) { clearInterval(convergeAnim); convergeAnim = null; }
    }, 500);
  }

  // ── Antiderivative: family of curves ──
  const selA    = document.getElementById('anti-fn');
  const slC     = document.getElementById('sl-c');
  const valC    = document.getElementById('val-c');

  INTEGRAL_CATALOG.basic.concat(INTEGRAL_CATALOG.trans).forEach((f, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = f.label;
    selA.appendChild(opt);
  });
  const antiFns = INTEGRAL_CATALOG.basic.concat(INTEGRAL_CATALOG.trans);

  function renderAnti() {
    const fn = antiFns[parseInt(selA.value || 0, 10)];
    const C = parseFloat(slC.value);
    valC.textContent = C.toFixed(2);

    const xr = fn.xRange;
    // y range based on antiderivative sweeping
    const evalF = makeEvalFn(fn.antiExpr);
    let yMin = Infinity, yMax = -Infinity;
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const x = xr[0] + (xr[1] - xr[0]) * (i / N);
      const v = evalF(x);
      if (v !== null && isFinite(v)) {
        if (v < yMin) yMin = v;
        if (v > yMax) yMax = v;
      }
    }
    if (!isFinite(yMin) || !isFinite(yMax)) { yMin = -5; yMax = 5; }
    yMin -= 5; yMax += 5;

    const g = new GraphCanvas('c-anti', {
      xMin: xr[0], xMax: xr[1], yMin, yMax, padding: 40,
    });
    g.render();
    // Draw family for C ∈ {-4, -2, 0, 2, 4} faded
    const Cs = [-4, -2, 0, 2, 4];
    Cs.forEach(cv => {
      const ef = (x) => {
        const v = evalF(x);
        return (v === null) ? null : v + cv;
      };
      g.drawFunction(ef, 'rgba(139,92,246,0.25)', { lineWidth: 1.4 });
    });
    // current selected C highlighted
    const efCur = (x) => {
      const v = evalF(x);
      return (v === null) ? null : v + C;
    };
    g.drawFunction(efCur, '#22d3ee', { lineWidth: 2.8 });
  }

  // ── FTC demo ──
  const slX  = document.getElementById('sl-x');
  const valX = document.getElementById('val-x');
  const readFTC = document.getElementById('ftc-readout');
  const ftcFn = makeEvalFn('x*sin(x)+1.5');   // always positive-ish for nice area

  function renderFTC() {
    const x = parseFloat(slX.value);
    valX.textContent = x.toFixed(2);

    const gT = new GraphCanvas('c-ftc-top', {
      xMin: 0, xMax: 3, yMin: 0, yMax: 5, padding: 30,
    });
    gT.render();
    gT.drawAreaFill(ftcFn, 0, x, 'rgba(139,92,246,0.35)');
    gT.drawFunction(ftcFn, '#8b5cf6', { lineWidth: 2.5 });

    // vertical marker at x
    const ctx = gT.ctx;
    const pTop = gT.worldToCanvas(x, gT.yMax);
    const pBot = gT.worldToCanvas(x, gT.yMin);
    ctx.save();
    ctx.strokeStyle = '#fb7185';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y);
    ctx.lineTo(pBot.x, pBot.y);
    ctx.stroke();
    ctx.restore();

    // bottom: A(x) curve by sampling
    const gB = new GraphCanvas('c-ftc-bot', {
      xMin: 0, xMax: 3, yMin: 0, yMax: 10, padding: 30,
    });
    gB.render();
    const samples = 120;
    const ctxB = gB.ctx;
    ctxB.save();
    ctxB.strokeStyle = '#22d3ee';
    ctxB.lineWidth = 2.5;
    ctxB.beginPath();
    let first = true;
    const xs = [];
    const ys = [];
    for (let i = 0; i <= samples; i++) {
      const xx = (3 * i) / samples;
      const y = numericIntegral(ftcFn, 0, xx, 200);
      xs.push(xx); ys.push(y);
      if (xx > x) break;
      const p = gB.worldToCanvas(xx, y);
      if (first) { ctxB.moveTo(p.x, p.y); first = false; }
      else ctxB.lineTo(p.x, p.y);
    }
    ctxB.stroke();
    ctxB.restore();

    const currentArea = numericIntegral(ftcFn, 0, x, 800);
    gB.drawPoint(x, currentArea, { color: '#fb7185', radius: 5 });
    readFTC.innerHTML = `$x = ${x.toFixed(2)}$ &nbsp;·&nbsp; $A(x) = \\int_0^{${x.toFixed(2)}} f(t)\\,dt = ${currentArea.toFixed(4)}$`;
    renderLatex(readFTC);
  }

  // ── Completion ──
  function markCompleteIfNeeded() {
    const state = loadState();
    if (!state.lessonsCompleted.includes('integration')) {
      completeLesson('integration');
      addXP(40, 'เรียนจบ "ปริพันธ์"');
      fireConfetti(50);
    }
  }

  // ── Wire events ──
  function init() {
    // Riemann
    selR.addEventListener('change', renderRiemann);
    [slN, slA, slB].forEach(s => s.addEventListener('input', renderRiemann));
    modePills.forEach(p => p.addEventListener('click', () => {
      modePills.forEach(x => x.classList.remove('active'));
      p.classList.add('active');
      mode = p.dataset.mode;
      renderRiemann();
    }));
    document.getElementById('btn-converge').addEventListener('click', animateConverge);
    document.getElementById('btn-reset-n').addEventListener('click', () => {
      if (convergeAnim) { clearInterval(convergeAnim); convergeAnim = null; }
      slN.value = 4; renderRiemann();
    });

    // Anti
    selA.addEventListener('change', renderAnti);
    slC.addEventListener('input', renderAnti);

    // FTC
    slX.addEventListener('input', renderFTC);

    renderRiemann();
    renderLatex(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
