'use strict';

(function () {
  let widgetCounter = 0;

  function parseWidgetData(host) {
    const script = host.querySelector('.widget-data');
    if (!script) return null;
    try {
      return JSON.parse(script.textContent);
    } catch (error) {
      host.innerHTML = `<div class="widget-feedback">ไม่สามารถ parse widget data ได้: ${error.message}</div>`;
      return null;
    }
  }

  function evaluateExpression(expression, scope) {
    try {
      return math.evaluate(expression, scope);
    } catch {
      return null;
    }
  }

  function renderGraphishWidget(host, data, mode) {
    widgetCounter += 1;
    const canvasId = `widget-canvas-${widgetCounter}`;
    const params = Object.fromEntries(Object.entries(data.parameters || {}).map(([key, config]) => [key, config.value]));
    const prompts = Array.isArray(data.prompts) ? data.prompts : [];

    host.innerHTML = `
      <div class="widget-title">${data.title || 'Interactive widget'}</div>
      <div class="widget-desc">${data.description || ''}</div>
      <div class="widget-grid graphish">
        <div class="widget-canvas-wrap">
          <canvas id="${canvasId}" width="640" height="360"></canvas>
        </div>
        <div class="widget-controls">
          ${(data.formula ? `<div class="widget-feedback"><strong>Formula:</strong> ${data.formula}</div>` : '')}
          ${Object.entries(data.parameters || {}).map(([key, config]) => `
            <div class="widget-control">
              <label for="${canvasId}-${key}">${config.label || key}: <span class="widget-value" data-param-value="${key}">${config.value}</span></label>
              <input id="${canvasId}-${key}" type="range" min="${config.min}" max="${config.max}" step="${config.step}" value="${config.value}" data-param="${key}" />
            </div>
          `).join('')}
          ${prompts.length ? `<div class="widget-feedback"><strong>Observation prompts</strong><ul>${prompts.map((prompt) => `<li>${prompt}</li>`).join('')}</ul></div>` : ''}
          ${mode === 'parameter-playground' ? '<div class="widget-feedback">ลองเลื่อน parameter ทีละตัว แล้วอธิบายผลเป็นประโยคให้ได้</div>' : ''}
        </div>
      </div>
    `;

    const canvas = document.getElementById(canvasId);
    const graph = new GraphCanvas(canvas, {
      xMin: data.x_range?.[0] ?? -6,
      xMax: data.x_range?.[1] ?? 6,
      yMin: data.y_range?.[0] ?? -6,
      yMax: data.y_range?.[1] ?? 6,
      padding: 36,
    });

    function draw() {
      graph.render();
      graph.drawFunction((x) => evaluateExpression(data.expression, { x, ...params }), '#22d3ee', { lineWidth: 2.5 });
      Object.entries(params).forEach(([key, value]) => {
        const el = host.querySelector(`[data-param-value="${key}"]`);
        if (el) el.textContent = Number(value).toString();
      });
    }

    host.querySelectorAll('[data-param]').forEach((input) => {
      input.addEventListener('input', () => {
        params[input.dataset.param] = Number(input.value);
        draw();
      });
    });

    draw();
  }

  function renderQuickCheck(host, data) {
    host.innerHTML = `
      <div class="widget-title">${data.title || 'Quick check'}</div>
      <div class="widget-desc">${data.question || ''}</div>
      <div class="quick-check-choices">
        ${(data.choices || []).map((choice, index) => `
          <button class="btn quick-check-choice" data-choice="${index}">${choice.label}</button>
        `).join('')}
      </div>
      <div class="widget-feedback" hidden></div>
    `;

    const feedback = host.querySelector('.widget-feedback');
    host.querySelectorAll('[data-choice]').forEach((button) => {
      button.addEventListener('click', () => {
        const choice = data.choices[Number(button.dataset.choice)];
        const pass = Boolean(choice.correct);
        if (typeof window.recordAnswer === 'function') window.recordAnswer(pass);
        feedback.hidden = false;
        feedback.innerHTML = `<strong>${pass ? 'ถูกต้อง' : 'ลองใหม่อีกครั้ง'}</strong><div style="margin-top:.35rem;">${data.explanation || ''}</div>`;
      });
    });
  }

  function renderDefinitionVisualizer(host, data) {
    host.innerHTML = `
      <div class="widget-title">${data.title || 'Definition visualizer'}</div>
      <div class="widget-desc">${data.description || ''}</div>
      <div class="definition-grid">
        ${(data.clauses || []).map((clause, index) => `
          <div class="definition-item">
            <button type="button" data-clause="${index}">${clause.label}</button>
            <div class="definition-detail" data-detail="${index}" hidden>${clause.detail || ''}</div>
          </div>
        `).join('')}
      </div>
    `;

    host.querySelectorAll('[data-clause]').forEach((button) => {
      button.addEventListener('click', () => {
        const detail = host.querySelector(`[data-detail="${button.dataset.clause}"]`);
        detail.hidden = !detail.hidden;
      });
    });
  }

  function renderProofUnpack(host, data) {
    host.innerHTML = `
      <div class="widget-title">${data.title || 'Proof unpack'}</div>
      <div class="widget-feedback"><strong>Claim:</strong> ${data.claim || ''}</div>
      <div class="proof-box"><strong>Given / setup</strong><ul>${(data.givens || []).map((item) => `<li>${item}</li>`).join('')}</ul></div>
      <div class="proof-steps">
        ${(data.steps || []).map((step, index) => `
          <button class="btn quick-check-choice" data-proof-step="${index}">Reveal step ${index + 1}</button>
          <div class="proof-box" data-proof-detail="${index}" hidden>${step}</div>
        `).join('')}
      </div>
    `;

    host.querySelectorAll('[data-proof-step]').forEach((button) => {
      button.addEventListener('click', () => {
        const detail = host.querySelector(`[data-proof-detail="${button.dataset.proofStep}"]`);
        detail.hidden = !detail.hidden;
      });
    });
  }

  function renderStepSequence(host, data) {
    const steps = data.steps || [];
    let current = 0;

    host.innerHTML = `
      <div class="widget-title">${data.title || 'Step sequence'}</div>
      <div class="widget-desc">${data.description || ''}</div>
      <div class="step-box">
        <div class="sequence-progress" data-sequence-progress></div>
        <div data-sequence-body></div>
      </div>
      <div class="step-sequence-nav">
        <button class="btn" data-prev-step>ก่อนหน้า</button>
        <button class="btn btn-primary" data-next-step>ถัดไป</button>
      </div>
    `;

    const progress = host.querySelector('[data-sequence-progress]');
    const body = host.querySelector('[data-sequence-body]');
    const prev = host.querySelector('[data-prev-step]');
    const next = host.querySelector('[data-next-step]');

    function paint() {
      progress.textContent = `Step ${current + 1} / ${steps.length}`;
      body.innerHTML = `<div>${steps[current] || ''}</div>`;
      prev.disabled = current === 0;
      next.disabled = current >= steps.length - 1;
    }

    prev.addEventListener('click', () => {
      current = Math.max(0, current - 1);
      paint();
    });
    next.addEventListener('click', () => {
      current = Math.min(steps.length - 1, current + 1);
      paint();
    });

    paint();
  }

  function hydrateWidget(host) {
    const type = host.dataset.widgetType;
    const data = parseWidgetData(host);
    if (!data) return;

    switch (type) {
      case 'graph-explorer':
        renderGraphishWidget(host, data, type);
        break;
      case 'parameter-playground':
        renderGraphishWidget(host, data, type);
        break;
      case 'quick-check':
        renderQuickCheck(host, data);
        break;
      case 'definition-visualizer':
        renderDefinitionVisualizer(host, data);
        break;
      case 'proof-unpack':
        renderProofUnpack(host, data);
        break;
      case 'step-sequence':
        renderStepSequence(host, data);
        break;
      default:
        host.innerHTML = `<div class="widget-feedback">Unknown widget type: ${type}</div>`;
    }
  }

  function hydrateAll(root = document) {
    root.querySelectorAll('.interactive-widget').forEach(hydrateWidget);
    window.CourseRuntime?.renderMath?.(root);
  }

  window.CourseWidgets = {
    hydrateAll,
    hydrateWidget,
  };
})();
