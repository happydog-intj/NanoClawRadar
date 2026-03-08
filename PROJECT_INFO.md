# NanoClawRadar 项目信息

## 📦 GitHub 仓库

**仓库地址**: https://github.com/happydog-intj/NanoClawRadar

**克隆地址**:
```bash
git clone https://github.com/happydog-intj/NanoClawRadar.git
```

## ✅ 已完成设置

### 1. 代码仓库
- ✅ 已创建公开仓库
- ✅ 代码已推送到 GitHub
- ✅ 所有 URL 已更新为实际链接

### 2. GitHub Actions Secrets
已配置以下 secrets：
- ✅ `ANTHROPIC_API_KEY` - Claude API 密钥
- ✅ `TELEGRAM_BOT_TOKEN` - Telegram 机器人令牌
- ✅ `TELEGRAM_CHAT_ID` - Telegram 聊天 ID
- ℹ️ `GITHUB_TOKEN` - 自动提供（无需手动设置）

### 3. 自动化工作流
- ✅ GitHub Actions workflow 已配置
- ⏰ 每天 UTC 08:00 自动运行
- 🔧 支持手动触发

## 🚀 下一步操作

### 1. 启用 GitHub Actions

访问：https://github.com/happydog-intj/NanoClawRadar/actions

点击 "I understand my workflows, go ahead and enable them" 按钮启用工作流。

### 2. 手动触发第一次运行

启用后，可以手动触发：
1. 进入 Actions 标签页
2. 选择 "Daily Digest" workflow
3. 点击 "Run workflow"
4. 选择语言（both/en/zh）
5. 点击运行

### 3. 启用 GitHub Pages（可选）

如果想要公开访问 digest：

1. 访问：https://github.com/happydog-intj/NanoClawRadar/settings/pages
2. Source: Deploy from a branch
3. Branch: 选择 `gh-pages` / `(root)`
4. Save

启用后，digest 将可以在以下地址访问：
**https://happydog-intj.github.io/NanoClawRadar**

## 📊 功能特性

### 数据采集
- **GitHub**: 追踪 NanoClaw 生态、Claude SDK、MCP 服务器等
- **Hacker News**: 监控与 AI agent 相关的热门讨论
- **Reddit**: 追踪 r/ClaudeAI、r/LocalLLaMA 等社区
- **博客**: 监控 Anthropic、Google Cloud、OpenAI 官方博客

### 智能分析
- **趋势分析**: 识别快速增长的项目
- **情感分析**: 使用 Claude Opus 4.6 分析社区情绪
- **亮点提取**: 自动识别重要更新

### 输出格式
- **Markdown**: 按月归档的 digest 文件
- **RSS Feed**: 订阅源（feed.xml）
- **GitHub Issues**: 自动创建 issue
- **Telegram**: 每日推送摘要

### 双语支持
- 🇨🇳 中文 digest
- 🇬🇧 英文 digest
- 🌏 或两者都生成

## 📁 文件结构

```
NanoClawRadar/
├── .github/workflows/
│   └── daily-digest.yml         # GitHub Actions 自动化
├── config/
│   └── sources.yml              # 数据源配置
├── src/
│   ├── collectors/              # 数据采集模块
│   │   ├── github.ts
│   │   ├── hackernews.ts
│   │   ├── reddit.ts
│   │   └── blogs.ts
│   ├── analyzers/               # 分析模块
│   │   ├── trends.ts
│   │   └── sentiment.ts
│   ├── generators/              # 生成器
│   │   ├── markdown.ts
│   │   └── rss.ts
│   └── notifiers/               # 通知模块
│       └── telegram.ts
├── digests/                     # 生成的 digest（自动创建）
├── public/                      # RSS feed（自动创建）
└── README.md                    # 项目文档
```

## 🔧 本地开发

```bash
# 进入项目目录
cd /Users/a10093140/Documents/NanoClawRadar

# 安装依赖（已完成）
pnpm install

# 创建 .env 文件
cp .env.example .env
# 编辑 .env 添加 API 密钥

# 构建项目
pnpm build

# 运行 digest 生成
pnpm digest

# 或开发模式运行
pnpm dev
```

## 📝 配置自定义

### 添加更多仓库

编辑 `config/sources.yml`:

```yaml
github:
  core:
    - owner: yourorg
      repo: yourrepo
      description: "描述"
      priority: high
```

### 修改运行时间

编辑 `.github/workflows/daily-digest.yml`:

```yaml
schedule:
  - cron: '0 8 * * *'  # UTC 时间，中国时间 = UTC + 8
```

### 调整分析阈值

编辑 `config/sources.yml`:

```yaml
analysis:
  star_growth_threshold: 50      # 每周 star 增长阈值
  new_repo_min_stars: 100        # 新项目最低 star 数
  issue_activity_threshold: 10   # 每周 issue 活跃度
```

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/happydog-intj/NanoClawRadar
- **Actions 页面**: https://github.com/happydog-intj/NanoClawRadar/actions
- **Issues**: https://github.com/happydog-intj/NanoClawRadar/issues
- **Settings**: https://github.com/happydog-intj/NanoClawRadar/settings

## 📞 支持

- **文档**: 查看 [README.md](README.md) 和 [SETUP.md](SETUP.md)
- **问题反馈**: [创建 Issue](https://github.com/happydog-intj/NanoClawRadar/issues)
- **NanoClaw 社区**: https://github.com/qwibitai/nanoclaw

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**项目状态**: ✅ 已部署，等待启用 GitHub Actions

**创建时间**: 2026-03-08

**维护者**: happydog-intj
