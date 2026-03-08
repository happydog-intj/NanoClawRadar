# NanoClaw Radar Setup Guide

Complete setup guide for running NanoClaw Radar locally and on GitHub Actions.

## Prerequisites

- Node.js 18+
- pnpm 8+
- GitHub account (for Actions)
- API keys (see below)

## Local Setup

### 1. Clone and Install

```bash
cd /Users/a10093140/Documents/NanoClawRadar
pnpm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Required: Claude API for analysis and summarization
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Required: GitHub API for repository data
GITHUB_TOKEN=ghp_xxxxx

# Optional: Telegram notifications
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=your-chat-id

# Digest language: 'en', 'zh', or 'both'
LANGUAGE=both
```

### 3. API Keys

#### Anthropic API Key

1. Go to https://console.anthropic.com/
2. Create an API key
3. Copy to `.env` as `ANTHROPIC_API_KEY`

#### GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`, `read:user`
4. Copy to `.env` as `GITHUB_TOKEN`

#### Telegram Bot (Optional)

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` and follow prompts
3. Copy bot token to `.env` as `TELEGRAM_BOT_TOKEN`
4. Start a chat with your bot
5. Get chat ID by sending `/start` and checking https://api.telegram.org/bot<TOKEN>/getUpdates
6. Copy chat ID to `.env` as `TELEGRAM_CHAT_ID`

### 4. Build and Run

```bash
# Build TypeScript
pnpm build

# Run digest generation
pnpm digest

# Or run in development mode
pnpm dev
```

### 5. Check Output

Digests are saved to:
- `digests/YYYY-MM/YYYY-MM-DD-en.md` (English)
- `digests/YYYY-MM/YYYY-MM-DD-zh.md` (Chinese)
- `digests/latest.md` (Latest digest)

RSS feed: `public/feed.xml`

## GitHub Actions Setup

### 1. Fork or Create Repository

Create a new GitHub repository or fork this one.

### 2. Configure Secrets

Go to your repository Settings → Secrets and variables → Actions → New repository secret:

- `ANTHROPIC_API_KEY` - Your Claude API key
- `GITHUB_TOKEN` - Already available as built-in secret (or create new one)
- `TELEGRAM_BOT_TOKEN` - (Optional) Your Telegram bot token
- `TELEGRAM_CHAT_ID` - (Optional) Your Telegram chat ID

### 3. Enable GitHub Pages (Optional)

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `(root)`
4. Save

Your digests will be available at: `https://<username>.github.io/nanoclaw-radar`

### 4. Workflow Configuration

The workflow (`.github/workflows/daily-digest.yml`) runs:
- Daily at 08:00 UTC
- Manual trigger via "Run workflow" button

To change the schedule, edit the cron expression:

```yaml
schedule:
  - cron: '0 8 * * *'  # Run at 08:00 UTC every day
```

### 5. Manual Run

Go to Actions → Daily Digest → Run workflow

Choose language:
- `both` - Generate English and Chinese
- `en` - English only
- `zh` - Chinese only

## Configuration

### Data Sources

Edit `config/sources.yml` to customize:

- **GitHub repositories** - Which repos to track
- **Topics** - GitHub topics to monitor
- **Hacker News keywords** - Keywords to filter stories
- **Reddit subreddits** - Subreddits to monitor
- **Blog feeds** - RSS/Atom feeds to check

### Analysis Thresholds

In `config/sources.yml`:

```yaml
analysis:
  star_growth_threshold: 50      # Weekly star growth to be "trending"
  new_repo_min_stars: 100        # Minimum stars for new repos
  issue_activity_threshold: 10   # Weekly issues for "active"
```

### Output Formats

In `config/sources.yml`:

```yaml
output:
  formats:
    - markdown
    - json
    - rss

  archive_by_month: true
  create_issues: true
```

## Customization

### Add More Repositories

Edit `config/sources.yml`:

```yaml
github:
  core:
    - owner: yourorg
      repo: yourrepo
      description: "Your repo description"
      priority: high
```

### Add More Data Sources

Implement new collectors in `src/collectors/`:

```typescript
// src/collectors/custom.ts
export async function collectCustomData(): Promise<CustomData[]> {
  // Your collection logic
}
```

Then use in `src/index.ts`:

```typescript
const customData = await collectCustomData();
```

### Customize Digest Format

Edit `src/generators/markdown.ts` to change:
- Section order
- Content formatting
- Highlight selection
- Footer text

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

### API Rate Limits

**GitHub API:**
- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour
- Use `GITHUB_TOKEN` to increase limit

**Hacker News:**
- No rate limit, but be respectful
- Current implementation: ~100 requests/digest

**Reddit:**
- 60 requests/minute
- Current implementation: 1 request/second with delays

### Missing Data

Check logs for specific errors:

```bash
pnpm digest 2>&1 | tee digest.log
```

### Telegram Notifications Not Sending

1. Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set
2. Test bot manually: `curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" -d "chat_id=<CHAT_ID>&text=test"`
3. Check bot permissions in the chat

## Development

### Run Tests

```bash
pnpm test
```

### Lint Code

```bash
pnpm lint
```

### Format Code

```bash
pnpm format
```

### Add New Analyzer

Create `src/analyzers/myanalyzer.ts`:

```typescript
export function analyzeMyData(data: MyData[]): Analysis {
  // Your analysis logic
  return analysis;
}
```

## Production Deployment

### GitHub Actions (Recommended)

Already configured. Just:
1. Set up secrets
2. Enable Actions
3. Wait for daily run or trigger manually

### Self-Hosted

Run with cron:

```bash
# Add to crontab
0 8 * * * cd /path/to/nanoclaw-radar && pnpm digest >> logs/digest.log 2>&1
```

Or use systemd timer (Linux):

```ini
# /etc/systemd/system/nanoclaw-radar.timer
[Unit]
Description=NanoClaw Radar Daily Digest

[Timer]
OnCalendar=daily
OnCalendar=08:00
Persistent=true

[Install]
WantedBy=timers.target
```

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/YOUR_USERNAME/nanoclaw-radar/issues)
- NanoClaw Community: [Join discussions](https://github.com/qwibitai/nanoclaw/discussions)

## License

MIT License - see [LICENSE](LICENSE) file
