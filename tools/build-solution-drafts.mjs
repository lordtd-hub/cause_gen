#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  fileExists,
  getCoursePaths,
  readJson,
  resolveCourseDir,
  slugify,
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
      console.log('usage: node tools/build-solution-drafts.mjs --course-dir courses/<course-id>');
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

function normalizeUseTargets(values) {
  const map = {
    'quick-check': 'quick_check',
    'module-checkpoint': 'module_checkpoint',
    'active-learning-task': 'active_learning_task',
    'sbra-exercise-bank': 'sbra_exercise_bank',
  };
  return normalizeList(values)
    .map((value) => map[value] || null)
    .filter(Boolean);
}

function inferDraftType(item) {
  const answerForm = String(item.expected_answer_form || '').toLowerCase();
  const usable = normalizeUseTargets(item.usable_for).join(' ');

  if (answerForm === 'multi-part-mixed' || usable.includes('sbra_exercise_bank') || usable.includes('active_learning_task')) {
    return 'worked-solution';
  }
  if (usable.includes('quick_check') && !usable.includes('module_checkpoint')) {
    return 'final-answer-only';
  }
  if (usable.includes('module_checkpoint') || usable.includes('mission')) {
    return 'outline';
  }
  return 'outline';
}

function inferExpectedAnswer(item) {
  const answerForm = String(item.expected_answer_form || '').toLowerCase();
  const problemType = String(item.problem_type || '').toLowerCase();

  if (answerForm === 'equation') return 'A final equation in simplified form.';
  if (answerForm === 'interval-description') return 'Intervals written with correct endpoint logic.';
  if (answerForm === 'function-form') return 'A complete function expression with any needed constant or condition.';
  if (answerForm === 'set-of-values') return 'A complete set of valid values with no missing cases.';
  if (answerForm === 'optimal-value') return 'The optimal value plus the quantity being optimized.';
  if (answerForm === 'rate-value') return 'A rate with correct sign and units.';
  if (answerForm === 'expression') return 'A simplified mathematical expression.';
  if (problemType.includes('classification')) return 'A classification decision with a short justification.';
  return null;
}

function inferSolutionOutline(item) {
  const problemType = String(item.problem_type || '').toLowerCase();
  const answerForm = String(item.expected_answer_form || '').toLowerCase();
  const targetSkill = item.target_skill || 'the target skill';

  if (problemType === 'related-rates') {
    return [
      'Name the changing quantities and the target rate.',
      'Write the relationship between the variables before differentiating.',
      'Differentiate with respect to time and substitute known values carefully.',
      'State the final rate with the correct sign and units.',
    ];
  }
  if (problemType === 'optimization') {
    return [
      'Define the objective function and any constraint clearly.',
      'Rewrite the objective in one variable over a valid domain.',
      'Differentiate, find critical points, and test feasibility.',
      'State the optimal value in the original context.',
    ];
  }
  if (problemType === 'motion-analysis') {
    return [
      'Identify whether the prompt needs position, velocity, acceleration, or accumulated change.',
      'Differentiate or integrate the given model as needed.',
      'Evaluate the result at the requested time or condition.',
      'Interpret the sign and meaning of the final result in context.',
    ];
  }
  if (problemType === 'applied-integral' || problemType === 'accumulation') {
    return [
      'Identify the accumulated quantity and the correct interval or bounds.',
      'Set up the definite integral that matches the context.',
      'Evaluate the integral carefully and simplify.',
      'Interpret the accumulated result in the original context.',
    ];
  }
  if (problemType === 'symbolic-derivative') {
    return [
      'Identify the derivative rule or combination of rules required.',
      'Differentiate step by step without skipping inner-function changes.',
      'Simplify the final derivative expression.',
    ];
  }
  if (problemType === 'symbolic-integral') {
    return [
      'Identify the antiderivative technique that matches the integrand.',
      'Carry out the antiderivative carefully.',
      'Simplify the final answer and include the constant of integration when appropriate.',
    ];
  }
  if (problemType === 'classification') {
    return [
      'Identify the condition or definition that controls the classification.',
      'Check the relevant cases or limiting behavior carefully.',
      'State the final classification and justify it with the correct condition.',
    ];
  }
  if (answerForm === 'multi-part-mixed') {
    return [
      'Break the prompt into its sub-questions before solving.',
      'Choose the correct technique for each sub-part.',
      'Solve each part in order and keep the notation consistent.',
      'Review whether the final answers address every requested part.',
    ];
  }
  return [
    `Identify what the problem is really asking about ${targetSkill}.`,
    'Choose the core technique that matches the problem type.',
    'Carry out the main mathematical steps in a defensible order.',
    'State the final answer in the required form and context.',
  ];
}

