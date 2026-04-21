'use strict';

class GraphCanvas {
  constructor(canvasId, options = {}) {
    this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    this.ctx    = this.canvas.getContext('2d');

    this.xMin    = options.xMin    ?? -6;
    this.xMax    = options.xMax    ??  6;
    this.yMin    = options.yMin    ?? -4;
    this.yMax    = options.yMax    ??  4;
    this.padding = options.padding ?? 40;

    this.bgColor    = options.bgColor    ?? '#0a0614';
    this.gridColor  = options.gridColor  ?? 'rgba(167,139,250,0.08)';
    this.axisColor  = options.axisColor  ?? 'rgba(245,243,255,0.4)';
    this.tickColor  = options.tickColor  ?? 'rgba(245,243,255,0.5)';
    this.labelColor = options.labelColor ?? '#a5a0c9';

    this._animId     = null;
    this._hoverBound = null;

    this._setupHiDPI();
  }

  _setupHiDPI() {
    const dpr = window.devicePixelRatio || 1;
    const c = this.canvas;

    // Size the canvas only the FIRST time a GraphCanvas is constructed on
    // this element. Slider-driven re-instantiation reuses the same element,
    // so we must never re-read offsetWidth/offsetHeight after we've already
    // sized it (doing so compounds into the exploding-canvas bug).
    if (c.dataset.gcSized === '1') {
      // Already set up — just reset the transform for the new context state.
      this._cssW = parseFloat(c.dataset.gcCssW);
      this._cssH = parseFloat(c.dataset.gcCssH);
      const usedDpr = parseFloat(c.dataset.gcDpr) || 1;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(usedDpr, usedDpr);
      return;
    }

    // First-time sizing: use HTML attributes as the authoritative intent.
    const attrW = parseFloat(c.getAttribute('width'));
    const attrH = parseFloat(c.getAttribute('height'));
    const rect  = c.getBoundingClientRect();
    let w = (attrW > 0 ? attrW : (c.offsetWidth  || rect.width  || 600));
    let h = (attrH > 0 ? attrH : (c.offsetHeight || rect.height || 380));

    // Honor responsive CSS (e.g. width:100%) by shrinking if the layout
    // constrains us. Keep authored aspect ratio.
    if (c.offsetWidth > 0 && c.offsetWidth < w) {
      const ratio = c.offsetWidth / w;
      w = c.offsetWidth;
      h = Math.round(h * ratio);
    }

    c.style.width  = w + 'px';
    c.style.height = h + 'px';
    c.width  = Math.round(w * dpr);
    c.height = Math.round(h * dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this._cssW = w;
    this._cssH = h;
    c.dataset.gcSized = '1';
    c.dataset.gcCssW  = String(w);
    c.dataset.gcCssH  = String(h);
    c.dataset.gcDpr   = String(dpr);
  }

  get _pw() { return this._cssW - this.padding * 2; }
  get _ph() { return this._cssH - this.padding * 2; }

  worldToCanvas(wx, wy) {
    const x = this.padding + (wx - this.xMin) / (this.xMax - this.xMin) * this._pw;
    const y = this.padding + (this.yMax - wy) / (this.yMax - this.yMin) * this._ph;
    return { x, y };
  }

  canvasToWorld(cx, cy) {
    const wx = this.xMin + (cx - this.padding) / this._pw * (this.xMax - this.xMin);
    const wy = this.yMax - (cy - this.padding) / this._ph * (this.yMax - this.yMin);
    return { wx, wy };
  }

  clear() {
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this._cssW, this._cssH);
  }

  drawGrid() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;
    const xStep = this._niceStep(this.xMax - this.xMin);
    const yStep = this._niceStep(this.yMax - this.yMin);

