import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { slugify } from './course-lib.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_TIMEOUT_MS = 20000;
const SEARCH_RESULT_LIMIT = 5;
const USER_AGENT = 'CauseGenRetriever/1.0 (+educational noncommercial review-first)';
const STOPWORDS = new Set([
  'with',
  'from',
  'that',
  'this',
  'open',
  'educational',
  'resources',
  'worked',
  'problem',
  'problems',
  'exercise',
  'exercises',
  'lecture',
  'lectures',
  'notes',
  'interactive',
  'learning',
  'activity',
  'activities',
  'course',
  'courses',
  'module',
  'modules',
  'applications',
  'calculus',
  'complex',
  'variables',
  'functions',
  'example',
  'examples',
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function bundledPythonPath() {
  const bundled = path.join(
    process.env.USERPROFILE || '',
    '.cache',
    'codex-runtimes',
    'codex-primary-runtime',
    'dependencies',
    'python',
    'python.exe',
  );
  return bundled;
}

function pdfExtractorPath() {
  return path.resolve(__dirname, '..', 'scripts', 'extract_pdf_text.py');
}

export function sourceDomains(source) {
  const homepage = String(source?.homepage_url || '').trim();
  if (!homepage) return [];
  try {
    const url = new URL(homepage);
    const hostname = url.hostname.replace(/^www\./, '');
    return Array.from(new Set([hostname, `www.${hostname}`]));
  } catch {
    return [];
  }
}

export function findSourceByDomain(sources, targetUrl) {
  try {
    const hostname = new URL(targetUrl).hostname.replace(/^www\./, '');
    return (Array.isArray(sources) ? sources : []).find((source) => {
      const domains = sourceDomains(source).map((value) => value.replace(/^www\./, ''));
      return domains.includes(hostname);
    }) || null;
  } catch {
    return null;
  }
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)));
}

function normalizePdfText(text) {
  return normalizeExtractedText(
    String(text || '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n'),
  );
}

function normalizeExtractedText(text) {
  return String(text || '')
    .replace(/âˆ’|−|โ’/g, '-')
    .replace(/โ€/g, "'")
    .replace(/โ€/g, "'")
    .replace(/โ’/g, '->')
    .replace(/â€¦/g, '...')
    .replace(/โ€|โ€/g, '"')
    .replace(/â€œ|â€/g, '"')
    .replace(/â€˜|â€™/g, "'")
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+\?/g, '?')
    .replace(/\s+,/g, ',')
    .replace(/\s+\./g, '.')
    .trim();
}

function looksLikePdfBuffer(buffer) {
  const header = Buffer.from(buffer || []).subarray(0, 16).toString('latin1');
  return /^\s*%PDF-/i.test(header);
}

export function htmlToText(html) {
  return normalizeExtractedText(decodeHtmlEntities(
    String(html || '')
      .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<\/(p|div|section|article|li|h1|h2|h3|h4|h5|h6|tr|td)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\r/g, '')
      .replace(/\t/g, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n'),
  )).trim();
}

function extractPdfLinks(html, baseUrl) {
  const links = [];
  for (const match of String(html || '').matchAll(/<a[^>]+href=["']([^"']+\.pdf(?:\?[^"']*)?)["']/gi)) {
    try {
      links.push(new URL(decodeHtmlEntities(match[1]), baseUrl).toString());
    } catch {
      // ignore malformed links
    }
  }
  for (const match of String(html || '').matchAll(/https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?/gi)) {
    links.push(decodeHtmlEntities(match[0]));
  }
  for (const match of String(html || '').matchAll(/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?/gi)) {
    try {
      links.push(new URL(decodeHtmlEntities(match[0]), baseUrl).toString());
    } catch {
      // ignore malformed links
    }
  }
  return Array.from(new Set(links));
}

function extractTagContent(html, pattern) {
  const match = String(html || '').match(pattern);
  return match ? decodeHtmlEntities(match[1]).trim() : '';
}

export function extractTitle(html, fallbackUrl) {
  return extractTagContent(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || extractTagContent(html, /<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i)
    || extractTagContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i)
    || fallbackUrl;
}