function inferProblemAnalysis(item) {
  const problemType = String(item.problem_type || '').toLowerCase();
  const targetSkill = item.target_skill || 'the target skill';

  if (problemType === 'related-rates') {
    return 'Identify the changing quantities, the target rate, and the geometric or algebraic relation that must hold before differentiating.';
  }
  if (problemType === 'optimization') {
    return 'Identify the quantity to optimize, the constraint that limits the model, and the feasible domain before solving.';
  }
  if (problemType === 'motion-analysis') {
    return 'Decide whether the question is asking about position, velocity, acceleration, or accumulated change, then connect the given model to that quantity.';
  }
  if (problemType === 'applied-integral' || problemType === 'accumulation') {
    return 'Determine what quantity is being accumulated and which interval or bounds control the total change.';
  }
  if (problemType === 'classification') {
    return 'Identify the defining condition or theorem that controls the classification and check the relevant cases carefully.';
  }
  if (problemType === 'symbolic-derivative') {
    return 'Recognize the derivative structure first so the correct rule or rule combination is chosen before differentiating.';
  }
  if (problemType === 'symbolic-integral') {
    return 'Recognize the antiderivative structure first so the correct integration technique is chosen before computing.';
  }
  return `Focus first on what the problem is asking about ${targetSkill} before jumping into algebraic manipulation.`;
}

function inferHintDrafts(item) {
  const answerForm = String(item.expected_answer_form || '').toLowerCase();
  const problemType = String(item.problem_type || '').toLowerCase();
  const hints = [
    'Start by naming the quantity or claim you must determine.',
    'Check which calculus technique matches the problem type before computing.',
  ];

  if (problemType === 'classification') {
    hints.push('Use the definition or condition of the concept before deciding the answer.');
  }
  if (problemType === 'related-rates') {
    hints.push('Relate the variables first; do not substitute numbers too early.');
  }
  if (problemType === 'applied-integral' || problemType === 'accumulation') {
    hints.push('Think about what quantity is accumulating and what interval is relevant.');
  }
  if (answerForm === 'interval-description') {
    hints.push('A sign chart or interval test may be more reliable than checking just one point.');
  }

  return Array.from(new Set(hints));
}

function inferCommonErrorNotes(item) {
  const errors = normalizeList(item.misconception_tags).map((tag) => tag.replaceAll('-', ' '));
  if (errors.length > 0) {
    return errors.map((tag) => `Watch for ${tag}.`);
  }
  return ['Review whether the chosen technique really matches the problem structure.'];
}

function pickPrimaryUseTarget(item) {
  const targets = normalizeUseTargets(item.usable_for);
  const priority = [
    'sbra_exercise_bank',
    'active_learning_task',
    'module_checkpoint',
    'quick_check',
  ];
  for (const target of priority) {
    if (targets.includes(target)) return target;
  }
  return 'module_checkpoint';
}

function buildQuickCheckProfile(item) {
  return {
    answer_only: inferExpectedAnswer(item),
  };
}

function buildModuleCheckpointProfile(item) {
  return {
    concept_summary: inferProblemAnalysis(item),
    answer: inferExpectedAnswer(item),
  };
}

