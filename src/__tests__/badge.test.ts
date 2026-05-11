/**
 * WJTTC Badge Generator Tests
 * Testing the testing tool - F1 grade
 */

import { BadgeGenerator } from '../badge';
import { TierLevel } from '../certifier';

describe('BadgeGenerator', () => {
  describe('generate()', () => {
    it('should generate valid badge JSON for big-orange tier', () => {
      const badge = BadgeGenerator.generate({ score: 100, tier: 'big-orange' });

      expect(badge.schemaVersion).toBe(1);
      expect(badge.label).toBe('WJTTC');
      expect(badge.message).toContain('big-orange');
      expect(badge.message).toContain('100%');
      expect(badge.color).toBe('FF8C00');
    });

    it('should generate valid badge JSON for trophy tier', () => {
      const badge = BadgeGenerator.generate({ score: 100, tier: 'trophy' });

      expect(badge.message).toContain('trophy');
      expect(badge.message).toContain('100%');
      expect(badge.color).toBe('FFD700');
    });

    it('should generate valid badge JSON for silver tier', () => {
      const badge = BadgeGenerator.generate({ score: 95, tier: 'silver' });

      expect(badge.message).toContain('silver');
      expect(badge.message).toContain('95%');
      expect(badge.color).toBe('C0C0C0');
    });

    it('should generate valid badge JSON for bronze tier', () => {
      const badge = BadgeGenerator.generate({ score: 85, tier: 'bronze' });

      expect(badge.message).toContain('bronze');
      expect(badge.color).toBe('CD7F32');
    });

    it('should generate valid badge JSON for red tier', () => {
      const badge = BadgeGenerator.generate({ score: 40, tier: 'red' });

      expect(badge.message).toContain('red');
      expect(badge.color).toBe('D50000');
    });

    it('should include correct emoji for each tier', () => {
      const tiers: TierLevel[] = ['big-orange', 'trophy', 'gold', 'silver', 'bronze', 'green', 'yellow', 'red', 'white'];
      const emojis = ['🍊', '🏆', '🥇', '🥈', '🥉', '🟢', '🟡', '🔴', '🤍'];

      tiers.forEach((tier, index) => {
        const badge = BadgeGenerator.generate({ score: 100, tier });
        expect(badge.message).toContain(emojis[index]);
      });
    });
  });

  describe('generateUrl()', () => {
    it('should generate a valid shields.io URL', () => {
      const url = BadgeGenerator.generateUrl({ score: 95, tier: 'silver' });

      expect(url).toContain('https://img.shields.io/endpoint');
      expect(url).toContain('data:application/json');
    });

    it('should include encoded badge data in URL', () => {
      const url = BadgeGenerator.generateUrl({ score: 100, tier: 'big-orange' });

      expect(url).toContain('WJTTC');
      expect(url).toContain('FF8C00');
    });
  });

  describe('generateMarkdown()', () => {
    it('should generate valid markdown without repo URL', () => {
      const md = BadgeGenerator.generateMarkdown({ score: 95, tier: 'silver' });

      expect(md).toMatch(/^!\[WJTTC silver\]\(https:\/\/img\.shields\.io/);
    });

    it('should generate linked markdown with repo URL', () => {
      const md = BadgeGenerator.generateMarkdown(
        { score: 100, tier: 'big-orange' },
        'https://github.com/example/repo'
      );

      expect(md).toMatch(/^\[!\[WJTTC big-orange\]/);
      expect(md).toContain('https://github.com/example/repo');
    });
  });

  describe('generateHtml()', () => {
    it('should generate valid HTML img tag without repo URL', () => {
      const html = BadgeGenerator.generateHtml({ score: 85, tier: 'bronze' });

      expect(html).toMatch(/^<img src="https:\/\/img\.shields\.io/);
      expect(html).toContain('alt="WJTTC bronze"');
    });

    it('should generate linked HTML with repo URL', () => {
      const html = BadgeGenerator.generateHtml(
        { score: 100, tier: 'trophy' },
        'https://github.com/example/repo'
      );

      expect(html).toMatch(/^<a href="https:\/\/github\.com\/example\/repo">/);
      expect(html).toContain('<img');
      expect(html).toContain('</a>');
    });
  });
});
