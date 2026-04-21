#!/usr/bin/env node

import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  courseArtifactPath,
  fileExists,
  getCoursePaths,
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
      console.log('usage: node tools/solve-solution-drafts.mjs --course-dir courses/<course-id>');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const poolPath = courseArtifactPath(coursePaths, 'PROBLEM_POOL_JSON');
  const solutionDraftsPath = courseArtifactPath(coursePaths, 'SOLUTION_DRAFTS');

  if (!(await fileExists(poolPath))) {
    throw new Error(`problem-pool.json was not found: ${poolPath}`);
  }

  if (!(await fileExists(solutionDraftsPath))) {
    execFileSync(process.execPath, [
      path.join(process.cwd(), 'tools', 'build-solution-drafts.mjs'),
      '--course-dir',
      courseDir,
    ], {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  }

  const solverScript = path.join(process.cwd(), 'tools', 'scripts', 'solve_problem_pool.py');
  const pythonCmd = path.join(process.cwd(), 'tools', 'python.cmd');

  const rawOutput = execFileSync(process.env.ComSpec || 'cmd.exe', [
    '/c',
    pythonCmd,
    solverScript,
    '--problem-pool',
    poolPath,
    '--solution-drafts',
    solutionDraftsPath,
  ], {
    cwd: process.cwd(),
    encoding: 'utf-8',
  }).trim();

  const summary = JSON.parse(rawOutput || '{}');
  console.log(`Solved ${summary.solved ?? 0} problem(s)`);
  console.log(`Blocked ${summary.blocked ?? 0} problem(s)`);
  console.log(`- output: ${path.relative(process.cwd(), solutionDraftsPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