function buildActiveLearningProfile(item) {
  return {
    problem_analysis: inferProblemAnalysis(item),
    method_steps: inferSolutionOutline(item),
    answer: inferExpectedAnswer(item),
  };
}

function sbraStepTemplates(item) {
  const problemType = String(item.problem_type || '').toLowerCase();
  const targetSkill = item.target_skill || 'the target skill';

  if (problemType === 'related-rates') {
    return [
      {
        title: 'Identify the changing quantities',
        prompt: 'Which quantities are changing, and which rate is actually being asked for?',
        processPrompt: 'Choose the best opening process.',
        correctProcess: 'Name the variables and the target rate before differentiating.',
        wrongProcess: 'Substitute the known numbers immediately and hope the relation appears later.',
        reasoningPrompt: 'Why is that opening process the right one?',
        correctReasoning: 'Related-rates problems depend on a variable relation that must be set up before time differentiation.',
        wrongReasoning: 'Because the first numbers in the prompt should always be used immediately.',
      },
      {
        title: 'Build and differentiate the relation',
        prompt: 'What should be done after naming the variables?',
        processPrompt: 'Choose the next process.',
        correctProcess: 'Write the relation among the variables, then differentiate with respect to time.',
        wrongProcess: 'Differentiate each number in the prompt separately.',
        reasoningPrompt: 'Why is that the correct next move?',
        correctReasoning: 'The changing quantities are linked, so the derivative must come from the full relation.',
        wrongReasoning: 'Because time differentiation only matters after the final answer is found.',
      },
      {
        title: 'Substitute and interpret the result',
        prompt: 'How should the final rate be completed?',
        processPrompt: 'Choose the best finishing process.',
        correctProcess: 'Substitute the known values after differentiation and report the rate with sign and units.',
        wrongProcess: 'Drop the units and keep only the bare number.',
        reasoningPrompt: 'Why does that finishing process matter?',
        correctReasoning: 'A rate is not complete unless the sign, quantity, and units all match the context.',
        wrongReasoning: 'Because units do not matter once differentiation has been used.',
      },
    ];
  }

  if (problemType === 'optimization') {
    return [
      {
        title: 'Choose the optimization model',
        prompt: 'What is the correct opening move for this optimization problem?',
        processPrompt: 'Choose the best process.',
        correctProcess: 'Define the objective and any constraint before differentiating.',
        wrongProcess: 'Differentiate the first formula that appears without modeling the constraint.',
        reasoningPrompt: 'Why is that process correct?',
        correctReasoning: 'Optimization needs a valid objective function on a feasible domain before critical points can mean anything.',
        wrongReasoning: 'Because the derivative automatically gives the correct answer even without a model.',
      },
      {
        title: 'Reduce to one variable',
        prompt: 'What should be done before solving for critical points?',
        processPrompt: 'Choose the next process.',
        correctProcess: 'Rewrite the objective using the constraint so only one variable remains.',
        wrongProcess: 'Keep multiple free variables and differentiate anyway.',
        reasoningPrompt: 'Why is that the better move?',
        correctReasoning: 'Critical-point analysis is meaningful only when the objective is written in one independent variable over the feasible set.',
        wrongReasoning: 'Because extra variables make the algebra look more complete.',
      },
      {
        title: 'Check the optimum',
        prompt: 'How should the candidate solution be validated?',
        processPrompt: 'Choose the best finishing process.',
        correctProcess: 'Test the critical point against feasibility and the original context before stating the optimum.',
        wrongProcess: 'State the first critical point found as the answer without checking it.',
        reasoningPrompt: 'Why is that validation necessary?',
        correctReasoning: 'A critical point is only useful after checking whether it fits the domain and actually optimizes the target quantity.',
        wrongReasoning: 'Because every critical point is automatically the best answer.',
      },
    ];
  }

  const genericPrompt = `How should a learner structure the work on ${targetSkill}?`;
  return [
    {
      title: 'Identify the mathematical target',
      prompt: genericPrompt,
      processPrompt: 'Choose the best opening process.',
      correctProcess: 'Start by identifying what quantity, condition, or claim the problem is really asking about.',
      wrongProcess: 'Start manipulating symbols immediately without naming the mathematical target.',
      reasoningPrompt: 'Why is that process the better start?',
      correctReasoning: 'The right process depends on understanding the mathematical target before computing.',
      wrongReasoning: 'Because any computation is useful even when the goal is not clear.',
    },
    {
      title: 'Select the method',
      prompt: 'What should happen after the target is identified?',
      processPrompt: 'Choose the best next process.',
      correctProcess: 'Choose the calculus technique that matches the problem structure.',
      wrongProcess: 'Reuse the most recent technique from class without checking fit.',
      reasoningPrompt: 'Why is that the correct next move?',
      correctReasoning: 'Method choice should be justified by the structure of the problem, not by habit alone.',
      wrongReasoning: 'Because the newest technique is always the intended one.',
    },
    {
      title: 'Justify the result',
      prompt: 'How should the work be completed?',
      processPrompt: 'Choose the best finishing process.',
      correctProcess: 'State the result in the required form and justify why it answers the original prompt.',
      wrongProcess: 'Stop as soon as a number or formula appears.',
      reasoningPrompt: 'Why is that finishing process stronger?',
      correctReasoning: 'A result must be interpreted in the original context to count as a defensible answer.',
      wrongReasoning: 'Because any computed output is automatically self-explanatory.',
    },
  ];
}

