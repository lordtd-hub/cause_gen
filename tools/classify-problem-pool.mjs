#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  getCoursePaths,
  resolveCourseDir,
  readJson,
  writeJson,
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
      console.log('usage: node tools/classify-problem-pool.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function normalizeList(values) {
  return Array.isArray(values) ? values.filter(Boolean) : [];
}

function buildFallbackSbraProfile(item) {
  const usable = normalizeList(item.usable_for);
  const type = String(item.problem_type || '').toLowerCase();
  const bloom = String(item.bloom_level || '').toLowerCase();
  const statement = String(item.statement || '').toLowerCase();
  const misconceptionTags = normalizeList(item.misconception_tags);

  let candidateStrength = 'medium';
  if (usable.includes('sbra-exercise-bank') || usable.includes('active-learning-task')) {
    candidateStrength = 'strong';
  } else if (['computation', 'symbolic-derivative', 'symbolic-integral'].includes(type)
      && bloom === 'apply'
      && !usable.includes('active-learning-task')) {
    candidateStrength = 'not_recommended';
  } else if (usable.includes('quick-check')) {
    candidateStrength = 'weak';
  }

  const patternTags = [];
  if (type === 'related-rates') {
    patternTags.push('variable-relation-setup', 'differentiate-with-respect-to-time', 'substitute-after-differentiation');
  } else if (type === 'optimization') {
    patternTags.push('objective-function-setup', 'constraint-substitution', 'critical-point-analysis');
  } else if (type === 'motion-analysis') {
    patternTags.push('differentiate-model', 'evaluate-condition', 'context-interpretation');
  } else if (type === 'classification' || statement.includes('continuous') || statement.includes('discontinuous')) {
    patternTags.push('definition-check', 'classification-justification');
  } else if (type === 'applied-integral' || type === 'accumulation') {
    patternTags.push('integral-setup', 'bound-selection', 'result-interpretation');
  } else {
    patternTags.push('method-selection', 'result-justification');
  }

  const distractorFocus = [...misconceptionTags];
  if (type === 'related-rates') distractorFocus.push('premature-substitution', 'missing-units');
  if (type === 'optimization') distractorFocus.push('unchecked-critical-point');
  if (type === 'motion-analysis') distractorFocus.push('wrong-target-quantity');

  return {
    candidate_strength: candidateStrength,
    evidence_role: candidateStrength === 'strong'
      ? 'primary-clo-evidence'
      : candidateStrength === 'medium'
        ? 'support-clo-evidence'
        : candidateStrength === 'weak'
          ? 'practice-or-check'
          : 'not-recommended',
    recommended_step_count: candidateStrength === 'strong' ? 3 : candidateStrength === 'medium' ? 2 : 1,
    pattern_tags: Array.from(new Set(patternTags)),
    distractor_focus: Array.from(new Set(distractorFocus)),
  };
}

function normalizeSbraProfile(item) {
  const profile = item?.sbra_profile;
  if (profile && typeof profile === 'object' && profile.candidate_strength) {
    return {
      candidate_strength: profile.candidate_strength,
      evidence_role: profile.evidence_role || buildFallbackSbraProfile(item).evidence_role,
      recommended_step_count: Number(profile.recommended_step_count || 2),
      pattern_tags: normalizeList(profile.pattern_tags),
      distractor_focus: normalizeList(profile.distractor_focus),
    };
  }
  return buildFallbackSbraProfile(item);
}

function inferMissionFamily(item) {
  const usable = normalizeList(item.usable_for).join(' ').toLowerCase();
  const type = String(item.problem_type || '').toLowerCase();
  const bloom = String(item.bloom_level || '').toLowerCase();
  const statement = String(item.statement || '').toLowerCase();
  const sbraStrength = String(normalizeSbraProfile(item).candidate_strength || '').toLowerCase();

  if (type.includes('proof')) return 'proof-reasoning';
  if (type.includes('classification')) return 'quick-check';
  if (type.includes('reflection')) return 'reflection';
  if (type.includes('diagnosis') || statement.includes('diagnose')) return 'diagnose-and-justify';
  if (usable.includes('sbra') && ['strong', 'medium'].includes(sbraStrength)) return 'sbra-step-reasoning';
  if (['analyze', 'evaluate', 'create'].includes(bloom)) return 'sbra-step-reasoning';
  return 'quick-check';
}

function inferSbraShape(item, missionFamily) {
  const type = String(item.problem_type || '').toLowerCase();
  if (missionFamily === 'proof-reasoning') return 'claim-evidence-repair';
  if (missionFamily === 'reflection') return 'reflect-and-prioritize';
  if (type.includes('classification')) return 'sort-and-justify';
  if (type.includes('diagnosis')) return 'diagnose-and-justify';
  return 'choose-and-justify';
}

function inferConfidence(item) {
  const anchors = [
    item.module_id,
    item.clo_id,
    item.bloom_level,
    item.problem_type,
  ].filter(Boolean).length;
  return Number((0.35 + Math.min(anchors, 4) * 0.12).toFixed(2));
}

function classifyItem(item) {
  const missionFamily = inferMissionFamily(item);
  const sbraProfile = normalizeSbraProfile(item);
  return {
    problem_id: item.problem_id,
    classification_status: 'proposed',
    confidence: inferConfidence(item),
    ...reviewFields('generated/assessment/mission-drafts.json'),
    proposed: {
      module_id: item.module_id || 'mixed',
      clo_id: item.clo_id || 'CLO1',
      bloom_level: item.bloom_level || 'analyze',
      mission_family: missionFamily,
      problem_type: item.problem_type || 'reasoning',
      target_skill: item.target_skill || '',
      misconception_tags: normalizeList(item.misconception_tags),
      usable_for: normalizeList(item.usable_for),
      sbra_profile: sbraProfile,
      sbra_shape: inferSbraShape(item, missionFamily),
    },
    review_notes: 'AI proposal only. Human approval is required before this item can be treated as mission-ready.',
  };
}

function validateProblemPool(problemPool) {
  if (!problemPool || !Array.isArray(problemPool.items)) {
    throw new Error('problem-pool.json must contain an items array');
  }
  problemPool.items.forEach((item, index) => {
    if (!item.problem_id || !item.statement) {
      throw new Error(`problem-pool.json item ${index + 1} must include problem_id and statement`);
    }
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const courseConfig = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const poolPath = await findCourseArtifactPath(coursePaths, 'PROBLEM_POOL_JSON');
  const classificationPath = courseArtifactPath(coursePaths, 'ASSESSMENT_CLASSIFICATION');
  const problemPool = await readJson(poolPath);
  validateProblemPool(problemPool);

  const classifications = problemPool.items.map(classifyItem);

  await writeJson(classificationPath, {
    schema_version: '1.0.0',
    course_id: courseConfig.course_id,
    source_problem_pool: 'materials/processed/assessment/problem-pool.json',
    generated_at: new Date().toISOString(),
    classifications,
  });

  console.log(`Classified ${classifications.length} problem-pool item(s) for ${courseConfig.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), classificationPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
