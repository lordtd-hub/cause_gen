#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

function printStatus(label, state, detail) {
  const icon = state === 'ok' ? '[ok]' : state === 'warn' ? '[warn]' : '[missing]';
  console.log(`${icon} ${label}: ${detail}`);
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function resolvePythonCandidate() {
  if (process.env.CODEX_BUNDLED_PYTHON) {
    return process.env.CODEX_BUNDLED_PYTHON;
  }
  return path.join(os.homedir(), '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'python.exe');
}

function tryCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: false,
  });
  return {
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
}

async function main() {
  console.log('Cause Gen machine-readiness check');
  console.log(`- repo: ${ROOT}`);

  const requiredPaths = [
    ['README', path.join(ROOT, 'README.md')],
    ['docs', path.join(ROOT, 'docs')],
    ['tools', path.join(ROOT, 'tools')],
    ['courses', path.join(ROOT, 'courses')],
    ['python wrapper', path.join(ROOT, 'tools', 'python.cmd')],
  ];

  for (const [label, target] of requiredPaths) {
    printStatus(label, await exists(target) ? 'ok' : 'missing', target);
  }

  printStatus('node', 'ok', `${process.execPath} (${process.version})`);

  const bundledPython = resolvePythonCandidate();
  if (await exists(bundledPython)) {
    printStatus('bundled python', 'ok', bundledPython);
  } else {
    const pythonFallback = tryCommand('cmd', ['/c', 'where python']);
    const pyFallback = tryCommand('cmd', ['/c', 'where py']);
    if (pythonFallback.ok || pyFallback.ok) {
      const detail = pythonFallback.ok ? pythonFallback.stdout.split(/\r?\n/)[0] : pyFallback.stdout.split(/\r?\n/)[0];
      printStatus('python fallback', 'warn', `bundled runtime missing, fallback found at ${detail}`);
    } else {
      printStatus('python', 'missing', `no bundled runtime at ${bundledPython} and no PATH fallback found`);
    }
  }

  const optionalPortablePaths = [
    ['vendored solver libs', path.join(ROOT, 'tools', 'vendor_clean')],
    ['offline wheels', path.join(ROOT, 'tools', 'wheels')],
  ];

  for (const [label, target] of optionalPortablePaths) {
    printStatus(label, await exists(target) ? 'ok' : 'warn', await exists(target) ? target : `${target} (optional but useful for offline move)` );
  }

  const hasPythonResolution = await exists(bundledPython) || tryCommand('cmd', ['/c', 'where python']).ok || tryCommand('cmd', ['/c', 'where py']).ok;
  printStatus(
    'python wrapper resolution',
    hasPythonResolution ? 'ok' : 'warn',
    hasPythonResolution
      ? 'tools/python.cmd can resolve a Python runtime on this machine; direct child-process smoke tests may be blocked in sandboxed checks'
      : 'tools/python.cmd may fail until a bundled or PATH Python is available',
  );

  console.log('Suggested next step:');
  console.log('- node tools/check-machine-readiness.mjs');
  console.log('- node tools/check-mojibake.mjs');
  console.log('- node tools/check-workflow-readiness.mjs --course-dir courses/calculus1_real_check');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
