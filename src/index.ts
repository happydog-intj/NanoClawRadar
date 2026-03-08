import { format } from 'date-fns';
import { collectGitHubData } from './collectors/github.js';
import { collectHackerNewsData } from './collectors/hackernews.js';
import { collectRedditData } from './collectors/reddit.js';
import { collectBlogData } from './collectors/blogs.js';
import { analyzeTrends, identifyHighlights } from './analyzers/trends.js';
import { analyzeSentiment } from './analyzers/sentiment.js';
import { generateMarkdownDigest, saveDigest } from './generators/markdown.js';
import { generateRSSFeed } from './generators/rss.js';
import { sendTelegramNotification, formatTelegramMessage } from './notifiers/telegram.js';
import { LANGUAGE } from './config.js';

async function main() {
  console.log('🔭 NanoClaw Radar - Starting daily digest generation...');

  const today = format(new Date(), 'yyyy-MM-dd');

  try {
    // Data collection
    console.log('📊 Collecting data...');
    const [repos, hnItems, redditPosts, blogPosts] = await Promise.all([
      collectGitHubData(),
      collectHackerNewsData(),
      collectRedditData(),
      collectBlogData(),
    ]);

    console.log(`  ✓ GitHub: ${repos.length} repositories`);
    console.log(`  ✓ Hacker News: ${hnItems.length} items`);
    console.log(`  ✓ Reddit: ${redditPosts.length} posts`);
    console.log(`  ✓ Blogs: ${blogPosts.length} posts`);

    // Analysis
    console.log('🧠 Analyzing trends...');
    const trends = analyzeTrends(repos);
    const highlights = identifyHighlights(repos, trends);

    console.log('💭 Analyzing sentiment...');
    const sentiment = await analyzeSentiment(hnItems, redditPosts);
    console.log(`  Sentiment: ${sentiment.overall.toFixed(2)} - ${sentiment.details}`);

    // Generate digests
    console.log('📝 Generating digests...');
    const languages = LANGUAGE === 'both' ? ['en', 'zh'] : [LANGUAGE];

    for (const lang of languages as Array<'en' | 'zh'>) {
      const markdown = generateMarkdownDigest(
        today,
        lang,
        repos,
        hnItems,
        redditPosts,
        highlights
      );

      saveDigest(markdown, today, lang);
    }

    // Generate RSS feed
    console.log('📡 Generating RSS feed...');
    generateRSSFeed();

    // Send notifications
    if (highlights.length > 0) {
      console.log('📬 Sending notifications...');
      const telegramMessage = formatTelegramMessage(highlights);
      await sendTelegramNotification(telegramMessage);
    }

    console.log('');
    console.log('✅ Digest generation complete!');
    console.log(`   Date: ${today}`);
    console.log(`   Highlights: ${highlights.length}`);
    console.log(`   Trending repos: ${trends.repos.length}`);
  } catch (error) {
    console.error('❌ Error generating digest:', error);
    process.exit(1);
  }
}

main();
