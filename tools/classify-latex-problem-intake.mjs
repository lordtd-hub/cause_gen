#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ensureDir,
  getCoursePaths,
  resolveCourseDir,
  slugify,
  writeJson,
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
    } else if (arg === '--input') {
      options.inputs.push(argv[index + 1]);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: node tools/classify-latex-problem-intake.mjs --course-dir courses/<course-id> [--input <intake-file>]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const frontmatter = {};
  if (!match) {
    return { frontmatter, body: markdown };
  }

  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    frontmatter[pair[1]] = pair[2].trim();
  }

  return {
    frontmatter,
    body: markdown.slice(match[0].length),
  };
}

function parsePartModuleMap(body) {
  const sectionMatch = body.match(/## Part To Module Map([\s\S]*?)(?:\n## |\n# |$)/);
  if (!sectionMatch) return [];

  const lines = sectionMatch[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.startsWith('|'));

  const rows = [];
  for (const line of lines.slice(2)) {
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((value) => value.trim());
    if (cells.length < 6) continue;
    rows.push({
      part: cells[0],
      sectionLabel: cells[1],
      moduleId: cells[2],
      cloId: cells[3],
      bloomLevel: cells[4],
      notes: cells[5],
    });
  }
  return rows;
}

function extractTexBlock(body) {
  const match = body.match(/```tex\r?\n([\s\S]*?)```/);
  if (!match) {
    throw new Error('latex intake must contain a ```tex fenced block');
  }
  return match[1];
}

function normalizeStatement(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .trim();
}

function parseProblemEnvironmentItems(tex) {
  const items = [];
  let currentPart = 'General';
  const pattern = /\\section\*\{([^}]*)\}|\\begin\{problem\}([\s\S]*?)\\end\{problem\}/g;
  for (const match of tex.matchAll(pattern)) {
    if (match[1]) {
      currentPart = match[1].trim();
      continue;
    }
    const raw = normalizeStatement(match[2]);
    const labelMatch = raw.match(/^(\d+)\.\s*([\s\S]*)$/);
    const label = labelMatch ? labelMatch[1] : `${items.length + 1}`;
    const statement = labelMatch ? labelMatch[2].trim() : raw;
    items.push({
      rawLabel: label,
      partLabel: currentPart,
      statement,
    });
  }
  return items;
}

function parseEnumeratedItems(tex) {
  const items = [];
  const lines = tex.replace(/\r/g, '').split('\n');
  let currentPart = 'General';
  let enumerateDepth = 0;
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    const statement = normalizeStatement(current.lines.join('\n'));
    if (statement) {
      items.push({
        rawLabel: String(items.length + 1),
        partLabel: currentPart,
        statement,
      });
    }
    current = null;
  };

  for (const line of lines) {
    const sectionMatch = line.match(/\\section\*\{([^}]*)\}/);
    if (sectionMatch) {
      if (enumerateDepth === 0) {
        pushCurrent();
      }
      currentPart = sectionMatch[1].trim();
      continue;
    }

    if (/\\begin\{enumerate\}/.test(line)) {
      enumerateDepth += 1;
      if (current) current.lines.push(line);
      continue;
    }

    const topLevelItem = line.match(/^\s*\\item\b\s*(.*)$/);
    if (topLevelItem && enumerateDepth === 1) {
      pushCurrent();
      current = { lines: [topLevelItem[1]] };
      continue;
    }

    if (/\\end\{enumerate\}/.test(line)) {
      if (enumerateDepth === 1) {
        pushCurrent();
      } else if (current) {
        current.lines.push(line);
      }
      enumerateDepth = Math.max(0, enumerateDepth - 1);
      continue;
    }

    if (current) {
      current.lines.push(line);
    }
  }

  pushCurrent();
  return items;
}

