import fetch from 'node-fetch';
import { loadSourceConfig } from '../config.js';
import type { RedditPost } from '../types.js';

export async function collectRedditData(): Promise<RedditPost[]> {
  const config = loadSourceConfig();
  const posts: RedditPost[] = [];

  for (const subreddit of config.reddit.subreddits) {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit.name}/hot.json?limit=50`,
        {
          headers: {
            'User-Agent': 'NanoClawRadar/1.0',
          },
        }
      );

      const data = (await response.json()) as any;
      const children = data.data?.children || [];

      for (const child of children) {
        const post = child.data;
        if (post.score < config.reddit.min_upvotes) continue;

        // Check if post matches keywords
        const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
        const matchesKeyword = config.reddit.keywords.some((keyword) =>
          text.includes(keyword.toLowerCase())
        );

        if (matchesKeyword) {
          posts.push({
            id: post.id,
            title: post.title,
            subreddit: subreddit.name,
            url: `https://www.reddit.com${post.permalink}`,
            score: post.score,
            author: post.author,
            created: post.created_utc,
            numComments: post.num_comments,
            selftext: post.selftext,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to collect from r/${subreddit.name}:`, error);
    }

    // Rate limiting
    await sleep(1000);
  }

  return posts.sort((a, b) => b.score - a.score);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
