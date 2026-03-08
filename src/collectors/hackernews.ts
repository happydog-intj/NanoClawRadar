import fetch from 'node-fetch';
import { loadSourceConfig } from '../config.js';
import type { HackerNewsItem } from '../types.js';

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

export async function collectHackerNewsData(): Promise<HackerNewsItem[]> {
  const config = loadSourceConfig();
  const items: HackerNewsItem[] = [];

  try {
    // Get top stories from the last 24 hours
    const response = await fetch(`${HN_API_BASE}/topstories.json`);
    const storyIds = (await response.json()) as number[];

    // Fetch details for top 100 stories
    const topStories = storyIds.slice(0, 100);
    const stories = await Promise.all(
      topStories.map((id) => fetchStory(id))
    );

    // Filter by keywords and min score
    const yesterday = Date.now() / 1000 - 86400;
    for (const story of stories) {
      if (!story || story.time < yesterday) continue;
      if (story.score < config.hackernews.min_score) continue;

      const text = `${story.title} ${story.text || ''}`.toLowerCase();
      const matchesKeyword = config.hackernews.keywords.some((keyword) =>
        text.includes(keyword.toLowerCase())
      );

      if (matchesKeyword) {
        items.push(story);
      }
    }
  } catch (error) {
    console.error('Failed to collect Hacker News data:', error);
  }

  return items.sort((a, b) => b.score - a.score);
}

async function fetchStory(id: number): Promise<HackerNewsItem | null> {
  try {
    const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
    const data = (await response.json()) as HackerNewsItem;
    return data.type === 'story' ? data : null;
  } catch (error) {
    console.error(`Failed to fetch HN story ${id}:`, error);
    return null;
  }
}
