<!-- faf: wjttc | TypeScript | cli | F1-Inspired MCP Server Certification — the Audit half of the CAR Framework -->
<!-- faf: claim=project.faf | score=100 | family=WJTTC | siblings=README.md,CHANGELOG.md,SPECIFICATION.md,server.json -->

# WJTTC 🍊 - WolfeJam Technical Testing Certification

## PROJECT STATE: SHIPPED + SELF-HOSTING 🚀
**Version:** 1.3.0
**Launch Date:** December 2, 2025
**FAF-Aware:** February 2, 2026
**TAF-Aware:** February 3, 2026
**Self-Hosting:** February 17, 2026
**npm:** wjttc@1.3.0
**MCP Registry:** io.github.Wolfe-Jam/WJTTC v1.3.0
**FAF Score:** 100% 🏆 (earned - was 98% at launch)

---

## Core Context

### Project Identity
- **Name:** WJTTC 🍊 (WolfeJam Technical Testing Certification)
- **Purpose:** F1-Inspired MCP Server Certification + FAF Validation
- **Tagline:** *"When brakes must work flawlessly, so must our MCP servers"*
- **Philosophy:** TEST the TESTING
- **Creator:** wolfejam (IANA-registered .faf format)

### Big Orange 🍊 - The Truth
**Big Orange is a BADGE, not a score**

- Score: 0-100% (hard maximum)
- Trophy 🏆 awarded at 100%
- Big Orange 🍊 awarded for excellence beyond metrics
- Criteria: 100% score + demonstrated championship-grade engineering
- **Not calculated. Awarded.**

Currently held by: **3 servers** (claude-faf-mcp, faf-mcp, grok-faf-mcp)

---

## Certification Tiers

| Badge | Tier | Score | Meaning |
|-------|------|-------|---------|
| 🍊 | Big Orange | 100% + Badge | The Michelin Star (awarded) |
| 🏆 | Trophy | 100% | Perfect - 100% pass rate |
| 🥇 | Gold | 99%+ | Exceptional |
| 🥈 | Silver | 95%+ | Excellent, room for polish |
| 🥉 | Bronze | 85%+ | Production ready (minimum recommended) |
| 🟢 | Green | 70%+ | Solid foundation |
| 🟡 | Yellow | 55%+ | Needs improvement |
| 🔴 | Red | <55% | Critical issues |

**Scoring:** 0-100% only. No 105%, no percentages above 100%.

---

## The CAR Framework - The Golden Triangle

**WJTTC is the "A" in CAR:**

```
         C (Claim)
        .faf file
           /\
          /  \
         /    \
        /______\
    A          R
 WJTTC      .taf
(Audit)  (Receipt)
```

### Three Components

| Component | What | Who Creates | Purpose |
|-----------|------|-------------|---------|
| **C**laim | `.faf` file | Developer | Declares what project does |
| **A**udit | Test execution | **WJTTC** | Proves it works |
| **R**eceipt | `.taf` file | TAF system | Permanent record |

### How It Works

**Progressive Adoption:**

1. **FAF Only** (Standalone)
   - Get 99/100 score, run bi-sync
   - Persistent context, free
   - Great project documentation
   - No testing required

2. **FAF + WJTTC** (Adding Audit)
   - Claim exists (`.faf`)
   - WJTTC runs 52 tests (49 scored + 3 validation checks)
   - Validates claims with evidence
   - No receipt yet

3. **FAF + WJTTC + TAF** (Full CAR)
   - Claim (`.faf`)
   - Audit (WJTTC tests)
   - Receipt (`.taf` - git-tracked test history)
   - Complete credibility triangle

**"No CAR = No transport."**

### What WJTTC Knows

- **WJTTC is the Audit (A)** - validates the Claim
- **R = Receipt** - permanent test record
- **TAF issues the Receipt** - generates/updates `.taf` file
- **Receipt is git-tracked** - CI/CD auto-updates via `faf-taf-git` action
- **Not everyone needs all three** - Progressive adoption model

### TAF Integration

**Tier 9: Receipt Validation**
- Validates `.taf` file presence and integrity
- Informational only (does not affect score)
- See "TAF Receipt Validation (Tier 9)" section below

**Future: Receipt Creation**
- `--update-taf` flag (planned)
- WJTTC can optionally trigger TAF
- TAF appends results to `.taf`
- Git-tracked audit trail

