#!/usr/bin/env node

import path from 'node:path';
import {
  courseArtifactPath,
  getCoursePaths,
  resolveCourseDir,
  readJson,
  writeJson,
  fileExists,
} from './lib/course-lib.mjs';
import {
  buildModuleQueries,
  defaultSourcePolicy,
} from './lib/shared-sourcing.mjs';

function parseArgs(argv) {
  const options = {
    courseDir: null,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/init-content-authoring.mjs --course-dir courses/<course-id> [--force]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

async function ensureJson(target, payload, force) {
  if (!(await fileExists(target)) || force) {
    await writeJson(target, payload);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const config = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));

  const policyPath = courseArtifactPath(coursePaths, 'CONTENT_SOURCE_POLICY');
  const queriesPath = courseArtifactPath(coursePaths, 'CONTENT_RETRIEVAL_QUERIES');
  const retrievedPath = courseArtifactPath(coursePaths, 'RETRIEVED_CONTENT');
  const screenedPath = courseArtifactPath(coursePaths, 'SCREENED_CONTENT');
  const classificationPath = courseArtifactPath(coursePaths, 'CONTENT_CLASSIFICATION');
  const draftsPath = courseArtifactPath(coursePaths, 'CONTENT_DRAFTS');

  await ensureJson(policyPath, defaultSourcePolicy(config.course_id), options.force);
  await ensureJson(queriesPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    generated_at: new Date().toISOString(),
    queries: buildModuleQueries(config, 'content'),
  }, options.force);
  await ensureJson(retrievedPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    generated_at: new Date().toISOString(),
    items: [],
  }, options.force);
  await ensureJson(screenedPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    generated_at: new Date().toISOString(),
    items: [],
  }, options.force);
  await ensureJson(classificationPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    generated_at: new Date().toISOString(),
    items: [],
  }, options.force);
  await ensureJson(draftsPath, {
    schema_version: '1.0.0',
    course_id: config.course_id,
    generated_at: new Date().toISOString(),
    drafts: [],
  }, options.force);

  console.log(`Initialized content authoring engine for ${config.course_id}`);
  console.log(`- policy: ${path.relative(process.cwd(), policyPath)}`);
  console.log(`- queries: ${path.relative(process.cwd(), queriesPath)}`);
  console.log(`- retrieved: ${path.relative(process.cwd(), retrievedPath)}`);
  console.log(`- screened: ${path.relative(process.cwd(), screenedPath)}`);
  console.log(`- classification: ${path.relative(process.cwd(), classificationPath)}`);
  console.log(`- drafts: ${path.relative(process.cwd(), draftsPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
