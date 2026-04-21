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
import {
  buildSourceMap,
} from './lib/shared-sourcing.mjs';
import {
  buildProblemItems,
  fetchPdfPreferredSource,
  findSourceByDomain,
  htmlToText,
  mergeRetrievedItems,
  searchEducationalLinks,
} from './lib/source-retriever.mjs';

function parseArgs(argv) {
  const options = {
    courseDir: null,
    queryIds: [],
    sourceIds: [],
    urls: [],
    limit: 2,
    perPage: 2,
    replace: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--query-id') {
      options.queryIds.push(argv[index + 1]);
      index += 1;
    } else if (arg === '--source-id') {
      options.sourceIds.push(argv[index + 1]);
      index += 1;
    } else if (arg === '--url') {
      options.urls.push(argv[index + 1]);
      index += 1;
    } else if (arg === '--file') {
      options.urls.push(argv[index + 1]);
      index += 1;
    } else if (arg === '--limit') {
      options.limit = Number(argv[index + 1] || 2);
      index += 1;
    } else if (arg === '--per-page') {
      options.perPage = Number(argv[index + 1] || 2);
      index += 1;
    } else if (arg === '--replace') {
      options.replace = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/retrieve-problems.mjs --course-dir courses/<course-id> [--query-id <id>] [--source-id <id>] [--url <url-or-resource-page>] [--file <local-pdf-or-text>] [--limit 2] [--per-page 2] [--replace]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function pickQueries(allQueries, selectedIds) {
  if (selectedIds.length === 0) return allQueries;
  const wanted = new Set(selectedIds);
  return allQueries.filter((query) => wanted.has(query.query_id));
}

function pickSources(policySources, query, sourceIds) {
  const sourceMap = buildSourceMap(policySources, 'source_id');
  const preferred = Array.isArray(query?.preferred_sources) ? query.preferred_sources : [];
  const selected = sourceIds.length > 0 ? sourceIds : preferred;
  return selected
    .map((sourceId) => sourceMap.get(sourceId))
    .filter(Boolean);
}

async function retrieveFromUrl(url, source, query, perPage) {
  const fetched = await fetchPdfPreferredSource(url);
  const html = fetched.sourceKind === 'html' ? fetched.body : '';
  const bodyText = fetched.sourceKind === 'pdf' ? fetched.body : htmlToText(fetched.body);
  return buildProblemItems({
    source,
    query,
    sourceUrl: fetched.url,
    html,
    bodyText,
    perPage,
    retrievalMethod: fetched.sourceKind === 'pdf'
      ? (/^https?:\/\//i.test(url) ? 'pdf-document' : 'local-pdf')
      : (/^https?:\/\//i.test(url) ? 'direct-url' : 'local-source'),
    sourceTitleOverride: fetched.extractedTitle || '',
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const config = await readJson(path.join(coursePaths.COURSE_DIR, 'course.config.json'));
  const policy = await readJson(await findCourseArtifactPath(coursePaths, 'PROBLEM_SOURCE_POLICY'));
  const queriesPayload = await readJson(await findCourseArtifactPath(coursePaths, 'RETRIEVAL_QUERIES'));
  const retrievedPath = courseArtifactPath(coursePaths, 'RETRIEVED_PROBLEMS');
  const existing = await readJson(retrievedPath);

  const allQueries = Array.isArray(queriesPayload.queries) ? queriesPayload.queries : [];
  const queries = pickQueries(allQueries, options.queryIds);
  if (queries.length === 0) {
    throw new Error('No retrieval queries matched. Check --query-id or initialize problem sourcing first.');
  }

  const collected = [];
  const policySources = Array.isArray(policy.sources) ? policy.sources : [];
  const sourceMap = buildSourceMap(policySources, 'source_id');

  if (options.urls.length > 0) {
    const query = queries[0];
    for (const url of options.urls) {
      const explicitSource = options.sourceIds.length === 1 ? sourceMap.get(options.sourceIds[0]) : null;
      const inferredSource = explicitSource || findSourceByDomain(policySources, url);
      if (!inferredSource) {
        throw new Error(`Could not match URL to an approved source policy entry: ${url}`);
      }
      collected.push(...await retrieveFromUrl(url, inferredSource, query, options.perPage));
    }
  } else {
    for (const query of queries) {
      const sources = pickSources(policySources, query, options.sourceIds);
      for (const source of sources) {
        const queryTexts = Array.isArray(query.query_texts) ? query.query_texts : [];
        for (const queryText of queryTexts) {
          const links = await searchEducationalLinks(queryText, source, options.limit);
          for (const link of links) {
            try {
              collected.push(...await retrieveFromUrl(link, source, {
                ...query,
                query_text: queryText,
              }, options.perPage));
            } catch (error) {
              console.warn(`Skip ${link}: ${error.message}`);
            }
          }
          if (collected.length >= options.limit * options.perPage) break;
        }
        if (collected.length >= options.limit * options.perPage) break;
      }
      if (collected.length >= options.limit * options.perPage) break;
    }
  }

  const mergedItems = options.replace
    ? collected
    : mergeRetrievedItems(existing?.items, collected, 'retrieval_id');

  await writeJson(retrievedPath, {
    schema_version: '1.1.0',
    course_id: config.course_id,
    generated_at: new Date().toISOString(),
    items: mergedItems,
  });

  console.log(`Retrieved ${collected.length} problem candidate(s) for ${config.course_id}`);
  console.log(`- output: ${path.relative(process.cwd(), retrievedPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