---

## Test System

**52 tests across 9 tiers:**

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

### Tier Philosophy

**Progressive adoption - any level is valid:**

- **Tiers 1-7**: Core MCP testing (foundation)
- **Tier 8**: FAF (Claim - what you say you are)
- **Tier 9**: TAF Receipt (Proof - builds trust over time)

**7, 8, or 9 tiers - all work. Any level is fine.**

You don't need all 9 to be legitimate. Choose your level:
- **T1-7 only**: MCP certification alone
- **T1-8**: MCP + Claims (FAF-aware)
- **T1-9**: Full CAR Framework (with Receipt)

**Note:** Tier 9 is informational only and does not affect the 0-100% score. It validates Receipt presence and integrity.

---

## FAF-Awareness (NEW - Feb 2, 2026)

**WJTTC now validates project.faf files during certification:**

### Features
- ✅ Detects project.faf in current directory
- ✅ Parses embedded ai_score
- ✅ Rescores using current faf-cli engine
- ✅ Compares embedded vs current score
- ✅ Optionally updates score with `--update-faf` flag
- ✅ Creates backup before updating
- ✅ Displays FAF info in certification report

### Safety
- Read-only by default (no file modifications)
- `--update-faf` required for score updates
- Creates backup: `project.faf.backup-{timestamp}`
- Surgical updates: only score fields modified
- Preserves all other FAF data

### Example Output
```
FAF Documentation:
   File: /path/to/project.faf
   Embedded Score: 98%
   Current Score: 100%
   💡 Run with --update-faf to update score
```

---

## TAF Receipt Validation (Tier 9)

**WJTTC validates .taf Receipt files (informational only):**

### What Tier 9 Does
- **Receipt Validator** - not a tester
- Validates Receipt presence, format, and integrity
- Displays Receipt summary in certification report
- **Does NOT affect 0-100% score** - informational only

### The 3 Validation Checks

**T9.1: Receipt Detection**
- `.taf` file exists in project root
- File is readable and accessible
- Validates file is not empty

**T9.2: Format Validation**
- Valid YAML structure
- Required fields present: `format`, `version`, `test_history`, `summary`
- Conforms to TAF v1.0.0 specification
- Schema validation passes

**T9.3: Data Integrity**
- Timestamps are valid ISO 8601 format
- Results are valid values (PASSED/FAILED)
- Test counts are consistent (passed + failed = total)
- Summary statistics match history data
- No corrupted or malformed entries

### Philosophy

**Receipts aren't scored - they're proof.**

- A Receipt is valid or invalid (binary check)
- The Receipt itself contains performance data
- WJTTC validates authenticity, not results
- Longitudinal analysis stays with TAF's domain

### Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIER 9: TAF RECEIPT ✓ VALID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt: /path/to/project/.taf
Format: TAF v1.0.0
Total Runs: 47
Pass Rate: 97.8%
Current Streak: 12 consecutive passes
Last Run: 2026-02-02T18:30:00Z (PASSED)
First Run: 2025-12-15T10:00:00Z
Days Active: 49

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**If no Receipt:**
```
Tier 9: TAF Receipt - Not Found (Optional)
Note: Run with --update-taf to create Receipt
```

---

## Current Certifications

| Server | Score | Tier |
|--------|-------|------|
| claude-faf-mcp | 100% | 🍊 Big Orange |
| faf-mcp | 100% | 🍊 Big Orange |
| grok-faf-mcp | 100% | 🍊 Big Orange |
| @modelcontextprotocol/server-memory | 91% | 🥉 Bronze |
| @modelcontextprotocol/server-filesystem | 86% | 🥉 Bronze |

---

## Reference Implementations

### MCPaaS™ Test Suite (Feb 10, 2026)

**The First Championship Test Suite for Production MCP Infrastructure**

Location: `/Users/wolfejam/FAF/mcpaas-cf/tests/wjttc/`

**What It Tests:**
- MCPaaS™ (Model Context Protocol as a Service) - Cloudflare Workers MCP server
- Soul management tools (create_soul, update_soul, delete_soul)
- Real-world MCP client integration with session handling
- 14 tests across 5 tiers targeting critical safety and performance

