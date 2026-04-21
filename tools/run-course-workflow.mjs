#!/usr/bin/env node

import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  fileExists,
  findCourseArtifactPath,
  getCoursePaths,
  readJson,
  resolveCourseDir,
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
      console.log('usage: node tools/run-course-workflow.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function runNodeScript(script, courseDir) {
  execFileSync('node', [script, '--course-dir', courseDir], {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
}

async function jsonOrNull(target) {
  if (!(await fileExists(target))) return null;
  return readJson(target);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const relativeCourseDir = path.relative(process.cwd(), courseDir);
  const coursePaths = getCoursePaths(courseDir);

  const currentTaskPath = await findCourseArtifactPath(coursePaths, 'CURRENT_TASK');
  const tqf3AnchorPath = await findCourseArtifactPath(coursePaths, 'TQF3_COURSE_ANCHOR');
  const tqf3CloPath = await findCourseArtifactPath(coursePaths, 'TQF3_CLO_MAP');
  const tqf3WeekPath = await findCourseArtifactPath(coursePaths, 'TQF3_WEEK_TO_MODULE_MAP');
  const tqf3EvidencePath = await findCourseArtifactPath(coursePaths, 'TQF3_ASSESSMENT_EVIDENCE_MAP');

  if (!(await fileExists(currentTaskPath))) {
    console.log('Workflow stop: scaffold layer is missing.');
    console.log(`Next review action: run node tools/init-new-course.mjs --course-dir ${relativeCourseDir} --spec <spec-path>`);
    return;
  }

  const minimumPackageReady = await fileExists(tqf3AnchorPath)
    && await fileExists(tqf3CloPath)
    && await fileExists(tqf3WeekPath)
    && await fileExists(tqf3EvidencePath);

  if (!minimumPackageReady) {
    console.log('Workflow stop: TQF3 package is still incomplete.');
    console.log('Next review action: prepare the missing TQF3 framing files before orchestration continues.');
    return;
  }

  runNodeScript('tools/apply-source-refs.mjs', relativeCourseDir);

  const problemSourcePolicyPath = await findCourseArtifactPath(coursePaths, 'PROBLEM_SOURCE_POLICY');
  if (!(await fileExists(problemSourcePolicyPath))) {
    runNodeScript('tools/init-problem-sourcing.mjs', relativeCourseDir);
  }
  const contentSourcePolicyPath = await findCourseArtifactPath(coursePaths, 'CONTENT_SOURCE_POLICY');
  if (!(await fileExists(contentSourcePolicyPath))) {
    runNodeScript('tools/init-content-authoring.mjs', relativeCourseDir);
  }

  const problemPoolStarterPath = await findCourseArtifactPath(coursePaths, 'PROBLEM_POOL_STARTER');
  if (await fileExists(problemPoolStarterPath)) {
    const problemPoolJsonPath = await findCourseArtifactPath(coursePaths, 'PROBLEM_POOL_JSON');
    if (!(await fileExists(problemPoolJsonPath))) {
      runNodeScript('tools/init-assessment-engine.mjs', relativeCourseDir);
    }
    const assessmentClassificationPath = await findCourseArtifactPath(coursePaths, 'ASSESSMENT_CLASSIFICATION');
    if (!(await fileExists(assessmentClassificationPath))) {
      runNodeScript('tools/classify-problem-pool.mjs', relativeCourseDir);
    }
    const missionDraftsPath = await findCourseArtifactPath(coursePaths, 'MISSION_DRAFTS');
    if (!(await fileExists(missionDraftsPath))) {
      runNodeScript('tools/build-mission-drafts.mjs', relativeCourseDir);
    }
  }

  const retrievedProblemsPath = await findCourseArtifactPath(coursePaths, 'RETRIEVED_PROBLEMS');
  const screenedProblemsPath = await findCourseArtifactPath(coursePaths, 'SCREENED_PROBLEMS');
  const retrievedProblems = await jsonOrNull(retrievedProblemsPath);
  if (retrievedProblems && Array.isArray(retrievedProblems.items) && retrievedProblems.items.length > 0) {
    runNodeScript('tools/screen-retrieved-problems.mjs', relativeCourseDir);
  }

  const retrievedContentPath = await findCourseArtifactPath(coursePaths, 'RETRIEVED_CONTENT');
  const screenedContentPath = await findCourseArtifactPath(coursePaths, 'SCREENED_CONTENT');
  const contentClassificationPath = await findCourseArtifactPath(coursePaths, 'CONTENT_CLASSIFICATION');
  const contentDraftsPath = await findCourseArtifactPath(coursePaths, 'CONTENT_DRAFTS');
  const retrievedContent = await jsonOrNull(retrievedContentPath);
  if (retrievedContent && Array.isArray(retrievedContent.items) && retrievedContent.items.length > 0) {
    runNodeScript('tools/screen-retrieved-content.mjs', relativeCourseDir);
  }
  const screenedContent = await jsonOrNull(screenedContentPath);
  if (screenedContent && Array.isArray(screenedContent.items) && screenedContent.items.length > 0) {
    runNodeScript('tools/classify-content-sources.mjs', relativeCourseDir);
    runNodeScript('tools/build-content-drafts.mjs', relativeCourseDir);
  }

  const missionDraftPayload = await jsonOrNull(await findCourseArtifactPath(coursePaths, 'MISSION_DRAFTS'));
  const approvedMissionDrafts = Array.isArray(missionDraftPayload?.drafts)
    ? missionDraftPayload.drafts.filter((draft) => draft.approval_status === 'approved').length
    : 0;
  if (approvedMissionDrafts > 0) {
    runNodeScript('tools/promote-mission-drafts.mjs', relativeCourseDir);
  }

  const contentDraftPayload = await jsonOrNull(contentDraftsPath);
  const approvedContentDrafts = Array.isArray(contentDraftPayload?.drafts)
    ? contentDraftPayload.drafts.filter((draft) => draft.approval_status === 'approved').length
    : 0;
  if (approvedContentDrafts > 0) {
    runNodeScript('tools/promote-content-drafts.mjs', relativeCourseDir);
  }

  runNodeScript('tools/build-course.mjs', relativeCourseDir);
  runNodeScript('tools/validate-course.mjs', relativeCourseDir);
  execFileSync('node', ['tools/validate-course.mjs', '--course-dir', relativeCourseDir, '--check-output'], {
    cwd: process.cwd(),
    stdio: 'inherit',
  });

  console.log('');
  console.log('Readiness snapshot:');
  execFileSync('node', ['tools/check-workflow-readiness.mjs', '--course-dir', relativeCourseDir], {
    cwd: process.cwd(),
    stdio: 'inherit',
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
