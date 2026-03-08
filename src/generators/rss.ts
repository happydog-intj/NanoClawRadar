import RSS from 'rss';
import { writeFileSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { OUTPUT_DIR, PUBLIC_DIR } from '../config.js';

export function generateRSSFeed(): void {
  const feed = new RSS({
    title: 'NanoClaw Radar',
    description: 'Daily tracking of NanoClaw ecosystem and AI agent developments',
    feed_url: 'https://happydog-intj.github.io/nanoclaw-radar/feed.xml',
    site_url: 'https://happydog-intj.github.io/nanoclaw-radar',
    language: 'en',
    pubDate: new Date(),
  });

  // Read all digest files
  const digests = collectDigests();

  for (const digest of digests) {
    feed.item({
      title: `NanoClaw Radar - ${digest.date}`,
      description: digest.content.substring(0, 500) + '...',
      url: `https://happydog-intj.github.io/nanoclaw-radar/${digest.date}.html`,
      date: new Date(digest.date),
    });
  }

  // Save RSS feed
  mkdirSync(PUBLIC_DIR, { recursive: true });
  const xml = feed.xml({ indent: true });
  writeFileSync(join(PUBLIC_DIR, 'feed.xml'), xml, 'utf8');

  console.log('✅ Generated RSS feed');
}

function collectDigests(): Array<{ date: string; content: string }> {
  const digests: Array<{ date: string; content: string }> = [];

  try {
    const months = readdirSync(OUTPUT_DIR).filter((name) => /^\d{4}-\d{2}$/.test(name));

    for (const month of months) {
      const monthDir = join(OUTPUT_DIR, month);
      const files = readdirSync(monthDir).filter((name) => name.endsWith('-en.md'));

      for (const file of files) {
        const date = file.replace('-en.md', '');
        const content = readFileSync(join(monthDir, file), 'utf8');
        digests.push({ date, content });
      }
    }
  } catch (error) {
    console.error('Failed to collect digests:', error);
  }

  return digests.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
}
