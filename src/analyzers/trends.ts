import type { GitHubRepo, TrendAnalysis } from '../types.js';
import { loadSourceConfig } from '../config.js';

export function analyzeTrends(repos: GitHubRepo[]): TrendAnalysis {
  const config = loadSourceConfig();

  // Analyze repository trends
  const repoTrends = repos
    .filter((repo) => repo.stars && repo.stars > 0)
    .map((repo) => {
      const growth = repo.starGrowth || 0;
      let trend: 'rising' | 'stable' | 'declining';

      if (growth > config.analysis.star_growth_threshold) {
        trend = 'rising';
      } else if (growth < -config.analysis.star_growth_threshold) {
        trend = 'declining';
      } else {
        trend = 'stable';
      }

      return {
        repo: `${repo.owner}/${repo.repo}`,
        stars: repo.stars || 0,
        growth,
        trend,
      };
    })
    .sort((a, b) => b.growth - a.growth);

  // Analyze topic mentions (placeholder - would need more data)
  const topics = [
    { topic: 'AI Agents', mentions: 0, sentiment: 0 },
    { topic: 'MCP', mentions: 0, sentiment: 0 },
    { topic: 'Claude', mentions: 0, sentiment: 0 },
  ];

  return {
    repos: repoTrends.slice(0, 10),
    topics,
  };
}

export function identifyHighlights(
  repos: GitHubRepo[],
  trends: TrendAnalysis
): Array<{ title: string; description: string }> {
  const highlights: Array<{ title: string; description: string }> = [];

  // Top trending repository
  if (trends.repos.length > 0) {
    const top = trends.repos[0];
    const repo = repos.find((r) => `${r.owner}/${r.repo}` === top.repo);
    if (repo) {
      highlights.push({
        title: `🚀 ${repo.repo} trending`,
        description: `${repo.description || 'Repository'} gained ${top.growth} stars this week (${top.stars}⭐ total)`,
      });
    }
  }

  // New high-star repositories
  const newRepos = repos.filter((r) => r.trending && r.stars! > 500);
  if (newRepos.length > 0) {
    highlights.push({
      title: `✨ ${newRepos.length} new notable repositories`,
      description: newRepos.map((r) => `${r.owner}/${r.repo} (${r.stars}⭐)`).join(', '),
    });
  }

  return highlights;
}