export function extractDescription(html) {
  return extractTagContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || extractTagContent(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
}

function splitParagraphs(text) {
  return String(text || '')
    .split(/\n{2,}|\n(?=[A-Z][a-z])|\n(?=\d+\.)/)
    .map((value) => value.trim())
    .filter((value) => value.length >= 40);
}

function scoreProblemParagraph(value) {
  const text = value.toLowerCase();
  let score = 0;
  if (/\?/.test(text)) score += 3;
  if (/\b(show|prove|justify|determine|find|compute|evaluate|classify|check|question|exercise|problem)\b/.test(text)) score += 4;
  if (/\b(limit|continuous|continuity|complex|analytic|derivative|integral|series|residue)\b/.test(text)) score += 2;
  if (text.length >= 90 && text.length <= 480) score += 1;
  return score;
}

function scoreContentParagraph(value) {
  const text = value.toLowerCase();
  let score = 0;
  if (/\b(example|worked example|activity|interactive|lecture|definition|theorem|note|visualize|explore)\b/.test(text)) score += 4;
  if (/\b(limit|continuous|continuity|complex|analytic|derivative|integral|series|residue)\b/.test(text)) score += 2;
  if (text.length >= 80 && text.length <= 520) score += 1;
  return score;
}

function topParagraphs(paragraphs, scorer, perPage) {
  return paragraphs
    .map((paragraph) => ({ paragraph, score: scorer(paragraph) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, perPage)
    .map((entry) => entry.paragraph);
}

function stableId(kind, parts) {
  const base = parts.filter(Boolean).join(' ');
  const hash = crypto.createHash('sha1').update(base).digest('hex').slice(0, 10);
  return `${kind}-${slugify(base).slice(0, 48) || kind}-${hash}`;
}

async function fetchRemote(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'text/html, text/plain, application/xhtml+xml;q=0.9,*/*;q=0.1',
    },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type') || '';
  const isPdf = /application\/pdf/i.test(contentType) || /\.pdf(?:$|\?)/i.test(response.url);
  if (isPdf) {
    const pdfBuffer = Buffer.from(await response.arrayBuffer());
    if (looksLikePdfBuffer(pdfBuffer)) {
      const extracted = await extractPdfTextFromBuffer(pdfBuffer, response.url);
      return {
        url: response.url,
        contentType,
        sourceKind: 'pdf',
        body: extracted.text,
        extractedTitle: extracted.title,
      };
    }

    const body = pdfBuffer.toString('utf8');
    const htmlLike = /<html/i.test(body) || /text\/html|application\/xhtml\+xml/i.test(contentType);
    return {
      url: response.url,
      contentType: htmlLike ? 'text/html' : contentType,
      sourceKind: htmlLike ? 'html' : 'text',
      body,
      pdfLinks: htmlLike ? extractPdfLinks(body, response.url) : [],
    };
  }
  if (!/(text\/html|text\/plain|application\/xhtml\+xml|application\/xml|text\/xml)/i.test(contentType)) {
    throw new Error(`Unsupported content type for ${url}: ${contentType}`);
  }
  const body = await response.text();
  const pdfLinks = /text\/html|application\/xhtml\+xml/i.test(contentType)
    ? extractPdfLinks(body, response.url)
    : [];
  return {
    url: response.url,
    contentType,
    sourceKind: /text\/html|application\/xhtml\+xml/i.test(contentType) ? 'html' : 'text',
    body,
    pdfLinks,
  };
}

async function readLocal(target) {
  if (/\.pdf$/i.test(target)) {
    const extracted = await extractPdfTextFromFile(path.resolve(target));
    return {
      url: target,
      contentType: 'application/pdf',
      sourceKind: 'pdf',
      body: extracted.text,
      extractedTitle: extracted.title,
    };
  }
  return {
    url: target,
    contentType: 'text/plain',
    sourceKind: 'text',
    body: await fs.readFile(path.resolve(target), 'utf8'),
  };
}

export async function fetchSource(target) {
  if (/^https?:\/\//i.test(target)) {
    return fetchRemote(target);
  }
  return readLocal(target);
}

async function extractPdfTextFromFile(pdfPath) {
  const stdout = execFileSync(bundledPythonPath(), [pdfExtractorPath(), pdfPath], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  const payload = JSON.parse(stdout);
  return {
    title: payload.title || path.basename(pdfPath, path.extname(pdfPath)),
    text: normalizePdfText(payload.text || ''),
  };
}

async function extractPdfTextFromBuffer(buffer, sourceUrl) {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cause-gen-pdf-'));
  const tempPdf = path.join(tempRoot, 'source.pdf');
  await fs.writeFile(tempPdf, buffer);
  try {
    return await extractPdfTextFromFile(tempPdf, sourceUrl);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

function parseDuckDuckGoLinks(html) {
  const links = [];
  const patterns = [
    /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"/gi,
    /<a[^>]+href="([^"]+)"[^>]*data-testid="result-title-a"/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const href = decodeHtmlEntities(match[1]);
      if (href) links.push(href);
    }
  }
  return links.map((href) => {
    try {
      if (href.startsWith('//')) return `https:${href}`;
      const url = new URL(href, 'https://html.duckduckgo.com');
      const uddg = url.searchParams.get('uddg');
      return uddg ? decodeURIComponent(uddg) : href;
    } catch {
      return href;
    }
  });
}

function filterLinksBySource(links, source) {
  const domains = sourceDomains(source).map((value) => value.replace(/^www\./, ''));
  if (domains.length === 0) return [];
  return Array.from(new Set(links.filter((href) => {
    try {
      const hostname = new URL(href).hostname.replace(/^www\./, '');
      return domains.includes(hostname);
    } catch {
      return false;
    }
  })));
}

export async function searchEducationalLinks(queryText, source, limit = 2) {
  const sitemapLinks = await discoverLinksFromSitemaps(queryText, source, limit).catch(() => []);
  if (sitemapLinks.length > 0) {
    return sitemapLinks.slice(0, limit);
  }

  const domains = sourceDomains(source);
  const links = [];
  for (const domain of domains) {
    const target = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:${domain} ${queryText}`)}`;
    const { body } = await fetchRemote(target);
    const pageLinks = filterLinksBySource(parseDuckDuckGoLinks(body), source).slice(0, SEARCH_RESULT_LIMIT);
    links.push(...pageLinks);
    if (Array.from(new Set(links)).length >= limit) break;
    await sleep(250);
  }
  return Array.from(new Set(links)).slice(0, limit);
}

export async function fetchPdfPreferredSource(target) {
  const initial = await fetchSource(target);
  if (initial.sourceKind === 'html' && Array.isArray(initial.pdfLinks) && initial.pdfLinks.length > 0) {
    try {
      const preferred = await fetchSource(initial.pdfLinks[0]);
      return preferred.sourceKind === 'pdf' ? preferred : initial;
    } catch {
      return initial;
    }
  }
  return initial;
}

function queryTokens(queryText) {
  return Array.from(new Set(
    slugify(queryText)
      .split('-')
      .filter((token) => token.length >= 4 && !STOPWORDS.has(token)),
  ));
}

function scoreCandidateUrl(url, tokens) {
  const haystack = slugify(url);
  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
}

async function fetchRobotsSitemaps(source) {
  const homepage = String(source?.homepage_url || '').trim();
  if (!homepage) return [];
  const url = new URL(homepage);
  const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
  const sitemaps = [];
  try {
    const { body } = await fetchRemote(robotsUrl);
    for (const line of body.split(/\r?\n/)) {
      const match = line.match(/^Sitemap:\s*(.+)$/i);
      if (match) sitemaps.push(match[1].trim());
    }
  } catch {
    // ignore and fall back
  }
  if (sitemaps.length === 0) {
    sitemaps.push(`${url.protocol}//${url.host}/sitemap.xml`);
  }
  return Array.from(new Set(sitemaps));
}

async function discoverLinksFromSitemaps(queryText, source, limit = 2) {
  const sitemaps = await fetchRobotsSitemaps(source);
  const tokens = queryTokens(queryText);
  const scored = [];
  async function fetchSitemapDocument(sitemapUrl) {
    const { body } = await fetchRemote(sitemapUrl);
    const locs = Array.from(body.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)).map((match) => decodeHtmlEntities(match[1]).trim());
    return {
      isIndex: /<sitemapindex/i.test(body),
      locs,
    };
  }
  for (const sitemap of sitemaps.slice(0, 4)) {
    let urls = [];
    try {
      const document = await fetchSitemapDocument(sitemap);
      if (document.isIndex) {
        const scoredNested = document.locs
          .map((url) => ({ url, score: scoreCandidateUrl(url, tokens) }))
          .sort((a, b) => b.score - a.score);
        const positiveNested = scoredNested.filter((entry) => entry.score > 0);
        const nestedTargets = (positiveNested.length > 0 ? positiveNested : scoredNested)
          .slice(0, 20)
          .map((entry) => entry.url);
        for (const target of nestedTargets) {
          try {
            const nested = await fetchSitemapDocument(target);
            urls.push(...nested.locs);
          } catch {
            // ignore a broken nested sitemap
          }
          if (urls.length >= 5000) break;
        }
      } else {
        urls = document.locs;
      }
    } catch {
      continue;
    }
    for (const url of urls.slice(0, 4000)) {
      const score = scoreCandidateUrl(url, tokens);
      if (score > 0) scored.push({ url, score });
    }
    if (scored.length >= limit * 4) break;
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.url)
    .filter((url, index, all) => all.indexOf(url) === index)
    .slice(0, limit);
}

function commonRetrievedFields({ source, query, sourceUrl, sourceTitle, retrievalMethod }) {
  return {
    source_id: source?.source_id || null,
    source_url: sourceUrl,
    source_title: sourceTitle,
    query_id: query?.query_id || null,
    query_text: query?.query_text || null,
    candidate_module_id: query?.module_id || 'mixed',
    candidate_clo_ids: Array.isArray(query?.target_clo_ids) ? query.target_clo_ids : [],
    candidate_bloom_levels: Array.isArray(query?.target_bloom_levels) ? query.target_bloom_levels : [],
    retrieval_method: retrievalMethod,
    license_note: source?.license_note || '',
    attribution_required: Boolean(source?.attribution_required),
  };
}

export function buildProblemItems({ source, query, sourceUrl, html, bodyText, perPage = 2, retrievalMethod = 'direct-url', sourceTitleOverride = '' }) {
  const sourceTitle = sourceTitleOverride || extractTitle(html, sourceUrl);
  const description = extractDescription(html);
  const paragraphs = splitParagraphs(bodyText);
  const selected = topParagraphs(paragraphs, scoreProblemParagraph, perPage);
  const fallbackSnippet = description || paragraphs[0] || '';
  const snippets = selected.length > 0 ? selected : (fallbackSnippet ? [fallbackSnippet] : []);
  return snippets.map((snippet, index) => {
    const normalized = normalizeExtractedText(snippet.replace(/\s+/g, ' ')).slice(0, 420);
    return {
      retrieval_id: stableId('retrieved-problem', [source?.source_id, query?.query_id, sourceUrl, normalized, index]),
      ...commonRetrievedFields({ source, query, sourceUrl, sourceTitle, retrievalMethod }),
      retrieved_excerpt: normalized.slice(0, 280),
      normalized_statement: normalized,
    };
  });
}

export function buildContentItems({ source, query, sourceUrl, html, bodyText, perPage = 2, retrievalMethod = 'direct-url', sourceTitleOverride = '' }) {
  const sourceTitle = sourceTitleOverride || extractTitle(html, sourceUrl);
  const description = extractDescription(html);
  const paragraphs = splitParagraphs(bodyText);
  const selected = topParagraphs(paragraphs, scoreContentParagraph, perPage);
  const fallbackSnippet = description || paragraphs[0] || '';
  const snippets = selected.length > 0 ? selected : (fallbackSnippet ? [fallbackSnippet] : []);
  return snippets.map((snippet, index) => {
    const normalized = normalizeExtractedText(snippet.replace(/\s+/g, ' ')).slice(0, 460);
    const contentId = stableId('retrieved-content', [source?.source_id, query?.query_id, sourceUrl, normalized, index]);
    return {
      retrieval_id: stableId('retrieval', [source?.source_id, query?.query_id, sourceUrl, normalized, index]),
      content_id: contentId,
      ...commonRetrievedFields({ source, query, sourceUrl, sourceTitle, retrievalMethod }),
      content_title: sourceTitle,
      content_summary: (description || normalized).slice(0, 280),
      content_excerpt: normalized.slice(0, 320),
    };
  });
}

export function mergeRetrievedItems(existingItems, incomingItems, idField = 'retrieval_id') {
  const map = new Map();
  for (const item of Array.isArray(existingItems) ? existingItems : []) {
    map.set(item[idField], item);
  }
  for (const item of Array.isArray(incomingItems) ? incomingItems : []) {
    map.set(item[idField], item);
  }
  return Array.from(map.values()).sort((a, b) => String(a[idField]).localeCompare(String(b[idField])));
}