    let x = Math.ceil(this.xMin / xStep) * xStep;
    while (x <= this.xMax) {
      const { x: cx } = this.worldToCanvas(x, 0);
      ctx.beginPath();
      ctx.moveTo(cx, this.padding);
      ctx.lineTo(cx, this._cssH - this.padding);
      ctx.stroke();
      x += xStep;
    }
    let y = Math.ceil(this.yMin / yStep) * yStep;
    while (y <= this.yMax) {
      const { y: cy } = this.worldToCanvas(0, y);
      ctx.beginPath();
      ctx.moveTo(this.padding, cy);
      ctx.lineTo(this._cssW - this.padding, cy);
      ctx.stroke();
      y += yStep;
    }
    ctx.restore();
  }

  drawAxes() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = this.axisColor;
    ctx.lineWidth = 1.5;
    const origin = this.worldToCanvas(0, 0);
    const clampX = Math.max(this.padding, Math.min(this._cssW - this.padding, origin.x));
    const clampY = Math.max(this.padding, Math.min(this._cssH - this.padding, origin.y));

    ctx.beginPath();
    ctx.moveTo(this.padding, clampY);
    ctx.lineTo(this._cssW - this.padding, clampY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(clampX, this.padding);
    ctx.lineTo(clampX, this._cssH - this.padding);
    ctx.stroke();

    ctx.fillStyle = this.labelColor;
    ctx.font = '11px Prompt, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const xStep = this._niceStep(this.xMax - this.xMin);
    let xi = Math.ceil(this.xMin / xStep) * xStep;
    while (xi <= this.xMax) {
      if (Math.abs(xi) > 0.01) {
        const { x: cx } = this.worldToCanvas(xi, 0);
        ctx.strokeStyle = this.tickColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, clampY - 4);
        ctx.lineTo(cx, clampY + 4);
        ctx.stroke();
        if (cx > this.padding + 10 && cx < this._cssW - this.padding - 10) {
          ctx.fillText(this._fmt(xi), cx, clampY + 6);
        }
      }
      xi += xStep;
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yStep = this._niceStep(this.yMax - this.yMin);
    let yi = Math.ceil(this.yMin / yStep) * yStep;
    while (yi <= this.yMax) {
      if (Math.abs(yi) > 0.01) {
        const { y: cy } = this.worldToCanvas(0, yi);
        ctx.strokeStyle = this.tickColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(clampX - 4, cy);
        ctx.lineTo(clampX + 4, cy);
        ctx.stroke();
        if (cy > this.padding + 8 && cy < this._cssH - this.padding - 8) {
          ctx.fillText(this._fmt(yi), clampX - 7, cy);
        }
      }
      yi += yStep;
    }
    ctx.restore();
  }

  drawFunction(evalFn, color = '#8b5cf6', options = {}) {
    const {
      lineWidth = 2.5,
      dashed    = false,
      samples   = 700,
      domain    = [this.xMin, this.xMax],
    } = options;

    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    if (dashed) ctx.setLineDash([5, 4]);

    const [x0, x1] = domain;
    const dx = (x1 - x0) / (samples - 1);
    const jumpThreshold = (this.yMax - this.yMin) * 1.5;

    let prev = null;
    ctx.beginPath();

    for (let i = 0; i < samples; i++) {
      const wx = x0 + i * dx;
      const wy = evalFn(wx);

      if (wy === null || !isFinite(wy)) { prev = null; continue; }
      const { x, y } = this.worldToCanvas(wx, wy);

      if (prev && Math.abs(wy - prev.wy) > jumpThreshold) ctx.moveTo(x, y);
      else if (prev) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);

      prev = { wx, wy };
    }
    ctx.stroke();
    ctx.restore();
  }

  drawPoint(wx, wy, options = {}) {
    const { open = false, color = '#8b5cf6', radius = 5, label = null } = options;
    const { x, y } = this.worldToCanvas(wx, wy);
    if (x < this.padding - 12 || x > this._cssW - this.padding + 12) return;
    if (y < this.padding - 12 || y > this._cssH - this.padding + 12) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (open) {
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2.5;
      ctx.fillStyle   = this.bgColor;
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
      // glow
      ctx.shadowColor = color;
      ctx.shadowBlur  = 10;
      ctx.fill();
    }
    if (label) {
      ctx.shadowBlur = 0;
      ctx.fillStyle    = this.labelColor;
      ctx.font         = '11px Prompt, sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, x, y - radius - 3);
    }
    ctx.restore();
  }

  drawHole(wx, wy, color = '#fb7185') {
    this.drawPoint(wx, wy, { open: true, color, radius: 5 });
  }

  drawVerticalAsymptote(x, color = 'rgba(248,113,113,0.6)') {
    const ctx = this.ctx;
    const { x: cx } = this.worldToCanvas(x, 0);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, this.padding);
    ctx.lineTo(cx, this._cssH - this.padding);
    ctx.stroke();
    ctx.restore();
  }

  drawHorizontalLine(y, color = 'rgba(255,255,255,0.3)', dashed = true) {
    const ctx = this.ctx;
    const { y: cy } = this.worldToCanvas(0, y);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    if (dashed) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(this.padding, cy);
    ctx.lineTo(this._cssW - this.padding, cy);
    ctx.stroke();
    ctx.restore();
  }

  drawVerticalLine(x, color = 'rgba(255,255,255,0.3)', dashed = true) {
    const ctx = this.ctx;
    const { x: cx } = this.worldToCanvas(x, 0);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    if (dashed) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, this.padding);
    ctx.lineTo(cx, this._cssH - this.padding);
    ctx.stroke();
    ctx.restore();
  }

  render() {
    this.clear();
    this.drawGrid();
    this.drawAxes();
  }

  setViewport(xMin, xMax, yMin, yMax) {
    this.xMin = xMin; this.xMax = xMax;
    this.yMin = yMin; this.yMax = yMax;
  }

  enableHover(callback) {
    if (this._hoverBound) this.canvas.removeEventListener('mousemove', this._hoverBound);
    this._hoverBound = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) * (this._cssW / rect.width);
      const cy = (e.clientY - rect.top)  * (this._cssH / rect.height);
      callback(this.canvasToWorld(cx, cy));
    };
    this.canvas.addEventListener('mousemove', this._hoverBound);
  }

  _niceStep(range) {
    const raw = range / 8;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    if (norm < 1.5) return mag;
    if (norm < 3.5) return 2 * mag;
    if (norm < 7.5) return 5 * mag;
    return 10 * mag;
  }

  _fmt(n) {
    if (Math.abs(n) >= 100) return n.toFixed(0);
    if (Number.isInteger(n) || Math.abs(n) >= 10) return n.toFixed(0);
    return parseFloat(n.toPrecision(3)).toString();
  }
}

