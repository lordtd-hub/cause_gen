'use strict';

// ── การประยุกต์ของอนุพันธ์ ──
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

  // ── Reusable: draw curve with a vertical marker at t ──
  function drawTimePlot(canvasId, evalFn, tMin, tMax, yMin, yMax, color, tMark) {
    const g = new GraphCanvas(canvasId, {
      xMin: tMin, xMax: tMax, yMin, yMax, padding: 26,
    });
    g.render();
    g.drawFunction(evalFn, color, { lineWidth: 2.5 });
    // vertical marker
    const pTop = g.worldToCanvas(tMark, yMax);
    const pBot = g.worldToCanvas(tMark, yMin);
    const ctx = g.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(245,158,11,.8)';
    ctx.setLineDash([4,4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pTop.x, pTop.y);
    ctx.lineTo(pBot.x, pBot.y);
    ctx.stroke();
    ctx.restore();
    // dot
    const yVal = evalFn(tMark);
    if (yVal !== null && isFinite(yVal)) g.drawPoint(tMark, yVal, { color, radius: 5 });
    return g;
  }

  // ═════════ APP A: Motion ═════════
  const MOTION_PRESETS = {
    parab:  { s: '20*x - 5*x^2',  v: '20 - 10*x',  a: '-10',       tMax: 4, yS: [-1, 22],  yV: [-22, 22],  yA: [-12, 2] },
    linear: { s: '2*x^2',         v: '4*x',        a: '4',         tMax: 4, yS: [0, 35],   yV: [0, 17],    yA: [0, 8] },
    bounce: { s: '5*sin(x)',      v: '5*cos(x)',   a: '-5*sin(x)', tMax: 6.28, yS: [-6, 6], yV: [-6, 6],   yA: [-6, 6] },
  };

  const selMotion = document.getElementById('motion-preset');
  const slT       = document.getElementById('sl-t');
  const valT      = document.getElementById('val-t');
  const readMot   = document.getElementById('motion-readout');
  const ball      = document.getElementById('motion-ball');
  const track     = ball.parentElement;
  let motionAnim = null;
  let motionXP_awarded = false;

  function currentMotion() {
    return MOTION_PRESETS[selMotion.value];
  }

  function renderMotion() {
    const m = currentMotion();
    const t = parseFloat(slT.value);
    slT.max = m.tMax;
    valT.textContent = t.toFixed(2);

    const sFn = makeEvalFn(m.s);
    const vFn = makeEvalFn(m.v);
    const aFn = makeEvalFn(m.a);

    drawTimePlot('c-motion-s', sFn, 0, m.tMax, m.yS[0], m.yS[1], '#8b5cf6', t);
    drawTimePlot('c-motion-v', vFn, 0, m.tMax, m.yV[0], m.yV[1], '#22d3ee', t);
    drawTimePlot('c-motion-a', aFn, 0, m.tMax, m.yA[0], m.yA[1], '#fb7185', t);

    // Ball position mapped to s range
    const sVal = sFn(t);
    const pct = Math.max(0, Math.min(1, (sVal - m.yS[0]) / (m.yS[1] - m.yS[0])));
    const trackW = track.clientWidth - 32;
    ball.style.left = (pct * trackW) + 'px';

    const vVal = vFn(t), aVal = aFn(t);
    readMot.innerHTML = `$t = ${t.toFixed(2)}$ &nbsp;·&nbsp; ` +
      `$s = ${sVal === null ? '–' : sVal.toFixed(3)}$ &nbsp;·&nbsp; ` +
      `$v = ${vVal === null ? '–' : vVal.toFixed(3)}$ &nbsp;·&nbsp; ` +
      `$a = ${aVal === null ? '–' : aVal.toFixed(3)}$`;
    renderLatex(readMot);
  }

  function playMotion() {
    if (motionAnim) return;
    const m = currentMotion();
    let t = parseFloat(slT.value);
    motionAnim = setInterval(() => {
      t += 0.04;
      if (t > m.tMax) {
        t = m.tMax;
        stopMotion();
        if (!motionXP_awarded) {
          motionXP_awarded = true;
          addXP(25, 'ดูความสัมพันธ์ s-v-a ครบ');
        }
      }
      slT.value = t;
      renderMotion();
    }, 40);
  }
  function stopMotion() {
    if (motionAnim) { clearInterval(motionAnim); motionAnim = null; }
  }

  selMotion.addEventListener('change', () => {
    slT.value = 0; motionXP_awarded = false; renderMotion();
  });
  slT.addEventListener('input', renderMotion);
  document.getElementById('btn-play').addEventListener('click', playMotion);
  document.getElementById('btn-stop').addEventListener('click', stopMotion);

  // ═════════ APP B: Tangent playground ═════════
  const selTan  = document.getElementById('tan-fn');
  const slX0    = document.getElementById('sl-x0');
  const valX0   = document.getElementById('val-x0');
  const readTan = document.getElementById('tan-readout');
  const traceChk= document.getElementById('tan-trace');

  const tanFns = [...DIFF_CATALOG.basic, ...DIFF_CATALOG.trans];
  tanFns.forEach((f, i) => {
    const opt = document.createElement('option');
    opt.value = i; opt.textContent = f.label;
    selTan.appendChild(opt);
  });
  let traceXPoints = []; // for derivative trail

  function currentTanFn() { return tanFns[parseInt(selTan.value || 0, 10)]; }

  function renderTan() {
    const fn = currentTanFn();
    const x0 = parseFloat(slX0.value);
    valX0.textContent = x0.toFixed(2);
    slX0.min = fn.xRange[0]; slX0.max = fn.xRange[1];

    const g = new GraphCanvas('c-tan', {
      xMin: fn.xRange[0], xMax: fn.xRange[1],
      yMin: fn.yRange[0], yMax: fn.yRange[1],
      padding: 40,
    });
    g.render();
    const evalFn = makeEvalFn(fn.expr);
    const evalDFn = makeEvalFn(fn.dexpr);
    g.drawFunction(evalFn, '#8b5cf6', { lineWidth: 2.5 });

    const slope = evalDFn(x0);
    if (slope !== null) g.drawTangent(x0, evalFn, slope, '#fb7185');

    // trace dots
    if (traceChk.checked && traceXPoints.length) {
      traceXPoints.forEach(xt => {
        const s = evalDFn(xt);
        if (s !== null) g.drawPoint(xt, s, { color: '#facc15', radius: 2.5 });
      });
    }

    const y0 = evalFn(x0);
    if (y0 !== null) g.drawPoint(x0, y0, { color: '#fb7185', radius: 6 });

    readTan.innerHTML =
      `ความชันที่ $x_0 = ${x0.toFixed(2)}$ &nbsp;·&nbsp; ` +
      `$f'(x_0) = ${slope === null ? '–' : slope.toFixed(4)}$ &nbsp;·&nbsp; ` +
      `<span class="text-muted text-small">สูตร: $\\dfrac{d}{dx}(${fn.katex}) = ${fn.dkatex}$</span>`;
    renderLatex(readTan);
  }

  selTan.addEventListener('change', () => { traceXPoints = []; renderTan(); });
  slX0.addEventListener('input', () => {
    if (traceChk.checked) traceXPoints.push(parseFloat(slX0.value));
    renderTan();
  });
  traceChk.addEventListener('change', () => {
    if (!traceChk.checked) traceXPoints = [];
    renderTan();
  });

  // ═════════ APP C: Optima ═════════
  const selOpt   = document.getElementById('opt-fn');
  const readOpt  = document.getElementById('opt-readout');

  function renderOpt() {
    const [fExpr, dExpr, d2Expr] = selOpt.value.split('|');
    const evalFn  = makeEvalFn(fExpr);
    const evalDFn = makeEvalFn(dExpr);
    const evalD2  = makeEvalFn(d2Expr);

    // Range
    const xMin = -4, xMax = 4;
    let yMin = Infinity, yMax = -Infinity;
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = xMin + (xMax - xMin) * i / N;
      const y = evalFn(x);
      if (y !== null && isFinite(y)) { if (y < yMin) yMin = y; if (y > yMax) yMax = y; }
    }
    if (!isFinite(yMin) || !isFinite(yMax)) { yMin = -5; yMax = 5; }
    const pad = Math.max(1, (yMax - yMin) * 0.12);

    const g = new GraphCanvas('c-opt', {
      xMin, xMax, yMin: yMin - pad, yMax: yMax + pad, padding: 40,
    });
    g.render();
    g.drawFunction(evalFn, '#8b5cf6', { lineWidth: 2.5 });
    // sign strip for f' under curve
    const ctx = g.ctx;
    const stripY = g.worldToCanvas(0, g.yMin).y - 12;
    const stripH = 8;
    for (let i = 0; i <= N; i++) {
      const x = xMin + (xMax - xMin) * i / N;
      const d = evalDFn(x);
      if (d === null) continue;
      const p = g.worldToCanvas(x, 0);
      ctx.save();
      ctx.fillStyle = d >= 0 ? 'rgba(52,211,153,.8)' : 'rgba(251,113,133,.8)';
      ctx.fillRect(p.x - 2, stripY, 4, stripH);
      ctx.restore();
    }

    // Find critical points by scanning sign change of f'
    const criticals = [];
    let prev = evalDFn(xMin);
    for (let i = 1; i <= N; i++) {
      const x = xMin + (xMax - xMin) * i / N;
      const cur = evalDFn(x);
      if (prev === null || cur === null) { prev = cur; continue; }
      if (prev * cur < 0) {
        // bisect for precision
        let lo = x - (xMax - xMin) / N, hi = x;
        for (let k = 0; k < 20; k++) {
          const m = (lo + hi) / 2;
          const fm = evalDFn(m);
          if (fm === null) break;
          if (prev * fm < 0) hi = m; else { lo = m; prev = fm; }
        }
        const cx = (lo + hi) / 2;
        const cy = evalFn(cx);
        const d2 = evalD2(cx);
        const type = d2 === null ? 'saddle' : (d2 > 0 ? 'min' : d2 < 0 ? 'max' : 'saddle');
        criticals.push({ x: cx, y: cy, type });
      }
      prev = cur;
    }
    // draw critical point markers
    criticals.forEach(c => {
      const color = c.type === 'max' ? '#facc15' : c.type === 'min' ? '#34d399' : '#94a3b8';
      g.drawPoint(c.x, c.y, { color, radius: 7 });
    });

    if (criticals.length === 0) {
      readOpt.innerHTML = 'ไม่พบจุดวิกฤตในช่วง [-4, 4]';
    } else {
      readOpt.innerHTML = 'จุดวิกฤต: ' + criticals.map(c => {
        const badge = c.type === 'max' ? '🟡 สูงสุด' : c.type === 'min' ? '🟢 ต่ำสุด' : '⚪ saddle';
        return `$(x \\approx ${c.x.toFixed(3)},\\ y \\approx ${c.y.toFixed(3)})$ ${badge}`;
      }).join(' &nbsp;·&nbsp; ');
    }
    renderLatex(readOpt);
  }

  selOpt.addEventListener('change', renderOpt);

  // ── Completion: award diff_apps XP on first full interaction with each app ──
  let appsSeen = new Set();
  function awardApp(key) {
    if (appsSeen.has(key)) return;
    appsSeen.add(key);
    addXP(25, 'ใช้แอป ' + key);
    if (appsSeen.size >= 3) {
      const state = loadState();
      if (!state.lessonsCompleted.includes('diff_apps')) {
        completeLesson('diff_apps');
        fireConfetti(60);
      }
    }
  }
  // Hook interactions
  document.getElementById('btn-play').addEventListener('click', () => awardApp('motion'));
  slX0.addEventListener('change', () => awardApp('tangent'));
  selOpt.addEventListener('change', () => awardApp('optima'));

  // ── Init ──
  function init() {
    renderMotion();
    renderTan();
    renderOpt();
    renderLatex(document.body);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
