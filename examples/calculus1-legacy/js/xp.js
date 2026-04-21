'use strict';

// ── ระบบ XP + แบดจ์ (shared ทุกหน้า) ──
const XP_STORAGE_KEY = 'calc1_thai_xp';

const BADGES = [
  { id: 'starter',  emoji: '🌱', name: 'มือใหม่',     req: 'เริ่มเรียน', threshold: 0,
    check: (s) => s.xp >= 0 },
  { id: 'explorer', emoji: '🚀', name: 'นักสำรวจ',    req: '100 XP + เรียน 3 หัวข้อ', threshold: 100,
    check: (s) => s.xp >= 100 && s.lessonsCompleted.length >= 3 },
  { id: 'thinker',  emoji: '🧠', name: 'นักคิดเลข',    req: '300 XP + แม่น 70%', threshold: 300,
    check: (s) => s.xp >= 300 && getAccuracy(s) >= 70 },
  { id: 'differentiator', emoji: '📐', name: 'นักหาอนุพันธ์', req: '600 XP + เรียนอนุพันธ์', threshold: 600,
    check: (s) => s.xp >= 600 && s.lessonsCompleted.includes('differentiation') },
  { id: 'integrator', emoji: '∫', name: 'นักหาปริพันธ์', req: '900 XP + เรียนปริพันธ์', threshold: 900,
    check: (s) => s.xp >= 900 && s.lessonsCompleted.includes('integration') },
  { id: 'master',   emoji: '🏆', name: 'อาจารย์แคลคูลัส', req: '1500 XP + แม่น 90%', threshold: 1500,
    check: (s) => s.xp >= 1500 && getAccuracy(s) >= 90 },
  { id: 'grandmaster', emoji: '🎓', name: 'ปรมาจารย์', req: '2500 XP + ครบทุกหัวข้อ', threshold: 2500,
    check: (s) => s.xp >= 2500 &&
      ['continuity','differentiation','integration'].every(t => s.lessonsCompleted.includes(t)) },
];

function getAccuracy(state) {
  if (!state.accuracy || state.accuracy.total === 0) return 0;
  return Math.round((state.accuracy.correct / state.accuracy.total) * 100);
}

function loadState() {
  try {
    const raw = localStorage.getItem(XP_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return sanitize(parsed);
  } catch {
    return sanitize(null);
  }
}

function sanitize(s) {
  return {
    xp:               s?.xp               ?? 0,
    badges:           s?.badges           ?? [],
    lessonsCompleted: s?.lessonsCompleted ?? [],
    gamesPlayed:      s?.gamesPlayed      ?? { guess: 0, match: 0 },
    accuracy:         s?.accuracy         ?? { correct: 0, total: 0 },
    learnerName:      (typeof s?.learnerName === 'string' ? s.learnerName : ''),
  };
}

// ── Learner identity ──
function getLearnerName() {
  return loadState().learnerName || '';
}
function setLearnerName(name) {
  const state = loadState();
  state.learnerName = (name || '').trim().slice(0, 40);
  saveState(state);
  return state.learnerName;
}

function saveState(state) {
  try { localStorage.setItem(XP_STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// ── Actions ──
function addXP(amount, reason = '') {
  const state = loadState();
  state.xp += amount;
  const newBadges = checkBadges(state);
  saveState(state);
  showToast(`+${amount} XP${reason ? '  ' + reason : ''}`, '⭐');
  newBadges.forEach(b => setTimeout(() => showToast(`ปลดล็อก: ${b.name}`, b.emoji), 600));
  updateNavXP();
  return state;
}

function recordAnswer(correct) {
  const state = loadState();
  state.accuracy.total += 1;
  if (correct) state.accuracy.correct += 1;
  saveState(state);
}

function completeLesson(topicId) {
  const state = loadState();
  if (!state.lessonsCompleted.includes(topicId)) {
    state.lessonsCompleted.push(topicId);
    saveState(state);
  }
}

function incrementGame(key) {
  const state = loadState();
  state.gamesPlayed[key] = (state.gamesPlayed[key] || 0) + 1;
  saveState(state);
}

function checkBadges(state) {
  const newly = [];
  BADGES.forEach(b => {
    if (!state.badges.includes(b.id) && b.check(state)) {
      state.badges.push(b.id);
      newly.push(b);
    }
  });
  return newly;
}

// ── Toast notifications ──
function ensureToastContainer() {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function showToast(msg, emoji = '✨') {
  const c = ensureToastContainer();
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span style="font-size:1.2em;">${emoji}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Update nav XP badge (run on every page) ──
function updateNavXP() {
  const el = document.getElementById('nav-xp-total');
  if (el) {
    const state = loadState();
    el.textContent = state.xp.toLocaleString();
  }
}

// ── Confetti helper ──
function fireConfetti(n = 40) {
  const colors = ['#8b5cf6', '#fb7185', '#22d3ee', '#facc15', '#34d399'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + '%';
    el.style.top = '-10px';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = Math.random() * 0.5 + 's';
    el.style.borderRadius = Math.random() < 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

// Auto-init nav XP on DOM ready
document.addEventListener('DOMContentLoaded', updateNavXP);