**Test Structure:**
```
tests/wjttc/
├── soul-management.test.ts    # 14 championship tests
├── lib/
│   └── mcp-client.ts           # Full MCP client with session handling
├── README.md                   # Documentation
└── WJTTC-STANDARD.md           # Manifesto
```

**Key Patterns Demonstrated:**
1. **TIER 1: BRAKE** - Input validation, duplicate prevention, confirmation requirements
2. **TIER 2: ENGINE** - Full lifecycle tests (create→read→update→delete)
3. **TIER 3: AERO** - Performance benchmarks (10 ops < 1s), unicode handling
4. **TIER 4: PIT STOP** - Integration with list_souls, get_soul, REST API
5. **TIER 9: RECEIPT** - MCP schema validation

**MCP Client Features:**
- Session initialization with initialize/initialized handshake
- Stateless mode support (X-Session-Mode: stateless)
- Tool calling via tools/call method
- Direct REST API verification helper (readSoulDirect)
- Type-safe interfaces

**Target Certification:** Big Orange by Feb 28, 2026

**Responsibility Statement:**
> "I invented FAF (IANA registered Oct 30), #2759 merge Claude-FAF-MCP, now I have created MCPaaS™️. WJTTC is how it ALL gets tested, perfected, validated and TRUSTED."

**Use This As:**
- Example of championship-grade test structure
- MCP client implementation reference
- Real-world tier application
- Integration testing patterns

---

## Business Model

```
FREE: Test your MCP server (score + tier)
PAID: Know WHY you failed and HOW to fix it
```

**The hook:** Most servers fail. Even Anthropic's.

---

## Commands

```bash
# Full certification
npx wjttc certify --mcp "npx your-server"

# With FAF validation + update
npx wjttc certify --mcp "npx your-server" --update-faf

# Quick health check (Tiers 1-2)
npx wjttc check ./dist/index.js

# Generate badge
npx wjttc badge --score 95 --tier silver
```

---

## Key Files

- `src/certifier.ts` - Core 46-test engine + FAF validation
- `src/cli.ts` - CLI interface (check, certify, badge)
- `src/badge.ts` - Badge generator
- `src/index.ts` - Entry point
- `src/__tests__/` - 105 tests (badge, certifier, slow-fast)
- `SPECIFICATION.md` - Full test documentation
- `WJTTC-CERTIFIED.md` - Official certification records
- `BRAND-STORY.md` - Brand heritage and guidelines
- `server.json` - MCP Registry configuration
- `project.faf` - WJTTC's own FAF DNA (100% score)

---

## Tech Stack

- **Runtime:** Node.js >=18.0.0
- **Language:** TypeScript (strict mode)
- **CLI:** Commander.js
- **MCP SDK:** @modelcontextprotocol/sdk
- **Testing:** Jest (105 tests passing)
- **Package:** npm registry (wjttc)
- **FAF:** yaml parser for project.faf validation

---

## Recent Updates (Feb 2, 2026)

### FAF-Awareness Feature
- Added FAF file detection and validation
- Integrated faf-cli scoring
- Safe score update mechanism
- Backup system for file updates
- 261 lines of clean code

### Repository Cleanup
- Removed .DS_Store files
- Updated MCP registry schema
- Fixed documentation inconsistencies
- Removed empty directories

### Score Evolution
- Launch (Dec 2, 2025): 98% - New project, not yet proven
- Current (Feb 2, 2026): 100% - Shipped, tested, earned

---

## The Philosophy in Action

**WJTTC tested itself with its own FAF-awareness feature:**

```
Embedded Score (Dec 2025): 98%
Current Score (Feb 2026):  100%
Action: Updated via --update-faf
Result: Score earned through shipping
```

**The system doesn't play favorites. Even for its creator.**

---

*WJTTC 🍊 - WolfeJam Technical Testing Certification*
*"When brakes must work flawlessly, so must our MCP servers"*
*F1-Inspired Software Engineering*

---

**STATUS: SHIPPED + FAF-AWARE**
*105 tests passing | npm + MCP Registry published | FAF validation live*
*🏎️⚡️ championship_sync*
---

**STATUS: BI-SYNC ACTIVE 🔗 - Synchronized with .faf context!**

*Last Sync: 2026-03-18T06:42:46.908Z*
*Sync Engine: F1-Inspired Software Engineering*
*🏎️⚡️_championship_sync*
