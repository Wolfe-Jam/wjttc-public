import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Initialize WJTTC testing infrastructure in the current project
 *
 * Sets up:
 * - Pre-commit hook (Rocket Science Grade)
 * - Test directory structure (brake/engine/aero)
 * - Package.json scripts
 * - Documentation
 */
export async function initializeWJTTC(): Promise<void> {
  console.log(chalk.bold('\n🚀 WJTTC Initialization\n'));
  console.log('Setting up championship-grade testing infrastructure...\n');

  const projectRoot = process.cwd();
  let stepsCompleted = 0;
  const totalSteps = 5;

  try {
    // Step 1: Create test directories
    console.log(chalk.cyan(`[${++stepsCompleted}/${totalSteps}]`) + ' Creating test directories...');
    const testDirs = ['tests/brake', 'tests/engine', 'tests/aero'];
    for (const dir of testDirs) {
      const fullPath = path.join(projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(chalk.green('  ✓') + ` Created ${dir}/`);
      } else {
        console.log(chalk.yellow('  ⚠') + ` ${dir}/ already exists`);
      }
    }

    // Step 2: Create .githooks directory
    console.log(chalk.cyan(`\n[${++stepsCompleted}/${totalSteps}]`) + ' Setting up pre-commit hook...');
    const githooksDir = path.join(projectRoot, '.githooks');
    if (!fs.existsSync(githooksDir)) {
      fs.mkdirSync(githooksDir, { recursive: true });
    }

    // Step 3: Copy pre-commit hook template
    const templatePath = path.join(__dirname, '../../templates/pre-commit.sh');
    const hookPath = path.join(githooksDir, 'pre-commit');

    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, hookPath);
      fs.chmodSync(hookPath, '755'); // Make executable
      console.log(chalk.green('  ✓') + ' Created .githooks/pre-commit');
      console.log(chalk.dim('    Run: git config core.hooksPath .githooks'));
    } else {
      console.log(chalk.yellow('  ⚠') + ' Template not found, creating inline...');
      const hookContent = generatePreCommitHook();
      fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
      console.log(chalk.green('  ✓') + ' Created .githooks/pre-commit');
    }

    // Step 4: Update package.json with test scripts
    console.log(chalk.cyan(`\n[${++stepsCompleted}/${totalSteps}]`) + ' Adding test scripts to package.json...');
    const packageJsonPath = path.join(projectRoot, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      const scriptsToAdd = {
        'typecheck': 'tsc --noEmit',
        'test:brake': 'jest tests/brake --maxWorkers=4 --no-coverage',
        'test:engine': 'jest tests/engine --maxWorkers=4',
        'test:aero': 'jest tests/aero',
        'test:wjttc': 'jest && echo "\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n🏆 WJTTC CERTIFICATION: PASSED\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\nStandard: Rocket Science Grade 🚀\\nStatus: Championship Ready\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n"'
      };

      let added = 0;
      for (const [key, value] of Object.entries(scriptsToAdd)) {
        if (!packageJson.scripts[key]) {
          packageJson.scripts[key] = value;
          added++;
          console.log(chalk.green('  ✓') + ` Added script: ${key}`);
        } else {
          console.log(chalk.yellow('  ⚠') + ` Script already exists: ${key}`);
        }
      }

      if (added > 0) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(chalk.green(`\n  ✓ Updated package.json with ${added} new script(s)`));
      }
    } else {
      console.log(chalk.yellow('  ⚠') + ' No package.json found in current directory');
    }

    // Step 5: Create example brake test
    console.log(chalk.cyan(`\n[${++stepsCompleted}/${totalSteps}]`) + ' Creating example brake test...');
    const exampleTestPath = path.join(projectRoot, 'tests/brake/example.test.ts');

    if (!fs.existsSync(exampleTestPath)) {
      const exampleTest = generateExampleBrakeTest();
      fs.writeFileSync(exampleTestPath, exampleTest);
      console.log(chalk.green('  ✓') + ' Created tests/brake/example.test.ts');
    } else {
      console.log(chalk.yellow('  ⚠') + ' Example test already exists');
    }

    // Step 6: Create README
    console.log(chalk.cyan(`\n[${++stepsCompleted}/${totalSteps}]`) + ' Creating WJTTC-TESTING.md...');
    const readmePath = path.join(projectRoot, 'WJTTC-TESTING.md');

    if (!fs.existsSync(readmePath)) {
      const readme = generateTestingReadme();
      fs.writeFileSync(readmePath, readme);
      console.log(chalk.green('  ✓') + ' Created WJTTC-TESTING.md');
    } else {
      console.log(chalk.yellow('  ⚠') + ' WJTTC-TESTING.md already exists');
    }

    // Success summary
    console.log(chalk.bold.green('\n✅ WJTTC initialization complete!\n'));
    console.log(chalk.bold('Next steps:\n'));
    console.log('  1. Enable git hooks:');
    console.log(chalk.cyan('     git config core.hooksPath .githooks\n'));
    console.log('  2. Add your critical tests to ' + chalk.yellow('tests/brake/'));
    console.log('  3. Run brake tests:');
    console.log(chalk.cyan('     npm run test:brake\n'));
    console.log('  4. Read ' + chalk.yellow('WJTTC-TESTING.md') + ' for testing philosophy\n');
    console.log(chalk.dim('Learn more: https://wjttc.dev'));

  } catch (error) {
    console.error(chalk.red('\n❌ Initialization failed:'), error);
    throw error;
  }
}

