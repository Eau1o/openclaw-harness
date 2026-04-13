---
title: Multi-Agent Routing
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/multi-agent.md]
---

# Multi-Agent Routing

## 定义
多 Agent 路由允许多个隔离的 Agent（独立的 workspace + `agentDir` + 会话）以及多个 Channel 账户共存于一个运行中的 Gateway 中。入站消息通过绑定路由到 Agent。

## 核心要点
- **一个 agent = 完全封装的脑**：workspace、state 目录（`agentDir`）、session store
- **每个 agent 的认证配置文件**：每个 agent 从自己的 `auth-profiles.json` 读取；不要跨 agent 重用 `agentDir`
- **会话隔离**：每个 agent 的会话存储在 `~/.openclaw/agents/<agentId>/sessions`
- **会话召回**：`sessions_history` 返回有限的、清理过的视图（剥离 thinking tags、tool-call XML 等）
- **每个 agent 的 Skills**：从每个 workspace + 共享根加载；`agents.defaults.skills` 用于共享基线，`agents.list[].skills` 用于每个 agent 的覆盖
- **沙箱**：每个 agent 的 workspace 是默认 cwd，不是硬沙箱；通过 `agents.defaults.sandbox` 启用沙箱
- **快速映射**：Config `~/.openclaw/openclaw.json`、State `~/.openclaw`、Workspace `~/.openclaw/workspace`、Agent dir `~/.openclaw/agents/<agentId>/agent`

## 相关概念
- [[concept/agent]]
- [[concept/session]]
- [[concept/skills]]

## 关联实体
