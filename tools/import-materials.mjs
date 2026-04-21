#!/usr/bin/env node

import path from 'node:path';
import {
  importMaterialFile,
  listFiles,
  resolveCourseDir,
  getCoursePaths,
} from './lib/course-lib.mjs';

function parseArgs(argv) {
  const options = {
    courseDir: null,
    inputs: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/import-materials.mjs [--course-dir courses/<course-dir>] [input-path ...]');
      process.exit(0);
    } else {
      options.inputs.push(arg);
    }
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));
const courseDir = resolveCourseDir(options.courseDir ?? undefined);
const { MATERIALS_PROCESSED_INTAKE_DIR, MATERIALS_RAW_DIR } = getCoursePaths(courseDir);

const files = options.inputs.length > 0
  ? options.inputs.map((arg) => path.resolve(arg))
  : await listFiles(MATERIALS_RAW_DIR, ['.md', '.tex', '.docx']);

if (files.length === 0) {
  console.log('No raw materials found to import.');
  process.exit(0);
}

const imported = [];
for (const file of files) {
  const outPath = await importMaterialFile(file, MATERIALS_PROCESSED_INTAKE_DIR);
  imported.push({ source: file, output: outPath });
}

console.log(`Imported ${imported.length} material file(s) into ${path.relative(process.cwd(), MATERIALS_PROCESSED_INTAKE_DIR).replace(/\\/g, '/')}:`);
imported.forEach((entry) => console.log(`- ${entry.source} -> ${entry.output}`));