function generatePreCommitHook(): string {
  return `#!/bin/bash
# WJTTC Pre-Commit Hook
# Rocket Science-Grade Testing Enforcement

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 WJTTC Pre-Commit Certification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run TypeScript type check
echo "📝 TypeScript strict mode check..."
npm run typecheck
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ TypeScript errors detected"
  echo "Fix type errors before committing"
  exit 1
fi
echo "✅ TypeScript: Zero errors"
echo ""

# Run critical "brake" tests
echo "🏆 Running critical brake tests..."
npm run test:brake
if [ $? -ne 0 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ WJTTC CERTIFICATION FAILED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Tests must pass before commit."
  echo "Fix failing tests and try again."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ WJTTC CERTIFICATION: PASSED 🏆"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Status: Rocket-ready 🚀"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0
`;
}

function generateExampleBrakeTest(): string {
  return `/**
 * WJTTC Brake Test Example
 *
 * Brake tests are CRITICAL tests that must pass before every commit.
 * They should be:
 * - Fast (< 5 seconds total)
 * - Focused (core functionality only)
 * - Reliable (no flaky tests)
 *
 * Think: "If this fails, the system is broken"
 */

describe('Brake Tests', () => {
  describe('Critical Path', () => {
    it('system initializes without errors', () => {
      // Test your core initialization
      expect(true).toBe(true);
    });

    it('core operations complete successfully', () => {
      // Test your critical operations
      expect(1 + 1).toBe(2);
    });
  });

  describe('Data Integrity', () => {
    it('data validation works', () => {
      // Test critical data validation
      const data = { id: 1, name: 'test' };
      expect(data).toBeDefined();
    });
  });
});

// Replace these examples with YOUR critical tests!
// Keep brake tests fast and focused on safety.
`;
}

function generateTestingReadme(): string {
  return `# WJTTC Testing Infrastructure

**Rocket Science-Grade Testing**

> "When brakes must work flawlessly, so must your code."

---

## Test Tiers

WJTTC uses a 3-tier testing system inspired by F1 engineering:

### 🔴 Brake Tests (Critical)
- **Purpose:** Prevent catastrophic failure
- **Speed:** Fast (< 30 seconds)
- **When:** Pre-commit hook (every commit)
- **Location:** \`tests/brake/\`

**What to test:**
- System initialization
- Core operations
- Data integrity
- Critical paths

**Example:**
\`\`\`bash
npm run test:brake
\`\`\`

### ⚙️ Engine Tests (Core Functionality)
- **Purpose:** Verify all features work
- **Speed:** Medium (1-3 minutes)
- **When:** Build process
- **Location:** \`tests/engine/\`

**What to test:**
- All inputs/outputs
- Edge cases
- Error handling
- Integration points

**Example:**
\`\`\`bash
npm run test:engine
\`\`\`

### 🏎️ Aero Tests (Performance)
- **Purpose:** Championship speed
- **Speed:** Comprehensive (3-5 minutes)
- **When:** Pre-release
- **Location:** \`tests/aero/\`

**What to test:**
- Performance benchmarks
- Load testing
- Scalability
- Optimization

**Example:**
\`\`\`bash
npm run test:aero
\`\`\`

---

## The 4-Layer Enforcement System

1. **Layer 1: TypeScript Strict** - Zero errors allowed (~5s)
2. **Layer 2: Brake Tests** - Critical paths (~20s)
3. **Layer 3: Full Test Suite** - Comprehensive (3-5 min)
4. **Layer 4: Verification** - Pre-publish check (3-5 min)

---

## Commands

\`\`\`bash
# Run all tests
npm test

# Run brake tests only (fast)
npm run test:brake

# Run engine tests
npm run test:engine

# Run aero tests (performance)
npm run test:aero

# Full WJTTC certification
npm run test:wjttc

# TypeScript check
npm run typecheck

# Full verification (all layers)
npm run verify
\`\`\`

---

## Pre-Commit Hook

The pre-commit hook runs automatically before each commit:

1. ✅ TypeScript strict mode check
2. ✅ Brake tests (critical only)

**Enable:**
\`\`\`bash
git config core.hooksPath .githooks
\`\`\`

**Bypass (emergency only):**
\`\`\`bash
git commit --no-verify -m "emergency: production down"
\`\`\`

⚠️ **Warning:** Only use \`--no-verify\` for production emergencies.

---

## Philosophy

**Test like lives depend on it. Code like it does.**

- ✅ Tests must pass before commit
- ✅ No exceptions, no shortcuts
- ✅ Fast feedback (brake tests < 30s)
- ✅ Comprehensive coverage (full suite)
- ✅ Championship-grade quality

---

## Learn More

- **WJTTC:** https://wjttc.dev
- **FAF Format:** https://faf.one
- **MCP Registry:** https://github.com/modelcontextprotocol/servers

---

*Generated by WJTTC - Championship-grade testing for the community. Forever.*
`;
}
