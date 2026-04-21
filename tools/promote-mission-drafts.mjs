#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  findCourseArtifactPath,
  getCoursePaths,
  resolveCourseDir,
  readJson,
  writeJson,
  slugify,
} from './lib/course-lib.mjs';

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
      console.log('usage: node tools/promote-mission-drafts.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function approvedDrafts(payload) {
  return (Array.isArray(payload.drafts) ? payload.drafts : []).filter((draft) =>
    draft.approval_status === 'approved'
      && (!draft.approved_target_destination || draft.approved_target_destination === 'missions/missions.json'),
  );
}

function runtimeMissionId(draft) {
  return draft.runtime_mission_id || draft.mission_id || slugify(draft.draft_id).replace(/^draft-/, 'mission-');
}

function runtimeSteps(draft) {
  const blueprintSteps = Array.isArray(draft.sbra_blueprint?.steps) ? draft.sbra_blueprint.steps : [];
  return blueprintSteps.map((step, index) => ({
    id: step.step_id || `step-${index + 1}`,
    title: `Step ${index + 1}: ${step.intent}`,
    prompt: `Choose the strongest process and reasoning for this step: ${step.intent}`,
    process_prompt: 'Select the process that best matches the goal of the step.',
    process_options: [
      {
        id: 'correct-process',
        text: `Use a process that stays aligned with the intent: ${step.intent}`,
        correct: true,
        feedback: 'This process stays aligned with the approved draft intent.',
        misconception_tags: [],
      },
      {
        id: 'wrong-process-1',
        text: 'Jump to an answer without checking the structure of the task.',
        correct: false,
        feedback: 'This skips the reasoning structure the draft is meant to measure.',
        misconception_tags: ['structure-ignored'],
      },
      {
        id: 'wrong-process-2',
        text: 'Pick a familiar move without confirming it fits this exact step.',
        correct: false,
        feedback: 'This treats familiarity as evidence instead of checking the step target.',
        misconception_tags: ['pattern-overfit'],
      },
    ],
    reasoning_prompt: 'Select the best reasoning for the chosen process.',
    reasoning_options: [
      {
        id: 'correct-reasoning',
        text: 'The process is defensible because it directly supports the goal of the step.',
        correct: true,
        feedback: 'This reasoning names why the process fits the step goal.',
        misconception_tags: [],
      },
      {
        id: 'wrong-reasoning-1',
        text: 'The fastest route is probably correct enough for this step.',
        correct: false,
        feedback: 'Speed alone is not a strong reason in a reviewed SBRA mission.',
        misconception_tags: ['speed-over-validity'],
      },
      {
        id: 'wrong-reasoning-2',
        text: 'The exact structure of the prompt does not matter once a likely answer appears.',
        correct: false,
        feedback: 'The mission still measures step-level reasoning tied to the task structure.',
        misconception_tags: ['structure-ignored'],
      },
    ],
    hint: `Reconnect the step to its main intent before selecting a process: ${step.intent}`,
  }));
}

function toRuntimeMission(draft) {
  const steps = runtimeSteps(draft);
  return {
    mission_id: runtimeMissionId(draft),
    source_draft_id: draft.draft_id,
    clo_id: draft.clo_id,
    module_id: draft.module_id,
    title: draft.title,
    mission_type: draft.mission_family,
    bloom_level: draft.bloom_level === 'analyze' ? 4 : draft.bloom_level,
    xp: 120 + (steps.length * 10),
    rubric: [
      `Choose processes that stay aligned with ${draft.clo_id} and the module target.`,
      'Justify the process with explicit reasoning instead of shortcut answers.',
      'Avoid the misconception patterns identified during draft review.',
    ],
    threshold: {
      min_steps_mastered: Math.max(2, steps.length - 1),
    },
    prompt: draft.prompt,
    strategy_prompt: draft.strategy_prompt,
    confidence: {
      prompt: 'Before submitting, rate how confident you are in the full process and reasoning chain.',
      levels: [1, 2, 3, 4, 5],
    },
    misconceptions: Array.isArray(draft.misconception_tags) ? draft.misconception_tags : [],
    steps,
  };
}

function mergeMissions(existing, generated) {
  const byId = new Map(existing.map((mission) => [mission.mission_id, mission]));
  generated.forEach((mission) => {
    byId.set(mission.mission_id, mission);
  });
  return [...byId.values()];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const config = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const draftPayload = await readJson(await findCourseArtifactPath(coursePaths, 'MISSION_DRAFTS'));
  const missionsPath = path.join(coursePaths.MISSIONS_DIR, 'missions.json');
  const existingPayload = await readJson(missionsPath);
  const logPath = courseArtifactPath(coursePaths, 'ASSESSMENT_PROMOTION_LOG');

  const approved = approvedDrafts(draftPayload);
  const promoted = approved.map(toRuntimeMission);
  const mergedMissions = mergeMissions(Array.isArray(existingPayload.missions) ? existingPayload.missions : [], promoted);

  await writeJson(missionsPath, {
    course_id: existingPayload.course_id || config.course_id,
    missions: mergedMissions,
  });

  await writeJson(logPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    promoted_at: new Date().toISOString(),
    promoted_count: promoted.length,
    promoted_draft_ids: approved.map((draft) => draft.draft_id),
    missions_path: 'missions/missions.json',
  });

  console.log(`Promoted ${promoted.length} approved mission draft(s) for ${config.course_id}`);
  console.log(`- missions: ${path.relative(process.cwd(), missionsPath)}`);
  console.log(`- log: ${path.relative(process.cwd(), logPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
