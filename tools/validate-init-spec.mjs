#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { exampleSpec, normalizeSpec } from './init-new-course.mjs';

function usage() {
  console.log(`usage:
  node tools/validate-init-spec.mjs --spec <path>
  node tools/validate-init-spec.mjs --example

options:
  --spec <path>   Path to the init-course JSON spec to validate
  --example       Validate the built-in example spec instead of reading a file
`);
}

function parseArgs(argv) {
  const options = {
    example: false,
    specPath: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--example') {
      options.example = true;
    } else if (arg === '--spec') {
      options.specPath = argv[index + 1];
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printSummary(normalized, originLabel) {
  console.log(`Spec validation passed for ${originLabel}`);
  console.log(`- course_id: ${normalized.course_id}`);
  console.log(`- course_name: ${normalized.course_name_th} / ${normalized.course_name_en}`);
  console.log(`- instructor: ${normalized.instructor}`);
  console.log(`- features: resources=${normalized.features.resources}, missions=${normalized.features.missions}, games=${normalized.features.games}`);
  console.log(`- clos: ${normalized.clos.length}`);
  normalized.clos.forEach((clo) => {
    console.log(`  - ${clo.id}: ${clo.label}`);
  });
  console.log(`- modules: ${normalized.modules.length}`);
  normalized.modules.forEach((module) => {
    console.log(`  - ${String(module.order).padStart(2, '0')}. ${module.slug} | kind=${module.module_kind} | clos=${module.clo_ids.join(', ')}`);
  });
  console.log(`- widgets_enabled: ${normalized.widgets_enabled.join(', ')}`);
  console.log(`- missions: ${normalized.missions.length}`);
  console.log(`- resources: ${normalized.resources.length}`);

  const fileResources = normalized.resources.filter((resource) => resource.type === 'file');
  if (fileResources.length > 0) {
    console.log('- resource files:');
    fileResources.forEach((resource) => {
      const hasInlineBody = Boolean(resource.body && resource.body.trim());
      const note = hasInlineBody ? 'inline-body=yes' : 'inline-body=no';
      console.log(`  - ${resource.path} (${note})`);
    });
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.example && !options.specPath) {
    usage();
    process.exit(1);
  }

  try {
    const raw = options.example
      ? exampleSpec()
      : JSON.parse(await fs.readFile(path.resolve(options.specPath), 'utf8'));
    const normalized = normalizeSpec(raw);
    const originLabel = options.example ? 'built-in example spec' : path.resolve(options.specPath);
    printSummary(normalized, originLabel);
  } catch (error) {
    console.error('Spec validation failed:');
    console.error(`- ${error.message}`);
    process.exit(1);
  }
}

await main();
