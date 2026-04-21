'use strict';

// ── Differentiation lesson page ──
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
  const visitedTabs = new Set();

  function showTab(topic) {
    currentTopic = topic;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.topic === topic));
    panes.forEach(p => p.classList.toggle('active', p.id === `pane-${topic}`));
    visitedTabs.add(topic);
    if (topic === 'concept') renderConcept();
    if (topic === 'basic')   renderBasicPair();
    if (topic === 'trans')   renderTransPair();
    if (topic === 'summary') markCompleteIfNeeded();
    // rerender latex in newly shown pane
    const pane = document.getElementById(`pane-${topic}`);
    if (pane) renderLatex(pane);
  }
  tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.topic)));

  // ── Concept tab: secant → tangent animation ──
  const slH    = document.getElementById('sl-h');
  const valH   = document.getElementById('val-h');
  const selCFn = document.getElementById('concept-fn');
  const inpX0  = document.getElementById('concept-x0');
  const readC  = document.getElementById('concept-readout');

  // populate dropdown
  const conceptFns = [...DIFF_CATALOG.basic, ...DIFF_CATALOG.trans];
  conceptFns.forEach((f, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = f.label;
    selCFn.appendChild(opt);
  });

  let conceptAnim = null;

  function currentConceptFn() {
    return conceptFns[parseInt(selCFn.value || 0, 10)];
  }

  function logSliderToH(logVal) {
    // slider range -3..0 → h = 10^logVal (1.0 down to 0.001)
    return Math.pow(10, parseFloat(logVal));
  }

  function renderConcept() {
    const fn = currentConceptFn();
    const x0 = parseFloat(inpX0.value);
    const h  = logSliderToH(slH.value);
    valH.textContent = h.toFixed(4);

    const g = new GraphCanvas('c-concept', {
      xMin: fn.xRange[0], xMax: fn.xRange[1],
      yMin: fn.yRange[0], yMax: fn.yRange[1],
      padding: 40,
    });
    g.render();
    const evalFn = makeEvalFn(fn.expr);
    const evalDFn = makeEvalFn(fn.dexpr);
    g.drawFunction(evalFn, '#8b5cf6', { lineWidth: 2.5 });

    const trueSlope = evalDFn(x0);
    // tangent (red)
    if (trueSlope !== null && isFinite(trueSlope)) {
      g.drawTangent(x0, evalFn, trueSlope, '#fb7185');
    }
    // secant through (x0, f(x0)) and (x0+h, f(x0+h))
    g.drawSecant(x0, x0 + h, evalFn, '#22d3ee');

    const y0 = evalFn(x0);
    const y1 = evalFn(x0 + h);
    if (y0 !== null) g.drawPoint(x0, y0, { color: '#fb7185', radius: 5 });
    if (y1 !== null) g.drawPoint(x0 + h, y1, { color: '#22d3ee', radius: 4 });

    const slopeApprox = (y0 !== null && y1 !== null) ? (y1 - y0) / h : null;
    const slStr = slopeApprox === null ? '–' : slopeApprox.toFixed(4);
    const tStr  = trueSlope === null ? '–' : trueSlope.toFixed(4);
    readC.innerHTML =
      `$h = ${h.toFixed(4)}$ &nbsp;·&nbsp; ` +
      `$\\dfrac{f(x_0+h)-f(x_0)}{h} = ${slStr}$ &nbsp;·&nbsp; ` +
      `$f'(${x0}) = ${tStr}$` +
      `<div style="margin-top:.3rem; font-size:.9rem;" class="text-muted">อนุพันธ์จริงจากสูตร: $\\dfrac{d}{dx}(${fn.katex}) = ${fn.dkatex}$</div>`;
    renderLatex(readC);
  }

  function animateH() {
    if (conceptAnim) clearInterval(conceptAnim);
    let v = 0; // start h = 10^0 = 1.0
    slH.value = v;
    renderConcept();
    conceptAnim = setInterval(() => {
      v -= 0.06;
      if (v <= -3) {
        v = -3;
        clearInterval(conceptAnim); conceptAnim = null;
        markCompleteIfNeeded();
      }
      slH.value = v;
      renderConcept();
    }, 40);
  }

  // ── Basic tab: twin graphs ──
  const selBasic = document.getElementById('basic-fn');
  DIFF_CATALOG.basic.forEach((f, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = f.label;
    selBasic.appendChild(opt);
  });
  function renderBasicPair() {
    const fn = DIFF_CATALOG.basic[parseInt(selBasic.value || 0, 10)];
    drawTwinPair(fn, 'c-basic-f', 'c-basic-df', 'basic-f-cap', 'basic-df-cap');
  }

  // ── Trans tab: twin graphs ──
  const selTrans = document.getElementById('trans-fn');
  DIFF_CATALOG.trans.forEach((f, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = f.label;
    selTrans.appendChild(opt);
  });
  function renderTransPair() {
    const fn = DIFF_CATALOG.trans[parseInt(selTrans.value || 0, 10)];
    drawTwinPair(fn, 'c-trans-f', 'c-trans-df', 'trans-f-cap', 'trans-df-cap');
  }

  function drawTwinPair(fn, idF, idDf, capF, capDf) {
    const evalFn  = makeEvalFn(fn.expr);
    const evalDFn = makeEvalFn(fn.dexpr);
    const gF = new GraphCanvas(idF, {
      xMin: fn.xRange[0], xMax: fn.xRange[1],
      yMin: fn.yRange[0], yMax: fn.yRange[1],
      padding: 30,
    });
    gF.render();
    gF.drawFunction(evalFn, '#8b5cf6', { lineWidth: 2.5 });

    // Estimate derivative range (sample)
    let dMin = Infinity, dMax = -Infinity;
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const x = fn.xRange[0] + (fn.xRange[1] - fn.xRange[0]) * (i / N);
      const v = evalDFn(x);
      if (v !== null && isFinite(v)) {
        if (v < dMin) dMin = v;
        if (v > dMax) dMax = v;
      }
    }
    if (!isFinite(dMin) || !isFinite(dMax)) { dMin = -5; dMax = 5; }
    const pad = Math.max(0.5, (dMax - dMin) * 0.15);

    const gDF = new GraphCanvas(idDf, {
      xMin: fn.xRange[0], xMax: fn.xRange[1],
      yMin: dMin - pad, yMax: dMax + pad,
      padding: 30,
    });
    gDF.render();
    gDF.drawFunction(evalDFn, '#22d3ee', { lineWidth: 2.5 });

    document.getElementById(capF).innerHTML  = `\\(f(x) = ${fn.katex}\\)`;
    document.getElementById(capDf).innerHTML = `\\(f'(x) = ${fn.dkatex}\\)`;
    renderLatex(document.getElementById(capF));
    renderLatex(document.getElementById(capDf));
  }

  // ── Completion ──
  function markCompleteIfNeeded() {
    const state = loadState();
    if (!state.lessonsCompleted.includes('differentiation')) {
      completeLesson('differentiation');
      addXP(40, 'เรียนจบ "อนุพันธ์"');
      fireConfetti(50);
    }
  }

  // ── Wire events ──
  function init() {
    selCFn.addEventListener('change', renderConcept);
    inpX0.addEventListener('change', renderConcept);
    slH.addEventListener('input', renderConcept);
    document.getElementById('btn-animate-h').addEventListener('click', animateH);
    document.getElementById('btn-reset-h').addEventListener('click', () => {
      if (conceptAnim) { clearInterval(conceptAnim); conceptAnim = null; }
      slH.value = 0;
      renderConcept();
    });
    selBasic.addEventListener('change', renderBasicPair);
    selTrans.addEventListener('change', renderTransPair);

    renderConcept();
    renderLatex(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
