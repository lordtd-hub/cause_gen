#!/usr/bin/env node

import path from 'node:path';
import {
  findCourseArtifactPath,
  findOutputDir,
  listMissionFramingFiles,
  getCoursePaths,
  resolveCourseDir,
  fileExists,
  readJson,
  readText,
  loadModules,
} from './lib/course-lib.mjs';

const MINIMUM_PACKAGE_ARTIFACTS = [
  ['tqf3-course-anchor.md', 'TQF3_COURSE_ANCHOR'],
  ['tqf3-clo-map.md', 'TQF3_CLO_MAP'],
  ['tqf3-week-to-module-map.md', 'TQF3_WEEK_TO_MODULE_MAP'],
  ['tqf3-assessment-evidence-map.md', 'TQF3_ASSESSMENT_EVIDENCE_MAP'],
];

const SUPPORT_PACKAGE_ARTIFACTS = [
  ['tqf3-teaching-method-map.md', 'TQF3_TEACHING_METHOD_MAP'],
  ['tqf3-resource-seed-list.md', 'TQF3_RESOURCE_SEED_LIST'],
  ['tqf3-clo-coverage-view.md', 'TQF3_CLO_COVERAGE_VIEW'],
  ['source-inventory-status.md', 'SOURCE_INVENTORY_STATUS'],
];

