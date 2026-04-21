'use strict';

(function () {
  function bindCompletionButton() {
    const button = document.querySelector('[data-complete-module]');
    if (!button) return;

    const status = document.getElementById('module-status-text');
    const moduleId = button.dataset.completeModule;
    const xpReward = Number(button.dataset.moduleXp || 0);
    const completed = window.loadState?.().lessonsCompleted?.includes(moduleId);

    if (completed) {
      button.disabled = true;
      if (status) status.textContent = 'บทเรียนนี้ถูกบันทึกว่าเรียนจบแล้ว';
    }

    button.addEventListener('click', () => {
      const fresh = window.completeLesson?.(moduleId, xpReward);
      if (fresh) {
        button.disabled = true;
        if (status) status.textContent = 'บันทึกความคืบหน้าเรียบร้อย และรับ XP แล้ว';
        window.fireConfetti?.(24);
      } else if (status) {
        status.textContent = 'บทเรียนนี้ถูกบันทึกไว้แล้วก่อนหน้า';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.CourseWidgets?.hydrateAll?.(document);
    bindCompletionButton();
    window.updateNavXP?.();
  });
})();
