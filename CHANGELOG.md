<!-- faf: wjttc | TypeScript | cli | F1-Inspired MCP Server Certification — the Audit half of the CAR Framework -->
<!-- faf: doc=changelog | latest=v1.4.0 | canonical=project.faf | family=WJTTC -->

# Changelog

All notable changes to WJTTC (WolfeJam Technical Testing Certification) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-03-18

### Changed

- **Big Orange is a badge, not a score** — removed all 105% references across README, SPECIFICATION, BRAND-STORY, and WJTTC-CERTIFIED. Maximum score is 100%. Big Orange is awarded for excellence, like a Michelin Star.
- **Download badge** added to README (shields.io npm total downloads)
- **Ecosystem coverage** — now testing across 5 MCP servers: Claude, Gemini, Grok, IDE Edition (Cursor/Windsurf/Cline/VS Code), and Rust
- **Testing ecosystem stats** — faf-cli 1,143 tests, faf-wasm-sdk Mk4 136 tests in 0.13s, wjttc 105 tests
- **FAF Family footer** added to README and SPECIFICATION
- **Download stats** updated: 15k → 36k+ npm downloads
- **format | driven** branding

## [1.3.0] - 2026-02-17

### Added

- **`wjttc init` command** - Self-hosting infrastructure setup
  - Initializes championship-grade testing in any project
  - Creates test directories (tests/brake, tests/engine, tests/aero)
  - Installs pre-commit hook with Rocket Science Grade branding
  - Adds package.json scripts (test:brake, test:wjttc, etc.)
  - Generates example brake test with helpful comments
  - Creates WJTTC-TESTING.md documentation
- **Pre-commit hook template** - Extracted from faf-enterprise
  - TypeScript strict mode check
  - Brake tests execution (<30s)
  - WJTTC certification branding
- **Testing infrastructure templates** - Enable any project to adopt WJTTC standards
- Service to the army of free devs - Championship-grade testing for everyone

### Changed

- WJTTC is now both a **certification tool** AND a **testing infrastructure provider**
- Enhanced community offering: test your MCP server + set up your testing

## [Unreleased]

### Reference Implementation
- **MCPaaS™ Test Suite** - First championship test suite for production MCP infrastructure
  - 14 tests across 5 tiers (BRAKE, ENGINE, AERO, PIT STOP, RECEIPT)
  - Full MCP client with session handling and stateless mode
  - Real-world soul management testing (create, update, delete operations)
  - Integration testing patterns with REST API verification
  - Located at `/Users/wolfejam/FAF/mcpaas-cf/tests/wjttc/`
  - Target: Big Orange certification by Feb 28, 2026
- Created as exemplar for testing production MCP servers
- Demonstrates WJTTC philosophy: infrastructure responsibility

### Documentation
- Added "Reference Implementations" section to CLAUDE.md
- Documented MCPaaS test suite patterns and structure
- Included MCP client implementation reference

## [1.2.1] - 2026-02-15

### Fixed

- **Remove 105% scoring system** - Align with official FAF tier system (0-100%)
  - Remove 105% Easter egg logic from certifier
  - Update to Trophy (100%) as perfect score
  - 🍊 Big Orange is now a BADGE awarded separately, not a calculated score
  - Update tier definitions in cli.ts (minScore: 100 for both Trophy and Big Orange)
  - Update all test assertions (certifier.test.ts, slow-fast.test.ts, badge.test.ts)
  - Update documentation (README.md, action.yml)
  - Fixes alignment with FAF standard where scores range 0-100%

### Changed

- Big Orange badge criteria: 100% score + demonstrated championship-grade engineering
- TIER_BOUNDARIES in tests now exclude Big Orange (badge, not score tier)
- getTier() functions updated across codebase to remove 105% check
- All 103 tests passing with updated assertions

## [1.2.0] - 2026-02-03 - TAF-Aware Edition

### Added
- **Tier 9: TAF Receipt Validation** - Receipt validator (not tester)
  - T9.1: Receipt Detection (.taf file exists, readable, not empty)
  - T9.2: Format Validation (Valid YAML, required fields, TAF v1.0.0 spec)
  - T9.3: Data Integrity (ISO timestamps, valid results, consistent counts)
- `TAFValidation` interface with full receipt metadata
- `validateTAF()` method in certifier
- CLI display for receipt summary (runs, pass rate, streak, days active)
- Support for informational validation checks (does not affect 0-100% score)

### Changed
- Test count: 49 tests → **52 tests** (49 scored + 3 validation checks)
- Tier count: 8 tiers → **9 tiers**
- Philosophy: Progressive adoption - 7, 8, or 9 tiers all valid
- Receipt display shows validation check results (✅/❌)
- Updated all documentation to reflect Tier 9

### Documentation
- Added Tier 9 section to CLAUDE.md with philosophy and validation checks
- Updated test system table (52 tests across 9 tiers)
- Added tier philosophy: "Receipts aren't scored - they're proof"
- Updated project.faf with Tier 9 structure

## [1.1.0] - 2026-02-02 - FAF-Aware Edition

### Added
- **Tier 8: FAF Documentation** - Validates project.faf files
- `FAFValidation` interface
- `validateFAF()` method using faf-cli scoring engine
- `--update-faf` flag to update embedded scores
- Backup system for FAF file updates (surgical updates only)
- CLI display for FAF validation results

### Changed
- Test count: 46 tests → **49 tests** (Tier 8 adds 3 tests)
- Tier count: 7 tiers → **8 tiers**
- Score updated from 98% → 100% (earned through shipping)

### Documentation
- Added CAR Framework (Claim/Audit/Receipt) to CLAUDE.md
- Added FAF-Awareness section
- Updated WJTTC to validate its own project.faf

## [1.0.0] - 2025-12-02 - Launch

### Added
- Initial release of WJTTC MCP Certification
- **46 tests across 7 tiers:**
  - Tier 1: Protocol Compliance (20%, 12 tests)
  - Tier 2: Capability Negotiation (10%, 8 tests)
  - Tier 3: Tool Integrity (20%, 6 tests)
  - Tier 4: Resource Management (10%, 6 tests)
  - Tier 5: Security Validation (15%, 3 tests)
  - Tier 6: Performance Benchmarks (15%, 6 tests)
  - Tier 7: Integration Readiness (10%, 5 tests)
- FAF-Aligned tier system (Big Orange 🍊 to White 🤍)
- CLI commands: `certify`, `check`, `badge`
- Badge generator for certification results
- F1-inspired testing philosophy: "When brakes must work flawlessly, so must our MCP servers"
- MCP Registry integration
- Jest test suite (105 tests passing)

### Documentation
- SPECIFICATION.md with full test documentation
- WJTTC-CERTIFIED.md for official certification records
- BRAND-STORY.md with F1 heritage and brand guidelines
- project.faf with 100% AI-Readiness score

---

## Version History

- **v1.2.0** (2026-02-03): TAF-Aware - Receipt validation
- **v1.1.0** (2026-02-02): FAF-Aware - Project DNA validation
- **v1.0.0** (2025-12-02): Launch - Core MCP certification

*WJTTC 🍊 - WolfeJam Technical Testing Certification*
*"When brakes must work flawlessly, so must our MCP servers"*
