import { slugify } from './course-lib.mjs';

export function normalizeBloom(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

export function defaultEducationalSources() {
  return [
    {
      source_id: 'webwork-opl',
      label: 'WeBWorK Open Problem Library',
      homepage_url: 'https://webwork.maa.org/wiki/Open_Problem_Library',
      source_type: 'open-problem-library',
      license_note: 'Generally CC BY-NC-SA unless otherwise indicated; verify per source record when possible.',
      attribution_required: true,
      default_use_mode: 'ingest-with-attribution',
      approved_for_educational_use: true,
      notes: 'Strong default source for mathematics problem retrieval.',
    },
    {
      source_id: 'openstax',
      label: 'OpenStax',
      homepage_url: 'https://openstax.org/',
      source_type: 'open-textbook',
      license_note: 'Books may be CC BY or CC BY-NC-SA; verify the specific book license.',
      attribution_required: true,
      default_use_mode: 'ingest-with-attribution',
      approved_for_educational_use: true,
      notes: 'Good source for textbook-style exercises and review items.',
    },
    {
      source_id: 'mit-ocw',
      label: 'MIT OpenCourseWare',
      homepage_url: 'https://ocw.mit.edu/',
      source_type: 'open-course-materials',
      license_note: 'Open course materials with Creative Commons licensing; confirm page-level terms when needed.',
      attribution_required: true,
      default_use_mode: 'ingest-with-attribution',
      approved_for_educational_use: true,
      notes: 'Useful for assignments, exams, proof prompts, and richer content extracts.',
    },
    {
      source_id: 'libretexts',
      label: 'LibreTexts',
      homepage_url: 'https://libretexts.org/',
      source_type: 'open-textbook-network',
      license_note: 'Licensing varies by page and book; always review before ingestion.',
      attribution_required: true,
      default_use_mode: 'manual-review-first',
      approved_for_educational_use: true,
      notes: 'Good source, but license checks must stay page-specific.',
    },
    {
      source_id: 'project-euler',
      label: 'Project Euler',
      homepage_url: 'https://projecteuler.net/',
      source_type: 'problem-archive',
      license_note: 'Main problem archive is CC BY-NC-SA 4.0.',
      attribution_required: true,
      default_use_mode: 'ingest-with-attribution',
      approved_for_educational_use: true,
      notes: 'Best for enrichment and challenge problems.',
    },
    {
      source_id: 'cs-unplugged',
      label: 'CS Unplugged',
      homepage_url: 'https://www.csunplugged.org/',
      source_type: 'open-activity-bank',
      license_note: 'Activities are open source under Creative Commons Attribution-ShareAlike.',
      attribution_required: true,
      default_use_mode: 'ingest-with-attribution',
      approved_for_educational_use: true,
      notes: 'Good source for concept-focused computer science activities.',
    },
  ];
}

export function defaultSourcePolicy(courseId) {
  return {
    schema_version: '1.0.0',
    course_id: courseId,
    intended_use: 'educational-noncommercial',
    generated_at: new Date().toISOString(),
    sources: defaultEducationalSources(),
  };
}

export function reviewFields(approvedTargetDestination = null) {
  return {
    needs_human_review: true,
    approval_status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    approved_target_destination: approvedTargetDestination,
  };
}

export function screeningFields(source, query, approvedTargetDestination = null) {
  return {
    ...reviewFields(approvedTargetDestination),
    screening_status: 'proposed',
    recommended_use_mode: source?.default_use_mode || 'manual-review-first',
    provenance: {
      source_id: source?.source_id || null,
      source_title: source?.label || null,
      source_url: source?.homepage_url || null,
      query_id: query?.query_id || null,
      query_texts: Array.isArray(query?.query_texts) ? query.query_texts : [],
      license_note: source?.license_note || '',
      attribution_required: Boolean(source?.attribution_required),
    },
  };
}

export function defaultProblemQueryTexts(courseName, moduleTitle, cloLabel) {
  return [
    `${courseName} ${moduleTitle} exercises`,
    `${moduleTitle} open educational resources problems`,
    `${moduleTitle} ${cloLabel} worked problems`,
  ];
}

export function defaultContentQueryTexts(courseName, moduleTitle, cloLabel) {
  return [
    `${courseName} ${moduleTitle} lecture notes`,
    `${moduleTitle} interactive learning activity`,
    `${moduleTitle} ${cloLabel} worked example`,
  ];
}

export function preferredSourcesForText(text, mode = 'problem') {
  const haystack = String(text || '').toLowerCase();
  if (/computer|algorithm|program|ai/.test(haystack)) {
    return mode === 'content'
      ? ['mit-ocw', 'cs-unplugged', 'openstax']
      : ['mit-ocw', 'cs-unplugged', 'openstax'];
  }
  return ['webwork-opl', 'openstax', 'mit-ocw', 'libretexts'];
}

export function buildModuleQueries(config, kind) {
  const clos = Array.isArray(config.clos) ? config.clos : [];
  const modules = Array.isArray(config.modules) ? config.modules : [];
  const courseName = config.course_name_en || config.course_id;

  return modules.map((module, index) => {
    const clo = clos[index] || clos[0] || null;
    const cloLabel = clo?.label || 'course learning outcome';
    const bloom = normalizeBloom(clo?.bloom) || 'analyze';
    const queryTexts = kind === 'content'
      ? defaultContentQueryTexts(courseName, module.title || module.slug, cloLabel)
      : defaultProblemQueryTexts(courseName, module.title || module.slug, cloLabel);

    return {
      query_id: `${kind}-query-${String(index + 1).padStart(2, '0')}-${module.slug}`,
      module_id: module.id || module.slug,
      target_clo_ids: clo ? [clo.id] : [],
      target_bloom_levels: [bloom],
      query_texts: queryTexts,
      preferred_sources: preferredSourcesForText(`${courseName} ${module.title}`, kind),
      ...reviewFields(kind === 'content' ? 'generated/content/content-classification.json' : 'materials/processed/assessment/problem-pool.json'),
      status: 'pending',
    };
  });
}

export function buildSourceMap(items, key) {
  return new Map((Array.isArray(items) ? items : []).map((item) => [item[key], item]));
}

export function dedupeGroup(...parts) {
  return slugify(parts.filter(Boolean).join('-').slice(0, 140));
}
