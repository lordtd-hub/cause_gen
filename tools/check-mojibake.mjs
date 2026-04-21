#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PATTERN = new RegExp([
  '\\u0E40\\u0E18',
  '\\u0E40\\u0E19\\u20AC',
  '\\u0E4F\\u0E1F\\u0E1D',
  '\\uFFFD',
].join('|'));
const SCAN_ROOTS = ['docs', 'courses', 'tools', 'README.md'];
const ALLOWED_FILES = new Set([
  path.normalize('tools/validate-course.mjs'),
  path.normalize('tools/apply-source-refs.mjs'),
]);
const TEXT_EXTENSIONS = new Set(['.md', '.mjs', '.json', '.txt', '.yaml', '.yml']);
const IGNORED_DIRECTORIES = new Set([
  path.normalize('tools/vendor'),
  path.normalize('tools/vendor_clean'),
  path.normalize('tools/wheels'),
]);

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
  };
}

function walk(entryPath, results) {
  const relativePath = path.relative(ROOT, entryPath);
  const normalizedRelativePath = path.normalize(relativePath);

  if (IGNORED_DIRECTORIES.has(normalizedRelativePath)) {
    return;
  }

  let stat;
  try {
    stat = fs.statSync(entryPath);
  } catch (error) {
    if (error?.code === 'EPERM' || error?.code === 'EACCES') {
      return;
    }
    throw error;
  }

  if (stat.isDirectory()) {
    let children = [];
    try {
      children = fs.readdirSync(entryPath);
    } catch (error) {
      if (error?.code === 'EPERM' || error?.code === 'EACCES') {
        return;
      }
      throw error;
    }
    for (const child of children) {
      walk(path.join(entryPath, child), results);
    }
    return;
  }

  const extension = path.extname(entryPath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension) && path.basename(entryPath) !== 'README.md') {
    return;
  }

  if (ALLOWED_FILES.has(normalizedRelativePath)) {
    return;
  }

  const content = fs.readFileSync(entryPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const matches = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (PATTERN.test(lines[index])) {
      matches.push({
        line: index + 1,
        preview: lines[index].slice(0, 200),
      });
    }
  }

  if (matches.length > 0) {
    results.push({
      file: normalizedRelativePath,
      matches,
    });
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const results = [];

  for (const root of SCAN_ROOTS) {
    const targetPath = path.join(ROOT, root);
    if (fs.existsSync(targetPath)) {
      walk(targetPath, results);
    }
  }

  if (options.json) {
    console.log(JSON.stringify({
      ok: results.length === 0,
      ignored_files: [...ALLOWED_FILES],
      ignored_directories: [...IGNORED_DIRECTORIES],
      files: results,
    }, null, 2));
  } else if (results.length === 0) {
    console.log('No unexpected mojibake detected.');
  } else {
    console.log('Unexpected mojibake detected:');
    for (const result of results) {
      console.log(`- ${result.file}`);
      for (const match of result.matches) {
        console.log(`  line ${match.line}: ${match.preview}`);
      }
    }
  }

  if (results.length > 0) {
    process.exitCode = 1;
  }
}

main();
