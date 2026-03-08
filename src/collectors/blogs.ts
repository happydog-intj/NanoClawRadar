import fetch from 'node-fetch';
import { loadSourceConfig } from '../config.js';
import type { BlogPost } from '../types.js';

export async function collectBlogData(): Promise<BlogPost[]> {
  const config = loadSourceConfig();
  const posts: BlogPost[] = [];

  for (const feed of config.blogs.feeds) {
    try {
      // For now, we'll fetch the main page and look for recent posts
      // In production, you'd use an RSS parser or specific API
      const response = await fetch(feed.url);
      const html = await response.text();

      // Basic extraction (in production, use proper HTML parser)
      // This is a placeholder - you'd implement proper RSS/Atom parsing
      console.log(`Fetched blog: ${feed.name}`);

      // Add placeholder for demonstration
      posts.push({
        title: `Latest from ${feed.name}`,
        url: feed.url,
        source: feed.name,
        date: new Date().toISOString().split('T')[0],
        summary: 'Recent updates and announcements',
      });
    } catch (error) {
      console.error(`Failed to fetch blog ${feed.name}:`, error);
    }
  }

  return posts;
}
