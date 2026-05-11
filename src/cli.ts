#!/usr/bin/env node
/**
 * WJTTC MCP Certification CLI
 * WolfeJam Technical & Testing Center
 *
 * "When brakes must work flawlessly, so must our MCP servers"
 */

import { Command } from 'commander';
import { WJTTCCertifier, CertificationResult, TierLevel } from './certifier';
import { BadgeGenerator } from './badge';
import { initializeWJTTC } from './commands/init';
import * as fs from 'fs';
import * as path from 'path';

// FAF-Aligned Tier System - The Michelin Star for Repos
// One scoring system across all FAF ecosystem tools
const TIERS: Record<TierLevel, { emoji: string; minScore: number; meaning: string }> = {
  'big-orange': { emoji: '🍊', minScore: 100, meaning: 'The Michelin Star - BADGE (awarded for excellence beyond metrics)' },
  'trophy': { emoji: '🏆', minScore: 100, meaning: 'Perfect MCP compliance' },
  'gold': { emoji: '🥇', minScore: 99, meaning: 'Exceptional' },
  'silver': { emoji: '🥈', minScore: 95, meaning: 'Top tier - Excellent' },
  'bronze': { emoji: '🥉', minScore: 85, meaning: 'Strong - Production ready' },
  'green': { emoji: '🟢', minScore: 70, meaning: 'Good - Solid foundation' },
  'yellow': { emoji: '🟡', minScore: 55, meaning: 'Caution - Needs improvement' },
  'red': { emoji: '🔴', minScore: 1, meaning: 'Critical - Major work needed' },
  'white': { emoji: '🤍', minScore: 0, meaning: 'Empty - No context' },
};

const program = new Command();

program
  .name('wjttc')
  .description('Championship-grade MCP server validation')
  .version('1.3.0');

// Main certification command
program
  .command('certify')
  .description('Run certification suite against an MCP server')
  .requiredOption('--mcp <path>', 'Path to MCP server entry point')
  .option('--tiers <list>', 'Tiers to run (1-7 or all)', 'all')
  .option('--min-tier <tier>', 'Minimum required tier', 'bronze')
  .option('--format <format>', 'Output format (json|markdown|summary)', 'summary')
  .option('--output <path>', 'Path to save report', '.github/wjttc-report.md')
  .option('--perf-tool-list <ms>', 'Max ms for tool listing', '50')
  .option('--perf-tool-call <ms>', 'Max ms for tool invocation', '100')
  .option('--strict', 'Fail on SHOULD violations')
  .option('--update-faf', 'Update project.faf score if improved')
  .option('--github-output', 'Output for GitHub Actions')
  .action(async (options) => {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏎️  WJTTC 🍊 MCP CERTIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    const certifier = new WJTTCCertifier({
      mcpPath: options.mcp,
      tiers: options.tiers === 'all' ? [1, 2, 3, 4, 5, 6, 7] : options.tiers.split(',').map(Number),
      performanceTargets: {
        toolList: parseInt(options.perfToolList),
        toolCall: parseInt(options.perfToolCall),
      },
      strict: options.strict || false,
      updateFaf: options.updateFaf || false,
    });

    try {
      const result = await certifier.run();

      // Determine tier
      const achievedTier = getTier(result.score);
      const minTierScore = TIERS[options.minTier as TierLevel]?.minScore || 61;
      const passed = result.score >= minTierScore;

      // Output based on format
      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.format === 'markdown') {
        const markdown = generateMarkdownReport(result, achievedTier);
        console.log(markdown);
        fs.writeFileSync(options.output, markdown);
      } else {
        // Summary
        printSummary(result, achievedTier, passed);
      }

      // GitHub Actions output
      if (options.githubOutput) {
        const githubOutput = process.env.GITHUB_OUTPUT;
        if (githubOutput) {
          const outputs = [
            `score=${result.score}`,
            `tier=${achievedTier}`,
            `tier-emoji=${TIERS[achievedTier].emoji}`,
            `passed=${passed}`,
            `tests-total=${result.totalTests}`,
            `tests-passed=${result.passedTests}`,
            `tests-failed=${result.failedTests}`,
          ];
          fs.appendFileSync(githubOutput, outputs.join('\n') + '\n');
        }
      }

      // Exit code
      process.exit(passed ? 0 : 1);

    } catch (error: any) {
      console.error('❌ Certification failed:', error.message);
      process.exit(1);
    }
  });

// Badge generation command
program
  .command('badge')
  .description('Generate certification badge JSON')
  .requiredOption('--score <score>', 'Certification score')
  .requiredOption('--tier <tier>', 'Certification tier')
  .option('--output <path>', 'Output path', '.github/wjttc-badge.json')
  .action((options) => {
    const badge = BadgeGenerator.generate({
      score: parseInt(options.score),
      tier: options.tier as TierLevel,
    });

    fs.mkdirSync(path.dirname(options.output), { recursive: true });
    fs.writeFileSync(options.output, JSON.stringify(badge, null, 2));

    console.log(`✅ Badge generated: ${options.output}`);
  });

// Quick check command
program
  .command('check')
  .description('Quick health check (Tier 1-2 only)')
  .argument('<mcp-path>', 'Path to MCP server')
  .action(async (mcpPath) => {
    const certifier = new WJTTCCertifier({
      mcpPath,
      tiers: [1, 2],
      performanceTargets: { toolList: 100, toolCall: 200 },
      strict: false,
    });

    const result = await certifier.run();
    const tier = getTier(result.score);

    console.log(`${TIERS[tier].emoji} Score: ${result.score}/100 (${tier})`);
    console.log(`   ${result.passedTests}/${result.totalTests} tests passed`);

    process.exit(result.failedTests === 0 ? 0 : 1);
  });

