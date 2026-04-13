# Wiki Index

*最后更新：2026-04-13*

## Concepts（概念）

> [!info]
> 共创建 **23** 个概念页面，基于 source 页面提炼。

| 页面 | 说明 |
|------|------|
| [[concept/agent]] | Agent Runtime — OpenClaw 嵌入式 Agent 运行时 |
| [[concept/gateway]] | Gateway — OpenClaw 核心网关服务 |
| [[concept/session]] | Session Management — 会话路由与生命周期 |
| [[concept/context]] | Context — 模型上下文窗口管理 |
| [[concept/memory]] | Memory System — 基于 Markdown 的持久化记忆系统 |
| [[concept/tools]] | Tools — Agent 可调用的工具函数 |
| [[concept/skills]] | Skills — SKILL.md 指导文件 |
| [[concept/channels]] | Channels — 聊天通道集成概述 |
| [[concept/plugins]] | Plugin System — 插件架构与能力模型 |
| [[concept/model-providers]] | Model Providers — LLM 提供商集成 |
| [[concept/multi-agent]] | Multi-Agent Routing — 多 Agent 路由与隔离 |
| [[concept/session-pruning]] | Session Pruning — 会话压缩与工具结果修剪 |
| [[concept/streaming]] | Streaming — 块流与预览流 |
| [[concept/system-prompt]] | System Prompt — OpenClaw 构建的系统提示 |
| [[concept/agent-loop]] | Agent Loop — Agent 推理循环 |
| [[concept/agent-workspace]] | Agent Workspace — Agent 工作目录 |
| [[concept/active-memory]] | Active Memory — 前置记忆召回子 Agent |
| [[concept/memory-builtin]] | Builtin Memory Engine — SQLite 内置记忆引擎 |
| [[concept/memory-qmd]] | QMD Memory Engine — 本地搜索侧车 |
| [[concept/model-failover]] | Model Failover — 模型降级与认证轮换 |
| [[concept/oauth]] | OAuth Authentication — OAuth 认证支持 |
| [[concept/delegates]] | Delegates — 组织级委托 Agent |
| [[concept/retry-policy]] | Retry Policy — 重试策略与退避 |
| [[concept/llm-wiki]] | LLM Wiki — LLM 构建个人知识库的方法论 |
| [[concept/knowledge-base]] | Knowledge Base — 知识库概念与分类 |
| [[concept/control-theory]] | Control Theory — 控制理论与反馈系统 |

## Entities（实体）

> [!info]
> 共创建 **21** 个实体页面（Channel、Provider、Platform、Tool）。

### Channels（聊天通道）

| 页面 | 说明 |
|------|------|
| [[entity/discord]] | Discord Bot API 通道 |
| [[entity/telegram]] | Telegram Bot API 通道 |
| [[entity/slack]] | Slack Socket Mode 通道 |
| [[entity/whatsapp]] | WhatsApp Web (Baileys) 通道 |
| [[entity/matrix]] | Matrix 协议通道 |
| [[entity/signal]] | Signal (signal-cli) 通道 |
| [[entity/feishu]] | Feishu/Lark WebSocket 通道 |
| [[entity/msteams]] | Microsoft Teams Bot Framework 通道 |

### Providers（模型供应商）

| 页面 | 说明 |
|------|------|
| [[entity/openai]] | OpenAI API + Codex OAuth |
| [[entity/anthropic]] | Anthropic Claude API + CLI |
| [[entity/google-gemini]] | Google Gemini AI Studio |
| [[entity/deepseek]] | DeepSeek 开放 API |
| [[entity/ollama]] | Ollama 本地 LLM 运行时 |
| [[entity/minimax]] | MiniMax M2.7 及多媒体生成 |

### Platforms（平台）

| 页面 | 说明 |
|------|------|
| [[entity/macos-app]] | macOS 菜单栏伴侣应用 |
| [[entity/ios-app]] | iOS 移动伴侣应用 |
| [[entity/android-app]] | Android 节点伴侣应用 |
| [[entity/linux-app]] | Linux Gateway 运行时 |

### Tools（工具实体）

| 页面 | 说明 |
|------|------|
| [[entity/browser-tool]] | Browser — Agent 控制的隔离浏览器 |
| [[entity/exec-tool]] | Exec — Shell 命令执行工具 |
| [[entity/subagent-tool]] | Subagent — 后台子 Agent 编排工具 |
| [[entity/obsidian]] | Obsidian — 本地笔记工具，LLM Wiki 推荐 IDE |
| [[entity/qian-xuesen]] | Qian Xuesen — 中国航天之父，《工程控制论》作者 |

## Synthesis（综合）

> [!info]
> 用户探索的累积 — 有价值的分析、对比、结论可写回 wiki。

| 页面 | 说明 |
|------|------|
| [[synthesis/wiki-build-day-one]] | 本地 Wiki 知识库构建 — 首日总结 |

## Sources（来源）

| 页面 | 类型 | 说明 |
|------|------|------|
| [[source/openai-harness-engineering]] | article | OpenAI Harness Engineering — Codex 5个月零人工代码构建百万行产品 |
| [[source/articles/llm-wiki]] | article | LLM Wiki 方法论 — 构建个人 AI 知识库 |
| [[source/books/engineering-cybernetics-qianxuesen]] | book | 工程控制论 — 钱学森，系统控制理论的奠基之作 (1954) |

github-openclaw
