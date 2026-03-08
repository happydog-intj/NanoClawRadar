import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '../config.js';
import type { HackerNewsItem, RedditPost } from '../types.js';

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

export async function analyzeSentiment(
  hnItems: HackerNewsItem[],
  redditPosts: RedditPost[]
): Promise<{ overall: number; details: string }> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, skipping sentiment analysis');
    return { overall: 0, details: 'Sentiment analysis unavailable' };
  }

  try {
    const content = formatContentForAnalysis(hnItems, redditPosts);

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Analyze the overall sentiment of these discussions about NanoClaw, AI agents, and Claude. Rate from -1 (very negative) to 1 (very positive) and provide a brief summary.

${content}

Respond with JSON: {"sentiment": <number>, "summary": "<text>"}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const result = JSON.parse(text);

    return {
      overall: result.sentiment,
      details: result.summary,
    };
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    return { overall: 0, details: 'Analysis failed' };
  }
}

function formatContentForAnalysis(
  hnItems: HackerNewsItem[],
  redditPosts: RedditPost[]
): string {
  const lines: string[] = [];

  lines.push('=== Hacker News ===');
  for (const item of hnItems.slice(0, 10)) {
    lines.push(`- ${item.title} (${item.score} points)`);
    if (item.text) {
      lines.push(`  ${item.text.slice(0, 200)}...`);
    }
  }

  lines.push('\n=== Reddit ===');
  for (const post of redditPosts.slice(0, 10)) {
    lines.push(`- r/${post.subreddit}: ${post.title} (${post.score} upvotes)`);
    if (post.selftext) {
      lines.push(`  ${post.selftext.slice(0, 200)}...`);
    }
  }

  return lines.join('\n');
}
