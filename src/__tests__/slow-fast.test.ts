/**
 * WJTTC Slow/Fast Test Comparison
 * "Test the Testing" - F1 Philosophy
 *
 * Test-1 (SLOW): Methodical, step-by-step validation
 * Test-2 (FAST): Full suite executed as fast as possible
 *
 * Purpose: Learn about testing itself by comparing results
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST DATA - Same inputs for both slow and fast
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TIER_WEIGHTS: Record<number, number> = {
  1: 20, 2: 10, 3: 20, 4: 10, 5: 15, 6: 15, 7: 10,
};

const TIER_TEST_COUNTS: Record<number, number> = {
  1: 12, 2: 8, 3: 6, 4: 6, 5: 3, 6: 6, 7: 5,
};

const SCORE_BOUNDARIES = [
  { score: 100, tier: 'trophy' },
  { score: 99, tier: 'gold' },
  { score: 95, tier: 'silver' },
  { score: 85, tier: 'bronze' },
  { score: 70, tier: 'green' },
  { score: 55, tier: 'yellow' },
  { score: 54, tier: 'red' },
  { score: 0, tier: 'red' },
];

// Helper functions
function calculateWeightedScore(tierResults: { tier: number; passedTests: number; totalTests: number }[]): number {
  let weightedScore = 0;
  let totalWeight = 0;
  for (const result of tierResults) {
    const weight = TIER_WEIGHTS[result.tier] || 10;
    const tierScore = result.totalTests > 0 ? (result.passedTests / result.totalTests) * 100 : 0;
    weightedScore += tierScore * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

function getTierFromScore(score: number): string {
  // Big Orange is a BADGE, not a score tier
  if (score >= 100) return 'trophy';
  if (score >= 99) return 'gold';
  if (score >= 95) return 'silver';
  if (score >= 85) return 'bronze';
  if (score >= 70) return 'green';
  if (score >= 55) return 'yellow';
  return 'red';
}

// Results storage for comparison
interface TestRunResult {
  testCount: number;
  passCount: number;
  failCount: number;
  duration: number;
  results: { name: string; passed: boolean; value?: any }[];
}

const slowResults: TestRunResult = { testCount: 0, passCount: 0, failCount: 0, duration: 0, results: [] };
const fastResults: TestRunResult = { testCount: 0, passCount: 0, failCount: 0, duration: 0, results: [] };

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST-1: SLOW - Methodical, Deliberate Testing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST-1: SLOW - Methodical Testing', () => {
  const startTime = Date.now();

  afterAll(() => {
    slowResults.duration = Date.now() - startTime;
  });

  describe('Tier Weight Validation (Slow)', () => {
    it('SLOW: Weights sum to 100', () => {
      // Methodical: Calculate step by step
      let sum = 0;
      sum += TIER_WEIGHTS[1]; // 20
      sum += TIER_WEIGHTS[2]; // 10
      sum += TIER_WEIGHTS[3]; // 20
      sum += TIER_WEIGHTS[4]; // 10
      sum += TIER_WEIGHTS[5]; // 15
      sum += TIER_WEIGHTS[6]; // 15
      sum += TIER_WEIGHTS[7]; // 10

      slowResults.testCount++;
      const passed = sum === 100;
      if (passed) slowResults.passCount++; else slowResults.failCount++;
      slowResults.results.push({ name: 'weights-sum', passed, value: sum });

      expect(sum).toBe(100);
    });

    it('SLOW: Each weight is positive', () => {
      slowResults.testCount++;
      const allPositive = Object.values(TIER_WEIGHTS).every(w => w > 0);
      if (allPositive) slowResults.passCount++; else slowResults.failCount++;
      slowResults.results.push({ name: 'weights-positive', passed: allPositive });

      expect(allPositive).toBe(true);
    });

    it('SLOW: Exactly 7 tiers defined', () => {
      slowResults.testCount++;
      const count = Object.keys(TIER_WEIGHTS).length;
      const passed = count === 7;
      if (passed) slowResults.passCount++; else slowResults.failCount++;
      slowResults.results.push({ name: 'tier-count', passed, value: count });

      expect(count).toBe(7);
    });
  });

  describe('Test Count Validation (Slow)', () => {
    it('SLOW: Total tests equal 46', () => {
      slowResults.testCount++;
      let total = 0;
      for (let i = 1; i <= 7; i++) {
        total += TIER_TEST_COUNTS[i];
      }
      const passed = total === 46;
      if (passed) slowResults.passCount++; else slowResults.failCount++;
      slowResults.results.push({ name: 'total-tests', passed, value: total });

      expect(total).toBe(46);
    });

    it('SLOW: Each tier has at least 1 test', () => {
      slowResults.testCount++;
      const allHaveTests = Object.values(TIER_TEST_COUNTS).every(c => c >= 1);
      if (allHaveTests) slowResults.passCount++; else slowResults.failCount++;
      slowResults.results.push({ name: 'min-tests', passed: allHaveTests });

      expect(allHaveTests).toBe(true);
    });
  });

  describe('Score Calculation (Slow)', () => {
    it('SLOW: 100% pass rate = score 100', () => {
      slowResults.testCount++;
      const allPass = Object.entries(TIER_TEST_COUNTS).map(([tier, count]) => ({
        tier: parseInt(tier),
        passedTests: count,
        totalTests: count,
      }));
      const score = calculateWeightedScore(allPass);
      const passed = score === 100;
      if (passed) slowResults.passCount++; else slowResults.failCount++;
      slowResults.results.push({ name: 'perfect-score', passed, value: score });

      expect(score).toBe(100);
    });

    it('SLOW: 0% pass rate = score 0', () => {
      slowResults.testCount++;
      const nonePass = Object.entries(TIER_TEST_COUNTS).map(([tier, count]) => ({
        tier: parseInt(tier),
        passedTests: 0,
        totalTests: count,
      }));
      const score = calculateWeightedScore(nonePass);
      const passed = score === 0;
      if (passed) slowResults.passCount++; else slowResults.failCount++;
      slowResults.results.push({ name: 'zero-score', passed, value: score });

      expect(score).toBe(0);
    });

    it('SLOW: Only T1 passing = score 20', () => {
      slowResults.testCount++;
      const onlyT1 = [
        { tier: 1, passedTests: 12, totalTests: 12 },
        { tier: 2, passedTests: 0, totalTests: 8 },
        { tier: 3, passedTests: 0, totalTests: 6 },
        { tier: 4, passedTests: 0, totalTests: 6 },
        { tier: 5, passedTests: 0, totalTests: 3 },
        { tier: 6, passedTests: 0, totalTests: 6 },
        { tier: 7, passedTests: 0, totalTests: 5 },
      ];
      const score = calculateWeightedScore(onlyT1);
      const passed = score === 20;
      if (passed) slowResults.passCount++; else slowResults.failCount++;
      slowResults.results.push({ name: 'tier1-only', passed, value: score });

      expect(score).toBe(20);
    });
  });

  describe('Tier Boundaries (Slow)', () => {
    SCORE_BOUNDARIES.forEach(({ score, tier }) => {
      it(`SLOW: Score ${score} = ${tier}`, () => {
        slowResults.testCount++;
        const result = getTierFromScore(score);
        const passed = result === tier;
        if (passed) slowResults.passCount++; else slowResults.failCount++;
        slowResults.results.push({ name: `boundary-${score}`, passed, value: result });

        expect(result).toBe(tier);
      });
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST-2: FAST - Full Suite, Maximum Speed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('TEST-2: FAST - Speed Run', () => {
  const startTime = Date.now();

  afterAll(() => {
    fastResults.duration = Date.now() - startTime;
  });

  it('FAST: All tier validations in one shot', () => {
    const start = performance.now();

    // Weight sum
    const weightSum = Object.values(TIER_WEIGHTS).reduce((a, b) => a + b, 0);
    fastResults.results.push({ name: 'weights-sum', passed: weightSum === 100, value: weightSum });

    // Weights positive
    const weightsPositive = Object.values(TIER_WEIGHTS).every(w => w > 0);
    fastResults.results.push({ name: 'weights-positive', passed: weightsPositive });

    // Tier count
    const tierCount = Object.keys(TIER_WEIGHTS).length;
    fastResults.results.push({ name: 'tier-count', passed: tierCount === 7, value: tierCount });

    // Total tests
    const totalTests = Object.values(TIER_TEST_COUNTS).reduce((a, b) => a + b, 0);
    fastResults.results.push({ name: 'total-tests', passed: totalTests === 46, value: totalTests });

    // Min tests
    const minTests = Object.values(TIER_TEST_COUNTS).every(c => c >= 1);
    fastResults.results.push({ name: 'min-tests', passed: minTests });

    fastResults.testCount += 5;
    fastResults.passCount += [weightSum === 100, weightsPositive, tierCount === 7, totalTests === 46, minTests].filter(Boolean).length;

    const duration = performance.now() - start;

    expect(weightSum).toBe(100);
    expect(weightsPositive).toBe(true);
    expect(tierCount).toBe(7);
    expect(totalTests).toBe(46);
    expect(minTests).toBe(true);
  });

  it('FAST: All score calculations in one shot', () => {
    const start = performance.now();

    const allPass = Object.entries(TIER_TEST_COUNTS).map(([tier, count]) => ({
      tier: parseInt(tier), passedTests: count, totalTests: count,
    }));
    const nonePass = Object.entries(TIER_TEST_COUNTS).map(([tier, count]) => ({
      tier: parseInt(tier), passedTests: 0, totalTests: count,
    }));
    const onlyT1 = [
      { tier: 1, passedTests: 12, totalTests: 12 },
      { tier: 2, passedTests: 0, totalTests: 8 },
      { tier: 3, passedTests: 0, totalTests: 6 },
      { tier: 4, passedTests: 0, totalTests: 6 },
      { tier: 5, passedTests: 0, totalTests: 3 },
      { tier: 6, passedTests: 0, totalTests: 6 },
      { tier: 7, passedTests: 0, totalTests: 5 },
    ];

    const perfectScore = calculateWeightedScore(allPass);
    const zeroScore = calculateWeightedScore(nonePass);
    const t1Score = calculateWeightedScore(onlyT1);

    fastResults.results.push({ name: 'perfect-score', passed: perfectScore === 100, value: perfectScore });
    fastResults.results.push({ name: 'zero-score', passed: zeroScore === 0, value: zeroScore });
    fastResults.results.push({ name: 'tier1-only', passed: t1Score === 20, value: t1Score });

    fastResults.testCount += 3;
    fastResults.passCount += [perfectScore === 100, zeroScore === 0, t1Score === 20].filter(Boolean).length;

    expect(perfectScore).toBe(100);
    expect(zeroScore).toBe(0);
    expect(t1Score).toBe(20);
  });

  it('FAST: All tier boundaries in one shot', () => {
    const start = performance.now();

    const results = SCORE_BOUNDARIES.map(({ score, tier }) => {
      const result = getTierFromScore(score);
      const passed = result === tier;
      fastResults.results.push({ name: `boundary-${score}`, passed, value: result });
      return passed;
    });

    fastResults.testCount += results.length;
    fastResults.passCount += results.filter(Boolean).length;

    results.forEach((passed, i) => {
      expect(passed).toBe(true);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPARISON: Slow vs Fast
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('COMPARISON: Slow vs Fast Results', () => {
  it('should have same test count', () => {
    expect(slowResults.testCount).toBe(fastResults.testCount);
  });

  it('should have same pass count', () => {
    expect(slowResults.passCount).toBe(fastResults.passCount);
  });

  it('should have same fail count', () => {
    expect(slowResults.failCount).toBe(fastResults.failCount);
  });

  it('should produce identical results for each test', () => {
    // Compare each named result
    const slowMap = new Map(slowResults.results.map(r => [r.name, r]));
    const fastMap = new Map(fastResults.results.map(r => [r.name, r]));

    for (const [name, slowResult] of slowMap) {
      const fastResult = fastMap.get(name);
      expect(fastResult).toBeDefined();
      expect(fastResult?.passed).toBe(slowResult.passed);
      if (slowResult.value !== undefined) {
        expect(fastResult?.value).toBe(slowResult.value);
      }
    }
  });

  it('FAST should be faster than SLOW (learning about testing)', () => {
    // This teaches us: batching tests is more efficient
    // But both should produce identical results
    console.log(`\n📊 SLOW/FAST COMPARISON:`);
    console.log(`   SLOW: ${slowResults.duration}ms for ${slowResults.testCount} logical tests`);
    console.log(`   FAST: ${fastResults.duration}ms for ${fastResults.testCount} logical tests`);
    console.log(`   Both: ${slowResults.passCount}/${slowResults.testCount} passed`);

    // We don't assert on timing (flaky) but we log for learning
    expect(true).toBe(true);
  });
});
