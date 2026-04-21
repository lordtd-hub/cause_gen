/* ============================================================
   MISSIONS CONTROLLER — OBE + Bloom-aligned homework
   Supports 6 task types: quick-mcq, match-graph, numeric,
                          analyze, evaluate, create
   ============================================================ */

(function () {
  'use strict';

  const MS_KEY = 'calc1_thai_missions';

  function loadMS() {
    try { return JSON.parse(localStorage.getItem(MS_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function saveMS(s) { localStorage.setItem(MS_KEY, JSON.stringify(s)); }
  function missionState(id) {
    const all = loadMS();
    return all[id] || { done:false, attempts:0, hintsUsed:0, confidence:0, score:0 };
  }
  function writeMissionState(id, patch) {
    const all = loadMS();
    all[id] = Object.assign(missionState(id), patch);
    saveMS(all);
  }

  function renderLatex(el) {
    if (!el) return;
    if (window.renderMathInElement) {
      try {
        renderMathInElement(el, {
          delimiters: [
            {left:'$$', right:'$$', display:true},
            {left:'\\(', right:'\\)', display:false},
            {left:'$',  right:'$',  display:false},
          ],
          throwOnError: false,
        });
      } catch (_) { /* ignore */ }
    } else {
      setTimeout(() => renderLatex(el), 100);
    }
  }

  /* ───────────────────────── Heatmap ───────────────────────── */

  function buildHeatmap(container, currentTopic) {
    container.innerHTML = '';

    // Header row
    const corner = document.createElement('div');
    corner.className = 'heatmap-head';
    corner.textContent = 'หัวข้อ / ระดับ';
    container.appendChild(corner);

    for (let lv = 1; lv <= 6; lv++) {
      const h = document.createElement('div');
      h.className = 'heatmap-head';
      h.innerHTML = `L${lv}<br>${BLOOM_LABELS[lv].name}`;
      container.appendChild(h);
    }

    // Rows
    MISSION_TOPICS.forEach(t => {
      const lbl = document.createElement('div');
      lbl.className = 'heatmap-row-label';
      lbl.textContent = t.label;
      container.appendChild(lbl);

      for (let lv = 1; lv <= 6; lv++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        if (!t.ready) {
          cell.classList.add('locked');
          cell.title = 'เร็วๆ นี้';
          cell.textContent = '•';
        } else {
          const m = (MISSION_BANK[t.id]?.missions || []).find(x => x.bloom === lv);
          if (m) {
            const st = missionState(m.id);
            if (st.done) { cell.classList.add('completed'); cell.textContent = '✓'; }
            else         { cell.classList.add('available'); cell.textContent = m.icon || '·'; }
            cell.title = m.title;
            cell.addEventListener('click', () => {
              const el = document.getElementById(m.id);
              if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
            });
          } else {
            cell.classList.add('locked');
          }
        }
        container.appendChild(cell);
      }
    });
  }

  /* ───────────────────────── Mission card shell ───────────────────────── */

  function makeCard(mission) {
    const st = missionState(mission.id);
    const card = document.createElement('section');
    card.className = 'mission-card';
    card.id = mission.id;
    if (st.done) card.classList.add('completed');

    card.innerHTML = `
      <div class="mission-status">${st.done ? '✅' : '⭕'}</div>
      <div class="mission-header">
        <div class="mission-icon">${mission.icon}</div>
        <div class="mission-headtext">
          <div class="mission-bloom lv${mission.bloom}">
            L${mission.bloom} · ${BLOOM_LABELS[mission.bloom].name} (${BLOOM_LABELS[mission.bloom].en})
          </div>
          <div class="mission-title">${mission.title}</div>
          <div class="mission-clo">${mission.clo}</div>
        </div>
      </div>

      <div class="rubric-bar">
        <div class="rb-title">📏 เกณฑ์การวัดผล (Rubric)</div>
        ${mission.rubric.map(r => `<div class="rb-item">✓ ${r}</div>`).join('')}
        <div class="rb-item" style="margin-top:.3rem; color:var(--color-accent3); font-weight:700;">
          ⭐ รางวัลเมื่อผ่าน: ${mission.xp} XP
        </div>
      </div>

      <div class="task-body" data-body></div>

      <div class="confidence-box">
        <label>💭 ก่อนส่ง — คุณมั่นใจในคำตอบแค่ไหน? <span class="conf-hint">(คลิกดาวเพื่อเลือก 1–5)</span></label>
        <div class="conf-stars" data-conf>
          ${[1,2,3,4,5].map(n => `
            <label class="star-btn" title="ระดับ ${n}">
              <input type="radio" name="conf-${mission.id}" value="${n}" />
              <span class="star-face">★</span>
              <span class="star-num">${n}</span>
            </label>
          `).join('')}
        </div>
        <div class="conf-legend">
          <strong>โบนัสการประเมินตนเอง (เมื่อผ่าน):</strong>
          5★ ×1.25 · 4★ ×1.15 · 3★ ×1.00 · 2★ ×1.10 · 1★ ×1.15
          <br>⚠ มั่นใจสูงแต่<strong>ไม่ผ่าน</strong> = สะท้อน "มิสแคลิเบรต" — ลองทบทวนอีกครั้ง
        </div>
      </div>

      <div class="toggle-box" data-hint></div>
      <div class="toggle-box" data-sol></div>
      <div class="fb-panel" data-fb></div>

      <div class="mission-actions">
        ${ mission.hint ? '<button class="btn btn-sm" data-act="hint">💡 ใบ้ (−30% XP)</button>' : '' }
        ${ mission.solution ? '<button class="btn btn-sm" data-act="sol">📖 ดูเฉลย</button>' : '' }
        <span class="spacer"></span>
        <span class="mission-meta-chip" data-chip>ยังไม่ได้ทำ</span>
        <button class="btn btn-primary" data-act="submit">✓ ส่งคำตอบ</button>
      </div>
    `;

    // confidence stars — native radio-driven (no fragile span-click)
    const confBtns   = card.querySelectorAll('[data-conf] .star-btn');
    const confRadios = card.querySelectorAll('[data-conf] input[type=radio]');
    let conf = st.confidence || 0;

    const paintStars = () => {
      confBtns.forEach((btn, i) => btn.classList.toggle('on', i < conf));
    };

    confRadios.forEach((r, i) => {
      if (conf && (i + 1) === conf) r.checked = true;
      r.addEventListener('change', () => {
        if (r.checked) { conf = parseInt(r.value, 10); paintStars(); }
      });
    });
    paintStars();
    card._getConf = () => conf;

    // hint / solution toggles
    const hintBox = card.querySelector('[data-hint]');
    const solBox  = card.querySelector('[data-sol]');
    if (mission.hint) hintBox.innerHTML = `<strong>💡 ใบ้:</strong> ${mission.hint}`;
    if (mission.solution) {
      solBox.innerHTML = '<strong>📖 เฉลย:</strong><ol>' +
        mission.solution.map(s => `<li>${s}</li>`).join('') + '</ol>';
    }

    let hintShown = false, solShown = false;
    card.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (act === 'hint') {
          hintBox.classList.toggle('show');
          if (!hintShown && hintBox.classList.contains('show')) {
            hintShown = true;
            writeMissionState(mission.id, { hintsUsed: (missionState(mission.id).hintsUsed || 0) + 1 });
            renderLatex(hintBox);
          }
        } else if (act === 'sol') {
          solBox.classList.toggle('show');
          if (!solShown && solBox.classList.contains('show')) {
            solShown = true;
            renderLatex(solBox);
          }
        } else if (act === 'submit') {
          card._onSubmit && card._onSubmit();
        }
      });
    });

    card._chip   = card.querySelector('[data-chip]');
    card._fbEl   = card.querySelector('[data-fb]');
    card._body   = card.querySelector('[data-body]');
    card._hintShown = () => hintShown;
    card._solShown = () => solShown;
    return card;
  }

  function showFeedback(card, pass, scoreText, detail, xpEarned) {
    const fb = card._fbEl;
    fb.className = 'fb-panel show ' + (pass ? 'pass' : 'fail');

    // Prefer the calibration-adjusted XP if markDone set it
    const finalXp = (pass && typeof card._awardedXp === 'number') ? card._awardedXp : xpEarned;
    // Calibration note (from markDone on pass, or compute here on fail)
    let calNote = card._calibrationNote || '';
    if (!pass) {
      const conf = card._getConf ? card._getConf() : 0;
      const info = calibrationInfo(conf, false);
      calNote = info.label;
    }

    fb.innerHTML =
      `<div class="fb-score">${pass ? '🎉 ผ่านเกณฑ์' : '❌ ยังไม่ผ่าน'} · ${scoreText}</div>` +
      `<div>${detail}</div>` +
      (calNote ? `<div style="margin-top:.3rem; font-size:.88rem; color:var(--color-muted);">${calNote}</div>` : '') +
      (finalXp > 0 ? `<div style="margin-top:.3rem; color:var(--color-accent3); font-weight:700;">+${finalXp} XP</div>` : '');
    renderLatex(fb);
  }

  function chipOf(mission, extra) {
    const st = missionState(mission.id);
    const parts = [];
    parts.push(`พยายาม: ${st.attempts || 0}`);
    if (st.hintsUsed) parts.push(`ใบ้: ${st.hintsUsed}`);
    if (st.confidence) parts.push(`มั่นใจ: ${'★'.repeat(st.confidence)}`);
    if (extra) parts.push(extra);
    return parts.join(' · ');
  }

  /* Calibration bonus — reward well-calibrated self-assessment.
     Returns { mult, label } where mult multiplies base XP on PASS.
       5★ (มั่นใจมาก) + PASS  → ×1.25 (well-calibrated confident)
       4★                    → ×1.15
       3★ (เฉยๆ)              → ×1.00 (neutral)
       2★                    → ×1.10 (unsure but succeeded — brave)
       1★                    → ×1.15 (very unsure, still passed)
       0★ (ไม่เลือก)          → ×1.00 (no metacognition bonus)
     On FAIL no XP is awarded anyway, so the multiplier isn't applied; but we
     return a 'miscalibration' flag for high-confidence failures to show a note. */
  function calibrationInfo(conf, pass) {
    if (!pass) {
      if (conf >= 4) return { mult:1, label:`⚠ มั่นใจสูง (${conf}★) แต่ยังไม่ผ่าน — ลองทบทวนแนวคิดอีกครั้ง` };
      if (conf >= 1) return { mult:1, label:`คุณเลือกมั่นใจ ${conf}★ — การประเมินตนเองค่อนข้างตรงกับผล` };
      return { mult:1, label:'' };
    }
    // pass
    if (conf === 5) return { mult:1.25, label:`✨ โบนัส ${conf}★ × 1.25 (มั่นใจสูง + ถูก = calibrated)` };
    if (conf === 4) return { mult:1.15, label:`✨ โบนัส ${conf}★ × 1.15` };
    if (conf === 3) return { mult:1.00, label:'' };
    if (conf === 2) return { mult:1.10, label:`💪 โบนัส ${conf}★ × 1.10 (ไม่มั่นใจแต่ผ่าน)` };
    if (conf === 1) return { mult:1.15, label:`💪 โบนัส ${conf}★ × 1.15 (กล้าลองทั้งที่ไม่มั่นใจ)` };
    return { mult:1, label:'' }; // 0 = didn't rate
  }

  function markDone(mission, card, finalScore, xp) {
    const prev = missionState(mission.id);
    const firstTime = !prev.done;
    const conf = card._getConf();
    const info = calibrationInfo(conf, true);
    const adjustedXp = Math.round(xp * info.mult);
    writeMissionState(mission.id, {
      done: true, score: Math.max(prev.score || 0, finalScore),
      confidence: conf,
      attempts: (prev.attempts || 0) + 1,
    });
    card.classList.add('completed');
    card.querySelector('.mission-status').textContent = '✅';
    // award XP once (with calibration bonus)
    if (firstTime && adjustedXp > 0 && typeof addXP === 'function') {
      addXP(adjustedXp, mission.title);
      if (typeof fireConfetti === 'function') fireConfetti(25);
    }
    card._calibrationNote = info.label;  // builders can show this in feedback
    card._awardedXp = adjustedXp;
    card._chip.textContent = chipOf(mission, 'เสร็จแล้ว');
  }

  /* ───────────────────────── Task: quick-mcq (M1) ───────────────────────── */

  function buildQuickMCQ(card, mission) {
    let idx = 0;
    const total = mission.cards.length;
    const picks = new Array(total).fill(-1);   // user's pick per question (no reveal)
    const body = card._body;
    let revealed = false;                       // becomes true on submit

    function renderQuestion() {
      const c = mission.cards[idx];
      body.innerHTML = `
        <div class="fc-progress">ข้อ ${idx+1} / ${total}${picks.filter(p=>p>=0).length ? ` · ตอบแล้ว ${picks.filter(p=>p>=0).length}/${total}` : ''}</div>
        <div class="fc-card">
          <div class="task-prompt">${c.q}</div>
          <div class="task-opts">
            ${c.opts.map((o, i) =>
              `<button class="task-opt${picks[idx]===i?' picked':''}" data-i="${i}">${o}</button>`
            ).join('')}
          </div>
          <div class="mcq-navrow">
            <button class="btn btn-sm" data-prev ${idx===0?'disabled':''}>◀ ก่อนหน้า</button>
            <span class="mcq-dots">
              ${picks.map((p,i) =>
                `<span class="mcq-dot${p>=0?' filled':''}${i===idx?' current':''}" data-jump="${i}">${i+1}</span>`
              ).join('')}
            </span>
            <button class="btn btn-sm" data-next ${idx===total-1?'disabled':''}>ถัดไป ▶</button>
          </div>
        </div>
      `;

      body.querySelectorAll('.task-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          picks[idx] = parseInt(btn.dataset.i, 10);
          body.querySelectorAll('.task-opt').forEach(x => x.classList.remove('picked'));
          btn.classList.add('picked');
          // auto-advance if not last; otherwise stay so user can revise
          if (idx < total - 1) {
            setTimeout(() => { idx++; renderQuestion(); }, 220);
          } else {
            renderQuestion(); // refresh dots
          }
        });
      });
      body.querySelector('[data-prev]').addEventListener('click', () => {
        if (idx > 0) { idx--; renderQuestion(); }
      });
      body.querySelector('[data-next]').addEventListener('click', () => {
        if (idx < total - 1) { idx++; renderQuestion(); }
      });
      body.querySelectorAll('.mcq-dot').forEach(d => {
        d.addEventListener('click', () => {
          idx = parseInt(d.dataset.jump, 10); renderQuestion();
        });
      });
      renderLatex(body);
    }

    function renderReview(correctCount) {
      const rows = mission.cards.map((c, i) => {
        const p = picks[i];
        const ok = p === c.ans;
        return `
          <div class="review-row ${ok?'ok':'bad'}">
            <div class="rr-head">${ok?'✅':'❌'} ข้อ ${i+1}</div>
            <div class="rr-q">${c.q}</div>
            <div class="rr-line">
              <span class="rr-label">คุณเลือก:</span>
              <span class="rr-pick ${ok?'ok':'bad'}">${p>=0 ? c.opts[p] : '— ไม่ได้ตอบ —'}</span>
            </div>
            ${ok ? '' : `<div class="rr-line">
              <span class="rr-label">เฉลย:</span>
              <span class="rr-pick ok">${c.opts[c.ans]}</span>
            </div>`}
          </div>`;
      }).join('');
      body.innerHTML = `
        <div class="review-panel">
          <div class="review-head">สรุปผล — ตอบถูก ${correctCount} / ${total} ข้อ</div>
          ${rows}
        </div>
      `;
      renderLatex(body);
    }

    card._onSubmit = () => {
      if (revealed) return; // already submitted, ignore duplicate clicks

      const unanswered = picks.filter(p => p < 0).length;
      if (unanswered > 0) {
        showFeedback(card, false,
          `ยังไม่ได้ตอบ ${unanswered} ข้อ`,
          'กรุณาตอบให้ครบทุกข้อก่อนส่งคำตอบ',
          0);
        return;
      }

      // Compute correctness NOW (first time user sees the reveal)
      let correctCount = 0;
      mission.cards.forEach((c, i) => { if (picks[i] === c.ans) correctCount++; });

      revealed = true;
      renderReview(correctCount);

      const need = mission.passThreshold || Math.max(1, total - 1);
      const pass = correctCount >= need;
      writeMissionState(mission.id, { attempts: (missionState(mission.id).attempts || 0) + 1 });
      let xp = 0;
      if (pass) {
        xp = Math.round(mission.xp * (card._hintShown() ? 0.7 : 1));
        markDone(mission, card, correctCount, xp);
      } else {
        card._chip.textContent = chipOf(mission);
      }
      showFeedback(card, pass,
        `${correctCount} / ${total} ข้อ`,
        pass ? 'คุณจำได้แม่นแล้ว' : `ต้องได้อย่างน้อย ${need} ข้อถึงผ่าน`,
        xp);

      // Offer a fresh round after review
      const fb = card._fbEl;
      if (fb) {
        const again = document.createElement('div');
        again.style.marginTop = '.5rem';
        again.innerHTML = '<button class="btn btn-sm" data-restart>🔄 เล่นรอบใหม่ (สุ่มข้อใหม่)</button>';
        fb.appendChild(again);
        again.querySelector('[data-restart]').addEventListener('click', () => {
          // Rebuild the mission (pool re-sample) by re-rendering the page's topic
          location.reload();
        });
      }
    };

    renderQuestion();
  }

  /* ───────────────────────── Task: match-graph (M2) ───────────────────────── */

  function buildMatchGraph(card, mission) {
    const body = card._body;
    // Shuffle graphs and labels
    const graphs = [...mission.graphs].sort(() => Math.random() - 0.5);
    const labels = [...mission.labels].sort(() => Math.random() - 0.5);
    const pairs = {}; // graphId → labelId

    body.innerHTML = `
      <div class="task-prompt">คลิกกราฟหนึ่งอันแล้วคลิกป้ายที่ตรงกัน (จับคู่ให้ครบ 4 คู่)</div>
      <div class="match-board" data-graphs>
        ${graphs.map(g => `
          <div class="match-tile" data-kind="graph" data-id="${g.id}">
            <canvas id="mc-${g.id}" width="260" height="160"></canvas>
          </div>`).join('')}
      </div>
      <div class="match-board" data-labels style="margin-top:.5rem;">
        ${labels.map(l => `
          <div class="match-tile" data-kind="label" data-id="${l.id}" data-linkkind="${l.kind}">
            <div class="ml">${l.text}</div>
          </div>`).join('')}
      </div>
    `;

    // Draw graphs
    graphs.forEach(g => {
      if (typeof GraphCanvas !== 'function') return;
      try {
        const gc = new GraphCanvas('mc-' + g.id, {
          xMin:g.xRange[0], xMax:g.xRange[1],
          yMin:g.yRange[0], yMax:g.yRange[1],
          padding: 18,
        });
        gc.render();
        const fn = makeEvalFn(g.expr);
        if (g.asymptote != null) gc.drawVerticalAsymptote(g.asymptote, '#fb7185');
        gc.drawFunction(fn, '#8b5cf6', { lineWidth: 2 });
        if (g.hole) gc.drawHole(g.hole.x, g.hole.y, '#8b5cf6');
      } catch (_) { /* draw error, skip */ }
    });

    // Selection state
    let selectedGraph = null;
    const allTiles = body.querySelectorAll('.match-tile');

    function clearSelection() {
      allTiles.forEach(t => {
        if (!t.classList.contains('paired')) t.classList.remove('selected');
      });
      selectedGraph = null;
    }

    allTiles.forEach(t => {
      t.addEventListener('click', () => {
        if (t.classList.contains('paired')) return;
        if (t.dataset.kind === 'graph') {
          // single-select graph
          body.querySelectorAll('.match-tile[data-kind="graph"]').forEach(x => {
            if (!x.classList.contains('paired')) x.classList.remove('selected');
          });
          t.classList.add('selected');
          selectedGraph = t;
        } else if (t.dataset.kind === 'label') {
          if (!selectedGraph) return;
          // pair
          const gid = selectedGraph.dataset.id;
          const lid = t.dataset.id;
          pairs[gid] = lid;
          selectedGraph.classList.remove('selected');
          selectedGraph.classList.add('paired');
          t.classList.add('paired');
          clearSelection();
        }
      });
    });

    card._onSubmit = () => {
      let correct = 0;
      graphs.forEach(g => {
        const lid = pairs[g.id];
        if (!lid) return;
        const lab = mission.labels.find(l => l.id === lid);
        if (lab && lab.kind === g.kind) correct++;
      });
      const total = graphs.length;
      const pass = correct === total;
      writeMissionState(mission.id, { attempts: (missionState(mission.id).attempts || 0) + 1 });
      let xp = 0;
      if (pass) {
        xp = mission.xp;
        markDone(mission, card, correct, xp);
      } else {
        card._chip.textContent = chipOf(mission);
      }
      showFeedback(card, pass,
        `ถูก ${correct} / ${total} คู่`,
        pass ? 'จับคู่ได้ถูกต้องหมด!' : 'ลองดูลักษณะของกราฟอีกครั้ง (รู / กระโดด / เส้นกำกับ)', xp);
    };
  }

  /* ───────────────────────── Task: numeric (M3) ───────────────────────── */

  function buildNumeric(card, mission) {
    const body = card._body;
    body.innerHTML = `
      <div class="task-prompt">${mission.prompt}</div>
      <input class="task-input" type="number" step="any" placeholder="พิมพ์ตัวเลขคำตอบ" data-ans />
    `;
    renderLatex(body);

    card._onSubmit = () => {
      const v = parseFloat(body.querySelector('[data-ans]').value);
      if (isNaN(v)) {
        showFeedback(card, false, 'ยังไม่ได้พิมพ์ตัวเลข', 'กรุณาใส่ค่าตัวเลข', 0);
        return;
      }
      const pass = Math.abs(v - mission.answer) <= mission.tolerance;
      writeMissionState(mission.id, { attempts: (missionState(mission.id).attempts || 0) + 1 });
      let xp = 0;
      if (pass) {
        xp = Math.round(mission.xp * (card._hintShown() ? 0.7 : 1) * (card._solShown() ? 0.5 : 1));
        markDone(mission, card, 3, xp);
      } else {
        card._chip.textContent = chipOf(mission);
      }
      showFeedback(card, pass,
        `คำตอบของคุณ: ${v}`,
        pass ? `ถูกต้อง! $k = ${mission.answer}$` :
               `ยังไม่ถูก — ลองตรวจการแทนค่าลิมิตทั้งสองข้างอีกครั้ง`,
        xp);
    };
  }

  /* ───────────────────────── Task: analyze (M4) ───────────────────────── */

  function buildAnalyze(card, mission) {
    const body = card._body;
    const P = mission.primary, S = mission.secondary;
    body.innerHTML = `
      <div class="task-prompt">${mission.prompt}</div>

      <div style="margin-top:.7rem; font-weight:700;">${P.question}</div>
      <div class="task-opts" data-primary>
        ${P.opts.map((o, i) => `<button class="task-opt" data-i="${i}">${o}</button>`).join('')}
      </div>

      <div style="margin-top:.9rem; font-weight:700;">${S.question}</div>
      <div data-secondary>
        ${S.opts.map((o, i) =>
          `<label class="check-row"><input type="checkbox" data-j="${i}"/><span>${o}</span></label>`
        ).join('')}
      </div>
    `;
    renderLatex(body);

    let picked = -1;
    body.querySelectorAll('[data-primary] .task-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        picked = parseInt(btn.dataset.i, 10);
        body.querySelectorAll('[data-primary] .task-opt').forEach(x => x.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    card._onSubmit = () => {
      const set = new Set();
      body.querySelectorAll('[data-secondary] input:checked').forEach(cb => set.add(parseInt(cb.dataset.j,10)));
      const correctSet = new Set(S.correctSet);
      const primOK = picked === P.ans;
      const secOK  = set.size === correctSet.size && [...set].every(x => correctSet.has(x));
      const pass = primOK && secOK;
      writeMissionState(mission.id, { attempts: (missionState(mission.id).attempts || 0) + 1 });
      let xp = 0;
      if (pass) {
        xp = mission.xp;
        markDone(mission, card, 2, xp);
      } else {
        card._chip.textContent = chipOf(mission);
      }
      const detail =
        `ประเภท: ${primOK ? '✅' : '❌'} &nbsp;·&nbsp; เหตุผล: ${secOK ? '✅' : '❌'}` +
        (pass ? '' : '<br>คำใบ้: พิจารณาลิมิตซ้าย/ขวาแยก และสถานะของ $f(1)$');
      showFeedback(card, pass, pass ? 'เก่งมาก' : 'ยังไม่ครบ', detail, xp);
    };
  }

  /* ───────────────────────── Task: evaluate (M5) ───────────────────────── */

  function buildEvaluate(card, mission) {
    const body = card._body;
    body.innerHTML = `
      <div class="task-prompt">${mission.prompt}</div>
      <div class="step-list" data-steps>
        ${mission.steps.map((s, i) =>
          `<div class="step-item" data-i="${i}">
             <span class="step-num">#${i+1}</span>
             <div>${s.line}</div>
           </div>`
        ).join('')}
      </div>
      <div style="margin-top:.7rem; display:none;" data-fix-wrap>
        <div style="font-weight:700;">${mission.fixQuestion}</div>
        <div class="task-opts" data-fix>
          ${mission.fixOpts.map((o, i) => `<button class="task-opt" data-j="${i}">${o}</button>`).join('')}
        </div>
      </div>
    `;
    renderLatex(body);

    let pickedLine = -1, pickedFix = -1;
    body.querySelectorAll('[data-steps] .step-item').forEach(el => {
      el.addEventListener('click', () => {
        pickedLine = parseInt(el.dataset.i, 10);
        body.querySelectorAll('[data-steps] .step-item').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
        body.querySelector('[data-fix-wrap]').style.display = '';
      });
    });
    body.querySelectorAll('[data-fix] .task-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        pickedFix = parseInt(btn.dataset.j, 10);
        body.querySelectorAll('[data-fix] .task-opt').forEach(x => x.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    card._onSubmit = () => {
      if (pickedLine < 0) {
        showFeedback(card, false, 'ยังไม่ได้เลือกบรรทัด', 'คลิกบรรทัดที่คิดว่าผิดก่อน', 0);
        return;
      }
      const lineOK = pickedLine === mission.wrongLine;
      const fixOK  = pickedFix === mission.fixAns;
      const pass = lineOK && fixOK;
      writeMissionState(mission.id, { attempts: (missionState(mission.id).attempts || 0) + 1 });

      // color steps
      body.querySelectorAll('[data-steps] .step-item').forEach((el, i) => {
        el.classList.remove('selected', 'correct', 'wrong');
        if (i === mission.wrongLine) el.classList.add('correct');
        if (i === pickedLine && i !== mission.wrongLine) el.classList.add('wrong');
      });

      let xp = 0;
      if (pass) {
        xp = mission.xp;
        markDone(mission, card, 2, xp);
      } else {
        card._chip.textContent = chipOf(mission);
      }
      const detail =
        `ชี้บรรทัด: ${lineOK ? '✅' : '❌'} &nbsp;·&nbsp; การแก้ไข: ${fixOK ? '✅' : '❌'}` +
        (pass ? '' : '<br>การคิดแบบ "$0/0 = 0$" เป็นการเข้าใจผิดที่พบบ่อย');
      showFeedback(card, pass, pass ? 'ตาเฉียบ!' : 'ยังไม่ใช่', detail, xp);
    };
  }

  /* ───────────────────────── Task: create (M6) ───────────────────────── */

  function buildCreate(card, mission) {
    const body = card._body;
    body.innerHTML = `
      <div class="task-prompt">${mission.prompt}</div>
      <input class="task-input" type="text" placeholder="${mission.placeholder}" data-expr />
      <div style="margin-top:.5rem; display:flex; gap:.5rem; flex-wrap:wrap;">
        <button class="btn btn-sm" data-example>💭 เห็นตัวอย่างโครง</button>
        <button class="btn btn-sm" data-test>🔬 ตรวจโดยไม่ส่ง</button>
      </div>
      <div class="create-checks" data-checks>
        ${mission.checks.map(c =>
          `<div class="cc-item" data-cid="${c.id}">
             <span class="cc-icon pending">?</span>
             <span>${c.label}</span>
           </div>`
        ).join('')}
      </div>
    `;
    renderLatex(body);

    const input = body.querySelector('[data-expr]');

    body.querySelector('[data-example]').addEventListener('click', () => {
      if (mission.example) input.value = mission.example;
    });

    function runChecks() {
      const expr = input.value.trim();
      const results = {};
      if (!expr) {
        mission.checks.forEach(c => { results[c.id] = 'pending'; });
        paintChecks(results); return null;
      }
      let fn = null;
      try {
        const compiled = math.compile(expr);
        fn = (x) => {
          try {
            const v = compiled.evaluate({ x });
            return (typeof v === 'number' && !isNaN(v)) ? v : null;
          } catch (_) { return null; }
        };
      } catch (_) {
        mission.checks.forEach(c => { results[c.id] = 'fail'; });
        paintChecks(results); return null;
      }
      mission.checks.forEach(c => { results[c.id] = c.test(fn) ? 'pass' : 'fail'; });
      paintChecks(results);
      return results;
    }

    function paintChecks(results) {
      mission.checks.forEach(c => {
        const item = body.querySelector(`[data-cid="${c.id}"]`);
        if (!item) return;
        const icon = item.querySelector('.cc-icon');
        icon.classList.remove('pending', 'pass', 'fail');
        const s = results[c.id] || 'pending';
        icon.classList.add(s);
        icon.textContent = s === 'pass' ? '✓' : s === 'fail' ? '✗' : '?';
      });
    }

    body.querySelector('[data-test]').addEventListener('click', runChecks);

    card._onSubmit = () => {
      const results = runChecks();
      if (!results) {
        showFeedback(card, false, 'expression ว่าง หรือพิมพ์ผิดรูปแบบ', 'ลองใช้รูปแบบ math.js เช่น (x^2)/(x-3)', 0);
        return;
      }
      const passCount = Object.values(results).filter(s => s === 'pass').length;
      const total = mission.checks.length;
      const pass = passCount === total;
      writeMissionState(mission.id, { attempts: (missionState(mission.id).attempts || 0) + 1 });
      let xp = 0;
      if (pass) {
        xp = Math.round(mission.xp * (card._hintShown() ? 0.7 : 1));
        markDone(mission, card, passCount, xp);
      } else {
        card._chip.textContent = chipOf(mission);
      }
      showFeedback(card, pass,
        `ผ่าน ${passCount} / ${total} เกณฑ์`,
        pass ? 'ยอดเยี่ยม — สร้างฟังก์ชันตรงเงื่อนไขได้!' :
               'ลองเปลี่ยน expression แล้วกด "🔬 ตรวจโดยไม่ส่ง" ดูผลทันที',
        xp);
    };
  }

  /* ───────────────────────── Task: step-reason (SBRA) ─────────────────────────
     Step-Based Reasoning Activity (deferred-reveal, shuffled options)
       - ตัวเลือกทั้ง action และ reason สลับตำแหน่งสุ่ม (Fisher–Yates) ต่อโหลด
       - ไม่มีการเฉลยระหว่างทาง — นักศึกษาเลือกทุกสเต็ปได้อิสระ
       - คลิกย้อน/กระโดดสเต็ปได้เสมอ (คลิกดอท/ปุ่ม prev-next)
       - แก้สเต็ปไหนก็ได้โดยไม่ล้างสเต็ปอื่น (เพราะยังไม่เฉลย)
       - กด "ส่งคำตอบ" → ให้คะแนน + เผยเฉลยทีเดียวใน review panel
     Mission shape:
       { title, problem (katex), steps:[
           { id, prompt, actions:[{id,tex|text,correct?}], reasons:[{id,text,correct?}],
             commitText? } ]
         finalAnswer?: { tex, sayTH } }
  */
  function buildStepReasoning(card, mission) {
    const body = card._body;
    // Prepend strategy/planning pseudo-step if provided — นักศึกษาเลือกเทคนิค + เหตุผลก่อนลงมือทำ
    const baseSteps = mission.steps || [];
    const withStrategy = mission.strategy
      ? [{ ...mission.strategy, id: '__strategy__', _isStrategy: true }, ...baseSteps]
      : baseSteps;
    const steps = withStrategy;
    const total = steps.length;
    const stepLabel = (i) => steps[i]._isStrategy
      ? '🎯 วางแผน'
      : (mission.strategy ? `ขั้นที่ ${i} / ${total - 1}` : `ขั้นที่ ${i+1} / ${total}`);
    const stepTag = (i) => steps[i]._isStrategy
      ? '🎯 วางแผน'
      : (mission.strategy ? `ขั้น ${i}` : `ขั้น ${i+1}`);

    // Fisher–Yates shuffle ตัวเลือกและผูก mapping origIdx ไว้
    function shuffled(arr) {
      const out = arr.map((opt, origIdx) => ({ ...opt, _origIdx: origIdx }));
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = out[i]; out[i] = out[j]; out[j] = t;
      }
      return out;
    }

    // สเต็ปที่สลับตำแหน่งแล้ว (ตรึงไว้ตลอด mission ช่วงนี้)
    const shuffledSteps = steps.map(s => ({
      ...s,
      actions: shuffled(s.actions || []),
      reasons: shuffled(s.reasons || []),
      _isStrategy: !!s._isStrategy,
    }));

    // สถานะต่อสเต็ป: เก็บ pick ตาม "ตำแหน่งหลังสลับ" (displayed idx)
    const state = shuffledSteps.map(() => ({
      pickedAction: null,
      pickedReason: null,
    }));
    let idx = 0;
    let revealed = false;

    function pickedText(step, kind, i) {
      if (i == null) return '<em class="sbra-muted">(ยังไม่ได้เลือก)</em>';
      const opt = step[kind === 'action' ? 'actions' : 'reasons'][i];
      if (!opt) return '—';
      if (kind === 'action') return opt.tex ? `\\(${opt.tex}\\)` : (opt.text || '');
      return opt.text || '';
    }

    function runningSolutionHtml() {
      const rows = [];
      rows.push(`<div class="sbra-running-head">🧾 วิธีทำที่คุณกำลังสร้าง <span class="sbra-muted">(ยังไม่เฉลยจนกว่าจะส่ง)</span>${
        mission.realClo
          ? ` <span class="sbra-clo-chip" title="${mission.realCloLabel||''}">${mission.realClo}</span>`
          : ''
      }</div>`);
      rows.push(`<div class="sbra-running-line problem">โจทย์: \\(${mission.problem}\\)</div>`);
      shuffledSteps.forEach((s, i) => {
        const st = state[i];
        const answered = (st.pickedAction != null && st.pickedReason != null);
        const strat = s._isStrategy;
        const tagCls = strat ? ' strategy' : '';
        const lineCls = strat ? ' strategy' : '';
        const aLabel = strat ? 'เทคนิคหลัก' : 'ผลลัพธ์';
        const rLabel = strat ? 'เหตุผลที่เลือก' : 'เหตุผล';
        if (!answered && st.pickedAction == null && st.pickedReason == null) {
          rows.push(`<div class="sbra-running-line todo${lineCls}">
            <span class="sbra-running-tag todo${tagCls}">${stepTag(i)}</span>
            <span class="sbra-running-body sbra-muted">(ยังไม่ได้ตอบ)</span>
          </div>`);
          return;
        }
        rows.push(`<div class="sbra-running-line draft${lineCls}">
          <span class="sbra-running-tag${tagCls}">${stepTag(i)}</span>
          <span class="sbra-running-body">
            ${aLabel}: ${pickedText(s, 'action', st.pickedAction)}
            <span class="sbra-sep">·</span>
            ${rLabel}: ${pickedText(s, 'reason', st.pickedReason)}
          </span>
        </div>`);
      });
      return `<div class="sbra-running">${rows.join('')}</div>`;
    }

    function stepDotsHtml() {
      return `<div class="sbra-dots">
        ${shuffledSteps.map((s, i) => {
          const st = state[i];
          const answered = (st.pickedAction != null && st.pickedReason != null);
          const partial  = (!answered && (st.pickedAction != null || st.pickedReason != null));
          let cls = '';
          if (s._isStrategy) cls += ' strategy';
          if (answered) cls += ' filled';
          else if (partial) cls += ' partial';
          if (i === idx) cls += ' current';
          const label = s._isStrategy ? '🎯' : (mission.strategy ? String(i) : String(i+1));
          return `<span class="sbra-dot${cls}" data-jump="${i}" title="${s._isStrategy?'วางแผน':'ขั้น '+(mission.strategy?i:i+1)}">${label}</span>`;
        }).join('')}
      </div>`;
    }

    function renderStep() {
      const s = shuffledSteps[idx];
      const st = state[idx];

      const actions = s.actions.map((a, i) => {
        const picked = st.pickedAction === i ? ' picked' : '';
        return `<button class="sbra-opt${picked}" data-kind="action" data-i="${i}">
          <span class="sbra-opt-bullet">${String.fromCharCode(65+i)}</span>
          <span class="sbra-opt-text">${a.tex ? `\\(${a.tex}\\)` : (a.text || '')}</span>
        </button>`;
      }).join('');

      const reasons = s.reasons.map((r, i) => {
        const picked = st.pickedReason === i ? ' picked' : '';
        return `<button class="sbra-opt${picked}" data-kind="reason" data-i="${i}">
          <span class="sbra-opt-bullet">${i+1}</span>
          <span class="sbra-opt-text">${r.text}</span>
        </button>`;
      }).join('');

      const answered = (st.pickedAction != null && st.pickedReason != null);
      const completeness = state.filter(x => x.pickedAction!=null && x.pickedReason!=null).length;

      body.innerHTML = `
        ${runningSolutionHtml()}

        <div class="sbra-step-card${s._isStrategy?' strategy':''}">
          <div class="sbra-step-head">
            <span class="sbra-step-no${s._isStrategy?' strategy':''}">${stepLabel(idx)}</span>
            <span class="sbra-progress-chip">ตอบแล้ว ${completeness}/${total}</span>
          </div>
          ${s._isStrategy
            ? `<div class="sbra-strategy-banner">💡 <b>ขั้นวางแผน</b> — ก่อนลงมือทำ ให้คิดก่อนว่าจะใช้เทคนิคอะไร และเพราะอะไรถึงเลือกเทคนิคนั้น</div>`
            : ''}
          <div class="sbra-step-prompt">${s.prompt}</div>

          <div class="sbra-cols">
            <div class="sbra-col">
              <div class="sbra-col-head">① เลือก <b>${s._isStrategy?'เทคนิค / แนวคิดหลัก':'ผลลัพธ์ / การกระทำ'}</b></div>
              <div class="sbra-opts">${actions}</div>
            </div>
            <div class="sbra-col">
              <div class="sbra-col-head">② เลือก <b>${s._isStrategy?'เหตุผลที่เลือกเทคนิคนั้น':'เหตุผล / กฎที่ใช้'}</b></div>
              <div class="sbra-opts">${reasons}</div>
            </div>
          </div>

          <div class="sbra-step-actions">
            <button class="btn btn-sm" data-nav="prev" ${idx===0?'disabled':''}>◀ ขั้นก่อนหน้า</button>
            ${stepDotsHtml()}
            <button class="btn btn-sm" data-nav="next" ${idx===total-1?'disabled':''}>ขั้นถัดไป ▶</button>
          </div>

          <div class="sbra-confirm-row">
            <span class="sbra-confirm-hint">${answered
              ? '✓ ขั้นนี้ตอบครบแล้ว — เปลี่ยนใจแก้ได้เสมอ'
              : 'เลือกทั้งสองฝั่งเพื่อให้สเต็ปนี้สมบูรณ์'}</span>
          </div>
        </div>
      `;

      body.querySelectorAll('.sbra-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const kind = btn.dataset.kind;
          const i = parseInt(btn.dataset.i, 10);
          if (kind === 'action') st.pickedAction = i;
          else                   st.pickedReason = i;
          // ถ้าเลือกครบทั้งสองฝั่งและยังไม่ใช่ขั้นสุดท้าย → auto-advance นุ่มๆ (ไม่ล็อก)
          if (st.pickedAction != null && st.pickedReason != null && idx < total - 1) {
            setTimeout(() => { idx++; renderStep(); }, 320);
          } else {
            renderStep();
          }
        });
      });

      body.querySelector('[data-nav="prev"]').addEventListener('click', () => {
        if (idx > 0) { idx--; renderStep(); }
      });
      body.querySelector('[data-nav="next"]').addEventListener('click', () => {
        if (idx < total-1) { idx++; renderStep(); }
      });
      body.querySelectorAll('.sbra-dot').forEach(d => {
        d.addEventListener('click', () => {
          idx = parseInt(d.dataset.jump, 10);
          renderStep();
        });
      });

      renderLatex(body);
    }

    function computeScore() {
      // 1.0 ถูกทั้งคู่ / 0.5 ถูกฝั่งเดียว / 0.0 ผิดทั้งคู่หรือไม่ตอบ
      let sum = 0;
      shuffledSteps.forEach((s, i) => {
        const st = state[i];
        const aOk = st.pickedAction != null && !!s.actions[st.pickedAction].correct;
        const rOk = st.pickedReason != null && !!s.reasons[st.pickedReason].correct;
        if (aOk && rOk) sum += 1.0;
        else if (aOk || rOk) sum += 0.5;
      });
      return { raw: sum, perfect: total, ratio: sum / total };
    }

    function renderReview(score, pass) {
      const rows = shuffledSteps.map((s, i) => {
        const st = state[i];
        const picA = s.actions[st.pickedAction];
        const picR = s.reasons[st.pickedReason];
        const aOk = picA && !!picA.correct;
        const rOk = picR && !!picR.correct;
        const strat = s._isStrategy;
        const aNoun = strat ? 'เทคนิค' : 'ผลลัพธ์';
        const rNoun = strat ? 'เหตุผลที่เลือก' : 'เหตุผล';

        let icon = '🌟'; let cls = 'ok'; let summary = strat ? 'เลือกเทคนิคและเหตุผลได้ถูกต้อง' : 'ทั้งผลลัพธ์และเหตุผลถูก';
        if (!aOk && !rOk) { icon = '📘'; cls = 'bad'; summary = strat ? 'แผนยังไม่ตรงกับโจทย์' : 'ยังไม่ถูกทั้งสองฝั่ง'; }
        else if (!aOk)   { icon = '👍'; cls = 'mid'; summary = `เหตุผลถูก — แต่ "${aNoun}" ยังไม่ถูก`; }
        else if (!rOk)   { icon = '👍'; cls = 'mid'; summary = `${aNoun}ถูก — แต่ "${rNoun}" ยังไม่ถูก`; }

        // ถ้าผ่าน: เปิดเผยคำตอบถูก + commit + final
        // ถ้าไม่ผ่าน: ไม่เปิดเผย แสดงเฉพาะสิ่งที่นักศึกษาเลือก + บ่งว่าถูก/ผิด
        const aPickDisplay = picA
          ? (picA.tex ? `\\(${picA.tex}\\)` : (picA.text || ''))
          : '— ไม่ได้ตอบ —';
        const rPickDisplay = picR ? (picR.text || '') : '— ไม่ได้ตอบ —';

        if (pass) {
          const correctA = s.actions.find(x => x.correct);
          const correctR = s.reasons.find(x => x.correct);
          const showA = !aOk ? `
            <div class="rr-line">
              <span class="rr-label">เฉลย${aNoun}:</span>
              <span class="rr-pick ok">${correctA ? (correctA.tex?`\\(${correctA.tex}\\)`:correctA.text||'') : ''}</span>
            </div>` : '';
          const showR = !rOk ? `
            <div class="rr-line">
              <span class="rr-label">เฉลย${rNoun}:</span>
              <span class="rr-pick ok">${correctR ? (correctR.text||'') : ''}</span>
            </div>` : '';
          return `<div class="sbra-review-row ${cls}${strat?' strategy':''}">
            <div class="sbra-review-head">${icon} ${stepTag(i)} · ${summary}</div>
            <div class="sbra-review-prompt">${s.prompt}</div>
            <div class="rr-line"><span class="rr-label">${aNoun}คุณ:</span>
              <span class="rr-pick ${aOk?'ok':'bad'}">${aPickDisplay}</span></div>
            ${showA}
            <div class="rr-line"><span class="rr-label">${rNoun}คุณ:</span>
              <span class="rr-pick ${rOk?'ok':'bad'}">${rPickDisplay}</span></div>
            ${showR}
            ${s.commitText ? `<div class="sbra-review-commit">📝 ${s.commitText}</div>` : ''}
          </div>`;
        }

        // ไม่ผ่าน: ไม่โชว์เฉลย
        return `<div class="sbra-review-row ${cls}${strat?' strategy':''}">
          <div class="sbra-review-head">${icon} ${stepTag(i)} · ${summary}</div>
          <div class="sbra-review-prompt">${s.prompt}</div>
          <div class="rr-line"><span class="rr-label">${aNoun}คุณ:</span>
            <span class="rr-pick ${aOk?'ok':'bad'}">${aPickDisplay}</span></div>
          <div class="rr-line"><span class="rr-label">${rNoun}คุณ:</span>
            <span class="rr-pick ${rOk?'ok':'bad'}">${rPickDisplay}</span></div>
        </div>`;
      }).join('');

      const final = (pass && mission.finalAnswer)
        ? `<div class="sbra-running-line final">
            ∴ คำตอบที่ถูก: \\(${mission.finalAnswer.tex}\\)
            ${mission.finalAnswer.sayTH ? `<span class="sbra-running-say">(${mission.finalAnswer.sayTH})</span>` : ''}
          </div>` : '';

      const retryBanner = pass ? '' : `
        <div class="sbra-retry-banner">
          🔒 ยังไม่เปิดเฉลย — ทบทวนและลองแก้คำตอบจนกว่าจะผ่านเกณฑ์ (${Math.round(0.7*100)}%)
        </div>`;

      const retryBtn = pass ? '' : `
        <div class="sbra-retry-actions">
          <button class="btn btn-primary btn-sm" data-sbra-retry>✍ กลับไปแก้คำตอบ</button>
        </div>`;

      body.innerHTML = `
        <div class="sbra-review">
          <div class="sbra-review-score ${pass?'pass':'fail'}">
            ${pass ? '🎉 ผ่านแล้ว!' : '🔄 ยังไม่ผ่านเกณฑ์'} · คะแนน ${score.raw.toFixed(1)} / ${score.perfect}
            (${Math.round(score.ratio*100)}%)
          </div>
          ${retryBanner}
          ${rows}
          ${final}
          ${retryBtn}
        </div>
      `;
      // Wire retry button
      const rbtn = body.querySelector('[data-sbra-retry]');
      if (rbtn) {
        rbtn.addEventListener('click', () => {
          revealed = false;
          // ล้าง feedback panel เก่า
          if (card._fbEl) { card._fbEl.className = 'fb-panel'; card._fbEl.innerHTML = ''; }
          // กลับไปจุดแรกที่ยัง "ผิด" จะได้ทบทวนทันที
          const firstBad = shuffledSteps.findIndex((s, i) => {
            const st = state[i];
            const aOk = st.pickedAction != null && !!s.actions[st.pickedAction].correct;
            const rOk = st.pickedReason != null && !!s.reasons[st.pickedReason].correct;
            return !(aOk && rOk);
          });
          idx = firstBad >= 0 ? firstBad : 0;
          renderStep();
        });
      }
      renderLatex(body);
    }

    card._onSubmit = () => {
      if (revealed) return;
      const incomplete = state.filter(s => s.pickedAction==null || s.pickedReason==null).length;
      if (incomplete > 0) {
        showFeedback(card, false,
          `ยังตอบไม่ครบ — เหลือ ${incomplete} ขั้น`,
          'กรุณาเลือกทั้ง "ผลลัพธ์" และ "เหตุผล" ให้ครบทุกขั้นก่อนส่ง',
          0);
        return;
      }
      const score = computeScore();
      const pass = score.ratio >= 0.7;
      revealed = true;

      writeMissionState(mission.id, { attempts:(missionState(mission.id).attempts||0)+1 });
      let xp = 0;
      if (pass) {
        xp = Math.round(mission.xp * score.ratio * (card._hintShown() ? 0.7 : 1));
        markDone(mission, card, Math.round(score.ratio*100), xp);
      } else {
        card._chip.textContent = chipOf(mission);
      }
      renderReview(score, pass);

      const bad = shuffledSteps.reduce((n, s, i) => {
        const st = state[i];
        const aOk = st.pickedAction != null && !!s.actions[st.pickedAction].correct;
        const rOk = st.pickedReason != null && !!s.reasons[st.pickedReason].correct;
        return n + ((aOk && rOk) ? 0 : 1);
      }, 0);

      showFeedback(card, pass,
        `ได้ ${score.raw.toFixed(1)} / ${score.perfect} ขั้น (${Math.round(score.ratio*100)}%)`,
        pass
          ? 'เข้าใจกระบวนการครบถ้วน — ไม่ใช่แค่จำคำตอบ'
          : `🔒 ยังไม่เปิดเฉลย — มี ${bad} ขั้นที่ยังไม่ถูกสมบูรณ์ ลองทบทวนและแก้คำตอบดูใหม่`,
        xp);

      // แสดงปุ่ม "ลองโจทย์ใหม่" เฉพาะเมื่อผ่านแล้ว (ป้องกันนักศึกษาหนีโจทย์เดิมก่อนเข้าใจ)
      if (pass) {
        const fb = card._fbEl;
        if (fb) {
          const again = document.createElement('div');
          again.style.marginTop = '.5rem';
          again.innerHTML = '<button class="btn btn-sm" data-restart>🔄 ลองโจทย์ใหม่ (สุ่ม)</button>';
          fb.appendChild(again);
          again.querySelector('[data-restart]').addEventListener('click', () => location.reload());
        }
      }
    };

    renderStep();
  }

  /* ───────────────────────── Dispatcher ───────────────────────── */

  const BUILDERS = {
    'quick-mcq':   buildQuickMCQ,
    'match-graph': buildMatchGraph,
    'numeric':     buildNumeric,
    'analyze':     buildAnalyze,
    'evaluate':    buildEvaluate,
    'create':      buildCreate,
    'step-reason': buildStepReasoning,
  };

  /* ─────────────────────────
     Pool resolution — ก่อนส่งให้ builder
     สุ่มหยิบจาก mission.pool / mission.graphPool
     แล้วยัดฟิลด์ปลายทางที่ builder ต้องใช้
     ───────────────────────── */

  function resolveMission(base) {
    // Clone shallow so we don't mutate the shared mission-bank object
    const m = Object.assign({}, base);
    const _sampleN = (typeof sampleN === 'function')
      ? sampleN : (a, n) => a.slice(0, n);
    const _pickOne = (typeof pickOne === 'function')
      ? pickOne : (a) => a[Math.floor(Math.random() * a.length)];

    if (m.type === 'quick-mcq' && Array.isArray(m.pool)) {
      m.cards = _sampleN(m.pool, m.draw || 5);
    }
    if (m.type === 'match-graph' && Array.isArray(m.graphPool)) {
      m.graphs = _sampleN(m.graphPool, m.drawGraphs || 4);
    }
    if (m.type === 'numeric' && Array.isArray(m.pool)) {
      const picked = _pickOne(m.pool);
      m.prompt    = picked.prompt;
      m.hint      = picked.hint;
      m.solution  = picked.solution;
      m.answer    = picked.answer;
      m.tolerance = picked.tolerance != null ? picked.tolerance : 0.01;
    }
    if (m.type === 'analyze' && Array.isArray(m.pool)) {
      const picked = _pickOne(m.pool);
      m.prompt    = picked.prompt;
      m.primary   = picked.primary;
      m.secondary = picked.secondary;
    }
    if (m.type === 'evaluate' && Array.isArray(m.pool)) {
      const picked = _pickOne(m.pool);
      m.prompt      = picked.prompt;
      m.steps       = picked.steps;
      m.wrongLine   = picked.wrongLine;
      m.fixQuestion = picked.fixQuestion;
      m.fixOpts     = picked.fixOpts;
      m.fixAns      = picked.fixAns;
    }
    if (m.type === 'create' && Array.isArray(m.pool)) {
      const picked = _pickOne(m.pool);
      m.prompt      = picked.prompt;
      m.hint        = picked.hint;
      m.example     = picked.example;
      m.placeholder = picked.placeholder;
      m.checks      = picked.checks;
    }
    if (m.type === 'step-reason' && Array.isArray(m.pool)) {
      const picked = _pickOne(m.pool);
      m.problem      = picked.problem;
      m.steps        = picked.steps;
      m.finalAnswer  = picked.finalAnswer;
      m.problemTitle = picked.title;
      // merge optional strategy/planning step (prepended to tactical steps by controller)
      m.strategy = (typeof SBRA_STRATEGIES !== 'undefined' && SBRA_STRATEGIES)
        ? (SBRA_STRATEGIES[picked.id] || null)
        : null;
      m.pickedId = picked.id;
      // real course CLO (CLO1–CLO6) — single grouped taxonomy used across SBRA pools
      m.realClo      = picked.clo || null;
      m.realCloLabel = (m.realClo && typeof REAL_CLOS !== 'undefined' && REAL_CLOS)
        ? REAL_CLOS[m.realClo] || null
        : null;
    }
    return m;
  }

  function renderTopic(topicId) {
    const host = document.getElementById('mission-list');
    const topic = MISSION_BANK[topicId];
    host.innerHTML = '';
    if (!topic) {
      host.innerHTML = '<div class="card text-center"><em>หัวข้อนี้กำลังจะมา เร็วๆ นี้</em></div>';
      return;
    }
    topic.missions.forEach(base => {
      const m = resolveMission(base);
      const card = makeCard(m);
      host.appendChild(card);
      const builder = BUILDERS[m.type];
      if (builder) builder(card, m);
      const st = missionState(m.id);
      card._chip.textContent = chipOf(m, st.done ? 'เสร็จแล้ว' : null);
    });
    // Re-render LaTeX after all cards attach
    setTimeout(() => renderLatex(host), 20);
  }

  function renderTopicTabs(activeTopic) {
    const bar = document.getElementById('topic-tabs');
    bar.innerHTML = '';
    MISSION_TOPICS.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'topic-tab' + (t.id === activeTopic ? ' active' : '') + (t.ready ? '' : ' locked');
      btn.innerHTML = t.label + (t.ready ? '' : ' <span class="soon">เร็วๆ นี้</span>');
      if (t.ready) {
        btn.addEventListener('click', () => {
          history.replaceState({}, '', '?topic=' + t.id);
          initPage(t.id);
        });
      }
      bar.appendChild(btn);
    });
  }

  function initPage(topicId) {
    renderTopicTabs(topicId);
    buildHeatmap(document.getElementById('heatmap'), topicId);
    renderTopic(topicId);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const t = params.get('topic') || 'limits';
    initPage(t);
    if (typeof updateNavXP === 'function') updateNavXP();
  });
})();
