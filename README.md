# NanoClaw Radar 🔭

Daily automated tracking of NanoClaw ecosystem and AI agent developments.

[![Daily Digest](https://github.com/happydog-intj/nanoclaw-radar/actions/workflows/daily-digest.yml/badge.svg)](https://github.com/happydog-intj/nanoclaw-radar/actions/workflows/daily-digest.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 What is NanoClaw Radar?

NanoClaw Radar is an automated daily digest system that tracks:

- 🤖 **NanoClaw Ecosystem** - Updates, skills, community contributions
- 💬 **Messaging Platforms** - WhatsApp, Telegram, Discord bot developments
- 🧠 **Claude Agent SDK** - New features, examples, integrations
- 🔌 **MCP Ecosystem** - New MCP servers, tools, and integrations
- 🌟 **Trending AI Agents** - Popular agent frameworks and projects
- 📰 **Community News** - Hacker News, Reddit, Twitter discussions

## ✨ Features

- 📅 **Daily Automated Reports** - Runs at 08:00 UTC via GitHub Actions
- 🌐 **Bilingual Support** - Chinese and English digests
- 🔗 **Multi-Source Tracking** - GitHub, Hacker News, Reddit, official blogs
- 📊 **Trend Analysis** - Stars growth, community activity, sentiment
- 🔔 **Multiple Outputs** - GitHub Issues, Markdown files, RSS feed, Telegram
- 🤖 **AI-Powered** - Uses Claude to summarize and analyze

## 📂 Structure

```
nanoclaw-radar/
├── .github/
│   └── workflows/
│       └── daily-digest.yml    # GitHub Actions workflow
├── digests/
│   ├── 2026-03/                # Monthly archives
│   │   ├── 2026-03-08-en.md
│   │   └── 2026-03-08-zh.md
│   └── latest.md               # Latest digest
├── src/
│   ├── collectors/             # Data collection modules
│   │   ├── github.ts
│   │   ├── hackernews.ts
│   │   ├── reddit.ts
│   │   └── blogs.ts
│   ├── analyzers/              # Analysis modules
│   │   ├── trends.ts
│   │   └── sentiment.ts
│   ├── generators/             # Report generation
│   │   ├── markdown.ts
│   │   └── issue.ts
│   ├── notifiers/              # Notification modules
│   │   ├── telegram.ts
│   │   └── rss.ts
│   └── index.ts                # Main entry point
├── config/
│   ├── sources.yml             # Data sources configuration
│   └── topics.yml              # Tracking topics
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- GitHub account (for Actions)

### Installation

```bash
# Clone the repository
git clone https://github.com/happydog-intj/nanoclaw-radar.git
cd nanoclaw-radar

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run locally
pnpm start
```

### Required API Keys

- `ANTHROPIC_API_KEY` - Claude API for analysis
- `GITHUB_TOKEN` - GitHub API access
- `TELEGRAM_BOT_TOKEN` - (Optional) For Telegram notifications
- `TELEGRAM_CHAT_ID` - (Optional) Target chat for notifications

## 📊 Tracking Categories

### 1. NanoClaw Core
- Main repository updates
- New releases and changelogs
- Issue activity and PR merges
- Community skills contributions

### 2. Messaging Platforms
- WhatsApp bot libraries
- Telegram bot frameworks
- Discord integration tools
- Multi-platform agent solutions

### 3. Claude Ecosystem
- Claude Agent SDK updates
- Official examples and docs
- Community projects using Claude
- MCP server ecosystem

### 4. AI Agent Frameworks
- LangChain developments
- AutoGPT updates
- AgentGPT progress
- Custom agent frameworks

### 5. Trending Projects
- GitHub trending (AI category)
- High-growth repositories
- Viral agent demos
- Research papers implementations

### 6. Community Discussions
- Hacker News AI submissions
- Reddit r/ClaudeAI, r/LocalLLaMA
- Twitter #AIAgents discussions
- Discord community highlights

## 📖 Example Digest

```markdown
# NanoClaw Radar - 2026-03-08

## 🌟 Highlights
- NanoClaw gains Google Workspace integration skill
- New MCP server for Gmail/Drive/Calendar access
- Claude Agent SDK 1.5.0 released with Teams support

## 🤖 NanoClaw Ecosystem
### New Skills
- **add-google-workspace** - Official Google Workspace CLI integration
  - ⭐ Supports Gmail, Drive, Calendar, Docs, Sheets
  - 🔐 Enterprise-grade security
  - 📊 4,900 GitHub stars in 3 days

### Community Activity
- 15 new issues opened
- 8 PRs merged
- 3 new contributors

## 💬 Messaging Platforms
### WhatsApp
- **baileys** v6.7.0 - Multi-device support improvements
- New voice transcription libraries

### Telegram
- **grammY** v1.21.0 - Better group management
- Bot API 7.3 support

## 🔌 MCP Ecosystem
### New Servers
- **gws-mcp** - Google Workspace MCP server (official)
- **notion-mcp** - Notion integration
- **slack-mcp** - Slack workspace access

## 📈 Trending
1. **google/workspace-cli** - 4,900⭐ (+4,500 this week)
2. **anthropics/claude-agent-sdk** - 2,100⭐ (+300)
3. **nanoclaw/nanoclaw** - 450⭐ (+50)

## 💬 Community Buzz
### Hacker News
- "Google releases official Workspace CLI" - 427 points
- "Building AI agents with Claude" - 156 points

### Reddit Highlights
- r/ClaudeAI: "NanoClaw vs AutoGPT comparison"
- r/LocalLLaMA: "Self-hosted agent frameworks"

---
Generated by NanoClaw Radar 🔭
```

## 🔧 Configuration

### sources.yml

```yaml
github:
  repositories:
    # Core projects
    - qwibitai/nanoclaw
    - anthropics/claude-agent-sdk
    - googleworkspace/cli

    # Messaging platforms
    - WhiskeySockets/Baileys
    - grammyjs/grammY
    - discord/discord.js

    # AI frameworks
    - langchain-ai/langchain
    - Significant-Gravitas/AutoGPT

  topics:
    - ai-agents
    - mcp-servers
    - claude-code
    - whatsapp-bot
    - telegram-bot

hackernews:
  keywords:
    - Claude
    - AI agents
    - MCP
    - agent framework

reddit:
  subreddits:
    - ClaudeAI
    - LocalLLaMA
    - OpenAI
    - artificial

blogs:
  - https://www.anthropic.com/news
  - https://cloud.google.com/blog/topics/developers-practitioners
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Inspired by [agents-radar](https://github.com/duanyytop/agents-radar)
- Powered by [Claude](https://claude.ai)
- Built for the [NanoClaw](https://github.com/qwibitai/nanoclaw) community

## 📮 Contact

- GitHub Issues: [Report bugs or suggest features](https://github.com/happydog-intj/nanoclaw-radar/issues)
- Telegram: [@NanoClawRadar](https://t.me/NanoClawRadar)
- Email: radar@nanoclaw.dev

---

**Note**: This is a community project, not officially affiliated with Anthropic or NanoClaw maintainers.
