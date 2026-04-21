'use strict';

(function () {
  let identityEditMode = false;

  function getCourse() {
    return window.CourseRuntime?.getCourseConfigSync?.() || {};
  }

  function getStorageKey() {
    const course = getCourse();
    return `${course.course_id || 'course'}_xp`;
  }

  function defaultBadges(course) {
    const modules = (course.modules || []).map((module) => module.id);
    return [
      { id: 'starter', emoji: '🌱', name: 'Starter', req: 'เริ่มสะสม XP', threshold_xp: 0 },
      { id: 'explorer', emoji: '🧭', name: 'Explorer', req: '120 XP และเรียนอย่างน้อย 1 โมดูล', threshold_xp: 120, required_modules_count: 1 },
      { id: 'master', emoji: '🏆', name: 'Master', req: '300 XP และเรียนครบทุกโมดูล', threshold_xp: 300, required_modules: modules },
    ];
  }

  function getBadges(course) {
    return Array.isArray(course.badges) && course.badges.length ? course.badges : defaultBadges(course);
  }

  function sanitize(state) {
    return {
      xp: state?.xp ?? 0,
      badges: Array.isArray(state?.badges) ? state.badges : [],
      lessonsCompleted: Array.isArray(state?.lessonsCompleted) ? state.lessonsCompleted : [],
      gamesPlayed: state?.gamesPlayed ?? { guess: 0, match: 0 },
      accuracy: state?.accuracy ?? { correct: 0, total: 0 },
      learnerName: typeof state?.learnerName === 'string' ? state.learnerName : '',
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(getStorageKey());
      return sanitize(raw ? JSON.parse(raw) : {});
    } catch {
      return sanitize({});
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch {
      // ignore storage write issues
    }
  }

  function getAccuracy(state) {
    if (!state.accuracy?.total) return 0;
    return Math.round((state.accuracy.correct / state.accuracy.total) * 100);
  }

  function completedMissionIds() {
    const course = getCourse();
    const key = `${course.course_id || 'course'}_missions`;
    try {
      const raw = JSON.parse(localStorage.getItem(key) || '{}');
      return Object.entries(raw)
        .filter(([, mission]) => mission?.done)
        .map(([missionId]) => missionId);
    } catch {
      return [];
    }
  }

  function badgeUnlocked(badge, state) {
    const doneMissionIds = completedMissionIds();
    if ((badge.threshold_xp ?? 0) > state.xp) return false;
    if ((badge.required_accuracy ?? 0) > getAccuracy(state)) return false;
    if (badge.required_modules_count && state.lessonsCompleted.length < badge.required_modules_count) return false;
    if (Array.isArray(badge.required_modules) && !badge.required_modules.every((moduleId) => state.lessonsCompleted.includes(moduleId))) return false;
    if (Array.isArray(badge.required_missions) && !badge.required_missions.every((missionId) => doneMissionIds.includes(missionId))) return false;
    if (Array.isArray(badge.required_badges) && !badge.required_badges.every((badgeId) => state.badges.includes(badgeId))) return false;
    return true;
  }

  function checkBadges(state) {
    const course = getCourse();
    const unlocked = [];
    getBadges(course).forEach((badge) => {
      if (!state.badges.includes(badge.id) && badgeUnlocked(badge, state)) {
        state.badges.push(badge.id);
        unlocked.push(badge);
      }
    });
    return unlocked;
  }

  function ensureToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, emoji = '✨') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="font-size:1.2em;">${emoji}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function updateNavXP() {
    const el = document.getElementById('nav-xp-total');
    if (el) el.textContent = loadState().xp.toLocaleString();
  }

  function getNextBadge(state, course) {
    return getBadges(course)
      .filter((badge) => !state.badges.includes(badge.id))
      .sort((left, right) => (left.threshold_xp ?? 0) - (right.threshold_xp ?? 0))[0] || null;
  }

  function currentBadge(state, course) {
    const unlocked = getBadges(course).filter((badge) => state.badges.includes(badge.id));
    return unlocked[unlocked.length - 1] || getBadges(course)[0] || {
      id: 'starter',
      emoji: '🌱',
      name: 'Starter',
      threshold_xp: 0,
    };
  }

  function renderBadgeShowcase() {
    const course = getCourse();
    const state = loadState();
    const badges = getBadges(course);
    const showcase = document.getElementById('badge-showcase');

    if (showcase) {
      showcase.innerHTML = badges.map((badge) => {
        const unlocked = state.badges.includes(badge.id);
        return `
          <div class="badge ${unlocked ? 'unlocked' : 'locked'}">
            <div class="badge-emoji">${badge.emoji || '🏅'}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-req">${badge.req || 'ปลดตาม milestone ของรายวิชา'}</div>
          </div>
        `;
      }).join('');
    }

    const nextEl = document.getElementById('badge-next-status');
    if (nextEl) {
      const nextBadge = getNextBadge(state, course);
      if (!nextBadge) {
        nextEl.textContent = 'ปลดครบทุก badge ของคอร์สนี้แล้ว';
      } else {
        const xpGap = Math.max(0, (nextBadge.threshold_xp ?? 0) - state.xp);
        nextEl.textContent = xpGap > 0
          ? `เหลืออีก ${xpGap} XP เพื่อเข้าใกล้ badge "${nextBadge.name}"`
          : `XP ถึงเกณฑ์แล้ว เหลือเงื่อนไขอื่นเพื่อปลด badge "${nextBadge.name}"`;
      }
    }
  }

  function renderIdentityNameRow(state) {
    const row = document.getElementById('identity-name-row');
    if (!row) return;

    if (identityEditMode) {
      row.innerHTML = `
        <input type="text" class="identity-name-input" id="identity-name-input"
               maxlength="40" placeholder="พิมพ์ชื่อของคุณ" value="${state.learnerName || ''}" />
        <button class="btn btn-sm btn-primary" id="identity-save">บันทึก</button>
        <button class="btn btn-sm" id="identity-cancel">ยกเลิก</button>
      `;

      const input = document.getElementById('identity-name-input');
      const save = () => {
        const nextName = setLearnerName(input?.value || '');
        identityEditMode = false;
        renderIdentity();
        if (nextName) {
          showToast(`ยินดีต้อนรับ ${nextName}!`, '👋');
        }
      };
      const cancel = () => {
        identityEditMode = false;
        renderIdentity();
      };

      input?.focus();
      input?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          save();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          cancel();
        }
      });
      document.getElementById('identity-save')?.addEventListener('click', save);
      document.getElementById('identity-cancel')?.addEventListener('click', cancel);
      return;
    }

    const hasName = Boolean(state.learnerName);
    row.innerHTML = `
      <span class="identity-name ${hasName ? '' : 'placeholder'}" id="identity-name" tabindex="0"
            title="คลิกเพื่อตั้งชื่อ">${hasName ? state.learnerName : 'ยังไม่ได้ตั้งชื่อ - คลิกเพื่อตั้งชื่อ'}</span>
      <button class="identity-name-edit-btn" id="identity-name-edit">✏️ แก้ไข</button>
    `;

    const openEditor = () => {
      identityEditMode = true;
      renderIdentity();
    };

    document.getElementById('identity-name')?.addEventListener('click', openEditor);
    document.getElementById('identity-name')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openEditor();
      }
    });
    document.getElementById('identity-name-edit')?.addEventListener('click', openEditor);
  }

  function renderIdentity() {
    const course = getCourse();
    const state = loadState();
    const current = currentBadge(state, course);
    const next = getNextBadge(state, course);
    const pct = next && (next.threshold_xp ?? 0) > 0
      ? Math.min(100, Math.round((state.xp / next.threshold_xp) * 100))
      : 100;

    const avatar = document.getElementById('identity-avatar');
    if (avatar) avatar.style.setProperty('--xp-pct', pct);

    const avatarEmoji = document.getElementById('identity-avatar-emoji');
    if (avatarEmoji) avatarEmoji.textContent = current.emoji || '🌱';

    const xpNum = document.getElementById('identity-xp-num');
    if (xpNum) xpNum.textContent = state.xp.toLocaleString();

    const greeting = document.getElementById('identity-greeting');
    if (greeting) {
      greeting.textContent = `👋 ยินดีต้อนรับสู่ ${course.course_short_name || course.course_name_th || 'คอร์สนี้'}`;
    }

    renderIdentityNameRow(state);

    const badgeEmoji = document.getElementById('identity-badge-emoji');
    if (badgeEmoji) badgeEmoji.textContent = current.emoji || '🌱';

    const badgeName = document.getElementById('identity-badge-name');
    if (badgeName) badgeName.textContent = current.name || 'Starter';

    const progress = document.getElementById('identity-progress');
    if (progress) {
      progress.innerHTML = next
        ? `อีก <b>${Math.max(0, (next.threshold_xp ?? 0) - state.xp).toLocaleString()}</b> XP ไปยัง ${next.emoji || '🏅'} ${next.name}`
        : 'ปลดครบทุก badge ของคอร์สนี้แล้ว';
    }
  }

  function renderProgressDashboard() {
    const course = getCourse();
    const state = loadState();
    const current = currentBadge(state, course);
    const next = getNextBadge(state, course);
    const pct = next && (next.threshold_xp ?? 0) > 0
      ? Math.min(100, Math.round((state.xp / next.threshold_xp) * 100))
      : 100;

    const ring = document.getElementById('xp-ring');
    if (ring) ring.style.setProperty('--xp-pct', pct);

    const total = document.getElementById('xp-total-big');
    if (total) total.textContent = state.xp.toLocaleString();

    const level = document.getElementById('xp-level');
    if (level) level.textContent = `${current.emoji || '🌱'} ${current.name || 'Starter'}`;

    const nextEl = document.getElementById('xp-next');
    if (nextEl) {
      nextEl.textContent = next
        ? `อีก ${Math.max(0, (next.threshold_xp ?? 0) - state.xp).toLocaleString()} XP ไปยัง ${next.emoji || '🏅'} ${next.name}`
        : 'ปลดครบทุก badge ของคอร์สนี้แล้ว';
    }

    const lessons = document.getElementById('stat-lessons');
    if (lessons) lessons.textContent = state.lessonsCompleted.length.toLocaleString();

    const accuracy = document.getElementById('stat-accuracy');
    if (accuracy) accuracy.textContent = `${getAccuracy(state)}%`;

    const games = document.getElementById('stat-games');
    if (games) {
      const totalGames = Object.values(state.gamesPlayed || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
      games.textContent = totalGames.toLocaleString();
    }

    const badges = document.getElementById('stat-badges');
    if (badges) badges.textContent = `${state.badges.length} / ${getBadges(course).length}`;
  }

  function bindResetButton() {
    const button = document.getElementById('btn-reset');
    if (!button || button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      localStorage.removeItem(getStorageKey());
      showToast('ล้างข้อมูลคอร์สนี้เรียบร้อย', '🗑️');
      setTimeout(() => window.location.reload(), 250);
    });
  }

  function refreshProgressUI() {
    updateNavXP();
    renderIdentity();
    renderProgressDashboard();
    renderBadgeShowcase();
    bindResetButton();
  }

  function addXP(amount, reason = '') {
    const state = loadState();
    state.xp += amount;
    const newBadges = checkBadges(state);
    saveState(state);
    showToast(`+${amount} XP${reason ? `  ${reason}` : ''}`, '⭐');
    newBadges.forEach((badge, index) => {
      setTimeout(() => showToast(`ปลดล็อก: ${badge.name}`, badge.emoji || '🏅'), 450 * (index + 1));
    });
    refreshProgressUI();
    return state;
  }

  function recordAnswer(correct) {
    const state = loadState();
    state.accuracy.total += 1;
    if (correct) state.accuracy.correct += 1;
    const newBadges = checkBadges(state);
    saveState(state);
    newBadges.forEach((badge, index) => {
      setTimeout(() => showToast(`ปลดล็อก: ${badge.name}`, badge.emoji || '🏅'), 450 * (index + 1));
    });
    refreshProgressUI();
  }

  function completeLesson(moduleId, xpReward) {
    const state = loadState();
    if (state.lessonsCompleted.includes(moduleId)) return false;
    state.lessonsCompleted.push(moduleId);
    saveState(state);
    addXP(xpReward ?? getCourse().lesson_completion_xp ?? 30, `จบบทเรียน ${moduleId}`);
    return true;
  }

  function incrementGame(key) {
    const state = loadState();
    state.gamesPlayed[key] = (state.gamesPlayed[key] || 0) + 1;
    saveState(state);
    refreshProgressUI();
  }

  function getLearnerName() {
    return loadState().learnerName || '';
  }

  function setLearnerName(name) {
    const state = loadState();
    state.learnerName = String(name || '').trim().slice(0, 40);
    saveState(state);
    return state.learnerName;
  }

  function fireConfetti(n = 40) {
    const colors = ['#8b5cf6', '#fb7185', '#22d3ee', '#facc15', '#34d399'];
    for (let i = 0; i < n; i += 1) {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = '-10px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = `${Math.random() * 0.5}s`;
      el.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  }

  window.loadState = loadState;
  window.saveState = saveState;
  window.addXP = addXP;
  window.recordAnswer = recordAnswer;
  window.completeLesson = completeLesson;
  window.incrementGame = incrementGame;
  window.getLearnerName = getLearnerName;
  window.setLearnerName = setLearnerName;
  window.updateNavXP = updateNavXP;
  window.renderBadgeShowcase = renderBadgeShowcase;
  window.renderIdentity = renderIdentity;
  window.fireConfetti = fireConfetti;

  document.addEventListener('DOMContentLoaded', () => {
    refreshProgressUI();
  });
})();
