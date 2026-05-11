# WJTTC MCP Certification Specification

**Version:** 1.0.0
**Date:** 2025-11-29
**Status:** Stable

---

## Overview

WJTTC (WolfeJam Technical & Testing Center) is the FAF Foundation Testing Standard for Model Context Protocol (MCP) servers. It provides a comprehensive, 7-tier certification system that validates MCP server implementations against the official protocol specification.

**Philosophy:** *"When brakes must work flawlessly, so must our MCP servers"*

WJTTC brings F1-inspired engineering rigor to MCP testing. Just as Formula 1 teams test every component to failure, WJTTC tests MCP servers across protocol compliance, capability negotiation, tool integrity, resource management, security, performance, and integration readiness.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Certification Tiers](#certification-tiers)
3. [Test System](#test-system)
4. [CLI Reference](#cli-reference)
5. [GitHub Action](#github-action)
6. [Test Specification](#test-specification)
7. [Scoring Algorithm](#scoring-algorithm)
8. [Certification Records](#certification-records)
9. [FAQ](#faq)

---

## Quick Start

### CLI Usage

```bash
# Test an MCP server
npx @faff/wjttc certify --mcp "npx your-mcp-server"

# Quick health check (Tiers 1-2 only)
npx @faff/wjttc check ./dist/index.js

# Generate badge
npx @faff/wjttc badge --score 94 --tier gold
```

### GitHub Action

```yaml
name: MCP Certification
on: [push, pull_request]

jobs:
  certify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: wolfe-jam/wjttc-action@v1
        with:
          mcp-path: './dist/index.js'
          tier: bronze
```

---

## Certification Tiers

**FAF-Aligned Scoring - The Michelin Star for Repos**

WJTTC uses the FAF Foundation's proven tier system, established across 36,000+ npm downloads:

| Tier | Score | Badge | Meaning |
|------|-------|-------|---------|
| Big Orange | 100% + Badge | 🍊 | *The Michelin Star - Awarded for excellence* |
| Trophy | 100% | 🏆 | Perfect MCP compliance |
| Gold | 99%+ | 🥇 | Exceptional |
| Silver | 95%+ | 🥈 | Top tier - Excellent |
| Bronze | 85%+ | 🥉 | Strong - Production ready |
| Green | 70%+ | 🟢 | Good - Solid foundation |
| Yellow | 55%+ | 🟡 | Caution - Needs improvement |
| Red | <55% | 🔴 | Critical - Major work needed |
| White | 0% | 🤍 | Empty - No context |

### Big Orange (Badge)

Big Orange is the mark of excellence — a badge, not a score. To achieve it, an MCP server must:

1. Pass **all** tests (100% pass rate)
2. Across **all tiers**
3. With **zero failures or warnings**

When these conditions are met, the server is awarded the 🍊 Big Orange badge. Like a Michelin Star, it recognises excellence beyond what a number can capture. The maximum score is 100%.

---

## Test System

WJTTC organizes tests into 7 tiers, each focusing on a specific aspect of MCP compliance:

### Tier 1: Protocol Compliance (Weight: 20%)

Tests fundamental MCP protocol requirements:

| Test | Type | Description |
|------|------|-------------|
| Server declares capabilities | MUST | Initialize response includes capabilities |
| Tool list returns array | MUST | `tools/list` returns valid array (if tools supported) |
| Tools have name property | MUST | All tools have non-empty name string |
| Tools have description property | MUST | All tools have description string |
| Tools have inputSchema property | MUST | All tools have valid JSON Schema |
| Tool call returns content array | MUST | Tool execution returns content array |
| Content items have type field | MUST | All content items specify type |
| Resources list works | MUST | `resources/list` returns array (if supported) |
| Prompts list works | MUST | `prompts/list` returns array (if supported) |
| Invalid method returns -32601 | MUST | Unknown method returns MethodNotFound error |
| Invalid params returns -32602 | MUST | Bad params returns InvalidParams error |
| Handle progress notification | SHOULD | Server stable after progress notification |

### Tier 2: Capability Negotiation (Weight: 10%)

Tests capability advertisement and schema quality:

| Test | Type | Description |
|------|------|-------------|
| Tool count is reasonable | MUST | 1-100 tools declared |
| Tool names follow conventions | SHOULD | lowercase_snake_case naming (80% threshold) |
| Schemas have properties defined | SHOULD | Input schemas define properties (80% threshold) |
| Resources have valid URIs | MUST | All resources have URI (if supported) |
| Prompts have valid names | MUST | All prompts have name (if supported) |
| Support pagination cursor | SHOULD | Handle cursor param in list methods |
| Handle logging/setLevel | SHOULD | Accept or reject gracefully (if logging supported) |
| Prompts have valid arguments | SHOULD | Prompt arguments have proper schema |

### Tier 3: Tool Integrity (Weight: 20%)

Tests that tools function correctly:

| Test | Type | Description |
|------|------|-------------|
| Read tool works | MUST | Can read test file content (if read tool exists) |
| Write tool works | MUST | Can write and verify file (if write tool exists) |
| Handle missing files gracefully | MUST | Returns error, doesn't crash |
| Handle cancellation notification | SHOULD | Server stable after cancel signal |
| Recover from timeout gracefully | MUST | Server stable after timeout scenario |
| Handle empty params object | MUST | Accept or reject empty params gracefully |

### Tier 4: Resource Management (Weight: 10%)

Tests file and resource handling:

| Test | Type | Description |
|------|------|-------------|
| Handle text files correctly | MUST | Plain text content preserved |
| Handle JSON files correctly | MUST | JSON parseable from response |
| Handle large files (<1s for 1MB) | SHOULD | Performance under load |
| Survive write of large payload (2MB) | MUST | Handle or reject gracefully |
| Handle resource subscription | SHOULD | Accept or reject subscribe gracefully |
| Read resource by URI | SHOULD | Return contents for valid resource |

### Tier 5: Security Validation (Weight: 15%)

Tests security boundaries:

| Test | Type | Description |
|------|------|-------------|
| Block path traversal attempts | MUST | Reject `../` and absolute sensitive paths |
| Sanitize command injection | MUST | No shell execution from path input |
| No absolute path leaks in errors | MUST | Error messages don't expose system paths |

### Tier 6: Performance Benchmarks (Weight: 15%)

Tests response times and throughput:

| Test | Type | Description |
|------|------|-------------|
| List tools in <50ms | MUST | Default threshold, configurable |
| Call tool in <100ms | MUST | Default threshold, configurable |
| Handle 10 concurrent ops in <500ms | MUST | Parallel execution capability |
| Handle 50 concurrent ops in <2000ms | MUST | Stress test scalability |
| Survive malformed JSON-RPC request | MUST | Server stability under bad input |
| Handle rapid sequential requests | MUST | 20 sequential ops in <3000ms |

### Tier 7: Integration Readiness (Weight: 10%)

Tests production-readiness and polish:

| Test | Type | Description |
|------|------|-------------|
| All tools follow naming conventions | MUST | 100% lowercase_snake_case |
| Descriptions are informative (>10 chars) | MUST | Meaningful descriptions |
| Include emoji indicators | SHOULD | Visual clarity (50% threshold) |
| Resources have descriptions | SHOULD | Documentation (if supported) |
| Prompts have descriptions | SHOULD | Documentation (if supported) |

---

## CLI Reference

### Commands

#### `certify`

Run full certification suite against an MCP server.

```bash
wjttc certify --mcp <path> [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--mcp <path>` | Path to MCP server or npx command | Required |
| `--tiers <list>` | Tiers to run (1-7 or "all") | `all` |
| `--min-tier <tier>` | Minimum required tier to pass | `bronze` |
| `--format <format>` | Output format: json, markdown, summary | `summary` |
| `--output <path>` | Path to save report | `.github/wjttc-report.md` |
| `--perf-tool-list <ms>` | Max ms for tool listing | `50` |
| `--perf-tool-call <ms>` | Max ms for tool invocation | `100` |
| `--strict` | Fail on SHOULD violations | `false` |
| `--github-output` | Write to GITHUB_OUTPUT | `false` |

**Examples:**

```bash
# Test local MCP server
wjttc certify --mcp ./dist/index.js

# Test npm package
wjttc certify --mcp "npx -y @modelcontextprotocol/server-memory"

# JSON output for CI/CD
wjttc certify --mcp ./server.js --format json

# Strict mode, require Gold
wjttc certify --mcp ./server.js --min-tier gold --strict
```

#### `check`

Quick health check (Tiers 1-2 only).

```bash
wjttc check <mcp-path>
```

**Example:**

```bash
wjttc check ./dist/index.js
# Output: 🥇 Score: 100/100 (gold) - 9/9 tests passed
```

#### `badge`

Generate certification badge JSON for shields.io.

```bash
wjttc badge --score <score> --tier <tier> [--output <path>]
```

**Example:**

```bash
wjttc badge --score 94 --tier gold --output .github/wjttc-badge.json
```

---

## GitHub Action

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `mcp-path` | Path to MCP server entry point | Yes | - |
| `tier` | Minimum certification tier | No | `bronze` |
| `badge` | Generate certification badge | No | `true` |
| `tiers` | Tiers to run (1-7 or all) | No | `all` |
| `report-format` | Output format | No | `summary` |
| `fail-on-warning` | Strict mode | No | `false` |

### Outputs

| Output | Description |
|--------|-------------|
| `score` | Overall score (0-100) |
| `tier` | Achieved certification tier |
| `tier-emoji` | Tier emoji |
| `passed` | Met minimum tier (true/false) |
| `tests-total` | Total tests run |
| `tests-passed` | Tests passed |
| `tests-failed` | Tests failed |

### Example Workflows

**Basic Certification:**

```yaml
- uses: wolfe-jam/wjttc-action@v1
  with:
    mcp-path: './dist/index.js'
```

**Require Championship or Fail:**

```yaml
- uses: wolfe-jam/wjttc-action@v1
  with:
    mcp-path: './dist/index.js'
    tier: championship
    fail-on-warning: true
```

**Security-Only Validation:**

```yaml
- uses: wolfe-jam/wjttc-action@v1
  with:
    mcp-path: './dist/index.js'
    tiers: '5'
```

---

## Test Specification

### Capability Detection

WJTTC detects server capabilities from the `initialize` response:

```json
{
  "capabilities": {
    "tools": {},
    "resources": {},
    "prompts": {},
    "logging": {}
  }
}
```

Tests are automatically skipped for unsupported capabilities. A server that only supports tools will not be penalized for missing resources tests.

### Test Types

- **MUST**: Required for compliance. Failure reduces score significantly.
- **SHOULD**: Recommended. Failure has smaller impact, configurable with `--strict`.

### Transport Support

Currently supported:
- **stdio**: Process-based communication (JSON-RPC 2.0 over stdin/stdout)

Planned:
- HTTP/SSE transport
- WebSocket transport

---

## Scoring Algorithm

### Base Score Calculation

```
score = Σ(tier_score × tier_weight) / Σ(tier_weight)

where:
  tier_score = (passed_tests / total_tests) × 100
  tier_weight = weight assigned to tier (see Test System)
```

### Tier Weights

| Tier | Weight | Rationale |
|------|--------|-----------|
| 1 - Protocol | 20% | Foundation of all MCP communication |
| 2 - Capability | 10% | Important but less critical |
| 3 - Tool Integrity | 20% | Core functionality |
| 4 - Resource Mgmt | 10% | Important for resource servers |
| 5 - Security | 15% | Critical for production |
| 6 - Performance | 15% | Important for user experience |
| 7 - Integration | 10% | Polish and usability |

### Big Orange Badge

If `base_score == 100` AND all tiers passed with zero failures:

```
final_score = 100
badge = 🍊 Big Orange (awarded for excellence)
```

---

## Certification Records

### Official Record

Certification results are tracked in `WJTTC-CERTIFIED.md`. This document serves as the official record of all tested MCP servers.

### Current Certifications

| Server | Score | Tier | Tests |
|--------|-------|------|-------|
| claude-faf-mcp | 100% 🍊 | Big Orange | 46/46 |
| @upstash/context7-mcp | 95% | Gold | 43/46 |
| @modelcontextprotocol/server-memory | 85% | Silver | 39/46* |
| @modelcontextprotocol/server-filesystem | 77% | Silver | 35/46* |

*Tested before test suite expansion

### Key Findings

1. **Community servers can exceed official implementations.** Context7 (Gold, 94%) scores higher than Anthropic's reference servers (Silver, 77-85%).

2. **Big Orange requires intentional design.** The only Big Orange server (claude-faf-mcp) was built with WJTTC certification in mind.

3. **Common failure points:**
   - Tool naming conventions (not using snake_case)
   - Missing emoji in descriptions
   - Edge case handling in tool execution
   - Resource permission issues

---

## FAQ

### What is the relationship between WJTTC and FAF?

WJTTC is part of the FAF (Foundational AI-context Format) ecosystem. FAF provides the format specification, claude-faf-mcp provides the MCP server, and WJTTC provides the testing standard. Together they form a complete solution for AI-context management.

### Why is Big Orange a badge and not a score?

The maximum score is 100%. Big Orange is awarded as a badge — like a Michelin Star — to servers that achieve 100% with zero failures across all tiers. It recognises excellence beyond what a number can capture.

### Can I test HTTP/SSE MCP servers?

Not yet. WJTTC currently only supports stdio transport. HTTP/SSE support is planned.

### How do I achieve Big Orange?

1. Pass all 46 tests
2. Use lowercase_snake_case for all tool names
3. Include emoji in tool descriptions (50%+ coverage)
4. Provide informative descriptions (>10 characters)
5. Handle all edge cases gracefully
6. Meet performance benchmarks

### Is WJTTC affiliated with Anthropic?

No. WJTTC is an independent testing standard created by the FAF Foundation. However, it tests against the official MCP specification maintained by Anthropic.

### How often is the test suite updated?

The test suite evolves with the MCP specification. Major updates are versioned and documented in the changelog.

---

## Links

- **Repository:** https://github.com/Wolfe-Jam/wjttc
- **MCP Specification:** https://spec.modelcontextprotocol.io
- **FAF Format:** https://faf.one
- **Issues:** https://github.com/Wolfe-Jam/wjttc/issues

---

## License

MIT License - Free and open source

---

## FAF Family

| | |
|---|---|
| **[faf-cli](https://www.npmjs.com/package/faf-cli)** | `npx faf-cli init` — create .faf for any project |
| **[claude-faf-mcp](https://www.npmjs.com/package/claude-faf-mcp)** | MCP server for Claude Desktop |
| **[gemini-faf-mcp](https://pypi.org/project/gemini-faf-mcp/)** | MCP server for Gemini CLI |
| **[grok-faf-mcp](https://www.npmjs.com/package/grok-faf-mcp)** | MCP server for Grok |
| **[faf-mcp](https://www.npmjs.com/package/faf-mcp)** | MCP server for Cursor, Windsurf, Cline, VS Code |
| **[rust-faf-mcp](https://crates.io/crates/rust-faf-mcp)** | MCP server in Rust |
| **[faf-skills](https://github.com/Wolfe-Jam/faf-skills)** | 17 Claude Code skills |
| **[faf.one](https://faf.one)** | Blog, downloads, docs |
| **[IANA Registration](https://www.iana.org/assignments/media-types/application/vnd.faf+yaml)** | `application/vnd.faf+yaml` |

*format | driven 🏎️⚡️ [wolfejam.dev](https://wolfejam.dev)*