// Initialize command - Set up WJTTC testing infrastructure
program
  .command('init')
  .description('Initialize WJTTC testing infrastructure in your project')
  .action(async () => {
    try {
      await initializeWJTTC();
    } catch (error: any) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  });

// Helper functions - FAF-Aligned Tier System
function getTier(score: number): TierLevel {
  // Big Orange is a BADGE, not a score tier
  // All scores max at 100% (Trophy)
  if (score >= 100) return 'trophy';
  if (score >= 99) return 'gold';
  if (score >= 95) return 'silver';
  if (score >= 85) return 'bronze';
  if (score >= 70) return 'green';
  if (score >= 55) return 'yellow';
  if (score > 0) return 'red';
  return 'white';
}

function printSummary(result: CertificationResult, tier: TierLevel, passed: boolean) {
  const emoji = TIERS[tier].emoji;

  console.log(`${emoji} CERTIFICATION: ${tier.toUpperCase()}`);
  console.log('');
  console.log(`   Score:  ${result.score}/100`);
  console.log(`   Tests:  ${result.passedTests}/${result.totalTests} passed`);
  console.log(`   Status: ${passed ? '✅ CERTIFIED' : '❌ NOT CERTIFIED'}`);
  console.log('');

  // Tier breakdown
  console.log('Tier Results:');
  result.tierResults.forEach((tr) => {
    const status = tr.passed ? '✅' : '❌';
    console.log(`   ${status} Tier ${tr.tier}: ${tr.passedTests}/${tr.totalTests}`);
  });

  // FAF Documentation (if present)
  if (result.faf) {
    console.log('');
    if (result.faf.found && result.faf.path) {
      console.log('FAF Documentation:');
      console.log(`   File: ${result.faf.path}`);
      console.log(`   Embedded Score: ${result.faf.embeddedScore}%`);
      console.log(`   Current Score: ${result.faf.currentScore}%`);

      if (result.faf.updated) {
        console.log(`   ✅ Score updated in project.faf`);
      } else if (result.faf.currentScore && result.faf.embeddedScore && result.faf.currentScore > result.faf.embeddedScore) {
        console.log(`   💡 Run with --update-faf to update score`);
      }
    } else if (result.faf.error) {
      console.log('FAF Documentation: Error - ' + result.faf.error);
    }
  }

  // TAF Receipt (if present)
  if (result.taf) {
    console.log('');
    if (result.taf.found && result.taf.valid && result.taf.path) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('TIER 9: TAF RECEIPT ✓ VALID');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log(`Receipt: ${result.taf.path}`);
      console.log(`Format: TAF ${result.taf.version}`);
      console.log(`Total Runs: ${result.taf.totalRuns || 0}`);
      console.log(`Pass Rate: ${result.taf.passRate || 'N/A'}`);
      if (result.taf.streak) {
        console.log(`Current Streak: ${result.taf.streak} consecutive passes`);
      }
      if (result.taf.lastRun) {
        console.log(`Last Run: ${result.taf.lastRun} (${result.taf.lastResult})`);
      }
      if (result.taf.firstRun) {
        const first = new Date(result.taf.firstRun);
        const now = new Date();
        const days = Math.floor((now.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`First Run: ${result.taf.firstRun}`);
        console.log(`Days Active: ${days}`);
      }
      console.log('');
      console.log('Validation Checks:');
      console.log(`   ${result.taf.checks?.detection ? '✅' : '❌'} T9.1: Receipt Detection`);
      console.log(`   ${result.taf.checks?.format ? '✅' : '❌'} T9.2: Format Validation`);
      console.log(`   ${result.taf.checks?.integrity ? '✅' : '❌'} T9.3: Data Integrity`);
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else if (result.taf.found && !result.taf.valid) {
      console.log('Tier 9: TAF Receipt - ❌ INVALID');
      console.log(`   Error: ${result.taf.error}`);
      console.log('   Validation Checks:');
      console.log(`      ${result.taf.checks?.detection ? '✅' : '❌'} T9.1: Receipt Detection`);
      console.log(`      ${result.taf.checks?.format ? '✅' : '❌'} T9.2: Format Validation`);
      console.log(`      ${result.taf.checks?.integrity ? '✅' : '❌'} T9.3: Data Integrity`);
    } else if (!result.taf.found) {
      console.log('Tier 9: TAF Receipt - Not Found (Optional)');
      console.log('   Note: Run with --update-taf to create Receipt (future feature)');
    }
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('"When brakes must work flawlessly, so must our MCP servers"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
}

function generateMarkdownReport(result: CertificationResult, tier: TierLevel): string {
  const emoji = TIERS[tier].emoji;

  return `# ${emoji} WJTTC 🍊 Certification Report

## Summary

| Metric | Value |
|--------|-------|
| **Score** | ${result.score}/100 |
| **Tier** | ${tier} ${emoji} |
| **Tests Passed** | ${result.passedTests}/${result.totalTests} |
| **Date** | ${new Date().toISOString()} |

## Tier Results

${result.tierResults.map((tr) => `
### Tier ${tr.tier}: ${tr.name}

- **Status**: ${tr.passed ? '✅ PASSED' : '❌ FAILED'}
- **Tests**: ${tr.passedTests}/${tr.totalTests}
- **Duration**: ${tr.duration}ms

${tr.failedTests.length > 0 ? `
**Failed Tests:**
${tr.failedTests.map((t) => `- ${t}`).join('\n')}
` : ''}
`).join('\n')}

---

*Generated by WJTTC 🍊*
*"When brakes must work flawlessly, so must our MCP servers"*
`;
}

program.parse();
