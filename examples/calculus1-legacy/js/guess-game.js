'use strict';

// ── Guess-the-Limit Game ──
// 30-question bank, 10 randomly picked per round, 30s per question.
const QBANK = [
  // --- basic / polynomial / rational / root ---
  { type: 'mcq', katex: '\\lim_{x\\to 1}\\dfrac{x^2-1}{x-1}', options: ['0', '1', '2', 'ไม่มีค่า'], correct: 2,
    explain: 'แยก (x-1)(x+1)/(x-1) = x+1 → แทน x=1 ได้ 2' },
  { type: 'mcq', katex: '\\lim_{x\\to 2}\\dfrac{x^2-4}{x-2}', options: ['2', '4', '0', '∞'], correct: 1,
    explain: '(x-2)(x+2)/(x-2) = x+2 → x=2 ได้ 4' },
  { type: 'mcq', katex: '\\lim_{x\\to 3}(x^2-2x+1)', options: ['1', '4', '6', '9'], correct: 1,
    explain: 'ฟังก์ชันต่อเนื่อง แทน x=3 ตรงๆ: 9-6+1 = 4' },
  { type: 'tf',  katex: '\\lim_{x\\to 2}\\dfrac{1}{x-2} \\text{ หาค่าได้}', correct: false,
    explain: 'ลิมิตสองข้างไม่เท่ากัน (-∞ และ +∞) จึงหาค่าไม่ได้' },
  { type: 'fill', katex: '\\lim_{x\\to 0}\\dfrac{\\sqrt{x+4}-2}{x}', answer: 0.25, tolerance: 0.02,
    explain: 'คูณคอนจูเกต → 1/(√(x+4)+2) → 1/4 = 0.25' },
  { type: 'mcq', katex: '\\lim_{x\\to 1}\\dfrac{x^3-1}{x-1}', options: ['1', '2', '3', '∞'], correct: 2,
    explain: 'x³-1 = (x-1)(x²+x+1) → x²+x+1 ที่ x=1 = 3' },
  { type: 'mcq', katex: '\\lim_{x\\to \\infty}\\dfrac{3x^2+1}{5x^2-x}', options: ['0', '3/5', '1', '∞'], correct: 1,
    explain: 'หารด้วย x² ทุกตัว → 3/5' },
  { type: 'tf',  katex: '\\lim_{x\\to 2}\\dfrac{x^2-4}{x-2} = f(2) \\text{ โดย } f(x)=\\dfrac{x^2-4}{x-2}', correct: false,
    explain: 'f(2) ไม่นิยาม (0/0) แต่ลิมิตยังมีค่า 4' },
  { type: 'fill', katex: '\\lim_{x\\to 5}(2x-3)', answer: 7, tolerance: 0.01,
    explain: 'ฟังก์ชันต่อเนื่อง: 2(5)-3 = 7' },
  { type: 'mcq', katex: '\\lim_{x\\to 0}\\dfrac{x^2}{x}', options: ['0', '1', '∞', 'ไม่มีค่า'], correct: 0,
    explain: 'x²/x = x → x=0 ได้ 0' },

  // --- trig ---
  { type: 'mcq', katex: '\\lim_{x\\to 0}\\dfrac{\\sin x}{x}', options: ['0', '1', '∞', 'ไม่มีค่า'], correct: 1,
    explain: 'ลิมิตพื้นฐาน = 1 (ทฤษฎีบทการบีบ)' },
  { type: 'mcq', katex: '\\lim_{x\\to 0}\\dfrac{\\sin 2x}{x}', options: ['1/2', '1', '2', '4'], correct: 2,
    explain: '= 2·(sin 2x)/(2x) → 2·1 = 2' },
  { type: 'fill', katex: '\\lim_{x\\to 0}\\dfrac{\\sin 3x}{x}', answer: 3, tolerance: 0.01,
    explain: '3·(sin 3x)/(3x) → 3·1 = 3' },
  { type: 'mcq', katex: '\\lim_{x\\to 0}\\dfrac{1-\\cos x}{x}', options: ['-1', '0', '1', '∞'], correct: 1,
    explain: 'คูณคอนจูเกต → sin²x/(x(1+cos x)) → 1·0 = 0' },
  { type: 'mcq', katex: '\\lim_{x\\to 0}\\dfrac{\\tan x}{x}', options: ['0', '1', '2', '∞'], correct: 1,
    explain: '(sin x/x)·(1/cos x) → 1·1 = 1' },
  { type: 'tf',  katex: '\\lim_{x\\to 0}\\dfrac{\\sin x}{x^2} \\text{ หาค่าได้}', correct: false,
    explain: '≈ sin(x)/x² ≈ 1/x → ไม่จำกัด (ไม่มีค่า)' },
  { type: 'mcq', katex: '\\lim_{x\\to 0}\\dfrac{\\sin(5x)}{\\sin(2x)}', options: ['2/5', '1', '5/2', '10'], correct: 2,
    explain: '= (sin 5x/5x)·(2x/sin 2x)·(5/2) → 1·1·5/2 = 5/2' },
  { type: 'fill', katex: '\\lim_{x\\to 0}\\dfrac{\\sin(4x)}{2x}', answer: 2, tolerance: 0.01,
    explain: '= (sin 4x)/(4x)·(4/2) → 1·2 = 2' },

  // --- exp ---
  { type: 'mcq', katex: '\\lim_{x\\to 0}\\dfrac{e^x - 1}{x}', options: ['0', '1', 'e', '∞'], correct: 1,
    explain: 'สูตรพื้นฐาน (อนุพันธ์ของ eˣ ที่ x=0)' },
  { type: 'mcq', katex: '\\lim_{x\\to \\infty}\\left(1+\\tfrac{1}{x}\\right)^x', options: ['1', '2', 'e', '∞'], correct: 2,
    explain: 'นิยามของ e ≈ 2.71828' },
  { type: 'mcq', katex: '\\lim_{x\\to \\infty} e^{-x}', options: ['0', '1', '∞', '−∞'], correct: 0,
    explain: 'e^(-x) = 1/eˣ → 0 เมื่อ x → ∞' },
  { type: 'tf',  katex: '\\lim_{x\\to \\infty} e^x = \\infty', correct: true,
    explain: 'eˣ โตแบบเอ็กซ์โพเนนเชียล → ∞' },
  { type: 'fill', katex: '\\lim_{x\\to 0}\\dfrac{e^{2x}-1}{x}', answer: 2, tolerance: 0.02,
    explain: '= 2·(e^(2x)-1)/(2x) → 2·1 = 2' },
  { type: 'mcq', katex: '\\lim_{x\\to 0}\\dfrac{2^x-1}{x}', options: ['0', '1', 'ln 2', 'ln 3'], correct: 2,
    explain: 'สูตรทั่วไป: lim (aˣ-1)/x = ln a' },

  // --- log ---
  { type: 'mcq', katex: '\\lim_{x\\to 0}\\dfrac{\\ln(1+x)}{x}', options: ['0', '1', 'e', '∞'], correct: 1,
    explain: 'สูตรพื้นฐานของ ln' },
  { type: 'mcq', katex: '\\lim_{x\\to 0^+}\\ln x', options: ['0', '1', '−∞', '+∞'], correct: 2,
    explain: 'ln x → −∞ เมื่อ x → 0⁺' },
  { type: 'mcq', katex: '\\lim_{x\\to \\infty}\\dfrac{\\ln x}{x}', options: ['0', '1', 'e', '∞'], correct: 0,
    explain: 'x โตเร็วกว่า ln x มาก (L\'Hospital)' },
  { type: 'tf',  katex: '\\lim_{x\\to \\infty}\\ln x = \\infty', correct: true,
    explain: 'ln x เพิ่มไปเรื่อยๆ (แต่ช้ามาก)' },
  { type: 'fill', katex: '\\lim_{x\\to 0}\\dfrac{\\ln(1+3x)}{x}', answer: 3, tolerance: 0.02,
    explain: '= 3·ln(1+3x)/(3x) → 3·1 = 3' },
  { type: 'mcq', katex: '\\lim_{x\\to 1}\\dfrac{\\ln x}{x-1}', options: ['0', '1', 'e', '∞'], correct: 1,
    explain: 'ให้ u=x−1: ln(1+u)/u → 1' },
];