function buildSbraProfile(item) {
  const steps = sbraStepTemplates(item).map((step, index) => ({
    step_id: `step-${index + 1}`,
    title: step.title,
    prompt: step.prompt,
    process_prompt: step.processPrompt,
    process_options: [
      {
        id: `process-${index + 1}-a`,
        text: step.correctProcess,
        correct: true,
        feedback: 'This process aligns with the structure of the problem.',
      },
      {
        id: `process-${index + 1}-b`,
        text: step.wrongProcess,
        correct: false,
        feedback: 'This process reflects a plausible but weaker move that can derail the solution.',
      },
    ],
    reasoning_prompt: step.reasoningPrompt,
    reasoning_options: [
      {
        id: `reasoning-${index + 1}-a`,
        text: step.correctReasoning,
        correct: true,
        feedback: 'This reasoning explains why the process is mathematically justified.',
      },
      {
        id: `reasoning-${index + 1}-b`,
        text: step.wrongReasoning,
        correct: false,
        feedback: 'This reasoning does not justify the process mathematically.',
      },
    ],
  }));

  return {
    problem_analysis: inferProblemAnalysis(item),
    steps,
    answer: inferExpectedAnswer(item),
  };
}

function buildDownstreamProfiles(item) {
  const profiles = {};
  const targets = normalizeUseTargets(item.usable_for);

  if (targets.includes('quick_check')) {
    profiles.quick_check = buildQuickCheckProfile(item);
  }
  if (targets.includes('module_checkpoint')) {
    profiles.module_checkpoint = buildModuleCheckpointProfile(item);
  }
  if (targets.includes('active_learning_task')) {
    profiles.active_learning_task = buildActiveLearningProfile(item);
  }
  if (targets.includes('sbra_exercise_bank')) {
    profiles.sbra_exercise_bank = buildSbraProfile(item);
  }

  return profiles;
}

function inferConfidence(item, draftType) {
  let score = 0.45;
  if (item.expected_answer_form) score += 0.1;
  if (item.problem_type) score += 0.1;
  if (normalizeList(item.misconception_tags).length > 0) score += 0.1;
  if (draftType === 'final-answer-only') score += 0.1;
  return Number(Math.min(0.9, score).toFixed(2));
}

