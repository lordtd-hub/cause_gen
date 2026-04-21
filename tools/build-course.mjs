#!/usr/bin/env node

import path from 'node:path';
import {
  REPO_ROOT,
  TEMPLATES_DIR,
  ensureDir,
  loadCourseProject,
  moduleSummary,
  readText,
  renderTemplate,
  writeJson,
  writeText,
  fileExists,
  copyDir,
  copyFile,
  resolveCourseDir,
  resolveOutputDir,
  getCoursePaths,
} from './lib/course-lib.mjs';

function parseArgs(argv) {
  const options = {
    courseDir: null,
    outputDir: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--output-dir') {
      options.outputDir = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/build-course.mjs [--course-dir courses/<course-dir>] [--output-dir courses/<course-id>/output]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const courseDir = resolveCourseDir(options.courseDir ?? undefined);
const coursePaths = getCoursePaths(courseDir);
const { config, modules, missions, resources } = await loadCourseProject(courseDir);
const outputDir = resolveOutputDir(config.course_id, options.outputDir, courseDir);

const layoutTemplate = await readText(path.join(TEMPLATES_DIR, 'layout.html'));
const moduleTemplate = await readText(path.join(TEMPLATES_DIR, 'module.html'));

function topNav(basePath, pageId) {
  const links = [
    { id: 'index', href: `${basePath}index.html`, label: 'หน้าแรก', icon: '🏠' },
    { id: 'intro', href: `${basePath}intro.html`, label: 'แนะนำ', icon: '🌱' },
    { id: 'lessons', href: `${basePath}lessons.html`, label: 'Lessons', icon: '📚' },
  ];

  if (config.features.missions) {
    links.push({ id: 'missions', href: `${basePath}missions.html`, label: 'Missions', icon: '🎯' });
  }
  if (config.features.resources) {
    links.push({ id: 'resources', href: `${basePath}content/`, label: 'Resources', icon: '📄' });
  }

  return links.map((link) => {
    const active = link.id === pageId ? ' active' : '';
    return `<a href="${link.href}" class="nav-link${active}"><span class="nl-icon">${link.icon}</span>${link.label}</a>`;
  }).join('\n');
}

function pageScripts(basePath, scripts = []) {
  const defaults = [
    `${basePath}assets/js/course-runtime.js`,
    `${basePath}assets/js/xp.js`,
    `${basePath}assets/js/nav.js`,
  ];
  return [...defaults, ...scripts]
    .map((src) => `<script src="${src}"></script>`)
    .join('\n');
}

function shell(pageId, title, body, options = {}) {
  const basePath = options.basePath ?? '';
  const pageData = options.pageData ?? {};
  return renderTemplate(layoutTemplate, {
    TITLE: title,
    PAGE_ID: pageId,
    BODY: body,
    BRAND_ICON: config.theme.brand_icon ?? 'โ',
    COURSE_SHORT_NAME: config.course_short_name,
    NAV_LINKS: topNav(basePath, pageId),
    BASE_PATH: basePath,
    HEAD_EXTRA: options.headExtra ?? '',
    COURSE_CONFIG_JSON: JSON.stringify(config),
    PAGE_DATA_JSON: JSON.stringify(pageData),
    SCRIPTS: pageScripts(basePath, options.scripts ?? []),
  });
}

const modulePageStyles = `
<style>
  .module-content { line-height: 1.9; }
  .module-content h1:first-child { display: none; }
  .module-content h2 { margin-top: 1.5rem; font-size: 1.35rem; }
  .module-content h3 { margin-top: 1.1rem; font-size: 1.05rem; }
  .module-content blockquote {
    background: rgba(34,211,238,0.06);
    border-left: 3px solid var(--color-accent2);
    padding: .75rem 1rem;
    border-radius: 0 8px 8px 0;
    color: var(--color-text);
  }
  .module-content pre {
    background: rgba(0,0,0,.28);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 1rem;
    overflow: auto;
  }
  .module-content ul { padding-left: 1.25rem; }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    padding: .3rem .7rem;
    border-radius: 999px;
    font-size: .8rem;
    font-weight: 700;
    border: 1px solid var(--color-border);
    background: rgba(255,255,255,.04);
    color: var(--color-text);
  }
  .interactive-widget {
    margin: 1rem 0;
    background: rgba(10,6,20,.75);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 1rem;
  }
  .widget-title { font-weight: 800; font-size: 1.05rem; color: #fff; margin-bottom: .35rem; }
  .widget-desc { color: var(--color-muted); font-size: .88rem; margin-bottom: .9rem; line-height: 1.7; }
  .widget-grid { display: grid; gap: 1rem; }
  @media (min-width: 900px) { .widget-grid.graphish { grid-template-columns: 1.2fr .8fr; } }
  .widget-controls { display: grid; gap: .75rem; }
  .widget-control label { display:block; font-size:.85rem; font-weight:700; margin-bottom:.2rem; }
  .widget-control input[type=range] { width:100%; }
  .widget-value { color: var(--color-accent2); font-weight: 700; }
  .widget-canvas-wrap { background:#0a0614; border-radius:12px; padding:.5rem; }
  .widget-canvas-wrap canvas { width:100%; height:320px; display:block; }
  .quick-check-choices { display:grid; gap:.5rem; margin-top:.75rem; }
  .quick-check-choice { text-align:left; }
  .widget-feedback {
    margin-top: .75rem;
    padding: .7rem .9rem;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    background: rgba(255,255,255,.04);
  }
  .definition-grid { display:grid; gap:.75rem; }
  .definition-item {
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255,255,255,.03);
  }
  .definition-item button {
    width:100%;
    text-align:left;
    background:none;
    border:none;
    color:#fff;
    padding:.9rem 1rem;
    font:inherit;
    cursor:pointer;
  }
  .definition-detail {
    padding:0 1rem 1rem;
    color: var(--color-muted);
    line-height: 1.7;
  }
  .proof-box, .step-box {
    background: rgba(255,255,255,.03);
    border: 1px dashed var(--color-border);
    border-radius: 12px;
    padding: .9rem 1rem;
    margin-top: .75rem;
  }
  .proof-steps, .step-sequence-nav { display:grid; gap:.5rem; margin-top:.75rem; }
  .sequence-progress { color: var(--color-muted); font-size: .82rem; margin-bottom: .5rem; }
  .lesson-activity-grid {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
    gap:.75rem;
    margin-top:.85rem;
  }
  .lesson-activity-card {
    border:1px dashed var(--color-border);
    border-radius:12px;
    background:rgba(10,6,20,.45);
    padding:.85rem;
  }
  .lesson-activity-card strong {
    display:block;
    color:#fff;
    margin-bottom:.25rem;
  }
  .lesson-activity-card p {
    margin:0;
    color:var(--color-muted);
    line-height:1.7;
    font-size:.88rem;
  }
  .lesson-page-note {
    color:var(--color-muted);
    line-height:1.8;
  }
  .module-kicker-grid,
  .module-next-grid {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
    gap:.85rem;
  }
  .module-kicker-card,
  .module-next-card {
    border:1px solid var(--color-border);
    border-radius:12px;
    background:rgba(255,255,255,.03);
    padding:.95rem 1rem;
  }
  .module-kicker-card strong,
  .module-next-card strong {
    display:block;
    color:#fff;
    margin-bottom:.3rem;
  }
  .module-kicker-card p,
  .module-next-card p {
    margin:0;
    color:var(--color-muted);
    line-height:1.75;
    font-size:.9rem;
  }
  .module-roadmap-list,
  .module-reflection-list {
    display:grid;
    gap:.75rem;
    margin-top:.9rem;
  }
  .module-roadmap-item,
  .module-reflection-item {
    border:1px dashed var(--color-border);
    border-radius:12px;
    background:rgba(10,6,20,.4);
    padding:.85rem .95rem;
  }
  .module-roadmap-item {
    display:flex;
    gap:.8rem;
    align-items:flex-start;
  }
  .module-roadmap-num {
    width:1.9rem;
    height:1.9rem;
    flex-shrink:0;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    border-radius:999px;
    background:rgba(139,92,246,.14);
    border:1px solid rgba(139,92,246,.35);
    color:#fff;
    font-weight:800;
    font-size:.82rem;
  }
  .module-roadmap-item strong,
  .module-reflection-item strong {
    display:block;
    color:#fff;
    margin-bottom:.25rem;
  }
  .module-roadmap-item p,
  .module-reflection-item p {
    margin:0;
    color:var(--color-muted);
    line-height:1.75;
  }
  .module-nav-link {
    display:inline-flex;
    align-items:center;
    gap:.45rem;
    margin-top:.75rem;
    color:var(--color-accent2);
    font-weight:700;
  }
  .module-content h2[id] {
    scroll-margin-top: 96px;
  }
</style>
`;

const missionsPageStyles = `
<style>
  .mission-grid { display: grid; gap: 1rem; }
  .mission-page-note {
    color: var(--color-muted);
    line-height: 1.8;
  }
  .mission-primer-grid {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
    gap:.85rem;
    margin-top:1rem;
  }
  .mission-primer-card,
  .mission-next-card,
  .mission-overview-card {
    background:rgba(255,255,255,.03);
    border:1px solid var(--color-border);
    border-radius:12px;
    padding:.9rem 1rem;
  }
  .mission-primer-card strong,
  .mission-next-card strong,
  .mission-overview-card strong {
    display:block;
    color:#fff;
    margin-bottom:.25rem;
  }
  .mission-primer-card p,
  .mission-next-card p,
  .mission-overview-card p {
    margin:0;
    color:var(--color-muted);
    line-height:1.7;
    font-size:.9rem;
  }
  .mission-overview {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
    gap:.75rem;
    margin-top:1rem;
  }
  .mission-overview-card .mission-overview-number {
    font-size:1.35rem;
    font-weight:800;
    color:#fff;
    margin:.15rem 0;
  }
  .mission-heatmap {
    display:grid;
    grid-template-columns:minmax(150px, 1.2fr) repeat(6, minmax(48px, 1fr));
    gap:.35rem;
    margin-top:1rem;
    font-size:.8rem;
  }
  .heatmap-head {
    padding:.5rem .3rem;
    text-align:center;
    font-weight:700;
    color:var(--color-muted);
    background:rgba(255,255,255,.03);
    border-radius:10px;
    line-height:1.25;
  }
  .heatmap-row-label {
    padding:.55rem .65rem;
    background:rgba(255,255,255,.03);
    border-radius:10px;
    color:#fff;
    font-weight:700;
    display:flex;
    align-items:center;
  }
  .heatmap-cell {
    min-height:48px;
    border:1px solid var(--color-border);
    border-radius:10px;
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(8,10,20,.55);
    color:var(--color-muted);
    transition:all .15s ease;
    cursor:pointer;
    text-align:center;
    padding:.2rem;
    font-size:.86rem;
    font-weight:700;
  }
  .heatmap-cell.available {
    background:rgba(139,92,246,.1);
    border-color:rgba(139,92,246,.4);
    color:#fff;
  }
  .heatmap-cell.completed {
    background:linear-gradient(135deg, rgba(52,211,153,.22), rgba(34,211,238,.15));
    border-color:rgba(52,211,153,.55);
    color:#fff;
  }
  .heatmap-cell.locked {
    opacity:.4;
    cursor:default;
  }
  .heatmap-cell:hover:not(.locked) {
    border-color:var(--color-accent2);
    transform:translateY(-1px);
  }
  .topic-tabs {
    display:flex;
    flex-wrap:wrap;
    gap:.45rem;
    margin:1rem 0 0;
  }
  .topic-tab {
    padding:.45rem .95rem;
    background:rgba(255,255,255,.03);
    border:1px solid var(--color-border);
    border-radius:999px;
    color:var(--color-muted);
    cursor:pointer;
    transition:all .15s ease;
    font:inherit;
  }
  .topic-tab:hover {
    color:#fff;
    border-color:rgba(139,92,246,.4);
  }
  .topic-tab.active {
    background:linear-gradient(135deg, var(--color-primary), var(--color-accent1));
    border-color:transparent;
    color:#fff;
    font-weight:700;
  }
  .mission-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 1rem;
  }
  .mission-card[hidden] { display:none; }
  .mission-meta { display:flex; flex-wrap:wrap; gap:.5rem; margin:.65rem 0; }
  .mission-chip {
    display:inline-flex;
    align-items:center;
    padding:.22rem .6rem;
    border-radius:999px;
    background:rgba(139,92,246,.15);
    border:1px solid rgba(139,92,246,.35);
    font-size:.75rem;
    font-weight:700;
  }
  .mission-rubric { margin:.65rem 0; padding-left:1.1rem; color:var(--color-muted); }
  .mission-step {
    border:1px dashed var(--color-border);
    border-radius:12px;
    padding:.85rem 1rem;
    margin-top:.85rem;
    background:rgba(255,255,255,.03);
  }
  .mission-step h3 { margin:0 0 .45rem; font-size:1rem; }
  .mission-options { display:grid; gap:.45rem; margin-top:.6rem; }
  .mission-support-box {
    display:none;
    margin-top:.75rem;
    padding:.8rem .95rem;
    border-radius:10px;
    border:1px solid var(--color-border);
    background:rgba(255,255,255,.04);
    color:var(--color-muted);
    line-height:1.75;
  }
  .mission-support-box.show {
    display:block;
  }
  .mission-confidence-stars {
    display:flex;
    flex-wrap:wrap;
    gap:.55rem;
  }
  .star-btn {
    display:inline-flex;
    align-items:center;
    gap:.35rem;
    padding:.45rem .65rem;
    border-radius:999px;
    border:1px solid var(--color-border);
    background:rgba(255,255,255,.03);
    cursor:pointer;
    transition:all .15s ease;
    color:var(--color-muted);
  }
  .star-btn input {
    position:absolute;
    opacity:0;
    pointer-events:none;
  }
  .star-btn .star-face {
    color:#facc15;
    font-size:1rem;
    line-height:1;
  }
  .star-btn .star-num {
    font-size:.82rem;
    font-weight:700;
  }
  .star-btn.on,
  .star-btn:hover {
    border-color:rgba(250,204,21,.5);
    background:rgba(250,204,21,.12);
    color:#fff;
    transform:translateY(-1px);
  }
  .mission-result {
    margin-top:.85rem;
    padding:.8rem .95rem;
    border-radius:10px;
    background:rgba(34,211,238,.08);
    border:1px solid rgba(34,211,238,.25);
  }
  .mission-list-empty {
    margin-top:1rem;
    padding:1rem 1.1rem;
    border:1px dashed var(--color-border);
    border-radius:12px;
    color:var(--color-muted);
    line-height:1.8;
    background:rgba(255,255,255,.03);
  }
  .mission-next-grid {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));
    gap:.85rem;
    margin-top:1rem;
  }
  @media (max-width: 760px) {
    .mission-heatmap {
      grid-template-columns:minmax(120px, 1.2fr) repeat(6, minmax(40px, 1fr));
      font-size:.72rem;
    }
    .heatmap-cell { min-height:42px; }
  }
</style>
`;

const introPageStyles = `
<style>
  .intro-grid {
    display:grid;
    grid-template-columns:1fr;
    gap:1rem;
  }
  @media (min-width: 880px) {
    .intro-grid {
      grid-template-columns:1.1fr .9fr;
    }
  }
  .intro-soft-card {
    background:linear-gradient(135deg, rgba(34,211,238,.08), rgba(139,92,246,.07));
    border:1px solid rgba(34,211,238,.2);
  }
  .intro-soft-card p,
  .intro-soft-card li {
    color:var(--color-muted);
    line-height:1.8;
  }
  .intro-route-grid {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
    gap:.9rem;
    margin-top:1rem;
  }
  .intro-route-card {
    background:rgba(255,255,255,.03);
    border:1px solid var(--color-border);
    border-radius:var(--radius);
    padding:1rem;
  }
  .intro-route-card strong {
    color:#fff;
    display:block;
    margin-bottom:.3rem;
  }
  .intro-route-card p {
    color:var(--color-muted);
    line-height:1.7;
    font-size:.9rem;
  }
  .intro-checklist {
    margin:0;
    padding-left:1.2rem;
  }
  .intro-checklist li {
    margin:.3rem 0;
  }
</style>
`;

const lessonsPageStyles = `
<style>
  .lesson-module-rail {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
    gap:.75rem;
    margin-top:1rem;
  }
  .lesson-rail-link {
    display:block;
    padding:.85rem 1rem;
    border-radius:14px;
    border:1px solid var(--color-border);
    background:rgba(255,255,255,.03);
    color:var(--color-text);
    text-decoration:none;
  }
  .lesson-rail-link strong {
    display:block;
    color:#fff;
    margin-bottom:.2rem;
  }
  .lesson-roadmap-grid {
    display:grid;
    gap:1rem;
    margin-top:1rem;
  }
  .lesson-roadmap-card {
    border:1px solid var(--color-border);
    border-radius:var(--radius);
    background:rgba(255,255,255,.03);
    padding:1rem;
  }
  .lesson-roadmap-head {
    display:flex;
    justify-content:space-between;
    gap:.75rem;
    align-items:flex-start;
    flex-wrap:wrap;
  }
  .lesson-order-pill {
    display:inline-flex;
    align-items:center;
    justify-content:center;
    min-width:2rem;
    height:2rem;
    padding:0 .65rem;
    border-radius:999px;
    background:rgba(34,211,238,.12);
    border:1px solid rgba(34,211,238,.28);
    font-weight:800;
    color:#fff;
  }
  .lesson-roadmap-summary {
    color:var(--color-muted);
    line-height:1.8;
    margin:.7rem 0;
  }
  .lesson-meta-row {
    display:flex;
    flex-wrap:wrap;
    gap:.45rem;
    margin:.75rem 0;
  }
  .lesson-mini-pill {
    display:inline-flex;
    align-items:center;
    padding:.2rem .6rem;
    border-radius:999px;
    border:1px solid var(--color-border);
    background:rgba(255,255,255,.04);
    font-size:.78rem;
    font-weight:700;
  }
  .lesson-activity-grid {
    display:grid;
    grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
    gap:.75rem;
    margin-top:.85rem;
  }
  .lesson-activity-card {
    border:1px dashed var(--color-border);
    border-radius:12px;
    background:rgba(10,6,20,.45);
    padding:.85rem;
  }
  .lesson-activity-card strong {
    display:block;
    color:#fff;
    margin-bottom:.25rem;
  }
  .lesson-activity-card p {
    margin:0;
    color:var(--color-muted);
    line-height:1.7;
    font-size:.88rem;
  }
  .lesson-page-note {
    color:var(--color-muted);
    line-height:1.8;
  }
</style>
`;

const resourcesPageStyles = `
<style>
  .resource-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:.9rem; }
  .resource-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 1rem;
    color: var(--color-text);
  }
  .resource-meta { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.75rem; }
  .resource-note {
    margin-top:.75rem;
    padding:.65rem .8rem;
    border-left:3px solid var(--color-accent2);
    background:rgba(34,211,238,.06);
    border-radius:0 8px 8px 0;
    color:var(--color-text);
  }
</style>
`;

const homePageStyles = `
<style>
  .identity-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.5rem;
    align-items: center;
    background: linear-gradient(135deg, var(--color-surface), var(--color-surface2));
    border: 1px solid rgba(139, 92, 246, 0.35);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin: 1.25rem auto 1rem;
    box-shadow: 0 20px 60px -20px rgba(139, 92, 246, 0.5);
    position: relative;
    overflow: hidden;
  }
  .identity-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 15% 20%, rgba(139,92,246,0.18), transparent 40%),
      radial-gradient(circle at 85% 80%, rgba(251,113,133,0.12), transparent 45%);
    pointer-events: none;
  }
  .identity-avatar {
    position: relative;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    padding: 8px;
    background: conic-gradient(
      var(--color-accent3) calc(var(--xp-pct, 0) * 1%),
      rgba(255,255,255,0.08) 0
    );
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .identity-avatar-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a1030, #2a1e4d);
    display: grid;
    place-items: center;
    border: 2px solid rgba(255,255,255,0.08);
    position: relative;
  }
  .identity-avatar-emoji {
    font-size: 3.8rem;
    line-height: 1;
    filter: drop-shadow(0 4px 12px rgba(139,92,246,0.5));
  }
  .identity-xp-pill {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, var(--color-accent3), #f97316);
    color: #1a1030;
    font-weight: 800;
    font-size: .75rem;
    padding: .2rem .7rem;
    border-radius: 999px;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(250,204,21,0.4);
  }
  .identity-body {
    position: relative;
    z-index: 1;
    min-width: 0;
  }
  .identity-greeting {
    color: var(--color-muted);
    font-size: .9rem;
    margin-bottom: .15rem;
    display: flex;
    align-items: center;
    gap: .4rem;
  }
  .identity-name-row {
    display: flex;
    align-items: baseline;
    gap: .5rem;
    flex-wrap: wrap;
    margin-bottom: .4rem;
  }
  .identity-name {
    font-size: 1.8rem;
    font-weight: 900;
    background: linear-gradient(135deg, #fff 0%, var(--color-primary-light) 55%, var(--color-accent1) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.15;
    cursor: pointer;
    border-bottom: 2px dashed transparent;
    transition: border-color .2s;
    min-width: 200px;
  }
  .identity-name:hover { border-bottom-color: rgba(167,139,250,.5); }
  .identity-name.placeholder {
    -webkit-text-fill-color: var(--color-muted);
    color: var(--color-muted);
    font-weight: 600;
    font-size: 1.3rem;
    font-style: italic;
  }
  .identity-name-edit-btn {
    background: rgba(139,92,246,.18);
    border: 1px solid rgba(139,92,246,.45);
    color: var(--color-primary-light);
    font-size: .7rem;
    padding: .15rem .5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all .15s;
  }
  .identity-name-edit-btn:hover {
    background: rgba(139,92,246,.35);
    color: #fff;
  }
  .identity-name-input {
    font-size: 1.5rem;
    font-weight: 800;
    background: rgba(255,255,255,.06);
    border: 1px solid var(--color-primary);
    color: #fff;
    padding: .35rem .6rem;
    border-radius: 8px;
    font-family: inherit;
    outline: none;
    width: 100%;
    max-width: 320px;
    box-shadow: 0 0 0 3px rgba(139,92,246,.25);
  }
  .identity-badge-chip {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(251,113,133,0.15));
    border: 1px solid rgba(139,92,246,0.4);
    padding: .35rem .8rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: .95rem;
    color: #fff;
    margin-right: .5rem;
  }
  .identity-badge-emoji {
    font-size: 1.15rem;
    filter: drop-shadow(0 2px 6px rgba(250,204,21,0.4));
  }
  .identity-progress {
    color: var(--color-muted);
    font-size: .85rem;
    margin-top: .25rem;
  }
  .identity-progress b {
    color: var(--color-accent3);
    font-weight: 700;
  }
  .identity-attrib {
    display: inline-block;
    margin-top: .8rem;
    color: var(--color-muted);
    font-size: .78rem;
    font-style: italic;
    padding: .2rem .6rem;
    border-left: 2px solid var(--color-primary);
    background: rgba(139,92,246,.06);
    border-radius: 4px;
  }
  .howto-card {
    background: linear-gradient(135deg, rgba(34,211,238,0.08), rgba(139,92,246,0.05));
    border: 1px solid rgba(34,211,238,0.25);
  }
  .howto-steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: .85rem;
    margin-top: 1rem;
  }
  .howto-step {
    background: rgba(0,0,0,0.18);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: var(--radius-sm);
    padding: .9rem 1rem;
    display: flex;
    gap: .75rem;
    align-items: flex-start;
    transition: all .2s;
  }
  .howto-step:hover {
    border-color: var(--color-accent2);
    transform: translateY(-2px);
  }
  .howto-num {
    flex-shrink: 0;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent1));
    color: #fff;
    font-weight: 900;
    font-size: 1.05rem;
    display: grid;
    place-items: center;
    box-shadow: 0 4px 10px rgba(139,92,246,0.35);
  }
  .howto-title {
    font-weight: 700;
    color: #fff;
    margin-bottom: .15rem;
    font-size: .95rem;
  }
  .howto-desc {
    color: var(--color-muted);
    font-size: .82rem;
    line-height: 1.5;
  }
  .xp-info {
    min-width: 0;
    width: 100%;
  }
  .home-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: .75rem;
    margin-top: 1rem;
  }
  .stat-tile {
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 14px;
    background: rgba(10,6,20,.34);
    padding: .8rem .9rem;
    min-width: 0;
  }
  .stat-val {
    font-size: 1.2rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
  }
  .stat-lbl {
    color: var(--color-muted);
    font-size: .78rem;
    line-height: 1.45;
    margin-top: .22rem;
  }
  @media (max-width: 780px) {
    .home-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 540px) {
    .xp-info {
      text-align: center;
    }
    .home-stats {
      grid-template-columns: 1fr;
      width: 100%;
    }
  }
  .badge-roadmap {
    margin-top: 1rem;
    color: var(--color-muted);
    line-height: 1.7;
    font-size: .88rem;
  }
  .section-heading {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 2rem 0 1rem;
  }
  .mission-spotlight {
    background: linear-gradient(135deg, rgba(251,113,133,0.15), rgba(139,92,246,0.12));
    border: 2px dashed rgba(251,113,133,0.6);
    position: relative;
  }
  .mission-spotlight .new-pill {
    position: absolute;
    top: -10px;
    right: 14px;
    background: linear-gradient(135deg, var(--color-accent3), #f97316);
    color: #1a1030;
    font-size: .7rem;
    font-weight: 900;
    padding: .2rem .65rem;
    border-radius: 999px;
    box-shadow: 0 4px 10px rgba(250,204,21,0.4);
  }
  @media (max-width: 700px) {
    .identity-card {
      grid-template-columns: 1fr;
    }
    .identity-avatar {
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }
    .identity-avatar-emoji { font-size: 3.2rem; }
    .identity-name {
      font-size: 1.5rem;
      min-width: 0;
    }
    .identity-name-row {
      justify-content: center;
    }
  }
</style>
`;

function cloListHtml() {
  return config.clos.map((clo) => `
    <div class="card" style="margin-top:.85rem;">
      <div class="card-title">${clo.id}</div>
      <p>${clo.label}</p>
      <div class="text-small text-muted">Bloom: ${clo.bloom} | Tags: ${(clo.assessment_tags || []).join(', ')}</div>
    </div>
  `).join('\n');
}

function moduleCards(basePath) {
  return modules.map((module) => {
    const meta = moduleSummary(module);
    return `
      <a class="topic-card card-purple" href="${basePath}modules/${meta.slug}/">
        <div class="tc-head">
          <div class="tc-icon">${meta.module_kind === 'proof' ? '🧠' : '📈'}</div>
          <div>
            <div class="tc-title">${meta.title}</div>
            <div class="text-small text-muted">โมดูล ${meta.order}</div>
          </div>
        </div>
        <div class="tc-desc">${meta.summary}</div>
      </a>
    `;
  }).join('\n');
}

const WIDGET_LIBRARY = {
  'graph-explorer': {
    icon: '📈',
    label: 'สำรวจกราฟ',
    description: 'ใช้ภาพกราฟเพื่อช่วยตั้งข้อสังเกตก่อนลงมืออธิบายหรือแก้ปัญหา',
  },
  'parameter-playground': {
    icon: '🎛️',
    label: 'ทดลองปรับพารามิเตอร์',
    description: 'เลื่อนค่าทีละตัวแล้วสังเกตว่าพฤติกรรมของนิยาม ฟังก์ชัน หรืออัลกอริทึมเปลี่ยนอย่างไร',
  },
  'quick-check': {
    icon: '✅',
    label: 'เช็กความเข้าใจระหว่างบท',
    description: 'หยุดตอบคำถามสั้น ๆ เพื่อดูว่าจับใจความสำคัญของบทได้แล้วหรือยัง',
  },
  'definition-visualizer': {
    icon: '🧩',
    label: 'คลี่นิยามทีละส่วน',
    description: 'แยกนิยามหรือเงื่อนไขสำคัญออกเป็นชิ้น ๆ เพื่อมองความหมายได้ชัดขึ้น',
  },
  'proof-unpack': {
    icon: '🧠',
    label: 'แกะโครงพิสูจน์',
    description: 'ค่อย ๆ เปิดเหตุผลของ proof ทีละช่วง เพื่อเห็นความสัมพันธ์ระหว่างสมมติฐานกับข้อสรุป',
  },
  'step-sequence': {
    icon: '🪜',
    label: 'ไล่ขั้นตอนการคิด',
    description: 'เหมาะกับโจทย์ที่ต้องค่อย ๆ เห็นลำดับการคิดก่อนจะไปถึงคำตอบหรือข้อพิสูจน์',
  },
};

function widgetInfo(widgetId) {
  return WIDGET_LIBRARY[widgetId] ?? {
    icon: '💡',
    label: widgetId,
    description: 'กิจกรรม interactive ของบทนี้จะถูกเติมต่อในรอบ authoring',
  };
}

function activeLearningCards(widgetIds, emptyMessage = 'บทนี้จะเติมกิจกรรม active learning เพิ่มได้ในรอบ authoring') {
  const items = Array.isArray(widgetIds) ? widgetIds : [];
  if (!items.length) {
    return `<div class="lesson-page-note">${emptyMessage}</div>`;
  }

  return `
    <div class="lesson-activity-grid">
      ${items.map((widgetId) => {
        const widget = widgetInfo(widgetId);
        return `
          <div class="lesson-activity-card">
            <strong>${widget.icon} ${widget.label}</strong>
            <p>${widget.description}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function lessonsModuleRailHtml() {
  return modules.map((module) => {
    const meta = moduleSummary(module);
    return `
      <a class="lesson-rail-link" href="#lesson-module-${meta.slug}">
        <strong>โมดูล ${meta.order}</strong>
        <span>${meta.title}</span>
      </a>
    `;
  }).join('\n');
}

function lessonsRoadmapHtml() {
  return modules.map((module) => {
    const meta = moduleSummary(module);
    return `
      <article class="lesson-roadmap-card" id="lesson-module-${meta.slug}">
        <div class="lesson-roadmap-head">
          <div>
            <div class="text-small text-muted">โมดูล ${meta.order}</div>
            <div class="card-title" style="margin-top:.15rem;">${meta.title}</div>
          </div>
          <span class="lesson-order-pill">${meta.order}</span>
        </div>
        <p class="lesson-roadmap-summary">${meta.summary}</p>
        <div class="lesson-meta-row">
          <span class="lesson-mini-pill">ชนิด: ${meta.module_kind}</span>
          <span class="lesson-mini-pill">${(meta.clo_ids || []).length} CLOs</span>
          <span class="lesson-mini-pill">${(meta.widgets || []).length} active blocks</span>
        </div>
        <div class="text-small text-muted" style="font-weight:700; margin-top:.65rem;">Active learning ในบทนี้</div>
        ${activeLearningCards(meta.widgets)}
        <div class="flex-row" style="margin-top:1rem; justify-content:flex-start;">
          <a href="modules/${meta.slug}/" class="btn btn-primary">เปิดบทนี้</a>
        </div>
      </article>
    `;
  }).join('\n');
}

function resourceHref(item) {
  if (item.type === 'link') return item.url;
  if (item.path) return `../assets/resources/${item.path}`;
  return null;
}

function resourcesHtml() {
  return resources.items.map((item) => {
    const href = resourceHref(item);
    const title = `<div class="card-title">${item.title}</div>`;
    const desc = `<div class="text-muted" style="line-height:1.7;">${item.description || ''}</div>`;
    const note = item.type === 'note' ? `<div class="resource-note">${item.body || ''}</div>` : '';
    const meta = `<div class="resource-meta"><span class="mission-chip">${item.topic}</span><span class="mission-chip">${item.type}</span></div>`;
    const inner = `${title}${desc}${note}${meta}`;
    if (href) {
      return `<a class="resource-card" href="${href}" target="_blank" rel="noopener">${inner}</a>`;
    }
    return `<div class="resource-card">${inner}</div>`;
  }).join('\n');
}

function badgeMetaHtml(badge) {
  const pills = [`<span class="badge-pill">${badge.threshold_xp ?? 0} XP</span>`];
  if (badge.required_modules_count) pills.push(`<span class="badge-pill">${badge.required_modules_count} โมดูล</span>`);
  if (Array.isArray(badge.required_modules) && badge.required_modules.length > 0) pills.push(`<span class="badge-pill">${badge.required_modules.length} โมดูลเฉพาะ</span>`);
  if (badge.required_accuracy) pills.push(`<span class="badge-pill">ความแม่นยำ ${badge.required_accuracy}%</span>`);
  if (Array.isArray(badge.required_badges) && badge.required_badges.length > 0) pills.push(`<span class="badge-pill">ปลด badge ก่อนหน้า ${badge.required_badges.length} รายการ</span>`);
  return pills.join('');
}

function badgeCardsHtml() {
  return (config.badges || []).map((badge) => `
    <article class="badge-card" data-badge-id="${badge.id}" data-badge-threshold="${badge.threshold_xp ?? 0}">
      <div class="badge-head">
        <div class="badge-emoji">${badge.emoji || '🏅'}</div>
        <div>
          <div class="badge-name">${badge.name}</div>
          <div class="badge-status" data-badge-status="${badge.id}">สถานะ: <strong>ยังไม่ปลด</strong></div>
        </div>
      </div>
      <div class="badge-req">${badge.req || 'ปลดตาม milestone ของรายวิชา'}</div>
      <div class="badge-meta">${badgeMetaHtml(badge)}</div>
    </article>
  `).join('\n');
}

function firstModuleByKind(kind) {
  return modules.find((module) => moduleSummary(module).module_kind === kind) || null;
}

function topicGridHtml(basePath) {
  const cards = [
    `
      <a href="${basePath}intro.html" class="topic-card card-intro">
        <div class="tc-icon">🌱</div>
        <div class="tc-title">เริ่มจากภาพรวมรายวิชา</div>
        <div class="tc-desc">ดูเป้าหมายการเรียน วิธีใช้งานคอร์ส และเส้นทางเริ่มต้นแบบไม่กดดันเกินไป</div>
      </a>
    `,
    `
      <a href="${basePath}lessons.html" class="topic-card card-lessons">
        <div class="tc-icon">📚</div>
        <div class="tc-title">อ่านบทเรียนทั้งหมด</div>
        <div class="tc-desc">เข้า lesson hub เพื่อเลือกบทเรียนตามลำดับ หรือย้อนกลับไปทบทวนหัวข้อที่ต้องการ</div>
      </a>
    `,
  ];

  const conceptModule = firstModuleByKind('concept');
  const proofModule = firstModuleByKind('proof');

  if (conceptModule) {
    const meta = moduleSummary(conceptModule);
    cards.push(`
      <a href="${basePath}modules/${meta.slug}/" class="topic-card card-match">
        <div class="tc-icon">📘</div>
        <div class="tc-title">${meta.title}</div>
        <div class="tc-desc">${meta.summary}</div>
      </a>
    `);
  }

  if (proofModule) {
    const meta = moduleSummary(proofModule);
    cards.push(`
      <a href="${basePath}modules/${meta.slug}/" class="topic-card card-guess">
        <div class="tc-icon">🧠</div>
        <div class="tc-title">${meta.title}</div>
        <div class="tc-desc">${meta.summary}</div>
      </a>
    `);
  }

  if (config.features.resources) {
    cards.push(`
      <a href="${basePath}content/" class="topic-card card-intro">
        <div class="tc-icon">📄</div>
        <div class="tc-title">สื่อการเรียนและเอกสาร</div>
        <div class="tc-desc">รวม handout เอกสารเสริม และโน้ตที่ใช้ทบทวนก่อนเรียน ระหว่างเรียน หรือก่อนทำภารกิจ</div>
      </a>
    `);
  }

  if (config.features.missions) {
    cards.push(`
      <a href="${basePath}missions.html" class="topic-card card-lessons mission-spotlight">
        <span class="new-pill">SBRA</span>
        <div class="tc-icon">🎯</div>
        <div class="tc-title">ภารกิจและการวัดผล</div>
        <div class="tc-desc">ฝึกคิดแบบเป็นขั้น เลือก process และ reasoning ตามแต่ละ step เพื่อวัด CLO อย่างเป็นระบบ</div>
      </a>
    `);
  }

  return cards.join('\n');
}

function howToStepsHtml() {
  const steps = [
    {
      title: 'ตั้งชื่อของคุณ',
      desc: 'คลิกที่การ์ดด้านบนเพื่อตั้งชื่อ ระบบจะใช้ชื่อนี้กับข้อความต้อนรับ ความคืบหน้า และการสะสม XP',
    },
    {
      title: 'เริ่มจาก intro แล้วค่อยไป lessons',
      desc: 'ดูภาพรวมของวิชาก่อน แล้วค่อยเลือกบทเรียนตามลำดับหรือย้อนทบทวนเฉพาะส่วนที่ต้องการ',
    },
    {
      title: 'ใช้สื่อ interactive ให้เต็มที่',
      desc: 'แต่ละบทออกแบบให้ลองสำรวจกราฟ นิยาม พารามิเตอร์ หรือขั้นตอนการคิดด้วยตัวเองก่อนสรุปคำตอบ',
    },
  ];

  if (config.features.missions) {
    steps.push({
      title: 'ลองภารกิจแบบ SBRA',
      desc: 'ภารกิจจะให้เลือก process และ reasoning ทีละขั้น พร้อมประเมินความมั่นใจของตัวเองหลังทำเสร็จ',
    });
  }

  return steps.map((step, index) => `
    <div class="howto-step">
      <div class="howto-num">${index + 1}</div>
      <div>
        <div class="howto-title">${step.title}</div>
        <div class="howto-desc">${step.desc}</div>
      </div>
    </div>
  `).join('\n');
}

function homeBody() {
  return `
    <section class="identity-card" id="identity-card">
      <div class="identity-avatar" id="identity-avatar" style="--xp-pct:0;">
        <div class="identity-avatar-inner">
          <div class="identity-avatar-emoji" id="identity-avatar-emoji">🌱</div>
          <div class="identity-xp-pill"><span id="identity-xp-num">0</span> XP</div>
        </div>
      </div>

      <div class="identity-body">
        <div class="identity-greeting" id="identity-greeting">👋 ยินดีต้อนรับสู่ ${config.course_short_name}</div>
        <div class="identity-name-row" id="identity-name-row"></div>
        <div>
          <span class="identity-badge-chip">
            <span class="identity-badge-emoji" id="identity-badge-emoji">🌱</span>
            <span id="identity-badge-name">Starter</span>
          </span>
        </div>
        <div class="identity-progress" id="identity-progress">เริ่มเรียนเพื่อเก็บ XP และปลด badge แรกของคอร์ส</div>
        <div class="identity-attrib">✦ ${config.instructor} ✦</div>
      </div>
    </section>

    <section class="hero">
      <h1 class="hero-title">${config.course_name_th}</h1>
      <p class="hero-subtitle">${config.description}</p>
      <div class="cta-row" style="margin-top:1.5rem;">
        <a href="intro.html" class="btn btn-primary btn-lg">เริ่มเรียน</a>
        <a href="lessons.html" class="btn btn-lg">อ่านบทเรียน</a>
        ${config.features.missions ? '<a href="missions.html" class="btn btn-lg" style="border-color:var(--color-accent1);color:var(--color-accent1);">ลองภารกิจ</a>' : ''}
      </div>
    </section>

    <section class="card howto-card">
      <div class="card-title">🧭 วิธีใช้งานเบื้องต้น</div>
      <p class="text-muted text-small" style="margin-bottom:.2rem;">
        คอร์สนี้ออกแบบให้ใช้ทั้งตอนเรียนด้วยตัวเอง และใช้ประกอบ active learning ในห้องเรียนได้ โดยระบบจะเก็บความคืบหน้าไว้ในเบราว์เซอร์เครื่องนี้
      </p>
      <div class="howto-steps">
        ${howToStepsHtml()}
      </div>
    </section>

    <section id="progress" class="xp-dashboard">
      <div class="xp-ring" id="xp-ring" style="--xp-pct:0;">
        <div class="xp-ring-inner">
          <div class="xp-total" id="xp-total-big">0</div>
          <div class="xp-label">XP</div>
        </div>
      </div>
      <div class="xp-info">
        <div class="xp-level" id="xp-level">🌱 Starter</div>
        <div class="xp-next" id="xp-next">เริ่มเรียนเพื่อเก็บ XP และปลด badge แรกของคอร์ส</div>
        <div class="home-stats">
          <div class="stat-tile">
            <div class="stat-val" id="stat-lessons">0</div>
            <div class="stat-lbl">บทที่เรียน</div>
          </div>
          <div class="stat-tile">
            <div class="stat-val" id="stat-accuracy">0%</div>
            <div class="stat-lbl">ความแม่นยำ</div>
          </div>
          <div class="stat-tile">
            <div class="stat-val" id="stat-games">0</div>
            <div class="stat-lbl">กิจกรรมเสริม</div>
          </div>
          <div class="stat-tile">
            <div class="stat-val" id="stat-badges">0 / ${(config.badges || []).length}</div>
            <div class="stat-lbl">badge ที่ได้</div>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-title">🏅 badge ของคุณ</div>
      <div class="badge-showcase" id="badge-showcase"></div>
      <div class="badge-roadmap" id="badge-next-status">
        ระบบ XP และ badge เป็นฐานร่วมของทุกวิชา เมื่อเรียนจบบทและทำกิจกรรมครบ คุณจะค่อย ๆ ปลด milestone ของรายวิชา
      </div>
    </section>

    <h2 class="section-heading">🗺️ เลือกกิจกรรม</h2>
    <section class="topic-grid">
      ${topicGridHtml('')}
    </section>

    <section class="card">
      <div class="card-title">⚙️ จัดการข้อมูลของคุณ</div>
      <p class="text-muted text-small">
        ถ้าต้องการเริ่มนับความคืบหน้าใหม่ สามารถล้างข้อมูลคอร์สนี้ได้จากปุ่มด้านล่าง ระบบจะรีเซ็ตชื่อ XP badge และสถานะการเรียนของคอร์สนี้ในเครื่องนี้
      </p>
      <div class="mt-2">
        <button class="btn btn-sm" id="btn-reset">🗑️ ล้างข้อมูลทั้งหมด</button>
      </div>
    </section>
  `;
}

function introPageBody() {
  return `
    <section class="card">
      <h1 class="page-title">แนะนำ ${config.course_short_name}</h1>
      <p class="page-subtitle">หน้าแนะนำนี้ออกแบบให้ค่อย ๆ พาเข้าสู่รายวิชาอย่างไม่กดดันเกินไป เหมาะสำหรับการเริ่มเรียนครั้งแรกหรือกลับมาทบทวนภาพรวมก่อนเปิดบทเรียน</p>
      <p style="line-height:1.8;">
        รายวิชานี้แบ่งเป็น ${modules.length} โมดูล และเชื่อมกับผลลัพธ์การเรียนรู้ ${config.clos.length} ข้อ โดยใช้บทเรียน สื่อ interactive และภารกิจแบบเป็นขั้นช่วยให้เห็นความเข้าใจของตัวเองชัดขึ้น
      </p>
    </section>

    <div class="intro-grid">
      <section class="card intro-soft-card" id="intro-welcome">
        <div class="card-title">🌿 เริ่มต้นแบบไม่ต้องรีบ</div>
        <p>
          ไม่จำเป็นต้องรู้ทุกอย่างตั้งแต่ครั้งแรก คุณสามารถเริ่มจากภาพรวมของวิชา แล้วค่อยเลือกบทที่อยากเรียนต่อหรือย้อนกลับมาทบทวนเฉพาะจุดได้เสมอ
        </p>
        <p>
          ถ้าบางส่วนยังไม่มั่นใจ ให้ใช้บทเรียน สื่อเสริม และภารกิจเป็นสะพานช่วยเชื่อมความเข้าใจทีละส่วน ไม่ต้องเร่งให้ตอบได้ครบทุกอย่างในรอบเดียว
        </p>
      </section>

      <section class="card intro-soft-card">
        <div class="card-title">🧩 ก่อนเริ่มเรียนควรรู้อะไรบ้าง</div>
        <ul class="intro-checklist">
          <li>ดูภาพรวมของรายวิชาและเส้นทางการเรียนก่อน เพื่อเห็นว่าบทต่าง ๆ เชื่อมกันอย่างไร</li>
          <li>เข้า lessons เพื่อเลือกเรียนตามลำดับ หรือย้อนกลับไปทบทวนเฉพาะโมดูลที่ต้องการ</li>
          <li>ใช้สื่อ interactive ช่วยสำรวจกราฟ นิยาม พารามิเตอร์ หรือโครงเหตุผลให้เห็นภาพ</li>
          <li>ถ้ามี missions ให้ใช้ภารกิจเป็นจังหวะเช็กความเข้าใจ ไม่ใช่พื้นที่ลงโทษเมื่อยังตอบไม่ได้ทันที</li>
        </ul>
      </section>
    </div>

    <section class="card">
      <div class="card-title">✅ เริ่มจากตรงไหนดี</div>
      <div class="intro-route-grid">
        <div class="intro-route-card">
          <strong>ดูภาพรวมก่อนเริ่ม</strong>
          <p>เหมาะกับคนที่อยากเข้าใจก่อนว่ารายวิชานี้เรียนอะไร ใช้สื่ออย่างไร และควรเริ่มจากตรงไหน</p>
          <div style="margin-top:.8rem;"><a href="index.html" class="btn">กลับหน้าแรก</a></div>
        </div>
        <div class="intro-route-card">
          <strong>เข้าไปเลือกบทเรียน</strong>
          <p>ถ้าพร้อมเริ่มเรียนแล้ว ให้ไปที่ lessons เพื่อเลือกโมดูลตามลำดับ หรือข้ามไปส่วนที่ต้องการทบทวนได้เลย</p>
          <div style="margin-top:.8rem;"><a href="lessons.html" class="btn btn-primary">ไปหน้า Lessons</a></div>
        </div>
        ${config.features.missions ? `
        <div class="intro-route-card">
          <strong>ลองภารกิจเมื่อพร้อม</strong>
          <p>missions ใช้สำหรับเช็กวิธีคิด เหตุผล และความมั่นใจของตัวเองหลังจากได้ลองเรียนหรือทบทวนบทแล้ว</p>
          <div style="margin-top:.8rem;"><a href="missions.html" class="btn">ไปหน้า Missions</a></div>
        </div>` : ''}
      </div>
    </section>
  `;
}

function lessonsPageBody() {
  return `
    <section class="card">
      <h1 class="page-title">บทเรียนทั้งหมด ${modules.length} โมดูล</h1>
      <p class="page-subtitle">lesson hub ของรายวิชานี้ล้อตามจำนวนโมดูลของแผนการสอน เพื่อให้เห็นลำดับหัวข้อ เส้นทางเรียน และกิจกรรม active learning ของแต่ละบทอย่างชัดเจน</p>
      <p class="lesson-page-note">
        ใช้ rail ด้านล่างเพื่อกระโดดไปยังโมดูลที่ต้องการ แล้วดู roadmap ของแต่ละบทเพื่อเห็นสรุปหัวข้อ กิจกรรม และจุดเชื่อมไปยังหน้าโมดูลจริง
      </p>
      <div class="lesson-module-rail" id="lessons-module-rail">
        ${lessonsModuleRailHtml()}
      </div>
    </section>
    <section class="card" id="lessons-roadmap">
      <div class="card-title">แผนที่บทเรียนตามโมดูล</div>
      <p class="lesson-page-note">
        การ์ดแต่ละใบช่วยให้เห็นว่าบทนี้เน้นเรื่องอะไร อยู่ลำดับไหนของรายวิชา และมีกิจกรรม active learning แบบใดให้ใช้ประกอบก่อนเข้าเนื้อหาเต็ม
      </p>
      <div class="lesson-roadmap-grid">
        ${lessonsRoadmapHtml()}
      </div>
    </section>
  `;
}

function missionsPageBody() {
  return `
    <section class="card" id="missions-welcome">
      <h1 class="page-title">ภารกิจฝึกคิดของรายวิชา</h1>
      <p class="page-subtitle">
        หน้านี้เป็นพื้นที่ให้ผู้เรียนค่อย ๆ ฝึกคิดเป็นขั้น วางเหตุผลให้ชัด และเช็กความเข้าใจของตัวเองทีละส่วน โดยไม่ต้องรู้สึกว่าต้องตอบได้สมบูรณ์ตั้งแต่รอบแรก
      </p>
      <div class="mission-primer-grid">
        <article class="mission-primer-card">
          <strong>เริ่มจากภารกิจที่ใกล้บทเรียนล่าสุด</strong>
          <p>เลือกจากโมดูลที่เพิ่งเรียน หรือใช้แผนที่ภารกิจด้านล่างเพื่อดูว่าตอนนี้มีงานฝึกคิดระดับไหนรออยู่บ้าง</p>
        </article>
        <article class="mission-primer-card">
          <strong>ทำแบบค่อยเป็นค่อยไป</strong>
          <p>ภารกิจแต่ละข้อออกแบบให้ดูทั้งวิธีคิด เหตุผล และความมั่นใจของผู้เรียน ไม่จำเป็นต้องตอบถูกทุกครั้งตั้งแต่รอบแรก</p>
        </article>
        <article class="mission-primer-card">
          <strong>ใช้ภารกิจเป็นสะพานกลับไปบทเรียน</strong>
          <p>ถ้ายังไม่มั่นใจ สามารถย้อนกลับไปบทเรียนหรือสื่อเสริมได้เสมอ เพื่อให้การฝึกคิดไม่รู้สึกโดดเดี่ยวเกินไป</p>
        </article>
      </div>
    </section>
    <section class="card" id="missions-self-assessment">
      <div class="card-title">การประเมินตนเอง</div>
      <p class="mission-page-note">
        self-assessment เป็น building block กลางของหน้า missions ทุกวิชา เพราะข้อมูลความมั่นใจของผู้เรียนจะถูกใช้ต่อกับ feedback, XP, badge และการแปลผลการเรียนรู้ในรอบถัดไป
      </p>
      <div class="mission-primer-grid">
        <article class="mission-primer-card">
          <strong>ทบทวนตัวเองก่อนส่ง</strong>
          <p>หลังทำภารกิจแต่ละข้อ ให้สะท้อนว่าตอนนี้เข้าใจมากน้อยเพียงใด และมั่นใจตรงจุดหรือยัง</p>
        </article>
        <article class="mission-primer-card">
          <strong>ตัวคูณ XP และการใช้ข้อมูลประเมิน</strong>
          <p>ความมั่นใจของผู้เรียนจะเชื่อมกับ XP และภาพรวมการประเมิน เพื่อดูว่าความเข้าใจกับการประเมินตนเองสอดคล้องกันแค่ไหน</p>
        </article>
        <article class="mission-primer-card">
          <strong>ระดับความมั่นใจเป็นข้อมูลหลักของระบบ</strong>
          <p>source ของภารกิจทุกข้อจึงต้องเก็บ confidence ไว้เป็นข้อมูลมาตรฐาน เพื่อให้หน้า missions แสดงผลได้สม่ำเสมอ</p>
        </article>
      </div>
    </section>
    <section class="card" id="missions-overview-shell">
      <div class="card-title">ภาพรวมภารกิจของรายวิชา</div>
      <p class="mission-page-note">
        ส่วนนี้ช่วยให้เห็นภาพรวมว่าตอนนี้ทำภารกิจไปแค่ไหน เก็บ XP ได้เท่าไร และควรกลับไปทบทวนส่วนไหนเพิ่ม</p>
      <div class="mission-overview-grid" id="missions-overview"></div>
    </section>
    <section class="card" id="missions-map-shell">
      <div class="card-title">แผนที่ภารกิจตามโมดูลและระดับการคิด</div>
      <p class="mission-page-note">
        มองภาพรวมได้ว่ารายวิชานี้มีภารกิจอยู่ในโมดูลใดบ้าง และกระจายตัวในระดับ Bloom ใด เพื่อให้ต่อยอดรายละเอียดทีหลังได้ง่ายโดยไม่ต้องเปลี่ยนโครงหน้าใหม่
      </p>
      <div class="mission-heatmap" id="missions-heatmap"></div>
      <div class="topic-tabs" id="missions-module-tabs"></div>
    </section>
    <section class="card" id="missions-list-shell">
      <div class="card-title">รายการภารกิจ</div>
      <p class="mission-page-note">
        เลือกภารกิจที่อยากลองจากรายการด้านล่างได้เลย แต่ละข้อจะช่วยให้เห็นทั้งวิธีคิด เหตุผล และระดับความมั่นใจของตัวเอง
      </p>
      <div class="mission-list-empty" id="missions-empty" hidden></div>
      <section class="mission-grid" id="missions-root"></section>
    </section>
    <section class="card" id="missions-next-step">
      <div class="card-title">ไปต่อจากตรงไหนดี</div>
      <p class="mission-page-note">
        ถ้ายังไม่มั่นใจหลังทำภารกิจ ส่วนนี้จะช่วยชี้ทางไปต่อ เช่น กลับไปทบทวนบทเรียน หรืออ่านสื่อเสริมก่อนลองอีกครั้ง
      </p>
      <div class="mission-next-grid" id="missions-next-grid">
        <article class="mission-next-card">
          <strong>ทบทวนบทเรียนก่อน</strong>
          <p>ถ้ายังไม่มั่นใจในเหตุผลหรือขั้นตอน ให้กลับไปดูหน้า lessons แล้วเลือกโมดูลที่เกี่ยวข้อง</p>
          <div style="margin-top:.8rem;"><a href="lessons.html" class="btn">ไปหน้า Lessons</a></div>
        </article>
        <article class="mission-next-card">
          <strong>อ่านสื่อเสริมเพิ่ม</strong>
          <p>ถ้าต้องการตัวอย่างหรือ handout เพิ่ม สามารถใช้หน้า resources เป็นฐานทบทวนระหว่างทำภารกิจได้</p>
          <div style="margin-top:.8rem;"><a href="content/" class="btn">ไปหน้า Resources</a></div>
        </article>
      </div>
    </section>
  `;
}

function resourcesBody(courseRelativeDir) {
  return `
    <section class="card">
      <h1 class="page-title">Resources</h1>
      <p class="page-subtitle">รวมสื่อประกอบการเรียนของรายวิชาไว้ในหน้าเดียว เพื่อใช้ทบทวนก่อนเรียน ระหว่างเรียน หรือก่อนทำภารกิจ</p>
    </section>
    <section class="resource-grid">
      ${resourcesHtml()}
    </section>
  `;
}

function moduleTags(module) {
  const tags = [];
  tags.push(`<span class="pill">ชนิด: ${module.meta.module_kind}</span>`);
  (module.meta.clo_ids || []).forEach((cloId) => tags.push(`<span class="pill">${cloId}</span>`));
  (module.meta.widgets || []).forEach((widget) => tags.push(`<span class="pill">${widget}</span>`));
  return tags.join('\n');
}

function stripHtmlTags(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function moduleSectionData(module) {
  const sections = [];
  let index = 0;
  const html = String(module.html || '').replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (match, attrs, inner) => {
    index += 1;
    const id = `module-section-${index}`;
    sections.push({ id, title: stripHtmlTags(inner) || `Section ${index}` });
    if (/\sid=/.test(attrs)) return match;
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html, sections };
}

function moduleSectionMapHtml(sectionData) {
  if (!sectionData.sections.length) {
    return `
      <section class="card" id="module-section-map" style="margin-bottom:1rem;">
        <div class="card-title">แผนผังหัวข้อของบท</div>
        <p class="lesson-page-note">
          ตอนนี้บทนี้ยังมีหัวข้อย่อยไม่มากนัก ส่วนนี้จึงช่วยให้เห็นภาพรวมของบทก่อนลงรายละเอียด
        </p>
      </section>
    `;
  }

  return `
    <section class="card" id="module-section-map" style="margin-bottom:1rem;">
      <div class="card-title">แผนผังหัวข้อของบท</div>
      <p class="lesson-page-note">
        ส่วนนี้ช่วยให้เห็นว่าบทเรียนแบ่งเป็นช่วงใดบ้าง และถ้าต้องการย้อนกลับมาทบทวนเฉพาะหัวข้อก็เลือกเข้าไปดูได้ทันที
      </p>
      <div class="module-roadmap-list">
        ${sectionData.sections.map((section, sectionIndex) => `
          <div class="module-roadmap-item">
            <div class="module-roadmap-num">${sectionIndex + 1}</div>
            <div>
              <strong>${section.title}</strong>
              <p>หัวข้อนี้เป็นจุดสำคัญของบท และเชื่อมกับกิจกรรมหรือคำถามที่ช่วยให้เข้าใจเนื้อหาได้ชัดขึ้น</p>
              <a class="module-nav-link" href="#${section.id}">เปิดหัวข้อนี้</a>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function moduleAtAGlanceHtml(module, sectionData) {
  const widgetIds = module.meta.widgets || [];
  const widgetNames = widgetIds
    .slice(0, 3)
    .map((widgetId) => widgetInfo(widgetId).title)
    .join(', ');

  return `
    <section class="card" id="module-at-a-glance" style="margin-bottom:1rem;">
      <div class="card-title">ภาพรวมของบทเรียน</div>
      <div class="module-kicker-grid" style="margin-top:.9rem;">
        <article class="module-kicker-card">
          <strong>บทนี้เน้นอะไร</strong>
          <p>${module.meta.summary}</p>
        </article>
        <article class="module-kicker-card">
          <strong>โครงของบท</strong>
          <p>ตอนนี้บทนี้แบ่งเป็นหัวข้อหลัก ${sectionData.sections.length} ช่วง เพื่อช่วยให้ผู้เรียนค่อย ๆ มองภาพรวมก่อนลงรายละเอียดในแต่ละส่วน</p>
        </article>
        <article class="module-kicker-card">
          <strong>วิธีฝึกในบทนี้</strong>
          <p>${widgetNames || 'บทนี้เตรียมพื้นที่สำหรับกิจกรรม interactive และการทบทวนระหว่างเรียน'}${widgetIds.length > 3 ? ' รวมทั้งกิจกรรมเสริมอีกหลายแบบ' : ''}</p>
        </article>
      </div>
    </section>
  `;
}

function moduleReflectionPrompts(module) {
  if (module.meta.module_kind === 'proof') {
    return [
      {
        title: 'ย้อนดูนิยามหรือทฤษฎีบทหลัก',
        detail: 'ก่อนอ่านต่อ ลองเช็กว่านิยามหรือทฤษฎีบทที่ใช้ในบทนี้มีเงื่อนไขสำคัญอะไรบ้าง',
      },
      {
        title: 'จับจุดของเหตุผล',
        detail: 'ลองอธิบายให้ตัวเองฟังว่าตอนนี้กำลังพิสูจน์อะไร และเหตุผลแต่ละช่วงเชื่อมกันอย่างไร',
      },
      {
        title: 'ถ้ายังไม่มั่นใจให้ย้อนกลับไปทบทวน',
        detail: 'ถ้ารู้สึกว่าบทนี้ยากเกินไป ให้ย้อนกลับไปดูหัวข้อก่อนหน้าของบทหรือบทก่อนหน้าได้เสมอ',
      },
    ];
  }

  return [
    {
      title: 'ระบุวัตถุที่กำลังศึกษา',
      detail: 'ลองเช็กว่าตอนนี้กำลังมองชุด ลำดับ ฟังก์ชัน หรือพารามิเตอร์ชนิดใดอยู่',
    },
    {
      title: 'ลองดูการเปลี่ยนแปลง',
      detail: 'ใช้กิจกรรม interactive เป็นตัวช่วยดูว่าเมื่อเงื่อนไขเปลี่ยน ผลลัพธ์หรือพฤติกรรมเปลี่ยนอย่างไร',
    },
    {
      title: 'สรุปด้วยภาษาของตัวเอง',
      detail: 'หลังเรียน ลองพูดใจความสำคัญของหัวข้อนี้ด้วยภาษาของตัวเอง ไม่ยึดติดกับสูตรหรือสัญลักษณ์อย่างเดียว',
    },
  ];
}

function moduleCheckpointsHtml(module) {
  const prompts = moduleReflectionPrompts(module);
  return `
    <section class="card" id="module-checkpoints" style="margin-bottom:1rem;">
      <div class="card-title">จุดเช็กระหว่างเรียน</div>
      <p class="lesson-page-note">
        ใช้ส่วนนี้หยุดเช็กความเข้าใจเป็นระยะ เพื่อไม่ให้การเรียนไหลไปเร็วเกินจนหลุดประเด็นสำคัญของบท
      </p>
      <div class="module-reflection-list">
        ${prompts.map((prompt) => `
          <article class="module-reflection-item">
            <strong>${prompt.title}</strong>
            <p>${prompt.detail}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function moduleNextStepHtml(module) {
  const orderedModules = [...modules].sort((left, right) => Number(left.meta.order || 0) - Number(right.meta.order || 0));
  const currentIndex = orderedModules.findIndex((item) => item.meta.id === module.meta.id);
  const nextModule = currentIndex >= 0 ? orderedModules[currentIndex + 1] : null;
  const fallbackHref = config.features.missions ? '../../missions.html' : '../../content/';
  const fallbackLabel = config.features.missions ? 'ไปหน้า Missions' : 'ไปหน้า Resources';

  return `
    <section class="card" id="module-next-step" style="margin-bottom:1rem;">
      <div class="card-title">ไปต่อจากบทนี้</div>
      <p class="lesson-page-note">
        หลังจากอ่านจบบทนี้แล้ว ผู้เรียนสามารถเลือกทางไปต่อได้ชัดเจน ทั้งการทบทวน การไปบทถัดไป หรือการลองทำภารกิจ
      </p>
      <div class="module-next-grid" style="margin-top:.9rem;">
        <article class="module-next-card">
          <strong>กลับไปดูแผนบทเรียน</strong>
          <p>ถ้าอยากมองภาพรวมอีกครั้งหรือเลือกบทอื่นก่อน ก็สามารถกลับไปที่หน้า lessons ได้เสมอ</p>
          <div style="margin-top:.8rem;"><a href="../../lessons.html" class="btn">ไปหน้า Lessons</a></div>
        </article>
        <article class="module-next-card">
          <strong>${nextModule ? `ลองบทถัดไป: ${nextModule.meta.title}` : 'ลองภารกิจหรือสื่อเสริมต่อ'}</strong>
          <p>${nextModule ? 'เมื่อพร้อมแล้วสามารถขยับไปตามลำดับของแผนการเรียนต่อได้ทันที' : 'ถ้ายังไม่มีบทถัดไป ให้ใช้หน้า missions หรือ resources เป็นพื้นที่ฝึกและทบทวนต่อจากบทนี้'}</p>
          <div style="margin-top:.8rem;">
            <a href="${nextModule ? `../${nextModule.meta.slug}/` : fallbackHref}" class="btn">${nextModule ? 'เปิดบทถัดไป' : fallbackLabel}</a>
          </div>
        </article>
      </div>
    </section>
  `;
}

function moduleActiveLearningHtml(module) {
  const widgetIds = module.meta.widgets || [];
  return `
    <section class="card" id="module-active-learning" style="margin-bottom:1rem;">
      <div class="card-title">Active Learning ในบทนี้</div>
      <p class="text-muted text-small" style="line-height:1.8;">
        แต่ละบทควรมีช่วงให้ผู้เรียนได้ลองคิด ลองสำรวจ หรือเช็กความเข้าใจระหว่างทาง ไม่ใช่อ่านเนื้อหาอย่างเดียว ส่วนนี้จึงบอกว่าบทนี้จะมีกิจกรรมหรือ interactive แบบไหนช่วยพยุงการเรียนบ้าง
      </p>
      ${activeLearningCards(widgetIds)}
    </section>
  `;
}

function moduleBody(module) {
  const sectionData = moduleSectionData(module);
  return renderTemplate(moduleTemplate, {
    BREADCRUMB: `Lessons / ${module.meta.title}`,
    MODULE_TITLE: module.meta.title,
    MODULE_SUMMARY: module.meta.summary,
    MODULE_TAGS: moduleTags(module),
    MODULE_AT_A_GLANCE: moduleAtAGlanceHtml(module, sectionData),
    MODULE_SECTION_MAP: moduleSectionMapHtml(sectionData),
    MODULE_ACTIVE_LEARNING: moduleActiveLearningHtml(module),
    MODULE_CHECKPOINTS: moduleCheckpointsHtml(module),
    MODULE_NEXT_STEP: moduleNextStepHtml(module),
    MODULE_CONTENT: sectionData.html,
    MODULE_ID: module.meta.id,
    MODULE_XP: String(config.lesson_completion_xp ?? 30),
    BASE_PATH: '../../',
  });
}

async function buildPage(target, html) {
  await writeText(path.join(outputDir, target), html);
}

await ensureDir(outputDir);
await ensureDir(path.join(outputDir, 'modules'));
await ensureDir(path.join(outputDir, 'content'));
await ensureDir(path.join(outputDir, 'data'));
await copyDir(path.join(REPO_ROOT, 'css'), path.join(outputDir, 'assets', 'css'));
await copyDir(path.join(REPO_ROOT, 'js'), path.join(outputDir, 'assets', 'js'));

for (const item of resources.items || []) {
  if (!item.path) continue;
  const source = path.join(coursePaths.RESOURCES_DIR, item.path);
  if (await fileExists(source)) {
    await copyFile(source, path.join(outputDir, 'assets', 'resources', item.path));
  }
}

const resolvedModules = modules.map(moduleSummary);
const contentManifest = {
  updated: resources.updated ?? new Date().toISOString().slice(0, 10),
  items: resources.items.map((item) => ({
    ...item,
    public_href: item.type === 'link' ? item.url : item.path ? `../assets/resources/${item.path}` : null,
  })),
};

await writeJson(path.join(outputDir, 'data', 'course-index.json'), {
  course_id: config.course_id,
  course_name_th: config.course_name_th,
  generated_at: new Date().toISOString(),
  modules: resolvedModules,
  clos: config.clos,
});
await writeJson(path.join(outputDir, 'data', 'content-manifest.json'), contentManifest);
await writeJson(path.join(outputDir, 'data', 'course.config.json'), config);

const courseRelativeDir = path.relative(REPO_ROOT, courseDir).replace(/\\/g, '/');

await buildPage('index.html', shell('index', `${config.course_name_th} | Home`, homeBody(), {
  headExtra: homePageStyles,
}));
await buildPage('intro.html', shell('intro', `${config.course_name_th} | Intro`, introPageBody(), {
  headExtra: introPageStyles,
}));
await buildPage('lessons.html', shell('lessons', `${config.course_name_th} | Lessons`, lessonsPageBody(), {
  headExtra: lessonsPageStyles,
}));
await buildPage(
  'missions.html',
  shell('missions', `${config.course_name_th} | Missions`, missionsPageBody(), {
    headExtra: missionsPageStyles,
    pageData: { missions: missions.missions, modules: resolvedModules, clos: config.clos },
    scripts: ['assets/js/missions.js'],
  }),
);
await buildPage(
  path.join('content', 'index.html'),
  shell('resources', `${config.course_name_th} | Resources`, resourcesBody(courseRelativeDir), {
    basePath: '../',
    headExtra: resourcesPageStyles,
  }),
);

for (const module of modules) {
  const targetDir = path.join(outputDir, 'modules', module.meta.slug);
  await ensureDir(targetDir);
  await writeText(
    path.join(targetDir, 'index.html'),
    shell('lessons', `${module.meta.title} | ${config.course_name_th}`, moduleBody(module), {
      basePath: '../../',
      headExtra: `${modulePageStyles}\n<script src="https://cdn.jsdelivr.net/npm/mathjs@13.0.3/lib/browser/math.min.js"></script>\n<script src="../../assets/js/graph.js"></script>`,
      pageData: { module: moduleSummary(module) },
      scripts: ['assets/js/widgets.js', 'assets/js/module-page.js'],
    }),
  );
}

console.log(`Built course "${config.course_id}" from ${courseRelativeDir} into ${path.relative(REPO_ROOT, outputDir).replace(/\\/g, '/')}`);


