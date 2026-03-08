# GitHub Actions 配置详解

## 📋 目录

1. [工作流概述](#工作流概述)
2. [触发机制](#触发机制)
3. [权限配置](#权限配置)
4. [执行步骤详解](#执行步骤详解)
5. [环境变量与密钥](#环境变量与密钥)
6. [工作原理图](#工作原理图)
7. [常见问题](#常见问题)

---

## 工作流概述

### 文件位置
```
.github/workflows/daily-digest.yml
```

### 工作流名称
```yaml
name: Daily Digest
```

这个名称会显示在 GitHub Actions 标签页中，便于识别。

### 运行环境
```yaml
runs-on: ubuntu-latest
```

使用 GitHub 提供的最新 Ubuntu Linux 虚拟机运行工作流。

---

## 触发机制

工作流支持三种触发方式：

### 1. 定时触发（Scheduled）

```yaml
on:
  schedule:
    - cron: '0 8 * * *'
```

**Cron 表达式解析**:
```
┌───────────── 分钟 (0 - 59)
│ ┌───────────── 小时 (0 - 23)
│ │ ┌───────────── 日期 (1 - 31)
│ │ │ ┌───────────── 月份 (1 - 12)
│ │ │ │ ┌───────────── 星期 (0 - 6) (周日到周六)
│ │ │ │ │
│ │ │ │ │
0 8 * * *
```

- `0 8 * * *` = 每天 UTC 08:00
- 北京时间 = UTC + 8 = 16:00
- 每天下午 4 点自动运行

**注意事项**:
- GitHub Actions 的 cron 任务可能会延迟 3-10 分钟
- 在高峰期（如整点）可能延迟更长
- 建议避开整点，如使用 `15 8 * * *`（08:15）

### 2. 手动触发（Workflow Dispatch）

```yaml
workflow_dispatch:
  inputs:
    language:
      description: 'Language for digest'
      required: false
      default: 'both'
      type: choice
      options:
        - both
        - en
        - zh
```

**功能说明**:
- 允许在 Actions 页面手动触发工作流
- 提供参数选择器，可选择生成语言
- 参数通过 `${{ github.event.inputs.language }}` 访问

**使用方法**:
1. 打开仓库的 Actions 标签页
2. 选择 "Daily Digest" 工作流
3. 点击 "Run workflow"
4. 选择语言选项
5. 点击绿色的 "Run workflow" 按钮

### 3. 推送触发（Push）

```yaml
push:
  branches: [master]
  paths:
    - '.github/workflows/daily-digest.yml'
```

**触发条件**:
- 仅在 `master` 分支有推送时
- 且修改了工作流文件本身时触发

**用途**:
- 帮助 GitHub 检测和启用新的工作流
- 方便测试工作流配置修改
- 首次运行后可以移除此触发器

---

## 权限配置

```yaml
permissions:
  contents: write
  issues: write
```

### contents: write
允许工作流：
- ✅ 读取仓库代码
- ✅ 创建和修改文件
- ✅ 提交更改
- ✅ 推送到仓库

**用于**:
- 提交生成的 digest 文件
- 更新 digests/ 目录

### issues: write
允许工作流：
- ✅ 创建 Issue
- ✅ 编辑 Issue
- ✅ 添加标签

**用于**:
- 自动创建每日 digest Issue
- 添加 `digest` 和 `automated` 标签

---

## 执行步骤详解

### Step 1: Checkout repository

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

**作用**:
- 克隆仓库代码到 GitHub Actions 运行环境
- 使用 GitHub 自动提供的 `GITHUB_TOKEN`
- 获取最新的代码和配置

**技术细节**:
- `actions/checkout@v4` 是 GitHub 官方 Action
- `v4` 是主版本号，会自动使用最新的 4.x.x 版本
- token 用于后续的 git 操作（提交、推送）

---

### Step 2: Setup pnpm

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 10
```

**作用**:
- 安装 pnpm 包管理器（版本 10）
- pnpm 比 npm 更快、更节省磁盘空间

**为什么用 pnpm**:
- 🚀 安装速度快 2-3 倍
- 💾 节省磁盘空间（使用硬链接）
- 🔒 严格的依赖管理
- ✅ 完全兼容 npm

---

### Step 3: Setup Node.js

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'
```

**作用**:
- 安装 Node.js 版本 20（LTS）
- 启用 pnpm 缓存，加速后续运行

**缓存机制**:
- GitHub Actions 会缓存 `node_modules`
- 如果 `pnpm-lock.yaml` 未变化，直接使用缓存
- 大幅缩短安装时间（从 30s 降至 5s）

---

### Step 4: Install dependencies

```yaml
- name: Install dependencies
  run: pnpm install --no-frozen-lockfile
```

**作用**:
- 安装项目所需的所有 npm 包

**参数说明**:
- `--no-frozen-lockfile`: 允许在 lockfile 不完全匹配时继续安装
- 适合 CI 环境，避免因版本差异导致失败

**安装的依赖包括**:
- `@anthropic-ai/sdk` - Claude API
- `@octokit/rest` - GitHub API
- `telegraf` - Telegram Bot
- `rss` - RSS 生成器
- 等等...

---

### Step 5: Build project

```yaml
- name: Build project
  run: pnpm build
```

**作用**:
- 编译 TypeScript 代码为 JavaScript
- 生成 `dist/` 目录

**构建过程**:
```bash
src/            →  dist/
├── index.ts    →  ├── index.js
├── types.ts    →  ├── types.js
├── config.ts   →  ├── config.js
└── ...         →  └── ...
```

**为什么需要构建**:
- TypeScript 不能直接运行
- 需要编译为 JavaScript
- 类型检查确保代码质量

---

### Step 6: Generate digest ⭐

```yaml
- name: Generate digest
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
    LANGUAGE: ${{ github.event.inputs.language || 'both' }}
  run: pnpm digest
```

**核心步骤！** 这是整个工作流的核心。

**环境变量注入**:
- 从 GitHub Secrets 读取 API keys
- 通过环境变量传递给 Node.js 进程
- 代码中通过 `process.env.ANTHROPIC_API_KEY` 访问

**执行流程**:

```
1. 数据采集阶段
   ├── GitHub API: 采集仓库信息
   ├── Hacker News: 获取热门讨论
   ├── Reddit API: 抓取社区动态
   └── RSS Feeds: 解析博客更新

2. 数据分析阶段
   ├── 趋势分析: 计算 star 增长、活跃度
   ├── 情感分析: 调用 Claude API 分析社区情绪
   └── 亮点提取: 识别重要更新

3. 内容生成阶段
   ├── Markdown 生成: 双语 digest
   ├── 文件保存: digests/YYYY-MM/YYYY-MM-DD-{en,zh}.md
   └── Telegram 推送: 发送摘要通知
```

**输出文件**:
- `digests/2026-03/2026-03-08-en.md` - 英文版
- `digests/2026-03/2026-03-08-zh.md` - 中文版
- `digests/latest.md` - 最新版本

---

### Step 7: Commit and push digest

```yaml
- name: Commit and push digest
  run: |
    git config --local user.email "github-actions[bot]@users.noreply.github.com"
    git config --local user.name "github-actions[bot]"
    git add digests/
    git diff-index --quiet HEAD || git commit -m "feat: add digest for $(date +%Y-%m-%d)"
    git push
```

**Git 操作流程**:

```bash
# 1. 配置 Git 用户信息
git config --local user.email "github-actions[bot]@..."
git config --local user.name "github-actions[bot]"

# 2. 添加生成的文件到暂存区
git add digests/

# 3. 检查是否有变化，如果有则提交
git diff-index --quiet HEAD || git commit -m "..."

# 4. 推送到远程仓库
git push
```

**技术细节**:
- `git diff-index --quiet HEAD` 检查是否有变化
- `||` 表示"如果前面的命令失败（有变化）则执行后面的命令"
- 避免在没有变化时创建空提交
- `$(date +%Y-%m-%d)` 动态生成日期

**提交示例**:
```
feat: add digest for 2026-03-08
```

---

### Step 8: Create GitHub Issue

```yaml
- name: Create GitHub Issue
  if: success()
  uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      const path = require('path');

      const today = new Date().toISOString().split('T')[0];
      const digestPath = path.join('digests', 'latest.md');

      if (!fs.existsSync(digestPath)) {
        console.log('No digest file found');
        return;
      }

      const content = fs.readFileSync(digestPath, 'utf8');

      await github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: `NanoClaw Radar - ${today}`,
        body: content,
        labels: ['digest', 'automated']
      });
```

**条件执行**:
```yaml
if: success()
```
- 仅在前面所有步骤都成功时执行
- 避免在出错时创建 Issue

**JavaScript 脚本执行**:
- 使用 `actions/github-script@v7` 运行 JavaScript
- 提供了 `github` 对象（Octokit API）
- 提供了 `context` 对象（运行上下文）

**Issue 创建**:
```javascript
github.rest.issues.create({
  owner: 'happydog-intj',           // 仓库所有者
  repo: 'NanoClawRadar',            // 仓库名
  title: 'NanoClaw Radar - 2026-03-08',  // Issue 标题
  body: '... digest 内容 ...',      // Issue 正文
  labels: ['digest', 'automated']   // 标签
})
```

**自动创建的 Issue**:
- 标题: `NanoClaw Radar - YYYY-MM-DD`
- 内容: 完整的 digest markdown
- 标签: `digest`, `automated`
- 方便订阅和归档

---

### Step 9: Generate RSS feed

```yaml
- name: Generate RSS feed
  run: pnpm run generate:rss
```

**执行的脚本**:
```json
"generate:rss": "node -e \"const { generateRSSFeed } = require('./dist/generators/rss.js'); generateRSSFeed();\""
```

**RSS 生成过程**:

```javascript
// 1. 读取所有已生成的 digest
const digests = collectDigests(); // 从 digests/YYYY-MM/*.md

// 2. 创建 RSS feed 对象
const feed = new RSS({
  title: 'NanoClaw Radar',
  description: 'Daily tracking of NanoClaw ecosystem',
  feed_url: 'https://happydog-intj.github.io/NanoClawRadar/feed.xml',
  site_url: 'https://happydog-intj.github.io/NanoClawRadar',
});

// 3. 添加每个 digest 作为 feed item
for (const digest of digests) {
  feed.item({
    title: `NanoClaw Radar - ${digest.date}`,
    description: digest.content.substring(0, 500),
    url: `https://.../${digest.date}.html`,
    date: new Date(digest.date),
  });
}

// 4. 生成 XML 并保存
const xml = feed.xml({ indent: true });
fs.writeFileSync('public/feed.xml', xml);
```

**输出**:
- `public/feed.xml` - RSS 2.0 格式的订阅源
- 包含最近 30 天的 digest

---

### Step 10: Deploy to GitHub Pages

```yaml
- name: Deploy to GitHub Pages
  if: success()
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./public
    publish_branch: gh-pages
    user_name: 'github-actions[bot]'
    user_email: 'github-actions[bot]@users.noreply.github.com'
```

**部署流程**:

```
1. 读取 ./public 目录的内容
   └── feed.xml (RSS 订阅源)

2. 切换到 gh-pages 分支

3. 替换所有文件为 ./public 的内容

4. 提交并推送到 gh-pages 分支

5. GitHub Pages 自动检测更新并重新部署
```

**GitHub Pages 配置**:
- 分支: `gh-pages`
- 目录: `/` (root)
- 访问地址: `https://happydog-intj.github.io/NanoClawRadar`

**为什么使用 peaceiris/actions-gh-pages**:
- 官方推荐的 GitHub Pages 部署 Action
- 自动处理分支切换和清理
- 支持 CNAME、自定义域名等高级功能
- 避免 git 历史污染

---

## 环境变量与密钥

### GitHub Secrets 配置

在仓库的 Settings → Secrets and variables → Actions 中配置：

| Secret 名称 | 用途 | 获取方式 |
|------------|------|---------|
| `ANTHROPIC_API_KEY` | Claude API 调用 | https://console.anthropic.com/ |
| `GITHUB_TOKEN` | GitHub API 和推送 | 自动提供，无需配置 |
| `TELEGRAM_BOT_TOKEN` | Telegram 通知 | @BotFather 创建机器人 |
| `TELEGRAM_CHAT_ID` | Telegram 聊天 ID | 发送消息后查看 updates API |

### 在工作流中使用 Secrets

```yaml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

**安全性**:
- ✅ Secrets 加密存储
- ✅ 日志中自动隐藏（显示为 `***`）
- ✅ 仅在运行时注入环境变量
- ✅ Pull Request 无法访问 Secrets（安全措施）

### 环境变量传递

```
GitHub Secrets
    ↓
GitHub Actions (env)
    ↓
Node.js Process (process.env)
    ↓
TypeScript Code
```

代码中访问:
```typescript
const apiKey = process.env.ANTHROPIC_API_KEY;
```

---

## 工作原理图

### 整体流程

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions 触发                      │
│  • 定时 (cron: 0 8 * * *)                                   │
│  • 手动 (workflow_dispatch)                                 │
│  • 推送 (push to workflow file)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Ubuntu 虚拟机启动                          │
│  • 分配计算资源 (2 core CPU, 7 GB RAM)                      │
│  • 安装基础系统工具                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   环境准备阶段                               │
│  1. Checkout 代码                                           │
│  2. 安装 pnpm 10                                            │
│  3. 安装 Node.js 20                                         │
│  4. 安装依赖 (pnpm install)                                 │
│  5. 构建项目 (TypeScript → JavaScript)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据采集阶段                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ GitHub API                                          │   │
│  │  • 获取仓库 stars, issues, PRs                      │   │
│  │  • 搜索趋势项目                                      │   │
│  │  • 追踪特定 topics                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Hacker News API                                     │   │
│  │  • 获取 top stories                                  │   │
│  │  • 关键词过滤                                        │   │
│  │  • 分数筛选 (min 50 points)                         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Reddit API                                          │   │
│  │  • 抓取 subreddit 帖子                               │   │
│  │  • 关键词匹配                                        │   │
│  │  • 热度筛选 (min 20 upvotes)                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI 分析阶段                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 趋势分析                                             │   │
│  │  • 计算 star 增长率                                  │   │
│  │  • 识别热门项目                                      │   │
│  │  • 排序和分类                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Claude API 情感分析                                  │   │
│  │  • 分析社区讨论情绪                                   │   │
│  │  • 生成摘要                                          │   │
│  │  • 打分 (-1 到 1)                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 亮点提取                                             │   │
│  │  • 识别重要更新                                      │   │
│  │  • 生成 highlights                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   内容生成阶段                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Markdown 生成器                                      │   │
│  │  • 英文 digest (2026-03-08-en.md)                    │   │
│  │  • 中文 digest (2026-03-08-zh.md)                    │   │
│  │  • 最新版本 (latest.md)                              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Telegram 通知                                        │   │
│  │  • 格式化摘要                                        │   │
│  │  • 发送到配置的 chat                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   发布阶段                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Git 提交                                             │   │
│  │  • git add digests/                                  │   │
│  │  • git commit -m "feat: add digest for YYYY-MM-DD"  │   │
│  │  • git push                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ GitHub Issue 创建                                    │   │
│  │  • 读取 latest.md                                    │   │
│  │  • 创建 Issue (title, body, labels)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ RSS Feed 生成                                        │   │
│  │  • 收集所有 digest                                   │   │
│  │  • 生成 feed.xml                                     │   │
│  │  • 保存到 public/                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ GitHub Pages 部署                                    │   │
│  │  • 推送到 gh-pages 分支                              │   │
│  │  • 自动触发 Pages 重新部署                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   工作流完成                                 │
│  • 总耗时: ~30 秒                                           │
│  • 状态: Success ✓                                          │
│  • 下次运行: 明天 08:00 UTC                                 │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

```
GitHub Secrets
    ↓
┌─────────────────┐
│  API Keys       │
│  - Anthropic    │
│  - GitHub       │
│  - Telegram     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│  Data Sources   │──────→│  Raw Data       │
│  - GitHub       │      │  - Repos        │
│  - HN           │      │  - Posts        │
│  - Reddit       │      │  - Issues       │
│  - Blogs        │      │  - PRs          │
└─────────────────┘      └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Analyzers      │
                         │  - Trends       │
                         │  - Sentiment    │
                         │  - Highlights   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Generators     │
                         │  - Markdown     │
                         │  - RSS          │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
            ┌─────────────┐ ┌─────────┐ ┌──────────┐
            │  Git Repo   │ │  Issue  │ │ Telegram │
            │  (digests/) │ │         │ │          │
            └──────┬──────┘ └─────────┘ └──────────┘
                   │
                   ▼
            ┌─────────────┐
            │ GitHub Pages│
            │  (RSS feed) │
            └─────────────┘
```

---

## 常见问题

### Q1: 工作流为什么会失败？

**常见原因**:
1. **API 限流**
   - GitHub API: 5000 次/小时（已认证）
   - 解决: 添加延迟，减少请求次数

2. **Secrets 未配置**
   - 错误: `ANTHROPIC_API_KEY is not set`
   - 解决: 在仓库设置中添加 Secret

3. **依赖安装失败**
   - 错误: `Cannot find module`
   - 解决: 清除缓存，重新运行

4. **权限不足**
   - 错误: `Permission denied`
   - 解决: 检查 workflow 的 `permissions` 配置

### Q2: 如何调试工作流？

**方法 1: 查看日志**
```bash
# 使用 gh CLI
gh run view <run-id> --log

# 只看失败的步骤
gh run view <run-id> --log-failed
```

**方法 2: 添加调试输出**
```yaml
- name: Debug
  run: |
    echo "ANTHROPIC_API_KEY is set: ${{ secrets.ANTHROPIC_API_KEY != '' }}"
    echo "Working directory: $(pwd)"
    ls -la digests/
```

**方法 3: 使用 tmate（远程调试）**
```yaml
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
```

### Q3: 如何修改运行时间？

编辑 cron 表达式:
```yaml
schedule:
  - cron: '30 14 * * *'  # 每天 14:30 UTC (北京时间 22:30)
```

常用时间:
- `0 0 * * *` - 每天 UTC 00:00 (北京 08:00)
- `0 12 * * *` - 每天 UTC 12:00 (北京 20:00)
- `0 */6 * * *` - 每 6 小时
- `0 9 * * 1-5` - 工作日 09:00

### Q4: 如何禁用某个步骤？

添加 `if: false`:
```yaml
- name: Deploy to GitHub Pages
  if: false  # 禁用此步骤
  uses: peaceiris/actions-gh-pages@v3
```

### Q5: 工作流可以并行运行吗？

**默认行为**: 可以并行

**限制并发**:
```yaml
concurrency:
  group: daily-digest
  cancel-in-progress: true  # 取消正在运行的
```

### Q6: 如何减少 API 调用次数？

**策略**:
1. 使用缓存
2. 减少监控的仓库数量
3. 增加调用间隔
4. 使用 GraphQL API（单次获取更多数据）

### Q7: GitHub Actions 有使用限制吗？

**免费套餐限制**:
- 公开仓库: 无限分钟
- 私有仓库: 2000 分钟/月
- 存储: 500 MB

**并发限制**:
- 免费账户: 20 个并发任务
- Pro: 40 个

**单个 job 限制**:
- 最长运行时间: 6 小时
- 最大日志大小: 64 KB per step

### Q8: 如何优化运行速度？

**优化技巧**:

1. **使用缓存**
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

2. **减少依赖安装时间**
```yaml
- run: pnpm install --prefer-offline
```

3. **并行执行任务**
```yaml
jobs:
  collect-github:
    runs-on: ubuntu-latest
    steps: ...

  collect-reddit:
    runs-on: ubuntu-latest
    steps: ...
```

4. **使用更快的 runner**
```yaml
runs-on: ubuntu-latest  # 或 ubuntu-22.04
```

---

## 总结

### 优势

✅ **全自动化**: 无需人工干预，每天自动运行
✅ **可靠性高**: GitHub 基础设施保证
✅ **成本为零**: 公开仓库完全免费
✅ **易于维护**: 配置即代码，版本控制
✅ **扩展性强**: 可轻松添加新的数据源和功能

### 技术栈

- **运行环境**: Ubuntu Linux (GitHub-hosted runner)
- **语言**: TypeScript/JavaScript (Node.js 20)
- **包管理**: pnpm 10
- **API 集成**: GitHub, Anthropic, Reddit, Hacker News, Telegram
- **部署**: GitHub Pages (静态站点)
- **版本控制**: Git (自动提交)

### 监控和维护

**查看运行状态**:
```bash
# 列出最近的运行
gh run list --workflow="Daily Digest" --limit 10

# 查看特定运行的详情
gh run view <run-id>

# 查看日志
gh run view <run-id> --log
```

**重新运行失败的工作流**:
```bash
gh run rerun <run-id>
```

**手动触发**:
```bash
gh workflow run "Daily Digest" -f language=both
```

---

## 相关资源

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Workflow 语法参考](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [GitHub API 文档](https://docs.github.com/en/rest)
- [Anthropic API 文档](https://docs.anthropic.com)
- [pnpm 文档](https://pnpm.io)
