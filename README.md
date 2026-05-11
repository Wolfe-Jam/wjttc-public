<!-- faf: wjttc-public | markdown | doc | Public About Repo for WJTTC — source code private at Wolfe-Jam/wjttc. -->
<!-- faf: doc=readme | canonical=project.faf | family=FAF | private_source=Wolfe-Jam/wjttc -->

[![FAF](https://mcpaas.live/badge/Wolfe-Jam/wjttc-public.svg)](https://builder.faf.one)
[![IANA Registered](https://img.shields.io/badge/IANA-application%2Fvnd.faf%2Byaml-blue)](https://www.iana.org/assignments/media-types/application/vnd.faf+yaml)

> 📖 **Public About Repo** — this is the public face of `Wolfe-Jam/wjttc` (source private). README, docs, project.faf — no source code. Same shape as Anthropic's [`claude-code`](https://github.com/anthropics/claude-code) repo: public face, private engine.

<!-- faf: wjttc | TypeScript | cli | F1-Inspired MCP Server Certification — the Audit half of the CAR Framework -->
<!-- faf: doc=readme | canonical=project.faf | score=100 | family=WJTTC -->

# WJTTC/🍊

**The FAF Foundation Testing Standard for MCP Servers**

[![FAF Foundation](https://img.shields.io/badge/FAF-Foundation_Approved-FF8C00)](https://faf.one)
[![npm downloads](https://img.shields.io/npm/dt/wjttc)](https://www.npmjs.com/package/wjttc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> *"When brakes must work flawlessly, so must our MCP servers"*

---

## What is WJTTC?

WJTTC is the **WolfeJam Technical Testing Certification**. wolfejam is the dev who created the [IANA-registered .faf format](https://www.iana.org/assignments/media-types/application/vnd.faf+yaml) for AI context - the first and only MCP of its kind. He achieved this largely due to his obsession with technical details and testing.

WJTTC is the rollout of his self-certification secrets to help grade other MCP servers for free, with a view to improving MCP server quality system-wide. Now testing across Claude, Gemini, Grok, Rust, and IDE servers (Cursor, Windsurf, Cline, VS Code).

**Score your Server for free. Full leaderboard going live soon - what will your server score?**

### The Testing Ecosystem

| Component | Tests | Speed |
|-----------|-------|-------|
| **faf-cli** (TypeScript) | 1,143 tests, 50 suites | Production CLI |
| **faf-wasm-sdk** (Rust/WASM Mk4) | 136 tests | 0.13s total |
| **wjttc** (Certification) | 105 tests | 52 MCP tests, 9 tiers |

Testing across **5 MCP servers** (Claude, Gemini, Grok, IDE Edition, Rust) and counting.

---

## What is Big Orange?

The 🍊 **Big Orange** is a badge — recognition that the Server Owner(s) have gone above and beyond the 100% pass rate.

- **100%** = Pass all 49 scored tests across ALL 9 tiers (Tiers 1-8)
- **🍊** = Awarded for excellence beyond metrics (badge, not a score)
- **Tier 9** = TAF Receipt Validation (informational only, doesn't affect score)

The 🍊, much like a Michelin Star for a restaurant, is awarded for excellence and well-deserved for Best-of-Class MCP servers.

**Did you know?** Most MCP servers on the registry score Silver or below. Only 3 servers have achieved 🍊 Big Orange certification.

*Full leaderboard coming soon.*

---

## Certification Tiers

| Badge | Tier | Score | Meaning |
|-------|------|-------|---------|
| 🍊 | Big Orange | 100% + BADGE | The Michelin Star of MCP servers (awarded for excellence beyond metrics) |
| 🏆 | Trophy | 100% | Perfect - 100% pass rate |
| 🥇 | Gold | 99%+ | Exceptional |
| 🥈 | Silver | 95%+ | Excellent, room for polish |
| 🥉 | Bronze | 85%+ | Production ready (minimum recommended) |
| 🟢 | Green | 70%+ | Solid foundation |
| 🟡 | Yellow | 55%+ | Needs improvement |
| 🔴 | Red | <55% | Critical issues |

---

## Quick Start

```bash
# Test any MCP server
npx wjttc certify --mcp "npx your-mcp-server"

# Example output:
# 🏆 CERTIFICATION: TROPHY
#    Score:  100/100
#    Tests:  49/49 passed (+ 3 validation checks)
#    Badge:  🍊 Big Orange (awarded for excellence)
```

---

## Current 🍊 Big Orange Holders

| Server | Score | Status |
|--------|-------|--------|
| claude-faf-mcp | 100% 🍊 | Trophy + Big Orange Badge |
| faf-mcp | 100% 🍊 | Trophy + Big Orange Badge |
| grok-faf-mcp | 100% 🍊 | Trophy + Big Orange Badge |

---

## Test System

**52 tests across 9 tiers** (49 scored + 3 validation checks):

| Tier | Name | Weight | Tests |
|------|------|--------|-------|
| 1 | Protocol Compliance | 20% | 12 |
| 2 | Capability Negotiation | 10% | 8 |
| 3 | Tool Integrity | 20% | 6 |
| 4 | Resource Management | 10% | 6 |
| 5 | Security Validation | 15% | 3 |
| 6 | Performance Benchmarks | 15% | 6 |
| 7 | Integration Readiness | 10% | 5 |
| 8 | FAF Documentation | 5% | 3 |
| 9 | TAF Receipt Validation | Informational | 3 |

**Note:** Tier 9 validates `.taf` receipt files but doesn't affect the 0-100% score. It provides proof of testing history over time.

---

## GitHub Action

```yaml
- uses: wolfe-jam/wjttc-action@v1
  with:
    mcp-path: './dist/index.js'
    tier: bronze
```

---

## Pre-Certification Best Practices

Before running WJTTC certification, consider these preparation steps:

**For FAF-enabled projects** (Tier 8):
```bash
# Validate project.faf structure and score
faf score

# If you have faf-cli source code, run Boris-Flow integration tests
cd /path/to/faf-cli
./tests/boris-flow.test.sh
```

**Boris-Flow** is faf-cli's 12-test validation suite that checks:
- Version detection
- Type and language detection
- Claude Code structure validation (agents, skills, commands)
- Score progression (init → auto → 100%)
- Non-TTY safety

Running Boris-Flow before WJTTC certification ensures your `.faf` file is valid and complete, which helps you pass Tier 8 tests.

**Workflow:**
1. `faf init` - Create project.faf
2. `faf auto` - Enhance to 100%
3. (Optional) Run Boris-Flow tests
4. `npx wjttc certify --mcp "npx your-server"` - Run certification

---

## Links

- [Full Specification](./SPECIFICATION.md)
- [Certification Records](./WJTTC-CERTIFIED.md)
- [MCP Protocol](https://modelcontextprotocol.io)
- [FAF Ecosystem](https://faf.one)

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

---

### Get the CLI

> **faf-cli** — The original AI-Context CLI. A must-have for every builder.

```bash
npx faf-cli auto
```

If `wjttc` has been useful, consider starring the repo — it helps others find it.

**Anthropic MCP [#2759](https://github.com/modelcontextprotocol/servers/pull/2759)** · **IANA Registered:** `application/vnd.faf+yaml` · [faf.one](https://faf.one) · [npm](https://www.npmjs.com/package/faf-cli)
