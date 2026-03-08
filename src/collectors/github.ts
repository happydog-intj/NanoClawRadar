import { Octokit } from '@octokit/rest';
import { GITHUB_TOKEN, loadSourceConfig } from '../config.js';
import type { GitHubRepo } from '../types.js';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function collectGitHubData(): Promise<GitHubRepo[]> {
  const config = loadSourceConfig();
  const repos: GitHubRepo[] = [];

  // Collect data from configured repositories
  const allRepos = [
    ...config.github.core,
    ...config.github.workspace,
    ...config.github.messaging,
    ...config.github.frameworks,
    ...config.github.mcp,
  ];

  for (const repoConfig of allRepos) {
    try {
      const { data } = await octokit.repos.get({
        owner: repoConfig.owner,
        repo: repoConfig.repo,
      });

      // Get star history (last week)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: commits } = await octokit.repos.listCommits({
        owner: repoConfig.owner,
        repo: repoConfig.repo,
        since: weekAgo.toISOString(),
        per_page: 1,
      });

      repos.push({
        owner: repoConfig.owner,
        repo: repoConfig.repo,
        description: data.description || repoConfig.description,
        priority: repoConfig.priority,
        stars: data.stargazers_count,
        issues: data.open_issues_count,
        lastUpdate: data.updated_at,
      });
    } catch (error) {
      console.error(`Failed to fetch ${repoConfig.owner}/${repoConfig.repo}:`, error);
    }
  }

  // Search for trending repositories by topics
  for (const topic of config.github.topics) {
    try {
      const { data } = await octokit.search.repos({
        q: `topic:${topic} created:>=${getLastWeek()}`,
        sort: 'stars',
        order: 'desc',
        per_page: 5,
      });

      for (const repo of data.items) {
        if (repo.stargazers_count >= config.analysis.new_repo_min_stars && repo.owner) {
          repos.push({
            owner: repo.owner.login,
            repo: repo.name,
            description: repo.description || undefined,
            priority: 'medium',
            stars: repo.stargazers_count,
            trending: true,
            lastUpdate: repo.updated_at,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to search topic ${topic}:`, error);
    }
  }

  // Execute custom searches
  for (const search of config.github.searches) {
    try {
      const { data } = await octokit.search.repos({
        q: search.query + (search.language ? ` language:${search.language}` : ''),
        sort: (search.sort as 'stars' | 'updated') || 'stars',
        order: (search.order as 'desc' | 'asc') || 'desc',
        per_page: 5,
      });

      for (const repo of data.items) {
        if (repo.owner) {
          repos.push({
            owner: repo.owner.login,
            repo: repo.name,
            description: repo.description || undefined,
            priority: 'medium',
            stars: repo.stargazers_count,
            lastUpdate: repo.updated_at,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to execute search "${search.query}":`, error);
    }
  }

  return deduplicateRepos(repos);
}

function getLastWeek(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

function deduplicateRepos(repos: GitHubRepo[]): GitHubRepo[] {
  const seen = new Set<string>();
  const unique: GitHubRepo[] = [];

  for (const repo of repos) {
    const key = `${repo.owner}/${repo.repo}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(repo);
    }
  }

  return unique;
}
