/**
 * WJTTC Badge Generator
 * Generates shields.io compatible badge JSON
 */

import { TierLevel } from './certifier';

interface BadgeInput {
  score: number;
  tier: TierLevel;
}

interface BadgeJSON {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
  namedLogo?: string;
  logoColor?: string;
}

// FAF-Aligned Tier Colors
const TIER_COLORS: Record<TierLevel, string> = {
  'big-orange': 'FF8C00',      // Deep Orange - The Michelin Star
  'trophy': 'FFD700',          // Gold
  'gold': 'FFD700',            // Gold
  'silver': 'C0C0C0',          // Silver
  'bronze': 'CD7F32',          // Bronze
  'green': '00C853',           // Green
  'yellow': 'FFD600',          // Yellow
  'red': 'D50000',             // Red
  'white': 'FFFFFF',           // White
};

// FAF-Aligned Tier Emojis
const TIER_EMOJIS: Record<TierLevel, string> = {
  'big-orange': '🍊',
  'trophy': '🏆',
  'gold': '🥇',
  'silver': '🥈',
  'bronze': '🥉',
  'green': '🟢',
  'yellow': '🟡',
  'red': '🔴',
  'white': '🤍',
};

export class BadgeGenerator {
  static generate(input: BadgeInput): BadgeJSON {
    const emoji = TIER_EMOJIS[input.tier];
    const color = TIER_COLORS[input.tier];

    return {
      schemaVersion: 1,
      label: 'WJTTC',
      message: `${emoji} ${input.tier} (${input.score}%)`,
      color,
    };
  }

  /**
   * Generate a shields.io URL directly
   */
  static generateUrl(input: BadgeInput): string {
    const badge = this.generate(input);
    const encoded = encodeURIComponent(JSON.stringify(badge));
    return `https://img.shields.io/endpoint?url=data:application/json,${encoded}`;
  }

  /**
   * Generate markdown badge syntax
   */
  static generateMarkdown(input: BadgeInput, repoUrl?: string): string {
    const url = this.generateUrl(input);
    const alt = `WJTTC ${input.tier}`;

    if (repoUrl) {
      return `[![${alt}](${url})](${repoUrl})`;
    }
    return `![${alt}](${url})`;
  }

  /**
   * Generate HTML badge syntax
   */
  static generateHtml(input: BadgeInput, repoUrl?: string): string {
    const url = this.generateUrl(input);
    const alt = `WJTTC ${input.tier}`;

    const img = `<img src="${url}" alt="${alt}" />`;

    if (repoUrl) {
      return `<a href="${repoUrl}">${img}</a>`;
    }
    return img;
  }
}
