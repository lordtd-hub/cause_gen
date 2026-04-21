'use strict';

(function () {
  const BLOOM_LEVELS = [1, 2, 3, 4, 5, 6];

  function getCourse() {
    return window.CourseRuntime?.getCourseConfigSync?.() || {};
  }

  function storageKey() {
    const courseId = getCourse().course_id || 'course';
    return `${courseId}_missions`;
  }

  function loadMissionState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey()) || '{}');
    } catch {
      return {};
    }
  }

  function saveMissionState(state) {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state));
    } catch {
      // ignore storage issues
    }
  }

  function missionState(missionId) {
    return loadMissionState()[missionId] || {
      done: false,
      attempts: 0,
      hintsUsed: 0,
      solutionViewed: false,
      awardedXp: 0,
      bestScore: 0,
      lastConfidence: null,
      lastCalibrationLabel: '',
      lastAttemptSummary: null,
      attemptHistory: [],
      currentAttemptStartedAt: null,
    };
  }

  function updateMissionState(missionId, patch) {
    const all = loadMissionState();
    all[missionId] = { ...missionState(missionId), ...patch };
    saveMissionState(all);
  }

  function cappedHistory(history, limit = 10) {
    return history.slice(Math.max(0, history.length - limit));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function ensureAttemptStarted(missionId) {
    const state = missionState(missionId);
    if (!state.currentAttemptStartedAt) {
      updateMissionState(missionId, { currentAttemptStartedAt: nowIso() });
    }
  }

  function cloLabel(clos, id) {
    return clos.find((clo) => clo.id === id)?.label || id;
  }

  function moduleLabel(modules, id) {
    return modules.find((module) => module.id === id)?.title || id;
  }

  function missionTypeLabel(type) {
    if (type === 'sbra-step-based-reasoning') return 'SBRA';
    if (type === 'quick-check') return 'Quick Check';
    if (type === 'match-diagnose') return 'Match/Diagnose';
    if (type === 'numeric-target') return 'Numeric Target';
    return type;
  }

  function scrollToMission(missionId) {
    const element = document.getElementById(missionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function missionProgress(missions) {
    return missions.reduce((summary, mission) => {
      const state = missionState(mission.mission_id);
      summary.total += 1;
      summary.totalXP += mission.xp || 0;
      summary.totalAttempts += state.attempts || 0;
      if (state.lastConfidence) {
        summary.selfAssessed += 1;
      }
      if (state.done) {
        summary.done += 1;
        summary.earnedXP += state.awardedXp || 0;
      }
      if ((state.bestScore || 0) > 0) {
        summary.started += 1;
      }
      return summary;
    }, {
      total: 0,
      done: 0,
      started: 0,
      totalXP: 0,
      earnedXP: 0,
      totalAttempts: 0,
      selfAssessed: 0,
    });
  }

function renderOverview(root, missions, modules) {
  const overall = missionProgress(missions);
  const activeModules = new Set(missions.map((mission) => mission.module_id));
  const startedRatio = overall.total ? `${overall.done}/${overall.total}` : '0/0';

  root.innerHTML = `
    <article class="mission-overview-card">
      <strong>Mission total</strong>
      <div class="mission-overview-number">${overall.total}</div>
      <p>ภารกิจทั้งหมดในหน้านี้เชื่อมกับเนื้อหาอยู่ ${activeModules.size} โมดูล และใช้เป็นพื้นที่ฝึกคิดก่อนประเมินผลรอบใหญ่</p>
    </article>
    <article class="mission-overview-card">
      <strong>Completed</strong>
      <div class="mission-overview-number">${startedRatio}</div>
      <p>ดูความคืบหน้าแบบไม่กดดันเกินไป ว่าตอนนี้ผ่านภารกิจไปแล้วเท่าไร</p>
    </article>
    <article class="mission-overview-card">
      <strong>XP from missions</strong>
      <div class="mission-overview-number">${overall.earnedXP}/${overall.totalXP}</div>
      <p>XP จากภารกิจจะเชื่อมกับระบบ progress และ badge ของรายวิชา</p>
    </article>
    <article class="mission-overview-card">
      <strong>Attempts</strong>
      <div class="mission-overview-number">${overall.totalAttempts}</div>
      <p>ใช้ดูว่าหน้านี้กำลังทำหน้าที่เป็นพื้นที่ฝึกคิดจริง ไม่ใช่แค่ส่งคำตอบครั้งเดียวแล้วจบ</p>
    </article>
    <article class="mission-overview-card" data-self-assessment-summary="true">
      <strong>Self-assessment</strong>
      <div class="mission-overview-number">${overall.selfAssessed}/${overall.total}</div>
      <p>บล็อกนี้สรุปว่ามีการประเมินตนเองครบแล้วกี่ภารกิจ และข้อมูลนี้จะถูกใช้ต่อใน feedback, XP hooks, และการประเมินรอบถัดไป</p>
    </article>
  `;
}

function renderHeatmap(root, missions, modules, onSelectModule) {
    const byModuleAndBloom = new Map();
    missions.forEach((mission) => {
      const key = `${mission.module_id}::${mission.bloom_level}`;
      const list = byModuleAndBloom.get(key) || [];
      list.push(mission);
      byModuleAndBloom.set(key, list);
    });

    const header = ['<div class="heatmap-head">โมดูล / Bloom</div>']
      .concat(BLOOM_LEVELS.map((level) => `<div class="heatmap-head">L${level}</div>`))
      .join('');

    const rows = modules.map((module) => {
      const cells = BLOOM_LEVELS.map((level) => {
        const key = `${module.id}::${level}`;
        const list = byModuleAndBloom.get(key) || [];
        if (!list.length) {
          return '<button class="heatmap-cell locked" type="button" disabled>—</button>';
        }
        const doneCount = list.filter((mission) => missionState(mission.mission_id).done).length;
        const allDone = doneCount === list.length;
        const statusClass = allDone ? 'completed' : 'available';
        const label = list.length > 1 ? `${doneCount}/${list.length}` : (allDone ? '✓' : '•');
        const title = `${module.title} | Bloom L${level}`;
        return `<button class="heatmap-cell ${statusClass}" type="button" data-heatmap-module="${module.id}" title="${title}">${label}</button>`;
      }).join('');
      return `<div class="heatmap-row-label">${module.title}</div>${cells}`;
    }).join('');

    root.innerHTML = `${header}${rows}`;
    root.querySelectorAll('[data-heatmap-module]').forEach((button) => {
      button.addEventListener('click', () => onSelectModule(button.dataset.heatmapModule));
    });
  }

  function renderModuleTabs(root, missions, modules, activeFilter, onSelectModule) {
    const missionCounts = missions.reduce((map, mission) => {
      map.set(mission.module_id, (map.get(mission.module_id) || 0) + 1);
      return map;
    }, new Map());

    const tabs = [
      {
        id: 'all',
        label: 'ทั้งหมด',
        count: missions.length,
      },
      ...modules
        .filter((module) => missionCounts.has(module.id))
        .map((module) => ({
          id: module.id,
          label: module.title,
          count: missionCounts.get(module.id) || 0,
        })),
    ];

    root.innerHTML = tabs.map((tab) => `
      <button
        type="button"
        class="topic-tab${tab.id === activeFilter ? ' active' : ''}"
        data-module-filter="${tab.id}">
        ${tab.label} (${tab.count})
      </button>
    `).join('');

    root.querySelectorAll('[data-module-filter]').forEach((button) => {
      button.addEventListener('click', () => onSelectModule(button.dataset.moduleFilter));
    });
  }

  function optionMarkup(groupName, options) {
    return (options || []).map((option, optionIndex) => `
      <label class="btn quick-check-choice">
        <input type="radio" name="${groupName}" value="${optionIndex}" style="margin-right:.5rem;" />
        ${option.text}
      </label>
    `).join('');
  }

  function missionHints(mission) {
    return (mission.steps || [])
      .map((step, index) => ({
        title: step.title || `Step ${index + 1}`,
        hint: step.hint || '',
      }))
      .filter((item) => item.hint);
  }

  function missionSupportMarkup(mission, state) {
    const hints = missionHints(mission);
    const solutionSteps = Array.isArray(mission.solution) ? mission.solution.filter(Boolean) : [];
    const hasHints = hints.length > 0;
    const hasSolution = solutionSteps.length > 0;
    if (!hasHints && !hasSolution) return '';

    return `
      <section class="mission-step mission-support">
        <h3>ตัวช่วยระหว่างทำภารกิจ</h3>
        <div class="text-small text-muted" style="margin-top:.25rem;">
          ตัวช่วยส่วนนี้ใช้กติกาลด XP แบบเดียวกับต้นฉบับ cal1: hint ลดเหลือ 70% และ solution ลดเหลือ 50%
        </div>
        <div class="flex-row" style="margin-top:.75rem; gap:.65rem; flex-wrap:wrap;">
          ${hasHints ? `<button type="button" class="btn" data-act="hint">💡 ใบ้ (-30% XP)</button>` : ''}
          ${hasSolution ? `<button type="button" class="btn" data-act="solution">📖 ดูแนวทางเฉลย (-50% XP)</button>` : ''}
        </div>
        ${hasHints ? `
          <div class="mission-support-box${state.hintsUsed ? ' show' : ''}" data-support="hint">
            <strong>Hint pack</strong>
            <ol style="margin:.55rem 0 0; padding-left:1rem;">
              ${hints.map((item) => `<li><strong>${item.title}:</strong> ${item.hint}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
        ${hasSolution ? `
          <div class="mission-support-box${state.solutionViewed ? ' show' : ''}" data-support="solution">
            <strong>Solution path</strong>
            <ol style="margin:.55rem 0 0; padding-left:1rem;">
              ${solutionSteps.map((item) => `<li>${item}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
      </section>
    `;
  }

  function selfAssessmentMarkup(mission) {
    const confidence = mission.confidence || {};
    const selected = Number(missionState(mission.mission_id).lastConfidence || 0);

    return `
      <section
        class="mission-step mission-self-assessment"
        id="${mission.mission_id}-self-assessment"
        data-self-assessment-block="true">
        <h3>การประเมินตนเอง</h3>
        <div class="text-small text-muted" style="margin-top:.25rem;">
          ส่วนนี้เป็นส่วนหนึ่งของ mission จริง และใช้เป็นตัวคูณ XP แบบเดียวกับต้นฉบับ cal1
        </div>
        <div style="margin-top:.75rem;">${confidence.prompt || 'ก่อนส่ง คุณมั่นใจในคำตอบแค่ไหน?'}</div>
        <div class="mission-confidence-stars" data-conf="${mission.mission_id}" style="margin-top:.75rem;">
          ${[1, 2, 3, 4, 5].map((level) => `
            <label class="star-btn${selected >= level ? ' on' : ''}" title="ระดับ ${level}">
              <input type="radio" name="${mission.mission_id}-confidence" value="${level}" ${selected === level ? 'checked' : ''} />
              <span class="star-face">★</span>
              <span class="star-num">${level}</span>
            </label>
          `).join('')}
        </div>
        <div class="text-small text-muted" style="margin-top:.55rem;">
          โบนัสเมื่อผ่าน: 5★ ×1.25, 4★ ×1.15, 3★ ×1.00, 2★ ×1.10, 1★ ×1.15
          <br />ถ้ามั่นใจสูงแต่ยังไม่ผ่าน ระบบจะบันทึกว่าเป็น miscalibration เพื่อใช้สะท้อนผลต่อไป
        </div>
      </section>
    `;
  }

function stepMarkup(step, missionId, index) {
    return `
      <section class="mission-step" data-step="${index}">
        <h3>${step.title || `Step ${index + 1}`}</h3>
        <div>${step.prompt || ''}</div>
        <div style="margin-top:.75rem;"><strong>Process</strong></div>
        <div class="text-small text-muted" style="margin-top:.25rem;">${step.process_prompt || ''}</div>
        <div class="mission-options">${optionMarkup(`${missionId}-${index}-process`, step.process_options)}</div>
        <div style="margin-top:.85rem;"><strong>Reasoning</strong></div>
        <div class="text-small text-muted" style="margin-top:.25rem;">${step.reasoning_prompt || ''}</div>
        <div class="mission-options">${optionMarkup(`${missionId}-${index}-reasoning`, step.reasoning_options)}</div>
      </section>
    `;
  }

  function renderMissionCard(mission, clos, modules) {
    const state = missionState(mission.mission_id);
    const lastAttempt = state.lastAttemptSummary;
    return `
      <article
        class="mission-card"
        id="${mission.mission_id}"
        data-module-id="${mission.module_id}"
        data-bloom-level="${mission.bloom_level}"
        data-mission-type="${mission.mission_type}">
        <div class="mission-meta">
          <span class="mission-chip">${moduleLabel(modules, mission.module_id)}</span>
          <span class="mission-chip">CLO: ${mission.clo_id}</span>
          <span class="mission-chip">Bloom L${mission.bloom_level}</span>
          <span class="mission-chip">${missionTypeLabel(mission.mission_type)}</span>
          <span class="mission-chip">${mission.xp} XP</span>
        </div>
        <h2 style="margin:.25rem 0 .45rem;">${mission.title}</h2>
        <div class="text-muted" style="line-height:1.75;">${mission.prompt}</div>
        <div class="text-small text-muted" style="margin-top:.5rem;"><strong>${mission.clo_id}</strong>: ${cloLabel(clos, mission.clo_id)}</div>
        <ul class="mission-rubric">${(mission.rubric || []).map((item) => `<li>${item}</li>`).join('')}</ul>
        <div class="widget-feedback"><strong>Strategy prompt:</strong> ${mission.strategy_prompt || ''}</div>
        ${(mission.steps || []).map((step, index) => stepMarkup(step, mission.mission_id, index)).join('')}
        ${missionSupportMarkup(mission, state)}
        ${selfAssessmentMarkup(mission)}
        <div class="flex-row" style="justify-content:space-between; margin-top:1rem; flex-wrap:wrap; gap:.75rem;">
          <div class="text-small text-muted">Attempts: ${state.attempts || 0} | Hints: ${state.hintsUsed || 0}${state.solutionViewed ? ' | Solution viewed' : ''} | Best mastered steps: ${state.bestScore || 0}${state.lastConfidence ? ` | Last self-assessment: ${'?'.repeat(Number(state.lastConfidence || 0))}` : ''}</div>
          <button class="btn btn-primary" data-submit-mission="${mission.mission_id}">ตรวจภารกิจนี้</button>
        </div>
        ${lastAttempt ? `<div class="text-small text-muted" style="margin-top:.65rem;">Last analytics: ${lastAttempt.confidence_alignment || 'n/a'} | process ${lastAttempt.process_correct}/${mission.steps.length} | reasoning ${lastAttempt.reasoning_correct}/${mission.steps.length}</div>` : ''}
        <div class="mission-result" data-result="${mission.mission_id}" hidden></div>
      </article>
    `;
  }

  function scoreMission(card, mission) {
    let processCorrect = 0;
    let reasoningCorrect = 0;
    let masteredSteps = 0;
    const details = [];
    const stepResults = [];

    mission.steps.forEach((step, index) => {
      const processChecked = card.querySelector(`input[name="${mission.mission_id}-${index}-process"]:checked`);
      const reasoningChecked = card.querySelector(`input[name="${mission.mission_id}-${index}-reasoning"]:checked`);
      if (!processChecked || !reasoningChecked) {
        details.push(`Step ${index + 1}: ตอบยังไม่ครบทั้ง process และ reasoning`);
        stepResults.push({
          step_id: step.id || `step-${index + 1}`,
          step_index: index + 1,
          process_selected_id: null,
          process_correct: false,
          reasoning_selected_id: null,
          reasoning_correct: false,
          step_mastered: false,
          hint_used: Boolean(step.hint),
          misconception_tags: [],
        });
        return;
      }

      const processOption = step.process_options[Number(processChecked.value)];
      const reasoningOption = step.reasoning_options[Number(reasoningChecked.value)];
      const processPass = Boolean(processOption?.correct);
      const reasoningPass = Boolean(reasoningOption?.correct);

      if (processPass) processCorrect += 1;
      if (reasoningPass) reasoningCorrect += 1;
      if (processPass && reasoningPass) masteredSteps += 1;

      details.push(
        `Step ${index + 1}: process ${processPass ? 'ถูก' : 'ผิด'} - ${processOption?.feedback || ''} | reasoning ${reasoningPass ? 'ถูก' : 'ผิด'} - ${reasoningOption?.feedback || ''}`,
      );
      stepResults.push({
        step_id: step.id || `step-${index + 1}`,
        step_index: index + 1,
        process_selected_id: processOption?.id || null,
        process_correct: processPass,
        reasoning_selected_id: reasoningOption?.id || null,
        reasoning_correct: reasoningPass,
        step_mastered: processPass && reasoningPass,
        hint_used: Boolean(step.hint),
        misconception_tags: [
          ...(Array.isArray(processOption?.misconception_tags) ? processOption.misconception_tags : []),
          ...(Array.isArray(reasoningOption?.misconception_tags) ? reasoningOption.misconception_tags : []),
        ],
      });
    });

    return { processCorrect, reasoningCorrect, masteredSteps, details, stepResults };
  }

  function calibrationInfo(confidenceValue, pass) {
    const conf = Number(confidenceValue || 0);
    if (!pass) {
      if (conf >= 4) {
        return { mult: 1, category: 'overconfident', label: `????????? (${conf}?) ????????????? ??????????????????????` };
      }
      if (conf >= 1) {
        return { mult: 1, category: conf <= 2 ? 'calibrated-low' : 'mixed', label: `?????????????? ${conf}? ??????????????? ?????????????????????????????????` };
      }
      return { mult: 1, category: 'missing', label: '?????????????? self-assessment' };
    }
    if (conf === 5) return { mult: 1.25, category: 'calibrated-high', label: `????? ${conf}? ? 1.25 (????????????????)` };
    if (conf === 4) return { mult: 1.15, category: 'calibrated-high', label: `????? ${conf}? ? 1.15` };
    if (conf === 3) return { mult: 1, category: 'mixed', label: '??????????????????????????? ????????????????? XP' };
    if (conf === 2) return { mult: 1.1, category: 'underconfident', label: `????? ${conf}? ? 1.10 (????????????????)` };
    if (conf === 1) return { mult: 1.15, category: 'underconfident', label: `????? ${conf}? ? 1.15 (??????????????????????????)` };
    return { mult: 1, category: 'missing', label: '?????????????? self-assessment ????????????? calibration' };
  }

  function confidenceAnalysis(confidenceValue, pass) {
    const info = calibrationInfo(confidenceValue, pass);
    return {
      category: info.category,
      label: info.label,
      multiplier: info.mult,
    };
  }

  function supportPenalty(state) {
    return {
      hintMultiplier: state.hintsUsed ? 0.7 : 1,
      solutionMultiplier: state.solutionViewed ? 0.5 : 1,
    };
  }

  function paintSelfAssessment(card, missionId) {
    const selected = Number(card.querySelector(`input[name="${missionId}-confidence"]:checked`)?.value || 0);
    card.querySelectorAll('.mission-self-assessment .star-btn').forEach((button, index) => {
      button.classList.toggle('on', index < selected);
    });
  }

  function bindSupportTools(card, mission) {
    const hintButton = card.querySelector('[data-act="hint"]');
    const solutionButton = card.querySelector('[data-act="solution"]');
    const hintBox = card.querySelector('[data-support="hint"]');
    const solutionBox = card.querySelector('[data-support="solution"]');

    if (hintButton && hintBox) {
      hintButton.addEventListener('click', () => {
        const state = missionState(mission.mission_id);
        const nextVisible = !hintBox.classList.contains('show');
        hintBox.classList.toggle('show', nextVisible);
        ensureAttemptStarted(mission.mission_id);
        if (nextVisible && !state.hintsUsed) {
          updateMissionState(mission.mission_id, { hintsUsed: 1 });
        }
      });
    }

    if (solutionButton && solutionBox) {
      solutionButton.addEventListener('click', () => {
        const state = missionState(mission.mission_id);
        const nextVisible = !solutionBox.classList.contains('show');
        solutionBox.classList.toggle('show', nextVisible);
        ensureAttemptStarted(mission.mission_id);
        if (nextVisible && !state.solutionViewed) {
          updateMissionState(mission.mission_id, { solutionViewed: true });
        }
      });
    }
  }

  function handleMissionSubmit(card, mission, rerenderShell) {
    const result = card.querySelector(`[data-result="${mission.mission_id}"]`);
    const confidenceChecked = card.querySelector(`input[name="${mission.mission_id}-confidence"]:checked`);
    const confidenceValue = Number(confidenceChecked?.value || 0) || 0;
    const { processCorrect, reasoningCorrect, masteredSteps, details, stepResults } = scoreMission(card, mission);
    const minStepsMastered = mission.threshold?.min_steps_mastered ?? mission.steps.length;
    const pass = masteredSteps >= minStepsMastered;
    const state = missionState(mission.mission_id);
    const firstPass = pass && !state.done;
    const submittedAt = nowIso();
    const startedAt = state.currentAttemptStartedAt || submittedAt;
    const confidence = confidenceAnalysis(confidenceValue, pass);
    const penalties = supportPenalty(state);
    const baseXp = pass ? Math.round(mission.xp || 0) : 0;
    const supportAdjustedXp = pass
      ? Math.round(baseXp * penalties.hintMultiplier * penalties.solutionMultiplier)
      : 0;
    const adjustedXp = pass ? Math.round(supportAdjustedXp * confidence.multiplier) : 0;
    const awardedXp = firstPass ? adjustedXp : 0;
    const attemptSummary = {
      analytics_version: 'sbra-v1-local',
      attempt_id: `${mission.mission_id}-${Date.now()}`,
      course_id: getCourse().course_id || 'course',
      module_id: mission.module_id,
      mission_id: mission.mission_id,
      clo_id: mission.clo_id,
      learner_id: 'anonymous-local',
      attempt_number: (state.attempts || 0) + 1,
      started_at: startedAt,
      submitted_at: submittedAt,
      duration_ms: Math.max(0, Date.parse(submittedAt) - Date.parse(startedAt)),
      process_correct: processCorrect,
      reasoning_correct: reasoningCorrect,
      steps_mastered: masteredSteps,
      step_mastery_rate: mission.steps.length ? masteredSteps / mission.steps.length : 0,
      confidence_level: confidenceValue,
      confidence_alignment: confidence.category,
      pass,
      xp_base: baseXp,
      xp_hint_multiplier: penalties.hintMultiplier,
      xp_solution_multiplier: penalties.solutionMultiplier,
      xp_support_adjusted: supportAdjustedXp,
      xp_multiplier: confidence.multiplier,
      xp_adjusted: adjustedXp,
      step_results: stepResults,
    };

    updateMissionState(mission.mission_id, {
      done: state.done || pass,
      attempts: (state.attempts || 0) + 1,
      awardedXp: state.awardedXp || awardedXp,
      bestScore: Math.max(state.bestScore || 0, masteredSteps),
      lastConfidence: confidenceValue,
      lastCalibrationLabel: confidence.label,
      lastAttemptSummary: attemptSummary,
      attemptHistory: cappedHistory([...(state.attemptHistory || []), attemptSummary]),
      currentAttemptStartedAt: null,
    });

    if (awardedXp > 0 && typeof window.addXP === 'function') {
      window.addXP(awardedXp, mission.title);
      window.fireConfetti?.(18);
    }

    result.hidden = false;
    result.innerHTML = `
      <strong>${pass ? 'ผ่านภารกิจ' : 'ยังไม่ผ่านภารกิจ'}</strong>
      <div style="margin-top:.45rem;">Process ${processCorrect}/${mission.steps.length} | Reasoning ${reasoningCorrect}/${mission.steps.length} | Mastered steps ${masteredSteps}/${mission.steps.length} (ต้องผ่านอย่างน้อย ${minStepsMastered})</div>
      <div style="margin-top:.45rem;">Self-assessment: ${confidenceValue || 'ยังไม่ได้เลือก'} | Diagnosis: ${confidence.label}</div>
      ${pass ? `<div style="margin-top:.45rem;">XP: base ${baseXp} × hint ${penalties.hintMultiplier.toFixed(2)} × solution ${penalties.solutionMultiplier.toFixed(2)} × confidence ${confidence.multiplier.toFixed(2)} = ${adjustedXp}${firstPass ? '' : ' (awarded already)'}</div>` : ''}
      <ul style="margin-top:.55rem; padding-left:1rem;">${details.map((detail) => `<li>${detail}</li>`).join('')}</ul>
    `;

    window.CourseRuntime?.renderMath?.(result);
    rerenderShell();
  }
  function bindMissionCards(root, missions, rerenderShell) {
    missions.forEach((mission) => {
      const button = root.querySelector(`[data-submit-mission="${mission.mission_id}"]`);
      const card = root.querySelector(`#${mission.mission_id}`);
      if (!button || !card) return;
      bindSupportTools(card, mission);
      paintSelfAssessment(card, mission.mission_id);
      card.querySelectorAll('input').forEach((input) => {
        input.addEventListener('change', () => {
          ensureAttemptStarted(mission.mission_id);
          if (input.name === `${mission.mission_id}-confidence`) {
            paintSelfAssessment(card, mission.mission_id);
          }
        });
      });
      button.addEventListener('click', () => handleMissionSubmit(card, mission, rerenderShell));
    });
  }

  function renderMissionList(root, emptyState, missions, clos, modules, activeFilter) {
    const filtered = activeFilter === 'all'
      ? missions
      : missions.filter((mission) => mission.module_id === activeFilter);

    if (!filtered.length) {
      root.innerHTML = '';
      emptyState.hidden = false;
      emptyState.innerHTML = 'ตอนนี้ตัวกรองนี้ยังไม่มีภารกิจแสดงอยู่ สามารถสลับกลับไปดูทั้งหมด หรือกลับไปเกลาภารกิจของโมดูลนี้เพิ่มภายหลังได้';
      return filtered;
    }

    emptyState.hidden = true;
    emptyState.innerHTML = '';
    root.innerHTML = filtered.map((mission) => renderMissionCard(mission, clos, modules)).join('');
    return filtered;
  }

  function recommendedNext(missions, modules) {
    const nextMission = missions.find((mission) => !missionState(mission.mission_id).done) || missions[0];
    if (!nextMission) return null;
    return {
      mission: nextMission,
      module: modules.find((module) => module.id === nextMission.module_id) || null,
    };
  }

  function renderNextStep(root, missions, modules) {
    const recommendation = recommendedNext(missions, modules);
    if (!recommendation) return;

    const moduleHref = recommendation.module ? `modules/${recommendation.module.slug}/index.html` : 'lessons.html';
    root.innerHTML = `
      <article class="mission-next-card">
        <strong>ลองภารกิจถัดไป</strong>
        <p>${recommendation.mission.title}</p>
        <div style="margin-top:.8rem;">
          <button type="button" class="btn" data-jump-mission="${recommendation.mission.mission_id}">ไปยังภารกิจนี้</button>
        </div>
      </article>
      <article class="mission-next-card">
        <strong>กลับไปดูโมดูลที่เกี่ยวข้อง</strong>
        <p>${recommendation.module?.title || 'กลับไปดู lesson hub ของรายวิชา'} เพื่อเชื่อมภารกิจกับ active learning ในบท</p>
        <div style="margin-top:.8rem;">
          <a href="${moduleHref}" class="btn">เปิดโมดูลที่เกี่ยวข้อง</a>
        </div>
      </article>
    `;

    root.querySelectorAll('[data-jump-mission]').forEach((button) => {
      button.addEventListener('click', () => scrollToMission(button.dataset.jumpMission));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const pageData = window.__PAGE_DATA__ || {};
    const missions = pageData.missions || [];
    const modules = pageData.modules || [];
    const clos = pageData.clos || [];

    const overview = document.getElementById('missions-overview');
    const heatmap = document.getElementById('missions-heatmap');
    const tabs = document.getElementById('missions-module-tabs');
    const root = document.getElementById('missions-root');
    const emptyState = document.getElementById('missions-empty');
    const nextGrid = document.getElementById('missions-next-grid');
    if (!root || !overview || !heatmap || !tabs || !emptyState || !nextGrid) return;

    let activeFilter = 'all';

    function rerenderShell() {
      renderOverview(overview, missions, modules);
      renderHeatmap(heatmap, missions, modules, (moduleId) => {
        activeFilter = moduleId;
        rerenderEverything();
      });
      renderModuleTabs(tabs, missions, modules, activeFilter, (moduleId) => {
        activeFilter = moduleId;
        rerenderEverything();
      });
      renderNextStep(nextGrid, missions, modules);
    }

    function rerenderEverything() {
      rerenderShell();
      const visibleMissions = renderMissionList(root, emptyState, missions, clos, modules, activeFilter);
      bindMissionCards(root, visibleMissions, rerenderShell);
      window.CourseRuntime?.renderMath?.(root);
      window.updateNavXP?.();
    }

    rerenderEverything();
  });
})();

