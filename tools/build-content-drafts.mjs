#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  fileExists,
  getCoursePaths,
  resolveCourseDir,
  readJson,
  writeJson,
  slugify,
} from './lib/course-lib.mjs';
import { reviewFields } from './lib/shared-sourcing.mjs';

function parseArgs(argv) {
  const options = {
    courseDir: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/build-content-drafts.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function widgetPayload(draft) {
  if (!draft.widget_type) return null;
  if (draft.widget_type === 'quick-check') {
    return {
      title: draft.title,
      prompt: draft.summary || 'Use this prompt as a short concept check before moving on.',
      choices: [
        'A response that stays aligned with the module target',
        'A tempting but weaker response',
        'A response that ignores the stated condition',
      ],
      answer_index: 0,
      explanation: draft.source_note || 'This draft still needs human review before it becomes a stronger learning asset.',
    };
  }
  return {
    title: draft.title,
    prompt: draft.summary || 'Work through the sequence and explain your reasoning.',
    steps: [
      'Identify the main signal in the source material.',
      'Connect the signal to the module target.',
      'Explain what learners should notice before moving on.',
    ],
  };
}

function markdownBlock(draft) {
  const sections = [
    `### ${draft.title}`,
    '',
    draft.summary || 'This reviewed content draft is meant to reinforce the module target before deeper authoring.',
    '',
    `- Asset family: ${draft.asset_family}`,
    `- Target section: ${draft.target_section}`,
    `- CLO focus: ${(draft.clo_ids || []).join(', ') || 'course review required'}`,
    `- Bloom focus: ${(draft.bloom_levels || []).join(', ') || 'course review required'}`,
  ];

  if (draft.excerpt) {
    sections.push('', '> Source excerpt', `> ${draft.excerpt}`);
  }
  if (draft.source_note) {
    sections.push('', `- Source note: ${draft.source_note}`);
  }

  const widget = widgetPayload(draft);
  if (widget && draft.widget_type) {
    sections.push('', `:::${draft.widget_type}`, JSON.stringify(widget, null, 2), ':::');
  }

  return sections.join('\n');
}

function preserveReviewState(freshDraft, existingDraft) {
  if (!existingDraft || typeof existingDraft !== 'object') return freshDraft;
  return {
    ...freshDraft,
    runtime_ready: existingDraft.runtime_ready ?? freshDraft.runtime_ready,
    approval_status: existingDraft.approval_status ?? freshDraft.approval_status,
    reviewed_by: existingDraft.reviewed_by ?? freshDraft.reviewed_by,
    reviewed_at: existingDraft.reviewed_at ?? freshDraft.reviewed_at,
    approved_target_destination: existingDraft.approved_target_destination ?? freshDraft.approved_target_destination,
    review_status: existingDraft.review_status ?? freshDraft.review_status,
    source_refs: {
      ...(freshDraft.source_refs || {}),
      ...(existingDraft.source_refs || {}),
    },
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const config = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const classification = await readJson(await findCourseArtifactPath(coursePaths, 'CONTENT_CLASSIFICATION'));
  const outputPath = courseArtifactPath(coursePaths, 'CONTENT_DRAFTS');
  const existingPayload = await fileExists(outputPath) ? await readJson(outputPath) : null;
  const existingMap = new Map(
    Array.isArray(existingPayload?.drafts)
      ? existingPayload.drafts.map((draft) => [draft.draft_id, draft])
      : [],
  );

  const items = Array.isArray(classification.items) ? classification.items : [];
  const drafts = items.map((entry) => {
    const proposed = entry.proposed || {};
    const draft = {
      draft_id: `content-draft-${slugify(entry.content_id || proposed.title || 'item')}`,
      content_id: entry.content_id,
      module_id: proposed.module_id || 'mixed',
      clo_ids: Array.isArray(proposed.clo_ids) ? proposed.clo_ids : [],
      bloom_levels: Array.isArray(proposed.bloom_levels) ? proposed.bloom_levels : [],
      content_kind: proposed.content_kind || 'concept-explainer',
      asset_family: proposed.asset_family || 'module-content-block',
      target_section: proposed.target_section || 'module-core-content',
      widget_type: proposed.widget_type || null,
      title: proposed.title || entry.content_id,
      summary: proposed.summary || '',
      excerpt: proposed.excerpt || '',
      source_note: proposed.source_note || '',
      runtime_ready: false,
      ...reviewFields('modules/*.md'),
      review_status: 'pending',
    };
    const freshDraft = {
      ...draft,
      markdown_block: markdownBlock(draft),
      source_refs: {
        content_classification: entry.content_id,
      },
    };
    return preserveReviewState(freshDraft, existingMap.get(freshDraft.draft_id));
  });

  await writeJson(outputPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    source_content_classification: 'generated/content/content-classification.json',
    generated_at: new Date().toISOString(),
    drafts,
  });

  console.log(`Built ${drafts.length} content draft(s) for ${config.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