(function () {
  const SCREEN = {
    intro:   document.getElementById('screen-intro'),
    game:    document.getElementById('screen-game'),
    summary: document.getElementById('screen-summary'),
  };
  const qNum    = document.getElementById('q-num');
  const qTotal  = document.getElementById('q-total');
  const scoreEl = document.getElementById('score');
  const streakEl = document.getElementById('streak');
  const streakChip = document.getElementById('streak-chip');
  const qStem   = document.getElementById('q-stem');
  const qBody   = document.getElementById('q-body');
  const timerFill = document.getElementById('timer-fill');
  const feedback  = document.getElementById('q-feedback');
  const fbHead    = document.getElementById('fb-head');
  const fbBody    = document.getElementById('fb-body');
  const nextWrap  = document.getElementById('next-wrap');

  const ROUND_SIZE = 10;
  const TIME_PER_Q = 75; // seconds (increased so players can actually work out the limits)

  let round = [];
  let idx = 0;
  let score = 0;
  let streak = 0;
  let xpEarned = 0;
  let timerId = null;
  let timeLeft = TIME_PER_Q;
  let answered = false;

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

  function startGame() {
    round = shuffle(QBANK).slice(0, ROUND_SIZE);
    idx = 0;
    score = 0;
    streak = 0;
    xpEarned = 0;
    qTotal.textContent = ROUND_SIZE;
    incrementGame('guess');
    show(SCREEN.game);
    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    feedback.classList.remove('show', 'correct', 'wrong');
    nextWrap.style.display = 'none';

    const q = round[idx];
    qNum.textContent = idx + 1;
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    streakChip.classList.toggle('fire', streak >= 3);

    qStem.innerHTML = `\\(${q.katex} = \\;?\\)`;
    qBody.innerHTML = '';

    if (q.type === 'mcq') {
      const grid = document.createElement('div');
      grid.className = 'mcq-options';
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'mcq-btn';
        btn.innerHTML = opt;
        btn.addEventListener('click', () => submitMcq(i, btn));
        grid.appendChild(btn);
      });
      qBody.appendChild(grid);
    } else if (q.type === 'tf') {
      const grid = document.createElement('div');
      grid.className = 'mcq-options';
      grid.style.gridTemplateColumns = '1fr 1fr';
      ['✅ จริง', '❌ เท็จ'].forEach((label, i) => {
        const btn = document.createElement('button');
        btn.className = 'mcq-btn';
        btn.innerHTML = label;
        btn.addEventListener('click', () => submitTf(i === 0, btn));
        grid.appendChild(btn);
      });
      qBody.appendChild(grid);
    } else if (q.type === 'fill') {
      const wrap = document.createElement('div');
      wrap.className = 'fill-wrap';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'พิมพ์คำตอบเป็นตัวเลข';
      input.id = 'fill-input';
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.textContent = 'ตอบ';
      btn.addEventListener('click', () => submitFill(input.value));
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });
      wrap.appendChild(input);
      wrap.appendChild(btn);
      qBody.appendChild(wrap);
      setTimeout(() => input.focus(), 50);
    }

    // KaTeX render on this chunk
    renderLatex(SCREEN.game);

    // Timer
    timeLeft = TIME_PER_Q;
    timerFill.style.width = '100%';
    timerFill.classList.remove('warn', 'danger');
    clearInterval(timerId);
    timerId = setInterval(tickTimer, 100);
  }

  function tickTimer() {
    timeLeft -= 0.1;
    const pct = Math.max(0, (timeLeft / TIME_PER_Q) * 100);
    timerFill.style.width = pct + '%';
    if (pct < 40 && pct >= 20) timerFill.classList.add('warn');
    if (pct < 20) { timerFill.classList.remove('warn'); timerFill.classList.add('danger'); }
    if (timeLeft <= 0) {
      clearInterval(timerId);
      if (!answered) handleTimeout();
    }
  }

  function handleTimeout() {
    answered = true;
    streak = 0;
    recordAnswer(false);
    showFeedback(false, 'หมดเวลา ⏳');
  }

  function submitMcq(pickedIdx, btn) {
    if (answered) return;
    answered = true;
    clearInterval(timerId);
    const q = round[idx];
    const correct = pickedIdx === q.correct;
    markMcqButtons(q, btn, correct);
    finish(correct, q);
  }

  function submitTf(pickedTrue, btn) {
    if (answered) return;
    answered = true;
    clearInterval(timerId);
    const q = round[idx];
    const correct = pickedTrue === q.correct;
    btn.dataset.state = correct ? 'correct' : 'wrong';
    qBody.querySelectorAll('.mcq-btn').forEach((b, i) => {
      b.disabled = true;
      const isTrueBtn = i === 0;
      if (!correct && isTrueBtn === q.correct) b.dataset.state = 'correct';
    });
    finish(correct, q);
  }

  function submitFill(raw) {
    if (answered) return;
    const val = parseFloat(raw.replace(/[,\s]/g, ''));
    if (isNaN(val)) { return; }
    answered = true;
    clearInterval(timerId);
    const q = round[idx];
    const correct = Math.abs(val - q.answer) < (q.tolerance ?? 0.01);
    const input = document.getElementById('fill-input');
    if (input) {
      input.disabled = true;
      input.style.borderColor = correct ? 'var(--color-success)' : 'var(--color-danger)';
      input.style.color = correct ? 'var(--color-success)' : 'var(--color-danger)';
    }
    finish(correct, q);
  }

  function markMcqButtons(q, clickedBtn, isCorrect) {
    const btns = qBody.querySelectorAll('.mcq-btn');
    btns.forEach((b, i) => {
      b.disabled = true;
      if (i === q.correct) b.dataset.state = 'correct';
      else if (b === clickedBtn && !isCorrect) b.dataset.state = 'wrong';
    });
  }

  function finish(isCorrect, q) {
    recordAnswer(isCorrect);
    if (isCorrect) {
      streak += 1;
      const mult = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
      const timeBonus = Math.max(0, Math.floor(timeLeft / 8)); // up to ~+9 for early answers
      const gain = 20 * mult + timeBonus;
      score += gain;
      xpEarned += gain;
      addXP(gain, streak >= 3 ? `สตรีค ×${mult}!` : 'ตอบถูก');
      showFeedback(true, `+${gain} XP` + (mult > 1 ? ` (×${mult} สตรีค!)` : ''), q.explain);
    } else {
      streak = 0;
      showFeedback(false, 'ตอบผิด', q.explain);
    }
  }

  function showFeedback(correct, headText, explain) {
    feedback.classList.add('show', correct ? 'correct' : 'wrong');
    fbHead.innerHTML = (correct ? '✅ ' : '❌ ') + headText;
    let html = '';
    if (explain) html += `<div style="margin-bottom:.35rem;">💡 ${explain}</div>`;
    if (!correct) {
      const q = round[idx];
      let right;
      if (q.type === 'mcq')  right = q.options[q.correct];
      else if (q.type === 'tf') right = q.correct ? 'จริง' : 'เท็จ';
      else right = q.answer;
      html += `<div>คำตอบที่ถูกคือ: <strong>${right}</strong></div>`;
    }
    fbBody.innerHTML = html;
    nextWrap.style.display = '';

    // re-render KaTeX in feedback (in case explain has math)
    renderLatex(feedback);
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

  function next() {
    idx += 1;
    if (idx >= ROUND_SIZE) {
      endGame();
    } else {
      renderQuestion();
    }
  }

  function endGame() {
    clearInterval(timerId);
    show(SCREEN.summary);
    const state = loadState();
    const correctCount = Math.round(score / 20); // approximate
    document.getElementById('sum-big').textContent = `${score} คะแนน`;
    const msg = score >= 250 ? '🏆 สุดยอด!' :
                score >= 150 ? '🎯 เก่งมาก!' :
                score >= 80  ? '👍 พอใช้ ลองเล่นอีกครั้ง' :
                               '💪 สู้ๆ ลองใหม่';
    document.getElementById('sum-label').textContent = msg;
    document.getElementById('sum-reward').innerHTML = `⭐ +${xpEarned} XP`;
    document.getElementById('sum-detail').textContent =
      `ความแม่นยำรวมของคุณตอนนี้: ${getAccuracy(state)}% · เกมที่เล่นทั้งหมด: ${state.gamesPlayed.guess || 0}`;
    if (score >= 250) fireConfetti(80);
  }

  // Wire
  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-next').addEventListener('click', next);
  document.getElementById('btn-retry').addEventListener('click', startGame);
})();
