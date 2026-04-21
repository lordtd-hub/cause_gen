'use strict';

(function () {
  const cache = new Map();

  async function loadJson(path) {
    if (cache.has(path)) return cache.get(path);
    const promise = fetch(path, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
      return res.json();
    });
    cache.set(path, promise);
    return promise;
  }

  function getCourseConfigSync() {
    return window.__COURSE_CONFIG__ || null;
  }

  async function loadCourseConfig(path = 'data/course.config.json') {
    return getCourseConfigSync() || loadJson(path);
  }

  function renderMath(root = document.body) {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(root, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      } catch (_) {
        // ignore KaTeX render issues for malformed snippets
      }
    }
  }

  function courseKey(suffix) {
    const course = getCourseConfigSync();
    const id = course?.course_id || 'course';
    return `${id}_${suffix}`;
  }

  window.CourseRuntime = {
    loadJson,
    loadCourseConfig,
    getCourseConfigSync,
    renderMath,
    courseKey,
  };
})();
