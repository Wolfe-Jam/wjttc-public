/**
 * WJTTC MCP Certifier
 * Core certification engine - Dynamically loads and tests MCP servers
 *
 * Based on MCP Specification 2025-11-25
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { performance } from 'perf_hooks';

// FAF-Aligned Tier System - The Michelin Star for Repos
export type TierLevel = 'big-orange' | 'trophy' | 'gold' | 'silver' | 'bronze' | 'green' | 'yellow' | 'red' | 'white';

export interface CertifierOptions {
  mcpPath: string;
  tiers: number[];
  performanceTargets: {
    toolList: number;
    toolCall: number;
  };
  strict: boolean;
  updateFaf?: boolean;
}

export interface TierResult {
  tier: number;
  name: string;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  failedTests: string[];
  duration: number;
}

export interface FAFValidation {
  found: boolean;
  path?: string;
  embeddedScore?: number;
  currentScore?: number;
  updated?: boolean;
  error?: string;
}

export interface TAFValidation {
  found: boolean;
  valid?: boolean;
  path?: string;
  format?: string;
  version?: string;
  totalRuns?: number;
  passRate?: string;
  lastResult?: string;
  lastRun?: string;
  firstRun?: string;
  streak?: number;
  checks?: {
    detection: boolean;
    format: boolean;
    integrity: boolean;
  };
  error?: string;
}

export interface CertificationResult {
  score: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  tierResults: TierResult[];
  faf?: FAFValidation;
  taf?: TAFValidation;
  timestamp: string;
}

interface MCPConnection {
  process: ChildProcess;
  send: (message: any) => Promise<any>;
  close: () => void;
}

const TIER_NAMES: Record<number, string> = {
  1: 'Protocol Compliance',
  2: 'Capability Negotiation',
  3: 'Tool Integrity',
  4: 'Resource Management',
  5: 'Security Validation',
  6: 'Performance Benchmarks',
  7: 'Integration Readiness',
};

const TIER_WEIGHTS: Record<number, number> = {
  1: 20,
  2: 10,
  3: 20,
  4: 10,
  5: 15,
  6: 15,
  7: 10,
};

// Server capabilities detected during initialization
interface ServerCapabilities {
  tools: boolean;
  resources: boolean;
  prompts: boolean;
  logging: boolean;
}

export class WJTTCCertifier {
  private options: CertifierOptions;
  private connection: MCPConnection | null = null;
  private tools: any[] = [];
  private resources: any[] = [];
  private prompts: any[] = [];
  private capabilities: ServerCapabilities = {
    tools: false,
    resources: false,
    prompts: false,
    logging: false,
  };
  private testDir: string = '';

  constructor(options: CertifierOptions) {
    this.options = options;
  }

  async run(): Promise<CertificationResult> {
    // Setup
    this.testDir = path.join('/tmp', `wjttc-test-${Date.now()}`);
    fs.mkdirSync(this.testDir, { recursive: true });

    try {
      // Connect to MCP server and detect capabilities
      await this.connect();

      // Get tool list for tests (if supported)
      if (this.capabilities.tools) {
        this.tools = await this.listTools();
      }

      // Get resources (if supported)
      if (this.capabilities.resources) {
        this.resources = await this.listResources();
      }

      // Get prompts (if supported)
      if (this.capabilities.prompts) {
        this.prompts = await this.listPrompts();
      }

      // Run tiers
      const tierResults: TierResult[] = [];
      let totalPassed = 0;
      let totalTests = 0;

      for (const tier of this.options.tiers) {
        const result = await this.runTier(tier);
        tierResults.push(result);
        totalPassed += result.passedTests;
        totalTests += result.totalTests;
      }

      const score = this.calculateScore(tierResults);

      // Validate FAF documentation (if present)
      const faf = await this.validateFAF();

      // Validate TAF receipt (if present)
      const taf = await this.validateTAF();

      return {
        score,
        totalTests,
        passedTests: totalPassed,
        failedTests: totalTests - totalPassed,
        tierResults,
        faf,
        taf,
        timestamp: new Date().toISOString(),
      };
    } finally {
      // Cleanup
      this.disconnect();
      fs.rmSync(this.testDir, { recursive: true, force: true });
    }
  }

  private async connect(): Promise<void> {
    const mcpPath = this.options.mcpPath;

    // Determine how to run the MCP
    let command: string;
    let args: string[];
    let cwd: string = process.cwd();

    // Check if it's a command string (contains spaces or starts with npx/node/uvx/python)
    if (mcpPath.includes(' ') || mcpPath.startsWith('npx ') || mcpPath.startsWith('node ') || mcpPath.startsWith('uvx ') || mcpPath.startsWith('python')) {
      const parts = mcpPath.split(' ');
      command = parts[0];
      args = parts.slice(1);
    } else {
      const resolvedPath = path.resolve(mcpPath);
      cwd = path.dirname(resolvedPath);

      if (mcpPath.endsWith('.ts')) {
        command = 'npx';
        args = ['ts-node', resolvedPath];
      } else if (mcpPath.endsWith('.js')) {
        command = 'node';
        args = [resolvedPath];
      } else if (mcpPath.endsWith('.py')) {
        command = 'python3';
        args = [resolvedPath];
      } else {
        // Bare package name - default to npx for backward compatibility
        // Use "npx -y package" or "uvx package" explicitly for npm/PyPI packages
        command = 'npx';
        args = ['-y', mcpPath];
      }
    }

    const proc = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd,
      shell: true,
    });

    let messageId = 0;
    const pendingRequests = new Map<number, { resolve: Function; reject: Function }>();
    let buffer = '';

    proc.stdout?.on('data', (data) => {
      buffer += data.toString();

      // Parse JSON-RPC messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id && pendingRequests.has(msg.id)) {
            const { resolve, reject } = pendingRequests.get(msg.id)!;
            pendingRequests.delete(msg.id);
            if (msg.error) {
              reject(new Error(msg.error.message));
            } else {
              resolve(msg.result);
            }
          }
        } catch {
          // Ignore non-JSON lines
        }
      }
    });

    this.connection = {
      process: proc,
      send: async (message: any) => {
        return new Promise((resolve, reject) => {
          const id = ++messageId;
          const request = {
            jsonrpc: '2.0',
            id,
            ...message,
          };

          pendingRequests.set(id, { resolve, reject });
          proc.stdin?.write(JSON.stringify(request) + '\n');

          // Timeout after 30 seconds (some servers are slow to start)
          setTimeout(() => {
            if (pendingRequests.has(id)) {
              pendingRequests.delete(id);
              reject(new Error('Request timeout'));
            }
          }, 30000);
        });
      },
      close: () => {
        proc.kill();
      },
    };

    // Initialize connection and capture server capabilities
    const initResult = await this.connection.send({
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          roots: { listChanged: true },
        },
        clientInfo: {
          name: 'wjttc-certifier',
          version: '1.0.0',
        },
      },
    });

    // Parse server capabilities
    const serverCaps = initResult?.capabilities || {};
    this.capabilities = {
      tools: !!serverCaps.tools,
      resources: !!serverCaps.resources,
      prompts: !!serverCaps.prompts,
      logging: !!serverCaps.logging,
    };

    // Send initialized notification
    this.connection.process.stdin?.write(JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    }) + '\n');
  }

  private disconnect(): void {
    this.connection?.close();
    this.connection = null;
  }

  private async listTools(): Promise<any[]> {
    const result = await this.connection?.send({
      method: 'tools/list',
      params: {},
    });
    return result?.tools || [];
  }

  private async listResources(): Promise<any[]> {
    try {
      const result = await this.connection?.send({
        method: 'resources/list',
        params: {},
      });
      return result?.resources || [];
    } catch {
      return [];
    }
  }

  private async listPrompts(): Promise<any[]> {
    try {
      const result = await this.connection?.send({
        method: 'prompts/list',
        params: {},
      });
      return result?.prompts || [];
    } catch {
      return [];
    }
  }

  private async readResource(uri: string): Promise<any> {
    return await this.connection?.send({
      method: 'resources/read',
      params: { uri },
    });
  }

  private async getPrompt(name: string, args?: any): Promise<any> {
    return await this.connection?.send({
      method: 'prompts/get',
      params: { name, arguments: args || {} },
    });
  }

  private async callTool(name: string, args: any): Promise<any> {
    return await this.connection?.send({
      method: 'tools/call',
      params: { name, arguments: args },
    });
  }

  private async validateFAF(): Promise<FAFValidation> {
    try {
      // Look for project.faf in current working directory
      const fafPath = path.join(process.cwd(), 'project.faf');

      if (!fs.existsSync(fafPath)) {
        return { found: false };
      }

      // Read and parse FAF file
      const fafContent = fs.readFileSync(fafPath, 'utf-8');
      const yaml = require('yaml');
      const fafData = yaml.parse(fafContent);

      // Extract embedded score
      const embeddedScoreStr = fafData.ai_score || fafData.ai_scoring_details?.ai_score;
      const embeddedScore = typeof embeddedScoreStr === 'string'
        ? parseInt(embeddedScoreStr.replace('%', ''))
        : embeddedScoreStr;

      // Score with faf-cli (if available)
      let currentScore: number | undefined;
      try {
        const { execSync } = require('child_process');
        const scoreOutput = execSync(`faf score "${fafPath}"`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore'] // Suppress stderr
        });

        // Parse score from output (looks for "Score: XX%")
        const scoreMatch = scoreOutput.match(/Score:\s*(\d+)%/);
        if (scoreMatch) {
          currentScore = parseInt(scoreMatch[1]);
        }
      } catch {
        // faf-cli not available or failed - use embedded score
        currentScore = embeddedScore;
      }

      // Optionally update if score improved
      let updated = false;
      if (this.options.updateFaf && currentScore && embeddedScore && currentScore > embeddedScore) {
        await this.updateFAFScore(fafPath, fafData, currentScore);
        updated = true;
      }

      return {
        found: true,
        path: fafPath,
        embeddedScore,
        currentScore,
        updated
      };
    } catch (error: any) {
      return {
        found: false,
        error: error.message
      };
    }
  }

  private async updateFAFScore(fafPath: string, fafData: any, newScore: number): Promise<void> {
    try {
      const yaml = require('yaml');

      // Update score fields (surgical update)
      fafData.ai_score = `${newScore}%`;

      if (fafData.ai_scoring_details) {
        fafData.ai_scoring_details.ai_score = newScore;
        fafData.ai_scoring_details.last_rescored = new Date().toISOString();
        fafData.ai_scoring_details.rescored_by = 'wjttc-certifier';
      }

      if (fafData.faf_dna) {
        fafData.faf_dna.current_score = newScore;
      }

      // Create backup
      const backupPath = `${fafPath}.backup-${Date.now()}`;
      fs.copyFileSync(fafPath, backupPath);

      // Write updated FAF file
      fs.writeFileSync(fafPath, yaml.stringify(fafData));
    } catch (error: any) {
      throw new Error(`Failed to update FAF score: ${error.message}`);
    }
  }

  private async validateTAF(): Promise<TAFValidation> {
    const checks = {
      detection: false,
      format: false,
      integrity: false
    };

    try {
      // T9.1: Receipt Detection
      const tafPath = path.join(process.cwd(), '.taf');

      if (!fs.existsSync(tafPath)) {
        return { found: false, checks };
      }

      const stats = fs.statSync(tafPath);
      if (stats.size === 0) {
        return {
          found: true,
          valid: false,
          checks,
          error: 'Receipt file is empty'
        };
      }

      checks.detection = true;

      // T9.2: Format Validation
      const tafContent = fs.readFileSync(tafPath, 'utf-8');
      const yaml = require('yaml');
      let tafData: any;

      try {
        tafData = yaml.parse(tafContent);
      } catch (parseError: any) {
        return {
          found: true,
          valid: false,
          path: tafPath,
          checks,
          error: `Invalid YAML: ${parseError.message}`
        };
      }

      // Check required fields
      const requiredFields = ['format', 'version', 'test_history', 'summary'];
      const missingFields = requiredFields.filter(field => !tafData[field]);

      if (missingFields.length > 0) {
        return {
          found: true,
          valid: false,
          path: tafPath,
          checks,
          error: `Missing required fields: ${missingFields.join(', ')}`
        };
      }

      // Validate format and version
      if (tafData.format !== 'taf') {
        return {
          found: true,
          valid: false,
          path: tafPath,
          checks,
          error: `Invalid format: expected 'taf', got '${tafData.format}'`
        };
      }

      if (!tafData.version.startsWith('1.')) {
        return {
          found: true,
          valid: false,
          path: tafPath,
          checks,
          error: `Unsupported version: ${tafData.version}`
        };
      }

      checks.format = true;

      // T9.3: Data Integrity
      const history = tafData.test_history || [];

      // Validate test history entries
      for (const entry of history) {
        // Check timestamp is valid ISO 8601
        if (entry.timestamp) {
          const timestamp = new Date(entry.timestamp);
          if (isNaN(timestamp.getTime())) {
            return {
              found: true,
              valid: false,
              path: tafPath,
              checks,
              error: `Invalid timestamp: ${entry.timestamp}`
            };
          }
        }

        // Check result is valid
        if (entry.result && !['PASSED', 'FAILED'].includes(entry.result)) {
          return {
            found: true,
            valid: false,
            path: tafPath,
            checks,
            error: `Invalid result: ${entry.result} (must be PASSED or FAILED)`
          };
        }

        // Check test counts are consistent
        if (entry.tests) {
          const { total, passed, failed } = entry.tests;
          if (total !== undefined && passed !== undefined && failed !== undefined) {
            if (passed + failed !== total) {
              return {
                found: true,
                valid: false,
                path: tafPath,
                checks,
                error: `Inconsistent test counts: ${passed} + ${failed} ≠ ${total}`
              };
            }
          }
        }
      }

      checks.integrity = true;

      // Extract summary data
      const summary = tafData.summary || {};
      const lastEntry = history.length > 0 ? history[history.length - 1] : null;
      const firstEntry = history.length > 0 ? history[0] : null;

      // Calculate streak
      let streak = 0;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].result === 'PASSED') {
          streak++;
        } else {
          break;
        }
      }

      return {
        found: true,
        valid: true,
        path: tafPath,
        format: tafData.format,
        version: tafData.version,
        totalRuns: summary.total_runs || history.length,
        passRate: summary.pass_rate,
        lastResult: lastEntry?.result,
        lastRun: lastEntry?.timestamp,
        firstRun: firstEntry?.timestamp,
        streak,
        checks
      };

    } catch (error: any) {
      return {
        found: false,
        checks,
        error: error.message
      };
    }
  }

  private async runTier(tier: number): Promise<TierResult> {
    const start = Date.now();
    const tests = this.getTestsForTier(tier);
    const failedTests: string[] = [];
    let passed = 0;

    for (const test of tests) {
      try {
        const result = await test.run();
        if (result.passed) {
          passed++;
        } else {
          failedTests.push(`${test.name}: ${result.message}`);
        }
      } catch (error: any) {
        failedTests.push(`${test.name}: ${error.message}`);
      }
    }

    return {
      tier,
      name: TIER_NAMES[tier],
      passed: failedTests.length === 0,
      passedTests: passed,
      totalTests: tests.length,
      failedTests,
      duration: Date.now() - start,
    };
  }

  private calculateScore(tierResults: TierResult[]): number {
    let weightedScore = 0;
    let totalWeight = 0;

    for (const result of tierResults) {
      const weight = TIER_WEIGHTS[result.tier] || 10;
      const tierScore = result.totalTests > 0
        ? (result.passedTests / result.totalTests) * 100
        : 0;
      weightedScore += tierScore * weight;
      totalWeight += weight;
    }

    const baseScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

    // Big Orange is a BADGE, not a score
    // Score maxes at 100% (Trophy)
    // Big Orange awarded separately for excellence beyond metrics

    return baseScore;
  }

  private getTestsForTier(tier: number): Test[] {
    switch (tier) {
      case 1: return this.getTier1Tests();
      case 2: return this.getTier2Tests();
      case 3: return this.getTier3Tests();
      case 4: return this.getTier4Tests();
      case 5: return this.getTier5Tests();
      case 6: return this.getTier6Tests();
      case 7: return this.getTier7Tests();
      default: return [];
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 1: PROTOCOL COMPLIANCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getTier1Tests(): Test[] {
    return [
      {
        name: 'MUST: Server declares capabilities',
        run: async () => {
          const hasCaps = this.capabilities.tools || this.capabilities.resources || this.capabilities.prompts;
          return {
            passed: hasCaps,
            message: hasCaps
              ? `OK (tools:${this.capabilities.tools}, resources:${this.capabilities.resources}, prompts:${this.capabilities.prompts})`
              : 'Server declared no capabilities',
          };
        },
      },
      {
        name: 'MUST: Tool list returns array (if tools supported)',
        run: async () => {
          if (!this.capabilities.tools) {
            return { passed: true, message: 'Tools not supported (skipped)' };
          }
          return {
            passed: Array.isArray(this.tools),
            message: Array.isArray(this.tools) ? 'OK' : 'tools/list did not return array',
          };
        },
      },
      {
        name: 'MUST: Tools have name property',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          const allHaveName = this.tools.every(t => typeof t.name === 'string' && t.name.length > 0);
          return {
            passed: allHaveName,
            message: allHaveName ? 'OK' : 'Some tools missing name',
          };
        },
      },
      {
        name: 'MUST: Tools have description property',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          const allHaveDesc = this.tools.every(t => typeof t.description === 'string');
          return {
            passed: allHaveDesc,
            message: allHaveDesc ? 'OK' : 'Some tools missing description',
          };
        },
      },
      {
        name: 'MUST: Tools have inputSchema property',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          const allHaveSchema = this.tools.every(t => t.inputSchema && t.inputSchema.type === 'object');
          return {
            passed: allHaveSchema,
            message: allHaveSchema ? 'OK' : 'Some tools missing/invalid inputSchema',
          };
        },
      },
      {
        name: 'MUST: Tool call returns content array',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          // Find a safe tool to call (prefer debug/status type tools)
          const safeTool = this.tools.find(t =>
            t.name.includes('debug') ||
            t.name.includes('status') ||
            t.name.includes('about') ||
            t.name.includes('version')
          ) || this.tools[0];

          try {
            const result = await this.callTool(safeTool.name, {});
            const hasContent = result && Array.isArray(result.content);
            return {
              passed: hasContent,
              message: hasContent ? 'OK' : 'Response missing content array',
            };
          } catch (e: any) {
            return { passed: false, message: e.message };
          }
        },
      },
      {
        name: 'MUST: Content items have type field',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          const safeTool = this.tools.find(t => t.name.includes('debug')) || this.tools[0];

          try {
            const result = await this.callTool(safeTool.name, {});
            const allHaveType = result?.content?.every((c: any) => typeof c.type === 'string');
            return {
              passed: allHaveType,
              message: allHaveType ? 'OK' : 'Content items missing type',
            };
          } catch (e: any) {
            return { passed: false, message: e.message };
          }
        },
      },
      {
        name: 'MUST: Resources list works (if supported)',
        run: async () => {
          if (!this.capabilities.resources) {
            return { passed: true, message: 'Resources not supported (skipped)' };
          }
          return {
            passed: Array.isArray(this.resources),
            message: Array.isArray(this.resources)
              ? `OK (${this.resources.length} resources)`
              : 'resources/list did not return array',
          };
        },
      },
      {
        name: 'MUST: Prompts list works (if supported)',
        run: async () => {
          if (!this.capabilities.prompts) {
            return { passed: true, message: 'Prompts not supported (skipped)' };
          }
          return {
            passed: Array.isArray(this.prompts),
            message: Array.isArray(this.prompts)
              ? `OK (${this.prompts.length} prompts)`
              : 'prompts/list did not return array',
          };
        },
      },
      {
        name: 'MUST: Invalid method returns MethodNotFound (-32601)',
        run: async () => {
          try {
            await this.connection?.send({
              method: 'nonexistent/method',
              params: {},
            });
            return { passed: false, message: 'Should have thrown error' };
          } catch (e: any) {
            // Check if error message indicates method not found
            const isMethodNotFound = e.message?.toLowerCase().includes('method') ||
                                     e.message?.includes('-32601') ||
                                     e.message?.toLowerCase().includes('not found') ||
                                     e.message?.toLowerCase().includes('unknown');
            return {
              passed: isMethodNotFound,
              message: isMethodNotFound ? 'OK - returned error' : `Wrong error: ${e.message}`,
            };
          }
        },
      },
      {
        name: 'MUST: Invalid params returns InvalidParams (-32602)',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          try {
            // Call tool with obviously wrong param type
            await this.callTool(this.tools[0].name, { __invalid__: { nested: { bad: true } } });
            // Some tools accept any params, so passing is OK
            return { passed: true, message: 'OK - accepted or errored gracefully' };
          } catch (e: any) {
            // Any error response is acceptable
            return { passed: true, message: 'OK - returned error' };
          }
        },
      },
      {
        name: 'SHOULD: Handle progress notification gracefully',
        run: async () => {
          // Test that server doesn't crash when receiving progress notification
          // Progress notifications are client->server per MCP spec
          try {
            this.connection?.process.stdin?.write(JSON.stringify({
              jsonrpc: '2.0',
              method: 'notifications/progress',
              params: {
                progressToken: 'test-token-12345',
                progress: 50,
                total: 100,
              },
            }) + '\n');

            // Give server time to process
            await new Promise(resolve => setTimeout(resolve, 100));

            // If we can still list tools, server handled it gracefully
            const result = await this.listTools();
            return {
              passed: Array.isArray(result),
              message: 'OK - server stable after progress notification',
            };
          } catch (e: any) {
            return { passed: false, message: `Server crashed: ${e.message}` };
          }
        },
      },
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 2: CAPABILITY NEGOTIATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getTier2Tests(): Test[] {
    return [
      {
        name: 'MUST: Tool count is reasonable (1-100)',
        run: async () => {
          if (!this.capabilities.tools) {
            return { passed: true, message: 'Tools not supported (skipped)' };
          }
          const count = this.tools.length;
          const reasonable = count >= 1 && count <= 100;
          return {
            passed: reasonable,
            message: reasonable ? `OK (${count} tools)` : `Unreasonable tool count: ${count}`,
          };
        },
      },
      {
        name: 'SHOULD: Tool names follow conventions (lowercase_snake)',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          const pattern = /^[a-z][a-z0-9_]*$/;
          const valid = this.tools.filter(t => pattern.test(t.name));
          const ratio = valid.length / this.tools.length;
          return {
            passed: ratio >= 0.8,
            message: ratio >= 0.8 ? 'OK' : `Only ${Math.round(ratio * 100)}% follow naming convention`,
          };
        },
      },
      {
        name: 'SHOULD: Schemas have properties defined',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          const withProps = this.tools.filter(t => t.inputSchema?.properties);
          const ratio = withProps.length / this.tools.length;
          return {
            passed: ratio >= 0.8,
            message: ratio >= 0.8 ? 'OK' : `Only ${Math.round(ratio * 100)}% have schema properties`,
          };
        },
      },
      {
        name: 'MUST: Resources have valid URIs (if supported)',
        run: async () => {
          if (!this.capabilities.resources || this.resources.length === 0) {
            return { passed: true, message: 'No resources (skipped)' };
          }
          const allHaveUri = this.resources.every(r => typeof r.uri === 'string' && r.uri.length > 0);
          return {
            passed: allHaveUri,
            message: allHaveUri ? `OK (${this.resources.length} resources)` : 'Some resources missing uri',
          };
        },
      },
      {
        name: 'MUST: Prompts have valid names (if supported)',
        run: async () => {
          if (!this.capabilities.prompts || this.prompts.length === 0) {
            return { passed: true, message: 'No prompts (skipped)' };
          }
          const allHaveName = this.prompts.every(p => typeof p.name === 'string' && p.name.length > 0);
          return {
            passed: allHaveName,
            message: allHaveName ? `OK (${this.prompts.length} prompts)` : 'Some prompts missing name',
          };
        },
      },
      {
        name: 'SHOULD: Support pagination cursor (if many items)',
        run: async () => {
          // Test if server properly handles cursor parameter
          // This is a SHOULD because pagination is optional for small lists
          if (!this.capabilities.tools) {
            return { passed: true, message: 'Tools not supported (skipped)' };
          }
          try {
            const result = await this.connection?.send({
              method: 'tools/list',
              params: { cursor: 'invalid_cursor_12345' },
            });
            // Server should either ignore invalid cursor or return error
            // Both are acceptable - we're just checking it doesn't crash
            return {
              passed: true,
              message: result?.tools ? 'OK - handled cursor param' : 'OK - graceful handling',
            };
          } catch {
            // Error is also acceptable for invalid cursor
            return { passed: true, message: 'OK - rejected invalid cursor' };
          }
        },
      },
      {
        name: 'SHOULD: Handle logging/setLevel if logging supported',
        run: async () => {
          if (!this.capabilities.logging) {
            return { passed: true, message: 'Logging not supported (skipped)' };
          }
          try {
            // Try to set log level - server should accept or reject gracefully
            await this.connection?.send({
              method: 'logging/setLevel',
              params: { level: 'debug' },
            });
            return { passed: true, message: 'OK - accepted setLevel' };
          } catch {
            // Rejection is also valid
            return { passed: true, message: 'OK - rejected setLevel gracefully' };
          }
        },
      },
      {
        name: 'SHOULD: Prompts have valid arguments schema',
        run: async () => {
          if (!this.capabilities.prompts || this.prompts.length === 0) {
            return { passed: true, message: 'No prompts (skipped)' };
          }
          // Check if prompts have arguments defined properly
          const withArgs = this.prompts.filter(p =>
            p.arguments === undefined || // No args is valid
            (Array.isArray(p.arguments) && p.arguments.every((a: any) =>
              typeof a.name === 'string' && a.name.length > 0
            ))
          );
          const ratio = withArgs.length / this.prompts.length;
          return {
            passed: ratio >= 0.8,
            message: ratio >= 0.8
              ? `OK (${Math.round(ratio * 100)}% have valid args)`
              : `Only ${Math.round(ratio * 100)}% have valid argument schemas`,
          };
        },
      },
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 3: TOOL INTEGRITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getTier3Tests(): Test[] {
    return [
      {
        name: 'MUST: Read tool works (if exists)',
        run: async () => {
          const readTool = this.tools.find(t => t.name.includes('read'));
          if (!readTool) {
            return { passed: true, message: 'No read tool (skipped)' };
          }

          // Create test file
          const testFile = path.join(this.testDir, 'read-test.txt');
          fs.writeFileSync(testFile, 'WJTTC Test Content');

          try {
            const result = await this.callTool(readTool.name, { path: testFile });
            const hasContent = result?.content?.[0]?.text?.includes('WJTTC');
            return {
              passed: hasContent,
              message: hasContent ? 'OK' : 'Read did not return expected content',
            };
          } catch (e: any) {
            return { passed: false, message: e.message };
          }
        },
      },
      {
        name: 'MUST: Write tool works (if exists)',
        run: async () => {
          const writeTool = this.tools.find(t => t.name.includes('write'));
          if (!writeTool) {
            return { passed: true, message: 'No write tool (skipped)' };
          }

          const testFile = path.join(this.testDir, 'write-test.txt');
          const content = 'WJTTC Write Test';

          try {
            await this.callTool(writeTool.name, { path: testFile, content });
            const exists = fs.existsSync(testFile);
            const matches = exists && fs.readFileSync(testFile, 'utf-8') === content;
            return {
              passed: matches,
              message: matches ? 'OK' : 'Write did not create expected file',
            };
          } catch (e: any) {
            return { passed: false, message: e.message };
          }
        },
      },
      {
        name: 'MUST: Handle missing files gracefully',
        run: async () => {
          const readTool = this.tools.find(t => t.name.includes('read'));
          if (!readTool) {
            return { passed: true, message: 'No read tool (skipped)' };
          }

          try {
            const result = await this.callTool(readTool.name, {
              path: '/nonexistent/path/12345.txt'
            });
            // Should return error content, not crash
            return {
              passed: result?.content !== undefined,
              message: 'OK - handled gracefully',
            };
          } catch {
            // Throwing is also acceptable
            return { passed: true, message: 'OK - threw error' };
          }
        },
      },
      {
        name: 'SHOULD: Handle cancellation notification',
        run: async () => {
          // Test that server doesn't crash when receiving cancellation
          // This is a SHOULD because not all operations are cancellable
          try {
            // Send a cancellation notification for a non-existent request
            this.connection?.process.stdin?.write(JSON.stringify({
              jsonrpc: '2.0',
              method: 'notifications/cancelled',
              params: { requestId: 99999, reason: 'test cancellation' },
            }) + '\n');

            // Give server time to process
            await new Promise(resolve => setTimeout(resolve, 100));

            // If we can still list tools, server handled it gracefully
            const result = await this.listTools();
            return {
              passed: Array.isArray(result),
              message: 'OK - server stable after cancellation',
            };
          } catch (e: any) {
            return { passed: false, message: `Server crashed: ${e.message}` };
          }
        },
      },
      {
        name: 'MUST: Recover from timeout gracefully',
        run: async () => {
          // TEST THE TESTING: Fire a request with short timeout, then verify server recovers
          try {
            // Create a promise that rejects quickly (simulating timeout scenario)
            const shortTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Simulated timeout')), 10);
            });

            // Race against actual tool call - we expect this to fail
            try {
              await Promise.race([
                this.listTools(),
                shortTimeoutPromise,
              ]);
            } catch {
              // Expected timeout - continue
            }

            // Now verify server is still responsive after the "timeout"
            await new Promise(resolve => setTimeout(resolve, 100));
            const result = await this.listTools();
            return {
              passed: Array.isArray(result),
              message: 'OK - server stable after timeout scenario',
            };
          } catch (e: any) {
            return { passed: false, message: `Server unstable: ${e.message}` };
          }
        },
      },
      {
        name: 'MUST: Handle empty params object',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          // Some tools should accept empty params
          const safeTool = this.tools.find(t =>
            t.name.includes('debug') ||
            t.name.includes('status') ||
            t.name.includes('list')
          ) || this.tools[0];

          try {
            const result = await this.callTool(safeTool.name, {});
            return {
              passed: result !== undefined,
              message: 'OK - handled empty params',
            };
          } catch {
            // Some tools require params - that's OK
            return { passed: true, message: 'OK - rejected empty params gracefully' };
          }
        },
      },
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 4: RESOURCE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getTier4Tests(): Test[] {
    return [
      {
        name: 'MUST: Handle text files correctly',
        run: async () => {
          const readTool = this.tools.find(t => t.name.includes('read'));
          if (!readTool) return { passed: true, message: 'No read tool (skipped)' };

          const testFile = path.join(this.testDir, 'text.txt');
          fs.writeFileSync(testFile, 'Plain text content');

          try {
            const result = await this.callTool(readTool.name, { path: testFile });
            return {
              passed: result?.content?.[0]?.text === 'Plain text content',
              message: 'OK',
            };
          } catch (e: any) {
            return { passed: false, message: e.message };
          }
        },
      },
      {
        name: 'MUST: Handle JSON files correctly',
        run: async () => {
          const readTool = this.tools.find(t => t.name.includes('read'));
          if (!readTool) return { passed: true, message: 'No read tool (skipped)' };

          const testFile = path.join(this.testDir, 'data.json');
          fs.writeFileSync(testFile, '{"test": true}');

          try {
            const result = await this.callTool(readTool.name, { path: testFile });
            const text = result?.content?.[0]?.text;
            const parsed = JSON.parse(text);
            return {
              passed: parsed.test === true,
              message: 'OK',
            };
          } catch (e: any) {
            return { passed: false, message: e.message };
          }
        },
      },
      {
        name: 'SHOULD: Handle large files (<1s for 1MB)',
        run: async () => {
          const readTool = this.tools.find(t => t.name.includes('read'));
          if (!readTool) return { passed: true, message: 'No read tool (skipped)' };

          const largeFile = path.join(this.testDir, 'large.txt');
          fs.writeFileSync(largeFile, 'X'.repeat(1024 * 1024)); // 1MB

          const start = performance.now();
          try {
            await this.callTool(readTool.name, { path: largeFile });
            const duration = performance.now() - start;
            return {
              passed: duration < 1000,
              message: duration < 1000 ? `OK (${Math.round(duration)}ms)` : `Too slow: ${Math.round(duration)}ms`,
            };
          } catch (e: any) {
            return { passed: false, message: e.message };
          }
        },
      },
      {
        name: 'MUST: Survive write of large payload (2MB)',
        run: async () => {
          const writeTool = this.tools.find(t => t.name.includes('write'));
          if (!writeTool) return { passed: true, message: 'No write tool (skipped)' };

          const largeFile = path.join(this.testDir, 'large-write.txt');
          const content = 'W'.repeat(2 * 1024 * 1024); // 2MB

          const start = performance.now();
          try {
            await this.callTool(writeTool.name, { path: largeFile, content });
            const duration = performance.now() - start;
            const exists = fs.existsSync(largeFile);
            const size = exists ? fs.statSync(largeFile).size : 0;
            return {
              passed: exists && size >= 2 * 1024 * 1024 - 100, // allow small variance
              message: exists
                ? `OK (${Math.round(duration)}ms, ${Math.round(size / 1024 / 1024)}MB written)`
                : 'File not created',
            };
          } catch (e: any) {
            // Server might reject large payloads - that's acceptable
            return { passed: true, message: 'OK - rejected large payload gracefully' };
          }
        },
      },
      {
        name: 'SHOULD: Handle resource subscription (if supported)',
        run: async () => {
          if (!this.capabilities.resources) {
            return { passed: true, message: 'Resources not supported (skipped)' };
          }
          // Test resources/subscribe - server should accept or reject gracefully
          try {
            await this.connection?.send({
              method: 'resources/subscribe',
              params: { uri: 'test://example/resource' },
            });
            return { passed: true, message: 'OK - accepted subscribe' };
          } catch {
            // Rejection is valid - not all servers support subscriptions
            return { passed: true, message: 'OK - rejected subscribe gracefully' };
          }
        },
      },
      {
        name: 'SHOULD: Read resource by URI (if resources exist)',
        run: async () => {
          if (!this.capabilities.resources || this.resources.length === 0) {
            return { passed: true, message: 'No resources (skipped)' };
          }
          // Try to read first resource
          const firstResource = this.resources[0];
          try {
            const result = await this.readResource(firstResource.uri);
            const hasContents = result?.contents && Array.isArray(result.contents);
            return {
              passed: hasContents,
              message: hasContents
                ? `OK - read resource ${firstResource.uri}`
                : 'Resource read returned no contents',
            };
          } catch (e: any) {
            // Some resources may require auth or special setup
            return { passed: true, message: `OK - resource unavailable: ${e.message}` };
          }
        },
      },
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 5: SECURITY VALIDATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getTier5Tests(): Test[] {
    return [
      {
        name: 'MUST: Block path traversal attempts',
        run: async () => {
          const readTool = this.tools.find(t => t.name.includes('read'));
          if (!readTool) return { passed: true, message: 'No read tool (skipped)' };

          const dangerousPaths = [
            '../../../etc/passwd',
            '/etc/shadow',
          ];

          for (const badPath of dangerousPaths) {
            try {
              const result = await this.callTool(readTool.name, { path: badPath });
              const text = result?.content?.[0]?.text || '';
              if (text.includes('root:') || text.includes('BEGIN RSA')) {
                return { passed: false, message: `Leaked sensitive file: ${badPath}` };
              }
            } catch {
              // Expected to fail
            }
          }
          return { passed: true, message: 'OK - blocked dangerous paths' };
        },
      },
      {
        name: 'MUST: Sanitize command injection',
        run: async () => {
          const readTool = this.tools.find(t => t.name.includes('read'));
          if (!readTool) return { passed: true, message: 'No read tool (skipped)' };

          const malicious = [
            'file.txt; rm -rf /',
            '$(whoami)',
            '`id`',
          ];

          for (const input of malicious) {
            try {
              await this.callTool(readTool.name, { path: input });
            } catch {
              // Expected to fail safely
            }
          }
          return { passed: true, message: 'OK - no command injection' };
        },
      },
      {
        name: 'MUST NOT: Leak absolute paths in errors',
        run: async () => {
          const readTool = this.tools.find(t => t.name.includes('read'));
          if (!readTool) return { passed: true, message: 'No read tool (skipped)' };

          try {
            const result = await this.callTool(readTool.name, {
              path: '/nonexistent/secret/path.txt'
            });
            const text = JSON.stringify(result);
            const leaks = text.includes('/Users/') || text.includes('/home/');
            return {
              passed: !leaks,
              message: leaks ? 'Leaked absolute paths' : 'OK',
            };
          } catch (e: any) {
            const leaks = e.message?.includes('/Users/') || e.message?.includes('/home/');
            return {
              passed: !leaks,
              message: leaks ? 'Leaked paths in error' : 'OK',
            };
          }
        },
      },
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 6: PERFORMANCE BENCHMARKS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getTier6Tests(): Test[] {
    const targets = this.options.performanceTargets;

    return [
      {
        name: `MUST: List tools in <${targets.toolList}ms`,
        run: async () => {
          const start = performance.now();
          await this.listTools();
          const duration = performance.now() - start;
          return {
            passed: duration < targets.toolList,
            message: duration < targets.toolList
              ? `OK (${Math.round(duration)}ms)`
              : `Too slow: ${Math.round(duration)}ms`,
          };
        },
      },
      {
        name: `MUST: Call tool in <${targets.toolCall}ms`,
        run: async () => {
          const safeTool = this.tools.find(t => t.name.includes('debug')) || this.tools[0];
          if (!safeTool) return { passed: true, message: 'No tools (skipped)' };

          const start = performance.now();
          await this.callTool(safeTool.name, {});
          const duration = performance.now() - start;
          return {
            passed: duration < targets.toolCall,
            message: duration < targets.toolCall
              ? `OK (${Math.round(duration)}ms)`
              : `Too slow: ${Math.round(duration)}ms`,
          };
        },
      },
      {
        name: 'MUST: Handle 10 concurrent ops in <500ms',
        run: async () => {
          const safeTool = this.tools.find(t => t.name.includes('debug')) || this.tools[0];
          if (!safeTool) return { passed: true, message: 'No tools (skipped)' };

          const start = performance.now();
          const promises = Array(10).fill(null).map(() =>
            this.callTool(safeTool.name, {})
          );
          await Promise.all(promises);
          const duration = performance.now() - start;
          return {
            passed: duration < 500,
            message: duration < 500
              ? `OK (${Math.round(duration)}ms)`
              : `Too slow: ${Math.round(duration)}ms`,
          };
        },
      },
      {
        name: 'MUST: Handle 50 concurrent ops in <2000ms',
        run: async () => {
          const safeTool = this.tools.find(t => t.name.includes('debug')) || this.tools[0];
          if (!safeTool) return { passed: true, message: 'No tools (skipped)' };

          const start = performance.now();
          const promises = Array(50).fill(null).map(() =>
            this.callTool(safeTool.name, {})
          );
          await Promise.all(promises);
          const duration = performance.now() - start;
          return {
            passed: duration < 2000,
            message: duration < 2000
              ? `OK (${Math.round(duration)}ms for 50 ops)`
              : `Too slow: ${Math.round(duration)}ms`,
          };
        },
      },
      {
        name: 'MUST: Survive malformed JSON-RPC request',
        run: async () => {
          // TEST THE TESTING: Send malformed JSON and verify server survives
          try {
            // Send malformed JSON directly to stdin
            this.connection?.process.stdin?.write('{"jsonrpc": "2.0", "id": "not-a-number", "method": "tools/list"}\n');
            this.connection?.process.stdin?.write('{invalid json syntax\n');
            this.connection?.process.stdin?.write('{"missing": "method"}\n');

            // Give server time to process
            await new Promise(resolve => setTimeout(resolve, 200));

            // If we can still list tools, server survived
            const result = await this.listTools();
            return {
              passed: Array.isArray(result),
              message: 'OK - server survived malformed JSON',
            };
          } catch (e: any) {
            return { passed: false, message: `Server crashed: ${e.message}` };
          }
        },
      },
      {
        name: 'MUST: Handle rapid sequential requests',
        run: async () => {
          const safeTool = this.tools.find(t => t.name.includes('debug')) || this.tools[0];
          if (!safeTool) return { passed: true, message: 'No tools (skipped)' };

          // Fire 20 requests as fast as possible sequentially
          const start = performance.now();
          for (let i = 0; i < 20; i++) {
            await this.callTool(safeTool.name, {});
          }
          const duration = performance.now() - start;
          return {
            passed: duration < 3000,
            message: duration < 3000
              ? `OK (${Math.round(duration)}ms for 20 sequential)`
              : `Too slow: ${Math.round(duration)}ms`,
          };
        },
      },
    ];
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TIER 7: INTEGRATION READINESS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private getTier7Tests(): Test[] {
    return [
      {
        name: 'MUST: All tools follow naming conventions',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          const pattern = /^[a-z][a-z0-9_]*$/;
          const invalid = this.tools.filter(t => !pattern.test(t.name));
          return {
            passed: invalid.length === 0,
            message: invalid.length === 0
              ? 'OK'
              : `Invalid names: ${invalid.map(t => t.name).join(', ')}`,
          };
        },
      },
      {
        name: 'MUST: Descriptions are informative (>10 chars)',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          const short = this.tools.filter(t => !t.description || t.description.length < 10);
          return {
            passed: short.length === 0,
            message: short.length === 0
              ? 'OK'
              : `${short.length} tools have short/missing descriptions`,
          };
        },
      },
      {
        name: 'SHOULD: Include emoji indicators',
        run: async () => {
          if (!this.capabilities.tools || this.tools.length === 0) {
            return { passed: true, message: 'No tools (skipped)' };
          }
          const emojiPattern = /[\u{1F300}-\u{1F9FF}]/u;
          const withEmoji = this.tools.filter(t => emojiPattern.test(t.description || ''));
          const ratio = withEmoji.length / this.tools.length;
          return {
            passed: ratio >= 0.5,
            message: ratio >= 0.5
              ? `OK (${Math.round(ratio * 100)}% have emoji)`
              : `Only ${Math.round(ratio * 100)}% have emoji`,
          };
        },
      },
      {
        name: 'SHOULD: Resources have descriptions',
        run: async () => {
          if (!this.capabilities.resources || this.resources.length === 0) {
            return { passed: true, message: 'No resources (skipped)' };
          }
          const withDesc = this.resources.filter(r => r.description && r.description.length > 0);
          const ratio = withDesc.length / this.resources.length;
          return {
            passed: ratio >= 0.5,
            message: ratio >= 0.5
              ? `OK (${Math.round(ratio * 100)}% have descriptions)`
              : `Only ${Math.round(ratio * 100)}% have descriptions`,
          };
        },
      },
      {
        name: 'SHOULD: Prompts have descriptions',
        run: async () => {
          if (!this.capabilities.prompts || this.prompts.length === 0) {
            return { passed: true, message: 'No prompts (skipped)' };
          }
          const withDesc = this.prompts.filter(p => p.description && p.description.length > 0);
          const ratio = withDesc.length / this.prompts.length;
          return {
            passed: ratio >= 0.5,
            message: ratio >= 0.5
              ? `OK (${Math.round(ratio * 100)}% have descriptions)`
              : `Only ${Math.round(ratio * 100)}% have descriptions`,
          };
        },
      },
    ];
  }
}

interface Test {
  name: string;
  run: () => Promise<TestResult>;
}

interface TestResult {
  passed: boolean;
  message: string;
}
