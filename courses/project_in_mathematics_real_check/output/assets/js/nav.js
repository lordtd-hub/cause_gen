'use strict';

// ── Mobile nav helpers ──
// - Close drawer on Escape
// - Close drawer after tapping any link inside it
// (Outside-tap is handled CSS-only via <label for="nav-toggle" class="nav-overlay">)

(function () {
  function closeDrawer() {
    const t = document.getElementById('nav-toggle');
    if (t && t.checked) t.checked = false;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-links .nav-link').forEach(a => {
      a.addEventListener('click', () => closeDrawer());
    });
  });
})();
