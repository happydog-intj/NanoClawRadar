// Type definitions for NanoClaw Radar

export interface GitHubRepo {
  owner: string;
  repo: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  stars?: number;
  starGrowth?: number;
  issues?: number;
  pullRequests?: number;
  lastUpdate?: string;
  trending?: boolean;
}

export interface HackerNewsItem {
  id: number;
  title: string;
  type: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants?: number;
  text?: string;
}

export interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  url: string;
  score: number;
  author: string;
  created: number;
  numComments: number;
  selftext?: string;
}

export interface BlogPost {
  title: string;
  url: string;
  source: string;
  date: string;
  summary?: string;
}

export interface DigestSection {
  title: string;
  items: DigestItem[];
}

export interface DigestItem {
  title: string;
  description: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface Digest {
  date: string;
  highlights: DigestItem[];
  sections: DigestSection[];
  language: 'en' | 'zh';
}

export interface SourceConfig {
  github: {
    core: GitHubRepo[];
    workspace: GitHubRepo[];
    messaging: GitHubRepo[];
    frameworks: GitHubRepo[];
    mcp: GitHubRepo[];
    topics: string[];
    searches: Array<{
      query: string;
      language?: string;
      sort?: string;
      order?: string;
    }>;
  };
  hackernews: {
    keywords: string[];
    min_score: number;
  };
  reddit: {
    subreddits: Array<{
      name: string;
      priority: string;
    }>;
    keywords: string[];
    min_upvotes: number;
  };
  blogs: {
    feeds: Array<{
      url: string;
      name: string;
      priority: string;
    }>;
  };
  analysis: {
    star_growth_threshold: number;
    new_repo_min_stars: number;
    issue_activity_threshold: number;
  };
}

export interface TrendAnalysis {
  repos: Array<{
    repo: string;
    stars: number;
    growth: number;
    trend: 'rising' | 'stable' | 'declining';
  }>;
  topics: Array<{
    topic: string;
    mentions: number;
    sentiment: number;
  }>;
}