function parseArgs(argv) {
  const options = {
    courseDir: null,
    outputDir: null,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--course-dir') {
      options.courseDir = argv[index + 1];
      index += 1;
    } else if (arg === '--output-dir') {
      options.outputDir = argv[index + 1];
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/check-workflow-readiness.mjs [--course-dir courses/<course-id>] [--output-dir courses/<course-id>/output] [--json]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function statusLabel(ok) {
  return ok ? 'ready' : 'not-ready';
}

function summarizePhase(name, ok, details = [], nextCommand = null, options = {}) {
  return {
    name,
    status: statusLabel(ok),
    severity: options.severity ?? 'important',
    blocksWorkflow: options.blocksWorkflow ?? false,
    aiFillAllowed: options.aiFillAllowed ?? false,
    aiFillNote: options.aiFillNote ?? null,
    details,
    nextCommand,
  };
}

async function safeReadJson(target) {
  try {
    if (!(await fileExists(target))) return null;
    return await readJson(target);
  } catch {
    return null;
  }
}

async function safeReadText(target) {
  try {
    if (!(await fileExists(target))) return '';
    return await readText(target);
  } catch {
    return '';
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const courseConfigPath = path.join(coursePaths.COURSE_DIR, 'course.config.json');
  const missionsPath = path.join(coursePaths.MISSIONS_DIR, 'missions.json');
  const resourcesPath = path.join(coursePaths.RESOURCES_DIR, 'manifest.json');

  const config = await safeReadJson(courseConfigPath);
  const missions = await safeReadJson(missionsPath);
  const resources = await safeReadJson(resourcesPath);
  const outputDir = await findOutputDir(config?.course_id ?? path.basename(courseDir), courseDir, options.outputDir);
  const modules = (await fileExists(coursePaths.MODULES_DIR)) ? await loadModules(courseDir).catch(() => []) : [];

  const generatedReadme = await fileExists(await findCourseArtifactPath(coursePaths, 'README_FIRST'));
  const generatedCurrentTask = await fileExists(await findCourseArtifactPath(coursePaths, 'CURRENT_TASK'));
  const generatedDecisionLog = await fileExists(await findCourseArtifactPath(coursePaths, 'DECISION_LOG'));

  const minimumPackageStatus = await Promise.all(MINIMUM_PACKAGE_ARTIFACTS.map(async ([file, key]) => ({
    file,
    exists: await fileExists(await findCourseArtifactPath(coursePaths, key)),
  })));
  const supportPackageStatus = await Promise.all(SUPPORT_PACKAGE_ARTIFACTS.map(async ([file, key]) => ({
    file,
    exists: await fileExists(await findCourseArtifactPath(coursePaths, key)),
  })));

  const allMinimumPackagePresent = minimumPackageStatus.every((item) => item.exists);
  const allSupportPackagePresent = supportPackageStatus.every((item) => item.exists);

  const moduleSummaries = modules.map((module) => ({
    id: module.meta.id,
    slug: module.meta.slug,
    sourceRefs: Array.isArray(module.meta.source_refs) ? module.meta.source_refs : [],
  }));

  const sourceBridgeReady = moduleSummaries.length > 0
    && moduleSummaries.every((module) => module.sourceRefs.length > 0);

  const missionFramingFiles = await listMissionFramingFiles(coursePaths);

  const missionCount = Array.isArray(missions?.missions) ? missions.missions.length : 0;
  const resourceCount = Array.isArray(resources?.items) ? resources.items.length : 0;
  const badgeCount = Array.isArray(config?.badges) ? config.badges.length : 0;
  const hasRequiredMissionBadge = Array.isArray(config?.badges)
    && config.badges.some((badge) => Array.isArray(badge.required_missions) && badge.required_missions.length > 0);

  const missionBridgeReady = missionFramingFiles.length > 0 && missionCount > 0;
  const resourceBridgeReady = await fileExists(await findCourseArtifactPath(coursePaths, 'TQF3_RESOURCE_SEED_LIST')) && resourceCount > 0;
  const badgeBridgeReady = await fileExists(await findCourseArtifactPath(coursePaths, 'TQF3_ASSESSMENT_EVIDENCE_MAP')) && badgeCount > 0 && hasRequiredMissionBadge;

  const sourceCoreReady = Boolean(config)
    && modules.length > 0
    && Boolean(missions)
    && Boolean(resources);

  const outputIndex = path.join(outputDir, 'index.html');
  const outputIntro = path.join(outputDir, 'intro.html');
  const outputLessons = path.join(outputDir, 'lessons.html');
  const outputMissions = path.join(outputDir, 'missions.html');
  const outputPresent = await fileExists(outputIndex)
    && await fileExists(outputIntro)
    && await fileExists(outputLessons)
    && await fileExists(outputMissions);

  const currentTaskText = await safeReadText(await findCourseArtifactPath(coursePaths, 'CURRENT_TASK'));
  const currentTaskMentionsProblemPool = currentTaskText.includes('Problem Pool');
  const currentTaskMentionsItemLayer = currentTaskText.includes('item-layer')
    || currentTaskText.includes('Item Layer')
    || currentTaskText.includes('Problem Pool')
    || currentTaskText.includes('problem-pool')
    || currentTaskText.includes('content draft')
    || currentTaskText.includes('content-item');
  const currentTaskMentionsProblemSourcing = currentTaskText.includes('problem sourcing')
    || currentTaskText.includes('Problem Sourcing')
    || currentTaskText.includes('retrieved-problems');
  const problemPoolStarterPath = await findCourseArtifactPath(coursePaths, 'PROBLEM_POOL_STARTER');
  const problemPoolJsonPath = await findCourseArtifactPath(coursePaths, 'PROBLEM_POOL_JSON');
  const assessmentClassificationPath = await findCourseArtifactPath(coursePaths, 'ASSESSMENT_CLASSIFICATION');
  const missionDraftsPath = await findCourseArtifactPath(coursePaths, 'MISSION_DRAFTS');
  const problemSourcePolicyPath = await findCourseArtifactPath(coursePaths, 'PROBLEM_SOURCE_POLICY');
  const retrievalQueriesPath = await findCourseArtifactPath(coursePaths, 'RETRIEVAL_QUERIES');
  const retrievedProblemsPath = await findCourseArtifactPath(coursePaths, 'RETRIEVED_PROBLEMS');
  const screenedProblemsPath = await findCourseArtifactPath(coursePaths, 'SCREENED_PROBLEMS');
  const contentSourcePolicyPath = await findCourseArtifactPath(coursePaths, 'CONTENT_SOURCE_POLICY');
  const contentRetrievalQueriesPath = await findCourseArtifactPath(coursePaths, 'CONTENT_RETRIEVAL_QUERIES');
  const retrievedContentPath = await findCourseArtifactPath(coursePaths, 'RETRIEVED_CONTENT');
  const screenedContentPath = await findCourseArtifactPath(coursePaths, 'SCREENED_CONTENT');
  const contentClassificationPath = await findCourseArtifactPath(coursePaths, 'CONTENT_CLASSIFICATION');
  const contentDraftsPath = await findCourseArtifactPath(coursePaths, 'CONTENT_DRAFTS');
  const assessmentPromotionLogPath = await findCourseArtifactPath(coursePaths, 'ASSESSMENT_PROMOTION_LOG');
  const contentPromotionLogPath = await findCourseArtifactPath(coursePaths, 'CONTENT_PROMOTION_LOG');
  const problemPoolStarterExists = await fileExists(problemPoolStarterPath);
  const problemPoolJsonExists = await fileExists(problemPoolJsonPath);
  const assessmentClassificationExists = await fileExists(assessmentClassificationPath);
  const missionDraftsExists = await fileExists(missionDraftsPath);
  const problemSourcePolicyExists = await fileExists(problemSourcePolicyPath);
  const retrievalQueriesExists = await fileExists(retrievalQueriesPath);
  const retrievedProblemsExists = await fileExists(retrievedProblemsPath);
  const screenedProblemsExists = await fileExists(screenedProblemsPath);
  const contentSourcePolicyExists = await fileExists(contentSourcePolicyPath);
  const contentRetrievalQueriesExists = await fileExists(contentRetrievalQueriesPath);
  const retrievedContentExists = await fileExists(retrievedContentPath);
  const screenedContentExists = await fileExists(screenedContentPath);
  const contentClassificationExists = await fileExists(contentClassificationPath);
  const contentDraftsExists = await fileExists(contentDraftsPath);
  const assessmentPromotionLog = await safeReadJson(assessmentPromotionLogPath);
  const contentPromotionLog = await safeReadJson(contentPromotionLogPath);
  const missionDraftPayload = await safeReadJson(missionDraftsPath);
  const contentDraftPayload = await safeReadJson(contentDraftsPath);
  const assessmentItemLayerReady = problemPoolJsonExists && assessmentClassificationExists && missionDraftsExists;
  const problemSourcingReady = problemSourcePolicyExists && retrievalQueriesExists && retrievedProblemsExists && screenedProblemsExists;
  const contentSourcingReady = contentSourcePolicyExists && contentRetrievalQueriesExists && retrievedContentExists && screenedContentExists;
  const contentLayerReady = contentClassificationExists && contentDraftsExists;
  const sharedItemLayerReady = assessmentItemLayerReady || contentLayerReady;
  const assessmentApprovedDraftCount = Array.isArray(missionDraftPayload?.drafts)
    ? missionDraftPayload.drafts.filter((draft) => draft.approval_status === 'approved').length
    : 0;
  const contentApprovedDraftCount = Array.isArray(contentDraftPayload?.drafts)
    ? contentDraftPayload.drafts.filter((draft) => draft.approval_status === 'approved').length
    : 0;
  const promotedAssessmentCount = Number(assessmentPromotionLog?.promoted_count || 0);
  const promotedContentCount = Number(contentPromotionLog?.promoted_count || 0);

  const phases = [
    summarizePhase(
      'scaffold',
      generatedReadme && generatedCurrentTask && generatedDecisionLog && sourceCoreReady,
      [
        generatedReadme ? 'generated/workflow/README_FIRST.md exists' : 'generated/workflow/README_FIRST.md missing',
        generatedCurrentTask ? 'generated/workflow/CURRENT_TASK.md exists' : 'generated/workflow/CURRENT_TASK.md missing',
        generatedDecisionLog ? 'generated/workflow/DECISION_LOG.md exists' : 'generated/workflow/DECISION_LOG.md missing',
        sourceCoreReady ? 'core course source files exist' : 'core course source files are incomplete',
      ],
      sourceCoreReady ? null : `node tools/init-new-course.mjs --course-dir ${path.relative(process.cwd(), courseDir)} --spec <spec-path>`,
      {
        severity: 'critical',
        blocksWorkflow: true,
        aiFillAllowed: false,
      },
    ),
    summarizePhase(
      'tqf3-package',
      allMinimumPackagePresent,
      [
        ...minimumPackageStatus.map((item) => `${item.file}: ${item.exists ? 'present' : 'missing'}`),
        ...supportPackageStatus.map((item) => `${item.file}: ${item.exists ? 'present' : 'optional-missing'}`),
      ],
      allMinimumPackagePresent ? null : 'prepare the missing TQF3 markdown package files in materials/processed/',
      {
        severity: 'critical',
        blocksWorkflow: true,
        aiFillAllowed: true,
        aiFillNote: 'AI can draft missing package files from TQF3, but they still need review because they define the shared framing layer.',
      },
    ),
    summarizePhase(
      'source-bridge',
      sourceBridgeReady,
      [
        `${modules.length} module file(s) found`,
        sourceBridgeReady ? 'every module has source_refs' : 'some modules still lack source_refs',
      ],
      sourceBridgeReady ? null : `node tools/apply-source-refs.mjs --course-dir ${path.relative(process.cwd(), courseDir)}`,
      {
        severity: 'important',
        blocksWorkflow: false,
        aiFillAllowed: true,
        aiFillNote: 'If source_refs are missing, AI can usually draft them from the week-to-module map and course-design source.',
      },
    ),
    summarizePhase(
      'mission-bridge',
      missionBridgeReady,
      [
        `${missionFramingFiles.length} mission framing file(s)`,
        `${missionCount} runtime mission(s)`,
      ],
      missionBridgeReady ? null : `node tools/apply-mission-framings.mjs --course-dir ${path.relative(process.cwd(), courseDir)}`,
      {
        severity: 'important',
        blocksWorkflow: false,
        aiFillAllowed: true,
        aiFillNote: 'If mission framing is still missing, AI can draft framing candidates from the evidence map before compiling them.',
      },
    ),
    summarizePhase(
      'resource-bridge',
      resourceBridgeReady,
      [
        await fileExists(await findCourseArtifactPath(coursePaths, 'TQF3_RESOURCE_SEED_LIST'))
          ? 'resource seed list present'
          : 'resource seed list missing',
        `${resourceCount} resource manifest item(s)`,
      ],
      resourceBridgeReady ? null : `node tools/apply-resource-seeds.mjs --course-dir ${path.relative(process.cwd(), courseDir)}`,
      {
        severity: 'important',
        blocksWorkflow: false,
        aiFillAllowed: true,
        aiFillNote: 'If the resource seed list is weak, AI can help group and draft starter resource seeds from TQF3 references.',
      },
    ),
    summarizePhase(
      'badge-bridge',
      badgeBridgeReady,
      [
        `${badgeCount} badge rule(s)`,
        hasRequiredMissionBadge ? 'mission-based badge hooks detected' : 'mission-based badge hooks not yet detected',
      ],
      badgeBridgeReady ? null : `node tools/apply-badge-hooks.mjs --course-dir ${path.relative(process.cwd(), courseDir)}`,
      {
        severity: 'important',
        blocksWorkflow: false,
        aiFillAllowed: true,
        aiFillNote: 'If badge hooks are missing, AI can usually draft the badge direction from the assessment evidence map.',
      },
    ),
    summarizePhase(
      'problem-sourcing',
      problemSourcingReady,
      [
        problemSourcePolicyExists ? 'problem-source-policy.json exists' : 'problem-source-policy.json missing',
        retrievalQueriesExists ? 'retrieval-queries.json exists' : 'retrieval-queries.json missing',
        retrievedProblemsExists ? 'retrieved-problems.json exists' : 'retrieved-problems.json missing',
        screenedProblemsExists ? 'screened-problems.json exists' : 'screened-problems.json missing',
        currentTaskMentionsProblemSourcing ? 'working docs mention problem sourcing' : 'working docs do not yet foreground problem sourcing',
      ],
      problemSourcingReady
        ? null
        : `node tools/init-problem-sourcing.mjs --course-dir ${path.relative(process.cwd(), courseDir)}`,
      {
        severity: 'optional',
        blocksWorkflow: false,
        aiFillAllowed: true,
        aiFillNote: 'AI can help propose source policy, retrieval queries, and screened problem candidates, but human source review is still required.',
      },
    ),
    summarizePhase(
      'content-authoring',
      contentSourcingReady && contentLayerReady,
      [
        contentSourcePolicyExists ? 'content-source-policy.json exists' : 'content-source-policy.json missing',
        contentRetrievalQueriesExists ? 'content-retrieval-queries.json exists' : 'content-retrieval-queries.json missing',
        retrievedContentExists ? 'retrieved-content.json exists' : 'retrieved-content.json missing',
        screenedContentExists ? 'screened-content.json exists' : 'screened-content.json missing',
        contentClassificationExists ? 'content-classification.json exists' : 'content-classification.json missing',
        contentDraftsExists ? 'content-drafts.json exists' : 'content-drafts.json missing',
        `${contentApprovedDraftCount} approved content draft(s)`,
        `${promotedContentCount} promoted content draft(s)`,
      ],
      (contentSourcingReady && contentLayerReady)
        ? null
        : `node tools/init-content-authoring.mjs --course-dir ${path.relative(process.cwd(), courseDir)}`,
      {
        severity: 'important',
        blocksWorkflow: false,
        aiFillAllowed: true,
        aiFillNote: 'AI can help propose screened content, classify it by module/CLO/Bloom, and build reviewed content drafts, but human approval is still required before promotion.',
      },
    ),
    summarizePhase(
      'build-output',
      outputPresent,
      [
        outputPresent ? 'core top-level output pages exist' : 'one or more top-level output pages are missing',
      ],
      outputPresent ? 'node tools/validate-course.mjs --course-dir courses/<course-id> --check-output' : `node tools/build-course.mjs --course-dir ${path.relative(process.cwd(), courseDir)}`,
      {
        severity: 'critical',
        blocksWorkflow: true,
        aiFillAllowed: false,
      },
    ),
    summarizePhase(
      'item-layer',
      sharedItemLayerReady,
      [
        problemPoolStarterExists ? 'problem-pool-starter.md exists' : 'problem-pool-starter.md not started',
        problemPoolJsonExists ? 'problem-pool.json exists' : 'problem-pool.json missing',
        assessmentClassificationExists ? 'assessment-classification.json exists' : 'assessment-classification.json missing',
        missionDraftsExists ? 'mission-drafts.json exists' : 'mission-drafts.json missing',
        contentClassificationExists ? 'content-classification.json exists' : 'content-classification.json missing',
        contentDraftsExists ? 'content-drafts.json exists' : 'content-drafts.json missing',
        currentTaskMentionsItemLayer ? 'working docs mention item-layer work' : 'working docs do not yet foreground item-layer work',
      ],
      sharedItemLayerReady
        ? null
        : (problemPoolStarterExists
          ? `node tools/init-assessment-engine.mjs --course-dir ${path.relative(process.cwd(), courseDir)}`
          : `review ${path.join('docs', 'new-course-template', 'SHARED_ITEM_LAYER_WORKFLOW.md')} and open either the assessment-item or content-item branch for this course`),
      {
        severity: 'optional',
        blocksWorkflow: false,
        aiFillAllowed: true,
        aiFillNote: 'AI can initialize assessment-item and content-item rails, propose classifications, and build review-first drafts, but human approval is still required before promotion into runtime source.',
      },
    ),
  ];

  const firstCriticalBlocker = phases.find((phase) => phase.status !== 'ready' && phase.blocksWorkflow);
  const firstImportantGap = phases.find((phase) => phase.status !== 'ready' && !phase.blocksWorkflow);
  const engineStatus = {
    framing_ready: allMinimumPackagePresent
      ? 'ready'
      : 'blocked',
    core_ready: sourceCoreReady && outputPresent
      ? 'ready'
      : 'blocked',
    assessment_ready: promotedAssessmentCount > 0
      ? 'ready'
      : (assessmentItemLayerReady
        ? (assessmentApprovedDraftCount > 0 ? 'review-required' : 'can-continue-with-ai-help')
        : 'can-continue-with-ai-help'),
    content_ready: promotedContentCount > 0
      ? 'ready'
      : ((contentSourcingReady && contentLayerReady)
        ? (contentApprovedDraftCount > 0 ? 'review-required' : 'can-continue-with-ai-help')
        : 'can-continue-with-ai-help'),
  };
  const publishableBaselineReady = engineStatus.framing_ready === 'ready'
    && engineStatus.core_ready === 'ready'
    && (promotedAssessmentCount > 0 || promotedContentCount > 0);
  const report = {
    courseDir,
    outputDir,
    summary: {
      modules: modules.length,
      missions: missionCount,
      resources: resourceCount,
      badges: badgeCount,
      missionFramingFiles: missionFramingFiles.length,
      approvedAssessmentDrafts: assessmentApprovedDraftCount,
      approvedContentDrafts: contentApprovedDraftCount,
      promotedAssessmentDrafts: promotedAssessmentCount,
      promotedContentDrafts: promotedContentCount,
    },
    engines: engineStatus,
    phases,
    nextStep: firstCriticalBlocker?.nextCommand
      ?? firstImportantGap?.nextCommand
      ?? 'workflow baseline looks ready; continue with the next accepted authoring layer',
    readinessDecision: firstCriticalBlocker
      ? {
          level: 'blocked',
          reason: `${firstCriticalBlocker.name} is still missing and should be treated as a critical blocker.`,
        }
      : firstImportantGap
        ? {
            level: 'can-continue-with-ai-help',
            reason: `${firstImportantGap.name} is still missing, but it is not a critical blocker for the whole workflow.`,
          }
        : {
            level: 'ready',
            reason: 'No critical or important gaps are currently blocking the workflow baseline.',
          },
    publishability: publishableBaselineReady
      ? {
          level: 'ready-for-publishable-baseline',
          reason: 'Engine 1 and Engine 2 are ready, and at least one reviewed upstream asset has been promoted through the Core Course Engine.',
        }
      : {
          level: 'not-yet-publishable',
          reason: 'A publishable baseline still needs Engine 1 and Engine 2 complete plus at least one promoted assessment or content asset.',
        },
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`Workflow readiness for ${path.relative(process.cwd(), courseDir)}`);
  console.log('');
  phases.forEach((phase) => {
    console.log(`- ${phase.name}: ${phase.status} [${phase.severity}]`);
    phase.details.forEach((detail) => console.log(`  - ${detail}`));
    if (phase.status !== 'ready') {
      console.log(`  - blocks workflow: ${phase.blocksWorkflow ? 'yes' : 'no'}`);
      console.log(`  - AI can help fill: ${phase.aiFillAllowed ? 'yes' : 'no'}`);
      if (phase.aiFillNote) {
        console.log(`  - AI note: ${phase.aiFillNote}`);
      }
    }
    if (phase.nextCommand && phase.status !== 'ready') {
      console.log(`  - next: ${phase.nextCommand}`);
    }
  });
  console.log('');
  console.log('Engines:');
  console.log(`- framing-ready: ${report.engines.framing_ready}`);
  console.log(`- core-ready: ${report.engines.core_ready}`);
  console.log(`- assessment-ready: ${report.engines.assessment_ready}`);
  console.log(`- content-ready: ${report.engines.content_ready}`);
  console.log('');
  console.log(`Decision: ${report.readinessDecision.level}`);
  console.log(`Why: ${report.readinessDecision.reason}`);
  console.log('');
  console.log(`Publishability: ${report.publishability.level}`);
  console.log(`Why: ${report.publishability.reason}`);
  console.log('');
  console.log(`Next step: ${report.nextStep}`);
}

await main();
