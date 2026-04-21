'use strict';

// ── Lessons page: tabbed function explorer ──
(function () {
  const tabBar      = document.getElementById('tab-bar');
  const topicEl     = document.getElementById('topic-content');
  const summaryEl   = document.getElementById('summary-panel');
  const picker      = document.getElementById('fn-picker');
  const banner      = document.getElementById('completion-banner');
  const completionText = document.getElementById('completion-text');

  const fnTitle  = document.getElementById('fn-title');
  const fnExpr   = document.getElementById('fn-expr');
  const fnTech   = document.getElementById('fn-tech');
  const fnSteps  = document.getElementById('fn-steps');
  const fnAnswer = document.getElementById('fn-answer');
  const fnDomain = document.getElementById('fn-domain');
  const fnHint   = document.getElementById('fn-hint');

  let graph = null;
  let currentTopic = 'basic';
  let currentFn = null;
  const seenFnPerTopic = {}; // topic → Set of viewed fn ids (in-session)

  const TOPIC_SUMMARY = {
    basic:
      'ฟังก์ชันพหุนาม ตรรกยะ และฟังก์ชันที่มีราก หัวใจคือเทคนิค ' +
      '<strong>แยกตัวประกอบ</strong> และ <strong>คูณคอนจูเกต</strong> ' +
      'เพื่อจัดการรูป 0/0 สังเกตว่ากราฟที่มี "รู" ยังสามารถมีลิมิตได้ ' +
      'ถึงแม้ฟังก์ชันจะไม่นิยามที่ x=a',
    trig:
      'ลิมิตตรีโกณมิติเด่นๆ เช่น $\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1$ ' +
      'มาจากทฤษฎีบทการบีบ (Squeeze) ใช้ร่วมกับเทคนิคแยกหรือเปลี่ยนตัวแปร ' +
      'เช่น $\\sin(2x)/x = 2\\cdot\\sin(2x)/(2x) \\to 2$',
    exp:
      'ลิมิตพื้นฐาน $\\lim_{x\\to 0}(e^x-1)/x = 1$ เป็นสูตรสำคัญ และนิยามของ $e$: ' +
      '$\\lim_{n\\to\\infty}(1+1/n)^n = e \\approx 2.71828$ ใช้บ่อยในดอกเบี้ยทบต้น ' +
      'และการเติบโตทางชีววิทยา',
    log:
      'ลอการิทึมเป็น "ฟังก์ชันผกผัน" ของเอ็กซ์โพเนนเชียล ' +
      '$\\lim_{x\\to 0}\\frac{\\ln(1+x)}{x}=1$ ' +
      'ส่วน $\\ln x$ โตช้ามากเทียบกับ $x$ เช่น $\\lim_{x\\to\\infty}\\frac{\\ln x}{x}=0$',
  };

  function renderTabs() {
    tabBar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.topic === currentTopic);
    });
  }

  function isTopicCompleted(topic) {
    const state = loadState();
    return state.lessonsCompleted.includes(topic);
  }

  function renderPicker() {
    picker.innerHTML = '';
    const fns = FN_CATALOG[currentTopic] || [];
    fns.forEach((f, i) => {
      const el = document.createElement('button');
      el.className = 'fn-chip' + (i === 0 ? ' active' : '');
      el.textContent = f.label;
      el.addEventListener('click', () => {
        picker.querySelectorAll('.fn-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        selectFn(f);
      });
      picker.appendChild(el);
    });
    if (fns.length > 0) selectFn(fns[0]);
  }

  function selectFn(fn) {
    currentFn = fn;

    // Canvas (re-create so viewport options apply cleanly)
    graph = new GraphCanvas('lesson-graph', {
      xMin: fn.xRange[0], xMax: fn.xRange[1],
      yMin: fn.yRange[0], yMax: fn.yRange[1],
      padding: 36,
    });
    graph.render();
    const evalFn = makeEvalFn(fn.expr);
    graph.drawFunction(evalFn, '#8b5cf6', { lineWidth: 2.5 });
    if (fn.hole && fn.L !== null && isFinite(fn.L)) {
      graph.drawHole(fn.a, fn.L, '#fb7185');
    }
    if (fn.asymptote !== undefined) {
      graph.drawVerticalAsymptote(fn.asymptote);
    }
    if (fn.L !== null && isFinite(fn.L) && isFinite(fn.a)) {
      graph.drawPoint(fn.a, fn.L, { open: fn.hole, color: fn.hole ? '#fb7185' : '#34d399', radius: 5 });
    }

    // Info card
    fnTitle.innerHTML  = `📈 \\(${fn.katex}\\)`;
    fnExpr.innerHTML   = `\\(\\displaystyle ${fn.katex}\\)`;
    fnTech.textContent = fn.technique;

    const aDisp = (fn.a === Infinity) ? '\\infty' : (fn.a === -Infinity ? '-\\infty' : fn.a);
    fnSteps.innerHTML = fn.steps.map((s, i) =>
      `<div class="step-row">
        <span style="color:var(--color-accent2); font-weight:700; margin-right:.5rem;">${i+1}.</span>
        \\(${s}\\)
      </div>`
    ).join('');

    let answerText;
    if (fn.L === null) answerText = 'ลิมิตหาค่าไม่ได้ (DNE)';
    else if (fn.L === Infinity) answerText = '+∞ (โตไม่จำกัด)';
    else if (fn.L === -Infinity) answerText = '−∞';
    else answerText = `L = ${formatNumber(fn.L)}`;
    fnAnswer.innerHTML = `🎯 \\(\\displaystyle\\lim_{x\\to ${aDisp}} ${fn.katex}\\) = <strong>${answerText}</strong>`;

    fnDomain.textContent = domainHint(fn);
    fnHint.innerHTML     = topicHintHtml(fn);

    // Track view
    if (!seenFnPerTopic[currentTopic]) seenFnPerTopic[currentTopic] = new Set();
    seenFnPerTopic[currentTopic].add(fn.id);

    // Completion: viewed all functions in topic
    const all = (FN_CATALOG[currentTopic] || []).length;
    const viewed = seenFnPerTopic[currentTopic].size;
    if (viewed >= all && !isTopicCompleted(currentTopic)) {
      completeLesson(currentTopic);
      addXP(30, `เรียนจบหัวข้อ "${TOPIC_LABELS[currentTopic]}"`);
      fireConfetti(40);
      showBanner(`🎉 เรียนจบหัวข้อ "${TOPIC_LABELS[currentTopic]}" แล้ว (+30 XP)`);
    } else if (isTopicCompleted(currentTopic)) {
      showBanner(`✅ หัวข้อ "${TOPIC_LABELS[currentTopic]}" เรียนจบแล้ว`);
    } else {
      banner.classList.remove('show');
    }

    // Re-render KaTeX (retry if auto-render still loading)
    renderLatex(topicEl);
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
      } catch (e) { /* ignore */ }
    } else {
      // KaTeX auto-render not yet loaded — retry shortly
      setTimeout(() => renderLatex(el), 100);
    }
  }

  function showBanner(text) {
    completionText.textContent = text;
    banner.classList.add('show');
  }

  function domainHint(fn) {
    if (fn.hole) return `ℹ️ ฟังก์ชันไม่นิยามที่ x = ${fn.a} (มีรู) แต่ลิมิตยังมีอยู่`;
    if (fn.asymptote !== undefined) return `⚠️ มีเส้นกำกับแนวดิ่งที่ x = ${fn.asymptote}`;
    if (fn.a === Infinity) return `ℹ️ พิจารณาพฤติกรรมเมื่อ x → ∞`;
    return 'ℹ️ ฟังก์ชันนิยามที่จุดนี้ — แทนค่าได้ตรงๆ';
  }

  function topicHintHtml(fn) {
    const tips = {
      poly1:  'แยก $(x-1)$ ออกทั้งเศษและส่วน แล้วตัดทอน จากนั้นแทนค่าได้เลย',
      poly2:  'เหมือน poly1 แต่เปลี่ยนค่า $a$ เป็น 2',
      root1:  'คูณทั้งเศษและส่วนด้วยคอนจูเกต $\\sqrt{x+4}+2$ เพื่อลบรากในเศษ',
      poly3:  'สูตร $x^3-1=(x-1)(x^2+x+1)$ ใช้บ่อย',
      rational: 'ลิมิตสองข้างไม่เท่ากัน (−∞ และ +∞) → ลิมิตหาค่าไม่ได้',
      sinc:   'สูตรเริ่มต้นของตรีโกณฯ จำไว้! ใช้ต่อยอดได้เยอะ',
      omcos:  'คูณคอนจูเกต $1+\\cos x$ เพื่อเปลี่ยนเป็น $\\sin^2 x$',
      tanc:   '$\\tan x = \\sin x / \\cos x$ และ $\\cos 0 = 1$',
      sin2:   'จัดรูปให้อยู่ในฟอร์ม $\\sin u / u$ โดยให้ $u=2x$',
      expc:   'สูตรพื้นฐานของ $e$ — จำเป็นมาก',
      e_def:  'นี่คือนิยามของ $e$ เลย ใช้ในดอกเบี้ยทบต้นต่อเนื่อง',
      ex:     'ฟังก์ชันเอ็กซ์โพเนนเชียลโตเร็วมาก',
      exp2:   'สูตรทั่วไป: $\\lim_{x\\to 0}(a^x-1)/x = \\ln a$',
      ln1x:   'สูตรคู่กับ $(e^x-1)/x$ — ใช้เมื่ออาร์กิวเมนต์เข้าใกล้ 1',
      lnx_inf:'$\\ln x$ โตช้ามาก แต่โตไปเรื่อยๆ',
      ax:     'เหมือน exp2 เปลี่ยนฐานเป็น 3',
      ln_ratio: '$\\ln x$ โตช้ากว่า $x$ — ใช้ L\'Hospital พิสูจน์ได้',
    };
    return tips[fn.id] || TOPIC_SUMMARY[currentTopic] || '';
  }

  function formatNumber(n) {
    if (n === Math.E) return 'e ≈ 2.71828';
    if (n === Math.LN2) return 'ln 2 ≈ 0.693';
    if (Math.abs(n - Math.log(3)) < 1e-9) return 'ln 3 ≈ 1.099';
    return Number(n.toFixed(4)).toString();
  }

  function selectTopic(topic) {
    currentTopic = topic;
    renderTabs();

    if (topic === 'summary') {
      topicEl.style.display = 'none';
      summaryEl.style.display = '';
      // Completion: mark summary done on entering
      if (!isTopicCompleted('summary')) {
        completeLesson('summary');
        addXP(30, 'อ่านสรุปเทคนิคครบแล้ว');
        fireConfetti(40);
        document.getElementById('sum-banner').classList.add('show');
        document.getElementById('sum-banner').querySelector('span:last-child').textContent = '+30 XP! ยอดเยี่ยม';
      } else {
        document.getElementById('sum-banner').classList.add('show');
      }
      // re-render KaTeX for summary
      renderLatex(summaryEl);
      return;
    }

    topicEl.style.display = '';
    summaryEl.style.display = 'none';
    renderPicker();
  }

  // Wire tabs
  tabBar.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => selectTopic(btn.dataset.topic));
  });

  // Initial — wait for KaTeX + auto-render (defer scripts) to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => selectTopic('basic'));
  } else {
    selectTopic('basic');
  }
})();