function buildDraft(item) {
  const draftType = inferDraftType(item);
  const primaryUseTarget = pickPrimaryUseTarget(item);
  return {
    draft_id: `solution-${slugify(item.problem_id)}`,
    problem_id: item.problem_id,
    module_id: item.module_id || 'mixed',
    clo_id: item.clo_id || '',
    bloom_level: item.bloom_level || '',
    primary_use_target: primaryUseTarget,
    draft_type: draftType,
    solution_status: 'drafted',
    ...reviewFields('generated/assessment/mission-drafts.json'),
    review_status: 'pending',
    expected_answer_form: item.expected_answer_form || 'numeric-or-expression',
    expected_answer: inferExpectedAnswer(item),
    solution_outline: inferSolutionOutline(item),
    full_solution_latex: null,
    hint_drafts: inferHintDrafts(item),
    common_error_notes: inferCommonErrorNotes(item),
    solution_confidence: inferConfidence(item, draftType),
    downstream_profiles: buildDownstreamProfiles(item),
    source_refs: {
      problem_pool_item: item.problem_id,
    },
  };
}

function preserveReviewState(freshDraft, existingDraft) {
  if (!existingDraft || typeof existingDraft !== 'object') return freshDraft;
  return {
    ...freshDraft,
    draft_type: existingDraft.draft_type || freshDraft.draft_type,
    primary_use_target: existingDraft.primary_use_target || freshDraft.primary_use_target,
    solution_status: existingDraft.solution_status ?? freshDraft.solution_status,
    approval_status: existingDraft.approval_status ?? freshDraft.approval_status,
    reviewed_by: existingDraft.reviewed_by ?? freshDraft.reviewed_by,
    reviewed_at: existingDraft.reviewed_at ?? freshDraft.reviewed_at,
    approved_target_destination: existingDraft.approved_target_destination ?? freshDraft.approved_target_destination,
    review_status: existingDraft.review_status ?? freshDraft.review_status,
    expected_answer_form: existingDraft.expected_answer_form || freshDraft.expected_answer_form,
    expected_answer: existingDraft.expected_answer ?? freshDraft.expected_answer,
    solution_outline: Array.isArray(existingDraft.solution_outline) && existingDraft.solution_outline.length > 0
      ? existingDraft.solution_outline
      : freshDraft.solution_outline,
    full_solution_latex: existingDraft.full_solution_latex ?? freshDraft.full_solution_latex,
    hint_drafts: Array.isArray(existingDraft.hint_drafts) && existingDraft.hint_drafts.length > 0
      ? existingDraft.hint_drafts
      : freshDraft.hint_drafts,
    common_error_notes: Array.isArray(existingDraft.common_error_notes) && existingDraft.common_error_notes.length > 0
      ? existingDraft.common_error_notes
      : freshDraft.common_error_notes,
    solution_confidence: existingDraft.solution_confidence ?? freshDraft.solution_confidence,
    downstream_profiles: existingDraft.downstream_profiles ?? freshDraft.downstream_profiles,
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
  const courseConfig = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const pool = await readJson(await findCourseArtifactPath(coursePaths, 'PROBLEM_POOL_JSON'));
  const outputPath = courseArtifactPath(coursePaths, 'SOLUTION_DRAFTS');
  const existingPayload = await fileExists(outputPath) ? await readJson(outputPath) : null;
  const existingMap = new Map(
    Array.isArray(existingPayload?.drafts)
      ? existingPayload.drafts.map((draft) => [draft.draft_id, draft])
      : [],
  );

  if (!Array.isArray(pool.items)) {
    throw new Error('problem-pool.json must contain an items array');
  }

  const sourceItems = pool.items.filter((item) => item.solution_required === true);
  const drafts = sourceItems.map((item) => {
    const freshDraft = buildDraft(item);
    return preserveReviewState(freshDraft, existingMap.get(freshDraft.draft_id));
  });

  await writeJson(outputPath, {
    schema_version: '1.0.0',
    course_id: courseConfig.course_id,
    source_problem_pool: 'materials/processed/assessment/problem-pool.json',
    generated_at: new Date().toISOString(),
    drafts,
  });

  console.log(`Built ${drafts.length} solution draft(s) for ${courseConfig.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