// Safe math.js-compiled evaluator helper
function makeEvalFn(expr) {
  const compiled = math.compile(expr);
  return (x) => {
    try {
      const v = compiled.evaluate({ x });
      return (typeof v === 'number' && isFinite(v) && !isNaN(v)) ? v : null;
    } catch { return null; }
  };
}

// ─── Extensions: secant, tangent, Riemann, area fill ───
GraphCanvas.prototype.drawSecant = function (x0, x1, evalFn, color = '#22d3ee') {
  const y0 = evalFn(x0), y1 = evalFn(x1);
  if (y0 === null || y1 === null || !isFinite(y0) || !isFinite(y1)) return;
  const slope = (y1 - y0) / (x1 - x0);
  const xL = this.xMin, xR = this.xMax;
  const yL = y0 + slope * (xL - x0);
  const yR = y0 + slope * (xR - x0);
  const pL = this.worldToCanvas(xL, yL);
  const pR = this.worldToCanvas(xR, yR);
  const ctx = this.ctx;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(pL.x, pL.y);
  ctx.lineTo(pR.x, pR.y);
  ctx.stroke();
  ctx.restore();
};

GraphCanvas.prototype.drawTangent = function (x0, evalFn, slope, color = '#fb7185') {
  const y0 = evalFn(x0);
  if (y0 === null || !isFinite(y0)) return;
  const xL = this.xMin, xR = this.xMax;
  const yL = y0 + slope * (xL - x0);
  const yR = y0 + slope * (xR - x0);
  const pL = this.worldToCanvas(xL, yL);
  const pR = this.worldToCanvas(xR, yR);
  const ctx = this.ctx;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(pL.x, pL.y);
  ctx.lineTo(pR.x, pR.y);
  ctx.stroke();
  ctx.restore();
};