function parseLatexProblems(tex) {
  if (tex.includes('\\begin{problem}')) {
    return parseProblemEnvironmentItems(tex);
  }
  if (tex.includes('\\begin{enumerate}')) {
    return parseEnumeratedItems(tex);
  }
  return [];
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function inferTopic(statement) {
  const lower = statement.toLowerCase();
  if (/(area under the curve|area between the curves|area between the curve|displacement of the particle|total amount of water added)/.test(lower)) {
    return 'integral-applications';
  }
  if (/(velocity|acceleration|projectile|particle|car |ball |train |position at time|at rest|moving)/.test(lower)) return 'motion-analysis';
  if (/(how fast|rate of|rising|sliding|radius increasing|area increasing|circumference changing|volume changing)/.test(lower)) return 'related-rates';
  if (/(marginal|revenue|cost of producing|profit function|demand function|break-even)/.test(lower)) return 'business-calculus';
  if (/(population|radioactive|temperature|coffee|bacteria|decays|concentration)/.test(lower)) return 'exponential-models';
  if (lower.includes('tangent line')) return 'tangent-line-analysis';
  if (/(total amount|flows into a tank|position function|learning)/.test(lower)) return 'accumulation-from-rate';
  if (/(increasing and when it is decreasing|when .* increasing|when .* decreasing|intervals where)/.test(lower)) {
    return 'function-behavior-analysis';
  }
  if (lower.includes('\\lim') || lower.includes('limit')) {
    if (/(sin|cos|tan)/.test(lower)) return 'trigonometric-limits';
    if (/(e\^|\\ln|ln\(|log)/.test(lower)) return 'exponential-logarithmic-limits';
    if (/(sqrt|\\sqrt)/.test(lower)) return 'rationalization-limits';
    if (/(infty|infinity)/.test(lower)) return 'infinite-limits';
    return 'algebraic-limits';
  }
  if (lower.includes('continuous') || lower.includes('continuity')) return 'continuity-analysis';
  if (lower.includes('\\int') || lower.includes('integral')) {
    if (lower.includes('work done') || lower.includes('force')) return 'work-integrals';
    return 'integration-techniques';
  }
  if (lower.includes('\\frac{d}{dx}')) return 'derivative-rules';
  if (/(maximum|minimum|maximize|minimize|greatest|least)/.test(lower)) return 'optimization';
  if (/(average velocity|instantaneous velocity)/.test(lower)) return 'average-vs-instantaneous-rate';
  return 'general-calculus';
}

function inferModuleId(statement, partLabel, partMap) {
  const lowerPart = String(partLabel || '').toLowerCase();
  const topic = inferTopic(statement);

  const partMatch = partMap.find((row) => {
    const part = String(row.part || '').toLowerCase();
    const label = String(row.sectionLabel || '').toLowerCase();
    if (label && lowerPart.includes(label)) return true;
    if (!part) return false;
    return new RegExp(`^${escapeRegExp(part)}(?:\\b|\\s*:|\\s*\\()`).test(lowerPart);
  });
  if (partMatch?.moduleId) {
    return partMatch.moduleId;
  }

  if (topic.includes('limit')) return 'limits-and-functions';
  if (topic.includes('continuity')) return 'continuity-and-applications';
  if ([
    'derivative-rules',
    'optimization',
    'related-rates',
    'motion-analysis',
    'business-calculus',
    'tangent-line-analysis',
    'average-vs-instantaneous-rate',
    'exponential-models',
    'function-behavior-analysis',
  ].includes(topic)) {
    return 'differentiation';
  }
  if (['integration-techniques', 'integral-applications', 'work-integrals', 'accumulation-from-rate'].includes(topic)) {
    return 'integration';
  }
  return 'mixed';
}

function inferLikelyTechniques(statement) {
  const lower = statement.toLowerCase();
  const techniques = [];

  if (lower.includes('\\lim') || lower.includes('limit')) {
    techniques.push('limit laws');
    if (/(sin|cos|tan)/.test(lower)) techniques.push('standard trigonometric limits');
    if (/(e\^|\\ln|ln\(|log)/.test(lower)) techniques.push('standard exponential-logarithmic limits');
    if (/(x\\^2 - 4|x\\^3 - 1|x\\^2 - 1|factor)/.test(lower)) techniques.push('factorization');
    if (/(sqrt|\\sqrt)/.test(lower)) techniques.push('rationalization');
    if (/(infty|infinity)/.test(lower)) techniques.push('dominant-term comparison');
  }

  if (lower.includes('\\frac{d}{dx}')) {
    techniques.push('differentiate the given expression');
    if (/(sin\\(x\\^2\\)|e\\^\\{x\\^2\\}|sin\\(3x\\)|cos\\(2x\\)|e\\^\\{sin x\\})/.test(lower)) techniques.push('chain rule');
    if (/(x\\^2 \\\\sin x|x\\^3 e\\^x|x e\\^x|sin x \\\\cos x|x \\\\tan x|x\\^5 e\\^x|x\\^2 e\\^\\{2x\\})/.test(lower)) techniques.push('product rule');
    if (lower.includes('\\frac{\\sin x}{x}') || lower.includes('\\frac{x^2+1}{x}') || lower.includes('\\frac{1}{x}')) techniques.push('quotient rule');
    if (/x\^x/.test(lower)) techniques.push('logarithmic differentiation');
  }

  if (lower.includes('\\int')) {
    techniques.push('antiderivative rules');
    if (/(x e\\^x|x \\\\sin x|\\\\ln x|x\\^2 e\\^x|x \\\\ln x|e\\^x \\\\cos x|x\\^2 \\\\cos x)/.test(lower)) techniques.push('integration by parts');
    if (/(1\\+x\\^2|1-x\\^2)/.test(lower)) techniques.push('inverse trigonometric antiderivatives');
    if (/(sin\\^2 x|cos\\^2 x)/.test(lower)) techniques.push('trigonometric identities');
    if (lower.includes('e^{2x}') || lower.includes('cos(3x)') || lower.includes('sin(2x)') || lower.includes('e^{-x}') || lower.includes('\\frac{1}{x \\ln x}')) techniques.push('u-substitution');
    if (!techniques.includes('power rule') && /(x\^|sqrt|1\/x\^2|1\/sqrt)/.test(lower)) techniques.push('power rule');
  }

  if (/(area under the curve|area between the curves|area between the curve)/.test(lower)) {
    techniques.push('set up a definite integral');
    techniques.push('use intersection points or interval bounds correctly');
  }

  if (/displacement of the particle/.test(lower)) {
    techniques.push('integrate velocity to get displacement');
  }

  if (/(velocity|acceleration|at rest|moving forward|moving backward|position function|projectile|particle|car |train |ball )/.test(lower)) {
    techniques.push('differentiate position to get velocity or acceleration');
    if (/(forward|backward|at rest|changes direction|speeding up|slowing down)/.test(lower)) techniques.push('sign analysis');
  }

  if (/(maximum|minimum|maximize|minimize|greatest|least)/.test(lower)) {
    techniques.push('build an objective function');
    techniques.push('differentiate and solve critical points');
    techniques.push('select the feasible optimum');
  }

  if (/(how fast|rate of|rising|sliding|increasing|decreasing)/.test(lower)) {
    techniques.push('differentiate with respect to time');
    techniques.push('relate variables before substitution');
  }

  if (/(marginal|revenue|cost of producing|profit function|demand function|break-even)/.test(lower)) {
    techniques.push('differentiate or integrate economic model');
    if (/(maximize|maximized)/.test(lower)) techniques.push('optimize the business objective');
    if (/break-even/.test(lower)) techniques.push('solve revenue equals cost');
  }

  if (/(population|radioactive|temperature|coffee|bacteria|decays|concentration)/.test(lower)) {
    techniques.push('differentiate an exponential model');
    if (/(after \d+|after \$?\d+|after)/.test(lower)) techniques.push('evaluate the model at a specific time');
  }

  if (/(work done|force acting)/.test(lower)) {
    techniques.push('set up a definite integral');
  }

  if (/(total amount|flows into a tank|learning|total amount of water added)/.test(lower)) {
    techniques.push('integrate a rate function');
    if (/initial/.test(lower) || /L\(0\)|s\(0\)/.test(statement)) techniques.push('use the initial condition');
  }

  if (lower.includes('tangent line')) {
    techniques.push('differentiate to get the slope');
    techniques.push('use point-slope form');
  }

  return Array.from(new Set(techniques.length > 0 ? techniques : ['manual review needed']));
}

function inferBloom(statement, topic) {
  const lower = statement.toLowerCase();
  if (/(interpret|determine when|increasing and when it is decreasing|changes direction|speeding up|slowing down|maximize|maximizes|minimize|minimizes|greatest|break-even)/.test(lower)) {
    return 'analyze';
  }
  if (/(explain|interpret its slope|determine the dimensions that maximize|should be sold to maximize|should be sold|production level that maximizes)/.test(lower)) {
    return 'evaluate';
  }
  if (['optimization', 'related-rates', 'motion-analysis', 'business-calculus', 'tangent-line-analysis', 'exponential-models', 'accumulation-from-rate'].includes(topic)) {
    return /interpret/.test(lower) ? 'evaluate' : 'analyze';
  }
  return 'apply';
}

function inferCloId(statement, topic, bloom) {
  const lower = statement.toLowerCase();
  if (/(interpret|explain|production level|maximizes revenue|maximize profit|tangent line.*interpret)/.test(lower) || bloom === 'evaluate') {
    return 'CLO4';
  }
  if (bloom === 'analyze' || ['optimization', 'related-rates', 'motion-analysis', 'business-calculus', 'exponential-models', 'accumulation-from-rate'].includes(topic)) {
    return 'CLO3';
  }
  if (topic.includes('continuity') && /definition|continuous|discontinuous/.test(lower) && !/(determine where|analyze)/.test(lower)) {
    return 'CLO1';
  }
  return 'CLO2';
}

function inferAnswerType(statement, multiStep, topic) {
  const lower = statement.toLowerCase();
  if (multiStep) return 'multi-part-mixed';
  if (/(find all times|break-even points)/.test(lower)) return 'set-of-values';
  if (/(when .* increasing|when .* decreasing|intervals where)/.test(lower)) return 'interval-description';
  if (/(position function|cost function|revenue function|find l\(t\)|find c\(x\)|find r\(x\))/i.test(statement)) return 'function-form';
  if (/equation of the tangent line/.test(lower)) return 'equation';
  if (/(dimensions|radius and height|value of x|price|maximizes|maximizes revenue|maximizes profit)/.test(lower)) return 'optimal-value';
  if (/(how fast|rate of cooling|growth rate|velocity at|acceleration at|instantaneous velocity)/.test(lower)) return 'rate-value';
  if (topic.includes('limit') || topic === 'derivative-rules' || topic === 'integration-techniques') return 'expression';
  return 'numeric-or-expression';
}

function inferProblemType(statement, topic) {
  const lower = statement.toLowerCase();
  if (topic.includes('limit')) return 'computation';
  if (topic === 'derivative-rules') return 'symbolic-derivative';
  if (topic === 'integration-techniques') return 'symbolic-integral';
  if (topic === 'integral-applications') return 'applied-integral';
  if (topic === 'optimization') return 'optimization';
  if (topic === 'related-rates') return 'related-rates';
  if (topic === 'motion-analysis') return 'motion-analysis';
  if (topic === 'business-calculus') return 'applied-modeling';
  if (topic === 'exponential-models') return 'model-analysis';
  if (topic === 'tangent-line-analysis') return 'interpretation';
  if (topic === 'accumulation-from-rate') return 'accumulation';
  if (/(continuous|discontinuous)/.test(lower)) return 'classification';
  return 'reasoning';
}

function inferMisconceptions(statement, topic) {
  const lower = statement.toLowerCase();
  const tags = [];

  if (topic.includes('limit')) {
    tags.push('algebraic-simplification-errors');
    if (/(sin|cos|tan)/.test(lower)) tags.push('standard-trig-limit-misuse');
    if (/(sqrt|\\sqrt)/.test(lower)) tags.push('missing-rationalization');
    if (/(infty|infinity)/.test(lower)) tags.push('leading-term-comparison-error');
  }
  if (topic === 'derivative-rules') {
    tags.push('derivative-rule-selection-error');
    if (/(sin\\(x\\^2\\)|e\\^\\{x\\^2\\}|sin\\(3x\\)|cos\\(2x\\)|e\\^\\{sin x\\})/.test(lower)) tags.push('missing-chain-rule');
    if (/(x\\^2 \\\\sin x|x\\^3 e\\^x|x e\\^x|sin x \\\\cos x|x \\\\tan x)/.test(lower)) tags.push('missing-product-rule');
  }
  if (topic === 'integration-techniques') {
    tags.push('antiderivative-form-error');
    if (/(x e\\^x|x \\\\sin x|\\\\ln x|x\\^2 e\\^x|x \\\\ln x)/.test(lower)) tags.push('integration-by-parts-needed');
    tags.push('missing-constant-of-integration');
  }
  if (topic === 'integral-applications') {
    tags.push('accumulation-vs-antiderivative-confusion');
    tags.push('incorrect-interval-or-boundary-selection');
  }
  if (topic === 'optimization') {
    tags.push('objective-function-error');
    tags.push('critical-point-without-feasibility-check');
  }
  if (topic === 'related-rates') {
    tags.push('variable-relation-setup-error');
    tags.push('units-and-sign-error');
  }
  if (topic === 'motion-analysis') {
    tags.push('velocity-vs-speed-confusion');
    tags.push('sign-analysis-error');
  }
  if (topic === 'business-calculus') {
    tags.push('profit-vs-revenue-confusion');
    tags.push('marginal-vs-total-confusion');
  }
  if (topic === 'exponential-models') {
    tags.push('exponential-rate-interpretation-error');
  }
  if (topic === 'function-behavior-analysis') {
    tags.push('sign-chart-interpretation-error');
    tags.push('critical-point-without-interval-testing');
  }
  if (topic === 'accumulation-from-rate') {
    tags.push('missing-initial-condition');
  }
  return Array.from(new Set(tags));
}

function inferSuitability(problemType, bloomLevel, multiStep, topic, answerType) {
  const targets = [];
  const directComputation = ['computation', 'symbolic-derivative', 'symbolic-integral', 'classification'].includes(problemType);
  if (bloomLevel === 'apply' && !multiStep && directComputation) {
    targets.push('quick-check');
  }
  if (bloomLevel === 'apply' && (multiStep || !directComputation)) {
    targets.push('module-checkpoint');
  }
  if (!multiStep && ['set-of-values', 'interval-description', 'rate-value', 'optimal-value', 'numeric-or-expression'].includes(answerType)) {
    targets.push('module-checkpoint');
  }
  if (['optimization', 'related-rates', 'motion-analysis', 'applied-modeling', 'model-analysis', 'accumulation', 'interpretation'].includes(problemType) || multiStep) {
    targets.push('active-learning-task');
  }
  if (['analyze', 'evaluate'].includes(bloomLevel) || multiStep || ['optimization', 'related-rates', 'motion-analysis', 'applied-modeling', 'model-analysis'].includes(problemType)) {
    targets.push('sbra-exercise-bank');
  }
  return Array.from(new Set(targets.length > 0 ? targets : ['module-checkpoint']));
}

function inferSbraPatternTags(problemType, topic, answerType, multiStep) {
  const tags = [];

  if (multiStep) tags.push('multi-step-sequence');
  if (problemType === 'related-rates') {
    tags.push('variable-relation-setup', 'differentiate-with-respect-to-time', 'substitute-after-differentiation', 'units-interpretation');
  } else if (problemType === 'optimization') {
    tags.push('objective-function-setup', 'constraint-substitution', 'critical-point-analysis', 'feasibility-check');
  } else if (problemType === 'motion-analysis') {
    tags.push('target-quantity-identification', 'differentiate-model', 'evaluate-condition', 'context-interpretation');
  } else if (problemType === 'applied-modeling') {
    tags.push('model-construction', 'calculus-on-model', 'decision-variable-selection', 'context-interpretation');
  } else if (problemType === 'model-analysis') {
    tags.push('differentiate-model', 'evaluate-specified-condition', 'interpret-parameter-or-rate');
  } else if (problemType === 'applied-integral' || problemType === 'accumulation') {
    tags.push('accumulated-quantity-identification', 'integral-setup', 'bound-selection', 'result-interpretation');
  } else if (problemType === 'classification' || topic === 'continuity-analysis') {
    tags.push('definition-check', 'left-right-comparison', 'classification-justification');
  } else if (topic === 'function-behavior-analysis') {
    tags.push('critical-point-finding', 'sign-analysis', 'interval-conclusion');
  } else if (problemType === 'interpretation') {
    tags.push('slope-identification', 'equation-construction', 'context-interpretation');
  } else if (['set-of-values', 'interval-description', 'optimal-value', 'rate-value'].includes(answerType)) {
    tags.push('method-selection', 'result-justification');
  } else {
    tags.push('method-selection', 'result-justification');
  }

  return Array.from(new Set(tags));
}

function inferSbraCandidateStrength(problemType, bloomLevel, multiStep, topic, answerType) {
  const strongTypes = new Set([
    'optimization',
    'related-rates',
    'motion-analysis',
    'applied-modeling',
    'model-analysis',
    'applied-integral',
    'accumulation',
    'interpretation',
  ]);
  const directComputationTypes = new Set([
    'computation',
    'symbolic-derivative',
    'symbolic-integral',
  ]);

  if (strongTypes.has(problemType)) return 'strong';
  if (['analyze', 'evaluate', 'create'].includes(bloomLevel) && multiStep) return 'strong';
  if (topic === 'function-behavior-analysis') return 'strong';
  if (problemType === 'classification' || topic === 'continuity-analysis' || multiStep) return 'medium';
  if (['set-of-values', 'interval-description', 'optimal-value', 'rate-value', 'multi-part-mixed'].includes(answerType)) return 'medium';
  if (directComputationTypes.has(problemType) && bloomLevel === 'apply' && !multiStep) {
    return 'not_recommended';
  }
  if (directComputationTypes.has(problemType)) return 'weak';
  return 'medium';
}

function inferSbraEvidenceRole(candidateStrength) {
  if (candidateStrength === 'strong') return 'primary-clo-evidence';
  if (candidateStrength === 'medium') return 'support-clo-evidence';
  if (candidateStrength === 'weak') return 'practice-or-check';
  return 'not-recommended';
}

function inferSbraRecommendedStepCount(candidateStrength, multiStep) {
  if (candidateStrength === 'strong') return multiStep ? 4 : 3;
  if (candidateStrength === 'medium') return multiStep ? 3 : 2;
  if (candidateStrength === 'not_recommended') return 1;
  return 2;
}

function inferSbraDistractorFocus(problemType, misconceptionTags) {
  const focus = Array.isArray(misconceptionTags) ? [...misconceptionTags] : [];
  if (problemType === 'related-rates') {
    focus.push('premature-substitution', 'unrelated-differentiation', 'missing-units');
  } else if (problemType === 'optimization') {
    focus.push('differentiate-before-modeling', 'unchecked-critical-point');
  } else if (problemType === 'motion-analysis') {
    focus.push('wrong-target-quantity', 'uninterpreted-sign');
  } else if (problemType === 'classification') {
    focus.push('claim-without-definition-check');
  } else if (problemType === 'applied-integral' || problemType === 'accumulation') {
    focus.push('wrong-accumulation-quantity', 'wrong-bounds');
  }
  return Array.from(new Set(focus));
}

function inferSbraProfile(problemType, bloomLevel, multiStep, topic, answerType, misconceptionTags) {
  const candidateStrength = inferSbraCandidateStrength(problemType, bloomLevel, multiStep, topic, answerType);
  return {
    candidate_strength: candidateStrength,
    evidence_role: inferSbraEvidenceRole(candidateStrength),
    recommended_step_count: inferSbraRecommendedStepCount(candidateStrength, multiStep),
    pattern_tags: inferSbraPatternTags(problemType, topic, answerType, multiStep),
    distractor_focus: inferSbraDistractorFocus(problemType, misconceptionTags),
  };
}

function inferTargetSkill(topic, problemType) {
  const map = {
    'algebraic-limits': 'Compute algebraic limits accurately.',
    'trigonometric-limits': 'Use standard trigonometric limit patterns correctly.',
    'exponential-logarithmic-limits': 'Handle exponential and logarithmic limits with the correct standard forms.',
    'rationalization-limits': 'Use algebraic rewriting such as rationalization to evaluate limits.',
    'infinite-limits': 'Compare dominant growth rates in limits at infinity.',
    'continuity-analysis': 'Analyze continuity conditions and failures.',
    'derivative-rules': 'Select and apply the correct derivative rule.',
    'integration-techniques': 'Select and apply the correct antiderivative technique.',
    'integral-applications': 'Use definite integrals to represent area, displacement, or total accumulated change.',
    optimization: 'Model an objective and optimize it under constraints.',
    'related-rates': 'Relate changing quantities and solve for the requested rate.',
    'motion-analysis': 'Connect position, velocity, and acceleration to motion behavior.',
    'business-calculus': 'Interpret and optimize business functions using calculus.',
    'exponential-models': 'Interpret and differentiate exponential models in context.',
    'function-behavior-analysis': 'Use derivative sign information to determine where a function increases or decreases.',
    'tangent-line-analysis': 'Interpret derivative as slope and build tangent-line models.',
    'accumulation-from-rate': 'Recover total change from a rate model and initial condition.',
    'work-integrals': 'Compute work from a variable force model.',
  };
  return map[topic] || `Use reasoning to complete a ${problemType} item.`;
}

function inferConfidence(statement, topic, techniques, multiStep) {
  let score = 0.45;
  if (topic !== 'general-calculus') score += 0.15;
  if (techniques.length > 0) score += 0.15;
  if (statement.includes('\\[') || statement.includes('\\(') || statement.includes('$')) score += 0.1;
  if (!multiStep) score += 0.05;
  return Number(Math.min(0.95, score).toFixed(2));
}

function classifyProblem(problem, sourceMeta, partMap, index) {
  const topic = inferTopic(problem.statement);
  const moduleId = inferModuleId(problem.statement, problem.partLabel, partMap);
  const multiStep = /\\begin\{enumerate\}/.test(problem.statement)
    || /Find:\s*\\begin\{enumerate\}/.test(problem.statement)
    || /Find:\s*\n/.test(problem.statement)
    || ((problem.statement.match(/\\item\b/g) || []).length > 0);
  const bloomLevel = inferBloom(problem.statement, topic);
  const problemType = inferProblemType(problem.statement, topic);
  const cloId = inferCloId(problem.statement, topic, bloomLevel);
  const likelyTechniques = inferLikelyTechniques(problem.statement);
  const answerType = inferAnswerType(problem.statement, multiStep, topic);
  const misconceptionTags = inferMisconceptions(problem.statement, topic);
  const suitableFor = inferSuitability(problemType, bloomLevel, multiStep, topic, answerType);
  const sbraProfile = inferSbraProfile(problemType, bloomLevel, multiStep, topic, answerType, misconceptionTags);
  const rawLabel = problem.rawLabel || String(index + 1);
  const sourceSlug = slugify(sourceMeta.sourceTitle || sourceMeta.fileBase || 'latex-intake');

  return {
    problem_id: `${sourceSlug}-${rawLabel}`,
    source_intake_file: sourceMeta.fileName,
    source_title: sourceMeta.sourceTitle,
    part_label: problem.partLabel,
    raw_label: rawLabel,
    statement: problem.statement,
    classification_status: 'proposed',
    needs_human_review: true,
    approval_status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    approved_target_destination: 'materials/processed/assessment/problem-pool.json',
    confidence: inferConfidence(problem.statement, topic, likelyTechniques, multiStep),
    proposed: {
      topic,
      module_id: moduleId,
      clo_id: cloId,
      bloom_level: bloomLevel,
      likely_techniques: likelyTechniques,
      answer_type: answerType,
      is_multi_step: multiStep,
      misconception_tags: misconceptionTags,
      suitable_for: suitableFor,
      sbra_profile: sbraProfile,
      problem_type: problemType,
      target_skill: inferTargetSkill(topic, problemType),
    },
    review_notes: 'First-pass intake classification only. Confirm topic mapping, CLO/Bloom fit, and downstream assessment use before promotion to problem-pool work.',
  };
}

async function discoverInputFiles(coursePaths, explicitInputs) {
  if (explicitInputs.length > 0) {
    return explicitInputs.map((target) => path.resolve(target));
  }

  const dir = coursePaths.MATERIALS_PROCESSED_ASSESSMENT_DIR;
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && /^latex-problem-set.*-intake\.md$/i.test(entry.name))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

async function loadModuleCatalog(coursePaths) {
  const entries = await fs.readdir(coursePaths.MODULES_DIR, { withFileTypes: true }).catch(() => []);
  const modules = [];

  for (const entry of entries) {
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.md') continue;
    const fullPath = path.join(coursePaths.MODULES_DIR, entry.name);
    const markdown = await fs.readFile(fullPath, 'utf8');
    const { frontmatter } = parseFrontmatter(markdown);
    modules.push({
      id: frontmatter.id || path.basename(entry.name, '.md'),
      title: frontmatter.title || path.basename(entry.name, '.md'),
      order: Number(frontmatter.order || Number.MAX_SAFE_INTEGER),
      file: path.relative(path.dirname(coursePaths.MODULES_DIR), fullPath).replace(/\\/g, '/'),
    });
  }

  return modules.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function buildModuleGroupedPayload(items, moduleCatalog) {
  const grouped = new Map();
  for (const item of items) {
    const moduleId = item.proposed.module_id;
    if (!grouped.has(moduleId)) grouped.set(moduleId, []);
    grouped.get(moduleId).push(item);
  }

  const catalogMap = new Map(moduleCatalog.map((module) => [module.id, module]));
  const orderedIds = [
    ...moduleCatalog.map((module) => module.id),
    ...Array.from(grouped.keys()).filter((moduleId) => !catalogMap.has(moduleId)).sort(),
  ].filter((moduleId, index, list) => list.indexOf(moduleId) === index && grouped.has(moduleId));

  return orderedIds.map((moduleId) => {
    const moduleMeta = catalogMap.get(moduleId);
    const classifications = grouped.get(moduleId) || [];
    return {
      module_id: moduleId,
      module_title: moduleMeta?.title || moduleId,
      module_order: moduleMeta?.order ?? null,
      module_file: moduleMeta?.file || null,
      item_count: classifications.length,
      classifications,
    };
  });
}

function renderModuleGroupedMarkdown(courseId, groupedModules) {
  const lines = [
    '# LaTeX Problem Intake Classification By Module',
    '',
    `- course_id: \`${courseId}\``,
    `- generated_at: \`${new Date().toISOString()}\``,
    '',
  ];

  for (const moduleEntry of groupedModules) {
    lines.push(`## ${moduleEntry.module_title}`);
    lines.push('');
    lines.push(`- module_id: \`${moduleEntry.module_id}\``);
    lines.push(`- item_count: ${moduleEntry.item_count}`);
    if (moduleEntry.module_file) {
      lines.push(`- module_file: \`${moduleEntry.module_file}\``);
    }
    lines.push('');

    for (const item of moduleEntry.classifications) {
      const proposed = item.proposed;
      const targetList = (proposed.suitable_for || []).join(', ');
      const techniqueList = (proposed.likely_techniques || []).join(', ');
      lines.push(`### ${item.problem_id}`);
      lines.push('');
      lines.push(`- raw_label: \`${item.raw_label}\``);
      lines.push(`- topic: \`${proposed.topic}\``);
      lines.push(`- CLO: \`${proposed.clo_id}\``);
      lines.push(`- Bloom: \`${proposed.bloom_level}\``);
      lines.push(`- answer_type: \`${proposed.answer_type}\``);
      lines.push(`- multi_step: \`${proposed.is_multi_step}\``);
      lines.push(`- suitable_for: ${targetList || 'n/a'}`);
      lines.push(`- likely_techniques: ${techniqueList || 'n/a'}`);
      lines.push(`- statement: ${item.statement.replace(/\n+/g, ' ')}`);
      lines.push('');
    }
  }

  return `${lines.join('\n').trim()}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const courseDir = resolveCourseDir(options.courseDir ?? undefined);
  const coursePaths = getCoursePaths(courseDir);
  const inputs = await discoverInputFiles(coursePaths, options.inputs);
  const moduleCatalog = await loadModuleCatalog(coursePaths);

  if (inputs.length === 0) {
    throw new Error('No latex problem intake files found.');
  }

  const items = [];
  for (const input of inputs) {
    const markdown = await fs.readFile(input, 'utf8');
    const { frontmatter, body } = parseFrontmatter(markdown);
    const partMap = parsePartModuleMap(body);
    const tex = extractTexBlock(body);
    const problems = parseLatexProblems(tex);
    const sourceMeta = {
      fileName: path.basename(input),
      fileBase: path.basename(input, path.extname(input)),
      sourceTitle: frontmatter.source_title || path.basename(input, path.extname(input)),
    };
    problems.forEach((problem, index) => {
      items.push(classifyProblem(problem, sourceMeta, partMap, index));
    });
  }

  await ensureDir(coursePaths.GENERATED_ASSESSMENT_DIR);
  const outputPath = path.join(coursePaths.GENERATED_ASSESSMENT_DIR, 'latex-problem-intake-classification.json');
  await writeJson(outputPath, {
    schema_version: '1.0.0',
    course_id: path.basename(courseDir),
    source_intakes: inputs.map((input) => path.relative(courseDir, input).replace(/\\/g, '/')),
    generated_at: new Date().toISOString(),
    classifications: items,
  });

  const groupedModules = buildModuleGroupedPayload(items, moduleCatalog);
  const groupedJsonPath = path.join(coursePaths.GENERATED_ASSESSMENT_DIR, 'latex-problem-intake-classification-by-module.json');
  await writeJson(groupedJsonPath, {
    schema_version: '1.0.0',
    course_id: path.basename(courseDir),
    generated_at: new Date().toISOString(),
    modules: groupedModules,
  });

  const groupedMarkdownPath = path.join(coursePaths.GENERATED_ASSESSMENT_DIR, 'latex-problem-intake-classification-by-module.md');
  await fs.writeFile(
    groupedMarkdownPath,
    renderModuleGroupedMarkdown(path.basename(courseDir), groupedModules),
    'utf8',
  );

  console.log(`Classified ${items.length} intake problem(s) for ${path.basename(courseDir)}`);
  console.log(`- output: ${path.relative(process.cwd(), outputPath)}`);
  console.log(`- grouped json: ${path.relative(process.cwd(), groupedJsonPath)}`);
  console.log(`- grouped markdown: ${path.relative(process.cwd(), groupedMarkdownPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
