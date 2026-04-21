'use strict';

// ── Match Game: graphs ↔ expressions, 6 pairs, 60s timer ──
(function () {
  const SCREEN = {
    intro:   document.getElementById('screen-intro'),
    game:    document.getElementById('screen-game'),
    summary: document.getElementById('screen-summary'),
  };

  const graphCol = document.getElementById('col-graph');
  const exprCol  = document.getElementById('col-expr');
  const matchedEl = document.getElementById('matched');
  const scoreEl   = document.getElementById('score');
  const timerFill = document.getElementById('timer-fill');

  const PAIR_COUNT = 6;
  const TIME_LIMIT = 180; // 3 minutes — enough time to read each expression and compute the limit

  let pairs = [];
  let selected = null;   // { card, fnId, kind }
  let score = 0;
  let xpEarned = 0;
  let matches = 0;
  let timerId = null;
  let timeLeft = TIME_LIMIT;

  function show(screen) {
    Object.values(SCREEN).forEach(el => el.style.display = 'none');
    screen.style.display = '';
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickPairs() {
    // Prefer functions with finite limit and canvas-friendly ranges
    const candidates = ALL_FUNCTIONS.filter(f =>
      isFinite(f.a) && f.L !== null && isFinite(f.L)
    );
    return shuffle(candidates).slice(0, PAIR_COUNT);
  }

  function renderBoard() {
    graphCol.innerHTML = '';
    exprCol.innerHTML  = '';

    const graphOrder = shuffle(pairs);
    const exprOrder  = shuffle(pairs);

    graphOrder.forEach((fn, i) => {
      const card = document.createElement('div');
      card.className = 'match-card';
      card.dataset.fnId = fn.id;
      card.dataset.kind = 'graph';
      card.innerHTML = `<canvas id="mc-g-${i}"></canvas>`;
      card.addEventListener('click', () => pick(card, fn.id, 'graph'));
      graphCol.appendChild(card);

      // draw mini graph
      requestAnimationFrame(() => drawMiniGraph(`mc-g-${i}`, fn));
    });

    exprOrder.forEach((fn) => {
      const card = document.createElement('div');
      card.className = 'match-card';
      card.dataset.fnId = fn.id;
      card.dataset.kind = 'expr';
      const aDisp = (fn.a === Infinity) ? '\\infty' : (fn.a === -Infinity ? '-\\infty' : fn.a);
      card.innerHTML = `<div class="expr">\\(\\displaystyle\\lim_{x\\to ${aDisp}} ${fn.katex}\\)</div>`;
      card.addEventListener('click', () => pick(card, fn.id, 'expr'));
      exprCol.appendChild(card);
    });

    renderLatex(exprCol);
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

  function drawMiniGraph(canvasId, fn) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const g = new GraphCanvas(canvas, {
      xMin: fn.xRange[0], xMax: fn.xRange[1],
      yMin: fn.yRange[0], yMax: fn.yRange[1],
      padding: 14,
    });
    g.render();
    const evalFn = makeEvalFn(fn.expr);
    g.drawFunction(evalFn, '#a78bfa', { lineWidth: 2 });
    if (fn.hole && fn.L !== null && isFinite(fn.L)) {
      g.drawHole(fn.a, fn.L, '#fb7185');
    }
    if (fn.asymptote !== undefined) g.drawVerticalAsymptote(fn.asymptote);
  }

  function pick(card, fnId, kind) {
    if (card.classList.contains('matched')) return;
    if (selected && selected.card === card) {
      card.classList.remove('selected');
      selected = null;
      return;
    }

    if (!selected) {
      card.classList.add('selected');
      selected = { card, fnId, kind };
      return;
    }

    // two cards picked
    if (selected.kind === kind) {
      // same column — swap selection
      selected.card.classList.remove('selected');
      card.classList.add('selected');
      selected = { card, fnId, kind };
      return;
    }

    const isMatch = selected.fnId === fnId;
    if (isMatch) {
      selected.card.classList.add('matched');
      card.classList.add('matched');
      selected.card.classList.remove('selected');
      matches += 1;
      const gain = 15;
      score += gain;
      xpEarned += gain;
      addXP(gain, 'จับคู่ถูก');
      recordAnswer(true);
      matchedEl.textContent = matches;
      scoreEl.textContent = score;
      selected = null;
      if (matches >= PAIR_COUNT) endGame(true);
    } else {
      const other = selected.card;
      card.classList.add('wrong');
      other.classList.add('wrong');
      score = Math.max(0, score - 3);
      scoreEl.textContent = score;
      recordAnswer(false);
      setTimeout(() => {
        card.classList.remove('wrong');
        other.classList.remove('wrong', 'selected');
      }, 500);
      selected = null;
    }
  }

  function startGame() {
    pairs = pickPairs();
    matches = 0;
    score = 0;
    xpEarned = 0;
    selected = null;
    matchedEl.textContent = '0';
    scoreEl.textContent = '0';
    incrementGame('match');
    show(SCREEN.game);
    renderBoard();

    timeLeft = TIME_LIMIT;
    timerFill.style.width = '100%';
    timerFill.classList.remove('warn', 'danger');
    clearInterval(timerId);
    timerId = setInterval(() => {
      timeLeft -= 0.1;
      const pct = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
      timerFill.style.width = pct + '%';
      if (pct < 40 && pct >= 20) timerFill.classList.add('warn');
      if (pct < 20) { timerFill.classList.remove('warn'); timerFill.classList.add('danger'); }
      if (timeLeft <= 0) { clearInterval(timerId); endGame(false); }
    }, 100);
  }

  function endGame(perfect) {
    clearInterval(timerId);
    show(SCREEN.summary);

    let bonus = 0;
    if (perfect) {
      bonus = 50;
      xpEarned += bonus;
      addXP(bonus, '🏆 จับครบทุกคู่!');
      fireConfetti(80);
    }

    document.getElementById('sum-big').textContent = `${matches} / ${PAIR_COUNT}`;
    document.getElementById('sum-label').textContent = perfect
      ? '🏆 จับครบทุกคู่ในเวลา!'
      : (matches >= 4 ? '👍 เกือบครบแล้ว ลองใหม่' : '💪 สู้ๆ ลองอีกรอบ');
    document.getElementById('sum-reward').innerHTML =
      `⭐ +${xpEarned} XP` + (bonus ? ` (โบนัส ${bonus})` : '');

    const state = loadState();
    document.getElementById('sum-detail').textContent =
      `เกมจับคู่ทั้งหมด: ${state.gamesPlayed.match || 0} · ความแม่นยำรวม: ${getAccuracy(state)}%`;
  }

  // Wire
  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-retry').addEventListener('click', startGame);
  document.getElementById('btn-quit').addEventListener('click', () => {
    clearInterval(timerId);
    endGame(false);
  });
})();