// Riemann sum: n rectangles for evalFn on [a,b]. mode ∈ 'L'|'R'|'M'|'T'
GraphCanvas.prototype.drawRiemann = function (evalFn, a, b, n, mode = 'L') {
  if (n < 1 || a >= b) return 0;
  const dx = (b - a) / n;
  let total = 0;
  const ctx = this.ctx;
  const axisY = this.worldToCanvas(0, 0).y;

  for (let i = 0; i < n; i++) {
    const xL = a + i * dx;
    const xR = xL + dx;

    if (mode === 'T') {
      const hL = evalFn(xL), hR = evalFn(xR);
      if (hL === null || hR === null) continue;
      total += ((hL + hR) / 2) * dx;
      const p1 = this.worldToCanvas(xL, 0);
      const p2 = this.worldToCanvas(xL, hL);
      const p3 = this.worldToCanvas(xR, hR);
      const p4 = this.worldToCanvas(xR, 0);
      const pos = (hL + hR) / 2 >= 0;
      ctx.save();
      ctx.fillStyle   = pos ? 'rgba(34,211,238,0.25)' : 'rgba(251,113,133,0.25)';
      ctx.strokeStyle = pos ? 'rgba(34,211,238,0.85)' : 'rgba(251,113,133,0.85)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
      continue;
    }

    let h;
    if (mode === 'L')      h = evalFn(xL);
    else if (mode === 'R') h = evalFn(xR);
    else                   h = evalFn(xL + dx / 2);
    if (h === null || !isFinite(h)) continue;
    total += h * dx;

    const pTop = this.worldToCanvas(xL, h);
    const pRt  = this.worldToCanvas(xR, 0);
    const rectX = pTop.x;
    const rectY = Math.min(pTop.y, axisY);
    const rectW = Math.max(1, pRt.x - pTop.x);
    const rectH = Math.abs(pTop.y - axisY);
    ctx.save();
    ctx.fillStyle   = h >= 0 ? 'rgba(34,211,238,0.28)' : 'rgba(251,113,133,0.28)';
    ctx.strokeStyle = h >= 0 ? 'rgba(34,211,238,0.85)' : 'rgba(251,113,133,0.85)';
    ctx.lineWidth   = 1;
    ctx.fillRect(rectX, rectY, rectW, rectH);
    ctx.strokeRect(rectX, rectY, rectW, rectH);
    ctx.restore();
  }
  return total;
};

// Shades area under f from x=a to x=b
GraphCanvas.prototype.drawAreaFill = function (evalFn, a, b, color = 'rgba(139,92,246,0.35)') {
  const samples = 250;
  const dx = (b - a) / samples;
  const ctx = this.ctx;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const start = this.worldToCanvas(a, 0);
  ctx.moveTo(start.x, start.y);
  for (let i = 0; i <= samples; i++) {
    const x = a + i * dx;
    const y = evalFn(x);
    if (y !== null && isFinite(y)) {
      const p = this.worldToCanvas(x, y);
      ctx.lineTo(p.x, p.y);
    }
  }
  const end = this.worldToCanvas(b, 0);
  ctx.lineTo(end.x, end.y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// ─── Numeric helpers ───
function numericDerivative(evalFn, x, h = 1e-5) {
  const a = evalFn(x - h), b = evalFn(x + h);
  if (a === null || b === null) return null;
  return (b - a) / (2 * h);
}

function riemannSum(evalFn, a, b, n, mode = 'L') {
  if (n < 1 || a >= b) return 0;
  const dx = (b - a) / n;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const xL = a + i * dx;
    const xR = xL + dx;
    if (mode === 'T') {
      const hL = evalFn(xL), hR = evalFn(xR);
      if (hL === null || hR === null) continue;
      total += ((hL + hR) / 2) * dx;
      continue;
    }
    let h;
    if (mode === 'L')      h = evalFn(xL);
    else if (mode === 'R') h = evalFn(xR);
    else                   h = evalFn(xL + dx / 2);
    if (h === null || !isFinite(h)) continue;
    total += h * dx;
  }
  return total;
}

// High-accuracy reference via Simpson's rule
function numericIntegral(evalFn, a, b, steps = 4000) {
  if (steps % 2 === 1) steps += 1;
  const dx = (b - a) / steps;
  let s = (evalFn(a) || 0) + (evalFn(b) || 0);
  for (let i = 1; i < steps; i++) {
    const x = a + i * dx;
    const y = evalFn(x);
    if (y === null || !isFinite(y)) continue;
    s += (i % 2 === 0 ? 2 : 4) * y;
  }
  return (s * dx) / 3;
}
