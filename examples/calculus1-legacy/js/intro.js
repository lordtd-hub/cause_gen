'use strict';

// ── Intro page: drag x toward a=2 for f(x) = (x²−4)/(x−2) ──
(function () {
  const A = 2;
  const L = 4;
  const exprStr = '(x^2 - 4) / (x - 2)';
  const evalFn = makeEvalFn(exprStr);

  const graph = new GraphCanvas('graph', {
    xMin: -1, xMax: 5,
    yMin: 0,  yMax: 7,
    padding: 38,
  });

  const slider  = document.getElementById('x-slider');
  const xVal    = document.getElementById('x-val');
  const rX      = document.getElementById('r-x');
  const rFx     = document.getElementById('r-fx');
  const rDx     = document.getElementById('r-dx');
  const rDfx    = document.getElementById('r-dfx');
  const pill    = document.getElementById('status-pill');
  const steps   = document.querySelectorAll('.steps-list li');
  const hint    = document.getElementById('hint');
  const reveal  = document.getElementById('reveal-card');

  let rewardGiven = false;
  let autoRaf = null;

  function fmt(n, d = 2) {
    if (!isFinite(n)) return '—';
    return Number(n).toFixed(d);
  }

  function draw(x) {
    graph.render();
    graph.drawVerticalLine(A, 'rgba(251,113,133,0.35)', true);
    graph.drawHorizontalLine(L, 'rgba(52,211,153,0.35)', true);

    // Draw f(x) = x+2 (simplified form), then a hole at (2, 4)
    graph.drawFunction((t) => t + 2, '#8b5cf6', { lineWidth: 2.5 });
    graph.drawHole(A, L, '#fb7185');

    // Marker point for current x
    const y = (Math.abs(x - A) < 1e-9) ? L : evalFn(x);
    if (y !== null && isFinite(y)) {
      graph.drawPoint(x, y, { color: '#facc15', radius: 7, label: `(${fmt(x)}, ${fmt(y)})` });
      // vertical guideline to x-axis
      const ctx = graph.ctx;
      ctx.save();
      ctx.strokeStyle = 'rgba(250,204,21,0.5)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      const p1 = graph.worldToCanvas(x, 0);
      const p2 = graph.worldToCanvas(x, y);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      // horizontal guideline to y-axis
      const p3 = graph.worldToCanvas(0, y);
      ctx.beginPath(); ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.stroke();
      ctx.restore();
    }

    // Mark a on x-axis (open circle color)
    const aPt = graph.worldToCanvas(A, 0);
    graph.ctx.save();
    graph.ctx.fillStyle = '#fb7185';
    graph.ctx.font = 'bold 12px Prompt, sans-serif';
    graph.ctx.textAlign = 'center';
    graph.ctx.fillText('a = 2', aPt.x, aPt.y + 18);
    graph.ctx.restore();

    // Mark L on y-axis
    const lPt = graph.worldToCanvas(0, L);
    graph.ctx.save();
    graph.ctx.fillStyle = '#34d399';
    graph.ctx.font = 'bold 12px Prompt, sans-serif';
    graph.ctx.textAlign = 'left';
    graph.ctx.fillText('L = 4', lPt.x + 6, lPt.y - 6);
    graph.ctx.restore();
  }

  function updateReadout(x) {
    const y  = (Math.abs(x - A) < 1e-9) ? L : evalFn(x);
    const dx  = Math.abs(x - A);
    const dfx = (y === null || !isFinite(y)) ? NaN : Math.abs(y - L);

    rX.textContent   = fmt(x);
    rFx.textContent  = fmt(y);
    rDx.textContent  = fmt(dx, 4);
    rDfx.textContent = fmt(dfx, 4);

    // Status pill + steps
    let stage;
    if (dx < 0.01)      stage = 'success';
    else if (dx < 0.1)  stage = 'closer';
    else if (dx < 0.5)  stage = 'close';
    else                stage = 'far';

    const labelMap = {
      far:     'ไกลจากจุด a',
      close:   'เริ่มเข้าใกล้ …',
      closer:  'ใกล้มาก!',
      success: '🎯 ชิดมาก! f(x) ≈ 4',
    };
    pill.className = 'status-pill ' + stage;
    pill.textContent = labelMap[stage];

    const order = ['far', 'close', 'closer', 'success'];
    const idx = order.indexOf(stage);
    steps.forEach(li => {
      li.classList.toggle('current', li.dataset.step === stage);
      li.style.opacity = order.indexOf(li.dataset.step) <= idx ? '1' : '0.55';
    });

    if (stage === 'success' && !rewardGiven) {
      rewardGiven = true;
      addXP(20, 'เข้าใกล้ลิมิต!');
      fireConfetti(50);
      reveal.style.display = '';
      reveal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      renderLatex(reveal);
    }
  }

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
    } else {
      setTimeout(() => renderLatex(el), 100);
    }
  }

  function setX(x, animate = false) {
    x = Math.max(-1, Math.min(5, x));
    slider.value = x;
    xVal.textContent = fmt(x);
    draw(x);
    updateReadout(x);
    hint.classList.add('hide');
  }

  function animateTo(target, fromDir) {
    cancelAnimationFrame(autoRaf);
    const duration = 2000;
    const start    = performance.now();
    const x0       = fromDir === 'left' ? -0.5 : 4.5;
    setX(x0);
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const x = x0 + (target - x0) * eased;
      setX(x);
      if (t < 1) autoRaf = requestAnimationFrame(tick);
    }
    autoRaf = requestAnimationFrame(tick);
  }

  function autoBoth() {
    cancelAnimationFrame(autoRaf);
    animateTo(2 - 1e-3, 'left');
    setTimeout(() => animateTo(2 + 1e-3, 'right'), 2200);
  }

  // Wire up
  slider.addEventListener('input', (e) => {
    cancelAnimationFrame(autoRaf);
    setX(parseFloat(e.target.value));
  });

  document.getElementById('btn-approach-left').addEventListener('click',  () => animateTo(2 - 1e-3, 'left'));
  document.getElementById('btn-approach-right').addEventListener('click', () => animateTo(2 + 1e-3, 'right'));
  document.getElementById('btn-auto').addEventListener('click', autoBoth);

  // Initial render (after DOM + defer scripts have run)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setX(0.5));
  } else {
    setX(0.5);
  }
})();
